"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservationResource = exports.ObservationResourceError = exports.ObservationSchema = exports.ObservationComponentSchema = exports.ObservationReferenceRangeSchema = void 0;
exports.setTracer = setTracer;
exports.createObservationResource = createObservationResource;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
// ==================== Schemas (unchanged) ====================
exports.ObservationReferenceRangeSchema = zod_1.z.object({
    low: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    high: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    type: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }).optional(),
    appliesTo: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    })).optional(),
    age: zod_1.z.object({
        low: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }).optional(),
        high: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }).optional(),
    }).optional(),
    text: zod_1.z.string().optional(),
});
exports.ObservationComponentSchema = zod_1.z.object({
    code: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }),
    valueQuantity: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    valueCodeableConcept: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    valueString: zod_1.z.string().optional(),
    valueBoolean: zod_1.z.boolean().optional(),
    valueInteger: zod_1.z.number().optional(),
    valueRange: zod_1.z.object({
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
    valueRatio: zod_1.z.object({
        numerator: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
        denominator: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
    }).optional(),
    valueSampledData: zod_1.z.any().optional(),
    valueTime: zod_1.z.string().optional(),
    valueDateTime: zod_1.z.string().optional(),
    valuePeriod: zod_1.z.any().optional(),
    dataAbsentReason: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }).optional(),
    interpretation: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }).optional(),
    referenceRange: zod_1.z.array(exports.ObservationReferenceRangeSchema).optional(),
});
exports.ObservationSchema = zod_1.z.object({
    resourceType: zod_1.z.literal('Observation'),
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
    basedOn: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    partOf: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    status: zod_1.z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown']),
    category: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    code: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }),
    subject: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    focus: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    encounter: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    effectiveDateTime: zod_1.z.string().optional(),
    effectivePeriod: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string(),
    }).optional(),
    issued: zod_1.z.string().optional(),
    performer: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    valueQuantity: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    valueCodeableConcept: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    valueString: zod_1.z.string().optional(),
    valueBoolean: zod_1.z.boolean().optional(),
    valueInteger: zod_1.z.number().optional(),
    valueRange: zod_1.z.object({
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
    valueRatio: zod_1.z.object({
        numerator: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
        denominator: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.string(),
            system: zod_1.z.string().optional(),
            code: zod_1.z.string().optional(),
        }),
    }).optional(),
    valueSampledData: zod_1.z.any().optional(),
    valueTime: zod_1.z.string().optional(),
    valueDateTime: zod_1.z.string().optional(),
    valuePeriod: zod_1.z.any().optional(),
    dataAbsentReason: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }).optional(),
    interpretation: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
    }).optional(),
    note: zod_1.z.array(zod_1.z.object({
        authorString: zod_1.z.string().optional(),
        time: zod_1.z.string().optional(),
        text: zod_1.z.string(),
    })).optional(),
    bodySite: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    method: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    specimen: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    device: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    referenceRange: zod_1.z.array(exports.ObservationReferenceRangeSchema).optional(),
    hasMember: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    derivedFrom: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    component: zod_1.z.array(exports.ObservationComponentSchema).optional(),
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
class ObservationResourceError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'ObservationResourceError';
    }
}
exports.ObservationResourceError = ObservationResourceError;
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
                return { ok: false, error: new ObservationResourceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
// ==================== Observation Resource ====================
class ObservationResource {
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
    async create(observation) {
        const span = this.tracer.startSpan('observation.create');
        span.setAttribute('patient', observation.subject?.reference);
        const startTime = Date.now();
        try {
            const validated = exports.ObservationSchema.parse(observation);
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
        const span = this.tracer.startSpan('observation.read');
        span.setAttribute('observation.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.read('Observation', id), this.config.defaultTimeoutMs);
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
    async update(observation) {
        const span = this.tracer.startSpan('observation.update');
        span.setAttribute('observation.id', observation.id);
        const startTime = Date.now();
        try {
            const validated = exports.ObservationSchema.parse(observation);
            if (!validated.id) {
                throw new ObservationResourceError('MISSING_ID', 'Observation ID is required for update');
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
        const span = this.tracer.startSpan('observation.delete');
        span.setAttribute('observation.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                await this.retryWithTimeout(() => this.client.delete('Observation', id), this.config.defaultTimeoutMs);
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
        const span = this.tracer.startSpan('observation.search');
        span.setAttribute('params', JSON.stringify(params));
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.search('Observation', params), this.config.defaultTimeoutMs);
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
    async getVitalSigns(patientId, dateRange) {
        const params = {
            patient: patientId,
            category: 'vital-signs',
            status: 'final',
        };
        if (dateRange) {
            params.date = `ge${dateRange.start}&le${dateRange.end}`;
        }
        return this.search(params);
    }
    async getLabResults(patientId, dateRange) {
        const params = {
            patient: patientId,
            category: 'laboratory',
            status: 'final',
        };
        if (dateRange) {
            params.date = `ge${dateRange.start}&le${dateRange.end}`;
        }
        return this.search(params);
    }
    async getByLoincCode(patientId, loincCode) {
        return this.search({
            patient: patientId,
            code: `http://loinc.org|${loincCode}`,
            status: 'final',
        });
    }
    async createVitalSign(params) {
        const observation = {
            resourceType: 'Observation',
            status: 'final',
            category: [{
                    coding: [{
                            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                            code: 'vital-signs',
                            display: 'Vital Signs',
                        }],
                }],
            code: {
                coding: [{
                        system: 'http://loinc.org',
                        code: params.loincCode,
                    }],
            },
            subject: {
                reference: `Patient/${params.patientId}`,
            },
            effectiveDateTime: params.effectiveDateTime,
            valueQuantity: {
                value: params.value,
                unit: params.unit,
                system: 'http://unitsofmeasure.org',
            },
        };
        if (params.performerId) {
            observation.performer = [{
                    reference: `Practitioner/${params.performerId}`,
                }];
        }
        return this.create(observation);
    }
    async createBloodPressure(params) {
        const observation = {
            resourceType: 'Observation',
            status: 'final',
            category: [{
                    coding: [{
                            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                            code: 'vital-signs',
                            display: 'Vital Signs',
                        }],
                }],
            code: {
                coding: [{
                        system: 'http://loinc.org',
                        code: '85354-9',
                        display: 'Blood pressure panel with all children optional',
                    }],
                text: 'Blood pressure systolic and diastolic',
            },
            subject: {
                reference: `Patient/${params.patientId}`,
            },
            effectiveDateTime: params.effectiveDateTime,
            component: [
                {
                    code: {
                        coding: [{
                                system: 'http://loinc.org',
                                code: '8480-6',
                                display: 'Systolic blood pressure',
                            }],
                    },
                    valueQuantity: {
                        value: params.systolic,
                        unit: 'mmHg',
                        system: 'http://unitsofmeasure.org',
                    },
                },
                {
                    code: {
                        coding: [{
                                system: 'http://loinc.org',
                                code: '8462-4',
                                display: 'Diastolic blood pressure',
                            }],
                    },
                    valueQuantity: {
                        value: params.diastolic,
                        unit: 'mmHg',
                        system: 'http://unitsofmeasure.org',
                    },
                },
            ],
        };
        if (params.performerId) {
            observation.performer = [{
                    reference: `Practitioner/${params.performerId}`,
                }];
        }
        return this.create(observation);
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
            name: 'FHIR Observation Resource',
            version: '1.0.0',
            capabilities: [
                'crud_operations',
                'search',
                'vital_signs',
                'lab_results',
                'loinc_lookup',
                'blood_pressure',
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
            this.metrics.recordOperation('observation-resource', operation, durationMs, success, error);
        }
        if (this.config.enableEventLogging) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
                type: 'OBSERVATION_OPERATION',
                timestamp: new Date().toISOString(),
                source: 'observation-resource',
                operation,
                data: { durationMs, error },
                success,
            });
        }
    }
}
exports.ObservationResource = ObservationResource;
// ==================== Convenience Factory ====================
function createObservationResource(client, config) {
    return new ObservationResource(client, config);
}
//# sourceMappingURL=Observation.js.map