// consent-engine.ts
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Mutex } from 'async-mutex';
import {
  ConsentPolicy,
  ConsentRequest,
  ConsentDecision,
  ConsentVerificationResult,
  ConsentAuditEntry,
  ConsentPolicySchema,
  ConsentRequestSchema,
  ConsentDecisionSchema,
  ConsentVerificationResultSchema,
  ConsentAuditEntrySchema,
  CONSENT_SCOPES,
  CONSENT_PURPOSES,
  CONSENT_STATUS,
  EMERGENCY_ACCESS_LEVELS,
} from './types';

// ==================== Configuration ====================
export interface ConsentEngineConfig {
  defaultTimeoutMs: number;
  retry: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  emergencyAccessEnabled: boolean;
  defaultEmergencyScope: string[];
  cacheTTLMs: number;               // new: cache TTL for policies
  enableCache: boolean;              // new: enable policy caching
  enableHooks: boolean;              // new: enable event hooks
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

const defaultConfig: ConsentEngineConfig = {
  defaultTimeoutMs: 5_000,
  retry: {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 5_000,
    jitterFactor: 0.2,
  },
  circuitBreaker: {
    failureThreshold: 5,
    timeoutMs: 30_000,
    halfOpenMaxCalls: 1,
  },
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
  emergencyAccessEnabled: true,
  defaultEmergencyScope: [
    'read_conditions',
    'read_medications', 
    'read_allergies',
    'read_observations',
  ],
  cacheTTLMs: 60_000,               // 1 minute
  enableCache: true,
  enableHooks: true,
};

// ==================== Custom Error Types ====================
export class ConsentEngineError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ConsentEngineError';
  }
}

export class PolicyNotFoundError extends ConsentEngineError {
  constructor(policyId: string) {
    super('POLICY_NOT_FOUND', `Policy ${policyId} not found`);
  }
}

export class InvalidScopeError extends ConsentEngineError {
  constructor(scope: string) {
    super('INVALID_SCOPE', `Invalid scope: ${scope}`);
  }
}

export class ConditionViolationError extends ConsentEngineError {
  constructor(condition: string) {
    super('CONDITION_VIOLATION', `Condition violated: ${condition}`);
  }
}

// ==================== Event Hooks ====================
export interface ConsentHooks {
  onPolicyCreated?: (policy: ConsentPolicy) => void;
  onPolicyUpdated?: (old: ConsentPolicy, newPolicy: ConsentPolicy) => void;
  onPolicyRevoked?: (policy: ConsentPolicy, reason: string) => void;
  onConsentVerified?: (request: ConsentRequest, result: ConsentVerificationResult) => void;
  onConsentDenied?: (request: ConsentRequest, reason: string) => void;
  onEmergencyAccess?: (request: ConsentRequest) => void;
}

class NoopHooks implements ConsentHooks {}

// ==================== Storage Interface (with versioning) ====================
export interface ConsentStorage {
  // Policy operations (with versioning)
  createPolicy(policy: ConsentPolicy): Promise<ConsentPolicy>;
  getPolicy(patientId: string, purpose: string): Promise<ConsentPolicy | null>;
  getPolicyById(id: string): Promise<ConsentPolicy | null>;
  updatePolicy(id: string, policy: ConsentPolicy): Promise<ConsentPolicy>;
  revokePolicy(id: string, reason?: string): Promise<ConsentPolicy>;
  getPatientPolicies(patientId: string): Promise<ConsentPolicy[]>;
  getPolicyHistory(policyId: string): Promise<ConsentPolicy[]>;   // new

  // Decision operations
  createDecision(decision: ConsentDecision): Promise<ConsentDecision>;
  getDecision(requestId: string): Promise<ConsentDecision | null>;

  // Audit operations
  addAuditEntry(entry: ConsentAuditEntry): Promise<ConsentAuditEntry>;
  getAuditEntries(patientId: string, limit?: number): Promise<ConsentAuditEntry[]>;

  // Utility
  hasActivePolicy(patientId: string, purpose: string): Promise<boolean>;
}

// ==================== In-Memory Storage (with concurrency safety) ====================
export class InMemoryConsentStorage implements ConsentStorage {
  private policies = new Map<string, ConsentPolicy>();
  private policyHistory = new Map<string, ConsentPolicy[]>(); // id -> versions
  private decisions = new Map<string, ConsentDecision>();
  private audit: ConsentAuditEntry[] = [];
  private mutex = new Mutex();

