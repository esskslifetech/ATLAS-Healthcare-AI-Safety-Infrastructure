// ATLAS Working Demo - Functional, deterministic healthcare AI demo
// Uses typed orchestration, real SHA-256 audit chaining via verification-logger,
// and deterministic demo patient profiles for stable outputs.

import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  AtlasLogger,
  MockAuditLogger,
  type AuditChainValidationResult,
  type LoggerSink,
  type VerificationLogEntry,
} from './verification-logger';

export type Urgency = 'EMERGENT' | 'URGENT' | 'SEMI_URGENT' | 'ROUTINE';
export type CarePathway =
  | 'ED'
  | 'URGENT_CARE'
  | 'PRIMARY_CARE'
  | 'TELEHEALTH'
  | 'SELF_CARE';

export type ContextSource = 'provided' | 'profile' | 'merged' | 'default';
export type FailureCode = 'VALIDATION_ERROR' | 'CONSENT_DENIED' | 'PROCESSING_ERROR';

export interface VitalSigns {
  readonly bp?: string;
  readonly hr?: number;
  readonly tempC?: number;
  readonly oxygenSaturation?: number;
}

export interface PatientContext {
  readonly age?: number;
  readonly vitals?: VitalSigns;
  readonly symptomDurationHours?: number;
}

export interface DemoPatientProfile {
  readonly id: string;
  readonly displayName: string;
  readonly context: PatientContext;
  readonly conditions?: readonly string[];
  readonly medications?: readonly string[];
}

export interface RiskProfile {
  readonly score: number;
  readonly factors: readonly string[];
}

export interface TriageAssessment {
  readonly urgency: Urgency;
  readonly pathway: CarePathway;
  readonly confidence: number;
  readonly riskScore: number;
  readonly riskFactors: readonly string[];
  readonly reasoning: string;
  readonly redFlags: readonly string[];
  readonly recommendations: readonly string[];
  readonly matchedRule: string;
  readonly disclaimer: string;
}

export interface ConsentDecision {
  readonly allowed: boolean;
  readonly grantedScope: readonly string[];
  readonly consentId: string;
  readonly verifiedAt: string;
  readonly reason?: string;
}

export interface CareCoordinationResult {
  readonly pathway: CarePathway;
  readonly actions: readonly string[];
  readonly providerDisposition: string;
  readonly patientMessage: string;
  readonly estimatedResponseMinutes: number;
  readonly completed: true;
}

export interface ProcessPatientRequestInput {
  readonly requestId?: string;
  readonly patientId: string;
  readonly symptoms: readonly string[];
  readonly patientContext?: PatientContext;
  readonly consentProvided?: boolean;
}

export interface ProcessPatientSuccess {
  readonly success: true;
  readonly requestId: string;
  readonly patientId: string;
  readonly patientRef: string;
  readonly profileName?: string;
  readonly contextSource: ContextSource;
  readonly triage: TriageAssessment;
  readonly coordination: CareCoordinationResult;
  readonly consent: ConsentDecision;
  readonly audit: {
    readonly valid: boolean;
    readonly totalEvents: number;
    readonly latestHash: string;
  };
  readonly totalSteps: number;
  readonly logEntries: readonly VerificationLogEntry[];
}

export interface ProcessPatientFailure {
  readonly success: false;
  readonly requestId: string;
  readonly patientId: string;
  readonly patientRef: string;
  readonly profileName?: string;
  readonly contextSource: ContextSource;
  readonly code: FailureCode;
  readonly error: string;
  readonly audit: {
    readonly valid: boolean;
    readonly totalEvents: number;
    readonly latestHash: string;
  };
  readonly totalSteps: number;
  readonly logEntries: readonly VerificationLogEntry[];
}

export type ProcessPatientResult = ProcessPatientSuccess | ProcessPatientFailure;

export interface PreviewTriageInput {
  readonly patientId?: string;
  readonly symptoms: readonly string[];
  readonly patientContext?: PatientContext;
}

export interface ProcessBatchRequest {
  readonly patientId: string;
  readonly symptoms: readonly string[];
  readonly patientContext?: PatientContext;
  readonly consentProvided?: boolean;
}

export interface AuditEventSummary {
  readonly sequence: number;
  readonly type: string;
  readonly step?: number;
  readonly module?: string;
  readonly action?: string;
  readonly result?: string;
  readonly timestamp: string;
  readonly hashPrefix: string;
}

