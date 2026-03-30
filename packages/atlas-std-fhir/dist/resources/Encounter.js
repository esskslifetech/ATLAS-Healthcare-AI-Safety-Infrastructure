"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncounterResource = exports.EncounterResourceError = exports.EncounterSchema = exports.EncounterLocationSchema = exports.EncounterHospitalizationSchema = exports.EncounterClassHistorySchema = exports.EncounterStatusHistorySchema = void 0;
exports.setTracer = setTracer;
exports.createEncounterResource = createEncounterResource;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
// ==================== Schemas (unchanged) ====================
exports.EncounterStatusHistorySchema = zod_1.z.object({
    status: zod_1.z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']),
    period: zod_1.z.object({
        start: zod_1.z.string().optional(),
        end: zod_1.z.string().optional(),
    }),
});
exports.EncounterClassHistorySchema = zod_1.z.object({
    class: zod_1.z.object({
        system: zod_1.z.string(),
        code: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }),
    period: zod_1.z.object({
        start: zod_1.z.string().optional(),
        end: zod_1.z.string().optional(),
    }),
});
exports.EncounterHospitalizationSchema = zod_1.z.object({
    preAdmissionIdentifier: zod_1.z.object({
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
    }).optional(),
    origin: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    admitSource: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    reAdmission: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    dietPreference: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    specialCourtesy: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    specialArrangement: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    destination: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    dischargeDisposition: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
});
exports.EncounterLocationSchema = zod_1.z.object({
    location: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }),
    status: zod_1.z.enum(['active', 'reserved', 'completed', 'planned']),
    physicalType: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    period: zod_1.z.object({
        start: zod_1.z.string().optional(),
        end: zod_1.z.string().optional(),
    }).optional(),
});
exports.EncounterSchema = zod_1.z.object({
    resourceType: zod_1.z.literal('Encounter'),
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
    status: zod_1.z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']),
    statusReason: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    class: zod_1.z.object({
        system: zod_1.z.string(),
        code: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }),
    classHistory: zod_1.z.array(exports.EncounterClassHistorySchema).optional(),
    type: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    serviceType: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    priority: zod_1.z.number().optional(),
    subject: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    episodeOfCare: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    basedOn: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    participant: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.array(zod_1.z.object({
            coding: zod_1.z.array(zod_1.z.object({
                system: zod_1.z.string(),
                code: zod_1.z.string(),
                display: zod_1.z.string().optional(),
            })),
            text: zod_1.z.string().optional(),
        })),
        period: zod_1.z.object({
            start: zod_1.z.string().optional(),
            end: zod_1.z.string().optional(),
        }).optional(),
        individual: zod_1.z.object({
            reference: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        }),
    })).optional(),
    appointment: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    period: zod_1.z.object({
        start: zod_1.z.string().optional(),
        end: zod_1.z.string().optional(),
    }).optional(),
    length: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    reasonCode: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    reasonReference: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    diagnosis: zod_1.z.array(zod_1.z.object({
        condition: zod_1.z.object({
            reference: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        }),
        use: zod_1.z.object({
            coding: zod_1.z.array(zod_1.z.object({
                system: zod_1.z.string(),
                code: zod_1.z.string(),
                display: zod_1.z.string().optional(),
            })),
            text: zod_1.z.string().optional(),
        }).optional(),
        rank: zod_1.z.number().optional(),
    })).optional(),
    account: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    hospitalization: exports.EncounterHospitalizationSchema.optional(),
    location: zod_1.z.array(exports.EncounterLocationSchema).optional(),
    serviceProvider: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    partOf: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
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
class EncounterResourceError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'EncounterResourceError';
    }
}
exports.EncounterResourceError = EncounterResourceError;
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
                return { ok: false, error: new EncounterResourceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
// ==================== Encounter Resource ====================
class EncounterResource {
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
    async create(encounter) {
        const span = this.tracer.startSpan('encounter.create');
        span.setAttribute('patient', encounter.subject?.reference);
        const startTime = Date.now();
        try {
            const validated = exports.EncounterSchema.parse(encounter);
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
        const span = this.tracer.startSpan('encounter.read');
        span.setAttribute('encounter.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.read('Encounter', id), this.config.defaultTimeoutMs);
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
    async update(encounter) {
        const span = this.tracer.startSpan('encounter.update');
        span.setAttribute('encounter.id', encounter.id);
        const startTime = Date.now();
        try {
            const validated = exports.EncounterSchema.parse(encounter);
            if (!validated.id) {
                throw new EncounterResourceError('MISSING_ID', 'Encounter ID is required for update');
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
        const span = this.tracer.startSpan('encounter.delete');
        span.setAttribute('encounter.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                await this.retryWithTimeout(() => this.client.delete('Encounter', id), this.config.defaultTimeoutMs);
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
        const span = this.tracer.startSpan('encounter.search');
        span.setAttribute('params', JSON.stringify(params));
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.search('Encounter', params), this.config.defaultTimeoutMs);
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
    async getPatientEncounters(patientId, status) {
        return this.search({
            patient: patientId,
            status: status,
        });
    }
    async createEmergencyEncounter(params) {
        const encounter = {
            resourceType: 'Encounter',
            status: 'arrived',
            class: {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: 'EMER',
                display: 'emergency',
            },
            subject: {
                reference: `Patient/${params.patientId}`,
            },
            period: {
                start: params.arrivalDateTime,
            },
        };
        if (params.reasonForVisit) {
            encounter.reasonCode = [{
                    coding: [{
                            system: 'http://snomed.info/sct',
                            code: 'reason-for-visit',
                            display: params.reasonForVisit,
                        }],
                    text: params.reasonForVisit,
                }];
        }
        if (params.priority) {
            encounter.priority = params.priority;
        }
        if (params.locationId) {
            encounter.location = [{
                    location: {
                        reference: `Location/${params.locationId}`,
                    },
                    status: 'active',
                }];
        }
        if (params.practitionerId) {
            encounter.participant = [{
                    type: [{
                            coding: [{
                                    system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                                    code: 'ATND',
                                    display: 'attender',
                                }],
                        }],
                    individual: {
                        reference: `Practitioner/${params.practitionerId}`,
                    },
                }];
        }
        return this.create(encounter);
    }
    async updateStatus(encounterId, status, statusReason) {
        const encounter = await this.read(encounterId);
        encounter.status = status;
        if (statusReason) {
            encounter.statusReason = {
                coding: [{
                        system: 'http://hl7.org/fhir/encounter-status-reason',
                        code: 'custom',
                        display: statusReason,
                    }],
                text: statusReason,
            };
        }
        if (status === 'finished' && encounter.period) {
            encounter.period.end = new Date().toISOString();
        }
        return this.update(encounter);
    }
    async addParticipant(encounterId, participant) {
        const encounter = await this.read(encounterId);
        if (!encounter.participant)
            encounter.participant = [];
        encounter.participant.push({
            type: [{
                    coding: [participant.type],
                }],
            individual: {
                reference: `Practitioner/${participant.practitionerId}`,
            },
        });
        return this.update(encounter);
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
            name: 'FHIR Encounter Resource',
            version: '1.0.0',
            capabilities: [
                'crud_operations',
                'search',
                'emergency_encounter',
                'status_update',
                'participant_management',
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
            this.metrics.recordOperation('encounter-resource', operation, durationMs, success, error);
        }
        if (this.config.enableEventLogging) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
                type: 'ENCOUNTER_OPERATION',
                timestamp: new Date().toISOString(),
                source: 'encounter-resource',
                operation,
                data: { durationMs, error },
                success,
            });
        }
    }
}
exports.EncounterResource = EncounterResource;
// ==================== Convenience Factory ====================
function createEncounterResource(client, config) {
    return new EncounterResource(client, config);
}
//# sourceMappingURL=Encounter.js.map