  async createPolicy(policy: ConsentPolicy): Promise<ConsentPolicy> {
    return this.mutex.runExclusive(async () => {
      const validated = ConsentPolicySchema.parse(policy);
      const id = randomUUID();
      const policyWithId = { ...validated, id, version: 1 };
      this.policies.set(id, policyWithId);
      this.policyHistory.set(id, [policyWithId]);
      return policyWithId;
    });
  }

  async getPolicy(patientId: string, purpose: string): Promise<ConsentPolicy | null> {
    return this.mutex.runExclusive(async () => {
      for (const policy of this.policies.values()) {
        if (policy.patient_id === patientId && policy.purpose === purpose && policy.status === CONSENT_STATUS.ACTIVE) {
          // Check expiry
          if (policy.expires && new Date(policy.expires) < new Date()) {
            policy.status = CONSENT_STATUS.EXPIRED;
            await this.updatePolicy(policy.id!, policy);
            continue;
          }
          return policy;
        }
      }
      return null;
    });
  }

  async getPolicyById(id: string): Promise<ConsentPolicy | null> {
    return this.mutex.runExclusive(() => this.policies.get(id) ?? null);
  }

  async updatePolicy(id: string, policy: ConsentPolicy): Promise<ConsentPolicy> {
    return this.mutex.runExclusive(async () => {
      const existing = this.policies.get(id);
      if (!existing) throw new PolicyNotFoundError(id);
      const validated = ConsentPolicySchema.parse(policy);
      const newVersion = { ...validated, id, version: (existing.version || 0) + 1 };
      this.policies.set(id, newVersion);
      const history = this.policyHistory.get(id) || [];
      history.push(newVersion);
      this.policyHistory.set(id, history);
      return newVersion;
    });
  }

  async revokePolicy(id: string, reason?: string): Promise<ConsentPolicy> {
    return this.mutex.runExclusive(async () => {
      const policy = this.policies.get(id);
      if (!policy) throw new PolicyNotFoundError(id);
      policy.status = CONSENT_STATUS.REVOKED;
      return this.updatePolicy(id, policy);
    });
  }

  async getPatientPolicies(patientId: string): Promise<ConsentPolicy[]> {
    return this.mutex.runExclusive(() =>
      Array.from(this.policies.values()).filter(p => p.patient_id === patientId)
    );
  }

  async getPolicyHistory(policyId: string): Promise<ConsentPolicy[]> {
    return this.mutex.runExclusive(() => this.policyHistory.get(policyId) ?? []);
  }

  async createDecision(decision: ConsentDecision): Promise<ConsentDecision> {
    return this.mutex.runExclusive(async () => {
      const validated = ConsentDecisionSchema.parse(decision);
      const id = randomUUID();
      const decisionWithId = { ...validated, id };
      this.decisions.set(id, decisionWithId);
      return decisionWithId;
    });
  }

  async getDecision(requestId: string): Promise<ConsentDecision | null> {
    return this.mutex.runExclusive(() => this.decisions.get(requestId) ?? null);
  }

  async addAuditEntry(entry: ConsentAuditEntry): Promise<ConsentAuditEntry> {
    return this.mutex.runExclusive(() => {
      const validated = ConsentAuditEntrySchema.parse(entry);
      this.audit.push(validated);
      return validated;
    });
  }

