  // ReferralRequest.ts (ServiceRequest resource)
import fhirclient from 'fhirclient';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Mutex } from 'async-mutex';
import { AtlasFhirClient } from '../client';

// ==================== Schemas (unchanged) ====================
export const ServiceRequestSchema = z.object({
  resourceType: z.literal('ServiceRequest'),
  id: z.string().optional(),
  identifier: z.array(z.object({
    use: z.enum(['usual', 'official', 'temp', 'secondary', 'old']).optional(),
    type: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional(),
      })),
    }).optional(),
    system: z.string().optional(),
    value: z.string(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  })).optional(),
  instantiatesCanonical: z.array(z.string()).optional(),
  instantiatesUri: z.array(z.string()).optional(),
  basedOn: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  replaces: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  requisition: z.object({
    use: z.enum(['usual', 'official', 'temp', 'secondary', 'old']).optional(),
    type: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional(),
      })),
    }).optional(),
    system: z.string().optional(),
    value: z.string(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }).optional(),
  status: z.enum(['draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown']),
  intent: z.enum(['proposal', 'plan', 'order', 'original-order', 'reflex-order', 'filler-order', 'instance-order', 'option']),
  category: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  priority: z.enum(['routine', 'urgent', 'stat', 'asap']).optional(),
  doNotPerform: z.boolean().optional(),
  code: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }),
  orderDetail: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  quantityQuantity: z.object({
    value: z.number(),
    unit: z.string(),
    system: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  quantityRatio: z.object({
    numerator: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional(),
    }),
    denominator: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional(),
    }),
  }).optional(),
  subject: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  encounter: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  occurrenceDateTime: z.string().optional(),
  occurrencePeriod: z.object({
    start: z.string(),
    end: z.string().optional(),
  }).optional(),
  occurrenceTiming: z.object({
    event: z.array(z.string()).optional(),
    repeat: z.object({
      boundsDuration: z.object({
        value: z.number(),
        unit: z.string(),
        system: z.string().optional(),
        code: z.string().optional(),
      }).optional(),
      count: z.number().optional(),
      countMax: z.number().optional(),
      duration: z.number().optional(),
      durationMax: z.number().optional(),
      durationUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']).optional(),
      frequency: z.number().optional(),
      frequencyMax: z.number().optional(),
      period: z.number().optional(),
      periodMax: z.number().optional(),
      periodUnit: z.enum(['s', 'min', 'h', 'd', 'wk', 'mo', 'a']).optional(),
      dayOfWeek: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
      timeOfDay: z.array(z.string()).optional(),
      when: z.array(z.string()).optional(),
      offset: z.number().optional(),
    }).optional(),
    code: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional(),
      })),
      text: z.string().optional(),
    }).optional(),
  }).optional(),
  asNeededBoolean: z.boolean().optional(),
  asNeededCodeableConcept: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }).optional(),
  authoredOn: z.string().optional(),
  requester: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  performerType: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  performer: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  locationCode: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  locationReference: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  reasonCode: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  reasonReference: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  bodySite: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  note: z.array(z.object({
    authorString: z.string().optional(),
    time: z.string().optional(),
    text: z.string(),
  })).optional(),
  patientInstruction: z.string().optional(),
  relevantHistory: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
});

export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;

// ==================== Configuration ====================
export interface ReferralRequestResourceConfig {
  defaultTimeoutMs: number;
  retry: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  halfOpenMaxCalls: number;
}

const defaultConfig: ReferralRequestResourceConfig = {
  defaultTimeoutMs: 30_000,
  retry: {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 5_000,
    jitterFactor: 0.2,
  },
  circuitBreaker: {
    failureThreshold: 5,
    timeoutMs: 60_000,
    halfOpenMaxCalls: 1,
  },
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Error ====================
export class ReferralRequestResourceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ReferralRequestResourceError';
  }
}

// ==================== Metrics ====================
interface MetricsSnapshot {
  operationCount: number;
  successCount: number;
  failureCount: number;
  errorCount: number;
  lastError?: string;
  operationDistribution: Record<string, number>;
  durationHistogram: number[];
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();
  private readonly histogramBuckets = [0, 100, 500, 1000, 5000, 10000, 30000];

