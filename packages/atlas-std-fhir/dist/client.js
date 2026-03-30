"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtlasFhirClient = exports.VendorNormalizer = exports.FhirClientError = exports.FhirConfigSchema = void 0;
exports.setTracer = setTracer;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const zod_1 = require("zod");
// ==================== Configuration ====================
exports.FhirConfigSchema = zod_1.z.object({
    baseUrl: zod_1.z.string().url(),
    auth: zod_1.z.object({
        token: zod_1.z.string().optional(),
        clientId: zod_1.z.string().optional(),
        clientSecret: zod_1.z.string().optional(),
        type: zod_1.z.enum(['bearer', 'basic', 'oauth']).optional(),
    }).optional(),
    timeout: zod_1.z.number().default(30000),
});
const DEFAULT_RETRY = {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 10000,
    jitterFactor: 0.2,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
};
const DEFAULT_CIRCUIT_BREAKER = {
    failureThreshold: 5,
    timeoutMs: 60000,
    halfOpenMaxCalls: 1,
};
const DEFAULT_OBSERVABILITY = {
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
};
// ==================== Custom Error ====================
class FhirClientError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'FhirClientError';
    }
}
exports.FhirClientError = FhirClientError;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.histogramBuckets = [0, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000];
    }
    recordRequest(moduleId, method, url, status, durationMs, error) {
        const key = moduleId;
        let current = this.metrics.get(key);
        if (!current) {
            current = {
                requestCount: 0,
                successCount: 0,
                failureCount: 0,
                errorCount: 0,
                methodDistribution: {},
                statusDistribution: {},
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        current.requestCount++;
        const isSuccess = status >= 200 && status < 300;
        if (isSuccess) {
            current.successCount++;
        }
        else {
            current.failureCount++;
            if (error) {
                current.errorCount++;
                current.lastError = error;
            }
        }
        current.methodDistribution[method] = (current.methodDistribution[method] || 0) + 1;
        current.statusDistribution[status] = (current.statusDistribution[status] || 0) + 1;
        const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
        const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
        current.durationHistogram[idx]++;
        this.metrics.set(key, current);
    }
    getMetrics(moduleId) {
        if (moduleId) {
            return this.metrics.get(moduleId) ?? {
                requestCount: 0,
                successCount: 0,
                failureCount: 0,
                errorCount: 0,
                methodDistribution: {},
                statusDistribution: {},
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        return this.metrics;
    }
}
class EventLogger {
    constructor() {
        this.events = [];
    }
    log(event) {
        this.events.push(event);
    }
    getEvents() {
        return [...this.events];
    }
}
class NoopTracer {
    startSpan() {
        return {
            end: () => { },
            setAttribute: () => { },
            recordException: () => { },
        };
    }
}
let globalTracer = new NoopTracer();
function setTracer(tracer) {
    globalTracer = tracer;
}
// ==================== Retry Strategy ====================
class ExponentialBackoffRetry {
    constructor(config) {
        this.config = config;
    }
    shouldRetry(attempt, error) {
        if (attempt >= this.config.maxAttempts)
            return false;
        if (error.response && this.config.retryableStatuses.includes(error.response.status))
            return true;
        if (error.code === 'ECONNABORTED' || !error.response)
            return true; // network errors
        return false;
    }
    getDelay(attempt) {
        const baseDelay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
        const cappedDelay = Math.min(baseDelay, this.config.maxDelayMs);
        const jitter = cappedDelay * this.config.jitterFactor * (Math.random() - 0.5);
        return Math.max(0, cappedDelay + jitter);
    }
}
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.states = new Map();
    }
    async call(serviceName, fn) {
        const state = this.getState(serviceName);
        if (state.state === 'OPEN') {
            const now = Date.now();
            if (now - state.lastFailureTime >= this.config.timeoutMs) {
                state.state = 'HALF_OPEN';
                state.halfOpenSuccesses = 0;
                this.states.set(serviceName, state);
            }
            else {
                return { ok: false, error: new FhirClientError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
            }
        }
        try {
            const result = await fn();
            if (state.state === 'HALF_OPEN') {
                state.halfOpenSuccesses++;
                if (state.halfOpenSuccesses >= this.config.halfOpenMaxCalls) {
                    state.state = 'CLOSED';
                    state.failures = 0;
                }
                this.states.set(serviceName, state);
            }
            return { ok: true, value: result };
        }
        catch (err) {
            state.failures++;
            state.lastFailureTime = Date.now();
            if (state.failures >= this.config.failureThreshold) {
                state.state = 'OPEN';
            }
            this.states.set(serviceName, state);
            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }
    getState(serviceName) {
        return this.states.get(serviceName) ?? {
            state: 'CLOSED',
            failures: 0,
            lastFailureTime: 0,
            halfOpenSuccesses: 0,
        };
    }
    getAllStates() {
        return new Map(Array.from(this.states.entries()).map(([k, v]) => [k, { state: v.state, failures: v.failures, lastFailureTime: v.lastFailureTime }]));
    }
}
class HealthChecker {
    constructor(circuitBreaker, client) {
        this.circuitBreaker = circuitBreaker;
        this.client = client;
    }
    async check() {
        const circuitBreakers = this.circuitBreaker.getAllStates();
        const services = new Map();
        for (const [service, state] of circuitBreakers) {
            services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
        }
        // Check server connectivity
        let serverHealthy = true;
        try {
            await this.client.get('/metadata', { timeout: 5000 });
        }
        catch (err) {
            serverHealthy = false;
        }
        services.set('fhir-server', { healthy: serverHealthy });
        const healthy = Array.from(services.values()).every(s => s.healthy);
        return { healthy, services, circuitBreakers };
    }
}
// ==================== Vendor Normalizer ====================
class VendorNormalizer {
    static normalizeEpicExtensions(resource) {
        if (resource.extension?.some((ext) => ext.url?.includes('epic.com'))) {
            const normalized = { ...resource };
            normalized.extension = resource.extension?.filter((ext) => !ext.url?.includes('epic.com'));
            return normalized;
        }
        return resource;
    }
    static normalizeCernerExtensions(resource) {
        if (resource.extension?.some((ext) => ext.url?.includes('cerner.com'))) {
            const normalized = { ...resource };
            normalized.extension = resource.extension?.filter((ext) => !ext.url?.includes('cerner.com'));
            return normalized;
        }
        return resource;
    }
    static normalize(resource) {
        let normalized = VendorNormalizer.normalizeEpicExtensions(resource);
        normalized = VendorNormalizer.normalizeCernerExtensions(normalized);
        return normalized;
    }
}
exports.VendorNormalizer = VendorNormalizer;
// ==================== Main FHIR Client ====================
class AtlasFhirClient {
    constructor(config, retryConfig = {}, circuitBreakerConfig = {}, observability = {}) {
        this.config = exports.FhirConfigSchema.parse(config);
        this.observability = { ...DEFAULT_OBSERVABILITY, ...observability };
        const retryFull = { ...DEFAULT_RETRY, ...retryConfig };
        const cbFull = { ...DEFAULT_CIRCUIT_BREAKER, ...circuitBreakerConfig };
        this.retryStrategy = new ExponentialBackoffRetry(retryFull);
        this.circuitBreaker = new CircuitBreaker(cbFull);
        this.metrics = new MetricsCollector();
        this.logger = new EventLogger();
        this.tracer = globalTracer;
        this.client = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/fhir+json',
                'Accept': 'application/fhir+json',
                ...(this.config.auth?.token && { Authorization: `Bearer ${this.config.auth.token}` }),
            },
        });
        this.healthChecker = new HealthChecker(this.circuitBreaker, this.client);
        // Setup interceptors
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor to start trace span
        this.client.interceptors.request.use(async (config) => {
            if (this.observability.enableTracing) {
                const span = this.tracer.startSpan(`http ${config.method?.toUpperCase()} ${config.url}`);
                config.__span = span;
                span.setAttribute('http.method', config.method || '');
                span.setAttribute('http.url', config.url || '');
            }
            return config;
        });
        // Response interceptor for metrics, logging, and error handling with retry
        this.client.interceptors.response.use(async (response) => {
            await this.recordResponse(response.config, response.status, response.data);
            return response;
        }, async (error) => {
            const config = error.config;
            const status = error.response?.status || 0;
            const duration = config.__startTime ? Date.now() - config.__startTime : 0;
            await this.recordResponse(config, status, null, error.message);
            // Retry logic
            if (this.retryStrategy.shouldRetry(config.__retryCount || 0, error)) {
                config.__retryCount = (config.__retryCount || 0) + 1;
                const delay = this.retryStrategy.getDelay(config.__retryCount);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.client(config);
            }
            throw error;
        });
    }
    async recordResponse(config, status, data, errorMsg) {
        const duration = config.__startTime ? Date.now() - config.__startTime : 0;
        const method = config.method?.toUpperCase() || 'UNKNOWN';
        const url = config.url || '';
        if (this.observability.enableMetrics) {
            this.metrics.recordRequest('fhir-client', method, url, status, duration, errorMsg);
        }
        if (this.observability.enableEventLogging) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
                type: 'FHIR_REQUEST',
                timestamp: new Date().toISOString(),
                source: 'fhir-client',
                method,
                url,
                status,
                durationMs: duration,
                error: errorMsg,
            });
        }
        if (this.observability.enableTracing && config.__span) {
            const span = config.__span;
            span.setAttribute('http.status_code', status);
            if (errorMsg)
                span.recordException(new Error(errorMsg));
            span.end();
        }
    }
    normalizeResource(resource) {
        return VendorNormalizer.normalize(resource);
    }
    // ==================== Public CRUD Operations (with circuit breaker) ====================
    async read(resourceType, id) {
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: `/${resourceType}/${id}`,
                method: 'GET',
                __startTime: Date.now(),
            };
            const response = await this.client(config);
            return response.data;
        });
        if (!result.ok)
            throw result.error;
        return this.normalizeResource(result.value);
    }
    async create(resource) {
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: `/${resource.resourceType}`,
                method: 'POST',
                data: resource,
                __startTime: Date.now(),
            };
            const response = await this.client(config);
            return response.data;
        });
        if (!result.ok)
            throw result.error;
        return this.normalizeResource(result.value);
    }
    async update(resource) {
        if (!resource.id)
            throw new FhirClientError('MISSING_ID', 'Resource ID required for update');
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: `/${resource.resourceType}/${resource.id}`,
                method: 'PUT',
                data: resource,
                __startTime: Date.now(),
            };
            const response = await this.client(config);
            return response.data;
        });
        if (!result.ok)
            throw result.error;
        return this.normalizeResource(result.value);
    }
    async delete(resourceType, id) {
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: `/${resourceType}/${id}`,
                method: 'DELETE',
                __startTime: Date.now(),
            };
            await this.client(config);
        });
        if (!result.ok)
            throw result.error;
    }
    async search(resourceType, params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => searchParams.append(key, String(v)));
            }
            else if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: `/${resourceType}?${searchParams.toString()}`,
                method: 'GET',
                __startTime: Date.now(),
            };
            const response = await this.client(config);
            return response.data;
        });
        if (!result.ok)
            throw result.error;
        return this.normalizeResource(result.value);
    }
    async transaction(bundle) {
        if (bundle.type !== 'transaction') {
            throw new FhirClientError('INVALID_BUNDLE', 'Bundle must be of type transaction');
        }
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: '/',
                method: 'POST',
                data: bundle,
                __startTime: Date.now(),
            };
            const response = await this.client(config);
            return response.data;
        });
        if (!result.ok)
            throw result.error;
        return this.normalizeResource(result.value);
    }
    async batch(bundle) {
        if (bundle.type !== 'batch') {
            throw new FhirClientError('INVALID_BUNDLE', 'Bundle must be of type batch');
        }
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: '/',
                method: 'POST',
                data: bundle,
                __startTime: Date.now(),
            };
            const response = await this.client(config);
            return response.data;
        });
        if (!result.ok)
            throw result.error;
        return this.normalizeResource(result.value);
    }
    async capabilities() {
        const result = await this.circuitBreaker.call('fhir-server', async () => {
            const config = {
                url: '/metadata',
                method: 'GET',
                __startTime: Date.now(),
            };
            const response = await this.client(config);
            return response.data;
        });
        if (!result.ok)
            throw result.error;
        return this.normalizeResource(result.value);
    }
    // ==================== Observability ====================
    getMetrics(moduleId) {
        return this.metrics.getMetrics(moduleId);
    }
    getEvents() {
        return this.logger.getEvents();
    }
    async getHealth() {
        return this.healthChecker.check();
    }
    getInfo() {
        return {
            name: 'ATLAS FHIR Client',
            version: '1.0.0',
            capabilities: [
                'crud_operations',
                'search',
                'transaction',
                'batch',
                'circuit_breaker',
                'retry_with_backoff',
                'observability',
                'vendor_normalization',
            ],
        };
    }
}
exports.AtlasFhirClient = AtlasFhirClient;
//# sourceMappingURL=client.js.map