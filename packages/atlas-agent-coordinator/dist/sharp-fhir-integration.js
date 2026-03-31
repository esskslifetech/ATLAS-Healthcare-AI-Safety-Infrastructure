"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHARPFhirIntegration = exports.consoleAuditLogger = exports.AtlasFhirGateway = exports.LocalLockProvider = exports.MemoryCacheStore = exports.DisposedError = exports.ConfigurationError = exports.TransportError = exports.ResourceNotFoundError = exports.ValidationError = exports.AuthorizationError = exports.SHARPFhirError = exports.FhirConditionSchema = exports.FhirMedicationRequestSchema = exports.FhirObservationSchema = exports.FhirPatientSchema = void 0;
exports.createSHARPFhirIntegration = createSHARPFhirIntegration;
const fhir_1 = require("@atlas-std/fhir");
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:timers/promises");
const zod_1 = require("zod");
// ============================================================================
// FHIR SCHEMAS
// ============================================================================
const CodingSchema = zod_1.z.object({
    system: zod_1.z.string().min(1).optional(), // URI in FHIR is not always a URL
    code: zod_1.z.string().min(1).optional(),
    display: zod_1.z.string().min(1).optional(),
}).passthrough();
const CodeableConceptSchema = zod_1.z.object({
    coding: zod_1.z.array(CodingSchema).optional(),
    text: zod_1.z.string().min(1).optional(),
}).passthrough();
const ReferenceSchema = zod_1.z.object({
    reference: zod_1.z.string().min(1),
}).passthrough();
const QuantitySchema = zod_1.z.object({
    value: zod_1.z.number(),
    unit: zod_1.z.string().min(1),
    system: zod_1.z.string().min(1).optional(),
    code: zod_1.z.string().min(1).optional(),
}).passthrough();
const HumanNameSchema = zod_1.z.object({
    use: zod_1.z.string().min(1).optional(),
    family: zod_1.z.string().min(1).optional(),
    given: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    text: zod_1.z.string().min(1).optional(),
}).passthrough();
const DosageInstructionSchema = zod_1.z.object({
    text: zod_1.z.string().min(1).optional(),
    timing: zod_1.z.object({
        repeat: zod_1.z.object({
            frequency: zod_1.z.number().optional(),
            period: zod_1.z.number().optional(),
            periodUnit: zod_1.z.string().min(1).optional(),
        }).optional(),
    }).optional(),
}).passthrough();
exports.FhirPatientSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    resourceType: zod_1.z.literal('Patient'),
    name: zod_1.z.array(HumanNameSchema).optional(),
    birthDate: zod_1.z.string().min(1).optional(),
    gender: zod_1.z.enum(['male', 'female', 'other', 'unknown']).optional(),
    active: zod_1.z.boolean().optional(),
}).passthrough();
exports.FhirObservationSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    resourceType: zod_1.z.literal('Observation'),
    status: zod_1.z.string().min(1),
    code: CodeableConceptSchema,
    subject: ReferenceSchema.optional(),
    effectiveDateTime: zod_1.z.string().min(1).optional(),
    valueQuantity: QuantitySchema.optional(),
    component: zod_1.z.array(zod_1.z.object({
        code: CodeableConceptSchema,
        valueQuantity: QuantitySchema.optional(),
    }).passthrough()).optional(),
}).passthrough();
exports.FhirMedicationRequestSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    resourceType: zod_1.z.literal('MedicationRequest'),
    status: zod_1.z.string().min(1),
    intent: zod_1.z.string().min(1),
    medicationCodeableConcept: CodeableConceptSchema.optional(),
    subject: ReferenceSchema,
    authoredOn: zod_1.z.string().min(1).optional(),
    dosageInstruction: zod_1.z.array(DosageInstructionSchema).optional(),
}).passthrough();
exports.FhirConditionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    resourceType: zod_1.z.literal('Condition'),
    clinicalStatus: CodeableConceptSchema.optional(),
    code: CodeableConceptSchema,
    subject: ReferenceSchema,
    recordedDate: zod_1.z.string().min(1).optional(),
    severity: CodeableConceptSchema.optional(),
}).passthrough();
// ============================================================================
// ERROR HANDLING
// ============================================================================
class SHARPFhirError extends Error {
    constructor(message, code, context, cause) {
        super(message);
        this.name = 'SHARPFhirError';
        this.code = code;
        this.context = context;
        this.cause = cause;
    }
}
exports.SHARPFhirError = SHARPFhirError;
class AuthorizationError extends SHARPFhirError {
    constructor(message, context) {
        super(message, 'AUTHORIZATION_ERROR', context);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class ValidationError extends SHARPFhirError {
    constructor(message, context) {
        super(message, 'VALIDATION_ERROR', context);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ResourceNotFoundError extends SHARPFhirError {
    constructor(resourceType, id, context, cause) {
        super(`${resourceType} with id ${id} not found`, 'RESOURCE_NOT_FOUND', { resourceType, id, ...context }, cause);
        this.name = 'ResourceNotFoundError';
    }
}
exports.ResourceNotFoundError = ResourceNotFoundError;
class TransportError extends SHARPFhirError {
    constructor(message, context, cause) {
        super(message, 'TRANSPORT_ERROR', context, cause);
        this.name = 'TransportError';
    }
}
exports.TransportError = TransportError;
class ConfigurationError extends SHARPFhirError {
    constructor(message, context) {
        super(message, 'CONFIGURATION_ERROR', context);
        this.name = 'ConfigurationError';
    }
}
exports.ConfigurationError = ConfigurationError;
class DisposedError extends SHARPFhirError {
    constructor() {
        super('SHARPFhirIntegration has been disposed', 'DISPOSED');
        this.name = 'DisposedError';
    }
}
exports.DisposedError = DisposedError;
/**
 * In-memory cache with TTL and defensive cloning.
 * Swap this with Redis/Memcached/etc. via CacheStore for multi-node deployments.
 */
class MemoryCacheStore {
    constructor(defaultTtlMs = 300000, cleanupEveryMs = 60000) {
        this.defaultTtlMs = defaultTtlMs;
        this.entries = new Map();
        this.cleanupTimer = setInterval(() => this.cleanupExpired(), cleanupEveryMs);
        this.cleanupTimer.unref?.();
    }
    async get(key) {
        const entry = this.entries.get(key);
        if (!entry) {
            return undefined;
        }
        if (Date.now() >= entry.expiresAtEpochMs) {
            this.entries.delete(key);
            return undefined;
        }
        return cloneValue(entry.value);
    }
    async set(key, value, ttlMs = this.defaultTtlMs) {
        const effectiveTtl = positiveIntegerOrDefault(ttlMs, this.defaultTtlMs);
        this.entries.set(key, {
            value: cloneValue(value),
            expiresAtEpochMs: Date.now() + effectiveTtl,
        });
    }
    async delete(key) {
        this.entries.delete(key);
    }
    async deleteByPrefix(prefix) {
        let deleted = 0;
        for (const key of this.entries.keys()) {
            if (key.startsWith(prefix)) {
                this.entries.delete(key);
                deleted += 1;
            }
        }
        return deleted;
    }
    async clear() {
        this.entries.clear();
    }
    async close() {
        clearInterval(this.cleanupTimer);
        this.entries.clear();
    }
    cleanupExpired() {
        const now = Date.now();
        for (const [key, entry] of this.entries.entries()) {
            if (now >= entry.expiresAtEpochMs) {
                this.entries.delete(key);
            }
        }
    }
}
exports.MemoryCacheStore = MemoryCacheStore;
/**
 * Fair local keyed lock.
 * Swap this for a distributed lock provider in multi-instance deployments.
 */
class LocalLockProvider {
    constructor() {
        this.queues = new Map();
    }
    async acquire(key) {
        const queue = this.queues.get(key);
        if (!queue) {
            this.queues.set(key, []);
            return this.createLease(key);
        }
        await new Promise((resolve) => {
            queue.push(resolve);
        });
        return this.createLease(key);
    }
    async close() {
        this.queues.clear();
    }
    createLease(key) {
        let released = false;
        return {
            release: async () => {
                if (released) {
                    return;
                }
                released = true;
                const queue = this.queues.get(key);
                const next = queue?.shift();
                if (next) {
                    next();
                    return;
                }
                this.queues.delete(key);
            },
        };
    }
}
exports.LocalLockProvider = LocalLockProvider;
class SingleFlight {
    constructor() {
        this.inFlight = new Map();
    }
    async run(key, work) {
        const existing = this.inFlight.get(key);
        if (existing) {
            return existing;
        }
        const promise = work().finally(() => {
            this.inFlight.delete(key);
        });
        this.inFlight.set(key, promise);
        return promise;
    }
}
/**
 * Atlas adapter isolated behind a gateway so the integration service stays testable
 * and future transport changes remain localized.
 */
class AtlasFhirGateway {
    constructor(config) {
        this.config = config;
    }
    async readPatient(patientId) {
        return this.getClient().patient.read(patientId);
    }
    async searchObservations(params) {
        const bundle = await this.getClient().observation.search(params);
        return extractBundleResources(bundle);
    }
    async searchMedicationRequests(params) {
        const bundle = await this.getClient().medicationRequest.search(params);
        return extractBundleResources(bundle);
    }
    async searchConditions(params) {
        const bundle = await this.getClient().condition.search(params);
        return extractBundleResources(bundle);
    }
    getClient() {
        const token = this.config.getAccessToken();
        if (!this.clientSnapshot || this.clientSnapshot.token !== token) {
            this.clientSnapshot = {
                token,
                client: (0, fhir_1.createAtlasFhir)({
                    baseUrl: this.config.baseUrl,
                    timeout: this.config.timeoutMs,
                    auth: token
                        ? {
                            type: 'bearer',
                            token,
                        }
                        : undefined,
                }),
            };
        }
        return this.clientSnapshot.client;
    }
}
exports.AtlasFhirGateway = AtlasFhirGateway;
// ============================================================================
// AUDIT LOGGER
// ============================================================================
const consoleAuditLogger = (entry) => {
    const payload = {
        ts: entry.timestamp.toISOString(),
        requestId: entry.requestId,
        operation: entry.operation,
        patientId: entry.patientId,
        success: entry.success,
        durationMs: entry.durationMs,
        errorCode: entry.errorCode,
        error: entry.error,
        sharpSessionId: entry.sharpSessionId,
        metadata: entry.metadata,
    };
    if (entry.success) {
        console.info('[SHARP-FHIR AUDIT]', JSON.stringify(payload));
        return;
    }
    console.error('[SHARP-FHIR AUDIT]', JSON.stringify(payload));
};
exports.consoleAuditLogger = consoleAuditLogger;
// ============================================================================
// MAIN SERVICE
// ============================================================================
const DEFAULT_FHIR_BASE_URL = 'https://demo.fhir.org/r4';
const DEFAULT_CONSENT_SCOPES = Object.freeze([
    'treatment',
    'data_processing',
    'medication_review',
    'diagnosis',
]);
const DEFAULT_FHIR_SCOPES = Object.freeze(['read', 'search']);
class SHARPFhirIntegration {
    constructor(config = {}) {
        this.singleFlight = new SingleFlight();
        this.sharpContext = null;
        this.disposed = false;
        this.config = resolveConfig(config);
        this.currentFhirToken = this.config.fhirToken;
        this.cacheStore = config.cacheStore ?? new MemoryCacheStore(this.config.cacheTTL);
        this.lockProvider = config.lockProvider ?? new LocalLockProvider();
        this.auditLogger = config.auditLogger ?? exports.consoleAuditLogger;
        this.gateway =
            config.gateway ??
                new AtlasFhirGateway({
                    baseUrl: this.config.fhirBaseUrl,
                    timeoutMs: this.config.timeout,
                    getAccessToken: () => this.currentFhirToken,
                });
        if (this.config.patientId && this.config.sessionId) {
            this.initializeSHARPSession(this.config.patientId, this.config.sessionId, [...this.config.defaultFhirScopes], [...this.config.consentScopes]);
        }
    }
    // ==========================================================================
    // SHARP CONTEXT MANAGEMENT
    // ==========================================================================
    /**
     * Initializes a SHARP session and updates the effective FHIR token for the transport layer.
     */
    initializeSHARPSession(patientId, sessionId, fhirScopes = [...this.config.defaultFhirScopes], consentScopes = [...this.config.consentScopes]) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        assertNonEmptyString(sessionId, 'sessionId');
        const normalizedFhirScopes = uniqueNonEmptyStrings(fhirScopes);
        const normalizedConsentScopes = uniqueNonEmptyStrings(consentScopes);
        const timestamp = this.config.now();
        const propagationToken = this.generateToken('propagation', {
            patientId,
            sessionId,
            timestamp: timestamp.toISOString(),
        });
        const fhirToken = normalizedFhirScopes.length > 0
            ? `fhir.${this.generateToken('fhir', { patientId, sessionId }).slice(0, 24)}`
            : undefined;
        const consentToken = normalizedConsentScopes.length > 0
            ? `consent.${this.generateToken('consent', { patientId, sessionId }).slice(0, 24)}`
            : undefined;
        const context = deepFreeze({
            patientId,
            sessionId,
            timestamp,
            propagationToken,
            fhirToken,
            consentToken,
            metadata: {
                fhirScopes: normalizedFhirScopes,
                consentScopes: normalizedConsentScopes,
            },
        });
        this.sharpContext = context;
        if (fhirToken) {
            this.updateFhirToken(fhirToken);
        }
        return context;
    }
    getSHARPContext() {
        return this.sharpContext;
    }
    async propagateSHARPContext(targetAgent) {
        this.assertNotDisposed();
        if (!this.sharpContext) {
            return null;
        }
        assertNonEmptyString(targetAgent, 'targetAgent');
        return deepFreeze({
            ...this.sharpContext,
            timestamp: this.config.now(),
            metadata: {
                ...this.sharpContext.metadata,
                propagatedTo: targetAgent,
                propagatedAt: this.config.now().toISOString(),
            },
        });
    }
    async getFHIRAuthorization(requiredScope) {
        this.assertNotDisposed();
        if (!this.sharpContext) {
            return { authorized: false };
        }
        const authorized = Boolean(this.sharpContext.fhirToken) &&
            this.sharpContext.metadata.fhirScopes.includes(requiredScope);
        return {
            authorized,
            token: this.sharpContext.fhirToken,
        };
    }
    async getConsentAuthorization(requiredScope) {
        this.assertNotDisposed();
        if (!this.sharpContext) {
            return { authorized: false };
        }
        const authorized = Boolean(this.sharpContext.consentToken) &&
            this.sharpContext.metadata.consentScopes.includes(requiredScope);
        return {
            authorized,
            patientId: this.sharpContext.patientId,
        };
    }
    // ==========================================================================
    // FHIR OPERATIONS
    // ==========================================================================
    async getPatientData(patientId, useCache = true) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const cacheKey = this.buildCacheKey('patient', patientId);
        return this.withCachedLoad(cacheKey, useCache, async () => {
            return this.runAudited('PATIENT_READ', patientId, { cacheKey }, async () => {
                await this.requireFhirScope('read', patientId, 'patient read');
                try {
                    const resource = await this.executeWithRetry(() => this.gateway.readPatient(patientId), 'PATIENT_READ', patientId);
                    return parseWithSchema(exports.FhirPatientSchema, resource, 'Invalid Patient resource received');
                }
                catch (error) {
                    if (isNotFoundError(error)) {
                        throw new ResourceNotFoundError('Patient', patientId, { patientId }, toError(error));
                    }
                    throw this.wrapExternalError(error, {
                        operation: 'PATIENT_READ',
                        patientId,
                    });
                }
            });
        });
    }
    async getPatientObservations(patientId, options = {}) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        validateDateRange(options.dateRange);
        const safeLimit = clampPositiveInteger(options.limit ?? 50, 1, 500);
        const useCache = options.useCache !== false;
        const normalizedCodes = uniqueNonEmptyStrings(options.codes ?? []);
        const cacheKey = this.buildCacheKey('observations', patientId, {
            codes: normalizedCodes,
            dateRange: options.dateRange
                ? {
                    start: options.dateRange.start.toISOString(),
                    end: options.dateRange.end.toISOString(),
                }
                : undefined,
            limit: safeLimit,
        });
        return this.withCachedLoad(cacheKey, useCache, async () => {
            return this.runAudited('OBSERVATION_SEARCH', patientId, { cacheKey }, async () => {
                await this.requireFhirScope('search', patientId, 'observation search');
                const params = {
                    patient: patientId,
                    _sort: '-date',
                    _count: safeLimit,
                    code: normalizedCodes.length > 0 ? normalizedCodes.join(',') : undefined,
                    date: options.dateRange
                        ? `ge${options.dateRange.start.toISOString()},le${options.dateRange.end.toISOString()}`
                        : undefined,
                };
                try {
                    const resources = await this.executeWithRetry(() => this.gateway.searchObservations(params), 'OBSERVATION_SEARCH', patientId);
                    return freezeArray(resources.map((resource) => parseWithSchema(exports.FhirObservationSchema, resource, 'Invalid Observation resource received')));
                }
                catch (error) {
                    throw this.wrapExternalError(error, {
                        operation: 'OBSERVATION_SEARCH',
                        patientId,
                    });
                }
            });
        });
    }
    async getPatientMedications(patientId, status = 'active') {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        assertNonEmptyString(status, 'status');
        const cacheKey = this.buildCacheKey('medications', patientId, { status });
        return this.withCachedLoad(cacheKey, true, async () => {
            return this.runAudited('MEDICATION_SEARCH', patientId, { cacheKey, status }, async () => {
                await this.requireConsentScope('medication_review', patientId, 'medication review');
                await this.requireFhirScope('search', patientId, 'medication search');
                try {
                    const resources = await this.executeWithRetry(() => this.gateway.searchMedicationRequests({
                        patient: patientId,
                        status,
                        _sort: '-authoredon',
                        _count: 100,
                    }), 'MEDICATION_SEARCH', patientId);
                    return freezeArray(resources.map((resource) => parseWithSchema(exports.FhirMedicationRequestSchema, resource, 'Invalid MedicationRequest resource received')));
                }
                catch (error) {
                    throw this.wrapExternalError(error, {
                        operation: 'MEDICATION_SEARCH',
                        patientId,
                    });
                }
            });
        });
    }
    async getPatientConditions(patientId, options = {}) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const useCache = options.useCache !== false;
        const cacheKey = this.buildCacheKey('conditions', patientId, {
            activeOnly: options.activeOnly === true,
        });
        return this.withCachedLoad(cacheKey, useCache, async () => {
            return this.runAudited('CONDITION_SEARCH', patientId, { cacheKey }, async () => {
                await this.requireConsentScope('diagnosis', patientId, 'condition access');
                await this.requireFhirScope('search', patientId, 'condition search');
                const params = {
                    patient: patientId,
                    _sort: '-recorded-date',
                    _count: 100,
                    'clinical-status': options.activeOnly ? 'active' : undefined,
                };
                try {
                    const resources = await this.executeWithRetry(() => this.gateway.searchConditions(params), 'CONDITION_SEARCH', patientId);
                    return freezeArray(resources.map((resource) => parseWithSchema(exports.FhirConditionSchema, resource, 'Invalid Condition resource received')));
                }
                catch (error) {
                    throw this.wrapExternalError(error, {
                        operation: 'CONDITION_SEARCH',
                        patientId,
                    });
                }
            });
        });
    }
    // ==========================================================================
    // HIGH-LEVEL CLINICAL METHODS
    // ==========================================================================
    async getClinicalContext(patientId, options = {}) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const includeVitals = options.includeVitals !== false;
        const includeMedications = options.includeMedications !== false;
        const includeConditions = options.includeConditions !== false;
        const [patientResult, vitalsResult, medicationsResult, conditionsResult] = await Promise.all([
            this.getPatientData(patientId, options.useCache !== false),
            includeVitals
                ? this.getPatientObservations(patientId, { useCache: options.useCache })
                : Promise.resolve(undefined),
            includeMedications
                ? this.getPatientMedications(patientId)
                : Promise.resolve(undefined),
            includeConditions
                ? this.getPatientConditions(patientId, {
                    activeOnly: true,
                    useCache: options.useCache,
                })
                : Promise.resolve(undefined),
        ].map((promise) => promise.then((value) => ({ ok: true, value }), (error) => ({ ok: false, error }))));
        const metadata = {};
        const patient = patientResult.ok
            ? this.extractPatientInfo(patientResult.value)
            : undefined;
        if (!patientResult.ok) {
            metadata.patientError = describeError(patientResult.error);
        }
        const vitals = includeVitals && vitalsResult.ok && vitalsResult.value
            ? this.extractVitals(vitalsResult.value)
            : undefined;
        if (includeVitals && !vitalsResult.ok) {
            metadata.vitalsError = describeError(vitalsResult.error);
        }
        const medications = includeMedications && medicationsResult.ok && medicationsResult.value
            ? freezeArray(this.extractMedications(medicationsResult.value))
            : freezeArray([]);
        if (includeMedications && !medicationsResult.ok) {
            metadata.medicationsError = describeError(medicationsResult.error);
        }
        const conditions = includeConditions && conditionsResult.ok && conditionsResult.value
            ? freezeArray(this.extractConditions(conditionsResult.value))
            : freezeArray([]);
        if (includeConditions && !conditionsResult.ok) {
            metadata.conditionsError = describeError(conditionsResult.error);
        }
        return deepFreeze({
            patientId,
            timestamp: this.config.now(),
            patient,
            vitals,
            medications,
            conditions,
            sharpContext: this.sharpContext
                ? {
                    sessionId: this.sharpContext.sessionId,
                    propagationToken: this.sharpContext.propagationToken,
                }
                : undefined,
            metadata,
        });
    }
    async getPatientSummary(patientId) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const [patient, observations, medications, conditions] = await Promise.all([
            this.getPatientData(patientId),
            this.getPatientObservations(patientId, { limit: 10 }),
            this.getPatientMedications(patientId),
            this.getPatientConditions(patientId, { activeOnly: true }),
        ]);
        const recentVitals = this.extractVitals(observations);
        const alerts = this.detectClinicalAlerts(recentVitals);
        return deepFreeze({
            patient: this.extractPatientInfo(patient),
            recentVitals,
            activeMedicationsCount: medications.length,
            activeConditionsCount: conditions.length,
            alerts,
            lastUpdated: this.config.now(),
        });
    }
    /**
     * Derived insights from current vitals. This is intentionally lightweight and explainable.
     */
    async getClinicalInsights(patientId) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const context = await this.getClinicalContext(patientId, {
            includeVitals: true,
            includeMedications: false,
            includeConditions: false,
            useCache: true,
        });
        const alerts = context.vitals ? this.detectClinicalAlerts(context.vitals) : freezeArray([]);
        const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length;
        const warningCount = alerts.filter((alert) => alert.severity === 'warning').length;
        const acuity = criticalCount > 0 ? 'high' :
            warningCount >= 2 ? 'medium' :
                warningCount === 1 ? 'medium' :
                    'low';
        const summary = freezeArray(alerts.length > 0
            ? alerts.map((alert) => alert.message)
            : ['No alert-triggering vital abnormalities detected from available data.']);
        return deepFreeze({
            patientId,
            derivedAt: this.config.now(),
            acuity,
            alerts,
            summary,
        });
    }
    async getPatientTimeline(patientId, options = {}) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const limit = clampPositiveInteger(options.limit ?? 50, 1, 500);
        const includeObservations = options.includeObservations !== false;
        const includeMedications = options.includeMedications !== false;
        const includeConditions = options.includeConditions !== false;
        const [observationResult, medicationResult, conditionResult] = await Promise.all([
            includeObservations
                ? this.getPatientObservations(patientId, { limit, useCache: options.useCache })
                : Promise.resolve(undefined),
            includeMedications
                ? this.getPatientMedications(patientId)
                : Promise.resolve(undefined),
            includeConditions
                ? this.getPatientConditions(patientId, { useCache: options.useCache })
                : Promise.resolve(undefined),
        ].map((promise) => promise.then((value) => ({ ok: true, value }), (error) => ({ ok: false, error }))));
        const events = [];
        const errors = {};
        if (includeObservations) {
            if (observationResult.ok && observationResult.value) {
                for (const observation of observationResult.value) {
                    const at = parseDate(observation.effectiveDateTime);
                    if (!at) {
                        continue;
                    }
                    events.push({
                        at,
                        type: 'observation',
                        id: observation.id,
                        title: getObservationLabel(observation),
                        detail: getObservationValueDescription(observation),
                        status: observation.status,
                    });
                }
            }
            else if (!observationResult.ok) {
                errors.observations = describeError(observationResult.error);
            }
        }
        if (includeMedications) {
            if (medicationResult.ok && medicationResult.value) {
                for (const medication of medicationResult.value) {
                    const at = parseDate(medication.authoredOn);
                    if (!at) {
                        continue;
                    }
                    const extracted = this.extractMedication(medication);
                    events.push({
                        at,
                        type: 'medication',
                        id: extracted.id,
                        title: extracted.name,
                        detail: extracted.dosage ?? extracted.frequency ?? extracted.status,
                        status: extracted.status,
                    });
                }
            }
            else if (!medicationResult.ok) {
                errors.medications = describeError(medicationResult.error);
            }
        }
        if (includeConditions) {
            if (conditionResult.ok && conditionResult.value) {
                for (const condition of conditionResult.value) {
                    const at = parseDate(condition.recordedDate);
                    if (!at) {
                        continue;
                    }
                    const extracted = this.extractCondition(condition);
                    events.push({
                        at,
                        type: 'condition',
                        id: extracted.id,
                        title: extracted.name,
                        detail: extracted.code || extracted.status || 'Condition recorded',
                        status: extracted.status,
                    });
                }
            }
            else if (!conditionResult.ok) {
                errors.conditions = describeError(conditionResult.error);
            }
        }
        events.sort((left, right) => right.at.getTime() - left.at.getTime());
        return deepFreeze({
            patientId,
            generatedAt: this.config.now(),
            events: freezeArray(events.slice(0, limit)),
            errors,
        });
    }
    async warmPatientCache(patientId) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const results = await Promise.allSettled([
            this.getPatientData(patientId, true),
            this.getPatientObservations(patientId, { useCache: true }),
            this.getPatientMedications(patientId),
            this.getPatientConditions(patientId, { useCache: true }),
        ]);
        const details = {};
        const labels = ['patient', 'observations', 'medications', 'conditions'];
        results.forEach((result, index) => {
            details[labels[index]] =
                result.status === 'fulfilled'
                    ? 'warmed'
                    : `failed: ${describeError(result.reason)}`;
        });
        return deepFreeze({
            patientId,
            warmedAt: this.config.now(),
            success: results.every((result) => result.status === 'fulfilled'),
            details,
        });
    }
    async invalidatePatientCache(patientId) {
        this.assertNotDisposed();
        assertNonEmptyString(patientId, 'patientId');
        const deletedEntries = (await Promise.all([
            this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('patient', patientId)),
            this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('observations', patientId)),
            this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('medications', patientId)),
            this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('conditions', patientId)),
        ])).reduce((sum, count) => sum + count, 0);
        return deepFreeze({
            patientId,
            deletedEntries,
        });
    }
    // ==========================================================================
    // PROTOCOL / HANDOFF
    // ==========================================================================
    exportSHARPProtocol() {
        return deepFreeze({
            specification: 'SHARP-Extension-Specs/v2.1',
            version: '2.1.0',
            capabilities: [
                'context_propagation',
                'fhir_token_management',
                'consent_verification',
                'audit_logging',
                'pluggable_cache',
                'pluggable_locking',
                'singleflight_deduplication',
                'data_validation',
                'patient_timeline',
                'clinical_insights',
                'cache_warming',
                'cache_invalidation',
            ],
        });
    }
    async createSHARPHandoff(fromAgent, toAgent, urgency = 'ROUTINE', handoffType = 'CARE_COORDINATION') {
        this.assertNotDisposed();
        assertNonEmptyString(fromAgent, 'fromAgent');
        assertNonEmptyString(toAgent, 'toAgent');
        if (!this.sharpContext) {
            throw new SHARPFhirError('No SHARP context available for handoff', 'NO_CONTEXT');
        }
        return deepFreeze({
            handoffId: `sharp_${(0, node_crypto_1.randomUUID)()}`,
            fromAgent,
            toAgent,
            context: this.sharpContext,
            urgency,
            handoffType,
            status: 'PENDING',
            timestamp: this.config.now(),
        });
    }
    // ==========================================================================
    // LIFECYCLE
    // ==========================================================================
    async dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        await Promise.all([
            this.cacheStore.close(),
            this.lockProvider.close(),
        ]);
    }
    // ==========================================================================
    // PRIVATE HELPERS
    // ==========================================================================
    assertNotDisposed() {
        if (this.disposed) {
            throw new DisposedError();
        }
    }
    updateFhirToken(token) {
        this.currentFhirToken = token;
    }
    async requireFhirScope(requiredScope, patientId, operation) {
        const auth = await this.getFHIRAuthorization(requiredScope);
        if (!auth.authorized) {
            throw new AuthorizationError('FHIR access not authorized', {
                requiredScope,
                patientId,
                operation,
            });
        }
    }
    async requireConsentScope(requiredScope, patientId, operation) {
        const auth = await this.getConsentAuthorization(requiredScope);
        if (!auth.authorized) {
            throw new AuthorizationError('Consent access not authorized', {
                requiredScope,
                patientId,
                operation,
            });
        }
    }
    async withCachedLoad(cacheKey, useCache, loader) {
        if (useCache) {
            const cached = await this.cacheStore.get(cacheKey);
            if (cached !== undefined) {
                return cached;
            }
        }
        return this.singleFlight.run(cacheKey, async () => {
            if (useCache) {
                const cached = await this.cacheStore.get(cacheKey);
                if (cached !== undefined) {
                    return cached;
                }
            }
            const lease = await this.lockProvider.acquire(`cache-fill:${cacheKey}`, {
                ttlMs: this.config.lockTTL,
            });
            try {
                if (useCache) {
                    const cached = await this.cacheStore.get(cacheKey);
                    if (cached !== undefined) {
                        return cached;
                    }
                }
                const loaded = await loader();
                if (useCache) {
                    await this.cacheStore.set(cacheKey, loaded, this.config.cacheTTL);
                }
                return loaded;
            }
            finally {
                await lease.release();
            }
        });
    }
    async runAudited(operation, patientId, metadata, work) {
        const startedAt = Date.now();
        const requestId = (0, node_crypto_1.randomUUID)();
        try {
            const value = await work();
            this.emitAudit({
                timestamp: this.config.now(),
                requestId,
                operation,
                patientId,
                success: true,
                durationMs: Date.now() - startedAt,
                sharpSessionId: this.sharpContext?.sessionId,
                metadata,
            });
            return value;
        }
        catch (error) {
            const err = error instanceof SHARPFhirError ? error : this.wrapExternalError(error, {
                operation,
                patientId,
            });
            this.emitAudit({
                timestamp: this.config.now(),
                requestId,
                operation,
                patientId,
                success: false,
                durationMs: Date.now() - startedAt,
                errorCode: err.code,
                error: err.message,
                sharpSessionId: this.sharpContext?.sessionId,
                metadata: {
                    ...metadata,
                    ...(err.context ?? {}),
                },
            });
            throw err;
        }
    }
    emitAudit(entry) {
        void Promise.resolve(this.auditLogger(entry)).catch((error) => {
            const auditFailure = toError(error);
            console.error('[SHARP-FHIR AUDIT LOGGER FAILURE]', auditFailure.message);
        });
    }
    async executeWithRetry(operation, operationName, patientId) {
        let lastError;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt += 1) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt >= this.config.maxRetries || !isRetryableError(error)) {
                    break;
                }
                const delayMs = this.computeRetryDelayMs(attempt);
                this.emitAudit({
                    timestamp: this.config.now(),
                    requestId: (0, node_crypto_1.randomUUID)(),
                    operation: `${operationName}_RETRY`,
                    patientId,
                    success: false,
                    durationMs: 0,
                    error: describeError(error),
                    metadata: {
                        attempt,
                        delayMs,
                    },
                });
                await (0, promises_1.setTimeout)(delayMs);
            }
        }
        throw lastError;
    }
    computeRetryDelayMs(attempt) {
        const base = Math.min(this.config.retryBaseDelayMs * 2 ** Math.max(0, attempt - 1), this.config.retryMaxDelayMs);
        const jitter = Math.floor(base * this.config.retryJitterRatio * Math.random());
        return base + jitter;
    }
    wrapExternalError(error, context) {
        if (error instanceof SHARPFhirError) {
            return error;
        }
        const normalized = toError(error);
        return new TransportError(normalized.message, context, normalized);
    }
    buildCacheKey(resource, patientId, options) {
        return options === undefined
            ? `${resource}:${patientId}`
            : `${resource}:${patientId}:${stableStringify(options)}`;
    }
    buildCacheKeyPrefix(resource, patientId) {
        return `${resource}:${patientId}`;
    }
    generateToken(namespace, payload) {
        const hash = (0, node_crypto_1.createHash)('sha256');
        hash.update(this.config.sessionSecret);
        hash.update(':');
        hash.update(namespace);
        hash.update(':');
        hash.update(stableStringify(payload));
        return hash.digest('base64url');
    }
    extractPatientInfo(patient) {
        const name = selectBestPatientName(patient.name);
        return deepFreeze({
            id: patient.id,
            name,
            birthDate: patient.birthDate,
            gender: patient.gender,
            age: calculateAge(patient.birthDate),
        });
    }
    extractVitals(observations) {
        const sorted = [...observations].sort((left, right) => getObservationEpochMs(right) - getObservationEpochMs(left));
        const vitals = {};
        for (const observation of sorted) {
            const codes = new Set((observation.code?.coding ?? []).map((coding) => coding.code).filter(isNonEmptyString));
            if (!vitals.bloodPressure && codes.has('85354-9')) {
                const systolic = findObservationComponentQuantity(observation, '8480-6');
                const diastolic = findObservationComponentQuantity(observation, '8462-4');
                if (systolic && diastolic) {
                    Object.assign(vitals, {
                        bloodPressure: {
                            systolic: systolic.value,
                            diastolic: diastolic.value,
                            unit: systolic.unit,
                        },
                    });
                }
            }
            const reading = toVitalReading(observation);
            if (!reading) {
                continue;
            }
            if (!vitals.heartRate && codes.has('8867-4')) {
                Object.assign(vitals, { heartRate: reading });
            }
            if (!vitals.temperature && codes.has('8310-5')) {
                Object.assign(vitals, { temperature: reading });
            }
            if (!vitals.oxygenSaturation && codes.has('2708-6')) {
                Object.assign(vitals, { oxygenSaturation: reading });
            }
            if (!vitals.respiratoryRate && codes.has('9279-1')) {
                Object.assign(vitals, { respiratoryRate: reading });
            }
        }
        return deepFreeze(vitals);
    }
    extractMedications(medications) {
        return medications.map((medication) => this.extractMedication(medication));
    }
    extractMedication(medication) {
        const primaryCoding = medication.medicationCodeableConcept?.coding?.[0];
        const name = medication.medicationCodeableConcept?.text ||
            primaryCoding?.display ||
            primaryCoding?.code ||
            'Unknown medication';
        const primaryDosage = medication.dosageInstruction?.[0];
        const dosage = primaryDosage?.text;
        const frequency = formatMedicationFrequency(primaryDosage?.timing?.repeat);
        return deepFreeze({
            id: medication.id,
            name,
            status: medication.status,
            dosage,
            frequency,
            prescribedDate: parseDate(medication.authoredOn),
        });
    }
    extractConditions(conditions) {
        return conditions.map((condition) => this.extractCondition(condition));
    }
    extractCondition(condition) {
        const coding = condition.code?.coding?.[0];
        const statusCoding = condition.clinicalStatus?.coding?.[0];
        const severityCoding = condition.severity?.coding?.[0];
        return deepFreeze({
            id: condition.id,
            code: coding?.code ?? '',
            name: coding?.display || condition.code?.text || 'Unknown condition',
            status: statusCoding?.code,
            recordedDate: parseDate(condition.recordedDate),
            severity: severityCoding?.display || condition.severity?.text,
        });
    }
    detectClinicalAlerts(vitals) {
        const alerts = [];
        if (vitals.heartRate) {
            if (vitals.heartRate.value > 100) {
                alerts.push({
                    code: 'tachycardia',
                    severity: 'warning',
                    message: `Heart rate is elevated at ${vitals.heartRate.value} ${vitals.heartRate.unit}.`,
                    observedAt: vitals.heartRate.timestamp,
                    value: vitals.heartRate.value,
                    unit: vitals.heartRate.unit,
                });
            }
            else if (vitals.heartRate.value < 50) {
                alerts.push({
                    code: 'bradycardia',
                    severity: 'warning',
                    message: `Heart rate is low at ${vitals.heartRate.value} ${vitals.heartRate.unit}.`,
                    observedAt: vitals.heartRate.timestamp,
                    value: vitals.heartRate.value,
                    unit: vitals.heartRate.unit,
                });
            }
        }
        if (vitals.bloodPressure) {
            const { systolic, diastolic, unit } = vitals.bloodPressure;
            if (systolic >= 180 || diastolic >= 120) {
                alerts.push({
                    code: 'hypertensive_crisis',
                    severity: 'critical',
                    message: `Blood pressure is critically elevated at ${systolic}/${diastolic} ${unit}.`,
                });
            }
            else if (systolic >= 140 || diastolic >= 90) {
                alerts.push({
                    code: 'hypertension',
                    severity: 'warning',
                    message: `Blood pressure is elevated at ${systolic}/${diastolic} ${unit}.`,
                });
            }
        }
        if (vitals.temperature) {
            if (vitals.temperature.value >= 39) {
                alerts.push({
                    code: 'fever',
                    severity: 'critical',
                    message: `Temperature is critically elevated at ${vitals.temperature.value} ${vitals.temperature.unit}.`,
                    observedAt: vitals.temperature.timestamp,
                    value: vitals.temperature.value,
                    unit: vitals.temperature.unit,
                });
            }
            else if (vitals.temperature.value >= 38) {
                alerts.push({
                    code: 'fever',
                    severity: 'warning',
                    message: `Temperature indicates fever at ${vitals.temperature.value} ${vitals.temperature.unit}.`,
                    observedAt: vitals.temperature.timestamp,
                    value: vitals.temperature.value,
                    unit: vitals.temperature.unit,
                });
            }
        }
        if (vitals.oxygenSaturation) {
            if (vitals.oxygenSaturation.value < 90) {
                alerts.push({
                    code: 'hypoxia',
                    severity: 'critical',
                    message: `Oxygen saturation is critically low at ${vitals.oxygenSaturation.value} ${vitals.oxygenSaturation.unit}.`,
                    observedAt: vitals.oxygenSaturation.timestamp,
                    value: vitals.oxygenSaturation.value,
                    unit: vitals.oxygenSaturation.unit,
                });
            }
            else if (vitals.oxygenSaturation.value < 94) {
                alerts.push({
                    code: 'hypoxia',
                    severity: 'warning',
                    message: `Oxygen saturation is low at ${vitals.oxygenSaturation.value} ${vitals.oxygenSaturation.unit}.`,
                    observedAt: vitals.oxygenSaturation.timestamp,
                    value: vitals.oxygenSaturation.value,
                    unit: vitals.oxygenSaturation.unit,
                });
            }
        }
        if (vitals.respiratoryRate) {
            if (vitals.respiratoryRate.value > 24) {
                alerts.push({
                    code: 'tachypnea',
                    severity: 'warning',
                    message: `Respiratory rate is elevated at ${vitals.respiratoryRate.value} ${vitals.respiratoryRate.unit}.`,
                    observedAt: vitals.respiratoryRate.timestamp,
                    value: vitals.respiratoryRate.value,
                    unit: vitals.respiratoryRate.unit,
                });
            }
            else if (vitals.respiratoryRate.value < 10) {
                alerts.push({
                    code: 'bradypnea',
                    severity: 'warning',
                    message: `Respiratory rate is low at ${vitals.respiratoryRate.value} ${vitals.respiratoryRate.unit}.`,
                    observedAt: vitals.respiratoryRate.timestamp,
                    value: vitals.respiratoryRate.value,
                    unit: vitals.respiratoryRate.unit,
                });
            }
        }
        return freezeArray(alerts);
    }
}
exports.SHARPFhirIntegration = SHARPFhirIntegration;
// ============================================================================
// FACTORY
// ============================================================================
function createSHARPFhirIntegration(config) {
    return new SHARPFhirIntegration(config);
}
// ============================================================================
// UTILITIES
// ============================================================================
function resolveConfig(config) {
    const fhirBaseUrl = config.fhirBaseUrl ?? process.env.FHIR_BASE_URL ?? DEFAULT_FHIR_BASE_URL;
    const timeout = positiveIntegerOrDefault(config.timeout, 30000);
    const maxRetries = positiveIntegerOrDefault(config.maxRetries, 3);
    const cacheTTL = positiveIntegerOrDefault(config.cacheTTL, 300000);
    const lockTTL = positiveIntegerOrDefault(config.lockTTL, 10000);
    const retryBaseDelayMs = positiveIntegerOrDefault(config.retryBaseDelayMs, 250);
    const retryMaxDelayMs = positiveIntegerOrDefault(config.retryMaxDelayMs, 5000);
    const retryJitterRatio = typeof config.retryJitterRatio === 'number' && config.retryJitterRatio >= 0 && config.retryJitterRatio <= 1
        ? config.retryJitterRatio
        : 0.2;
    if (!isNonEmptyString(fhirBaseUrl)) {
        throw new ConfigurationError('fhirBaseUrl must be a non-empty string');
    }
    const consentScopes = uniqueNonEmptyStrings(config.consentScopes?.length
        ? config.consentScopes
        : DEFAULT_CONSENT_SCOPES);
    const defaultFhirScopes = uniqueNonEmptyStrings(config.defaultFhirScopes?.length
        ? config.defaultFhirScopes
        : DEFAULT_FHIR_SCOPES);
    return deepFreeze({
        fhirBaseUrl,
        fhirToken: config.fhirToken ?? process.env.FHIR_TOKEN,
        consentScopes,
        defaultFhirScopes,
        patientId: config.patientId,
        sessionId: config.sessionId,
        timeout,
        maxRetries,
        retryBaseDelayMs,
        retryMaxDelayMs,
        retryJitterRatio,
        cacheTTL,
        lockTTL,
        sessionSecret: config.sessionSecret ??
            process.env.SHARP_SESSION_SECRET ??
            'development-only-secret',
        now: config.now ?? (() => new Date()),
    });
}
function parseWithSchema(schema, value, message) {
    const result = schema.safeParse(value);
    if (!result.success) {
        throw new ValidationError(message, {
            issues: result.error.issues,
        });
    }
    return result.data;
}
function extractBundleResources(bundle) {
    if (!isRecord(bundle) || !Array.isArray(bundle.entry)) {
        return [];
    }
    const resources = [];
    for (const entry of bundle.entry) {
        if (isRecord(entry) && 'resource' in entry) {
            resources.push(entry.resource);
        }
    }
    return resources;
}
function toError(error) {
    return error instanceof Error ? error : new Error(String(error));
}
function describeError(error) {
    return toError(error).message;
}
function isRetryableError(error) {
    if (error instanceof AuthorizationError || error instanceof ValidationError || error instanceof ResourceNotFoundError) {
        return false;
    }
    const candidate = error;
    const status = candidate?.status ?? candidate?.statusCode ?? candidate?.cause?.status ?? candidate?.cause?.statusCode;
    if (typeof status === 'number' && (status === 408 || status === 429 || status >= 500)) {
        return true;
    }
    const code = candidate?.code ?? candidate?.cause?.code;
    return code === 'ECONNRESET' ||
        code === 'ETIMEDOUT' ||
        code === 'EAI_AGAIN' ||
        code === 'ENOTFOUND' ||
        code === 'ECONNREFUSED';
}
function isNotFoundError(error) {
    const candidate = error;
    return candidate?.status === 404 ||
        candidate?.statusCode === 404 ||
        candidate?.code === 'NOT_FOUND' ||
        candidate?.message?.toLowerCase().includes('not found') === true;
}
function stableStringify(value) {
    return JSON.stringify(sortRecursively(value));
}
function sortRecursively(value) {
    if (Array.isArray(value)) {
        return value.map(sortRecursively);
    }
    if (isRecord(value)) {
        return Object.keys(value)
            .sort()
            .reduce((accumulator, key) => {
            const nested = value[key];
            if (nested !== undefined) {
                accumulator[key] = sortRecursively(nested);
            }
            return accumulator;
        }, {});
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
}
function cloneValue(value) {
    if (typeof globalThis.structuredClone === 'function') {
        return globalThis.structuredClone(value);
    }
    return value;
}
function deepFreeze(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }
    if (value instanceof Date) {
        return Object.freeze(value);
    }
    for (const nested of Object.values(value)) {
        deepFreeze(nested);
    }
    return Object.freeze(value);
}
function freezeArray(items) {
    return Object.freeze(items.slice());
}
function assertNonEmptyString(value, fieldName) {
    if (!isNonEmptyString(value)) {
        throw new ValidationError(`${fieldName} must be a non-empty string`, {
            fieldName,
            value,
        });
    }
}
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
function uniqueNonEmptyStrings(values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
function positiveIntegerOrDefault(value, fallback) {
    return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
}
function clampPositiveInteger(value, min, max) {
    if (!Number.isFinite(value)) {
        return min;
    }
    return Math.min(Math.max(Math.trunc(value), min), max);
}
function validateDateRange(dateRange) {
    if (!dateRange) {
        return;
    }
    if (!(dateRange.start instanceof Date) || Number.isNaN(dateRange.start.getTime())) {
        throw new ValidationError('dateRange.start must be a valid Date');
    }
    if (!(dateRange.end instanceof Date) || Number.isNaN(dateRange.end.getTime())) {
        throw new ValidationError('dateRange.end must be a valid Date');
    }
    if (dateRange.start.getTime() > dateRange.end.getTime()) {
        throw new ValidationError('dateRange.start must be before or equal to dateRange.end');
    }
}
function parseDate(value) {
    if (!value) {
        return undefined;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
function selectBestPatientName(names) {
    if (!names || names.length === 0) {
        return 'Unknown';
    }
    const official = names.find((name) => name.use === 'official');
    const preferred = official ?? names[0];
    return preferred.text ||
        [preferred.given?.join(' '), preferred.family].filter(Boolean).join(' ').trim() ||
        'Unknown';
}
function calculateAge(birthDate) {
    if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        return null;
    }
    const birth = new Date(`${birthDate}T00:00:00Z`);
    if (Number.isNaN(birth.getTime())) {
        return null;
    }
    const now = new Date();
    let age = now.getUTCFullYear() - birth.getUTCFullYear();
    const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) {
        age -= 1;
    }
    return age;
}
function getObservationEpochMs(observation) {
    return parseDate(observation.effectiveDateTime)?.getTime() ?? 0;
}
function toVitalReading(observation) {
    const quantity = observation.valueQuantity;
    if (!quantity) {
        return undefined;
    }
    return deepFreeze({
        value: quantity.value,
        unit: quantity.unit,
        timestamp: parseDate(observation.effectiveDateTime),
    });
}
function findObservationComponentQuantity(observation, componentCode) {
    const component = observation.component?.find((entry) => entry.code?.coding?.some((coding) => coding.code === componentCode));
    if (!component?.valueQuantity) {
        return undefined;
    }
    return {
        value: component.valueQuantity.value,
        unit: component.valueQuantity.unit,
    };
}
function formatMedicationFrequency(repeat) {
    if (!repeat?.frequency || !repeat?.period || !repeat?.periodUnit) {
        return undefined;
    }
    const periodUnit = normalizePeriodUnit(repeat.periodUnit);
    return `${repeat.frequency}x every ${repeat.period} ${periodUnit}`;
}
function normalizePeriodUnit(periodUnit) {
    switch (periodUnit) {
        case 'h':
            return 'hour(s)';
        case 'd':
            return 'day(s)';
        case 'wk':
            return 'week(s)';
        case 'mo':
            return 'month(s)';
        default:
            return periodUnit;
    }
}
function getObservationLabel(observation) {
    const coding = observation.code?.coding?.[0];
    return coding?.display || observation.code?.text || coding?.code || 'Observation';
}
function getObservationValueDescription(observation) {
    const codes = new Set((observation.code?.coding ?? []).map((coding) => coding.code).filter(isNonEmptyString));
    if (codes.has('85354-9')) {
        const systolic = findObservationComponentQuantity(observation, '8480-6');
        const diastolic = findObservationComponentQuantity(observation, '8462-4');
        if (systolic && diastolic) {
            return `${systolic.value}/${diastolic.value} ${systolic.unit}`;
        }
    }
    if (observation.valueQuantity) {
        return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
    }
    return observation.status || 'Unknown';
}
function isRecord(value) {
    return value !== null && typeof value === 'object';
}
//# sourceMappingURL=sharp-fhir-integration.js.map