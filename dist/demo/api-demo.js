"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtlasAPISystem = exports.InMemoryAuditStore = exports.TriageEngine = void 0;
exports.createApp = createApp;
exports.startServer = startServer;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const node_crypto_1 = require("node:crypto");
const APP_NAME = 'ATLAS Healthcare AI API';
const APP_VERSION = '2.0.0';
const GENESIS_HASH = '0';
const DEFAULT_DISCLAIMER = 'This tool provides triage guidance only and is not a medical diagnosis. Seek emergency care for life-threatening symptoms.';
const FOLLOW_UP_MINUTES_BY_URGENCY = {
    EMERGENT: 0,
    URGENT: 4 * 60,
    SEMI_URGENT: 24 * 60,
    ROUTINE: 3 * 24 * 60,
};
const NEGATION_PREFIXES = ['no ', 'denies ', 'without '];
function parseEnvInteger(name, fallback, min, max) {
    const raw = process.env[name];
    if (raw == null || raw.trim() === '') {
        return fallback;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
        return fallback;
    }
    return parsed;
}
function loadConfigFromEnv() {
    const corsOriginRaw = process.env.ATLAS_CORS_ORIGIN?.trim();
    const corsOrigin = corsOriginRaw && corsOriginRaw.length > 0
        ? corsOriginRaw.split(',').map((value) => value.trim())
        : true;
    return {
        port: parseEnvInteger('PORT', 3000, 1, 65535),
        jsonBodyLimit: process.env.ATLAS_JSON_LIMIT ?? '32kb',
        auditReportLimit: parseEnvInteger('ATLAS_AUDIT_REPORT_LIMIT', 20, 1, 100),
        requireExplicitConsent: process.env.ATLAS_REQUIRE_EXPLICIT_CONSENT === 'true',
        trustProxy: process.env.ATLAS_TRUST_PROXY !== 'false',
        rateLimit: {
            windowMs: parseEnvInteger('ATLAS_RATE_LIMIT_WINDOW_MS', 60000, 1000, 3600000),
            maxRequests: parseEnvInteger('ATLAS_RATE_LIMIT_MAX_REQUESTS', 20, 1, 10000),
            cleanupIntervalMs: parseEnvInteger('ATLAS_RATE_LIMIT_CLEANUP_MS', 300000, 10000, 3600000),
        },
        cors: {
            origin: corsOrigin,
            methods: ['GET', 'POST'],
            optionsSuccessStatus: 204,
        },
    };
}
function resolveConfig(overrides = {}) {
    const base = loadConfigFromEnv();
    return {
        ...base,
        ...overrides,
        rateLimit: {
            ...base.rateLimit,
            ...overrides.rateLimit,
        },
        cors: {
            ...base.cors,
            ...overrides.cors,
        },
    };
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function uniqueStrings(values) {
    return [...new Set(values.filter((value) => value.length > 0))];
}
function sha256Hex(value) {
    return (0, node_crypto_1.createHash)('sha256').update(value).digest('hex');
}
function shortHash(value) {
    return sha256Hex(value).slice(0, 12);
}
function stableStringify(value) {
    if (value === null) {
        return 'null';
    }
    if (value === undefined) {
        return 'null';
    }
    if (typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    const entries = Object.entries(value)
        .filter(([, itemValue]) => itemValue !== undefined)
        .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries
        .map(([key, itemValue]) => `${JSON.stringify(key)}:${stableStringify(itemValue)}`)
        .join(',')}}`;
}
function deepCopy(value) {
    return structuredClone(value);
}
function normalizeSymptoms(symptoms) {
    const normalized = symptoms
        .map((symptom) => symptom.trim().replace(/\s+/g, ' ').toLowerCase())
        .filter(Boolean);
    return uniqueStrings(normalized);
}
function isAffirmedSymptom(symptom) {
    return !NEGATION_PREFIXES.some((prefix) => symptom.startsWith(prefix));
}
class AppError extends Error {
    constructor(statusCode, code, message, details, options) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.expose = options?.expose ?? statusCode < 500;
    }
}
class ValidationError extends AppError {
    constructor(message, details) {
        super(400, 'VALIDATION_ERROR', message, details);
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
class SymptomMatcher {
    constructor(symptoms) {
        this.symptoms = symptoms.filter(isAffirmedSymptom);
        this.symptomText = this.symptoms.join(' | ');
    }
    hasPhrase(phrase) {
        return this.symptoms.some((symptom) => symptom.includes(phrase));
    }
    hasAny(phrases) {
        return phrases.some((phrase) => this.hasPhrase(phrase));
    }
    matched(phrases) {
        return uniqueStrings(phrases.filter((phrase) => this.hasPhrase(phrase)));
    }
    getText() {
        return this.symptomText;
    }
}
class TriageEngine {
    assess(symptoms, patientContext) {
        const normalizedSymptoms = normalizeSymptoms(symptoms);
        if (normalizedSymptoms.length === 0) {
            throw new ValidationError('At least one symptom is required');
        }
        const matcher = new SymptomMatcher(normalizedSymptoms);
        const riskProfile = this.calculateRiskProfile(patientContext);
        if (matcher.hasAny([
            'chest pain',
            'heart attack',
            'shortness of breath',
            'difficulty breathing',
            'trouble breathing',
            'fainting',
            'passed out',
            'confusion',
            'slurred speech',
            'face droop',
            'one-sided weakness',
        ]) ||
            (patientContext?.vitals?.oxygenSaturation != null && patientContext.vitals.oxygenSaturation <= 92)) {
            const redFlags = uniqueStrings([
                ...matcher.matched([
                    'chest pain',
                    'heart attack',
                    'shortness of breath',
                    'difficulty breathing',
                    'fainting',
                    'confusion',
                    'slurred speech',
                    'face droop',
                    'one-sided weakness',
                ]),
                ...(patientContext?.vitals?.oxygenSaturation != null && patientContext.vitals.oxygenSaturation <= 92
                    ? ['low oxygen saturation']
                    : []),
            ]);
            return this.buildAssessment({
                urgency: 'EMERGENT',
                pathway: 'ED',
                matchedRule: 'emergent_red_flags',
                baseConfidence: 0.86,
                riskProfile,
                normalizedSymptoms,
                reasoning: redFlags.length > 0
                    ? `Emergency symptoms detected: ${redFlags.join(', ')}. Immediate evaluation is recommended.`
                    : 'Emergency-level symptoms detected. Immediate evaluation is recommended.',
                redFlags,
                recommendations: [
                    'Call emergency services now if symptoms are severe or worsening',
                    'Go to the nearest emergency department immediately',
                    'Do not drive yourself if you feel faint, confused, or have chest pain',
                ],
                selfCareTips: ['Stay seated or lying down if dizzy', 'Keep emergency contacts nearby'],
            });
        }
        if ((matcher.hasPhrase('fever') && matcher.hasAny(['headache', 'stiff neck', 'rash'])) ||
            matcher.hasAny(['persistent vomiting', 'severe dehydration']) ||
            (matcher.hasPhrase('fever') && riskProfile.score >= 0.25)) {
            const urgentRedFlags = uniqueStrings([
                ...matcher.matched(['fever', 'headache', 'stiff neck', 'rash', 'persistent vomiting', 'severe dehydration']),
                ...riskProfile.factors,
            ]);
            return this.buildAssessment({
                urgency: 'URGENT',
                pathway: 'URGENT_CARE',
                matchedRule: 'urgent_infectious_or_systemic',
                baseConfidence: 0.76,
                riskProfile,
                normalizedSymptoms,
                reasoning: 'Symptoms suggest an urgent condition that should be evaluated promptly, especially with systemic features or elevated risk.',
                redFlags: urgentRedFlags,
                recommendations: [
                    'Seek urgent care within 4 hours',
                    'Monitor temperature and hydration',
                    'Escalate to emergency care if symptoms worsen rapidly',
                ],
                selfCareTips: ['Drink fluids if tolerated', 'Rest while arranging care'],
            });
        }
        if (riskProfile.score < 0.15 &&
            matcher.hasAny(['sneezing', 'itchy eyes', 'runny nose']) &&
            !matcher.hasAny(['fever', 'shortness of breath', 'chest pain'])) {
            return this.buildAssessment({
                urgency: 'ROUTINE',
                pathway: 'SELF_CARE',
                matchedRule: 'low_risk_allergy_like',
                baseConfidence: 0.72,
                riskProfile,
                normalizedSymptoms,
                reasoning: 'Symptoms appear low-risk and consistent with a mild allergy-like or upper-airway irritation pattern.',
                redFlags: [],
                recommendations: [
                    'Try home management and monitor symptoms',
                    'Use over-the-counter allergy support if appropriate for you',
                    'Schedule routine care if symptoms persist or change',
                ],
                selfCareTips: ['Hydrate well', 'Avoid known triggers', 'Monitor for fever or breathing difficulty'],
            });
        }
        if (matcher.hasAny(['cough', 'sore throat', 'congestion', 'runny nose'])) {
            const routineFlags = riskProfile.score >= 0.2 ? [...riskProfile.factors] : [];
            return this.buildAssessment({
                urgency: 'ROUTINE',
                pathway: 'TELEHEALTH',
                matchedRule: 'routine_respiratory',
                baseConfidence: 0.68,
                riskProfile,
                normalizedSymptoms,
                reasoning: 'Symptoms appear compatible with a mild respiratory condition that is often appropriate for telehealth follow-up.',
                redFlags: routineFlags,
                recommendations: [
                    'Schedule a telehealth appointment',
                    'Use supportive care such as rest and hydration',
                    'Escalate if breathing worsens or new high-risk symptoms appear',
                ],
                selfCareTips: ['Rest', 'Hydrate', 'Track symptom duration and fever'],
            });
        }
        return this.buildAssessment({
            urgency: 'SEMI_URGENT',
            pathway: 'PRIMARY_CARE',
            matchedRule: 'unclear_or_mixed_pattern',
            baseConfidence: 0.58,
            riskProfile,
            normalizedSymptoms,
            reasoning: 'Symptoms are not specific enough for a lower-acuity pathway and should be reviewed with a clinician.',
            redFlags: [...riskProfile.factors],
            recommendations: [
                'Arrange a primary care visit soon',
                'Prepare a clearer symptom timeline',
                'Seek urgent or emergency care if red-flag symptoms develop',
            ],
            selfCareTips: ['Track symptoms over time', 'Record temperature and heart rate if available'],
        });
    }
    calculateRiskProfile(patientContext) {
        let score = 0;
        const factors = [];
        const age = patientContext?.age;
        const hr = patientContext?.vitals?.hr;
        const tempC = patientContext?.vitals?.tempC;
        const oxygenSaturation = patientContext?.vitals?.oxygenSaturation;
        const pregnancy = patientContext?.pregnancy;
        const immunocompromised = patientContext?.immunocompromised;
        const durationHours = patientContext?.symptomDurationHours;
        if (age != null && age >= 75) {
            score += 0.22;
            factors.push('advanced age');
        }
        else if (age != null && age >= 65) {
            score += 0.12;
            factors.push('older adult');
        }
        if (hr != null && hr >= 120) {
            score += 0.25;
            factors.push('marked tachycardia');
        }
        else if (hr != null && hr >= 100) {
            score += 0.12;
            factors.push('elevated heart rate');
        }
        if (tempC != null && tempC >= 39) {
            score += 0.18;
            factors.push('high fever');
        }
        else if (tempC != null && tempC >= 38.5) {
            score += 0.1;
            factors.push('fever');
        }
        if (oxygenSaturation != null && oxygenSaturation <= 92) {
            score += 0.35;
            factors.push('low oxygen saturation');
        }
        if (pregnancy === true) {
            score += 0.08;
            factors.push('pregnancy');
        }
        if (immunocompromised === true) {
            score += 0.15;
            factors.push('immunocompromised status');
        }
        if (durationHours != null && durationHours >= 72) {
            score += 0.06;
            factors.push('symptoms lasting more than 72 hours');
        }
        return {
            score: clamp(score, 0, 1),
            factors: uniqueStrings(factors),
        };
    }
    buildAssessment(input) {
        const confidence = clamp(input.baseConfidence + input.riskProfile.score * 0.22, 0.35, 0.99);
        return {
            urgency: input.urgency,
            pathway: input.pathway,
            confidence: Number(confidence.toFixed(2)),
            riskScore: Number(input.riskProfile.score.toFixed(2)),
            reasoning: input.reasoning,
            redFlags: uniqueStrings(input.redFlags),
            recommendations: [...input.recommendations],
            selfCareTips: [...input.selfCareTips],
            suggestedFollowUpMinutes: FOLLOW_UP_MINUTES_BY_URGENCY[input.urgency],
            matchedRule: input.matchedRule,
            normalizedSymptoms: [...input.normalizedSymptoms],
            disclaimer: DEFAULT_DISCLAIMER,
        };
    }
}
exports.TriageEngine = TriageEngine;
class ConsentService {
    constructor(requireExplicitConsent) {
        this.requireExplicitConsent = requireExplicitConsent;
    }
    verify(consent) {
        const provided = consent?.provided ?? !this.requireExplicitConsent;
        const scope = consent?.scope ?? 'TRIAGE';
        if (!provided) {
            return {
                allowed: false,
                consentId: (0, node_crypto_1.randomUUID)(),
                verifiedAt: new Date().toISOString(),
                provided: false,
                scope,
                reason: 'Explicit consent is required for processing',
            };
        }
        return {
            allowed: true,
            consentId: (0, node_crypto_1.randomUUID)(),
            verifiedAt: new Date().toISOString(),
            provided: true,
            scope,
        };
    }
}
function computeAuditHash(event) {
    return sha256Hex(stableStringify({
        id: event.id,
        sequence: event.sequence,
        type: event.type,
        requestId: event.requestId,
        patientId: event.patientId,
        details: event.details,
        occurredAt: event.occurredAt,
        previousHash: event.previousHash,
    }));
}
class InMemoryAuditStore {
    constructor() {
        this.events = [];
        this.mutex = new Mutex();
    }
    async append(event) {
        return this.mutex.runExclusive(() => {
            const previousHash = this.events.at(-1)?.hash ?? GENESIS_HASH;
            const baseRecord = {
                id: (0, node_crypto_1.randomUUID)(),
                sequence: this.events.length + 1,
                type: event.type,
                requestId: event.requestId,
                patientId: event.patientId,
                details: deepCopy(event.details ?? {}),
                occurredAt: new Date().toISOString(),
                previousHash,
            };
            const storedRecord = {
                ...baseRecord,
                hash: computeAuditHash(baseRecord),
            };
            this.events.push(storedRecord);
            return deepCopy(storedRecord);
        });
    }
    async getRecent(limit) {
        return this.mutex.runExclusive(() => deepCopy(this.events.slice(-Math.max(0, limit))));
    }
    async getSummary() {
        return this.mutex.runExclusive(() => ({
            totalEvents: this.events.length,
            chainValid: true,
            latestHash: this.events.at(-1)?.hash ?? GENESIS_HASH,
        }));
    }
    async validateChain() {
        return this.mutex.runExclusive(() => {
            for (let index = 0; index < this.events.length; index += 1) {
                const current = this.events[index];
                const expectedPreviousHash = index === 0 ? GENESIS_HASH : this.events[index - 1].hash;
                const recomputedHash = computeAuditHash({
                    id: current.id,
                    sequence: current.sequence,
                    type: current.type,
                    requestId: current.requestId,
                    patientId: current.patientId,
                    details: current.details,
                    occurredAt: current.occurredAt,
                    previousHash: current.previousHash,
                });
                if (current.previousHash !== expectedPreviousHash) {
                    return {
                        valid: false,
                        totalEvents: this.events.length,
                        breakIndex: index,
                        reason: 'previousHash mismatch',
                    };
                }
                if (current.hash !== recomputedHash) {
                    return {
                        valid: false,
                        totalEvents: this.events.length,
                        breakIndex: index,
                        reason: 'hash mismatch',
                    };
                }
            }
            return {
                valid: true,
                totalEvents: this.events.length,
            };
        });
    }
}
exports.InMemoryAuditStore = InMemoryAuditStore;
class AtlasAPISystem {
    constructor(options) {
        this.triageEngine = options?.triageEngine ?? new TriageEngine();
        this.auditStore = options?.auditStore ?? new InMemoryAuditStore();
        this.consentService =
            options?.consentService ?? new ConsentService(options?.requireExplicitConsent ?? false);
    }
    previewTriage(input) {
        return this.triageEngine.assess(input.symptoms, input.patientContext);
    }
    async processPatientRequest(input) {
        const normalizedSymptoms = normalizeSymptoms(input.symptoms);
        try {
            await this.auditStore.append({
                type: 'PATIENT_INPUT',
                requestId: input.requestId,
                patientId: input.patientId,
                details: {
                    symptomCount: normalizedSymptoms.length,
                    symptoms: normalizedSymptoms,
                    hasContext: input.patientContext != null,
                },
            });
            const consent = this.consentService.verify(input.consent);
            await this.auditStore.append({
                type: 'CONSENT_VERIFIED',
                requestId: input.requestId,
                patientId: input.patientId,
                details: {
                    consentId: consent.consentId,
                    allowed: consent.allowed,
                    scope: consent.scope,
                    provided: consent.provided,
                    reason: consent.reason,
                },
            });
            if (!consent.allowed) {
                await this.auditStore.append({
                    type: 'SESSION_COMPLETE',
                    requestId: input.requestId,
                    patientId: input.patientId,
                    details: {
                        outcome: 'CONSENT_DENIED',
                    },
                });
                const audit = await this.auditStore.getSummary();
                return {
                    success: false,
                    requestId: input.requestId,
                    patientId: input.patientId,
                    code: 'CONSENT_REQUIRED',
                    message: consent.reason ?? 'Consent is required',
                    consent,
                    audit: {
                        chainValid: audit.chainValid,
                        totalEvents: audit.totalEvents,
                        latestHash: audit.latestHash,
                    },
                };
            }
            const triage = this.triageEngine.assess(normalizedSymptoms, input.patientContext);
            await this.auditStore.append({
                type: 'TRIAGE_RESULT',
                requestId: input.requestId,
                patientId: input.patientId,
                details: {
                    urgency: triage.urgency,
                    pathway: triage.pathway,
                    confidence: triage.confidence,
                    riskScore: triage.riskScore,
                    matchedRule: triage.matchedRule,
                },
            });
            const coordination = this.buildCareCoordinationPlan(triage);
            await this.auditStore.append({
                type: 'CARE_COORDINATED',
                requestId: input.requestId,
                patientId: input.patientId,
                details: {
                    pathway: coordination.pathway,
                    estimatedResponseMinutes: coordination.estimatedResponseMinutes,
                    actions: coordination.actions,
                },
            });
            await this.auditStore.append({
                type: 'SESSION_COMPLETE',
                requestId: input.requestId,
                patientId: input.patientId,
                details: {
                    outcome: 'SUCCESS',
                    urgency: triage.urgency,
                },
            });
            const audit = await this.auditStore.getSummary();
            return {
                success: true,
                requestId: input.requestId,
                patientId: input.patientId,
                triage,
                coordination,
                consent,
                audit: {
                    chainValid: audit.chainValid,
                    totalEvents: audit.totalEvents,
                    latestHash: audit.latestHash,
                },
            };
        }
        catch (error) {
            await this.auditStore.append({
                type: 'PROCESSING_ERROR',
                requestId: input.requestId,
                patientId: input.patientId,
                details: {
                    error: error instanceof Error ? error.message : String(error),
                },
            });
            throw error;
        }
    }
    async getAuditReport(limit = 10) {
        const safeLimit = clamp(limit, 1, 100);
        const [summary, validation, events] = await Promise.all([
            this.auditStore.getSummary(),
            this.auditStore.validateChain(),
            this.auditStore.getRecent(safeLimit),
        ]);
        return {
            totalEvents: summary.totalEvents,
            chainValid: validation.valid,
            latestHash: summary.latestHash,
            events: events.map((event) => ({
                sequence: event.sequence,
                type: event.type,
                occurredAt: event.occurredAt,
                requestId: event.requestId,
                patientRef: event.patientId ? shortHash(event.patientId) : undefined,
                outcome: extractAuditOutcome(event.details),
            })),
        };
    }
    async validateAuditChain() {
        return this.auditStore.validateChain();
    }
    async getSystemStatus() {
        const audit = await this.auditStore.getSummary();
        const memory = process.memoryUsage();
        return {
            status: 'ACTIVE',
            name: APP_NAME,
            version: APP_VERSION,
            now: new Date().toISOString(),
            uptimeSeconds: Math.round(process.uptime()),
            memory: {
                rssBytes: memory.rss,
                heapUsedBytes: memory.heapUsed,
                heapTotalBytes: memory.heapTotal,
                externalBytes: memory.external,
            },
            audit,
        };
    }
    buildCareCoordinationPlan(triage) {
        const templates = {
            ED: {
                nextStep: 'Immediate emergency evaluation',
                estimatedResponseMinutes: 0,
                actions: [
                    'Notify patient of emergency pathway',
                    'Advise emergency services activation',
                    'Record emergency audit trail',
                ],
                patientChecklist: [
                    'Call emergency services if symptoms are severe or worsening',
                    'Bring medication list if available',
                    'Do not drive yourself if unsafe',
                ],
            },
            URGENT_CARE: {
                nextStep: 'Urgent clinical evaluation',
                estimatedResponseMinutes: 240,
                actions: ['Notify patient', 'Recommend urgent care visit', 'Record urgency level'],
                patientChecklist: [
                    'Go to urgent care soon',
                    'Monitor symptoms while traveling',
                    'Escalate if new red flags appear',
                ],
            },
            PRIMARY_CARE: {
                nextStep: 'Primary care follow-up',
                estimatedResponseMinutes: 24 * 60,
                actions: ['Notify patient', 'Recommend clinician appointment', 'Capture symptom summary'],
                patientChecklist: [
                    'Schedule an appointment soon',
                    'Track symptom changes',
                    'Prepare medication and history list',
                ],
            },
            TELEHEALTH: {
                nextStep: 'Remote clinical review',
                estimatedResponseMinutes: 12 * 60,
                actions: ['Notify patient', 'Offer telehealth pathway', 'Provide home-monitoring advice'],
                patientChecklist: [
                    'Book telehealth visit',
                    'Track temperature and symptom duration',
                    'Seek urgent care if symptoms worsen',
                ],
            },
            SELF_CARE: {
                nextStep: 'Home management with safety-netting',
                estimatedResponseMinutes: 24 * 60,
                actions: ['Provide self-care guidance', 'Provide escalation instructions', 'Record low-risk pathway'],
                patientChecklist: [
                    'Use home care measures as appropriate',
                    'Monitor for fever, chest pain, or breathing issues',
                    'Seek care if not improving',
                ],
            },
        };
        const selected = templates[triage.pathway];
        return {
            pathway: triage.pathway,
            nextStep: selected.nextStep,
            estimatedResponseMinutes: selected.estimatedResponseMinutes,
            actions: [...selected.actions],
            patientChecklist: [...selected.patientChecklist],
            completed: true,
        };
    }
}
exports.AtlasAPISystem = AtlasAPISystem;
function extractAuditOutcome(details) {
    const candidates = ['outcome', 'result', 'urgency', 'error'];
    for (const key of candidates) {
        const value = details[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }
    return undefined;
}
class SlidingWindowRateLimiter {
    constructor(config) {
        this.config = config;
        this.hitsByKey = new Map();
        this.mutex = new Mutex();
        this.cleanupTimer = setInterval(() => {
            void this.prune();
        }, this.config.cleanupIntervalMs);
        this.cleanupTimer.unref();
    }
    async consume(key, now = Date.now()) {
        return this.mutex.runExclusive(() => {
            const windowStart = now - this.config.windowMs;
            const recentHits = (this.hitsByKey.get(key) ?? []).filter((timestamp) => timestamp > windowStart);
            if (recentHits.length >= this.config.maxRequests) {
                const oldestHit = recentHits[0];
                const retryAfterMs = Math.max(0, oldestHit + this.config.windowMs - now);
                this.hitsByKey.set(key, recentHits);
                return {
                    allowed: false,
                    limit: this.config.maxRequests,
                    remaining: 0,
                    retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
                    resetAtEpochSeconds: Math.ceil((oldestHit + this.config.windowMs) / 1000),
                };
            }
            recentHits.push(now);
            this.hitsByKey.set(key, recentHits);
            return {
                allowed: true,
                limit: this.config.maxRequests,
                remaining: Math.max(0, this.config.maxRequests - recentHits.length),
                retryAfterSeconds: 0,
                resetAtEpochSeconds: Math.ceil((recentHits[0] + this.config.windowMs) / 1000),
            };
        });
    }
    dispose() {
        clearInterval(this.cleanupTimer);
    }
    async prune(now = Date.now()) {
        await this.mutex.runExclusive(() => {
            const windowStart = now - this.config.windowMs;
            for (const [key, timestamps] of this.hitsByKey.entries()) {
                const recentHits = timestamps.filter((timestamp) => timestamp > windowStart);
                if (recentHits.length === 0) {
                    this.hitsByKey.delete(key);
                }
                else {
                    this.hitsByKey.set(key, recentHits);
                }
            }
        });
    }
}
function getClientKey(req) {
    const forwardedFor = req.header('x-forwarded-for')?.split(',')[0]?.trim();
    return forwardedFor || req.ip || req.socket.remoteAddress || 'unknown';
}
function asRecord(value, fieldName) {
    if (value == null || typeof value !== 'object' || Array.isArray(value)) {
        throw new ValidationError(`${fieldName} must be an object`);
    }
    return value;
}
function parseString(value, fieldName, minLength = 1, maxLength = 128) {
    if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) {
        throw new ValidationError(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
    }
    return trimmed;
}
function parseOptionalBoolean(value, fieldName) {
    if (value == null) {
        return undefined;
    }
    if (typeof value !== 'boolean') {
        throw new ValidationError(`${fieldName} must be a boolean`);
    }
    return value;
}
function parseOptionalNumber(value, fieldName, min, max) {
    if (value == null) {
        return undefined;
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
        throw new ValidationError(`${fieldName} must be a number between ${min} and ${max}`);
    }
    return value;
}
function parseSymptoms(value) {
    if (!Array.isArray(value)) {
        throw new ValidationError('symptoms must be an array of strings');
    }
    if (value.length === 0 || value.length > 32) {
        throw new ValidationError('symptoms must contain between 1 and 32 items');
    }
    const symptoms = value.map((item, index) => parseString(item, `symptoms[${index}]`, 1, 200));
    const normalized = normalizeSymptoms(symptoms);
    if (normalized.length === 0) {
        throw new ValidationError('symptoms must contain at least one non-empty value');
    }
    return normalized;
}
function parsePatientContext(value) {
    if (value == null) {
        return undefined;
    }
    const record = asRecord(value, 'patientContext');
    const vitalsValue = record.vitals;
    const vitalsRecord = vitalsValue == null ? undefined : asRecord(vitalsValue, 'patientContext.vitals');
    return {
        age: parseOptionalNumber(record.age, 'patientContext.age', 0, 130),
        vitals: vitalsRecord == null
            ? undefined
            : {
                bp: vitalsRecord.bp == null
                    ? undefined
                    : parseString(vitalsRecord.bp, 'patientContext.vitals.bp', 3, 20),
                hr: parseOptionalNumber(vitalsRecord.hr, 'patientContext.vitals.hr', 20, 250),
                tempC: parseOptionalNumber(vitalsRecord.tempC, 'patientContext.vitals.tempC', 30, 45),
                oxygenSaturation: parseOptionalNumber(vitalsRecord.oxygenSaturation, 'patientContext.vitals.oxygenSaturation', 50, 100),
            },
        pregnancy: parseOptionalBoolean(record.pregnancy, 'patientContext.pregnancy'),
        immunocompromised: parseOptionalBoolean(record.immunocompromised, 'patientContext.immunocompromised'),
        symptomDurationHours: parseOptionalNumber(record.symptomDurationHours, 'patientContext.symptomDurationHours', 0, 24 * 365),
    };
}
function parseConsent(value) {
    if (value == null) {
        return undefined;
    }
    const record = asRecord(value, 'consent');
    const scopeValue = record.scope;
    let scope;
    if (scopeValue != null) {
        if (scopeValue !== 'TRIAGE' && scopeValue !== 'FULL') {
            throw new ValidationError('consent.scope must be TRIAGE or FULL');
        }
        scope = scopeValue;
    }
    return {
        provided: parseOptionalBoolean(record.provided, 'consent.provided'),
        scope,
    };
}
function parseTriageRequestBody(body, requestId) {
    const record = asRecord(body, 'request body');
    return {
        requestId,
        patientId: parseString(record.patientId, 'patientId', 1, 128),
        symptoms: parseSymptoms(record.symptoms),
        patientContext: parsePatientContext(record.patientContext),
        consent: parseConsent(record.consent),
    };
}
function parsePreviewRequestBody(body, requestId) {
    const record = asRecord(body, 'request body');
    return {
        requestId,
        symptoms: parseSymptoms(record.symptoms),
        patientContext: parsePatientContext(record.patientContext),
    };
}
function parseLimitQuery(value, fallback) {
    if (typeof value !== 'string' || value.trim() === '') {
        return fallback;
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return clamp(parsed, 1, 100);
}
function asyncHandler(handler) {
    return (req, res, next) => {
        void Promise.resolve(handler(req, res, next)).catch(next);
    };
}
function createApp(options = {}) {
    const config = resolveConfig(options.config);
    const atlas = options.atlasSystem ??
        new AtlasAPISystem({
            auditStore: new InMemoryAuditStore(),
            requireExplicitConsent: config.requireExplicitConsent,
        });
    const rateLimiter = options.rateLimiter ?? new SlidingWindowRateLimiter(config.rateLimit);
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    app.set('trust proxy', config.trustProxy);
    app.locals.atlas = atlas;
    app.locals.rateLimiter = rateLimiter;
    app.use((0, cors_1.default)(config.cors));
    app.use(express_1.default.json({ limit: config.jsonBodyLimit }));
    app.use((req, res, next) => {
        req.requestId = req.header('x-request-id')?.trim() || (0, node_crypto_1.randomUUID)();
        res.setHeader('x-request-id', req.requestId);
        res.setHeader('x-content-type-options', 'nosniff');
        res.setHeader('x-frame-options', 'DENY');
        res.setHeader('referrer-policy', 'no-referrer');
        next();
    });
    const rateLimitMiddleware = asyncHandler(async (req, res, next) => {
        const decision = await rateLimiter.consume(getClientKey(req));
        res.setHeader('x-ratelimit-limit', String(decision.limit));
        res.setHeader('x-ratelimit-remaining', String(decision.remaining));
        res.setHeader('x-ratelimit-reset', String(decision.resetAtEpochSeconds));
        if (!decision.allowed) {
            res.setHeader('retry-after', String(decision.retryAfterSeconds));
            throw new AppError(429, 'RATE_LIMITED', 'Too many requests. Please retry later.', {
                retryAfterSeconds: decision.retryAfterSeconds,
            });
        }
        next();
    });
    app.get('/health', asyncHandler(async (_req, res) => {
        res.json(await atlas.getSystemStatus());
    }));
    app.get('/ready', asyncHandler(async (_req, res) => {
        const validation = await atlas.validateAuditChain();
        res.status(validation.valid ? 200 : 503).json(validation);
    }));
    app.post('/triage/preview', rateLimitMiddleware, asyncHandler(async (req, res) => {
        const requestId = req.requestId ?? (0, node_crypto_1.randomUUID)();
        const input = parsePreviewRequestBody(req.body, requestId);
        const triage = atlas.previewTriage(input);
        res.json({
            success: true,
            requestId,
            triage,
            mode: 'PREVIEW',
        });
    }));
    app.post('/triage', rateLimitMiddleware, asyncHandler(async (req, res) => {
        const requestId = req.requestId ?? (0, node_crypto_1.randomUUID)();
        const input = parseTriageRequestBody(req.body, requestId);
        const result = await atlas.processPatientRequest(input);
        res.status(result.success ? 200 : 403).json(result);
    }));
    app.get('/audit', asyncHandler(async (req, res) => {
        const limit = parseLimitQuery(req.query.limit, config.auditReportLimit);
        res.json(await atlas.getAuditReport(limit));
    }));
    app.get('/audit/validate', asyncHandler(async (_req, res) => {
        res.json(await atlas.validateAuditChain());
    }));
    app.get('/', (_req, res) => {
        res.json({
            name: APP_NAME,
            version: APP_VERSION,
            endpoints: {
                'GET /health': 'System health and summary',
                'GET /ready': 'Readiness check with full audit validation',
                'POST /triage/preview': 'Side-effect-free triage preview',
                'POST /triage': 'Process triage request and write audit trail',
                'GET /audit?limit=20': 'Privacy-aware audit summary',
                'GET /audit/validate': 'Full audit-chain validation',
            },
            requestContract: {
                triage: {
                    patientId: 'string (1..128)',
                    symptoms: ['string (1..200)'],
                    patientContext: {
                        age: 'number? (0..130)',
                        vitals: {
                            bp: 'string? (3..20)',
                            hr: 'number? (20..250)',
                            tempC: 'number? (30..45)',
                            oxygenSaturation: 'number? (50..100)',
                        },
                        pregnancy: 'boolean?',
                        immunocompromised: 'boolean?',
                        symptomDurationHours: 'number? (0..8760)',
                    },
                    consent: {
                        provided: 'boolean?',
                        scope: 'TRIAGE | FULL',
                    },
                },
            },
            features: [
                'Context-aware triage',
                'Cryptographic audit chain',
                'Privacy-aware audit summaries',
                'Sliding-window rate limiting',
                'Request correlation IDs',
                'Side-effect-free preview mode',
            ],
            security: 'SHA-256 cryptographic audit trail with linear append semantics',
        });
    });
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            requestId: req.requestId,
            code: 'NOT_FOUND',
            error: `Route not found: ${req.method} ${req.originalUrl}`,
        });
    });
    const errorHandler = (error, req, res, _next) => {
        const appError = error instanceof AppError
            ? error
            : new AppError(500, 'INTERNAL_ERROR', 'Internal server error', undefined, {
                expose: false,
                cause: error instanceof Error ? error : undefined,
            });
        if (!(error instanceof AppError)) {
            console.error(`[${req.requestId ?? 'unknown-request'}]`, error);
        }
        res.status(appError.statusCode).json({
            success: false,
            requestId: req.requestId,
            code: appError.code,
            error: appError.expose ? appError.message : 'Internal server error',
            ...(appError.expose && appError.details !== undefined ? { details: appError.details } : {}),
        });
    };
    app.use(errorHandler);
    return app;
}
async function startServer(configOverrides = {}) {
    const config = resolveConfig(configOverrides);
    const app = createApp({ config });
    const server = await new Promise((resolve) => {
        const instance = app.listen(config.port, () => resolve(instance));
    });
    const close = async () => {
        const limiter = app.locals.rateLimiter;
        limiter?.dispose();
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error != null) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    };
    console.log(`🏥 ${APP_NAME} running on port ${config.port}`);
    console.log(`📊 Health: http://localhost:${config.port}/health`);
    console.log(`🧪 Preview: http://localhost:${config.port}/triage/preview`);
    console.log(`🔍 Docs: http://localhost:${config.port}/`);
    console.log(`🔒 Audit: SHA-256 chained events`);
    console.log(`⚡ Rate limit: ${config.rateLimit.maxRequests} req / ${Math.round(config.rateLimit.windowMs / 1000)}s`);
    return {
        app,
        server,
        close,
    };
}
const isDirectRun = require.main === module;
if (isDirectRun) {
    void startServer().catch((error) => {
        console.error('Failed to start server', error);
        process.exitCode = 1;
    });
}
exports.default = createApp;
//# sourceMappingURL=api-demo.js.map