// client.ts
import fhirclient from 'fhirclient';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Extend AxiosRequestConfig to include custom properties
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  __startTime?: number;
}

// Type aliases for FHIR resources
type anyResource = any;
type anyBundle = any;
type anyCapabilityStatement = any;

// ==================== Configuration ====================
export const FhirConfigSchema = z.object({
  baseUrl: z.string().url(),
  auth: z.object({
    token: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    type: z.enum(['bearer', 'basic', 'oauth']).optional(),
  }).optional(),
  timeout: z.number().default(30_000),
});

export type FhirConfig = z.infer<typeof FhirConfigSchema>;

export interface ClientRetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  retryableStatuses: number[];
}

export interface ClientCircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  halfOpenMaxCalls: number;
}

export interface ClientObservabilityConfig {
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
}

const DEFAULT_RETRY: ClientRetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 10_000,
  jitterFactor: 0.2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

const DEFAULT_CIRCUIT_BREAKER: ClientCircuitBreakerConfig = {
  failureThreshold: 5,
  timeoutMs: 60_000,
  halfOpenMaxCalls: 1,
};

const DEFAULT_OBSERVABILITY: ClientObservabilityConfig = {
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Error ====================
export class FhirClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'FhirClientError';
  }
}

// ==================== Metrics ====================
interface MetricsSnapshot {
  requestCount: number;
  successCount: number;
  failureCount: number;
  errorCount: number;
  lastError?: string;
  methodDistribution: Record<string, number>;
  statusDistribution: Record<number, number>;
  durationHistogram: number[];
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();
  private readonly histogramBuckets = [0, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000];

