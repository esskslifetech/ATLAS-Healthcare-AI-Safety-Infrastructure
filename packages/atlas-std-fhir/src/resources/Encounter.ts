// Encounter.ts
import fhirclient from 'fhirclient';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Mutex } from 'async-mutex';
import { AtlasFhirClient } from '../client';

// ==================== Schemas (unchanged) ====================
export const EncounterStatusHistorySchema = z.object({
  status: z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }),
});

export const EncounterClassHistorySchema = z.object({
  class: z.object({
    system: z.string(),
    code: z.string(),
    display: z.string().optional(),
  }),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }),
});

export const EncounterHospitalizationSchema = z.object({
  preAdmissionIdentifier: z.object({
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
  origin: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  admitSource: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }).optional(),
  reAdmission: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }).optional(),
  dietPreference: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  specialCourtesy: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  specialArrangement: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  destination: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  dischargeDisposition: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }).optional(),
});

export const EncounterLocationSchema = z.object({
  location: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }),
  status: z.enum(['active', 'reserved', 'completed', 'planned']),
  physicalType: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }).optional(),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
});

export const EncounterSchema = z.object({
  resourceType: z.literal('Encounter'),
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
  status: z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']),
  statusReason: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }).optional(),
  class: z.object({
    system: z.string(),
    code: z.string(),
    display: z.string().optional(),
  }),
  classHistory: z.array(EncounterClassHistorySchema).optional(),
  type: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  serviceType: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }).optional(),
  priority: z.number().optional(),
  subject: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  episodeOfCare: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  basedOn: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  participant: z.array(z.object({
    type: z.array(z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional(),
      })),
      text: z.string().optional(),
    })),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    individual: z.object({
      reference: z.string(),
      display: z.string().optional(),
    }),
  })).optional(),
  appointment: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  length: z.object({
    value: z.number(),
    unit: z.string(),
    system: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
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
  diagnosis: z.array(z.object({
    condition: z.object({
      reference: z.string(),
      display: z.string().optional(),
    }),
    use: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional(),
      })),
      text: z.string().optional(),
    }).optional(),
    rank: z.number().optional(),
  })).optional(),
  account: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
  hospitalization: EncounterHospitalizationSchema.optional(),
  location: z.array(EncounterLocationSchema).optional(),
  serviceProvider: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  partOf: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
});

export type Encounter = z.infer<typeof EncounterSchema>;
export type EncounterStatusHistory = z.infer<typeof EncounterStatusHistorySchema>;
export type EncounterClassHistory = z.infer<typeof EncounterClassHistorySchema>;
export type EncounterHospitalization = z.infer<typeof EncounterHospitalizationSchema>;
export type EncounterLocation = z.infer<typeof EncounterLocationSchema>;

// ==================== Configuration ====================
export interface EncounterResourceConfig {
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

const defaultConfig: EncounterResourceConfig = {
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
export class EncounterResourceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'EncounterResourceError';
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
  encounterId?: string;
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

// ==================== Encounter Resource ====================
export class EncounterResource {
  private client: AtlasFhirClient;
  private config: EncounterResourceConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RetryStrategy;
  private healthChecker: HealthChecker;

  constructor(client: AtlasFhirClient, config: Partial<EncounterResourceConfig> = {}) {
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
  async create(encounter: Encounter): Promise<Encounter> {
    const span = this.tracer.startSpan('encounter.create');
    span.setAttribute('patient', encounter.subject?.reference);
    const startTime = Date.now();

    try {
      const validated = EncounterSchema.parse(encounter);
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

  async read(id: string): Promise<Encounter> {
    const span = this.tracer.startSpan('encounter.read');
    span.setAttribute('encounter.id', id);
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.read('Encounter', id), this.config.defaultTimeoutMs);
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

  async update(encounter: Encounter): Promise<Encounter> {
    const span = this.tracer.startSpan('encounter.update');
    span.setAttribute('encounter.id', encounter.id);
    const startTime = Date.now();

    try {
      const validated = EncounterSchema.parse(encounter);
      if (!validated.id) {
        throw new EncounterResourceError('MISSING_ID', 'Encounter ID is required for update');
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
    const span = this.tracer.startSpan('encounter.delete');
    span.setAttribute('encounter.id', id);
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        await this.retryWithTimeout(() => this.client.delete('Encounter', id), this.config.defaultTimeoutMs);
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
    status?: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
    class?: string;
    type?: string;
    service_type?: string;
    location?: string;
    date?: string;
    identifier?: string;
    _count?: number;
    _page?: number;
  }): Promise<any> {
    const span = this.tracer.startSpan('encounter.search');
    span.setAttribute('params', JSON.stringify(params));
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.search('Encounter', params), this.config.defaultTimeoutMs);
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
  async getPatientEncounters(patientId: string, status?: string): Promise<any> {
    return this.search({
      patient: patientId,
      status: status as any,
    });
  }

  async createEmergencyEncounter(params: {
    patientId: string;
    arrivalDateTime: string;
    reasonForVisit?: string;
    priority?: number;
    locationId?: string;
    practitionerId?: string;
  }): Promise<Encounter> {
    const encounter: Encounter = {
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

  async updateStatus(encounterId: string, status: Encounter['status'], statusReason?: string): Promise<Encounter> {
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

  async addParticipant(encounterId: string, participant: {
    practitionerId: string;
    type: { system: string; code: string; display?: string };
  }): Promise<Encounter> {
    const encounter = await this.read(encounterId);
    if (!encounter.participant) encounter.participant = [];
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
      this.metrics.recordOperation('encounter-resource', operation, durationMs, success, error);
    }
    if (this.config.enableEventLogging) {
      this.logger.log({
        id: uuidv4(),
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

// ==================== Convenience Factory ====================
export function createEncounterResource(client: AtlasFhirClient, config?: Partial<EncounterResourceConfig>): EncounterResource {
  return new EncounterResource(client, config);
}