export interface WorkingAuditReport {
  readonly totalEvents: number;
  readonly chainValid: boolean;
  readonly latestHash: string;
  readonly events: readonly AuditEventSummary[];
}

export interface WorkingSystemSnapshot {
  readonly status: 'ACTIVE';
  readonly now: string;
  readonly patientProfiles: number;
  readonly audit: {
    readonly totalEvents: number;
    readonly latestHash: string;
    readonly chainValid: boolean;
  };
  readonly memory: {
    readonly rssBytes: number;
    readonly heapUsedBytes: number;
    readonly heapTotalBytes: number;
  };
}

export interface AtlasWorkingSystemOptions {
  readonly auditLogger?: MockAuditLogger;
  readonly sink?: LoggerSink;
  readonly emitVerificationLogs?: boolean;
  readonly patientProfiles?: readonly DemoPatientProfile[];
}

const DEFAULT_GRANTED_SCOPE = [
  'read_conditions',
  'read_medications',
  'read_observations',
] as const;

const DISCLAIMER =
  'This demo provides triage guidance only and is not a diagnosis. Seek emergency care for life-threatening symptoms.';

const DEFAULT_DEMO_PATIENT_PROFILES: readonly DemoPatientProfile[] = [
  {
    id: 'maria-123',
    displayName: 'Maria Garcia',
    context: {
      age: 45,
      symptomDurationHours: 2,
      vitals: {
        bp: '140/90',
        hr: 110,
        tempC: 37.2,
        oxygenSaturation: 97,
      },
    },
    conditions: ['Hypertension'],
    medications: ['Lisinopril'],
  },
  {
    id: 'john-456',
    displayName: 'John Carter',
    context: {
      age: 72,
      symptomDurationHours: 8,
      vitals: {
        bp: '150/95',
        hr: 95,
        tempC: 39.2,
        oxygenSaturation: 96,
      },
    },
    conditions: ['Type 2 Diabetes'],
    medications: ['Metformin'],
  },
  {
    id: 'sarah-789',
    displayName: 'Sarah Kim',
    context: {
      age: 28,
      symptomDurationHours: 48,
      vitals: {
        bp: '120/80',
        hr: 75,
        tempC: 37.0,
        oxygenSaturation: 99,
      },
    },
    conditions: [],
    medications: [],
  },
] as const;

const NOOP_SINK: LoggerSink = {
  info: () => {},
  error: () => {},
};

const CONSOLE_SINK: LoggerSink = {
  info: (message) => console.log(message),
  error: (message) => console.error(message),
};

class AtlasWorkingError extends Error {
  readonly code: FailureCode;

  constructor(code: FailureCode, message: string, options?: { cause?: Error }) {
    super(message);
    this.code = code;
  }
}