  recordRequest(
    moduleId: string,
    method: string,
    url: string,
    status: number,
    durationMs: number,
    error?: string
  ): void {
    const key = moduleId;
    let current = this.metrics.get(key);
    if (!current) {
      current = {
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        methodDistribution: {},
        statusDistribution: {},
        durationHistogram: new Array(this.histogramBuckets.length).fill(0),
      };
    }

    current.requestCount++;
    const isSuccess = status >= 200 && status < 300;
    if (isSuccess) {
      current.successCount++;
    } else {
      current.failureCount++;
      if (error) {
        current.errorCount++;
        current.lastError = error;
      }
    }

    current.methodDistribution[method] = (current.methodDistribution[method] || 0) + 1;
    current.statusDistribution[status] = (current.statusDistribution[status] || 0) + 1;

    const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
    const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
    current.durationHistogram[idx]++;

    this.metrics.set(key, current);
  }

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (moduleId) {
      return this.metrics.get(moduleId) ?? {
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        methodDistribution: {},
        statusDistribution: {},
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
  method: string;
  url: string;
  status: number;
  durationMs: number;
  error?: string;
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
  constructor(private config: ClientRetryConfig) {}

  shouldRetry(attempt: number, error: any): boolean {
    if (attempt >= this.config.maxAttempts) return false;
    if (error.response && this.config.retryableStatuses.includes(error.response.status)) return true;
    if (error.code === 'ECONNABORTED' || !error.response) return true; // network errors
    return false;
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

  constructor(private config: ClientCircuitBreakerConfig) {}

  async call<T>(serviceName: string, fn: () => Promise<T>): Promise<Result<T>> {
    const state = this.getState(serviceName);

    if (state.state === 'OPEN') {
      const now = Date.now();
      if (now - state.lastFailureTime >= this.config.timeoutMs) {
        state.state = 'HALF_OPEN';
        state.halfOpenSuccesses = 0;
        this.states.set(serviceName, state);
      } else {
        return { ok: false, error: new FhirClientError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
  constructor(private circuitBreaker: CircuitBreaker, private client: AxiosInstance) {}

  async check(): Promise<HealthStatus> {
    const circuitBreakers = this.circuitBreaker.getAllStates();
    const services = new Map<string, { healthy: boolean; lastFailure?: string }>();
    for (const [service, state] of circuitBreakers) {
      services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
    }

    // Check server connectivity
    let serverHealthy = true;
    try {
      await this.client.get('/metadata', { timeout: 5000 });
    } catch (err) {
      serverHealthy = false;
    }
    services.set('fhir-server', { healthy: serverHealthy });

    const healthy = Array.from(services.values()).every(s => s.healthy);
    return { healthy, services, circuitBreakers };
  }
}

// ==================== Vendor Normalizer ====================
export class VendorNormalizer {
  static normalizeEpicExtensions(resource: any): any {
    if (resource.extension?.some((ext: any) => ext.url?.includes('epic.com'))) {
      const normalized = { ...resource };
      normalized.extension = resource.extension?.filter((ext: any) => 
        !ext.url?.includes('epic.com')
      );
      return normalized;
    }
    return resource;
  }

  static normalizeCernerExtensions(resource: any): any {
    if (resource.extension?.some((ext: any) => ext.url?.includes('cerner.com'))) {
      const normalized = { ...resource };
      normalized.extension = resource.extension?.filter((ext: any) => 
        !ext.url?.includes('cerner.com')
      );
      return normalized;
    }
    return resource;
  }

  static normalize(resource: any): any {
    let normalized = VendorNormalizer.normalizeEpicExtensions(resource);
    normalized = VendorNormalizer.normalizeCernerExtensions(normalized);
    return normalized;
  }
}

// ==================== Main FHIR Client ====================
export class AtlasFhirClient {
  private client: AxiosInstance;
  private config: FhirConfig;
  private retryStrategy: ExponentialBackoffRetry;
  private circuitBreaker: CircuitBreaker;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private healthChecker: HealthChecker;
  private observability: ClientObservabilityConfig;

  constructor(
    config: FhirConfig,
    retryConfig: Partial<ClientRetryConfig> = {},
    circuitBreakerConfig: Partial<ClientCircuitBreakerConfig> = {},
    observability: Partial<ClientObservabilityConfig> = {}
  ) {
    this.config = FhirConfigSchema.parse(config);
    this.observability = { ...DEFAULT_OBSERVABILITY, ...observability };
    const retryFull = { ...DEFAULT_RETRY, ...retryConfig };
    const cbFull = { ...DEFAULT_CIRCUIT_BREAKER, ...circuitBreakerConfig };

    this.retryStrategy = new ExponentialBackoffRetry(retryFull);
    this.circuitBreaker = new CircuitBreaker(cbFull);
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
        ...(this.config.auth?.token && { Authorization: `Bearer ${this.config.auth.token}` }),
      },
    });

    this.healthChecker = new HealthChecker(this.circuitBreaker, this.client);

    // Setup interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to start trace span
    this.client.interceptors.request.use(async (config) => {
      if (this.observability.enableTracing) {
        const span = this.tracer.startSpan(`http ${config.method?.toUpperCase()} ${config.url}`);
        (config as any).__span = span;
        span.setAttribute('http.method', config.method || '');
        span.setAttribute('http.url', config.url || '');
      }
      return config;
    });

    // Response interceptor for metrics, logging, and error handling with retry
    this.client.interceptors.response.use(
      async (response) => {
        await this.recordResponse(response.config, response.status, response.data);
        return response;
      },
      async (error) => {
        const config = error.config;
        const status = error.response?.status || 0;
        const duration = config.__startTime ? Date.now() - config.__startTime : 0;

        await this.recordResponse(config, status, null, error.message);

        // Retry logic
        if (this.retryStrategy.shouldRetry(config.__retryCount || 0, error)) {
          config.__retryCount = (config.__retryCount || 0) + 1;
          const delay = this.retryStrategy.getDelay(config.__retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(config);
        }

        throw error;
      }
    );
  }

  private async recordResponse(config: any, status: number, data: any, errorMsg?: string): Promise<void> {
    const duration = config.__startTime ? Date.now() - config.__startTime : 0;
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url || '';

    if (this.observability.enableMetrics) {
      this.metrics.recordRequest('fhir-client', method, url, status, duration, errorMsg);
    }
    if (this.observability.enableEventLogging) {
      this.logger.log({
        id: uuidv4(),
        type: 'FHIR_REQUEST',
        timestamp: new Date().toISOString(),
        source: 'fhir-client',
        method,
        url,
        status,
        durationMs: duration,
        error: errorMsg,
      });
    }
    if (this.observability.enableTracing && config.__span) {
      const span = config.__span as Span;
      span.setAttribute('http.status_code', status);
      if (errorMsg) span.recordException(new Error(errorMsg));
      span.end();
    }
  }

  private normalizeResource(resource: any): any {
    return VendorNormalizer.normalize(resource);
  }

  // ==================== Public CRUD Operations (with circuit breaker) ====================
  async read(resourceType: string, id: string): Promise<anyResource> {
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: `/${resourceType}/${id}`,
        method: 'GET',
        __startTime: Date.now(),
      };
      const response = await this.client(config);
      return response.data;
    });
    if (!result.ok) throw result.error;
    return this.normalizeResource(result.value);
  }

  async create(resource: anyResource): Promise<anyResource> {
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: `/${resource.resourceType}`,
        method: 'POST',
        data: resource,
        __startTime: Date.now(),
      };
      const response = await this.client(config);
      return response.data;
    });
    if (!result.ok) throw result.error;
    return this.normalizeResource(result.value);
  }

  async update(resource: anyResource): Promise<anyResource> {
    if (!resource.id) throw new FhirClientError('MISSING_ID', 'Resource ID required for update');
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: `/${resource.resourceType}/${resource.id}`,
        method: 'PUT',
        data: resource,
        __startTime: Date.now(),
      };
      const response = await this.client(config);
      return response.data;
    });
    if (!result.ok) throw result.error;
    return this.normalizeResource(result.value);
  }

  async delete(resourceType: string, id: string): Promise<void> {
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: `/${resourceType}/${id}`,
        method: 'DELETE',
        __startTime: Date.now(),
      };
      await this.client(config);
    });
    if (!result.ok) throw result.error;
  }

  async search(resourceType: string, params: Record<string, any>): Promise<anyBundle> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: `/${resourceType}?${searchParams.toString()}`,
        method: 'GET',
        __startTime: Date.now(),
      };
      const response = await this.client(config);
      return response.data;
    });
    if (!result.ok) throw result.error;
    return this.normalizeResource(result.value);
  }

  async transaction(bundle: anyBundle): Promise<anyBundle> {
    if (bundle.type !== 'transaction') {
      throw new FhirClientError('INVALID_BUNDLE', 'Bundle must be of type transaction');
    }
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: '/',
        method: 'POST',
        data: bundle,
        __startTime: Date.now(),
      };
      const response = await this.client(config);
      return response.data;
    });
    if (!result.ok) throw result.error;
    return this.normalizeResource(result.value);
  }

  async batch(bundle: anyBundle): Promise<anyBundle> {
    if (bundle.type !== 'batch') {
      throw new FhirClientError('INVALID_BUNDLE', 'Bundle must be of type batch');
    }
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: '/',
        method: 'POST',
        data: bundle,
        __startTime: Date.now(),
      };
      const response = await this.client(config);
      return response.data;
    });
    if (!result.ok) throw result.error;
    return this.normalizeResource(result.value);
  }

  async capabilities(): Promise<anyCapabilityStatement> {
    const result = await this.circuitBreaker.call('fhir-server', async () => {
      const config: CustomAxiosRequestConfig = {
        url: '/metadata',
        method: 'GET',
        __startTime: Date.now(),
      };
      const response = await this.client(config);
      return response.data;
    });
    if (!result.ok) throw result.error;
    return this.normalizeResource(result.value);
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
      name: 'ATLAS FHIR Client',
      version: '1.0.0',
      capabilities: [
        'crud_operations',
        'search',
        'transaction',
        'batch',
        'circuit_breaker',
        'retry_with_backoff',
        'observability',
        'vendor_normalization',
      ],
    };
  }
}