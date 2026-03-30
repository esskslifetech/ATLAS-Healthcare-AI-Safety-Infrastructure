"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtlasWithLogging = exports.MockCareCoordinator = exports.MockFhirClient = exports.MockIdentityBridge = exports.MockConsentEngine = exports.MockTriageAgent = void 0;
exports.demonstrateAtlasWithLogging = demonstrateAtlasWithLogging;
const node_crypto_1 = require("node:crypto");
const verification_logger_1 = require("./verification-logger");
const AtlasLoggerCtor = verification_logger_1.AtlasLogger;
const MockAuditLoggerCtor = verification_logger_1.MockAuditLogger;
const APP_NAME = 'ATLAS with Verification Logger';
const APP_VERSION = '2.0.0';
const DEFAULT_CONFIG = {
    defaultTimeoutMs: 2500,
    maxAuditEventsInReport: 50,
    batchConcurrency: 4,
    requestedResources: ['Patient', 'Condition', 'MedicationRequest'],
};
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function clampInteger(value, min, max) {
    return Math.min(max, Math.max(min, Math.trunc(value)));
}
function truncate(value, maxLength = 160) {
    return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}
function sanitizeInlineText(value) {
    return value.replace(/\s+/g, ' ').trim();
}
function normalizeSymptoms(symptoms) {
    return [...new Set(symptoms.map((item) => sanitizeInlineText(item).toLowerCase()).filter(Boolean))];
}
function createPatientReference(patientId) {
    const digest = (0, node_crypto_1.createHash)('sha256').update(patientId).digest('hex').slice(0, 12);
    return `patient_${digest}`;
}
function nowIsoString() {
    return new Date().toISOString();
}
function summarizeError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
function createSkippedResource(resourceType, patientId) {
    return {
        resourceType,
        id: patientId,
        requested: false,
        available: false,
        summary: `Skipped ${resourceType} read`,
        fetchedAt: nowIsoString(),
    };
}
function assertValidPatientId(patientId) {
    const normalized = sanitizeInlineText(patientId);
    if (normalized.length < 1 || normalized.length > 128) {
        throw new AtlasError('VALIDATION_ERROR', 'patientId must be between 1 and 128 characters');
    }
}
function assertValidSymptoms(symptoms) {
    if (!Array.isArray(symptoms)) {
        throw new AtlasError('VALIDATION_ERROR', 'symptoms must be an array');
    }
    if (symptoms.length < 1 || symptoms.length > 32) {
        throw new AtlasError('VALIDATION_ERROR', 'symptoms must contain between 1 and 32 items');
    }
    for (const symptom of symptoms) {
        if (typeof symptom !== 'string') {
            throw new AtlasError('VALIDATION_ERROR', 'each symptom must be a string');
        }
        const normalized = sanitizeInlineText(symptom);
        if (normalized.length < 1 || normalized.length > 200) {
            throw new AtlasError('VALIDATION_ERROR', 'each symptom must be between 1 and 200 characters');
        }
    }
}
function assertValidRequestedResources(resourceTypes) {
    const validValues = new Set(['Patient', 'Condition', 'MedicationRequest']);
    for (const resourceType of resourceTypes) {
        if (!validValues.has(resourceType)) {
            throw new AtlasError('VALIDATION_ERROR', `unsupported resource type: ${resourceType}`);
        }
    }
}
function withTimeout(promise, timeoutMs, label) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
        return promise;
    }
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new AtlasError('TIMEOUT', `${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        timer.unref?.();
        promise.then((value) => {
            clearTimeout(timer);
            resolve(value);
        }, (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}
class AtlasError extends Error {
    constructor(code, message, options) {
        super(message);
        this.code = code;
    }
}
class Mutex {
    constructor() {
        this.tail = Promise.resolve();
    }
    async runExclusive(work) {
        const previous = this.tail;
        let release;
        this.tail = new Promise((resolve) => {
            release = resolve;
        });
        await previous;
        try {
            return await work();
        }
        finally {
            release();
        }
    }
}
class VerificationLogGateway {
    constructor(logger, auditLogger) {
        this.logger = logger;
        this.auditLogger = auditLogger;
        this.mutex = new Mutex();
    }
    async info(context, module, action, result) {
        await this.safeWrite(() => {
            this.logger.log(module, action, this.formatPayload(context, result));
        });
    }
    async error(context, module, action, error) {
        await this.safeWrite(() => {
            this.logger.error(module, action, this.formatPayload(context, error));
        });
    }
    async getAuditReport(limit = 25) {
        const safeLimit = clampInteger(limit, 1, 1000);
        try {
            return await this.mutex.runExclusive(() => {
                const rawEvents = [...this.auditLogger.getEvents()];
                const validation = normalizeAuditValidation(this.auditLogger.validateChain(), rawEvents.length);
                return {
                    totalEvents: rawEvents.length,
                    chainValid: validation.valid,
                    breakIndex: validation.breakIndex,
                    events: rawEvents.slice(-safeLimit).map((event, index) => normalizeAuditEvent(event, rawEvents.length - Math.min(rawEvents.length, safeLimit) + index + 1)),
                };
            });
        }
        catch (error) {
            return {
                totalEvents: 0,
                chainValid: false,
                events: [
                    {
                        index: 1,
                        type: 'SYSTEM_ERROR',
                        step: 'N/A',
                        module: 'audit',
                        action: 'REPORT',
                        result: `Failed to build audit report: ${summarizeError(error)}`,
                    },
                ],
            };
        }
    }
    async validateChain() {
        try {
            return await this.mutex.runExclusive(() => normalizeAuditValidation(this.auditLogger.validateChain(), this.auditLogger.getEvents().length));
        }
        catch {
            return { valid: false };
        }
    }
    async safeWrite(write) {
        try {
            await this.mutex.runExclusive(write);
        }
        catch (error) {
            console.error('[atlas-logging] logger write failure:', error);
        }
    }
    formatPayload(context, text) {
        return truncate(`${sanitizeInlineText(text)} | req=${context.requestId} | patient=${context.patientRef}`);
    }
}
function normalizeAuditValidation(value, totalEvents) {
    if (!isRecord(value) || typeof value.valid !== 'boolean') {
        return {
            valid: false,
            totalEvents,
        };
    }
    const breakIndex = typeof value.breakIndex === 'number' && Number.isFinite(value.breakIndex)
        ? value.breakIndex
        : undefined;
    const reportedTotal = typeof value.totalEvents === 'number' && Number.isFinite(value.totalEvents)
        ? value.totalEvents
        : totalEvents;
    return {
        valid: value.valid,
        breakIndex,
        totalEvents: reportedTotal,
    };
}
function normalizeAuditEvent(value, index) {
    if (!isRecord(value)) {
        return {
            index,
            type: 'UNKNOWN',
            step: String(index),
            module: 'unknown',
            action: 'unknown',
            result: 'Unrecognized audit event shape',
        };
    }
    const readString = (key, fallback) => {
        const rawValue = value[key];
        return typeof rawValue === 'string' && rawValue.length > 0 ? rawValue : fallback;
    };
    const result = typeof value.result === 'string'
        ? value.result
        : typeof value.error === 'string'
            ? value.error
            : 'N/A';
    const hashPrefix = typeof value.currentHash === 'string' && value.currentHash.length > 0
        ? value.currentHash.slice(0, 12)
        : undefined;
    const timestamp = typeof value.timestamp === 'string'
        ? value.timestamp
        : typeof value.occurredAt === 'string'
            ? value.occurredAt
            : undefined;
    return {
        index,
        type: readString('type', 'UNKNOWN'),
        step: typeof value.step === 'string'
            ? value.step
            : typeof value.step === 'number'
                ? String(value.step)
                : String(index),
        module: readString('module', 'unknown'),
        action: readString('action', 'unknown'),
        result: truncate(result, 180),
        timestamp,
        hashPrefix,
    };
}
class MockTriageAgent {
    async assessTriage(symptoms) {
        const normalizedSymptoms = normalizeSymptoms(symptoms);
        const has = (phrase) => normalizedSymptoms.some((symptom) => symptom.includes(phrase));
        if (has('chest pain') || has('shortness of breath') || has('difficulty breathing')) {
            return {
                urgency: 'EMERGENT',
                pathway: 'ED',
                confidence: 0.92,
                reasoning: 'Emergency cardiopulmonary symptoms require immediate evaluation.',
                redFlags: ['chest pain', 'shortness of breath'],
                recommendations: [
                    'Call emergency services immediately',
                    'Go to the nearest emergency department',
                    'Do not drive yourself if symptoms are severe',
                ],
            };
        }
        if (has('fever') && (has('headache') || has('stiff neck'))) {
            return {
                urgency: 'URGENT',
                pathway: 'URGENT_CARE',
                confidence: 0.83,
                reasoning: 'Fever with concerning associated symptoms needs prompt evaluation.',
                redFlags: ['fever', 'headache'],
                recommendations: [
                    'Seek urgent care as soon as possible',
                    'Monitor temperature and hydration',
                    'Escalate immediately if symptoms worsen',
                ],
            };
        }
        if (has('runny nose') || has('itchy eyes') || has('sneezing')) {
            return {
                urgency: 'ROUTINE',
                pathway: 'SELF_CARE',
                confidence: 0.74,
                reasoning: 'Symptoms appear mild and compatible with self-care first.',
                redFlags: [],
                recommendations: [
                    'Hydrate and rest',
                    'Avoid triggers when known',
                    'Seek care if symptoms persist or worsen',
                ],
            };
        }
        if (has('cough') || has('sore throat') || has('congestion')) {
            return {
                urgency: 'ROUTINE',
                pathway: 'TELEHEALTH',
                confidence: 0.71,
                reasoning: 'Symptoms are appropriate for telehealth follow-up in most cases.',
                redFlags: [],
                recommendations: [
                    'Schedule telehealth evaluation',
                    'Rest and hydrate',
                    'Monitor for breathing difficulty or high fever',
                ],
            };
        }
        return {
            urgency: 'SEMI_URGENT',
            pathway: 'PRIMARY_CARE',
            confidence: 0.61,
            reasoning: 'Symptoms are not highly specific and should be reviewed clinically.',
            redFlags: [],
            recommendations: [
                'Arrange a primary care appointment',
                'Track symptom changes',
                'Escalate if red-flag symptoms appear',
            ],
        };
    }
}
exports.MockTriageAgent = MockTriageAgent;
class MockConsentEngine {
    async verifyConsent(patientId) {
        const denied = patientId.toLowerCase().startsWith('deny-') ||
            patientId.toLowerCase().includes('no-consent');
        if (denied) {
            return {
                allowed: false,
                grantedScope: [],
                reason: 'Consent not granted for requested workflow',
            };
        }
        return {
            allowed: true,
            grantedScope: ['read_conditions', 'read_medications', 'read_observations'],
        };
    }
}
exports.MockConsentEngine = MockConsentEngine;
class MockIdentityBridge {
    async acquireToken(patientId) {
        const tokenSeed = (0, node_crypto_1.createHash)('sha256')
            .update(`${patientId}:${Date.now()}:${(0, node_crypto_1.randomUUID)()}`)
            .digest('hex')
            .slice(0, 24);
        return {
            accessToken: `mock_token_${tokenSeed}`,
            expiresInSeconds: 3600,
            issuedAt: nowIsoString(),
        };
    }
}
exports.MockIdentityBridge = MockIdentityBridge;
class MockFhirClient {
    async readResource(resourceType, patientId, _token) {
        return {
            resourceType,
            id: patientId,
            requested: true,
            available: true,
            summary: `Mock ${resourceType} data loaded for ${createPatientReference(patientId)}`,
            fetchedAt: nowIsoString(),
        };
    }
}
exports.MockFhirClient = MockFhirClient;
class MockCareCoordinator {
    async coordinateCare(triageResult) {
        const templates = {
            ED: {
                actions: ['Notify patient urgently', 'Escalate to emergency services', 'Record emergency route'],
                patientMessage: 'Immediate emergency evaluation is recommended.',
                providerDisposition: 'EMERGENCY_ESCALATION',
            },
            URGENT_CARE: {
                actions: ['Notify patient', 'Recommend urgent care visit', 'Record urgent route'],
                patientMessage: 'Please seek urgent care promptly.',
                providerDisposition: 'URGENT_PROVIDER_ALERT',
            },
            PRIMARY_CARE: {
                actions: ['Notify patient', 'Suggest clinician follow-up', 'Record primary-care route'],
                patientMessage: 'Please schedule prompt primary care follow-up.',
                providerDisposition: 'PCP_NOTIFIED',
            },
            TELEHEALTH: {
                actions: ['Notify patient', 'Suggest telehealth booking', 'Record telehealth route'],
                patientMessage: 'A telehealth visit is a reasonable next step.',
                providerDisposition: 'REMOTE_REVIEW_REQUESTED',
            },
            SELF_CARE: {
                actions: ['Notify patient', 'Provide self-care guidance', 'Record low-acuity route'],
                patientMessage: 'Home care is reasonable with safety monitoring.',
                providerDisposition: 'NO_PROVIDER_ESCALATION',
            },
        };
        const selected = templates[triageResult.pathway];
        return {
            pathway: triageResult.pathway,
            actions: selected.actions,
            patientMessage: selected.patientMessage,
            providerDisposition: selected.providerDisposition,
            completed: true,
        };
    }
}
exports.MockCareCoordinator = MockCareCoordinator;
class AtlasWithLogging {
    constructor(options = {}) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...options.config,
            requestedResources: options.config?.requestedResources ?? DEFAULT_CONFIG.requestedResources,
        };
        this.auditLogger = options.auditLogger ?? new MockAuditLoggerCtor();
        const logger = options.logger ?? new AtlasLoggerCtor(this.auditLogger);
        this.triageAgent = options.triageAgent ?? new MockTriageAgent();
        this.consentEngine = options.consentEngine ?? new MockConsentEngine();
        this.identityBridge = options.identityBridge ?? new MockIdentityBridge();
        this.fhirClient = options.fhirClient ?? new MockFhirClient();
        this.careCoordinator = options.careCoordinator ?? new MockCareCoordinator();
        this.logGateway = new VerificationLogGateway(logger, this.auditLogger);
    }
    async previewTriage(symptoms) {
        assertValidSymptoms(symptoms);
        return this.triageAgent.assessTriage(normalizeSymptoms(symptoms));
    }
    async processPatientRequest(patientId, symptoms, options = {}) {
        const startedAtMs = Date.now();
        const requestContext = {
            requestId: options.requestId ?? (0, node_crypto_1.randomUUID)(),
            patientId,
            patientRef: createPatientReference(patientId),
            startedAtMs,
        };
        try {
            assertValidPatientId(patientId);
            assertValidSymptoms(symptoms);
            const normalizedSymptoms = normalizeSymptoms(symptoms);
            const requestedResources = options.requestedResources ?? this.config.requestedResources;
            assertValidRequestedResources(requestedResources);
            await this.logGateway.info(requestContext, 'system', 'SESSION_START', 'BEGIN');
            await this.logGateway.info(requestContext, 'proxy', 'PATIENT_INPUT', `received_${normalizedSymptoms.length}_symptoms (${truncate(normalizedSymptoms.join(', '), 80)})`);
            const consent = await this.runLoggedStep(requestContext, 'consent', 'VERIFY', () => this.consentEngine.verifyConsent(patientId), {
                timeoutMs: options.timeoutMs,
                successText: (result) => (result.allowed ? 'SUCCESS' : 'DENIED'),
            });
            if (!consent.allowed) {
                await this.logGateway.error(requestContext, 'system', 'ACCESS_DENIED', consent.reason ?? 'Consent denied');
                await this.logGateway.info(requestContext, 'system', 'COMPLETE', 'DENIED');
                const auditReport = await this.logGateway.getAuditReport(1);
                return {
                    success: false,
                    requestId: requestContext.requestId,
                    patientRef: requestContext.patientRef,
                    code: 'CONSENT_DENIED',
                    error: consent.reason ?? 'Consent denied',
                    audit: {
                        valid: auditReport.chainValid,
                        totalEvents: auditReport.totalEvents,
                    },
                    durationMs: Date.now() - startedAtMs,
                };
            }
            const clinicalContext = await this.fetchClinicalContext(requestContext, patientId, requestedResources, options.timeoutMs);
            const triageResult = await this.runLoggedStep(requestContext, 'triage', 'CLASSIFY', () => this.triageAgent.assessTriage(normalizedSymptoms, clinicalContext), {
                timeoutMs: options.timeoutMs,
                successText: (result) => `${result.urgency} (${result.confidence.toFixed(2)})`,
            });
            const coordination = await this.runLoggedStep(requestContext, 'coordinator', 'COORDINATE', () => this.careCoordinator.coordinateCare(triageResult), {
                timeoutMs: options.timeoutMs,
                successText: (result) => result.pathway,
            });
            await this.logGateway.info(requestContext, 'proxy', 'NOTIFY_PATIENT', coordination.patientMessage);
            await this.logGateway.info(requestContext, 'system', 'NOTIFY_PROVIDER', coordination.providerDisposition);
            const preValidation = await this.logGateway.validateChain();
            await this.logGateway.info(requestContext, 'audit', 'VERIFY_CHAIN', preValidation.valid ? 'HASH_OK' : 'HASH_BROKEN');
            await this.logGateway.info(requestContext, 'system', 'COMPLETE', 'SUCCESS');
            const finalAuditReport = await this.logGateway.getAuditReport(1);
            const availableResources = Object.values(clinicalContext.resources)
                .filter((resource) => resource.available)
                .map((resource) => resource.resourceType);
            const degradedResources = Object.values(clinicalContext.resources)
                .filter((resource) => resource.requested && !resource.available)
                .map((resource) => resource.resourceType);
            const durationMs = Date.now() - startedAtMs;
            return {
                success: true,
                requestId: requestContext.requestId,
                patientRef: requestContext.patientRef,
                triage: triageResult,
                coordination,
                clinicalContext: {
                    tokenExpiresInSeconds: clinicalContext.tokenExpiresInSeconds,
                    availableResources,
                    degradedResources,
                },
                audit: {
                    valid: finalAuditReport.chainValid,
                    totalEvents: finalAuditReport.totalEvents,
                },
                durationMs,
                summary: this.summarizeSuccessfulOutcome(triageResult, coordination, durationMs),
            };
        }
        catch (error) {
            await this.logGateway.error(requestContext, 'system', 'PROCESSING_ERROR', summarizeError(error));
            const auditReport = await this.logGateway.getAuditReport(1);
            const durationMs = Date.now() - startedAtMs;
            const code = error instanceof AtlasError ? error.code : 'PROCESSING_ERROR';
            return {
                success: false,
                requestId: requestContext.requestId,
                patientRef: requestContext.patientRef,
                code,
                error: summarizeError(error),
                audit: {
                    valid: auditReport.chainValid,
                    totalEvents: auditReport.totalEvents,
                },
                durationMs,
            };
        }
    }
    async processBatchRequests(requests, concurrency = this.config.batchConcurrency) {
        if (requests.length === 0) {
            return [];
        }
        const safeConcurrency = clampInteger(concurrency, 1, 32);
        const results = new Array(requests.length);
        let nextIndex = 0;
        const worker = async () => {
            while (true) {
                const index = nextIndex;
                nextIndex += 1;
                if (index >= requests.length) {
                    return;
                }
                const request = requests[index];
                results[index] = await this.processPatientRequest(request.patientId, request.symptoms, request.options);
            }
        };
        await Promise.all(Array.from({ length: Math.min(safeConcurrency, requests.length) }, () => worker()));
        return results;
    }
    async getAuditReport(limit = this.config.maxAuditEventsInReport) {
        return this.logGateway.getAuditReport(limit);
    }
    async getSystemSnapshot() {
        const auditReport = await this.getAuditReport(this.config.maxAuditEventsInReport);
        const recentModuleCounts = {};
        for (const event of auditReport.events) {
            recentModuleCounts[event.module] = (recentModuleCounts[event.module] ?? 0) + 1;
        }
        return {
            name: APP_NAME,
            version: APP_VERSION,
            generatedAt: nowIsoString(),
            audit: {
                totalEvents: auditReport.totalEvents,
                chainValid: auditReport.chainValid,
            },
            recentModuleCounts,
        };
    }
    summarizeResult(result) {
        if (!result.success) {
            return `FAILED | code=${result.code} | audit=${result.audit.valid ? 'VALID' : 'BROKEN'} | ${result.durationMs}ms`;
        }
        return `${result.triage.urgency} → ${result.triage.pathway} | confidence=${result.triage.confidence.toFixed(2)} | audit=${result.audit.valid ? 'VALID' : 'BROKEN'} | ${result.durationMs}ms`;
    }
    async fetchClinicalContext(context, patientId, requestedResources, timeoutMs) {
        const requestedSet = new Set(requestedResources);
        const token = await this.runLoggedStep(context, 'identity', 'TOKEN_ACQUIRE', () => this.identityBridge.acquireToken(patientId), {
            timeoutMs,
            successText: 'SUCCESS',
        });
        const patientResource = requestedSet.has('Patient')
            ? await this.runLoggedStep(context, 'fhir', 'READ_Patient', () => this.fhirClient.readResource('Patient', patientId, token), {
                timeoutMs,
                successText: 'SUCCESS',
            })
            : createSkippedResource('Patient', patientId);
        const [conditionResource, medicationResource] = await Promise.all([
            requestedSet.has('Condition')
                ? this.readBestEffortResource(context, 'Condition', patientId, token, timeoutMs)
                : Promise.resolve(createSkippedResource('Condition', patientId)),
            requestedSet.has('MedicationRequest')
                ? this.readBestEffortResource(context, 'MedicationRequest', patientId, token, timeoutMs)
                : Promise.resolve(createSkippedResource('MedicationRequest', patientId)),
        ]);
        return {
            tokenExpiresInSeconds: token.expiresInSeconds,
            resources: {
                Patient: patientResource,
                Condition: conditionResource,
                MedicationRequest: medicationResource,
            },
        };
    }
    async readBestEffortResource(context, resourceType, patientId, token, timeoutMs) {
        const action = `READ_${resourceType}`;
        try {
            return await this.runLoggedStep(context, 'fhir', action, () => this.fhirClient.readResource(resourceType, patientId, token), {
                timeoutMs,
                successText: 'SUCCESS',
            });
        }
        catch (error) {
            await this.logGateway.info(context, 'fhir', action, `DEGRADED (${truncate(summarizeError(error), 80)})`);
            return {
                resourceType,
                id: patientId,
                requested: true,
                available: false,
                summary: `Unavailable: ${summarizeError(error)}`,
                fetchedAt: nowIsoString(),
            };
        }
    }
    async runLoggedStep(context, module, action, work, options) {
        await this.logGateway.info(context, module, action, 'PROCESSING');
        try {
            const timeoutMs = options.timeoutMs ?? this.config.defaultTimeoutMs;
            const result = await withTimeout(work(), timeoutMs, `${module}.${action}`);
            const successText = typeof options.successText === 'function'
                ? options.successText(result)
                : options.successText;
            await this.logGateway.info(context, module, action, successText);
            return result;
        }
        catch (error) {
            await this.logGateway.error(context, module, `${action}_ERROR`, summarizeError(error));
            throw error;
        }
    }
    summarizeSuccessfulOutcome(triageResult, coordination, durationMs) {
        return `${triageResult.urgency} triage routed to ${coordination.pathway} in ${durationMs}ms`;
    }
}
exports.AtlasWithLogging = AtlasWithLogging;
async function demonstrateAtlasWithLogging() {
    console.log('🏥 ATLAS WITH VERIFICATION LOGGER - COMPLETE DEMONSTRATION');
    console.log('='.repeat(72));
    const atlas = new AtlasWithLogging();
    const scenarios = [
        {
            label: '🔴 TEST CASE 1: EMERGENCY CHEST PAIN',
            patientId: 'maria-123',
            symptoms: ['chest pain', '2 hours', 'sweating'],
        },
        {
            label: '🟠 TEST CASE 2: URGENT FEVER + HEADACHE',
            patientId: 'sam-urgent-001',
            symptoms: ['fever', 'headache', 'fatigue'],
        },
        {
            label: '🟢 TEST CASE 3: ROUTINE COUGH',
            patientId: 'john-456',
            symptoms: ['mild cough', '2 days'],
        },
        {
            label: '⚪ TEST CASE 4: DENIED CONSENT',
            patientId: 'deny-lina-789',
            symptoms: ['sore throat'],
        },
    ];
    for (const scenario of scenarios) {
        console.log(`\n${scenario.label}`);
        console.log('-'.repeat(72));
        const result = await atlas.processPatientRequest(scenario.patientId, scenario.symptoms);
        console.log(`Request: ${result.requestId}`);
        console.log(`Patient Ref: ${result.patientRef}`);
        console.log(`Summary: ${atlas.summarizeResult(result)}`);
        if (result.success) {
            console.log(`Triage: ${result.triage.urgency} → ${result.triage.pathway}`);
            console.log(`Reasoning: ${result.triage.reasoning}`);
            console.log(`Audit Valid: ${result.audit.valid}`);
            console.log(`Available Resources: ${result.clinicalContext.availableResources.join(', ') || 'None'}`);
            console.log(`Recommendations: ${result.triage.recommendations.join(' | ')}`);
        }
        else {
            console.log(`Failure Code: ${result.code}`);
            console.log(`Error: ${result.error}`);
            console.log(`Audit Valid: ${result.audit.valid}`);
        }
    }
    console.log('\n🧪 PREVIEW TRIAGE FEATURE');
    console.log('-'.repeat(72));
    const preview = await atlas.previewTriage(['itchy eyes', 'runny nose']);
    console.log(`Preview: ${preview.urgency} → ${preview.pathway} (${preview.confidence.toFixed(2)})`);
    console.log('\n🔒 AUDIT REPORT');
    console.log('-'.repeat(72));
    const auditReport = await atlas.getAuditReport(20);
    console.log(`Total audit events: ${auditReport.totalEvents}`);
    console.log(`Chain integrity: ${auditReport.chainValid ? '✅ VALID' : '❌ BROKEN'}`);
    console.table(auditReport.events.map((event) => ({
        '#': event.index,
        step: event.step,
        module: event.module,
        action: event.action,
        result: event.result,
        hash: event.hashPrefix ?? 'n/a',
    })));
    console.log('\n📊 SYSTEM SNAPSHOT');
    console.log('-'.repeat(72));
    const snapshot = await atlas.getSystemSnapshot();
    console.log(JSON.stringify(snapshot, null, 2));
    console.log('\n🎯 VERIFICATION LOGGER IMPACT');
    console.log('-'.repeat(72));
    console.log('✅ Clear, step-by-step traceability');
    console.log('✅ Typed, maintainable orchestration');
    console.log('✅ Concurrency-safe audit/log access');
    console.log('✅ Graceful degradation for optional FHIR reads');
    console.log('✅ Privacy-safer patient references');
    console.log('✅ Useful preview and batch capabilities');
    return atlas;
}
const isDirectRun = require.main === module;
if (isDirectRun) {
    void demonstrateAtlasWithLogging().catch((error) => {
        console.error('ATLAS demonstration failed:', error);
        process.exitCode = 1;
    });
}
exports.default = AtlasWithLogging;
//# sourceMappingURL=atlas-with-logging.js.map