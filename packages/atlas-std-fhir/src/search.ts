// search.ts
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AtlasFhirClient } from './client';

// ==================== Search Builder (unchanged, but with minor improvements) ====================
export class FhirSearchBuilder {
  private params: Map<string, string[]> = new Map();

  addParam(key: string, value: string): FhirSearchBuilder {
    if (!this.params.has(key)) this.params.set(key, []);
    this.params.get(key)!.push(value);
    return this;
  }

  addParams(key: string, values: string[]): FhirSearchBuilder {
    if (!this.params.has(key)) this.params.set(key, []);
    this.params.get(key)!.push(...values);
    return this;
  }

  patient(patientId: string): FhirSearchBuilder {
    return this.addParam('patient', patientId);
  }

  subject(subjectId: string): FhirSearchBuilder {
    return this.addParam('subject', subjectId);
  }

  code(system: string, code: string): FhirSearchBuilder {
    return this.addParam('code', `${system}|${code}`);
  }

  codeOnly(code: string): FhirSearchBuilder {
    return this.addParam('code', code);
  }

  category(category: string): FhirSearchBuilder {
    return this.addParam('category', category);
  }

  status(status: string): FhirSearchBuilder {
    return this.addParam('status', status);
  }

  clinicalStatus(clinicalStatus: string): FhirSearchBuilder {
    return this.addParam('clinical-status', clinicalStatus);
  }

  verificationStatus(verificationStatus: string): FhirSearchBuilder {
    return this.addParam('verification-status', verificationStatus);
  }

  dateRange(start: string, end?: string): FhirSearchBuilder {
    if (end) return this.addParam('date', `ge${start}&le${end}`);
    return this.addParam('date', `ge${start}`);
  }

  date(date: string): FhirSearchBuilder {
    return this.addParam('date', date);
  }

  lastUpdated(start: string, end?: string): FhirSearchBuilder {
    if (end) return this.addParam('_lastUpdated', `ge${start}&le${end}`);
    return this.addParam('_lastUpdated', `ge${start}`);
  }

  identifier(system: string, value: string): FhirSearchBuilder {
    return this.addParam('identifier', `${system}|${value}`);
  }

  identifierOnly(value: string): FhirSearchBuilder {
    return this.addParam('identifier', value);
  }

  name(name: string, exact: boolean = false): FhirSearchBuilder {
    return this.addParam('name', exact ? name : `${name}*`);
  }

  family(family: string, exact: boolean = false): FhirSearchBuilder {
    return this.addParam('family', exact ? family : `${family}*`);
  }

  given(given: string, exact: boolean = false): FhirSearchBuilder {
    return this.addParam('given', exact ? given : `${given}*`);
  }

  gender(gender: string): FhirSearchBuilder {
    return this.addParam('gender', gender);
  }

  birthDate(birthDate: string): FhirSearchBuilder {
    return this.addParam('birthdate', birthDate);
  }

  address(address: string): FhirSearchBuilder {
    return this.addParam('address', address);
  }

  city(city: string): FhirSearchBuilder {
    return this.addParam('city', city);
  }

  state(state: string): FhirSearchBuilder {
    return this.addParam('state', state);
  }

  postalCode(postalCode: string): FhirSearchBuilder {
    return this.addParam('postalCode', postalCode);
  }

  telecom(telecom: string): FhirSearchBuilder {
    return this.addParam('telecom', telecom);
  }

  email(email: string): FhirSearchBuilder {
    return this.addParam('email', email);
  }

  phone(phone: string): FhirSearchBuilder {
    return this.addParam('phone', phone);
  }

  organization(organizationId: string): FhirSearchBuilder {
    return this.addParam('organization', organizationId);
  }

  encounter(encounterId: string): FhirSearchBuilder {
    return this.addParam('encounter', encounterId);
  }

  performer(performerId: string): FhirSearchBuilder {
    return this.addParam('performer', performerId);
  }

  author(authorId: string): FhirSearchBuilder {
    return this.addParam('author', authorId);
  }

  priority(priority: string): FhirSearchBuilder {
    return this.addParam('priority', priority);
  }

