import { createAtlasFhir } from '@atlas-std/fhir';
import { createHash, randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';

// ============================================================================
// FHIR SCHEMAS
// ============================================================================

const CodingSchema = z.object({
  system: z.string().min(1).optional(), // URI in FHIR is not always a URL
  code: z.string().min(1).optional(),
  display: z.string().min(1).optional(),
}).passthrough();

const CodeableConceptSchema = z.object({
  coding: z.array(CodingSchema).optional(),
  text: z.string().min(1).optional(),
}).passthrough();

const ReferenceSchema = z.object({
  reference: z.string().min(1),
}).passthrough();

const QuantitySchema = z.object({
  value: z.number(),
  unit: z.string().min(1),
  system: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
}).passthrough();

const HumanNameSchema = z.object({
  use: z.string().min(1).optional(),
  family: z.string().min(1).optional(),
  given: z.array(z.string().min(1)).optional(),
  text: z.string().min(1).optional(),
}).passthrough();

const DosageInstructionSchema = z.object({
  text: z.string().min(1).optional(),
  timing: z.object({
    repeat: z.object({
      frequency: z.number().optional(),
      period: z.number().optional(),
      periodUnit: z.string().min(1).optional(),
    }).optional(),
  }).optional(),
}).passthrough();

export const FhirPatientSchema = z.object({
  id: z.string().min(1),
  resourceType: z.literal('Patient'),
  name: z.array(HumanNameSchema).optional(),
  birthDate: z.string().min(1).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  active: z.boolean().optional(),
}).passthrough();

export const FhirObservationSchema = z.object({
  id: z.string().min(1),
  resourceType: z.literal('Observation'),
  status: z.string().min(1),
  code: CodeableConceptSchema,
  subject: ReferenceSchema.optional(),
  effectiveDateTime: z.string().min(1).optional(),
  valueQuantity: QuantitySchema.optional(),
  component: z.array(z.object({
    code: CodeableConceptSchema,
    valueQuantity: QuantitySchema.optional(),
  }).passthrough()).optional(),
}).passthrough();

export const FhirMedicationRequestSchema = z.object({
  id: z.string().min(1),
  resourceType: z.literal('MedicationRequest'),
  status: z.string().min(1),
  intent: z.string().min(1),
  medicationCodeableConcept: CodeableConceptSchema.optional(),
  subject: ReferenceSchema,
  authoredOn: z.string().min(1).optional(),
  dosageInstruction: z.array(DosageInstructionSchema).optional(),
}).passthrough();

export const FhirConditionSchema = z.object({
  id: z.string().min(1),
  resourceType: z.literal('Condition'),
  clinicalStatus: CodeableConceptSchema.optional(),
  code: CodeableConceptSchema,
  subject: ReferenceSchema,
  recordedDate: z.string().min(1).optional(),
  severity: CodeableConceptSchema.optional(),
}).passthrough();

export type FhirPatient = z.infer<typeof FhirPatientSchema>;
export type FhirObservation = z.infer<typeof FhirObservationSchema>;
export type FhirMedicationRequest = z.infer<typeof FhirMedicationRequestSchema>;
export type FhirCondition = z.infer<typeof FhirConditionSchema>;

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export interface SHARPContextMetadata extends Readonly<Record<string, unknown>> {
  readonly fhirScopes: readonly string[];
  readonly consentScopes: readonly string[];
}

export interface SHARPContext {
  readonly patientId: string;
  readonly sessionId: string;
  readonly timestamp: Date;
  readonly propagationToken: string;
  readonly fhirToken?: string;
  readonly consentToken?: string;
  readonly metadata: SHARPContextMetadata;
}

export interface SHARPFhirConfig {
  readonly fhirBaseUrl: string;
  readonly fhirToken?: string;
  readonly consentScopes: readonly string[];
  readonly defaultFhirScopes: readonly string[];
  readonly patientId?: string;
  readonly sessionId?: string;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly retryBaseDelayMs: number;
  readonly retryMaxDelayMs: number;
  readonly retryJitterRatio: number;
  readonly cacheTTL: number;
  readonly lockTTL: number;
  readonly sessionSecret: string;
  readonly cacheStore?: CacheStore;
  readonly lockProvider?: LockProvider;
  readonly auditLogger?: AuditLogger;
  readonly gateway?: FhirGateway;
  readonly now?: () => Date;
}

export interface ClinicalContext {
  readonly patientId: string;
  readonly timestamp: Date;
  readonly patient?: PatientInfo;
  readonly vitals?: Vitals;
  readonly medications: ReadonlyArray<MedicationInfo>;
  readonly conditions: ReadonlyArray<ConditionInfo>;
  readonly sharpContext?: {
    readonly sessionId: string;
    readonly propagationToken: string;
  };
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface PatientInfo {
  readonly id: string;
  readonly name: string;
  readonly birthDate?: string;
  readonly gender?: string;
  readonly age: number | null;
}

export interface Vitals {
  readonly heartRate?: VitalReading;
  readonly bloodPressure?: BloodPressureReading;
  readonly temperature?: VitalReading;
  readonly oxygenSaturation?: VitalReading;
  readonly respiratoryRate?: VitalReading;
}

export interface VitalReading {
  readonly value: number;
  readonly unit: string;
  readonly timestamp?: Date;
}

export interface BloodPressureReading {
  readonly systolic: number;
  readonly diastolic: number;
  readonly unit: string;
}

export interface MedicationInfo {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly dosage?: string;
  readonly frequency?: string;
  readonly prescribedDate?: Date;
}

export interface ConditionInfo {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly status?: string;
  readonly recordedDate?: Date;
  readonly severity?: string;
}

export interface ClinicalAlert {
  readonly code:
    | 'tachycardia'
    | 'bradycardia'
    | 'hypertension'
    | 'hypertensive_crisis'
    | 'fever'
    | 'hypoxia'
    | 'tachypnea'
    | 'bradypnea';
  readonly severity: 'info' | 'warning' | 'critical';
  readonly message: string;
  readonly observedAt?: Date;
  readonly value?: number;
  readonly unit?: string;
}

export interface ClinicalInsights {
  readonly patientId: string;
  readonly derivedAt: Date;
  readonly acuity: 'low' | 'medium' | 'high';
  readonly alerts: ReadonlyArray<ClinicalAlert>;
  readonly summary: ReadonlyArray<string>;
}

export interface PatientTimelineEvent {
  readonly at: Date;
  readonly type: 'observation' | 'medication' | 'condition';
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly status?: string | unknown;
}

export interface PatientTimeline {
  readonly patientId: string;
  readonly generatedAt: Date;
  readonly events: ReadonlyArray<PatientTimelineEvent>;
  readonly errors: Readonly<Record<string, string>>;
}

export interface AuditEntry {
  readonly timestamp: Date;
  readonly requestId: string;
  readonly operation: string;
  readonly patientId: string;
  readonly success: boolean;
  readonly durationMs?: number;
  readonly errorCode?: string;
  readonly error?: string;
  readonly sharpSessionId?: string;
  readonly metadata?: Record<string, unknown>;
}

export type AuditLogger = (entry: AuditEntry) => void | Promise<void>;

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class SHARPFhirError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    cause?: Error,
  ) {
    super(message);
    this.name = 'SHARPFhirError';
    this.code = code;
    this.context = context;
    this.cause = cause;
  }
}