function nowIsoString(): string {
  return new Date().toISOString();
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function createPatientReference(patientId: string): string {
  return `patient_${sha256Hex(patientId).slice(0, 12)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function summarizeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function normalizeSymptoms(symptoms: readonly string[]): string[] {
  return [...new Set(symptoms.map((item) => item.trim().toLowerCase()).filter(Boolean))];
}

function validatePatientId(patientId: string): void {
  if (patientId.trim().length === 0 || patientId.length > 128) {
    throw new AtlasWorkingError(
      'VALIDATION_ERROR',
      'patientId must be between 1 and 128 characters',
    );
  }
}

function validateSymptoms(symptoms: readonly string[]): void {
  if (!Array.isArray(symptoms) || symptoms.length === 0 || symptoms.length > 32) {
    throw new AtlasWorkingError(
      'VALIDATION_ERROR',
      'symptoms must contain between 1 and 32 items',
    );
  }

  for (const symptom of symptoms) {
    if (typeof symptom !== 'string' || symptom.trim().length === 0 || symptom.length > 200) {
      throw new AtlasWorkingError(
        'VALIDATION_ERROR',
        'each symptom must be a non-empty string up to 200 characters',
      );
    }
  }
}

function mergePatientContext(
  baseContext?: PatientContext,
  overrideContext?: PatientContext,
): PatientContext | undefined {
  if (baseContext == null && overrideContext == null) {
    return undefined;
  }

  return {
    age: overrideContext?.age ?? baseContext?.age,
    symptomDurationHours:
      overrideContext?.symptomDurationHours ?? baseContext?.symptomDurationHours,
    vitals:
      baseContext?.vitals != null || overrideContext?.vitals != null
        ? {
            bp: overrideContext?.vitals?.bp ?? baseContext?.vitals?.bp,
            hr: overrideContext?.vitals?.hr ?? baseContext?.vitals?.hr,
            tempC: overrideContext?.vitals?.tempC ?? baseContext?.vitals?.tempC,
            oxygenSaturation:
              overrideContext?.vitals?.oxygenSaturation ??
              baseContext?.vitals?.oxygenSaturation,
          }
        : undefined,
  };
}

function shortHash(hash: string): string {
  return hash; // Show full SHA-256 hash instead of truncating
}

class WorkingTriageAgent {
  assessTriage(symptoms: readonly string[], patientContext?: PatientContext): TriageAssessment {
    const normalizedSymptoms = normalizeSymptoms(symptoms);

    if (normalizedSymptoms.length === 0) {
      throw new AtlasWorkingError('VALIDATION_ERROR', 'At least one symptom is required');
    }

    const symptomText = normalizedSymptoms.join(' | ');
    const has = (phrase: string): boolean =>
      normalizedSymptoms.some((symptom) => symptom.includes(phrase));

    const riskProfile = this.calculateRiskProfile(patientContext);

    if (
      has('chest pain') ||
      has('heart attack') ||
      has('shortness of breath') ||
      has('difficulty breathing') ||
      (patientContext?.vitals?.oxygenSaturation != null &&
        patientContext.vitals.oxygenSaturation <= 92)
    ) {
      const redFlags = [
        ...(has('chest pain') ? ['chest pain'] : []),
        ...(has('shortness of breath') || has('difficulty breathing')
          ? ['breathing difficulty']
          : []),
        ...(patientContext?.vitals?.oxygenSaturation != null &&
        patientContext.vitals.oxygenSaturation <= 92
          ? ['low oxygen saturation']
          : []),
      ];

      return {
        urgency: 'EMERGENT',
        pathway: 'ED',
        confidence: Number(clamp(0.88 + riskProfile.score * 0.18, 0.88, 0.99).toFixed(2)),
        riskScore: riskProfile.score,
        riskFactors: riskProfile.factors,
        reasoning:
          'Emergency cardiopulmonary features were detected and require immediate evaluation.',
        redFlags,
        recommendations: [
          'Call emergency services now if symptoms are severe or worsening',
          'Go to the nearest emergency department immediately',
          'Bring a list of medications if available',
        ],
        matchedRule: 'emergent_cardiopulmonary',
        disclaimer: DISCLAIMER,
      };
    }

    if (
      (has('fever') && has('headache')) ||
      has('high fever') ||
      has('severe headache') ||
      (patientContext?.vitals?.tempC != null && patientContext.vitals.tempC >= 39)
    ) {
      return {
        urgency: 'URGENT',
        pathway: 'URGENT_CARE',
        confidence: Number(clamp(0.78 + riskProfile.score * 0.16, 0.78, 0.94).toFixed(2)),
        riskScore: riskProfile.score,
        riskFactors: riskProfile.factors,
        reasoning:
          'Fever with concerning associated symptoms suggests urgent evaluation is appropriate.',
        redFlags: ['fever', ...(has('headache') || has('severe headache') ? ['headache'] : [])],
        recommendations: [
          'Visit urgent care within 4 hours',
          'Monitor temperature and hydration',
          'Escalate to emergency care if symptoms worsen rapidly',
        ],
        matchedRule: 'urgent_fever_headache',
        disclaimer: DISCLAIMER,
      };
    }

    if (has('runny nose') || has('itchy eyes') || has('sneezing')) {
      return {
        urgency: 'ROUTINE',
        pathway: 'SELF_CARE',
        confidence: Number(clamp(0.7 + riskProfile.score * 0.08, 0.68, 0.8).toFixed(2)),
        riskScore: riskProfile.score,
        riskFactors: riskProfile.factors,
        reasoning: 'Symptoms appear mild and compatible with self-care and monitoring.',
        redFlags: riskProfile.score >= 0.25 ? ['risk factors present'] : [],
        recommendations: [
          'Hydrate and rest',
          'Avoid known triggers if relevant',
          'Seek clinical review if symptoms persist or worsen',
        ],
        matchedRule: 'routine_self_care_upper_airway',
        disclaimer: DISCLAIMER,
      };
    }

    if (has('cough') || has('cold') || has('congestion') || has('sore throat')) {
      return {
        urgency: 'ROUTINE',
        pathway: 'TELEHEALTH',
        confidence: Number(clamp(0.69 + riskProfile.score * 0.1, 0.68, 0.82).toFixed(2)),
        riskScore: riskProfile.score,
        riskFactors: riskProfile.factors,
        reasoning:
          symptomText.length > 0
            ? 'Mild respiratory symptoms can often be managed through telehealth follow-up.'
            : 'Respiratory symptoms can often be managed through telehealth follow-up.',
        redFlags: riskProfile.score >= 0.25 ? ['risk factors present'] : [],
        recommendations: [
          'Schedule a telehealth appointment',
          'Rest and hydrate',
          'Seek urgent care if breathing worsens or fever becomes high',
        ],
        matchedRule: 'routine_respiratory',
        disclaimer: DISCLAIMER,
      };
    }

    return {
      urgency: 'SEMI_URGENT',
      pathway: 'PRIMARY_CARE',
      confidence: Number(clamp(0.45 + riskProfile.score * 0.12, 0.4, 0.7).toFixed(2)),
      riskScore: riskProfile.score,
      riskFactors: riskProfile.factors,
      reasoning: 'Symptoms are not specific enough for a lower-acuity route and need review.',
      redFlags: riskProfile.score >= 0.15 ? ['clinical evaluation recommended'] : [],
      recommendations: [
        'Schedule a primary care appointment',
        'Provide more symptom details and timing',
        'Escalate immediately if chest pain or breathing difficulty appears',
      ],
      matchedRule: 'unclear_symptom_pattern',
      disclaimer: DISCLAIMER,
    };
  }

  private calculateRiskProfile(patientContext?: PatientContext): RiskProfile {
    let score = 0;
    const factors: string[] = [];

    const age = patientContext?.age;
    const hr = patientContext?.vitals?.hr;
    const tempC = patientContext?.vitals?.tempC;
    const oxygenSaturation = patientContext?.vitals?.oxygenSaturation;
    const durationHours = patientContext?.symptomDurationHours;

    if (age != null && age >= 75) {
      score += 0.2;
      factors.push('advanced age');
    } else if (age != null && age >= 65) {
      score += 0.1;
      factors.push('older adult');
    }

    if (hr != null && hr >= 120) {
      score += 0.2;
      factors.push('marked tachycardia');
    } else if (hr != null && hr >= 100) {
      score += 0.12;
      factors.push('elevated heart rate');
    }

    if (tempC != null && tempC >= 39) {
      score += 0.16;
      factors.push('high fever');
    } else if (tempC != null && tempC >= 38.5) {
      score += 0.1;
      factors.push('fever');
    }

    if (oxygenSaturation != null && oxygenSaturation <= 92) {
      score += 0.3;
      factors.push('low oxygen saturation');
    }

    if (durationHours != null && durationHours >= 72) {
      score += 0.06;
      factors.push('prolonged symptoms');
    }

    return {
      score: Number(clamp(score, 0, 1).toFixed(2)),
      factors,
    };
  }
}

class WorkingConsentEngine {
  async verifyConsent(
    patientId: string,
    consentProvided = true,
  ): Promise<ConsentDecision> {
    const deniedByPatientId =
      patientId.toLowerCase().startsWith('deny-') ||
      patientId.toLowerCase().includes('blocked');

    if (!consentProvided || deniedByPatientId) {
      return {
        allowed: false,
        grantedScope: [],
        consentId: randomUUID(),
        verifiedAt: nowIsoString(),
        reason: !consentProvided
          ? 'Consent not granted by requester'
          : 'Patient access policy denied this workflow',
      };
    }

    return {
      allowed: true,
      grantedScope: DEFAULT_GRANTED_SCOPE,
      consentId: randomUUID(),
      verifiedAt: nowIsoString(),
    };
  }
}

class WorkingCareCoordinator {
  coordinateCare(triage: TriageAssessment): CareCoordinationResult {
    const templates = {
      ED: {
        actions: [
          'Notify patient urgently',
          'Escalate emergency disposition',
          'Prepare provider handoff',
        ],
        providerDisposition: 'EMERGENCY_ESCALATED',
        patientMessage: 'Proceed to the nearest emergency department immediately.',
        estimatedResponseMinutes: 0,
      },
      URGENT_CARE: {
        actions: [
          'Notify patient',
          'Recommend urgent care evaluation',
          'Record urgent route',
        ],
        providerDisposition: 'URGENT_REVIEW_REQUESTED',
        patientMessage: 'Please seek urgent care promptly.',
        estimatedResponseMinutes: 240,
      },
      PRIMARY_CARE: {
        actions: [
          'Notify patient',
          'Recommend primary care follow-up',
          'Record clinician review need',
        ],
        providerDisposition: 'PRIMARY_CARE_FOLLOW_UP',
        patientMessage: 'Please arrange prompt primary care follow-up.',
        estimatedResponseMinutes: 24 * 60,
      },
      TELEHEALTH: {
        actions: [
          'Notify patient',
          'Recommend telehealth',
          'Record low-acuity remote review',
        ],
        providerDisposition: 'TELEHEALTH_RECOMMENDED',
        patientMessage: 'A telehealth visit is an appropriate next step.',
        estimatedResponseMinutes: 12 * 60,
      },
      SELF_CARE: {
        actions: [
          'Notify patient',
          'Provide self-care instructions',
          'Record safety-net guidance',
        ],
        providerDisposition: 'SELF_CARE_GUIDANCE_ONLY',
        patientMessage: 'Home care is reasonable while monitoring symptoms.',
        estimatedResponseMinutes: 24 * 60,
      },
    } satisfies Record<
      CarePathway,
      Omit<CareCoordinationResult, 'pathway' | 'completed'>
    >;

    const selected = templates[triage.pathway];

    return {
      pathway: triage.pathway,
      actions: selected.actions,
      providerDisposition: selected.providerDisposition,
      patientMessage: selected.patientMessage,
      estimatedResponseMinutes: selected.estimatedResponseMinutes,
      completed: true,
    };
  }
}

export class AtlasWorkingSystem {
  private readonly triageAgent = new WorkingTriageAgent();
  private readonly consentEngine = new WorkingConsentEngine();
  private readonly coordinator = new WorkingCareCoordinator();
  private readonly sink: LoggerSink;
  private readonly profilesById: ReadonlyMap<string, DemoPatientProfile>;

  readonly auditLogger: MockAuditLogger;

  constructor(options: AtlasWorkingSystemOptions = {}) {
    this.auditLogger = options.auditLogger ?? new MockAuditLogger();
    this.sink =
      options.emitVerificationLogs === true
        ? (options.sink ?? CONSOLE_SINK)
        : (options.sink ?? NOOP_SINK);

    const profiles = options.patientProfiles ?? DEFAULT_DEMO_PATIENT_PROFILES;
    this.profilesById = new Map(profiles.map((profile) => [profile.id, profile] as const));
  }

  previewTriage(input: PreviewTriageInput): TriageAssessment {
    validateSymptoms(input.symptoms);
    const resolved = this.resolvePatientContext(input.patientId, input.patientContext);
    return this.triageAgent.assessTriage(input.symptoms, resolved.context);
  }

  async processPatientRequest(
    input: ProcessPatientRequestInput,
  ): Promise<ProcessPatientResult>;
  async processPatientRequest(
    patientId: string,
    symptoms: readonly string[],
    patientContext?: PatientContext,
  ): Promise<ProcessPatientResult>;
  async processPatientRequest(
    inputOrPatientId: ProcessPatientRequestInput | string,
    symptomsArg?: readonly string[],
    patientContextArg?: PatientContext,
  ): Promise<ProcessPatientResult> {
    const request = this.normalizeRequest(inputOrPatientId, symptomsArg, patientContextArg);
    const requestId = request.requestId ?? randomUUID();
    const patientRef = createPatientReference(request.patientId);
    const resolvedContext = this.resolvePatientContext(request.patientId, request.patientContext);
    const logger = new AtlasLogger(this.auditLogger, {
      sink: this.sink,
      sessionId: requestId,
      maxEntriesInMemory: 200,
    });

    try {
      validatePatientId(request.patientId);
      validateSymptoms(request.symptoms);

      logger.log('system', 'SESSION_START', patientRef);
      logger.log('proxy', 'PATIENT_INPUT', normalizeSymptoms(request.symptoms).join('_'));

      logger.log('consent', 'VERIFY', 'PROCESSING');
      const consent = await this.consentEngine.verifyConsent(
        request.patientId,
        request.consentProvided ?? true,
      );
      logger.log('consent', 'VERIFY', consent.allowed ? 'SUCCESS' : 'DENIED');

      if (!consent.allowed) {
        logger.error('system', 'ACCESS_DENIED', consent.reason ?? 'Consent denied');

        const audit = this.auditLogger.getSummary();

        return {
          success: false,
          requestId,
          patientId: request.patientId,
          patientRef,
          profileName: resolvedContext.profile?.displayName,
          contextSource: resolvedContext.source,
          code: 'CONSENT_DENIED',
          error: consent.reason ?? 'Consent denied',
          audit: {
            valid: audit.chainValid,
            totalEvents: audit.totalEvents,
            latestHash: audit.latestHash,
          },
          totalSteps: logger.getStep(),
          logEntries: logger.getEntries(),
        };
      }

      logger.log('triage', 'CLASSIFY', 'PROCESSING');
      const triage = this.triageAgent.assessTriage(request.symptoms, resolvedContext.context);
      logger.log('triage', 'CLASSIFY', `${triage.urgency} (${triage.confidence.toFixed(2)})`);

      logger.log('coordinator', 'COORDINATE', 'PROCESSING');
      const coordination = this.coordinator.coordinateCare(triage);
      logger.log('coordinator', 'ROUTE', coordination.pathway);

      logger.log('proxy', 'NOTIFY_PATIENT', coordination.patientMessage);
      logger.log('system', 'NOTIFY_PROVIDER', coordination.providerDisposition);

      const chainValidation = this.auditLogger.validateChain();
      logger.log('audit', 'VERIFY_CHAIN', chainValidation.valid ? 'HASH_OK' : 'HASH_BROKEN');

      logger.log('system', 'COMPLETE', 'SUCCESS');

      const audit = this.auditLogger.getSummary();

      return {
        success: true,
        requestId,
        patientId: request.patientId,
        patientRef,
        profileName: resolvedContext.profile?.displayName,
        contextSource: resolvedContext.source,
        triage,
        coordination,
        consent,
        audit: {
          valid: audit.chainValid,
          totalEvents: audit.totalEvents,
          latestHash: audit.latestHash,
        },
        totalSteps: logger.getStep(),
        logEntries: logger.getEntries(),
      };
    } catch (error) {
      logger.error('system', 'PROCESSING_ERROR', summarizeError(error));

      const audit = this.auditLogger.getSummary();

      return {
        success: false,
        requestId,
        patientId: request.patientId,
        patientRef,
        profileName: resolvedContext.profile?.displayName,
        contextSource: resolvedContext.source,
        code:
          error instanceof AtlasWorkingError ? error.code : 'PROCESSING_ERROR',
        error: summarizeError(error),
        audit: {
          valid: audit.chainValid,
          totalEvents: audit.totalEvents,
          latestHash: audit.latestHash,
        },
        totalSteps: logger.getStep(),
        logEntries: logger.getEntries(),
      };
    }
  }

  async processBatchRequests(
    requests: readonly ProcessBatchRequest[],
    concurrency = 4,
  ): Promise<readonly ProcessPatientResult[]> {
    const safeConcurrency = clamp(Math.trunc(concurrency), 1, 32);
    const results: ProcessPatientResult[] = new Array(requests.length);
    let nextIndex = 0;

    const worker = async (): Promise<void> => {
      while (true) {
        const currentIndex = nextIndex;
        nextIndex += 1;

        if (currentIndex >= requests.length) {
          return;
        }

        const request = requests[currentIndex]!;
        results[currentIndex] = await this.processPatientRequest({
          requestId: randomUUID(),
          patientId: request.patientId,
          symptoms: request.symptoms,
          patientContext: request.patientContext,
          consentProvided: request.consentProvided,
        });
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(safeConcurrency, requests.length) }, () => worker()),
    );

    return results;
  }

  getAuditReport(limit = 20): WorkingAuditReport {
    const safeLimit = clamp(Math.trunc(limit), 1, 100);
    const events = this.auditLogger.getEvents(safeLimit);
    const validation = this.auditLogger.validateChain();

    return {
      totalEvents: this.auditLogger.getSummary().totalEvents,
      chainValid: validation.valid,
      latestHash: this.auditLogger.getLatestHash(),
      events: events.map((event) => ({
        sequence: event.sequence,
        type: event.type,
        step: event.step,
        module: event.module,
        action: event.action,
        result: event.result ?? event.error,
        timestamp: event.timestamp,
        hashPrefix: shortHash(event.currentHash),
      })),
    };
  }

  validateAuditChain(): AuditChainValidationResult {
    return this.auditLogger.validateChain();
  }

  getSystemSnapshot(): WorkingSystemSnapshot {
    const audit = this.auditLogger.getSummary();
    const memory = process.memoryUsage();

    return {
      status: 'ACTIVE',
      now: nowIsoString(),
      patientProfiles: this.profilesById.size,
      audit: {
        totalEvents: audit.totalEvents,
        latestHash: audit.latestHash,
        chainValid: audit.chainValid,
      },
      memory: {
        rssBytes: memory.rss,
        heapUsedBytes: memory.heapUsed,
        heapTotalBytes: memory.heapTotal,
      },
    };
  }

  private normalizeRequest(
    inputOrPatientId: ProcessPatientRequestInput | string,
    symptomsArg?: readonly string[],
    patientContextArg?: PatientContext,
  ): ProcessPatientRequestInput {
    if (typeof inputOrPatientId === 'string') {
      return {
        patientId: inputOrPatientId,
        symptoms: symptomsArg ?? [],
        patientContext: patientContextArg,
      };
    }

    return inputOrPatientId;
  }

  private resolvePatientContext(
    patientId?: string,
    providedContext?: PatientContext,
  ): {
    readonly profile?: DemoPatientProfile;
    readonly context?: PatientContext;
    readonly source: ContextSource;
  } {
    const profile = patientId != null ? this.profilesById.get(patientId) : undefined;

    if (profile != null && providedContext != null) {
      return {
        profile,
        context: mergePatientContext(profile.context, providedContext),
        source: 'merged',
      };
    }

    if (providedContext != null) {
      return {
        profile,
        context: providedContext,
        source: 'provided',
      };
    }

    if (profile != null) {
      return {
        profile,
        context: profile.context,
        source: 'profile',
      };
    }

    return {
      profile: undefined,
      context: undefined,
      source: 'default',
    };
  }
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function printResultCase(title: string, result: ProcessPatientResult): void {
  console.log(`\n${title}`);
  console.log('-'.repeat(70));
  console.log(`Request ID: ${result.requestId}`);
  console.log(`Patient Ref: ${result.patientRef}`);
  console.log(`Profile: ${result.profileName ?? 'N/A'}`);
  console.log(`Context Source: ${result.contextSource}`);
  console.log(`Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);

  if (!result.success) {
    console.log(`Code: ${result.code}`);
    console.log(`Error: ${result.error}`);
    console.log(`Audit Valid: ${result.audit.valid}`);
    console.log(`Total Steps: ${result.totalSteps}`);
    return;
  }

  console.log(`Triage: ${result.triage.urgency} → ${result.triage.pathway}`);
  console.log(`Confidence: ${formatPercent(result.triage.confidence)}`);
  console.log(`Risk Score: ${formatPercent(result.triage.riskScore)}`);
  console.log(`Reasoning: ${result.triage.reasoning}`);
  console.log(`Risk Factors: ${result.triage.riskFactors.join(', ') || 'None'}`);
  console.log(`Red Flags: ${result.triage.redFlags.join(', ') || 'None'}`);
  console.log(`Recommendations: ${result.triage.recommendations.join(' | ')}`);
  console.log(`Audit Valid: ${result.audit.valid}`);
  console.log(`Latest Hash: ${shortHash(result.audit.latestHash)}`);
  console.log(`Total Steps: ${result.totalSteps}`);
}