  async getAuditEntries(patientId: string, limit?: number): Promise<ConsentAuditEntry[]> {
    return this.mutex.runExclusive(() => {
      const entries = this.audit
        .filter(e => e.patient_id === patientId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return limit ? entries.slice(0, limit) : entries;
    });
  }

  async hasActivePolicy(patientId: string, purpose: string): Promise<boolean> {
    const policy = await this.getPolicy(patientId, purpose);
    return policy !== null;
  }
}

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Metrics (improved) ====================
export interface MetricsSnapshot {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  circuitBreakerState: string;
  timestamp: string;
  requestCount: number;
  successCount: number;
  failureCount: number;
  errorCount: number;
  lastError?: string;
  actionDistribution: Record<string, number>;
  resultDistribution: Record<string, number>;
  durationHistogram: number[];
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();
  private readonly histogramBuckets = [0, 50, 100, 200, 500, 1000, 2000, 5000];

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
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        circuitBreakerState: 'closed',
        timestamp: new Date().toISOString(),
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        actionDistribution: {},
        resultDistribution: {},
        durationHistogram: new Array(this.histogramBuckets.length).fill(0),
      };
    }

    current.requestCount++;
    if (success) {
      current.successCount++;
    } else {
      current.failureCount++;
      if (error) {
        current.errorCount++;
        current.lastError = error;
      }
    }
    current.actionDistribution[operation] = (current.actionDistribution[operation] || 0) + 1;
    current.resultDistribution[success ? 'SUCCESS' : 'FAILURE'] = (current.resultDistribution[success ? 'SUCCESS' : 'FAILURE'] || 0) + 1;

    const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
    const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
    current.durationHistogram[idx]++;

    this.metrics.set(key, current);
  }

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (moduleId) {
      return this.metrics.get(moduleId) ?? {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        circuitBreakerState: 'closed',
        timestamp: new Date().toISOString(),
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        actionDistribution: {},
        resultDistribution: {},
        durationHistogram: [],
      };
    }
    return this.metrics;
  }
}

// ==================== Event Logger (structured) ====================
interface EventLog {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  operation: string;
  patientId?: string;
  data: any;
  success: boolean;
}

class EventLogger {
  private events: EventLog[] = [];

  log(event: Omit<EventLog, 'id'>): void {
    this.events.push({ ...event, id: randomUUID() });
  }

  getEvents(): EventLog[] {
    return [...this.events];
  }
}

// ==================== Tracer (unchanged) ====================
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
class ExponentialBackoffRetry {
  constructor(private config: RetryConfig) {}

  shouldRetry(attempt: number, error: Error): boolean {
    return attempt < this.config.maxAttempts;
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
        return { ok: false, error: new ConsentEngineError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
export interface HealthStatus {
  healthy: boolean;
  services: Map<string, { healthy: boolean; lastFailure?: string }>;
  circuitBreakers: Map<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number }>;
  timestamp: string;
}

class HealthChecker {
  constructor(private circuitBreaker: CircuitBreaker, private storage: ConsentStorage) {}

  async check(): Promise<HealthStatus> {
    const circuitBreakers = this.circuitBreaker.getAllStates();
    const services = new Map<string, { healthy: boolean; lastFailure?: string }>();
    for (const [service, state] of circuitBreakers) {
      services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
    }

    // Check storage connectivity
    let storageHealthy = true;
    try {
      await this.storage.hasActivePolicy('test', CONSENT_PURPOSES.TREATMENT);
    } catch (err) {
      storageHealthy = false;
    }
    services.set('consent-storage', { healthy: storageHealthy });

    const healthy = Array.from(services.values()).every(s => s.healthy);
    return { healthy, services, circuitBreakers, timestamp: new Date().toISOString() };
  }
}

// ==================== Cache for Policies ====================
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class PolicyCache {
  private cache = new Map<string, CacheEntry<ConsentPolicy>>();
  private mutex = new Mutex();

  constructor(private ttlMs: number) {}

  async get(key: string): Promise<ConsentPolicy | null> {
    return this.mutex.runExclusive(() => {
      const entry = this.cache.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }
      return entry.value;
    });
  }

  async set(key: string, policy: ConsentPolicy): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.cache.set(key, { value: policy, expiresAt: Date.now() + this.ttlMs });
    });
  }

  async invalidate(key: string): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.cache.delete(key);
    });
  }

  async clear(): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.cache.clear();
    });
  }
}

// ==================== Main Consent Engine ====================
export class ConsentEngine {
  private storage: ConsentStorage;
  private config: ConsentEngineConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: ExponentialBackoffRetry;
  private healthChecker: HealthChecker;
  private policyCache?: PolicyCache;
  private hooks: ConsentHooks;
  private mutex: Mutex = new Mutex(); // for internal state (e.g., hooks)