  intent(intent: string): FhirSearchBuilder {
    return this.addParam('intent', intent);
  }

  quantity(value: number, comparator?: string): FhirSearchBuilder {
    const valueStr = comparator ? `${comparator}${value}` : value.toString();
    return this.addParam('value-quantity', valueStr);
  }

  has(has: string): FhirSearchBuilder {
    return this.addParam('_has', has);
  }

  include(include: string): FhirSearchBuilder {
    return this.addParam('_include', include);
  }

  revInclude(revInclude: string): FhirSearchBuilder {
    return this.addParam('_revinclude', revInclude);
  }

  sort(sort: string): FhirSearchBuilder {
    return this.addParam('_sort', sort);
  }

  count(count: number): FhirSearchBuilder {
    return this.addParam('_count', count.toString());
  }

  page(page: number): FhirSearchBuilder {
    return this.addParam('_page', page.toString());
  }

  summary(summary: 'true' | 'false' | 'text' | 'data' | 'count'): FhirSearchBuilder {
    return this.addParam('_summary', summary);
  }

  elements(elements: string[]): FhirSearchBuilder {
    return this.addParam('_elements', elements.join(','));
  }

  tags(tags: string[]): FhirSearchBuilder {
    return this.addParams('_tag', tags);
  }

  profile(profile: string): FhirSearchBuilder {
    return this.addParam('_profile', profile);
  }

  security(security: string): FhirSearchBuilder {
    return this.addParam('_security', security);
  }

  text(text: string): FhirSearchBuilder {
    return this.addParam('_text', text);
  }

  content(content: string): FhirSearchBuilder {
    return this.addParam('_content', content);
  }

  filter(filter: string): FhirSearchBuilder {
    return this.addParam('_filter', filter);
  }

  build(): URLSearchParams {
    const searchParams = new URLSearchParams();
    this.params.forEach((values, key) => {
      values.forEach(value => searchParams.append(key, value));
    });
    return searchParams;
  }

  buildQueryString(): string {
    return this.build().toString();
  }

  buildObject(): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};
    this.params.forEach((values, key) => {
      result[key] = values.length === 1 ? values[0] : values;
    });
    return result;
  }

  clear(): FhirSearchBuilder {
    this.params.clear();
    return this;
  }

  clone(): FhirSearchBuilder {
    const newBuilder = new FhirSearchBuilder();
    this.params.forEach((values, key) => newBuilder.addParams(key, values));
    return newBuilder;
  }

  size(): number {
    return this.params.size;
  }

  hasParam(key: string): boolean {
    return this.params.has(key);
  }

  getParam(key: string): string[] | undefined {
    return this.params.get(key);
  }

  removeParam(key: string): FhirSearchBuilder {
    this.params.delete(key);
    return this;
  }
}

// ==================== Common Searches (unchanged) ====================
export class CommonSearches {
  static activePatients(): FhirSearchBuilder {
    return new FhirSearchBuilder().status('active');
  }

  static patientsByName(name: string, exact: boolean = false): FhirSearchBuilder {
    return new FhirSearchBuilder().name(name, exact);
  }

  static vitalSigns(patientId: string, dateRange?: { start: string; end: string }): FhirSearchBuilder {
    const builder = new FhirSearchBuilder().patient(patientId).category('vital-signs').status('final');
    if (dateRange) builder.dateRange(dateRange.start, dateRange.end);
    return builder;
  }

  static labResults(patientId: string, dateRange?: { start: string; end: string }): FhirSearchBuilder {
    const builder = new FhirSearchBuilder().patient(patientId).category('laboratory').status('final');
    if (dateRange) builder.dateRange(dateRange.start, dateRange.end);
    return builder;
  }

  static activeConditions(patientId: string): FhirSearchBuilder {
    return new FhirSearchBuilder().patient(patientId).clinicalStatus('active');
  }

  static activeMedications(patientId: string): FhirSearchBuilder {
    return new FhirSearchBuilder().patient(patientId).status('active');
  }

  static patientEncounters(patientId: string, status?: string): FhirSearchBuilder {
    const builder = new FhirSearchBuilder().patient(patientId);
    if (status) builder.status(status);
    return builder;
  }

