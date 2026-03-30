import cors, { type CorsOptions } from 'cors';
import express, {
  type ErrorRequestHandler,
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { type Server } from 'node:http';

const APP_NAME = 'ATLAS Verifiable Healthcare AI API';
const APP_VERSION = '2.0.0';
const GENESIS_HASH = '0';
const DEFAULT_DISCLAIMER =
  'This tool provides triage guidance only and is not a medical diagnosis. Seek emergency care for life-threatening symptoms.';

type Urgency = 'EMERGENT' | 'URGENT' | 'SEMI_URGENT' | 'ROUTINE';
type CarePathway = 'ED' | 'URGENT_CARE' | 'PRIMARY_CARE' | 'TELEHEALTH' | 'SELF_CARE';
type ConsentScope = 'TRIAGE' | 'FULL';

type AuditEventType =
  | 'PATIENT_INPUT'
  | 'CONSENT_VERIFIED'
  | 'TRIAGE_RESULT'
  | 'CARE_COORDINATED'
  | 'SESSION_COMPLETE'
  | 'PROCESSING_ERROR';

interface VitalSigns {
  readonly bp?: string;
  readonly hr?: number;
  readonly tempC?: number;
  readonly oxygenSaturation?: number;
}

interface PatientContext {
  readonly age?: number;
  readonly vitals?: VitalSigns;
  readonly pregnancy?: boolean;
  readonly immunocompromised?: boolean;
  readonly symptomDurationHours?: number;
}

interface ConsentInput {
  readonly provided?: boolean;
  readonly scope?: ConsentScope;
}

interface ProcessPatientRequestInput {
  readonly requestId: string;
  readonly patientId: string;
  readonly symptoms: readonly string[];
  readonly patientContext?: PatientContext;
  readonly consent?: ConsentInput;
}

interface PreviewTriageInput {
  readonly requestId: string;
  readonly symptoms: readonly string[];
  readonly patientContext?: PatientContext;
}

interface RiskProfile {
  readonly score: number;
  readonly factors: readonly string[];
}

interface TriageAssessment {
  readonly urgency: Urgency;
  readonly pathway: CarePathway;
  readonly confidence: number;
  readonly riskScore: number;
  readonly reasoning: string;
  readonly redFlags: readonly string[];
  readonly recommendations: readonly string[];
  readonly selfCareTips: readonly string[];
  readonly suggestedFollowUpMinutes: number;
  readonly matchedRule: string;
  readonly normalizedSymptoms: readonly string[];
  readonly disclaimer: string;
}

interface CareCoordinationPlan {
  readonly pathway: CarePathway;
  readonly nextStep: string;
  readonly estimatedResponseMinutes: number;
  readonly actions: readonly string[];
  readonly patientChecklist: readonly string[];
  readonly completed: true;
}

interface ConsentResult {
  readonly allowed: boolean;
  readonly consentId: string;
  readonly verifiedAt: string;
  readonly provided: boolean;
  readonly scope: ConsentScope;
  readonly reason?: string;
}

interface TriageSuccessResponse {
  readonly success: true;
  readonly requestId: string;
  readonly patientId: string;
  readonly triage: TriageAssessment;
  readonly coordination: CareCoordinationPlan;
  readonly consent: ConsentResult;
  readonly audit: {
    readonly chainValid: boolean;
    readonly totalEvents: number;
    readonly latestHash: string;
  };
}

interface TriageDeniedResponse {
  readonly success: false;
  readonly requestId: string;
  readonly patientId: string;
  readonly code: 'CONSENT_REQUIRED';
  readonly message: string;
  readonly consent: ConsentResult;
  readonly audit: {
    readonly chainValid: boolean;
    readonly totalEvents: number;
    readonly latestHash: string;
  };
}

type ProcessPatientRequestResponse = TriageSuccessResponse | TriageDeniedResponse;

interface AuditEventInput {
  readonly type: AuditEventType;
  readonly requestId: string;
  readonly patientId?: string;
  readonly details?: Record<string, unknown>;
}

interface AuditEventRecord {
  readonly id: string;
  readonly sequence: number;
  readonly type: AuditEventType;
  readonly requestId: string;
  readonly patientId?: string;
  readonly details: Record<string, unknown>;
  readonly occurredAt: string;
  readonly previousHash: string;
  readonly hash: string;
}

type AuditValidationResult =
  | {
      readonly valid: true;
      readonly totalEvents: number;
    }
  | {
      readonly valid: false;
      readonly totalEvents: number;
      readonly breakIndex: number;
      readonly reason: string;
    };

interface AuditSummary {
  readonly totalEvents: number;
  readonly chainValid: boolean;
  readonly latestHash: string;
}

/**
 * Contract for any audit repository, including external transactional stores.
 *
 * Concurrency contract:
 * - append() must be linearizable
 * - sequence numbers must be unique and monotonic
 * - previousHash must reference the immediately previous committed event
 *
 * For PostgreSQL/SQLite/etc., implement append() inside a transaction.
 */
export interface AuditStore {
  append(event: AuditEventInput): Promise<AuditEventRecord>;
  getRecent(limit: number): Promise<readonly AuditEventRecord[]>;
  getSummary(): Promise<AuditSummary>;
  validateChain(): Promise<AuditValidationResult>;
}

interface RateLimitConfig {
  readonly windowMs: number;
  readonly maxRequests: number;
  readonly cleanupIntervalMs: number;
}

interface AtlasConfig {
  readonly port: number;
  readonly jsonBodyLimit: string;
  readonly auditReportLimit: number;
  readonly requireExplicitConsent: boolean;
  readonly trustProxy: boolean;
  readonly rateLimit: RateLimitConfig;
  readonly cors: CorsOptions;
}

interface CreateAppOptions {
  readonly config?: Partial<AtlasConfig>;
  readonly atlasSystem?: AtlasAPISystem;
  readonly rateLimiter?: SlidingWindowRateLimiter;
}

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const FOLLOW_UP_MINUTES_BY_URGENCY = {
  EMERGENT: 0,
  URGENT: 4 * 60,
  SEMI_URGENT: 24 * 60,
  ROUTINE: 3 * 24 * 60,
} satisfies Record<Urgency, number>;

const NEGATION_PREFIXES = ['no ', 'denies ', 'without '] as const;

function parseEnvInteger(name: string, fallback: number, min: number, max: number): number {
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

function loadConfigFromEnv(): AtlasConfig {
  const corsOriginRaw = process.env.ATLAS_CORS_ORIGIN?.trim();
  const corsOrigin =
    corsOriginRaw && corsOriginRaw.length > 0
      ? corsOriginRaw.split(',').map((value) => value.trim())
      : true;

  return {
    port: parseEnvInteger('PORT', 3000, 1, 65535),
    jsonBodyLimit: process.env.ATLAS_JSON_LIMIT ?? '32kb',
    auditReportLimit: parseEnvInteger('ATLAS_AUDIT_REPORT_LIMIT', 20, 1, 100),
    requireExplicitConsent: process.env.ATLAS_REQUIRE_EXPLICIT_CONSENT === 'true',
    trustProxy: process.env.ATLAS_TRUST_PROXY !== 'false',
    rateLimit: {
      windowMs: parseEnvInteger('ATLAS_RATE_LIMIT_WINDOW_MS', 60_000, 1_000, 3_600_000),
      maxRequests: parseEnvInteger('ATLAS_RATE_LIMIT_MAX_REQUESTS', 20, 1, 10_000),
      cleanupIntervalMs: parseEnvInteger('ATLAS_RATE_LIMIT_CLEANUP_MS', 300_000, 10_000, 3_600_000),
    },
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      optionsSuccessStatus: 204,
    },
  };
}

function resolveConfig(overrides: Partial<AtlasConfig> = {}): AtlasConfig {
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function shortHash(value: string): string {
  return sha256Hex(value); // Show full SHA-256 hash instead of truncating
}

function stableStringify(value: unknown): string {
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

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, itemValue]) => itemValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, itemValue]) => `${JSON.stringify(key)}:${stableStringify(itemValue)}`)
    .join(',')}}`;
}

function deepCopy<T>(value: T): T {
  return structuredClone(value);
}

function normalizeSymptoms(symptoms: readonly string[]): string[] {
  const normalized = symptoms
    .map((symptom) => symptom.trim().replace(/\s+/g, ' ').toLowerCase())
    .filter(Boolean);

  return uniqueStrings(normalized);
}

function isAffirmedSymptom(symptom: string): boolean {
  return !NEGATION_PREFIXES.some((prefix) => symptom.startsWith(prefix));
}

class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
    options?: { cause?: Error; readonly expose?: boolean },
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.expose = options?.expose ?? statusCode < 500;
  }
}

class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

class Mutex {
  private tail = Promise.resolve();

  async runExclusive<T>(work: () => Promise<T> | T): Promise<T> {
    const previous = this.tail;

    let release!: () => void;
    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    try {
      return await work();
    } finally {
      release();
    }
  }
}

class SymptomMatcher {
  private readonly symptoms: readonly string[];
  private readonly symptomText: string;

  constructor(symptoms: readonly string[]) {
    this.symptoms = symptoms.filter(isAffirmedSymptom);
    this.symptomText = this.symptoms.join(' | ');
  }

  hasPhrase(phrase: string): boolean {
    return this.symptoms.some((symptom) => symptom.includes(phrase));
  }

  hasAny(phrases: readonly string[]): boolean {
    return phrases.some((phrase) => this.hasPhrase(phrase));
  }

  matched(phrases: readonly string[]): string[] {
    return uniqueStrings(phrases.filter((phrase) => this.hasPhrase(phrase)));
  }

  getText(): string {
    return this.symptomText;
  }
}

export class TriageEngine {
  assess(symptoms: readonly string[], patientContext?: PatientContext): TriageAssessment {
    const normalizedSymptoms = normalizeSymptoms(symptoms);

    if (normalizedSymptoms.length === 0) {
      throw new ValidationError('At least one symptom is required');
    }

    const matcher = new SymptomMatcher(normalizedSymptoms);
    const riskProfile = this.calculateRiskProfile(patientContext);

    if (
      matcher.hasAny([
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
      (patientContext?.vitals?.oxygenSaturation != null && patientContext.vitals.oxygenSaturation <= 92)
    ) {
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
        reasoning:
          redFlags.length > 0
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

    if (
      (matcher.hasPhrase('fever') && matcher.hasAny(['headache', 'stiff neck', 'rash'])) ||
      matcher.hasAny(['persistent vomiting', 'severe dehydration']) ||
      (matcher.hasPhrase('fever') && riskProfile.score >= 0.25)
    ) {
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
        reasoning:
          'Symptoms suggest an urgent condition that should be evaluated promptly, especially with systemic features or elevated risk.',
        redFlags: urgentRedFlags,
        recommendations: [
          'Seek urgent care within 4 hours',
          'Monitor temperature and hydration',
          'Escalate to emergency care if symptoms worsen rapidly',
        ],
        selfCareTips: ['Drink fluids if tolerated', 'Rest while arranging care'],
      });
    }

    if (
      riskProfile.score < 0.15 &&
      matcher.hasAny(['sneezing', 'itchy eyes', 'runny nose']) &&
      !matcher.hasAny(['fever', 'shortness of breath', 'chest pain'])
    ) {
      return this.buildAssessment({
        urgency: 'ROUTINE',
        pathway: 'SELF_CARE',
        matchedRule: 'low_risk_allergy_like',
        baseConfidence: 0.72,
        riskProfile,
        normalizedSymptoms,
        reasoning:
          'Symptoms appear low-risk and consistent with a mild allergy-like or upper-airway irritation pattern.',
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
        reasoning:
          'Symptoms appear compatible with a mild respiratory condition that is often appropriate for telehealth follow-up.',
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
      reasoning:
        'Symptoms are not specific enough for a lower-acuity pathway and should be reviewed with a clinician.',
      redFlags: [...riskProfile.factors],
      recommendations: [
        'Arrange a primary care visit soon',
        'Prepare a clearer symptom timeline',
        'Seek urgent or emergency care if red-flag symptoms develop',
      ],
      selfCareTips: ['Track symptoms over time', 'Record temperature and heart rate if available'],
    });
  }

  private calculateRiskProfile(patientContext?: PatientContext): RiskProfile {
    let score = 0;
    const factors: string[] = [];

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
    } else if (age != null && age >= 65) {
      score += 0.12;
      factors.push('older adult');
    }

    if (hr != null && hr >= 120) {
      score += 0.25;
      factors.push('marked tachycardia');
    } else if (hr != null && hr >= 100) {
      score += 0.12;
      factors.push('elevated heart rate');
    }

    if (tempC != null && tempC >= 39) {
      score += 0.18;
      factors.push('high fever');
    } else if (tempC != null && tempC >= 38.5) {
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

  private buildAssessment(input: {
    readonly urgency: Urgency;
    readonly pathway: CarePathway;
    readonly matchedRule: string;
    readonly baseConfidence: number;
    readonly riskProfile: RiskProfile;
    readonly normalizedSymptoms: readonly string[];
    readonly reasoning: string;
    readonly redFlags: readonly string[];
    readonly recommendations: readonly string[];
    readonly selfCareTips: readonly string[];
  }): TriageAssessment {
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

class ConsentService {
  constructor(private readonly requireExplicitConsent: boolean) {}

  verify(consent?: ConsentInput): ConsentResult {
    const provided = consent?.provided ?? !this.requireExplicitConsent;
    const scope = consent?.scope ?? 'TRIAGE';

    if (!provided) {
      return {
        allowed: false,
        consentId: randomUUID(),
        verifiedAt: new Date().toISOString(),
        provided: false,
        scope,
        reason: 'Explicit consent is required for processing',
      };
    }

    return {
      allowed: true,
      consentId: randomUUID(),
      verifiedAt: new Date().toISOString(),
      provided: true,
      scope,
    };
  }
}

function computeAuditHash(event: Omit<AuditEventRecord, 'hash'>): string {
  return sha256Hex(
    stableStringify({
      id: event.id,
      sequence: event.sequence,
      type: event.type,
      requestId: event.requestId,
      patientId: event.patientId,
      details: event.details,
      occurredAt: event.occurredAt,
      previousHash: event.previousHash,
    }),
  );
}

export class InMemoryAuditStore implements AuditStore {
  private readonly events: AuditEventRecord[] = [];
  private readonly mutex = new Mutex();

  async append(event: AuditEventInput): Promise<AuditEventRecord> {
    return this.mutex.runExclusive(() => {
      const previousHash = this.events.at(-1)?.hash ?? GENESIS_HASH;

      const baseRecord: Omit<AuditEventRecord, 'hash'> = {
        id: randomUUID(),
        sequence: this.events.length + 1,
        type: event.type,
        requestId: event.requestId,
        patientId: event.patientId,
        details: deepCopy(event.details ?? {}),
        occurredAt: new Date().toISOString(),
        previousHash,
      };

      const storedRecord: AuditEventRecord = {
        ...baseRecord,
        hash: computeAuditHash(baseRecord),
      };

      this.events.push(storedRecord);
      return deepCopy(storedRecord);
    });
  }

  async getRecent(limit: number): Promise<readonly AuditEventRecord[]> {
    return this.mutex.runExclusive(() => deepCopy(this.events.slice(-Math.max(0, limit))));
  }

  async getSummary(): Promise<AuditSummary> {
    return this.mutex.runExclusive(() => ({
      totalEvents: this.events.length,
      chainValid: true,
      latestHash: this.events.at(-1)?.hash ?? GENESIS_HASH,
    }));
  }

  async validateChain(): Promise<AuditValidationResult> {
    return this.mutex.runExclusive(() => {
      for (let index = 0; index < this.events.length; index += 1) {
        const current = this.events[index];
        const expectedPreviousHash = index === 0 ? GENESIS_HASH : this.events[index - 1]!.hash;
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

export class AtlasAPISystem {
  private readonly triageEngine: TriageEngine;
  private readonly auditStore: AuditStore;
  private readonly consentService: ConsentService;

  constructor(options?: {
    readonly triageEngine?: TriageEngine;
    readonly auditStore?: AuditStore;
    readonly consentService?: ConsentService;
    readonly requireExplicitConsent?: boolean;
  }) {
    this.triageEngine = options?.triageEngine ?? new TriageEngine();
    this.auditStore = options?.auditStore ?? new InMemoryAuditStore();
    this.consentService =
      options?.consentService ?? new ConsentService(options?.requireExplicitConsent ?? false);
  }

  previewTriage(input: PreviewTriageInput): TriageAssessment {
    return this.triageEngine.assess(input.symptoms, input.patientContext);
  }

  async processPatientRequest(
    input: ProcessPatientRequestInput,
  ): Promise<ProcessPatientRequestResponse> {
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
    } catch (error) {
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

  async getAuditReport(limit = 10): Promise<{
    readonly totalEvents: number;
    readonly chainValid: boolean;
    readonly latestHash: string;
    readonly events: readonly {
      readonly sequence: number;
      readonly type: AuditEventType;
      readonly occurredAt: string;
      readonly requestId: string;
      readonly patientRef?: string;
      readonly outcome?: string;
    }[];
  }> {
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

  async validateAuditChain(): Promise<AuditValidationResult> {
    return this.auditStore.validateChain();
  }

  async getSystemStatus(): Promise<{
    readonly status: 'ACTIVE';
    readonly name: string;
    readonly version: string;
    readonly now: string;
    readonly uptimeSeconds: number;
    readonly memory: {
      readonly rssBytes: number;
      readonly heapUsedBytes: number;
      readonly heapTotalBytes: number;
      readonly externalBytes: number;
    };
    readonly audit: AuditSummary;
  }> {
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

  private buildCareCoordinationPlan(triage: TriageAssessment): CareCoordinationPlan {
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
    } satisfies Record<
      CarePathway,
      Omit<CareCoordinationPlan, 'pathway' | 'completed'>
    >;

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

function extractAuditOutcome(details: Record<string, unknown>): string | undefined {
  const candidates = ['outcome', 'result', 'urgency', 'error'] as const;

  for (const key of candidates) {
    const value = details[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

class SlidingWindowRateLimiter {
  private readonly hitsByKey = new Map<string, number[]>();
  private readonly mutex = new Mutex();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor(private readonly config: RateLimitConfig) {
    this.cleanupTimer = setInterval(() => {
      void this.prune();
    }, this.config.cleanupIntervalMs);

    this.cleanupTimer.unref();
  }

  async consume(key: string, now = Date.now()): Promise<{
    readonly allowed: boolean;
    readonly limit: number;
    readonly remaining: number;
    readonly retryAfterSeconds: number;
    readonly resetAtEpochSeconds: number;
  }> {
    return this.mutex.runExclusive(() => {
      const windowStart = now - this.config.windowMs;
      const recentHits = (this.hitsByKey.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

      if (recentHits.length >= this.config.maxRequests) {
        const oldestHit = recentHits[0]!;
        const retryAfterMs = Math.max(0, oldestHit + this.config.windowMs - now);
        this.hitsByKey.set(key, recentHits);

        return {
          allowed: false,
          limit: this.config.maxRequests,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1_000)),
          resetAtEpochSeconds: Math.ceil((oldestHit + this.config.windowMs) / 1_000),
        };
      }

      recentHits.push(now);
      this.hitsByKey.set(key, recentHits);

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - recentHits.length),
        retryAfterSeconds: 0,
        resetAtEpochSeconds: Math.ceil((recentHits[0]! + this.config.windowMs) / 1_000),
      };
    });
  }

  dispose(): void {
    clearInterval(this.cleanupTimer);
  }

  private async prune(now = Date.now()): Promise<void> {
    await this.mutex.runExclusive(() => {
      const windowStart = now - this.config.windowMs;

      for (const [key, timestamps] of this.hitsByKey.entries()) {
        const recentHits = timestamps.filter((timestamp) => timestamp > windowStart);
        if (recentHits.length === 0) {
          this.hitsByKey.delete(key);
        } else {
          this.hitsByKey.set(key, recentHits);
        }
      }
    });
  }
}

function getClientKey(req: Request): string {
  const forwardedFor = req.header('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || req.ip || req.socket.remoteAddress || 'unknown';
}

function asRecord(value: unknown, fieldName: string): Record<string, unknown> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`);
  }

  return value as Record<string, unknown>;
}

