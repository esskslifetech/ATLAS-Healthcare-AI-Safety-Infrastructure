// Condition.ts
import fhirclient from 'fhirclient';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Mutex } from 'async-mutex';
import { AtlasFhirClient } from '../client';

// ==================== Schemas (unchanged) ====================
export const ConditionEvidenceSchema = z.object({
  code: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  detail: z.array(z.object({
    reference: z.string(),
    display: z.string().optional(),
  })).optional(),
});

export const ConditionSchema = z.object({
  resourceType: z.literal('Condition'),
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
  clinicalStatus: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
  }),
  verificationStatus: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
  }),
  category: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  severity: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
  }).optional(),
  code: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  }),
  bodySite: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional(),
    })),
    text: z.string().optional(),
  })).optional(),
  subject: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  encounter: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  onsetDateTime: z.string().optional(),
  onsetAge: z.object({
    value: z.number(),
    unit: z.string(),
    system: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  onsetPeriod: z.object({
    start: z.string(),
    end: z.string().optional(),
  }).optional(),
  onsetRange: z.object({
    low: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional(),
    }),
    high: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional(),
    }),
  }).optional(),
  abatementDateTime: z.string().optional(),
  abatementAge: z.object({
    value: z.number(),
    unit: z.string(),
    system: z.string().optional(),
    code: z.string().optional(),
  }).optional(),
  abatementPeriod: z.object({
    start: z.string(),
    end: z.string().optional(),
  }).optional(),
  abatementRange: z.object({
    low: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional(),
    }),
    high: z.object({
      value: z.number(),
      unit: z.string(),
      system: z.string().optional(),
      code: z.string().optional(),
    }),
  }).optional(),
  abatementString: z.string().optional(),
  recordedDate: z.string().optional(),
  recorder: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  asserter: z.object({
    reference: z.string(),
    display: z.string().optional(),
  }).optional(),
  note: z.array(z.object({
    authorString: z.string().optional(),
    time: z.string().optional(),
    text: z.string(),
  })).optional(),
  evidence: z.array(ConditionEvidenceSchema).optional(),
});

export type Condition = z.infer<typeof ConditionSchema>;
export type ConditionEvidence = z.infer<typeof ConditionEvidenceSchema>;

// ==================== Configuration ====================
export interface ConditionResourceConfig {
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

const defaultConfig: ConditionResourceConfig = {
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
export class ConditionResourceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ConditionResourceError';
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
  conditionId?: string;
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
        return { ok: false, error: new ConditionResourceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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

// ==================== Condition Resource ====================
export class ConditionResource {
  private client: AtlasFhirClient;
  private config: ConditionResourceConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RetryStrategy;
  private healthChecker: HealthChecker;

  constructor(client: AtlasFhirClient, config: Partial<ConditionResourceConfig> = {}) {
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
  async create(condition: Condition): Promise<Condition> {
    const span = this.tracer.startSpan('condition.create');
    span.setAttribute('patient', condition.subject?.reference);
    const startTime = Date.now();

    try {
      const validated = ConditionSchema.parse(condition);
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

  async read(id: string): Promise<Condition> {
    const span = this.tracer.startSpan('condition.read');
    span.setAttribute('condition.id', id);
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.read('Condition', id), this.config.defaultTimeoutMs);
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

  async update(condition: Condition): Promise<Condition> {
    const span = this.tracer.startSpan('condition.update');
    span.setAttribute('condition.id', condition.id);
    const startTime = Date.now();

    try {
      const validated = ConditionSchema.parse(condition);
      if (!validated.id) {
        throw new ConditionResourceError('MISSING_ID', 'Condition ID is required for update');
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
    const span = this.tracer.startSpan('condition.delete');
    span.setAttribute('condition.id', id);
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        await this.retryWithTimeout(() => this.client.delete('Condition', id), this.config.defaultTimeoutMs);
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
    clinical_status?: string;
    verification_status?: string;
    severity?: string;
    onset_date?: string;
    abatement_date?: string;
    recorded_date?: string;
    evidence_code?: string;
    _count?: number;
    _page?: number;
  }): Promise<any> {
    const span = this.tracer.startSpan('condition.search');
    span.setAttribute('params', JSON.stringify(params));
    const startTime = Date.now();

    try {
      const result = await this.circuitBreaker.call('fhir-server', async () => {
        return await this.retryWithTimeout(() => this.client.search('Condition', params), this.config.defaultTimeoutMs);
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
  async getActiveConditions(patientId: string): Promise<any> {
    return this.search({
      patient: patientId,
      clinical_status: 'active',
    });
  }

  async getByIcd10Code(patientId: string, icd10Code: string): Promise<any> {
    return this.search({
      patient: patientId,
      code: `http://hl7.org/fhir/sid/icd-10|${icd10Code}`,
    });
  }

  async getProblemList(patientId: string): Promise<any> {
    return this.search({
      patient: patientId,
      category: 'problem-list-item',
      clinical_status: 'active',
    });
  }

  async getHealthConcerns(patientId: string): Promise<any> {
    return this.search({
      patient: patientId,
      category: 'health-concern',
      clinical_status: 'active',
    });
  }

  async createCondition(params: {
    patientId: string;
    code: { system: string; code: string; display?: string };
    clinicalStatus: 'active' | 'recurrence' | 'relapse' | 'inactive' | 'remission' | 'resolved';
    verificationStatus: 'unconfirmed' | 'provisional' | 'differential' | 'confirmed' | 'refuted' | 'entered-in-error';
    category?: string;
    severity?: { system: string; code: string; display?: string };
    onsetDateTime?: string;
    recorderId?: string;
    note?: string;
  }): Promise<Condition> {
    const condition: Condition = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: params.clinicalStatus,
        }],
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: params.verificationStatus,
        }],
      },
      category: params.category ? [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: params.category,
        }],
      }] : [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'encounter-diagnosis',
        }],
      }],
      code: {
        coding: [params.code],
      },
      subject: {
        reference: `Patient/${params.patientId}`,
      },
    };

    if (params.severity) {
      condition.severity = {
        coding: [params.severity],
      };
    }

    if (params.onsetDateTime) {
      condition.onsetDateTime = params.onsetDateTime;
    }

    if (params.recorderId) {
      condition.recorder = {
        reference: `Practitioner/${params.recorderId}`,
      };
    }

    if (params.note) {
      condition.note = [{
        text: params.note,
      }];
    }

    return this.create(condition);
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
      name: 'FHIR Condition Resource',
      version: '1.0.0',
      capabilities: [
        'crud_operations',
        'search',
        'active_conditions',
        'icd10_lookup',
        'problem_list',
        'health_concerns',
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
      this.metrics.recordOperation('condition-resource', operation, durationMs, success, error);
    }
    if (this.config.enableEventLogging) {
      this.logger.log({
        id: uuidv4(),
        type: 'CONDITION_OPERATION',
        timestamp: new Date().toISOString(),
        source: 'condition-resource',
        operation,
        data: { durationMs, error },
        success,
      });
    }
  }
}