  static activeReferrals(patientId: string): FhirSearchBuilder {
    return new FhirSearchBuilder().patient(patientId).category('referral').status('active');
  }

  static byLoincCode(patientId: string, loincCode: string): FhirSearchBuilder {
    return new FhirSearchBuilder().patient(patientId).code('http://loinc.org', loincCode);
  }

  static bySnomedCode(patientId: string, snomedCode: string): FhirSearchBuilder {
    return new FhirSearchBuilder().patient(patientId).code('http://snomed.info/sct', snomedCode);
  }

  static byIcd10Code(patientId: string, icd10Code: string): FhirSearchBuilder {
    return new FhirSearchBuilder().patient(patientId).code('http://hl7.org/fhir/sid/icd-10', icd10Code);
  }

  static byRxNormCode(patientId: string, rxNormCode: string): FhirSearchBuilder {
    return new FhirSearchBuilder().patient(patientId).code('http://www.nlm.nih.gov/research/umls/rxnorm', rxNormCode);
  }
}

// ==================== Search Service with Observability ====================
export interface SearchServiceConfig {
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

const defaultConfig: SearchServiceConfig = {
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
export class SearchServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'SearchServiceError';
  }
}

// ==================== Metrics ====================
interface MetricsSnapshot {
  searchCount: number;
  successCount: number;
  failureCount: number;
  errorCount: number;
  lastError?: string;
  resourceTypeDistribution: Record<string, number>;
  durationHistogram: number[];
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();
  private readonly histogramBuckets = [0, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000];