function parseString(
  value: unknown,
  fieldName: string,
  minLength = 1,
  maxLength = 128,
): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength || trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName} must be between ${minLength} and ${maxLength} characters`);
  }

  return trimmed;
}

function parseOptionalBoolean(value: unknown, fieldName: string): boolean | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`);
  }

  return value;
}

function parseOptionalNumber(
  value: unknown,
  fieldName: string,
  min: number,
  max: number,
): number | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new ValidationError(`${fieldName} must be a number between ${min} and ${max}`);
  }

  return value;
}

function parseSymptoms(value: unknown): readonly string[] {
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

function parsePatientContext(value: unknown): PatientContext | undefined {
  if (value == null) {
    return undefined;
  }

  const record = asRecord(value, 'patientContext');
  const vitalsValue = record.vitals;
  const vitalsRecord = vitalsValue == null ? undefined : asRecord(vitalsValue, 'patientContext.vitals');

  return {
    age: parseOptionalNumber(record.age, 'patientContext.age', 0, 130),
    vitals:
      vitalsRecord == null
        ? undefined
        : {
            bp:
              vitalsRecord.bp == null
                ? undefined
                : parseString(vitalsRecord.bp, 'patientContext.vitals.bp', 3, 20),
            hr: parseOptionalNumber(vitalsRecord.hr, 'patientContext.vitals.hr', 20, 250),
            tempC: parseOptionalNumber(vitalsRecord.tempC, 'patientContext.vitals.tempC', 30, 45),
            oxygenSaturation: parseOptionalNumber(
              vitalsRecord.oxygenSaturation,
              'patientContext.vitals.oxygenSaturation',
              50,
              100,
            ),
          },
    pregnancy: parseOptionalBoolean(record.pregnancy, 'patientContext.pregnancy'),
    immunocompromised: parseOptionalBoolean(
      record.immunocompromised,
      'patientContext.immunocompromised',
    ),
    symptomDurationHours: parseOptionalNumber(
      record.symptomDurationHours,
      'patientContext.symptomDurationHours',
      0,
      24 * 365,
    ),
  };
}

function parseConsent(value: unknown): ConsentInput | undefined {
  if (value == null) {
    return undefined;
  }

  const record = asRecord(value, 'consent');
  const scopeValue = record.scope;

  let scope: ConsentScope | undefined;
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

function parseTriageRequestBody(body: unknown, requestId: string): ProcessPatientRequestInput {
  const record = asRecord(body, 'request body');

  return {
    requestId,
    patientId: parseString(record.patientId, 'patientId', 1, 128),
    symptoms: parseSymptoms(record.symptoms),
    patientContext: parsePatientContext(record.patientContext),
    consent: parseConsent(record.consent),
  };
}

function parsePreviewRequestBody(body: unknown, requestId: string): PreviewTriageInput {
  const record = asRecord(body, 'request body');

  return {
    requestId,
    symptoms: parseSymptoms(record.symptoms),
    patientContext: parsePatientContext(record.patientContext),
  };
}

function parseLimitQuery(value: unknown, fallback: number): number {
  if (typeof value !== 'string' || value.trim() === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, 1, 100);
}

function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void,
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createApp(options: CreateAppOptions = {}): Express {
  const config = resolveConfig(options.config);
  const atlas =
    options.atlasSystem ??
    new AtlasAPISystem({
      auditStore: new InMemoryAuditStore(),
      requireExplicitConsent: config.requireExplicitConsent,
    });
  const rateLimiter = options.rateLimiter ?? new SlidingWindowRateLimiter(config.rateLimit);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.locals.atlas = atlas;
  app.locals.rateLimiter = rateLimiter;

  app.use(cors(config.cors));
  app.use(express.json({ limit: config.jsonBodyLimit }));

  app.use((req, res, next) => {
    req.requestId = req.header('x-request-id')?.trim() || randomUUID();
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

  app.get(
    '/health',
    asyncHandler(async (_req, res) => {
      res.json(await atlas.getSystemStatus());
    }),
  );

  app.get(
    '/ready',
    asyncHandler(async (_req, res) => {
      const validation = await atlas.validateAuditChain();
      res.status(validation.valid ? 200 : 503).json(validation);
    }),
  );

  app.post(
    '/triage/preview',
    rateLimitMiddleware,
    asyncHandler(async (req, res) => {
      const requestId = req.requestId ?? randomUUID();
      const input = parsePreviewRequestBody(req.body, requestId);
      const triage = atlas.previewTriage(input);

      res.json({
        success: true,
        requestId,
        triage,
        mode: 'PREVIEW',
      });
    }),
  );

  app.post(
    '/triage',
    rateLimitMiddleware,
    asyncHandler(async (req, res) => {
      const requestId = req.requestId ?? randomUUID();
      const input = parseTriageRequestBody(req.body, requestId);
      const result = await atlas.processPatientRequest(input);

      res.status(result.success ? 200 : 403).json(result);
    }),
  );

  app.get(
    '/audit',
    asyncHandler(async (req, res) => {
      const limit = parseLimitQuery(req.query.limit, config.auditReportLimit);
      res.json(await atlas.getAuditReport(limit));
    }),
  );

  app.get(
    '/audit/validate',
    asyncHandler(async (_req, res) => {
      res.json(await atlas.validateAuditChain());
    }),
  );

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

  const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
    const appError =
      error instanceof AppError
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

export async function startServer(configOverrides: Partial<AtlasConfig> = {}): Promise<{
  readonly app: Express;
  readonly server: Server;
  readonly close: () => Promise<void>;
}> {
  const config = resolveConfig(configOverrides);
  const app = createApp({ config });

  const server = await new Promise<Server>((resolve) => {
    const instance = app.listen(config.port, () => resolve(instance));
  });

  const close = async (): Promise<void> => {
    const limiter = app.locals.rateLimiter as SlidingWindowRateLimiter | undefined;
    limiter?.dispose();

    await new Promise<void>((resolve, reject) => {
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
  console.log(
    `⚡ Rate limit: ${config.rateLimit.maxRequests} req / ${Math.round(
      config.rateLimit.windowMs / 1000,
    )}s`,
  );

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

export default createApp;