export class AuthorizationError extends SHARPFhirError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', context);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends SHARPFhirError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class ResourceNotFoundError extends SHARPFhirError {
  constructor(resourceType: string, id: string, context?: Record<string, unknown>, cause?: Error) {
    super(`${resourceType} with id ${id} not found`, 'RESOURCE_NOT_FOUND', { resourceType, id, ...context }, cause);
    this.name = 'ResourceNotFoundError';
  }
}

export class TransportError extends SHARPFhirError {
  constructor(message: string, context?: Record<string, unknown>, cause?: Error) {
    super(message, 'TRANSPORT_ERROR', context, cause);
    this.name = 'TransportError';
  }
}

export class ConfigurationError extends SHARPFhirError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}

export class DisposedError extends SHARPFhirError {
  constructor() {
    super('SHARPFhirIntegration has been disposed', 'DISPOSED');
    this.name = 'DisposedError';
  }
}

// ============================================================================
// CACHE / LOCK ABSTRACTIONS
// ============================================================================

export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByPrefix(prefix: string): Promise<number>;
  clear(): Promise<void>;
  close(): Promise<void>;
}

export interface LockLease {
  release(): Promise<void>;
}

export interface LockProvider {
  acquire(key: string, options?: { ttlMs?: number }): Promise<LockLease>;
  close(): Promise<void>;
}

interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAtEpochMs: number;
}

/**
 * In-memory cache with TTL and defensive cloning.
 * Swap this with Redis/Memcached/etc. via CacheStore for multi-node deployments.
 */
export class MemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, CacheEntry<unknown>>();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor(
    private readonly defaultTtlMs: number = 300_000,
    cleanupEveryMs: number = 60_000,
  ) {
    this.cleanupTimer = setInterval(() => this.cleanupExpired(), cleanupEveryMs);
    this.cleanupTimer.unref?.();
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() >= entry.expiresAtEpochMs) {
      this.entries.delete(key);
      return undefined;
    }

    return cloneValue(entry.value as T);
  }

  async set<T>(key: string, value: T, ttlMs: number = this.defaultTtlMs): Promise<void> {
    const effectiveTtl = positiveIntegerOrDefault(ttlMs, this.defaultTtlMs);
    this.entries.set(key, {
      value: cloneValue(value),
      expiresAtEpochMs: Date.now() + effectiveTtl,
    });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    let deleted = 0;
    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        this.entries.delete(key);
        deleted += 1;
      }
    }
    return deleted;
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }

  async close(): Promise<void> {
    clearInterval(this.cleanupTimer);
    this.entries.clear();
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries.entries()) {
      if (now >= entry.expiresAtEpochMs) {
        this.entries.delete(key);
      }
    }
  }
}

