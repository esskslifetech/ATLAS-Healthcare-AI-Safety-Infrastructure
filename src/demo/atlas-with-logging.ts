import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  AtlasLogger as ImportedAtlasLogger,
  MockAuditLogger as ImportedMockAuditLogger,
} from './verification-logger';

export type AtlasModule =
  | 'system'
  | 'proxy'
  | 'consent'
  | 'identity'
  | 'fhir'
  | 'triage'
  | 'coordinator'
  | 'audit';

export type Urgency = 'EMERGENT' | 'URGENT' | 'SEMI_URGENT' | 'ROUTINE';
export type CarePathway =
  | 'ED'
  | 'URGENT_CARE'
  | 'PRIMARY_CARE'
  | 'TELEHEALTH'
  | 'SELF_CARE';
export type FhirResourceType = 'Patient' | 'Condition' | 'MedicationRequest';
export type FailureCode =
  | 'VALIDATION_ERROR'
  | 'CONSENT_DENIED'
  | 'TIMEOUT'
  | 'PROCESSING_ERROR';

export interface TriageResult {
  readonly urgency: Urgency;
  readonly pathway: CarePathway;
  readonly confidence: number;
  readonly reasoning: string;
  readonly redFlags: readonly string[];
  readonly recommendations: readonly string[];
}

export interface ConsentDecision {
  readonly allowed: boolean;
  readonly grantedScope: readonly string[];
  readonly reason?: string;
}

export interface IdentityToken {
  readonly accessToken: string;
  readonly expiresInSeconds: number;
  readonly issuedAt: string;
}

export interface FhirResourceRecord {
  readonly resourceType: FhirResourceType;
  readonly id: string;
  readonly requested: boolean;
  readonly available: boolean;
  readonly summary: string;
  readonly fetchedAt: string;
}

export interface ClinicalContextBundle {
  readonly tokenExpiresInSeconds: number;
  readonly resources: Readonly<Record<FhirResourceType, FhirResourceRecord>>;
}

export interface CareCoordinationResult {
  readonly pathway: CarePathway;
  readonly actions: readonly string[];
  readonly patientMessage: string;
  readonly providerDisposition: string;
  readonly completed: true;
}

export interface ProcessRequestOptions {
  readonly requestId?: string;
  readonly requestedResources?: readonly FhirResourceType[];
  readonly timeoutMs?: number;
}

export interface ProcessPatientSuccess {
  readonly success: true;
  readonly requestId: string;
  readonly patientRef: string;
  readonly triage: TriageResult;
  readonly coordination: CareCoordinationResult;
  readonly clinicalContext: {
    readonly tokenExpiresInSeconds: number;
    readonly availableResources: readonly FhirResourceType[];
    readonly degradedResources: readonly FhirResourceType[];
  };
  readonly audit: {
    readonly valid: boolean;
    readonly totalEvents: number;
  };
  readonly durationMs: number;
  readonly summary: string;
}

export interface ProcessPatientFailure {
  readonly success: false;
  readonly requestId: string;
  readonly patientRef: string;
  readonly code: FailureCode;
  readonly error: string;
  readonly audit: {
    readonly valid: boolean;
    readonly totalEvents: number;
  };
  readonly durationMs: number;
}

export type ProcessPatientResult = ProcessPatientSuccess | ProcessPatientFailure;

export interface BatchPatientRequest {
  readonly patientId: string;
  readonly symptoms: readonly string[];
  readonly options?: ProcessRequestOptions;
}

export interface AuditEventSummary {
  readonly index: number;
  readonly type: string;
  readonly step: string;
  readonly module: string;
  readonly action: string;
  readonly result: string;
  readonly timestamp?: string;
  readonly hashPrefix?: string;
}

export interface AuditReport {
  readonly totalEvents: number;
  readonly chainValid: boolean;
  readonly breakIndex?: number;
  readonly events: readonly AuditEventSummary[];
}

export interface SystemSnapshot {
  readonly name: string;
  readonly version: string;
  readonly generatedAt: string;
  readonly audit: {
    readonly totalEvents: number;
    readonly chainValid: boolean;
  };
  readonly recentModuleCounts: Readonly<Record<string, number>>;
}

export interface TriageAgent {
  assessTriage(
    symptoms: readonly string[],
    clinicalContext?: ClinicalContextBundle,
  ): Promise<TriageResult>;
}