export async function runWorkingAtlasDemo(): Promise<AtlasWorkingSystem> {
  console.log('🏥 ATLAS WORKING DEMO - FUNCTIONAL HEALTHCARE AI');
  console.log('='.repeat(70));

  const atlas = new AtlasWorkingSystem({
    emitVerificationLogs: true,
  });

  const emergencyResult = await atlas.processPatientRequest(
    'maria-123',
    ['chest pain', '2 hours', 'sweating'],
  );
  printResultCase('🔴 TEST CASE 1: EMERGENCY CHEST PAIN', emergencyResult);

  const urgentResult = await atlas.processPatientRequest(
    'john-456',
    ['high fever', 'severe headache'],
  );
  printResultCase('🟡 TEST CASE 2: URGENT FEVER', urgentResult);

  const routineResult = await atlas.processPatientRequest(
    'sarah-789',
    ['mild cough', '2 days'],
  );
  printResultCase('🟢 TEST CASE 3: ROUTINE COUGH', routineResult);

  console.log('\n🧪 TEST CASE 4: SIDE-EFFECT-FREE PREVIEW');
  console.log('-'.repeat(70));
  const beforePreview = atlas.getAuditReport(100).totalEvents;
  const preview = atlas.previewTriage({
    patientId: 'preview-user',
    symptoms: ['itchy eyes', 'runny nose', 'sneezing'],
    patientContext: {
      age: 31,
      symptomDurationHours: 12,
    },
  });
  const afterPreview = atlas.getAuditReport(100).totalEvents;
  console.log(`Preview Triage: ${preview.urgency} → ${preview.pathway}`);
  console.log(`Confidence: ${formatPercent(preview.confidence)}`);
  console.log(`Audit Events Before Preview: ${beforePreview}`);
  console.log(`Audit Events After Preview: ${afterPreview}`);
  console.log(`Side-Effect Free: ${beforePreview === afterPreview ? '✅ YES' : '❌ NO'}`);

  console.log('\n🔒 AUDIT REPORT');
  console.log('-'.repeat(70));
  const auditReport = atlas.getAuditReport(12);
  console.log(`Total audit events: ${auditReport.totalEvents}`);
  console.log(`Chain integrity: ${auditReport.chainValid ? '✅ VALID' : '❌ BROKEN'}`);
  console.log(`Latest hash: ${shortHash(auditReport.latestHash)}`);

  console.log('\nRecent Audit Events:');
  for (const event of auditReport.events) {
    console.log(
      `  ${event.sequence}. [${String(event.step ?? 'n/a')}] [${event.module ?? 'n/a'}] ${event.action ?? 'n/a'} → ${event.result ?? 'n/a'} (${event.hashPrefix})`,
    );
  }

  console.log('\n🔗 HASH CHAIN DEMONSTRATION');
  console.log('-'.repeat(70));
  const allEvents = atlas.auditLogger.getEvents(5);
  for (const event of allEvents) {
    console.log(`Event ${event.sequence}:`);
    console.log(`   Type: ${event.type}`);
    console.log(`   Previous Hash: ${shortHash(event.previousHash)}`);
    console.log(`   Current Hash:  ${shortHash(event.currentHash)}`);
  }

  console.log('\n📊 SYSTEM SNAPSHOT');
  console.log('-'.repeat(70));
  const snapshot = atlas.getSystemSnapshot();
  console.log(`Status: ${snapshot.status}`);
  console.log(`Timestamp: ${snapshot.now}`);
  console.log(`Patient Profiles: ${snapshot.patientProfiles}`);
  console.log(`Audit Events: ${snapshot.audit.totalEvents}`);
  console.log(`Chain Valid: ${snapshot.audit.chainValid ? '✅ VALID' : '❌ BROKEN'}`);
  console.log(`Memory RSS: ${formatMegabytes(snapshot.memory.rssBytes)}`);
  console.log(`Heap Used: ${formatMegabytes(snapshot.memory.heapUsedBytes)}`);

  console.log('\n🎯 ENHANCED ATLAS SYSTEM SUMMARY');
  console.log('-'.repeat(70));
  console.log('✅ Real SHA-256 cryptographic hash chains');
  console.log('✅ Deterministic patient context via demo profiles');
  console.log('✅ Context-aware triage with age and vitals');
  console.log('✅ Consent-aware request handling');
  console.log('✅ Step-by-step verification logging');
  console.log('✅ Preview mode without audit side effects');
  console.log('✅ Modern typed orchestration');
  console.log('✅ Functional audit integrity validation');

  console.log('\n🚀 THIS IS ACTUAL WORKING CODE');
  console.log('-'.repeat(70));
  console.log('• Real TypeScript logic executed');
  console.log('• Real deterministic triage rules applied');
  console.log('• Real cryptographic audit chain maintained');
  console.log('• Real request/session logging produced');
  console.log('• Real consent handling enforced');
  console.log('• No random demo behavior');

  console.log('\n🎉 ATLAS WORKING DEMO COMPLETE');
  console.log('='.repeat(70));
  console.log('The system successfully processes patient requests,');
  console.log('performs medical triage, verifies consent, logs audits,');
  console.log('and maintains a cryptographic verification trail.');

  return atlas;
}

const isDirectRun = require.main === module;

if (isDirectRun) {
  void runWorkingAtlasDemo().catch((error) => {
    console.error('Working ATLAS demo failed:', error);
    process.exitCode = 1;
  });
}

export default AtlasWorkingSystem;