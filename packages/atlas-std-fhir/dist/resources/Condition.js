"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionResource = exports.ConditionResourceError = exports.ConditionSchema = exports.ConditionEvidenceSchema = void 0;
exports.setTracer = setTracer;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
// ==================== Schemas (unchanged) ====================
exports.ConditionEvidenceSchema = zod_1.z.object({
    code: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    detail: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
});
exports.ConditionSchema = zod_1.z.object({
    resourceType: zod_1.z.literal('Condition'),
    id: zod_1.z.string().optional(),
    identifier: zod_1.z.array(zod_1.z.object({
        use: zod_1.z.enum(['usual', 'official', 'temp', 'secondary', 'old']).optional(),
        type: zod_1.z.object({
            coding: zod_1.z.array(zod_1.z.object({
                system: zod_1.z.string(),
                code: zod_1.z.string(),
                display: zod_1.z.string().optional(),
            })),
        }).optional(),
        system: zod_1.z.string().optional(),
        value: zod_1.z.string(),
        period: zod_1.z.object({
            start: zod_1.z.string().optional(),
            end: zod_1.z.string().optional(),
        }).optional(),
    })).optional(),
    clinicalStatus: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }),
    verificationStatus: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }),
    category: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    severity: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }).optional(),
    code: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }),
    bodySite: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    subject: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    encounter: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    onsetDateTime: zod_1.z.string().optional(),
    onsetAge: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    onsetPeriod: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string().optional(),
    }).optional(),
    onsetRange: zod_1.z.object({
        low: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
        high: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
    }).optional(),
    abatementDateTime: zod_1.z.string().optional(),
    abatementAge: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    abatementPeriod: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string().optional(),
    }).optional(),
    abatementRange: zod_1.z.object({
        low: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
        high: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
    }).optional(),
    abatementString: zod_1.z.string().optional(),
    recordedDate: zod_1.z.string().optional(),
    recorder: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    asserter: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    note: zod_1.z.array(zod_1.z.object({
        authorString: zod_1.z.string().optional(),
        time: zod_1.z.string().optional(),
        text: zod_1.z.string(),
    })).optional(),
    evidence: zod_1.z.array(exports.ConditionEvidenceSchema).optional(),
});
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
class ConditionResourceError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'ConditionResourceError';
    }
}
exports.ConditionResourceError = ConditionResourceError;
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
                return { ok: false, error: new ConditionResourceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
// ==================== Condition Resource ====================
class ConditionResource {
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
    async create(condition) {
        const span = this.tracer.startSpan('condition.create');
        span.setAttribute('patient', condition.subject?.reference);
        const startTime = Date.now();
        try {
            const validated = exports.ConditionSchema.parse(condition);
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.create(validated), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('create', duration, true);
            span.end();
            return result.value;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('create', duration, false, error.message);
            span.recordException(error);
            span.end();
            throw error;
        }
    }
    async read(id) {
        const span = this.tracer.startSpan('condition.read');
        span.setAttribute('condition.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.read('Condition', id), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('read', duration, true);
            span.end();
            return result.value;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('read', duration, false, error.message);
            span.recordException(error);
            span.end();
            throw error;
        }
    }
    async update(condition) {
        const span = this.tracer.startSpan('condition.update');
        span.setAttribute('condition.id', condition.id);
        const startTime = Date.now();
        try {
            const validated = exports.ConditionSchema.parse(condition);
            if (!validated.id) {
                throw new ConditionResourceError('MISSING_ID', 'Condition ID is required for update');
            }
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.update(validated), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('update', duration, true);
            span.end();
            return result.value;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('update', duration, false, error.message);
            span.recordException(error);
            span.end();
            throw error;
        }
    }
    async delete(id) {
        const span = this.tracer.startSpan('condition.delete');
        span.setAttribute('condition.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                await this.retryWithTimeout(() => this.client.delete('Condition', id), this.config.defaultTimeoutMs);
                return true;
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('delete', duration, true);
            span.end();
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('delete', duration, false, error.message);
            span.recordException(error);
            span.end();
            throw error;
        }
    }
    // ==================== Search ====================
    async search(params) {
        const span = this.tracer.startSpan('condition.search');
        span.setAttribute('params', JSON.stringify(params));
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.search('Condition', params), this.config.defaultTimeoutMs);
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('search', duration, true);
            span.end();
            return result.value;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('search', duration, false, error.message);
            span.recordException(error);
            span.end();
            throw error;
        }
    }
    // ==================== Convenience Methods ====================
    async getActiveConditions(patientId) {
        return this.search({
            patient: patientId,
            clinical_status: 'active',
        });
    }
    async getByIcd10Code(patientId, icd10Code) {
        return this.search({
            patient: patientId,
            code: `http://hl7.org/fhir/sid/icd-10|${icd10Code}`,
        });
    }
    async getProblemList(patientId) {
        return this.search({
            patient: patientId,
            category: 'problem-list-item',
            clinical_status: 'active',
        });
    }
    async getHealthConcerns(patientId) {
        return this.search({
            patient: patientId,
            category: 'health-concern',
            clinical_status: 'active',
        });
    }
    async createCondition(params) {
        const condition = {
            resourceType: 'Condition',
            clinicalStatus: {
                coding: [{
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: params.clinicalStatus,
                    }],
            },
            verificationStatus: {
                coding: [{
                        system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                        code: params.verificationStatus,
                    }],
            },
            category: params.category ? [{
                    coding: [{
                            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                            code: params.category,
                        }],
                }] : [{
                    coding: [{
                            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                            code: 'encounter-diagnosis',
                        }],
                }],
            code: {
                coding: [params.code],
            },
            subject: {
                reference: `Patient/${params.patientId}`,
            },
        };
        if (params.severity) {
            condition.severity = {
                coding: [params.severity],
            };
        }
        if (params.onsetDateTime) {
            condition.onsetDateTime = params.onsetDateTime;
        }
        if (params.recorderId) {
            condition.recorder = {
                reference: `Practitioner/${params.recorderId}`,
            };
        }
        if (params.note) {
            condition.note = [{
                    text: params.note,
                }];
        }
        return this.create(condition);
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
            name: 'FHIR Condition Resource',
            version: '1.0.0',
            capabilities: [
                'crud_operations',
                'search',
                'active_conditions',
                'icd10_lookup',
                'problem_list',
                'health_concerns',
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
            this.metrics.recordOperation('condition-resource', operation, durationMs, success, error);
        }
        if (this.config.enableEventLogging) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
                type: 'CONDITION_OPERATION',
                timestamp: new Date().toISOString(),
                source: 'condition-resource',
                operation,
                data: { durationMs, error },
                success,
            });
        }
    }
}
exports.ConditionResource = ConditionResource;
//# sourceMappingURL=Condition.js.map