export interface ConsentEngine {
  verifyConsent(patientId: string): Promise<ConsentDecision>;
}

export interface IdentityBridge {
  acquireToken(patientId: string): Promise<IdentityToken>;
}

export interface FhirClient {
  readResource(
    resourceType: FhirResourceType,
    patientId: string,
    token: IdentityToken,
  ): Promise<FhirResourceRecord>;
}

export interface CareCoordinator {
  coordinateCare(triageResult: TriageResult): Promise<CareCoordinationResult>;
}

export interface VerificationLoggerLike {
  log(module: string, action: string, result: string): void;
  error(module: string, action: string, error: string): void;
}

export interface VerificationAuditLoggerLike {
  getEvents(): readonly unknown[];
  validateChain(): unknown;
}

export interface AtlasWithLoggingConfig {
  readonly defaultTimeoutMs: number;
  readonly maxAuditEventsInReport: number;
  readonly batchConcurrency: number;
  readonly requestedResources: readonly FhirResourceType[];
}

export interface AtlasWithLoggingOptions {
  readonly triageAgent?: TriageAgent;
  readonly consentEngine?: ConsentEngine;
  readonly identityBridge?: IdentityBridge;
  readonly fhirClient?: FhirClient;
  readonly careCoordinator?: CareCoordinator;
  readonly logger?: VerificationLoggerLike;
  readonly auditLogger?: VerificationAuditLoggerLike;
  readonly config?: Partial<AtlasWithLoggingConfig>;
}

interface RequestContext {
  readonly requestId: string;
  readonly patientId: string;
  readonly patientRef: string;
  readonly startedAtMs: number;
}

interface AuditValidationResult {
  readonly valid: boolean;
  readonly breakIndex?: number;
  readonly totalEvents?: number;
}

const AtlasLoggerCtor = ImportedAtlasLogger as unknown as new (
  auditLogger: VerificationAuditLoggerLike,
) => VerificationLoggerLike;

const MockAuditLoggerCtor =
  ImportedMockAuditLogger as unknown as new () => VerificationAuditLoggerLike;

const APP_NAME = 'ATLAS with Verification Logger';
const APP_VERSION = '2.0.0';

const DEFAULT_CONFIG = {
  defaultTimeoutMs: 2_500,
  maxAuditEventsInReport: 50,
  batchConcurrency: 4,
  requestedResources: ['Patient', 'Condition', 'MedicationRequest'],
} satisfies AtlasWithLoggingConfig;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function truncate(value: string, maxLength = 160): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}

function sanitizeInlineText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeSymptoms(symptoms: readonly string[]): string[] {
  return [...new Set(symptoms.map((item) => sanitizeInlineText(item).toLowerCase()).filter(Boolean))];
}

function createPatientReference(patientId: string): string {
  const digest = createHash('sha256').update(patientId).digest('hex').slice(0, 12);
  return `patient_${digest}`;
}

function nowIsoString(): string {
  return new Date().toISOString();
}

function summarizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function createSkippedResource(resourceType: FhirResourceType, patientId: string): FhirResourceRecord {
  return {
    resourceType,
    id: patientId,
    requested: false,
    available: false,
    summary: `Skipped ${resourceType} read`,
    fetchedAt: nowIsoString(),
  };
}

function assertValidPatientId(patientId: string): void {
  const normalized = sanitizeInlineText(patientId);

  if (normalized.length < 1 || normalized.length > 128) {
    throw new AtlasError('VALIDATION_ERROR', 'patientId must be between 1 and 128 characters');
  }
}

function assertValidSymptoms(symptoms: readonly string[]): void {
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
      throw new AtlasError(
        'VALIDATION_ERROR',
        'each symptom must be between 1 and 200 characters',
      );
    }
  }
}