  recordSearch(
    moduleId: string,
    resourceType: string,
    durationMs: number,
    success: boolean,
    error?: string
  ): void {
    const key = moduleId;
    let current = this.metrics.get(key);
    if (!current) {
      current = {
        searchCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        resourceTypeDistribution: {},
        durationHistogram: new Array(this.histogramBuckets.length).fill(0),
      };
    }

    current.searchCount++;
    if (success) {
      current.successCount++;
    } else {
      current.failureCount++;
      if (error) {
        current.errorCount++;
        current.lastError = error;
      }
    }
    current.resourceTypeDistribution[resourceType] = (current.resourceTypeDistribution[resourceType] || 0) + 1;

    const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
    const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
    current.durationHistogram[idx]++;

    this.metrics.set(key, current);
  }

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (moduleId) {
      return this.metrics.get(moduleId) ?? {
        searchCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        resourceTypeDistribution: {},
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
  resourceType: string;
  params: Record<string, string | string[]>;
  success: boolean;
  error?: string;
  durationMs: number;
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
        return { ok: false, error: new SearchServiceError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
  constructor(private circuitBreaker: CircuitBreaker) {}

  getHealth(): HealthStatus {
    const circuitBreakers = this.circuitBreaker.getAllStates();
    const services = new Map<string, { healthy: boolean; lastFailure?: string }>();
    for (const [service, state] of circuitBreakers) {
      services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
    }
    const healthy = Array.from(services.values()).every(s => s.healthy);
    return { healthy, services, circuitBreakers };
  }
}

// ==================== Search Service ====================
export class SearchService {
  private client: AtlasFhirClient;
  private config: SearchServiceConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: ExponentialBackoffRetry;
  private healthChecker: HealthChecker;

  constructor(client: AtlasFhirClient, config: Partial<SearchServiceConfig> = {}) {
    this.client = client;
    this.config = { ...defaultConfig, ...config };
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
    this.healthChecker = new HealthChecker(this.circuitBreaker);
  }

  /**
   * Execute a search using a builder, with retry and circuit breaker.
   */
  async search(resourceType: string, builder: FhirSearchBuilder): Promise<Result<any>> {
    const span = this.tracer.startSpan('searchService.search');
    span.setAttribute('resourceType', resourceType);
    const startTime = Date.now();
    const params = builder.buildObject();

    try {
      const result = await this.circuitBreaker.call(`search-${resourceType}`, async () => {
        return await this.retryWithTimeout(() => this.client.search(resourceType, params), this.config.defaultTimeoutMs);
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics(resourceType, duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics(resourceType, duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Execute a search with custom parameters object.
   */
  async searchWithParams(resourceType: string, params: Record<string, any>): Promise<Result<any>> {
    const builder = new FhirSearchBuilder();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        builder.addParams(key, value);
      } else if (value !== undefined && value !== null) {
        builder.addParam(key, String(value));
      }
    });
    return this.search(resourceType, builder);
  }

  // Convenience methods using CommonSearches
  async findPatientsByName(name: string, exact: boolean = false): Promise<Result<any>> {
    const builder = CommonSearches.patientsByName(name, exact);
    return this.search('Patient', builder);
  }

  async findActivePatients(): Promise<Result<any>> {
    const builder = CommonSearches.activePatients();
    return this.search('Patient', builder);
  }

  async findVitalSigns(patientId: string, dateRange?: { start: string; end: string }): Promise<Result<any>> {
    const builder = CommonSearches.vitalSigns(patientId, dateRange);
    return this.search('Observation', builder);
  }

  async findLabResults(patientId: string, dateRange?: { start: string; end: string }): Promise<Result<any>> {
    const builder = CommonSearches.labResults(patientId, dateRange);
    return this.search('Observation', builder);
  }

  async findActiveConditions(patientId: string): Promise<Result<any>> {
    const builder = CommonSearches.activeConditions(patientId);
    return this.search('Condition', builder);
  }

  async findActiveMedications(patientId: string): Promise<Result<any>> {
    const builder = CommonSearches.activeMedications(patientId);
    return this.search('MedicationRequest', builder);
  }

  async findPatientEncounters(patientId: string, status?: string): Promise<Result<any>> {
    const builder = CommonSearches.patientEncounters(patientId, status);
    return this.search('Encounter', builder);
  }

  async findActiveReferrals(patientId: string): Promise<Result<any>> {
    const builder = CommonSearches.activeReferrals(patientId);
    return this.search('ServiceRequest', builder);
  }

  async findByLoincCode(patientId: string, loincCode: string): Promise<Result<any>> {
    const builder = CommonSearches.byLoincCode(patientId, loincCode);
    return this.search('Observation', builder);
  }

  async findBySnomedCode(patientId: string, snomedCode: string): Promise<Result<any>> {
    const builder = CommonSearches.bySnomedCode(patientId, snomedCode);
    return this.search('Condition', builder);
  }

  async findByIcd10Code(patientId: string, icd10Code: string): Promise<Result<any>> {
    const builder = CommonSearches.byIcd10Code(patientId, icd10Code);
    return this.search('Condition', builder);
  }

  async findByRxNormCode(patientId: string, rxNormCode: string): Promise<Result<any>> {
    const builder = CommonSearches.byRxNormCode(patientId, rxNormCode);
    return this.search('MedicationRequest', builder);
  }

  // ==================== Observability ====================
  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    return this.metrics.getMetrics(moduleId);
  }

  getEvents(): EventLog[] {
    return this.logger.getEvents();
  }

  getHealth(): HealthStatus {
    return this.healthChecker.getHealth();
  }

  getInfo(): { name: string; version: string; capabilities: string[] } {
    return {
      name: 'FHIR Search Service',
      version: '1.0.0',
      capabilities: [
        'search_execution',
        'builder_pattern',
        'common_searches',
        'circuit_breaker',
        'retry_with_backoff',
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

  private recordMetrics(resourceType: string, durationMs: number, success: boolean, error?: string): void {
    if (this.config.enableMetrics) {
      this.metrics.recordSearch('search-service', resourceType, durationMs, success, error);
    }
    if (this.config.enableEventLogging) {
      this.logger.log({
        id: uuidv4(),
        type: 'SEARCH',
        timestamp: new Date().toISOString(),
        source: 'search-service',
        resourceType,
        params: {}, // params could be passed if needed
        success,
        error,
        durationMs,
      });
    }
  }
}

// ==================== Convenience Factory ====================
export function createSearchService(client: AtlasFhirClient, config?: Partial<SearchServiceConfig>): SearchService {
  return new SearchService(client, config);
}