  constructor(storage?: ConsentStorage, config?: Partial<ConsentEngineConfig>, hooks?: ConsentHooks) {
    this.storage = storage || new InMemoryConsentStorage();
    this.config = { ...defaultConfig, ...config };
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
    this.healthChecker = new HealthChecker(this.circuitBreaker, this.storage);
    this.hooks = hooks || new NoopHooks();

    if (this.config.enableCache) {
      this.policyCache = new PolicyCache(this.config.cacheTTLMs);
    }
  }

  // ==================== Public API ====================

  /**
   * Creates a new consent policy.
   * @param policy - The policy to create.
   * @returns Result containing the created policy or an error.
   */
  async createConsentPolicy(policy: ConsentPolicy): Promise<Result<ConsentPolicy>> {
    const span = this.tracer.startSpan('consentEngine.createConsentPolicy');
    const startTime = Date.now();
    try {
      // Optionally, validate scopes
      for (const scope of policy.scope) {
        if (!Object.values(CONSENT_SCOPES).includes(scope as any)) {
          throw new InvalidScopeError(scope);
        }
      }

      const result = await this.circuitBreaker.call('consent-storage', async () => {
        return await this.retryWithTimeout(() => this.storage.createPolicy(policy), this.config.defaultTimeoutMs);
      });
      if (!result.ok) throw result.error;
      const created = result.value;

      // Cache the policy if cache is enabled
      if (this.policyCache) {
        const cacheKey = `${created.patient_id}:${created.purpose}`;
        await this.policyCache.set(cacheKey, created);
      }

      // Log audit entry (best-effort)
      await this.storage.addAuditEntry({
        event_id: randomUUID(),
        timestamp: new Date().toISOString(),
        patient_id: policy.patient_id,
        actor: policy.granted_by,
        action: 'consent_granted',
        scope: policy.scope,
        purpose: policy.purpose,
        result: 'success',
        details: `Consent policy created for ${policy.purpose}`,
        consent_policy_id: created.id,
      }).catch(e => console.error('Failed to log audit entry:', e));

      // Trigger hook
      if (this.config.enableHooks) {
        this.hooks.onPolicyCreated?.(created);
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('createConsentPolicy', duration, true);
      span.end();
      return { ok: true, value: created };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('createConsentPolicy', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Verifies if a consent request is allowed based on active policies.
   * @param request - The consent request.
   * @returns Result containing verification result or error.
   */
  async verifyConsent(request: ConsentRequest): Promise<Result<ConsentVerificationResult>> {
    const span = this.tracer.startSpan('consentEngine.verifyConsent');
    const startTime = Date.now();
    try {
      const validatedRequest = ConsentRequestSchema.parse(request);

      // Emergency override
      if (this.config.emergencyAccessEnabled && request.context?.urgency === 'emergency') {
        const result = this.handleEmergencyAccess(validatedRequest);
        await this.logConsentVerification(validatedRequest, result);
        if (this.config.enableHooks) this.hooks.onEmergencyAccess?.(validatedRequest);
        const duration = Date.now() - startTime;
        this.recordMetrics('verifyConsent', duration, true);
        span.end();
        return { ok: true, value: result };
      }

      // Try cache first
      let policy: ConsentPolicy | null = null;
      if (this.policyCache) {
        const cacheKey = `${request.patient_id}:${request.purpose}`;
        policy = await this.policyCache.get(cacheKey);
      }

      if (!policy) {
        // Get active policy from storage
        const policyResult = await this.circuitBreaker.call('consent-storage', async () => {
          return await this.retryWithTimeout(() => this.storage.getPolicy(request.patient_id, request.purpose), this.config.defaultTimeoutMs);
        });
        if (!policyResult.ok) throw policyResult.error;
        policy = policyResult.value;

        // Cache if found
        if (policy && this.policyCache) {
          const cacheKey = `${request.patient_id}:${request.purpose}`;
          await this.policyCache.set(cacheKey, policy);
        }
      }

      if (!policy) {
        const result: ConsentVerificationResult = {
          allowed: false,
          patient_id: request.patient_id,
          requested_scope: request.requested_scope,
          granted_scope: [],
          denied_scope: request.requested_scope,
          purpose: request.purpose,
          consent_policy_id: '',
          verification_timestamp: new Date().toISOString(),
          reason: 'No active consent policy found',
        };
        await this.logConsentVerification(validatedRequest, result);
        if (this.config.enableHooks && result.reason) {
        this.hooks.onConsentDenied?.(validatedRequest, result.reason);
      }
        const duration = Date.now() - startTime;
        this.recordMetrics('verifyConsent', duration, true);
        span.end();
        return { ok: true, value: result };
      }

      // Evaluate conditions if present
      if (policy.conditions && !this.evaluateConditions(policy.conditions, request)) {
        const result: ConsentVerificationResult = {
          allowed: false,
          patient_id: request.patient_id,
          requested_scope: request.requested_scope,
          granted_scope: [],
          denied_scope: request.requested_scope,
          purpose: request.purpose,
          consent_policy_id: policy.id!,
          verification_timestamp: new Date().toISOString(),
          reason: 'Conditions not met',
        };
        await this.logConsentVerification(validatedRequest, result);
        if (this.config.enableHooks && result.reason) {
        this.hooks.onConsentDenied?.(validatedRequest, result.reason);
      }
        const duration = Date.now() - startTime;
        this.recordMetrics('verifyConsent', duration, true);
        span.end();
        return { ok: true, value: result };
      }

      // Check scopes (and granular fields if any)
      const grantedScope: string[] = [];
      const deniedScope: string[] = [];
      for (const scope of request.requested_scope) {
        if (policy.scope.includes(scope)) grantedScope.push(scope);
        else deniedScope.push(scope);
      }
      const allowed = deniedScope.length === 0;

      // If granular fields are present, also verify requested fields
      let fieldsGranted: string[] | undefined;
      let fieldsDenied: string[] | undefined;
      if (policy.granular_fields && request.requested_fields) {
        fieldsGranted = request.requested_fields.filter(f => policy.granular_fields?.includes(f));
        fieldsDenied = request.requested_fields.filter(f => !policy.granular_fields?.includes(f));
        if (fieldsDenied.length > 0 && allowed) {
          // If some fields are denied, we still consider the request partially allowed
          // but we'll report denied fields.
        }
      }

      const result: ConsentVerificationResult = {
        allowed,
        patient_id: request.patient_id,
        requested_scope: request.requested_scope,
        granted_scope: grantedScope,
        denied_scope: deniedScope,
        purpose: request.purpose,
        consent_policy_id: policy.id!,
        verification_timestamp: new Date().toISOString(),
        expires: policy.expires,
        emergency_override: false,
        reason: allowed ? 'Consent verified and granted' : 'Some requested scopes not authorized',
        conditions: Array.isArray(policy.conditions) ? policy.conditions : [],
        // Additional fields for granular data
        ...(fieldsGranted && { fields_granted: fieldsGranted }),
        ...(fieldsDenied && { fields_denied: fieldsDenied }),
      };

      await this.logConsentVerification(validatedRequest, result);
      if (this.config.enableHooks) this.hooks.onConsentVerified?.(validatedRequest, result);
      const duration = Date.now() - startTime;
      this.recordMetrics('verifyConsent', duration, true);
      span.end();
      return { ok: true, value: result };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('verifyConsent', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Records a consent decision (e.g., after user interaction).
   * @param decision - The decision to record.
   * @returns Result containing the created decision or error.
   */
  async recordDecision(decision: ConsentDecision): Promise<Result<ConsentDecision>> {
    const span = this.tracer.startSpan('consentEngine.recordDecision');
    const startTime = Date.now();
    try {
      const result = await this.circuitBreaker.call('consent-storage', async () => {
        return await this.retryWithTimeout(() => this.storage.createDecision(decision), this.config.defaultTimeoutMs);
      });
      if (!result.ok) throw result.error;
      const created = result.value;

      await this.storage.addAuditEntry({
        event_id: randomUUID(),
        timestamp: decision.decision_timestamp,
        patient_id: decision.patient_id,
        actor: decision.decision_maker,
        action: decision.decision === 'granted' ? 'consent_granted' : 'consent_denied',
        scope: decision.granted_scope || decision.denied_scope || [],
        purpose: '',
        result: 'success',
        details: decision.reason,
      }).catch(console.error);

      const duration = Date.now() - startTime;
      this.recordMetrics('recordDecision', duration, true);
      span.end();
      return { ok: true, value: created };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('recordDecision', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Revokes a consent policy.
   * @param policyId - The ID of the policy to revoke.
   * @param reason - The reason for revocation.
   * @returns Result containing the revoked policy or error.
   */
  async revokeConsent(policyId: string, reason: string): Promise<Result<ConsentPolicy>> {
    const span = this.tracer.startSpan('consentEngine.revokeConsent');
    const startTime = Date.now();
    try {
      const result = await this.circuitBreaker.call('consent-storage', async () => {
        return await this.retryWithTimeout(() => this.storage.revokePolicy(policyId, reason), this.config.defaultTimeoutMs);
      });
      if (!result.ok) throw result.error;
      const revoked = result.value;

      // Invalidate cache
      if (this.policyCache) {
        const cacheKey = `${revoked.patient_id}:${revoked.purpose}`;
        await this.policyCache.invalidate(cacheKey);
      }

      await this.storage.addAuditEntry({
        event_id: randomUUID(),
        timestamp: new Date().toISOString(),
        patient_id: revoked.patient_id,
        actor: 'patient',
        action: 'consent_revoked',
        scope: revoked.scope,
        purpose: revoked.purpose,
        result: 'success',
        details: reason,
        consent_policy_id: policyId,
      }).catch(console.error);

      if (this.config.enableHooks) this.hooks.onPolicyRevoked?.(revoked, reason);

      const duration = Date.now() - startTime;
      this.recordMetrics('revokeConsent', duration, true);
      span.end();
      return { ok: true, value: revoked };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('revokeConsent', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Gets audit entries for a patient.
   * @param patientId - The patient ID.
   * @param limit - Optional limit.
   * @returns Result containing audit entries or error.
   */
  async getConsentAudit(patientId: string, limit?: number): Promise<Result<ConsentAuditEntry[]>> {
    const span = this.tracer.startSpan('consentEngine.getConsentAudit');
    const startTime = Date.now();
    try {
      const result = await this.circuitBreaker.call('consent-storage', async () => {
        return await this.retryWithTimeout(() => this.storage.getAuditEntries(patientId, limit), this.config.defaultTimeoutMs);
      });
      if (!result.ok) throw result.error;
      const duration = Date.now() - startTime;
      this.recordMetrics('getConsentAudit', duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getConsentAudit', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Checks if the patient has any active consent policy for any purpose.
   * @param patientId - The patient ID.
   * @returns Result containing boolean or error.
   */
  async hasActiveConsent(patientId: string): Promise<Result<boolean>> {
    const span = this.tracer.startSpan('consentEngine.hasActiveConsent');
    const startTime = Date.now();
    try {
      const result = await this.circuitBreaker.call('consent-storage', async () => {
        const [treatment, coordination, ops] = await Promise.all([
          this.storage.hasActivePolicy(patientId, CONSENT_PURPOSES.TREATMENT),
          this.storage.hasActivePolicy(patientId, CONSENT_PURPOSES.CARE_COORDINATION),
          this.storage.hasActivePolicy(patientId, CONSENT_PURPOSES.HEALTHCARE_OPERATIONS),
        ]);
        return treatment || coordination || ops;
      });
      if (!result.ok) throw result.error;
      const duration = Date.now() - startTime;
      this.recordMetrics('hasActiveConsent', duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('hasActiveConsent', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Gets all consent policies for a patient.
   * @param patientId - The patient ID.
   * @returns Result containing list of policies or error.
   */
  async getPatientConsentPolicies(patientId: string): Promise<Result<ConsentPolicy[]>> {
    const span = this.tracer.startSpan('consentEngine.getPatientConsentPolicies');
    const startTime = Date.now();
    try {
      const result = await this.circuitBreaker.call('consent-storage', async () => {
        return await this.retryWithTimeout(() => this.storage.getPatientPolicies(patientId), this.config.defaultTimeoutMs);
      });
      if (!result.ok) throw result.error;
      const duration = Date.now() - startTime;
      this.recordMetrics('getPatientConsentPolicies', duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getPatientConsentPolicies', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Gets consent statistics for a patient.
   * @param patientId - The patient ID.
   * @returns Result containing statistics or error.
   */
  async getConsentStatistics(patientId: string): Promise<Result<{
    activePolicies: number;
    totalPolicies: number;
    lastActivity: string | null;
    scopesGranted: string[];
  }>> {
    const span = this.tracer.startSpan('consentEngine.getConsentStatistics');
    const startTime = Date.now();
    try {
      const policiesResult = await this.getPatientConsentPolicies(patientId);
      if (!policiesResult.ok) throw policiesResult.error;
      const policies = policiesResult.value;
      const active = policies.filter(p => p.status === CONSENT_STATUS.ACTIVE);
      const auditResult = await this.getConsentAudit(patientId, 1);
      const lastActivity = auditResult.ok && auditResult.value.length > 0 ? auditResult.value[0].timestamp : null;
      const scopes = new Set<string>();
      active.forEach(p => p.scope.forEach(s => scopes.add(s)));

      const result = {
        activePolicies: active.length,
        totalPolicies: policies.length,
        lastActivity,
        scopesGranted: Array.from(scopes),
      };
      const duration = Date.now() - startTime;
      this.recordMetrics('getConsentStatistics', duration, true);
      span.end();
      return { ok: true, value: result };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getConsentStatistics', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Creates a policy from a predefined template.
   * @param patientId - The patient ID.
   * @param templateName - The template name (e.g., 'standard_treatment', 'research').
   * @param grantedBy - Who grants the consent.
   * @returns Result containing created policy or error.
   */
  async createPolicyFromTemplate(
    patientId: string,
    templateName: 'standard_treatment' | 'research',
    grantedBy: 'patient' | 'legal_representative' | 'proxy'
  ): Promise<Result<ConsentPolicy>> {
    const template = this.getPolicyTemplate(templateName);
    const policy: ConsentPolicy = {
      ...template,
      patient_id: patientId,
      granted_by: grantedBy,
      granted_date: new Date().toISOString(),
      status: CONSENT_STATUS.ACTIVE,
      metadata: { 
        consent_method: 'electronic',
        language: 'en',
        ...template.metadata,
        template: templateName,
      },
    };
    return this.createConsentPolicy(policy);
  }

  /**
   * Gets the version history of a policy.
   * @param policyId - The policy ID.
   * @returns Result containing list of policy versions or error.
   */
  async getPolicyHistory(policyId: string): Promise<Result<ConsentPolicy[]>> {
    const span = this.tracer.startSpan('consentEngine.getPolicyHistory');
    const startTime = Date.now();
    try {
      const result = await this.circuitBreaker.call('consent-storage', async () => {
        return await this.retryWithTimeout(() => this.storage.getPolicyHistory(policyId), this.config.defaultTimeoutMs);
      });
      if (!result.ok) throw result.error;
      const duration = Date.now() - startTime;
      this.recordMetrics('getPolicyHistory', duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getPolicyHistory', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Utility Methods ====================

  /**
   * Creates a default consent policy (standard treatment).
   */
  createDefaultConsentPolicy(patientId: string, grantedBy: string): ConsentPolicy {
    return {
      patient_id: patientId,
      scope: [
        'read_conditions',
        'read_medications',
        'read_observations',
        'read_allergies',
        'read_immunizations',
        'care_coordination',
      ],
      purpose: 'treatment',
      granted_by: grantedBy as 'patient' | 'legal_representative' | 'proxy',
      granted_date: new Date().toISOString(),
      status: CONSENT_STATUS.ACTIVE,
      emergency_override: true,
      audit_required: true,
      metadata: {
        consent_method: 'electronic',
        language: 'en',
      },
    };
  }

  /**
   * Checks if requested scopes are a subset of granted scopes.
   */
  areScopesCompatible(requested: string[], granted: string[]): boolean {
    return requested.every(scope => granted.includes(scope));
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
      name: 'ATLAS Consent Engine',
      version: '2.0.0',
      capabilities: [
        'consent_policy_management',
        'consent_verification',
        'emergency_access',
        'audit_trail',
        'statistics',
        'circuit_breaker',
        'observability',
        'policy_versioning',
        'granular_fields',
        'conditions_evaluation',
        'caching',
        'hooks',
      ],
    };
  }

  // ==================== Private Helpers ====================

  private handleEmergencyAccess(request: ConsentRequest): ConsentVerificationResult {
    const emergencyScope = this.config.defaultEmergencyScope.filter(scope =>
      (request.requested_scope as string[]).includes(scope)
    );
    return {
      allowed: true,
      patient_id: request.patient_id,
      requested_scope: request.requested_scope,
      granted_scope: emergencyScope,
      denied_scope: [],
      purpose: request.purpose,
      consent_policy_id: 'emergency-override',
      verification_timestamp: new Date().toISOString(),
      emergency_override: true,
      reason: 'Emergency access granted - patient safety override',
    };
  }

  private async logConsentVerification(request: ConsentRequest, result: ConsentVerificationResult): Promise<void> {
    await this.storage.addAuditEntry({
      event_id: randomUUID(),
      timestamp: result.verification_timestamp,
      patient_id: request.patient_id,
      actor: request.requester_id,
      action: result.allowed ? 'access_granted' : 'access_denied',
      scope: request.requested_scope,
      purpose: request.purpose,
      result: result.allowed ? 'success' : 'failure',
      details: result.reason,
      ip_address: (request.context as any)?.ip_address,
      user_agent: (request.context as any)?.user_agent,
      session_id: request.context?.session_id,
      consent_policy_id: result.consent_policy_id,
    }).catch(console.error);
  }

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
      this.metrics.recordOperation('consent-engine', operation, durationMs, success, error);
    }
    if (this.config.enableEventLogging) {
      this.logger.log({
        type: 'CONSENT_OPERATION',
        timestamp: new Date().toISOString(),
        source: 'consent-engine',
        operation,
        data: { durationMs, error },
        success,
      });
    }
  }

  private evaluateConditions(conditions: any, request: ConsentRequest): boolean {
    // Simple condition evaluation: currently supports time and day restrictions.
    // Can be extended.
    if (!conditions) return true;

    if (conditions.time_range) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [startHour, startMinute] = conditions.time_range.start.split(':').map(Number);
      const [endHour, endMinute] = conditions.time_range.end.split(':').map(Number);
      const currentTotal = currentHour * 60 + currentMinute;
      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;
      if (currentTotal < startTotal || currentTotal > endTotal) {
        return false;
      }
    }

    if (conditions.days) {
      const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
      let allowed = false;
      for (const day of conditions.days) {
        if (day === 'weekday' && dayOfWeek >= 1 && dayOfWeek <= 5) allowed = true;
        if (day === 'weekend' && (dayOfWeek === 0 || dayOfWeek === 6)) allowed = true;
        if (day === 'monday' && dayOfWeek === 1) allowed = true;
        if (day === 'tuesday' && dayOfWeek === 2) allowed = true;
        if (day === 'wednesday' && dayOfWeek === 3) allowed = true;
        if (day === 'thursday' && dayOfWeek === 4) allowed = true;
        if (day === 'friday' && dayOfWeek === 5) allowed = true;
        if (day === 'saturday' && dayOfWeek === 6) allowed = true;
        if (day === 'sunday' && dayOfWeek === 0) allowed = true;
      }
      if (!allowed) return false;
    }

    // Additional conditions can be added here
    return true;
  }

  private getPolicyTemplate(templateName: string): Omit<ConsentPolicy, 'patient_id' | 'granted_by' | 'granted_date' | 'status' | 'id'> {
    const base = {
      scope: [],
      purpose: CONSENT_PURPOSES.TREATMENT,
      emergency_override: false,
      audit_required: true,
      metadata: {},
    };
    if (templateName === 'standard_treatment') {
      return {
        ...base,
        scope: [
          'read_conditions',
          'read_medications',
          'read_observations',
          'read_allergies',
          'read_immunizations',
          'care_coordination',
        ],
        purpose: 'treatment',
        metadata: { 
        consent_method: 'electronic',
        language: 'en',
        description: 'Standard treatment consent',
      },
      };
    }
    if (templateName === 'research') {
      return {
        ...base,
        scope: [
          'read_conditions',
          'read_medications',
          'read_observations',
          'read_genetic',
        ],
        purpose: 'research',
        metadata: { 
        consent_method: 'electronic',
        language: 'en',
        description: 'Research consent',
      },
      };
    }
    throw new Error(`Unknown template: ${templateName}`);
  }
}

// ==================== Convenience Factory ====================
export function createConsentEngine(
  storage?: ConsentStorage,
  config?: Partial<ConsentEngineConfig>,
  hooks?: ConsentHooks
): ConsentEngine {
  return new ConsentEngine(storage, config, hooks);
}