function assertValidRequestedResources(resourceTypes: readonly FhirResourceType[]): void {
  const validValues = new Set<FhirResourceType>(['Patient', 'Condition', 'MedicationRequest']);

  for (const resourceType of resourceTypes) {
    if (!validValues.has(resourceType)) {
      throw new AtlasError('VALIDATION_ERROR', `unsupported resource type: ${resourceType}`);
    }
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AtlasError('TIMEOUT', `${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    timer.unref?.();

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

class AtlasError extends Error {
  readonly code: FailureCode;

  constructor(code: FailureCode, message: string, options?: { cause?: Error }) {
    super(message);
    this.code = code;
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

class VerificationLogGateway {
  private readonly mutex = new Mutex();

  constructor(
    private readonly logger: VerificationLoggerLike,
    private readonly auditLogger: VerificationAuditLoggerLike,
  ) {}

  async info(
    context: RequestContext,
    module: AtlasModule,
    action: string,
    result: string,
  ): Promise<void> {
    await this.safeWrite(() => {
      this.logger.log(module, action, this.formatPayload(context, result));
    });
  }

  async error(
    context: RequestContext,
    module: AtlasModule,
    action: string,
    error: string,
  ): Promise<void> {
    await this.safeWrite(() => {
      this.logger.error(module, action, this.formatPayload(context, error));
    });
  }

  async getAuditReport(limit = 25): Promise<AuditReport> {
    const safeLimit = clampInteger(limit, 1, 1_000);

    try {
      return await this.mutex.runExclusive(() => {
        const rawEvents = [...this.auditLogger.getEvents()];
        const validation = normalizeAuditValidation(
          this.auditLogger.validateChain(),
          rawEvents.length,
        );

        return {
          totalEvents: rawEvents.length,
          chainValid: validation.valid,
          breakIndex: validation.breakIndex,
          events: rawEvents.slice(-safeLimit).map((event, index) =>
            normalizeAuditEvent(event, rawEvents.length - Math.min(rawEvents.length, safeLimit) + index + 1),
          ),
        };
      });
    } catch (error) {
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

  async validateChain(): Promise<AuditValidationResult> {
    try {
      return await this.mutex.runExclusive(() =>
        normalizeAuditValidation(this.auditLogger.validateChain(), this.auditLogger.getEvents().length),
      );
    } catch {
      return { valid: false };
    }
  }

  private async safeWrite(write: () => void): Promise<void> {
    try {
      await this.mutex.runExclusive(write);
    } catch (error) {
      console.error('[atlas-logging] logger write failure:', error);
    }
  }

  private formatPayload(context: RequestContext, text: string): string {
    return truncate(
      `${sanitizeInlineText(text)} | req=${context.requestId} | patient=${context.patientRef}`,
    );
  }
}

function normalizeAuditValidation(
  value: unknown,
  totalEvents: number,
): AuditValidationResult {
  if (!isRecord(value) || typeof value.valid !== 'boolean') {
    return {
      valid: false,
      totalEvents,
    };
  }

  const breakIndex =
    typeof value.breakIndex === 'number' && Number.isFinite(value.breakIndex)
      ? value.breakIndex
      : undefined;

  const reportedTotal =
    typeof value.totalEvents === 'number' && Number.isFinite(value.totalEvents)
      ? value.totalEvents
      : totalEvents;

  return {
    valid: value.valid,
    breakIndex,
    totalEvents: reportedTotal,
  };
}

function normalizeAuditEvent(value: unknown, index: number): AuditEventSummary {
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

  const readString = (key: string, fallback: string): string => {
    const rawValue = value[key];
    return typeof rawValue === 'string' && rawValue.length > 0 ? rawValue : fallback;
  };

  const result =
    typeof value.result === 'string'
      ? value.result
      : typeof value.error === 'string'
        ? value.error
        : 'N/A';

  const hashPrefix =
    typeof value.currentHash === 'string' && value.currentHash.length > 0
      ? value.currentHash.slice(0, 12)
      : undefined;

  const timestamp =
    typeof value.timestamp === 'string'
      ? value.timestamp
      : typeof value.occurredAt === 'string'
        ? value.occurredAt
        : undefined;

  return {
    index,
    type: readString('type', 'UNKNOWN'),
    step:
      typeof value.step === 'string'
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

export class MockTriageAgent implements TriageAgent {
  async assessTriage(symptoms: readonly string[]): Promise<TriageResult> {
    const normalizedSymptoms = normalizeSymptoms(symptoms);
    const has = (phrase: string): boolean =>
      normalizedSymptoms.some((symptom) => symptom.includes(phrase));

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

export class MockConsentEngine implements ConsentEngine {
  async verifyConsent(patientId: string): Promise<ConsentDecision> {
    const denied =
      patientId.toLowerCase().startsWith('deny-') ||
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

export class MockIdentityBridge implements IdentityBridge {
  async acquireToken(patientId: string): Promise<IdentityToken> {
    const tokenSeed = createHash('sha256')
      .update(`${patientId}:${Date.now()}:${randomUUID()}`)
      .digest('hex')
      .slice(0, 24);

    return {
      accessToken: `mock_token_${tokenSeed}`,
      expiresInSeconds: 3_600,
      issuedAt: nowIsoString(),
    };
  }
}

export class MockFhirClient implements FhirClient {
  async readResource(
    resourceType: FhirResourceType,
    patientId: string,
    _token: IdentityToken,
  ): Promise<FhirResourceRecord> {
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

export class MockCareCoordinator implements CareCoordinator {
  async coordinateCare(triageResult: TriageResult): Promise<CareCoordinationResult> {
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
    } satisfies Record<
      CarePathway,
      Omit<CareCoordinationResult, 'pathway' | 'completed'>
    >;

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

export class AtlasWithLogging {
  private readonly config: AtlasWithLoggingConfig;
  private readonly triageAgent: TriageAgent;
  private readonly consentEngine: ConsentEngine;
  private readonly identityBridge: IdentityBridge;
  private readonly fhirClient: FhirClient;
  private readonly careCoordinator: CareCoordinator;
  private readonly auditLogger: VerificationAuditLoggerLike;
  private readonly logGateway: VerificationLogGateway;

  constructor(options: AtlasWithLoggingOptions = {}) {
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

  async previewTriage(symptoms: readonly string[]): Promise<TriageResult> {
    assertValidSymptoms(symptoms);
    return this.triageAgent.assessTriage(normalizeSymptoms(symptoms));
  }

  async processPatientRequest(
    patientId: string,
    symptoms: readonly string[],
    options: ProcessRequestOptions = {},
  ): Promise<ProcessPatientResult> {
    const startedAtMs = Date.now();
    const requestContext: RequestContext = {
      requestId: options.requestId ?? randomUUID(),
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
      await this.logGateway.info(
        requestContext,
        'proxy',
        'PATIENT_INPUT',
        `received_${normalizedSymptoms.length}_symptoms (${truncate(normalizedSymptoms.join(', '), 80)})`,
      );

      const consent = await this.runLoggedStep(
        requestContext,
        'consent',
        'VERIFY',
        () => this.consentEngine.verifyConsent(patientId),
        {
          timeoutMs: options.timeoutMs,
          successText: (result) => (result.allowed ? 'SUCCESS' : 'DENIED'),
        },
      );

      if (!consent.allowed) {
        await this.logGateway.error(
          requestContext,
          'system',
          'ACCESS_DENIED',
          consent.reason ?? 'Consent denied',
        );
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

      const clinicalContext = await this.fetchClinicalContext(
        requestContext,
        patientId,
        requestedResources,
        options.timeoutMs,
      );

      const triageResult = await this.runLoggedStep(
        requestContext,
        'triage',
        'CLASSIFY',
        () => this.triageAgent.assessTriage(normalizedSymptoms, clinicalContext),
        {
          timeoutMs: options.timeoutMs,
          successText: (result) => `${result.urgency} (${result.confidence.toFixed(2)})`,
        },
      );

      const coordination = await this.runLoggedStep(
        requestContext,
        'coordinator',
        'COORDINATE',
        () => this.careCoordinator.coordinateCare(triageResult),
        {
          timeoutMs: options.timeoutMs,
          successText: (result) => result.pathway,
        },
      );

      await this.logGateway.info(
        requestContext,
        'proxy',
        'NOTIFY_PATIENT',
        coordination.patientMessage,
      );

      await this.logGateway.info(
        requestContext,
        'system',
        'NOTIFY_PROVIDER',
        coordination.providerDisposition,
      );

      const preValidation = await this.logGateway.validateChain();
      await this.logGateway.info(
        requestContext,
        'audit',
        'VERIFY_CHAIN',
        preValidation.valid ? 'HASH_OK' : 'HASH_BROKEN',
      );

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
    } catch (error) {
      await this.logGateway.error(
        requestContext,
        'system',
        'PROCESSING_ERROR',
        summarizeError(error),
      );

      const auditReport = await this.logGateway.getAuditReport(1);
      const durationMs = Date.now() - startedAtMs;
      const code =
        error instanceof AtlasError ? error.code : ('PROCESSING_ERROR' as const);

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

  async processBatchRequests(
    requests: readonly BatchPatientRequest[],
    concurrency = this.config.batchConcurrency,
  ): Promise<readonly ProcessPatientResult[]> {
    if (requests.length === 0) {
      return [];
    }

    const safeConcurrency = clampInteger(concurrency, 1, 32);
    const results: ProcessPatientResult[] = new Array(requests.length);
    let nextIndex = 0;

    const worker = async (): Promise<void> => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;

        if (index >= requests.length) {
          return;
        }

        const request = requests[index]!;
        results[index] = await this.processPatientRequest(
          request.patientId,
          request.symptoms,
          request.options,
        );
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(safeConcurrency, requests.length) }, () => worker()),
    );

    return results;
  }

  async getAuditReport(limit = this.config.maxAuditEventsInReport): Promise<AuditReport> {
    return this.logGateway.getAuditReport(limit);
  }

  async getSystemSnapshot(): Promise<SystemSnapshot> {
    const auditReport = await this.getAuditReport(this.config.maxAuditEventsInReport);
    const recentModuleCounts: Record<string, number> = {};

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

  summarizeResult(result: ProcessPatientResult): string {
    if (!result.success) {
      return `FAILED | code=${result.code} | audit=${result.audit.valid ? 'VALID' : 'BROKEN'} | ${result.durationMs}ms`;
    }

    return `${result.triage.urgency} → ${result.triage.pathway} | confidence=${result.triage.confidence.toFixed(
      2,
    )} | audit=${result.audit.valid ? 'VALID' : 'BROKEN'} | ${result.durationMs}ms`;
  }

  private async fetchClinicalContext(
    context: RequestContext,
    patientId: string,
    requestedResources: readonly FhirResourceType[],
    timeoutMs?: number,
  ): Promise<ClinicalContextBundle> {
    const requestedSet = new Set<FhirResourceType>(requestedResources);

    const token = await this.runLoggedStep(
      context,
      'identity',
      'TOKEN_ACQUIRE',
      () => this.identityBridge.acquireToken(patientId),
      {
        timeoutMs,
        successText: 'SUCCESS',
      },
    );

    const patientResource = requestedSet.has('Patient')
      ? await this.runLoggedStep(
          context,
          'fhir',
          'READ_Patient',
          () => this.fhirClient.readResource('Patient', patientId, token),
          {
            timeoutMs,
            successText: 'SUCCESS',
          },
        )
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

  private async readBestEffortResource(
    context: RequestContext,
    resourceType: FhirResourceType,
    patientId: string,
    token: IdentityToken,
    timeoutMs?: number,
  ): Promise<FhirResourceRecord> {
    const action = `READ_${resourceType}` as const;

    try {
      return await this.runLoggedStep(
        context,
        'fhir',
        action,
        () => this.fhirClient.readResource(resourceType, patientId, token),
        {
          timeoutMs,
          successText: 'SUCCESS',
        },
      );
    } catch (error) {
      await this.logGateway.info(
        context,
        'fhir',
        action,
        `DEGRADED (${truncate(summarizeError(error), 80)})`,
      );

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

  private async runLoggedStep<T>(
    context: RequestContext,
    module: AtlasModule,
    action: string,
    work: () => Promise<T>,
    options: {
      readonly timeoutMs?: number;
      readonly successText: string | ((value: T) => string);
    },
  ): Promise<T> {
    await this.logGateway.info(context, module, action, 'PROCESSING');

    try {
      const timeoutMs = options.timeoutMs ?? this.config.defaultTimeoutMs;
      const result = await withTimeout(work(), timeoutMs, `${module}.${action}`);
      const successText =
        typeof options.successText === 'function'
          ? options.successText(result)
          : options.successText;

      await this.logGateway.info(context, module, action, successText);
      return result;
    } catch (error) {
      await this.logGateway.error(context, module, `${action}_ERROR`, summarizeError(error));
      throw error;
    }
  }

  private summarizeSuccessfulOutcome(
    triageResult: TriageResult,
    coordination: CareCoordinationResult,
    durationMs: number,
  ): string {
    return `${triageResult.urgency} triage routed to ${coordination.pathway} in ${durationMs}ms`;
  }
}

export async function demonstrateAtlasWithLogging(): Promise<AtlasWithLogging> {
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
  ] as const;

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
    } else {
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

  console.table(
    auditReport.events.map((event) => ({
      '#': event.index,
      step: event.step,
      module: event.module,
      action: event.action,
      result: event.result,
      hash: event.hashPrefix ?? 'n/a',
    })),
  );

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

export default AtlasWithLogging;