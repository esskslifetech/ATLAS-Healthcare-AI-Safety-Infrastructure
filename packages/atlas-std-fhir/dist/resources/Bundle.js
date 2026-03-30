"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleResource = exports.BundleResourceError = void 0;
exports.setTracer = setTracer;
exports.createBundleResource = createBundleResource;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const defaultConfig = {
    defaultTimeoutMs: 30000,
    retry: {
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        jitterFactor: 0.2,
    },
    circuitBreaker: {
        failureThreshold: 5,
        timeoutMs: 60000,
        halfOpenMaxCalls: 1,
    },
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
};
// ==================== Custom Error ====================
class BundleResourceError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'BundleResourceError';
    }
}
exports.BundleResourceError = BundleResourceError;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.histogramBuckets = [0, 100, 500, 1000, 5000, 10000, 30000];
    }
    recordOperation(moduleId, operation, durationMs, success, error) {
        const key = moduleId;
        let current = this.metrics.get(key);
        if (!current) {
            current = {
                operationCount: 0,
                successCount: 0,
                failureCount: 0,
                errorCount: 0,
                operationDistribution: {},
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        current.operationCount++;
        if (success) {
            current.successCount++;
        }
        else {
            current.failureCount++;
            if (error) {
                current.errorCount++;
                current.lastError = error;
            }
        }
        current.operationDistribution[operation] = (current.operationDistribution[operation] || 0) + 1;
        const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
        const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
        current.durationHistogram[idx]++;
        this.metrics.set(key, current);
    }
    getMetrics(moduleId) {
        if (moduleId) {
            return this.metrics.get(moduleId) ?? {
                operationCount: 0,
                successCount: 0,
                failureCount: 0,
                errorCount: 0,
                operationDistribution: {},
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
class ExponentialBackoffRetry {
    constructor(config, isRetryable = () => true) {
        this.config = config;
        this.isRetryable = isRetryable;
    }
    shouldRetry(attempt, error) {
        return attempt < this.config.maxAttempts && this.isRetryable(error);
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
                return { ok: false, error: new BundleResourceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
        // Also check client connectivity
        let clientHealthy = true;
        try {
            await this.client.capabilities();
        }
        catch (err) {
            clientHealthy = false;
        }
        services.set('fhir-server', { healthy: clientHealthy });
        const healthy = Array.from(services.values()).every(s => s.healthy);
        return { healthy, services, circuitBreakers };
    }
}
// ==================== Bundle Resource ====================
class BundleResource {
    constructor(client, config = {}) {
        this.client = client;
        this.config = { ...defaultConfig, ...config };
        this.metrics = new MetricsCollector();
        this.logger = new EventLogger();
        this.tracer = globalTracer;
        this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
        this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
        this.healthChecker = new HealthChecker(this.circuitBreaker, this.client);
    }
    // ==================== CRUD Operations ====================
    async create(bundle) {
        const span = this.tracer.startSpan('bundle.create');
        span.setAttribute('bundle.type', bundle.type);
        const startTime = Date.now();
        try {
            const validated = zod_1.z.any().parse(bundle);
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.create(validated), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('create', duration, true);
            span.end();
            return { ok: true, value: result.value };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('create', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async read(id) {
        const span = this.tracer.startSpan('bundle.read');
        span.setAttribute('bundle.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.read('Bundle', id), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('read', duration, true);
            span.end();
            return { ok: true, value: result.value };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('read', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async update(bundle) {
        const span = this.tracer.startSpan('bundle.update');
        span.setAttribute('bundle.id', bundle.id);
        const startTime = Date.now();
        try {
            const validated = zod_1.z.any().parse(bundle);
            if (!validated.id) {
                throw new BundleResourceError('MISSING_ID', 'Bundle ID is required for update');
            }
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.update(validated), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('update', duration, true);
            span.end();
            return { ok: true, value: result.value };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('update', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async delete(id) {
        const span = this.tracer.startSpan('bundle.delete');
        span.setAttribute('bundle.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                await this.retryWithTimeout(() => this.client.delete('Bundle', id), this.config.defaultTimeoutMs);
                return true;
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('delete', duration, true);
            span.end();
            return { ok: true, value: undefined };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('delete', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    // ==================== Bundle Operations ====================
    async createTransaction(entries) {
        const span = this.tracer.startSpan('bundle.createTransaction');
        const startTime = Date.now();
        try {
            const bundle = {
                resourceType: 'Bundle',
                type: 'transaction',
                entry: entries.map((entry, index) => ({
                    fullUrl: `urn:uuid:${this.generateUUID()}`,
                    request: {
                        method: entry.method,
                        url: entry.url,
                        ...(entry.ifMatch && { ifMatch: entry.ifMatch }),
                        ...(entry.ifNoneExist && { ifNoneExist: entry.ifNoneExist }),
                    },
                    ...(entry.resource && { resource: entry.resource }),
                })),
            };
            const result = await this.create(bundle);
            const duration = Date.now() - startTime;
            this.recordMetrics('createTransaction', duration, result.ok);
            span.end();
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('createTransaction', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async createBatch(entries) {
        const span = this.tracer.startSpan('bundle.createBatch');
        const startTime = Date.now();
        try {
            const bundle = {
                resourceType: 'Bundle',
                type: 'batch',
                entry: entries.map((entry, index) => ({
                    fullUrl: `urn:uuid:${this.generateUUID()}`,
                    request: {
                        method: entry.method,
                        url: entry.url,
                        ...(entry.ifMatch && { ifMatch: entry.ifMatch }),
                        ...(entry.ifNoneExist && { ifNoneExist: entry.ifNoneExist }),
                    },
                    ...(entry.resource && { resource: entry.resource }),
                })),
            };
            const result = await this.create(bundle);
            const duration = Date.now() - startTime;
            this.recordMetrics('createBatch', duration, result.ok);
            span.end();
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('createBatch', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async createDocument(params) {
        const span = this.tracer.startSpan('bundle.createDocument');
        const startTime = Date.now();
        try {
            const timestamp = params.timestamp || new Date().toISOString();
            const composition = {
                resourceType: 'Composition',
                status: 'final',
                type: {
                    coding: [{
                            system: 'http://loinc.org',
                            code: '34133-9',
                            display: 'Summary of episode note',
                        }],
                    text: params.title,
                },
                subject: {
                    reference: `Patient/${params.patientId}`,
                },
                date: timestamp,
                author: [{
                        reference: `Practitioner/${params.authorId}`,
                    }],
                title: params.title,
                section: params.sections.map((section, index) => ({
                    title: section.title,
                    code: {
                        coding: [section.code],
                    },
                    entry: section.entries.map(entry => ({
                        reference: `${entry.resourceType}/${entry.id}`,
                    })),
                })),
            };
            const bundle = {
                resourceType: 'Bundle',
                type: 'document',
                timestamp,
                identifier: {
                    system: 'urn:ietf:rfc:3986',
                    value: `urn:uuid:${this.generateUUID()}`,
                },
                entry: [
                    {
                        fullUrl: `urn:uuid:${this.generateUUID()}`,
                        resource: composition,
                    },
                    ...params.sections.flatMap(section => section.entries.map(entry => ({
                        fullUrl: `urn:uuid:${entry.id}`,
                        resource: entry,
                    }))),
                ],
            };
            const result = await this.create(bundle);
            const duration = Date.now() - startTime;
            this.recordMetrics('createDocument', duration, result.ok);
            span.end();
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('createDocument', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async createSearchset(resources, total) {
        const span = this.tracer.startSpan('bundle.createSearchset');
        const startTime = Date.now();
        try {
            const bundle = {
                resourceType: 'Bundle',
                type: 'searchset',
                total: total || resources.length,
                entry: resources.map(resource => ({
                    fullUrl: `${resource.resourceType}/${resource.id}`,
                    resource,
                    search: {
                        mode: 'match',
                    },
                })),
            };
            const result = await this.create(bundle);
            const duration = Date.now() - startTime;
            this.recordMetrics('createSearchset', duration, result.ok);
            span.end();
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('createSearchset', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    // ==================== Helper Methods ====================
    extractResources(bundle, resourceType) {
        if (!bundle.entry)
            return [];
        return bundle.entry
            .map((entry) => entry.resource)
            .filter((resource) => resource?.resourceType === resourceType);
    }
    extractFirstResource(bundle, resourceType) {
        const resources = this.extractResources(bundle, resourceType);
        return resources[0];
    }
    getPaginationInfo(bundle) {
        const links = {};
        if (bundle.link) {
            bundle.link.forEach((link) => {
                links[link.relation] = link.url;
            });
        }
        return {
            total: bundle.total,
            links,
        };
    }
    validateBundle(bundle) {
        const errors = [];
        try {
            zod_1.z.any().parse(bundle);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
            }
        }
        // Additional validation
        if (bundle.type === 'transaction' && bundle.entry) {
            bundle.entry.forEach((entry, index) => {
                if (!entry.request) {
                    errors.push(`Entry ${index}: Transaction bundle entries must have a request`);
                }
                if (!entry.request?.url) {
                    errors.push(`Entry ${index}: Transaction bundle entries must have a request URL`);
                }
            });
        }
        return {
            valid: errors.length === 0,
            errors,
        };
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
            name: 'FHIR Bundle Resource',
            version: '1.0.0',
            capabilities: [
                'bundle_operations',
                'transaction_bundles',
                'batch_bundles',
                'document_bundles',
                'searchset_bundles',
                'validation',
                'resource_extraction',
                'pagination',
                'circuit_breaker',
                'observability',
            ],
        };
    }
    // ==================== Private Helpers ====================
    async retryWithTimeout(fn, timeoutMs) {
        return new Promise(async (resolve, reject) => {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
            let attempt = 0;
            const executeWithRetry = async () => {
                while (attempt < this.config.retry.maxAttempts) {
                    try {
                        const result = await fn();
                        clearTimeout(timeoutId);
                        resolve(result);
                        return;
                    }
                    catch (err) {
                        attempt++;
                        if (!this.retryStrategy.shouldRetry(attempt, err)) {
                            clearTimeout(timeoutId);
                            reject(err);
                            return;
                        }
                        const delay = this.retryStrategy.getDelay(attempt);
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
                clearTimeout(timeoutId);
                reject(new Error('Max retries exceeded'));
            };
            executeWithRetry();
        });
    }
    recordMetrics(operation, durationMs, success, error) {
        if (this.config.enableMetrics) {
            this.metrics.recordOperation('bundle-resource', operation, durationMs, success, error);
        }
        if (this.config.enableEventLogging) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
                type: 'BUNDLE_OPERATION',
                timestamp: new Date().toISOString(),
                source: 'bundle-resource',
                operation,
                data: { durationMs, error },
                success,
            });
        }
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
exports.BundleResource = BundleResource;
// ==================== Convenience Functions ====================
function createBundleResource(client, config) {
    return new BundleResource(client, config);
}
//# sourceMappingURL=Bundle.js.map