  recordOperation(
    moduleId: string,
    operation: string,
    durationMs: number,
    success: boolean,
    error?: string
  ): void {
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
    } else {
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

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
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

// ==================== Event Logger ====================
interface EventLog {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  operation: string;
  serviceRequestId?: string;
  patientId?: string;
  data: any;
  success: boolean;
}

class EventLogger {
  private events: EventLog[] = [];

  log(event: EventLog): void {
    this.events.push(event);
  }

  getEvents(): EventLog[] {
    return [...this.events];
  }
}

// ==================== Tracer (OpenTelemetry compatible) ====================
interface Span {
  end(): void;
  setAttribute(key: string, value: unknown): void;
  recordException(error: Error): void;
}

interface Tracer {
  startSpan(name: string, options?: { attributes?: Record<string, unknown> }): Span;
}

class NoopTracer implements Tracer {
  startSpan(): Span {
    return {
      end: () => {},
      setAttribute: () => {},
      recordException: () => {},
    };
  }
}

let globalTracer: Tracer = new NoopTracer();

export function setTracer(tracer: Tracer): void {
  globalTracer = tracer;
}

// ==================== Retry Strategy ====================
interface RetryStrategy {
  shouldRetry(attempt: number, error: Error): boolean;
  getDelay(attempt: number): number;
}

class ExponentialBackoffRetry implements RetryStrategy {
  constructor(
    private config: RetryConfig,
    private isRetryable: (error: Error) => boolean = () => true
  ) {}

  shouldRetry(attempt: number, error: Error): boolean {
    return attempt < this.config.maxAttempts && this.isRetryable(error);
  }

  getDelay(attempt: number): number {
    const baseDelay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
    const cappedDelay = Math.min(baseDelay, this.config.maxDelayMs);
    const jitter = cappedDelay * this.config.jitterFactor * (Math.random() - 0.5);
    return Math.max(0, cappedDelay + jitter);
  }
}

// ==================== Circuit Breaker ====================
interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureTime: number;
  halfOpenSuccesses: number;
}

class CircuitBreaker {
  private states = new Map<string, CircuitBreakerState>();

  constructor(private config: CircuitBreakerConfig) {}

  async call<T>(serviceName: string, fn: () => Promise<T>): Promise<Result<T>> {
    const state = this.getState(serviceName);

    if (state.state === 'OPEN') {
      const now = Date.now();
      if (now - state.lastFailureTime >= this.config.timeoutMs) {
        state.state = 'HALF_OPEN';
        state.halfOpenSuccesses = 0;
        this.states.set(serviceName, state);
      } else {
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
    } catch (err) {
      state.failures++;
      state.lastFailureTime = Date.now();
      if (state.failures >= this.config.failureThreshold) {
        state.state = 'OPEN';
      }
      this.states.set(serviceName, state);
      return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  getState(serviceName: string): CircuitBreakerState {
    return this.states.get(serviceName) ?? {
      state: 'CLOSED',
      failures: 0,
      lastFailureTime: 0,
      halfOpenSuccesses: 0,
    };
  }

  getAllStates(): Map<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number; lastFailureTime: number }> {
    return new Map(Array.from(this.states.entries()).map(([k, v]) => [k, { state: v.state, failures: v.failures, lastFailureTime: v.lastFailureTime }]));
  }
}

// ==================== Health Checker ====================
interface HealthStatus {
  healthy: boolean;
  services: Map<string, { healthy: boolean; lastFailure?: string }>;
  circuitBreakers: Map<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number }>;
}

class HealthChecker {
  constructor(private circuitBreaker: CircuitBreaker, private client: AtlasFhirClient) {}

  async check(): Promise<HealthStatus> {
    const circuitBreakers = this.circuitBreaker.getAllStates();
    const services = new Map<string, { healthy: boolean; lastFailure?: string }>();
    for (const [service, state] of circuitBreakers) {
      services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
    }

    // Also check client connectivity
    let clientHealthy = true;
    try {
      await this.client.capabilities();
    } catch (err) {
      clientHealthy = false;
    }
    services.set('fhir-server', { healthy: clientHealthy });

    const healthy = Array.from(services.values()).every(s => s.healthy);
    return { healthy, services, circuitBreakers };
  }
}

// ==================== ReferralRequest (ServiceRequest) Resource ====================
export class ReferralRequestResource {
  private client: AtlasFhirClient;
  private config: ReferralRequestResourceConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RetryStrategy;
  private healthChecker: HealthChecker;

  constructor(client: AtlasFhirClient, config: Partial<ReferralRequestResourceConfig> = {}) {
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
  async create(serviceRequest: ServiceRequest): Promise<ServiceRequest> {
    const span = this.tracer.startSpan('serviceRequest.create');
    span.setAttribute('patient', serviceRequest.subject?.reference);
    const startTime = Date.now();

    try {
      const validated = ServiceRequestSchema.parse(serviceRequest);
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.create(validated), this.config.defaultTimeoutMs);
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics('create', duration, true);
      span.end();
      return result.value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('create', duration, false, error.message);
      span.recordException(error);
      span.end();
      throw error;
    }
  }

