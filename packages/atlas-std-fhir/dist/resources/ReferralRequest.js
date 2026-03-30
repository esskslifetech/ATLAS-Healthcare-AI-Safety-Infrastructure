"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralRequestResource = exports.ReferralRequestResourceError = exports.ServiceRequestSchema = void 0;
exports.setTracer = setTracer;
exports.createReferralRequestResource = createReferralRequestResource;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
// ==================== Schemas (unchanged) ====================
exports.ServiceRequestSchema = zod_1.z.object({
    resourceType: zod_1.z.literal('ServiceRequest'),
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
    instantiatesCanonical: zod_1.z.array(zod_1.z.string()).optional(),
    instantiatesUri: zod_1.z.array(zod_1.z.string()).optional(),
    basedOn: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    replaces: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    requisition: zod_1.z.object({
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
    status: zod_1.z.enum(['draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown']),
    intent: zod_1.z.enum(['proposal', 'plan', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option']),
    category: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    priority: zod_1.z.enum(['routine', 'urgent', 'stat', 'asap']).optional(),
    doNotPerform: zod_1.z.boolean().optional(),
    code: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }),
    orderDetail: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    quantityQuantity: zod_1.z.object({
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
        system: zod_1.z.string().optional(),
        code: zod_1.z.string().optional(),
    }).optional(),
    quantityRatio: zod_1.z.object({
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
    subject: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    encounter: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    occurrenceDateTime: zod_1.z.string().optional(),
    occurrencePeriod: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string().optional(),
    }).optional(),
    occurrenceTiming: zod_1.z.object({
        event: zod_1.z.array(zod_1.z.string()).optional(),
        repeat: zod_1.z.object({
            boundsDuration: zod_1.z.object({
                value: zod_1.z.number(),
                unit: zod_1.z.string(),
                system: zod_1.z.string().optional(),
                code: zod_1.z.string().optional(),
            }).optional(),
            count: zod_1.z.number().optional(),
            countMax: zod_1.z.number().optional(),
            duration: zod_1.z.number().optional(),
            durationMax: zod_1.z.number().optional(),
            durationUnit: zod_1.z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']).optional(),
            frequency: zod_1.z.number().optional(),
            frequencyMax: zod_1.z.number().optional(),
            period: zod_1.z.number().optional(),
            periodMax: zod_1.z.number().optional(),
            periodUnit: zod_1.z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']).optional(),
            dayOfWeek: zod_1.z.array(zod_1.z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
            timeOfDay: zod_1.z.array(zod_1.z.string()).optional(),
            when: zod_1.z.array(zod_1.z.string()).optional(),
            offset: zod_1.z.number().optional(),
        }).optional(),
        code: zod_1.z.object({
            coding: zod_1.z.array(zod_1.z.object({
                system: zod_1.z.string(),
                code: zod_1.z.string(),
                display: zod_1.z.string().optional(),
            })),
            text: zod_1.z.string().optional(),
        }).optional(),
    }).optional(),
    asNeededBoolean: zod_1.z.boolean().optional(),
    asNeededCodeableConcept: zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    }).optional(),
    authoredOn: zod_1.z.string().optional(),
    requester: zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    }).optional(),
    performerType: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    performer: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
    locationCode: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    locationReference: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
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
    bodySite: zod_1.z.array(zod_1.z.object({
        coding: zod_1.z.array(zod_1.z.object({
            system: zod_1.z.string(),
            code: zod_1.z.string(),
            display: zod_1.z.string().optional(),
        })),
        text: zod_1.z.string().optional(),
    })).optional(),
    note: zod_1.z.array(zod_1.z.object({
        authorString: zod_1.z.string().optional(),
        time: zod_1.z.string().optional(),
        text: zod_1.z.string(),
    })).optional(),
    patientInstruction: zod_1.z.string().optional(),
    relevantHistory: zod_1.z.array(zod_1.z.object({
        reference: zod_1.z.string(),
        display: zod_1.z.string().optional(),
    })).optional(),
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
class ReferralRequestResourceError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'ReferralRequestResourceError';
    }
}
exports.ReferralRequestResourceError = ReferralRequestResourceError;
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
                return { ok: false, error: new ReferralRequestResourceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
// ==================== ReferralRequest (ServiceRequest) Resource ====================
class ReferralRequestResource {
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
    async create(serviceRequest) {
        const span = this.tracer.startSpan('serviceRequest.create');
        span.setAttribute('patient', serviceRequest.subject?.reference);
        const startTime = Date.now();
        try {
            const validated = exports.ServiceRequestSchema.parse(serviceRequest);
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
        const span = this.tracer.startSpan('serviceRequest.read');
        span.setAttribute('serviceRequest.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.read('ServiceRequest', id), this.config.defaultTimeoutMs);
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
    async update(serviceRequest) {
        const span = this.tracer.startSpan('serviceRequest.update');
        span.setAttribute('serviceRequest.id', serviceRequest.id);
        const startTime = Date.now();
        try {
            const validated = exports.ServiceRequestSchema.parse(serviceRequest);
            if (!validated.id) {
                throw new ReferralRequestResourceError('MISSING_ID', 'ServiceRequest ID is required for update');
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
        const span = this.tracer.startSpan('serviceRequest.delete');
        span.setAttribute('serviceRequest.id', id);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                await this.retryWithTimeout(() => this.client.delete('ServiceRequest', id), this.config.defaultTimeoutMs);
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
        const span = this.tracer.startSpan('serviceRequest.search');
        span.setAttribute('params', JSON.stringify(params));
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call('fhir-server', async () => {
                return await this.retryWithTimeout(() => this.client.search('ServiceRequest', params), this.config.defaultTimeoutMs);
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
    async getActiveReferrals(patientId) {
        return this.search({
            patient: patientId,
            category: 'referral',
            status: 'active',
        });
    }
    async createReferral(params) {
        const serviceRequest = {
            resourceType: 'ServiceRequest',
            status: 'active',
            intent: 'order',
            category: [{
                    coding: [{
                            system: 'http://snomed.info/sct',
                            code: '306206005',
                            display: 'Referral',
                        }],
                }],
            code: {
                coding: [params.specialty],
            },
            subject: {
                reference: `Patient/${params.patientId}`,
            },
            requester: {
                reference: `Practitioner/${params.requesterId}`,
            },
            authoredOn: new Date().toISOString(),
        };
        if (params.urgency) {
            serviceRequest.priority = params.urgency;
        }
        if (params.reasonForReferral) {
            serviceRequest.reasonCode = [{
                    coding: [{
                            system: 'http://snomed.info/sct',
                            code: 'reason-for-referral',
                            display: params.reasonForReferral,
                        }],
                    text: params.reasonForReferral,
                }];
        }
        if (params.clinicalIndications) {
            serviceRequest.note = [{
                    text: params.clinicalIndications,
                }];
        }
        if (params.performerId) {
            serviceRequest.performer = [{
                    reference: `Practitioner/${params.performerId}`,
                }];
        }
        if (params.encounterId) {
            serviceRequest.encounter = {
                reference: `Encounter/${params.encounterId}`,
            };
        }
        if (params.notes) {
            if (!serviceRequest.note) {
                serviceRequest.note = [];
            }
            serviceRequest.note.push({
                text: params.notes,
            });
        }
        return this.create(serviceRequest);
    }
    async createEmergencyReferral(params) {
        return this.createReferral({
            patientId: params.patientId,
            requesterId: params.requesterId,
            specialty: {
                system: 'http://snomed.info/sct',
                code: '394584007',
                display: 'Emergency department',
            },
            urgency: params.priority || 'urgent',
            reasonForReferral: params.reasonForVisit,
            clinicalIndications: params.clinicalIndications,
            performerId: params.emergencyDepartmentId,
        });
    }
    async createSpecialistReferral(params) {
        return this.createReferral({
            patientId: params.patientId,
            requesterId: params.requesterId,
            specialty: params.specialty,
            urgency: params.urgency || 'routine',
            reasonForReferral: params.reasonForReferral,
            clinicalIndications: params.clinicalIndications,
            performerId: params.specialistId,
        });
    }
    async updateStatus(referralId, status) {
        const referral = await this.read(referralId);
        referral.status = status;
        return this.update(referral);
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
            name: 'FHIR ServiceRequest (Referral) Resource',
            version: '1.0.0',
            capabilities: [
                'crud_operations',
                'search',
                'active_referrals',
                'referral_creation',
                'emergency_referral',
                'specialist_referral',
                'status_update',
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
            this.metrics.recordOperation('service-request-resource', operation, durationMs, success, error);
        }
        if (this.config.enableEventLogging) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
                type: 'SERVICE_REQUEST_OPERATION',
                timestamp: new Date().toISOString(),
                source: 'service-request-resource',
                operation,
                data: { durationMs, error },
                success,
            });
        }
    }
}
exports.ReferralRequestResource = ReferralRequestResource;
// ==================== Convenience Factory ====================
function createReferralRequestResource(client, config) {
    return new ReferralRequestResource(client, config);
}
//# sourceMappingURL=ReferralRequest.js.map