/**
 * Fair local keyed lock.
 * Swap this for a distributed lock provider in multi-instance deployments.
 */
export class LocalLockProvider implements LockProvider {
  private readonly queues = new Map<string, Array<() => void>>();

  async acquire(key: string): Promise<LockLease> {
    const queue = this.queues.get(key);

    if (!queue) {
      this.queues.set(key, []);
      return this.createLease(key);
    }

    await new Promise<void>((resolve) => {
      queue.push(resolve);
    });

    return this.createLease(key);
  }

  async close(): Promise<void> {
    this.queues.clear();
  }

  private createLease(key: string): LockLease {
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

class SingleFlight {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  async run<T>(key: string, work: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = work().finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }
}

// ============================================================================
// GATEWAY ABSTRACTION
// ============================================================================

export interface FhirSearchParams {
  readonly [key: string]: string | number | boolean | undefined;
}

export interface FhirGateway {
  readPatient(patientId: string): Promise<any>;
  searchObservations(params: FhirSearchParams): Promise<any[]>;
  searchMedicationRequests(params: FhirSearchParams): Promise<any[]>;
  searchConditions(params: FhirSearchParams): Promise<any[]>;
}

/**
 * Atlas adapter isolated behind a gateway so the integration service stays testable
 * and future transport changes remain localized.
 */
export class AtlasFhirGateway implements FhirGateway {
  private clientSnapshot?: {
    readonly token?: string;
    readonly client: any;
  };

  constructor(
    private readonly config: {
      readonly baseUrl: string;
      readonly timeoutMs: number;
      readonly getAccessToken: () => string | undefined;
    },
  ) {}

  async readPatient(patientId: string): Promise<any> {
    return this.getClient().patient.read(patientId);
  }

  async searchObservations(params: FhirSearchParams): Promise<any[]> {
    const bundle = await this.getClient().observation.search(params);
    return extractBundleResources(bundle);
  }

  async searchMedicationRequests(params: FhirSearchParams): Promise<any[]> {
    const bundle = await this.getClient().medicationRequest.search(params);
    return extractBundleResources(bundle);
  }

  async searchConditions(params: FhirSearchParams): Promise<any[]> {
    const bundle = await this.getClient().condition.search(params);
    return extractBundleResources(bundle);
  }

  private getClient(): any {
    const token = this.config.getAccessToken();

    if (!this.clientSnapshot || this.clientSnapshot.token !== token) {
      this.clientSnapshot = {
        token,
        client: createAtlasFhir({
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

// ============================================================================
// AUDIT LOGGER
// ============================================================================

export const consoleAuditLogger: AuditLogger = (entry) => {
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

type ResolvedConfig = Readonly<{
  fhirBaseUrl: string;
  fhirToken?: string;
  consentScopes: readonly string[];
  defaultFhirScopes: readonly string[];
  patientId?: string;
  sessionId?: string;
  timeout: number;
  maxRetries: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;
  retryJitterRatio: number;
  cacheTTL: number;
  lockTTL: number;
  sessionSecret: string;
  now: () => Date;
}>;

export class SHARPFhirIntegration {
  private readonly config: ResolvedConfig;
  private readonly cacheStore: CacheStore;
  private readonly lockProvider: LockProvider;
  private readonly auditLogger: AuditLogger;
  private readonly gateway: FhirGateway;
  private readonly singleFlight = new SingleFlight();

  private sharpContext: SHARPContext | null = null;
  private currentFhirToken?: string;
  private disposed = false;

  constructor(config: Partial<SHARPFhirConfig> = {}) {
    this.config = resolveConfig(config);
    this.currentFhirToken = this.config.fhirToken;

    this.cacheStore = config.cacheStore ?? new MemoryCacheStore(this.config.cacheTTL);
    this.lockProvider = config.lockProvider ?? new LocalLockProvider();
    this.auditLogger = config.auditLogger ?? consoleAuditLogger;
    this.gateway =
      config.gateway ??
      new AtlasFhirGateway({
        baseUrl: this.config.fhirBaseUrl,
        timeoutMs: this.config.timeout,
        getAccessToken: () => this.currentFhirToken,
      });

    if (this.config.patientId && this.config.sessionId) {
      this.initializeSHARPSession(
        this.config.patientId,
        this.config.sessionId,
        [...this.config.defaultFhirScopes],
        [...this.config.consentScopes],
      );
    }
  }

  // ==========================================================================
  // SHARP CONTEXT MANAGEMENT
  // ==========================================================================

  /**
   * Initializes a SHARP session and updates the effective FHIR token for the transport layer.
   */
  initializeSHARPSession(
    patientId: string,
    sessionId: string,
    fhirScopes: string[] = [...this.config.defaultFhirScopes],
    consentScopes: string[] = [...this.config.consentScopes],
  ): SHARPContext {
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

    const context: SHARPContext = deepFreeze({
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

  getSHARPContext(): Readonly<SHARPContext> | null {
    return this.sharpContext;
  }

  async propagateSHARPContext(targetAgent: string): Promise<Readonly<SHARPContext> | null> {
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

  async getFHIRAuthorization(requiredScope: string): Promise<{ authorized: boolean; token?: string }> {
    this.assertNotDisposed();

    if (!this.sharpContext) {
      return { authorized: false };
    }

    const authorized =
      Boolean(this.sharpContext.fhirToken) &&
      this.sharpContext.metadata.fhirScopes.includes(requiredScope);

    return {
      authorized,
      token: this.sharpContext.fhirToken,
    };
  }

  async getConsentAuthorization(requiredScope: string): Promise<{ authorized: boolean; patientId?: string }> {
    this.assertNotDisposed();

    if (!this.sharpContext) {
      return { authorized: false };
    }

    const authorized =
      Boolean(this.sharpContext.consentToken) &&
      this.sharpContext.metadata.consentScopes.includes(requiredScope);

    return {
      authorized,
      patientId: this.sharpContext.patientId,
    };
  }

  // ==========================================================================
  // FHIR OPERATIONS
  // ==========================================================================

  async getPatientData(patientId: string, useCache = true): Promise<FhirPatient> {
    this.assertNotDisposed();
    assertNonEmptyString(patientId, 'patientId');

    const cacheKey = this.buildCacheKey('patient', patientId);

    return this.withCachedLoad(cacheKey, useCache, async () => {
      return this.runAudited('PATIENT_READ', patientId, { cacheKey }, async () => {
        await this.requireFhirScope('read', patientId, 'patient read');

        try {
          const resource = await this.executeWithRetry(
            () => this.gateway.readPatient(patientId),
            'PATIENT_READ',
            patientId,
          );

          return parseWithSchema(FhirPatientSchema, resource, 'Invalid Patient resource received');
        } catch (error) {
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

  async getPatientObservations(
    patientId: string,
    options: {
      codes?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      useCache?: boolean;
    } = {},
  ): Promise<ReadonlyArray<FhirObservation>> {
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

        const params: FhirSearchParams = {
          patient: patientId,
          _sort: '-date',
          _count: safeLimit,
          code: normalizedCodes.length > 0 ? normalizedCodes.join(',') : undefined,
          date: options.dateRange
            ? `ge${options.dateRange.start.toISOString()},le${options.dateRange.end.toISOString()}`
            : undefined,
        };

        try {
          const resources = await this.executeWithRetry(
            () => this.gateway.searchObservations(params),
            'OBSERVATION_SEARCH',
            patientId,
          );

          return freezeArray(
            resources.map((resource) =>
              parseWithSchema(FhirObservationSchema, resource, 'Invalid Observation resource received'),
            ),
          );
        } catch (error) {
          throw this.wrapExternalError(error, {
            operation: 'OBSERVATION_SEARCH',
            patientId,
          });
        }
      });
    });
  }

  async getPatientMedications(
    patientId: string,
    status: string = 'active',
  ): Promise<ReadonlyArray<FhirMedicationRequest>> {
    this.assertNotDisposed();
    assertNonEmptyString(patientId, 'patientId');
    assertNonEmptyString(status, 'status');

    const cacheKey = this.buildCacheKey('medications', patientId, { status });

    return this.withCachedLoad(cacheKey, true, async () => {
      return this.runAudited('MEDICATION_SEARCH', patientId, { cacheKey, status }, async () => {
        await this.requireConsentScope('medication_review', patientId, 'medication review');
        await this.requireFhirScope('search', patientId, 'medication search');

        try {
          const resources = await this.executeWithRetry(
            () =>
              this.gateway.searchMedicationRequests({
                patient: patientId,
                status,
                _sort: '-authoredon',
                _count: 100,
              }),
            'MEDICATION_SEARCH',
            patientId,
          );

          return freezeArray(
            resources.map((resource) =>
              parseWithSchema(
                FhirMedicationRequestSchema,
                resource,
                'Invalid MedicationRequest resource received',
              ),
            ),
          );
        } catch (error) {
          throw this.wrapExternalError(error, {
            operation: 'MEDICATION_SEARCH',
            patientId,
          });
        }
      });
    });
  }

  async getPatientConditions(
    patientId: string,
    options: { activeOnly?: boolean; useCache?: boolean } = {},
  ): Promise<ReadonlyArray<FhirCondition>> {
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

        const params: FhirSearchParams = {
          patient: patientId,
          _sort: '-recorded-date',
          _count: 100,
          'clinical-status': options.activeOnly ? 'active' : undefined,
        };

        try {
          const resources = await this.executeWithRetry(
            () => this.gateway.searchConditions(params),
            'CONDITION_SEARCH',
            patientId,
          );

          return freezeArray(
            resources.map((resource) =>
              parseWithSchema(FhirConditionSchema, resource, 'Invalid Condition resource received'),
            ),
          );
        } catch (error) {
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

  async getClinicalContext(
    patientId: string,
    options: {
      includeVitals?: boolean;
      includeMedications?: boolean;
      includeConditions?: boolean;
      useCache?: boolean;
    } = {},
  ): Promise<ClinicalContext> {
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
    ].map((promise) => promise.then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error }),
    )));

    const metadata: Record<string, unknown> = {};

    const patient = patientResult.ok
      ? this.extractPatientInfo(patientResult.value)
      : undefined;

    if (!patientResult.ok) {
      metadata.patientError = describeError(patientResult.error);
    }

    const vitals = includeVitals && vitalsResult.ok && vitalsResult.value
      ? this.extractVitals(vitalsResult.value as any[])
      : undefined;

    if (includeVitals && !vitalsResult.ok) {
      metadata.vitalsError = describeError(vitalsResult.error);
    }

    const medications = includeMedications && medicationsResult.ok && medicationsResult.value
      ? freezeArray(this.extractMedications(medicationsResult.value as any[]))
      : freezeArray<MedicationInfo>([]);

    if (includeMedications && !medicationsResult.ok) {
      metadata.medicationsError = describeError(medicationsResult.error);
    }

    const conditions = includeConditions && conditionsResult.ok && conditionsResult.value
      ? freezeArray(this.extractConditions(conditionsResult.value as any[]))
      : freezeArray<ConditionInfo>([]);

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

  async getPatientSummary(patientId: string): Promise<{
    patient: PatientInfo;
    recentVitals: Vitals;
    activeMedicationsCount: number;
    activeConditionsCount: number;
    alerts: ReadonlyArray<ClinicalAlert>;
    lastUpdated: Date;
  }> {
    this.assertNotDisposed();
    assertNonEmptyString(patientId, 'patientId');

    const [patient, observations, medications, conditions] = await Promise.all([
      this.getPatientData(patientId),
      this.getPatientObservations(patientId, { limit: 10 }),
      this.getPatientMedications(patientId),
      this.getPatientConditions(patientId, { activeOnly: true }),
    ]);

    const recentVitals = this.extractVitals(observations as any[]);
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
  async getClinicalInsights(patientId: string): Promise<ClinicalInsights> {
    this.assertNotDisposed();
    assertNonEmptyString(patientId, 'patientId');

    const context = await this.getClinicalContext(patientId, {
      includeVitals: true,
      includeMedications: false,
      includeConditions: false,
      useCache: true,
    });

    const alerts = context.vitals ? this.detectClinicalAlerts(context.vitals) : freezeArray<ClinicalAlert>([]);
    const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length;
    const warningCount = alerts.filter((alert) => alert.severity === 'warning').length;

    const acuity: ClinicalInsights['acuity'] =
      criticalCount > 0 ? 'high' :
      warningCount >= 2 ? 'medium' :
      warningCount === 1 ? 'medium' :
      'low';

    const summary = freezeArray(
      alerts.length > 0
        ? alerts.map((alert) => alert.message)
        : ['No alert-triggering vital abnormalities detected from available data.'],
    );

    return deepFreeze({
      patientId,
      derivedAt: this.config.now(),
      acuity,
      alerts,
      summary,
    });
  }

  async getPatientTimeline(
    patientId: string,
    options: {
      limit?: number;
      includeObservations?: boolean;
      includeMedications?: boolean;
      includeConditions?: boolean;
      useCache?: boolean;
    } = {},
  ): Promise<PatientTimeline> {
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
    ].map((promise) => promise.then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error }),
    )));

    const events: PatientTimelineEvent[] = [];
    const errors: Record<string, string> = {};

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
            status: observation.status as string | undefined,
          });
        }
      } else if (!observationResult.ok) {
        errors.observations = describeError(observationResult.error);
      }
    }

    if (includeMedications) {
      if (medicationResult.ok && medicationResult.value) {
        for (const medication of medicationResult.value) {
          const at = parseDate(medication.authoredOn as string | undefined);
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
            status: extracted.status as string | undefined,
          });
        }
      } else if (!medicationResult.ok) {
        errors.medications = describeError(medicationResult.error);
      }
    }

    if (includeConditions) {
      if (conditionResult.ok && conditionResult.value) {
        for (const condition of conditionResult.value) {
          const at = parseDate(condition.recordedDate as string | undefined);
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
            status: extracted.status as string | undefined,
          });
        }
      } else if (!conditionResult.ok) {
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

  async warmPatientCache(patientId: string): Promise<{
    patientId: string;
    warmedAt: Date;
    success: boolean;
    details: Readonly<Record<string, string>>;
  }> {
    this.assertNotDisposed();
    assertNonEmptyString(patientId, 'patientId');

    const results = await Promise.allSettled([
      this.getPatientData(patientId, true),
      this.getPatientObservations(patientId, { useCache: true }),
      this.getPatientMedications(patientId),
      this.getPatientConditions(patientId, { useCache: true }),
    ]);

    const details: Record<string, string> = {};
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

  async invalidatePatientCache(patientId: string): Promise<{ patientId: string; deletedEntries: number }> {
    this.assertNotDisposed();
    assertNonEmptyString(patientId, 'patientId');

    const deletedEntries = (
      await Promise.all([
        this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('patient', patientId)),
        this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('observations', patientId)),
        this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('medications', patientId)),
        this.cacheStore.deleteByPrefix(this.buildCacheKeyPrefix('conditions', patientId)),
      ])
    ).reduce((sum, count) => sum + count, 0);

    return deepFreeze({
      patientId,
      deletedEntries,
    });
  }

  // ==========================================================================
  // PROTOCOL / HANDOFF
  // ==========================================================================

  exportSHARPProtocol(): {
    specification: string;
    version: string;
    capabilities: ReadonlyArray<string>;
  } {
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

  async createSHARPHandoff(
    fromAgent: string,
    toAgent: string,
    urgency: 'ROUTINE' | 'URGENT' | 'EMERGENT' = 'ROUTINE',
    handoffType: 'CARE_COORDINATION' | 'ESCALATION' | 'REFERRAL' | 'INFO_SHARING' = 'CARE_COORDINATION',
  ): Promise<{
    handoffId: string;
    fromAgent: string;
    toAgent: string;
    context: Readonly<SHARPContext>;
    urgency: string;
    handoffType: string;
    status: string;
    timestamp: Date;
  }> {
    this.assertNotDisposed();
    assertNonEmptyString(fromAgent, 'fromAgent');
    assertNonEmptyString(toAgent, 'toAgent');

    if (!this.sharpContext) {
      throw new SHARPFhirError('No SHARP context available for handoff', 'NO_CONTEXT');
    }

    return deepFreeze({
      handoffId: `sharp_${randomUUID()}`,
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

  async dispose(): Promise<void> {
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

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new DisposedError();
    }
  }

  private updateFhirToken(token: string): void {
    this.currentFhirToken = token;
  }

  private async requireFhirScope(requiredScope: string, patientId: string, operation: string): Promise<void> {
    const auth = await this.getFHIRAuthorization(requiredScope);
    if (!auth.authorized) {
      throw new AuthorizationError('FHIR access not authorized', {
        requiredScope,
        patientId,
        operation,
      });
    }
  }

  private async requireConsentScope(requiredScope: string, patientId: string, operation: string): Promise<void> {
    const auth = await this.getConsentAuthorization(requiredScope);
    if (!auth.authorized) {
      throw new AuthorizationError('Consent access not authorized', {
        requiredScope,
        patientId,
        operation,
      });
    }
  }

  private async withCachedLoad<T>(
    cacheKey: string,
    useCache: boolean,
    loader: () => Promise<T>,
  ): Promise<T> {
    if (useCache) {
      const cached = await this.cacheStore.get<T>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    return this.singleFlight.run(cacheKey, async () => {
      if (useCache) {
        const cached = await this.cacheStore.get<T>(cacheKey);
        if (cached !== undefined) {
          return cached;
        }
      }

      const lease = await this.lockProvider.acquire(`cache-fill:${cacheKey}`, {
        ttlMs: this.config.lockTTL,
      });

      try {
        if (useCache) {
          const cached = await this.cacheStore.get<T>(cacheKey);
          if (cached !== undefined) {
            return cached;
          }
        }

        const loaded = await loader();

        if (useCache) {
          await this.cacheStore.set(cacheKey, loaded, this.config.cacheTTL);
        }

        return loaded;
      } finally {
        await lease.release();
      }
    });
  }

  private async runAudited<T>(
    operation: string,
    patientId: string,
    metadata: Record<string, unknown>,
    work: () => Promise<T>,
  ): Promise<T> {
    const startedAt = Date.now();
    const requestId = randomUUID();

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
    } catch (error) {
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

  private emitAudit(entry: AuditEntry): void {
    void Promise.resolve(this.auditLogger(entry)).catch((error) => {
      const auditFailure = toError(error);
      console.error('[SHARP-FHIR AUDIT LOGGER FAILURE]', auditFailure.message);
    });
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    patientId: string,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt >= this.config.maxRetries || !isRetryableError(error)) {
          break;
        }

        const delayMs = this.computeRetryDelayMs(attempt);
        this.emitAudit({
          timestamp: this.config.now(),
          requestId: randomUUID(),
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

        await sleep(delayMs);
      }
    }

    throw lastError;
  }

  private computeRetryDelayMs(attempt: number): number {
    const base = Math.min(
      this.config.retryBaseDelayMs * 2 ** Math.max(0, attempt - 1),
      this.config.retryMaxDelayMs,
    );

    const jitter = Math.floor(base * this.config.retryJitterRatio * Math.random());
    return base + jitter;
  }

  private wrapExternalError(error: unknown, context: Record<string, unknown>): SHARPFhirError {
    if (error instanceof SHARPFhirError) {
      return error;
    }

    const normalized = toError(error);
    return new TransportError(normalized.message, context, normalized);
  }

  private buildCacheKey(resource: string, patientId: string, options?: unknown): string {
    return options === undefined
      ? `${resource}:${patientId}`
      : `${resource}:${patientId}:${stableStringify(options)}`;
  }

  private buildCacheKeyPrefix(resource: string, patientId: string): string {
    return `${resource}:${patientId}`;
  }

  private generateToken(namespace: string, payload: Record<string, unknown>): string {
    const hash = createHash('sha256');
    hash.update(this.config.sessionSecret);
    hash.update(':');
    hash.update(namespace);
    hash.update(':');
    hash.update(stableStringify(payload));
    return hash.digest('base64url');
  }

  private extractPatientInfo(patient: any): PatientInfo {
    const name = selectBestPatientName(patient.name);
    return deepFreeze({
      id: patient.id,
      name,
      birthDate: patient.birthDate,
      gender: patient.gender,
      age: calculateAge(patient.birthDate),
    });
  }

  private extractVitals(observations: any[]): Vitals {
    const sorted = [...observations].sort(
      (left, right) => getObservationEpochMs(right) - getObservationEpochMs(left),
    );

    const vitals: Vitals = {} as Vitals;

    for (const observation of sorted) {
      const codes = new Set((observation.code?.coding ?? []).map((coding: any) => coding.code).filter(isNonEmptyString));

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

  private extractMedications(medications: any[]): MedicationInfo[] {
    return medications.map((medication) => this.extractMedication(medication));
  }

  private extractMedication(medication: any): MedicationInfo {
    const primaryCoding = medication.medicationCodeableConcept?.coding?.[0];

    const name =
      medication.medicationCodeableConcept?.text ||
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

  private extractConditions(conditions: any[]): ConditionInfo[] {
    return conditions.map((condition) => this.extractCondition(condition));
  }

  private extractCondition(condition: any): ConditionInfo {
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

  private detectClinicalAlerts(vitals: Vitals): ReadonlyArray<ClinicalAlert> {
    const alerts: ClinicalAlert[] = [];

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
      } else if (vitals.heartRate.value < 50) {
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
      } else if (systolic >= 140 || diastolic >= 90) {
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
      } else if (vitals.temperature.value >= 38) {
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
      } else if (vitals.oxygenSaturation.value < 94) {
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
      } else if (vitals.respiratoryRate.value < 10) {
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

// ============================================================================
// FACTORY
// ============================================================================

export function createSHARPFhirIntegration(config?: Partial<SHARPFhirConfig>): SHARPFhirIntegration {
  return new SHARPFhirIntegration(config);
}

// ============================================================================
// UTILITIES
// ============================================================================

function resolveConfig(config: Partial<SHARPFhirConfig>): ResolvedConfig {
  const fhirBaseUrl = config.fhirBaseUrl ?? process.env.FHIR_BASE_URL ?? DEFAULT_FHIR_BASE_URL;
  const timeout = positiveIntegerOrDefault(config.timeout, 30_000);
  const maxRetries = positiveIntegerOrDefault(config.maxRetries, 3);
  const cacheTTL = positiveIntegerOrDefault(config.cacheTTL, 300_000);
  const lockTTL = positiveIntegerOrDefault(config.lockTTL, 10_000);
  const retryBaseDelayMs = positiveIntegerOrDefault(config.retryBaseDelayMs, 250);
  const retryMaxDelayMs = positiveIntegerOrDefault(config.retryMaxDelayMs, 5_000);
  const retryJitterRatio =
    typeof config.retryJitterRatio === 'number' && config.retryJitterRatio >= 0 && config.retryJitterRatio <= 1
      ? config.retryJitterRatio
      : 0.2;

  if (!isNonEmptyString(fhirBaseUrl)) {
    throw new ConfigurationError('fhirBaseUrl must be a non-empty string');
  }

  const consentScopes = uniqueNonEmptyStrings(
    config.consentScopes?.length
      ? config.consentScopes
      : DEFAULT_CONSENT_SCOPES,
  );

  const defaultFhirScopes = uniqueNonEmptyStrings(
    config.defaultFhirScopes?.length
      ? config.defaultFhirScopes
      : DEFAULT_FHIR_SCOPES,
  );

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
    sessionSecret:
      config.sessionSecret ??
      process.env.SHARP_SESSION_SECRET ??
      'development-only-secret',
    now: config.now ?? (() => new Date()),
  });
}

function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown, message: string): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ValidationError(message, {
      issues: result.error.issues,
    });
  }

  return result.data;
}

function extractBundleResources(bundle: unknown): any[] {
  if (!isRecord(bundle) || !Array.isArray(bundle.entry)) {
    return [];
  }

  const resources: any[] = [];

  for (const entry of bundle.entry) {
    if (isRecord(entry) && 'resource' in entry) {
      resources.push(entry.resource);
    }
  }

  return resources;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function describeError(error: unknown): string {
  return toError(error).message;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof AuthorizationError || error instanceof ValidationError || error instanceof ResourceNotFoundError) {
    return false;
  }

  const candidate = error as {
    code?: string;
    status?: number;
    statusCode?: number;
    cause?: { code?: string; status?: number; statusCode?: number };
  };

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

function isNotFoundError(error: unknown): boolean {
  const candidate = error as {
    status?: number;
    statusCode?: number;
    code?: string;
    message?: string;
  };

  return candidate?.status === 404 ||
    candidate?.statusCode === 404 ||
    candidate?.code === 'NOT_FOUND' ||
    candidate?.message?.toLowerCase().includes('not found') === true;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortRecursively(value));
}

function sortRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortRecursively);
  }

  if (isRecord(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
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

function cloneValue<T>(value: T): T {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }

  return value;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  if (value instanceof Date) {
    return Object.freeze(value);
  }

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}

function freezeArray<T>(items: T[]): ReadonlyArray<T> {
  return Object.freeze(items.slice());
}

function assertNonEmptyString(value: string, fieldName: string): void {
  if (!isNonEmptyString(value)) {
    throw new ValidationError(`${fieldName} must be a non-empty string`, {
      fieldName,
      value,
    });
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function uniqueNonEmptyStrings(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function positiveIntegerOrDefault(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
}

function clampPositiveInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(Math.trunc(value), min), max);
}

function validateDateRange(dateRange?: { start: Date; end: Date }): void {
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

function parseDate(value?: any): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function selectBestPatientName(names?: readonly z.infer<typeof HumanNameSchema>[]): string {
  if (!names || names.length === 0) {
    return 'Unknown';
  }

  const official = names.find((name) => name.use === 'official');
  const preferred = official ?? names[0];

  return preferred.text ||
    [preferred.given?.join(' '), preferred.family].filter(Boolean).join(' ').trim() ||
    'Unknown';
}

function calculateAge(birthDate?: string): number | null {
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

function getObservationEpochMs(observation: any): number {
  return parseDate(observation.effectiveDateTime)?.getTime() ?? 0;
}

function toVitalReading(observation: any): VitalReading | undefined {
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

function findObservationComponentQuantity(
  observation: any,
  componentCode: string,
): { value: number; unit: string } | undefined {
  const component = observation.component?.find((entry: any) =>
    entry.code?.coding?.some((coding: any) => coding.code === componentCode),
  );

  if (!component?.valueQuantity) {
    return undefined;
  }

  return {
    value: component.valueQuantity.value,
    unit: component.valueQuantity.unit,
  };
}

function formatMedicationFrequency(
  repeat?: {
    frequency?: number;
    period?: number;
    periodUnit?: string;
  },
): string | undefined {
  if (!repeat?.frequency || !repeat?.period || !repeat?.periodUnit) {
    return undefined;
  }

  const periodUnit = normalizePeriodUnit(repeat.periodUnit);
  return `${repeat.frequency}x every ${repeat.period} ${periodUnit}`;
}

function normalizePeriodUnit(periodUnit: string): string {
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

function getObservationLabel(observation: any): string {
  const coding = observation.code?.coding?.[0];
  return coding?.display || observation.code?.text || coding?.code || 'Observation';
}

function getObservationValueDescription(observation: any): string {
  const codes = new Set((observation.code?.coding ?? []).map((coding: any) => coding.code).filter(isNonEmptyString));

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}