  async read(id: string): Promise<ServiceRequest> {
    const span = this.tracer.startSpan('serviceRequest.read');
    span.setAttribute('serviceRequest.id', id);
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.read('ServiceRequest', id), this.config.defaultTimeoutMs);
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics('read', duration, true);
      span.end();
      return result.value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('read', duration, false, error.message);
      span.recordException(error);
      span.end();
      throw error;
    }
  }

  async update(serviceRequest: ServiceRequest): Promise<ServiceRequest> {
    const span = this.tracer.startSpan('serviceRequest.update');
    span.setAttribute('serviceRequest.id', serviceRequest.id);
    const startTime = Date.now();

    try {
      const validated = ServiceRequestSchema.parse(serviceRequest);
      if (!validated.id) {
        throw new ReferralRequestResourceError('MISSING_ID', 'ServiceRequest ID is required for update');
      }
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.update(validated), this.config.defaultTimeoutMs);
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics('update', duration, true);
      span.end();
      return result.value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('update', duration, false, error.message);
      span.recordException(error);
      span.end();
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const span = this.tracer.startSpan('serviceRequest.delete');
    span.setAttribute('serviceRequest.id', id);
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        await this.retryWithTimeout(() => this.client.delete('ServiceRequest', id), this.config.defaultTimeoutMs);
        return true;
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics('delete', duration, true);
      span.end();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('delete', duration, false, error.message);
      span.recordException(error);
      span.end();
      throw error;
    }
  }

  // ==================== Search ====================
  async search(params: {
    patient?: string;
    subject?: string;
    code?: string;
    category?: string;
    status?: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';
    intent?: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
    priority?: 'routine' | 'urgent' | 'stat' | 'asap';
    performer?: string;
    authoredon?: string;
    _count?: number;
    _page?: number;
  }): Promise<any> {
    const span = this.tracer.startSpan('serviceRequest.search');
    span.setAttribute('params', JSON.stringify(params));
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.search('ServiceRequest', params), this.config.defaultTimeoutMs);
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics('search', duration, true);
      span.end();
      return result.value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('search', duration, false, error.message);
      span.recordException(error);
      span.end();
      throw error;
    }
  }

  // ==================== Convenience Methods ====================
  async getActiveReferrals(patientId: string): Promise<any> {
    return this.search({
      patient: patientId,
      category: 'referral',
      status: 'active',
    });
  }

  async createReferral(params: {
    patientId: string;
    requesterId: string;
    specialty: { system: string; code: string; display?: string };
    urgency?: 'routine' | 'urgent' | 'stat' | 'asap';
    reasonForReferral?: string;
    clinicalIndications?: string;
    performerId?: string;
    encounterId?: string;
    notes?: string;
  }): Promise<ServiceRequest> {
    const serviceRequest: ServiceRequest = {
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

  async createEmergencyReferral(params: {
    patientId: string;
    requesterId: string;
    emergencyDepartmentId: string;
    reasonForVisit: string;
    clinicalIndications: string;
    priority?: 'urgent' | 'stat';
  }): Promise<ServiceRequest> {
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

  async createSpecialistReferral(params: {
    patientId: string;
    requesterId: string;
    specialty: { system: string; code: string; display?: string };
    specialistId?: string;
    reasonForReferral: string;
    clinicalIndications: string;
    urgency?: 'routine' | 'urgent';
  }): Promise<ServiceRequest> {
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

  async updateStatus(referralId: string, status: ServiceRequest['status']): Promise<ServiceRequest> {
    const referral = await this.read(referralId);
    referral.status = status;
    return this.update(referral);
  }

  // ==================== Observability ====================
  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    return this.metrics.getMetrics(moduleId);
  }

  getEvents(): EventLog[] {
    return this.logger.getEvents();
  }

  async getHealth(): Promise<HealthStatus> {
    return this.healthChecker.check();
  }

  getInfo(): { name: string; version: string; capabilities: string[] } {
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
  private async retryWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

      let attempt = 0;
      const executeWithRetry = async (): Promise<void> => {
        while (attempt < this.config.retry.maxAttempts) {
          try {
            const result = await fn();
            clearTimeout(timeoutId);
            resolve(result);
            return;
          } catch (err) {
            attempt++;
            if (!this.retryStrategy.shouldRetry(attempt, err as Error)) {
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

  private recordMetrics(operation: string, durationMs: number, success: boolean, error?: string): void {
    if (this.config.enableMetrics) {
      this.metrics.recordOperation('service-request-resource', operation, durationMs, success, error);
    }
    if (this.config.enableEventLogging) {
      this.logger.log({
        id: uuidv4(),
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

// ==================== Convenience Factory ====================
export function createReferralRequestResource(client: AtlasFhirClient, config?: Partial<ReferralRequestResourceConfig>): ReferralRequestResource {
  return new ReferralRequestResource(client, config);
}