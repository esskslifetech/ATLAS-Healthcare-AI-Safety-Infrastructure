// identity-bridge.ts
// HIPAA-compliant OAuth2 / SMART on FHIR client with advanced resilience and observability

import { randomUUID } from 'crypto';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { Mutex } from 'async-mutex';
import {
  OAuthToken,
  StoredToken,
  SmartConfig,
  TokenRequest,
  AuthorizationRequest,
  TokenValidation,
  TokenRefreshResult,
  TokenStore,
  IdentityProvider,
  AuthContext,
  OAuthTokenSchema,
  StoredTokenSchema,
  SmartConfigSchema,
  TokenRequestSchema,
  AuthorizationRequestSchema,
  TokenValidationSchema,
  TokenRefreshResultSchema,
  SMART_SCOPES,
  TOKEN_STATUS,
  GRANT_TYPES,
} from './types'; // Assume these types are defined (may need extension)

// ==================== Configuration ====================
export interface IdentityBridgeConfig {
  defaultTimeoutMs: number;
  retry: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  enableCache: boolean;               // cache SMART config
  cacheTTLMs: number;                 // TTL for SMART config cache
  enableHooks: boolean;              // enable event hooks
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

const defaultConfig: IdentityBridgeConfig = {
  defaultTimeoutMs: 10_000,
  retry: {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 10_000,
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
  enableCache: true,
  cacheTTLMs: 300_000, // 5 minutes
  enableHooks: true,
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Errors ====================
export class IdentityBridgeError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'IdentityBridgeError';
  }
}

export class TokenNotFoundError extends IdentityBridgeError {
  constructor(tokenId: string) {
    super('TOKEN_NOT_FOUND', `Token ${tokenId} not found`);
  }
}

export class ProviderNotFoundError extends IdentityBridgeError {
  constructor(providerName: string) {
    super('PROVIDER_NOT_FOUND', `Provider ${providerName} not registered`);
  }
}

export class InvalidGrantError extends IdentityBridgeError {
  constructor(details: string) {
    super('INVALID_GRANT', `Invalid grant: ${details}`);
  }
}

export class TokenExpiredError extends IdentityBridgeError {
  constructor(tokenId: string) {
    super('TOKEN_EXPIRED', `Token ${tokenId} has expired`);
  }
}

// ==================== Hooks ====================
export interface IdentityBridgeHooks {
  onTokenIssued?: (token: StoredToken) => void;
  onTokenRefreshed?: (oldTokenId: string, newToken: StoredToken) => void;
  onTokenRevoked?: (tokenId: string) => void;
  onTokenValidationFailed?: (tokenId: string, errors: string[]) => void;
  onProviderHealthChanged?: (providerName: string, healthy: boolean) => void;
}

class NoopHooks implements IdentityBridgeHooks {}

// ==================== Metrics ====================
export interface MetricsSnapshot {
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
    let current = this.metrics.get(moduleId);
    if (!current) {
      current = {
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

    this.metrics.set(moduleId, current);
  }

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (moduleId) {
      return this.metrics.get(moduleId) ?? {
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        actionDistribution: {},
        resultDistribution: {},
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

// ==================== Tracer ====================
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
        return {
          ok: false,
          error: new IdentityBridgeError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`),
        };
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
  providers: Map<string, { healthy: boolean; lastCheck: string; error?: string }>;
  circuitBreakers: Map<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number }>;
}

class HealthChecker {
  constructor(private circuitBreaker: CircuitBreaker, private providers: Map<string, IdentityProvider>) {}

  async check(): Promise<HealthStatus> {
    const circuitBreakers = this.circuitBreaker.getAllStates();
    const providerStatuses = new Map<string, { healthy: boolean; lastCheck: string; error?: string }>();

    for (const [name, provider] of this.providers) {
      try {
        // Check if well-known endpoint is reachable (quick check)
        await axios.get(`${provider.issuer}/.well-known/smart-configuration`, { timeout: 5000 });
        providerStatuses.set(name, { healthy: true, lastCheck: new Date().toISOString() });
      } catch (err) {
        providerStatuses.set(name, {
          healthy: false,
          lastCheck: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const healthy = Array.from(providerStatuses.values()).every(p => p.healthy);
    return { healthy, providers: providerStatuses, circuitBreakers };
  }
}

// ==================== Cache for SMART Config ====================
class SmartConfigCache {
  private cache = new Map<string, { config: SmartConfig; expiresAt: number }>();
  private mutex = new Mutex();

  constructor(private ttlMs: number) {}

  async get(issuer: string): Promise<SmartConfig | null> {
    return this.mutex.runExclusive(() => {
      const entry = this.cache.get(issuer);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(issuer);
        return null;
      }
      return entry.config;
    });
  }

  async set(issuer: string, config: SmartConfig): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.cache.set(issuer, { config, expiresAt: Date.now() + this.ttlMs });
    });
  }

  async invalidate(issuer: string): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.cache.delete(issuer);
    });
  }
}

// ==================== Concurrency-Safe Token Store ====================
export class InMemoryTokenStore implements TokenStore {
  private tokens: Map<string, StoredToken> = new Map();
  private mutex = new Mutex();

  async storeToken(token: StoredToken): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.tokens.set(token.id, token);
    });
  }

  async getToken(tokenId: string): Promise<StoredToken | null> {
    return this.mutex.runExclusive(() => this.tokens.get(tokenId) ?? null);
  }

  async getTokenByPatient(patientId: string, clientId: string): Promise<StoredToken | null> {
    return this.mutex.runExclusive(() => {
      for (const token of this.tokens.values()) {
        if (token.patient === patientId && token.client_id === clientId) {
          return token;
        }
      }
      return null;
    });
  }

  async updateToken(tokenId: string, updates: Partial<StoredToken>): Promise<StoredToken> {
    return this.mutex.runExclusive(async () => {
      const existing = this.tokens.get(tokenId);
      if (!existing) throw new TokenNotFoundError(tokenId);
      const updated = { ...existing, ...updates };
      this.tokens.set(tokenId, updated);
      return updated;
    });
  }

  async revokeToken(tokenId: string): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.tokens.delete(tokenId);
    });
  }

  async cleanupExpiredTokens(): Promise<number> {
    return this.mutex.runExclusive(() => {
      const now = new Date();
      let cleaned = 0;
      for (const [tokenId, token] of this.tokens.entries()) {
        if (new Date(token.expires_at) < now) {
          this.tokens.delete(tokenId);
          cleaned++;
        }
      }
      return cleaned;
    });
  }

  async getActiveTokens(clientId: string): Promise<StoredToken[]> {
    return this.mutex.runExclusive(() => {
      const now = new Date();
      return Array.from(this.tokens.values())
        .filter(token => token.client_id === clientId && new Date(token.expires_at) > now);
    });
  }
}

// ==================== Main Identity Bridge ====================
export class IdentityBridge {
  private tokenStore: TokenStore;
  private httpClient: AxiosInstance;
  private providers: Map<string, IdentityProvider> = new Map();
  private config: IdentityBridgeConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: ExponentialBackoffRetry;
  private healthChecker: HealthChecker;
  private smartConfigCache?: SmartConfigCache;
  private hooks: IdentityBridgeHooks;

  constructor(
    tokenStore?: TokenStore,
    config?: Partial<IdentityBridgeConfig>,
    hooks?: IdentityBridgeHooks
  ) {
    this.tokenStore = tokenStore || new InMemoryTokenStore();
    this.config = { ...defaultConfig, ...config };
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
    this.hooks = hooks || new NoopHooks();

    if (this.config.enableCache) {
      this.smartConfigCache = new SmartConfigCache(this.config.cacheTTLMs);
    }

    this.httpClient = axios.create({
      timeout: this.config.defaultTimeoutMs,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    this.healthChecker = new HealthChecker(this.circuitBreaker, this.providers);
  }

  // ==================== Provider Management ====================
  registerProvider(provider: IdentityProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): IdentityProvider | undefined {
    return this.providers.get(name);
  }

  // ==================== SMART on FHIR Configuration ====================
  async getSmartConfig(issuer: string): Promise<Result<SmartConfig>> {
    const span = this.tracer.startSpan('identityBridge.getSmartConfig');
    const startTime = Date.now();

    try {
      // Try cache first
      if (this.smartConfigCache) {
        const cached = await this.smartConfigCache.get(issuer);
        if (cached) {
          this.recordMetrics('getSmartConfig', Date.now() - startTime, true);
          span.end();
          return { ok: true, value: cached };
        }
      }

      const result = await this.circuitBreaker.call(`smart-config:${issuer}`, async () => {
        const response = await this.retryWithTimeout(() =>
          this.httpClient.get(`${issuer}/.well-known/smart-configuration`)
        );
        return SmartConfigSchema.parse(response.data);
      });

      if (!result.ok) throw result.error;

      if (this.smartConfigCache) {
        await this.smartConfigCache.set(issuer, result.value);
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('getSmartConfig', duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getSmartConfig', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== PKCE Helpers ====================
  static generateCodeVerifier(): string {
    // Generate a random 43-128 character string (RFC 7636)
    return randomUUID() + randomUUID() + randomUUID(); // Simplistic; use a proper crypto in production
  }

  static async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // ==================== Authorization URL Generation ====================
  generateAuthorizationUrl(
    providerName: string,
    options?: {
      state?: string;
      codeChallenge?: string;
      launch?: string;
      patient?: string;
      encounter?: string;
    }
  ): Result<string> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return { ok: false, error: new ProviderNotFoundError(providerName) };
    }

    const state = options?.state || randomUUID();

    const authRequest: AuthorizationRequest = {
      response_type: 'code',
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      scope: provider.scopes.join(' '),
      state,
      aud: provider.issuer,
      ...(options?.codeChallenge && {
        code_challenge: options.codeChallenge,
        code_challenge_method: 'S256',
      }),
      ...(options?.launch && { launch: options.launch }),
      ...(options?.patient && { launch_context: { patient: options.patient } }),
      ...(options?.encounter && {
        launch_context: {
          ...(options?.patient && { patient: options.patient }),
          encounter: options.encounter,
        },
      }),
    };

    const params = new URLSearchParams();
    Object.entries(authRequest).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return { ok: true, value: `${provider.issuer}/auth?${params.toString()}` };
  }

  // ==================== Token Exchange ====================
  async exchangeCodeForToken(
    providerName: string,
    code: string,
    codeVerifier?: string
  ): Promise<Result<StoredToken>> {
    const span = this.tracer.startSpan('identityBridge.exchangeCodeForToken');
    const startTime = Date.now();

    try {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new ProviderNotFoundError(providerName);
      }

      const tokenRequest: TokenRequest = {
        grant_type: GRANT_TYPES.AUTHORIZATION_CODE,
        code,
        redirect_uri: provider.redirectUri,
        client_id: provider.clientId,
        ...(provider.clientSecret && { client_secret: provider.clientSecret }),
        ...(codeVerifier && { code_verifier: codeVerifier }),
      };

      const token = await this.requestToken(provider.issuer, tokenRequest, provider);
      await this.tokenStore.storeToken(token);

      if (this.config.enableHooks) {
        this.hooks.onTokenIssued?.(token);
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('exchangeCodeForToken', duration, true);
      span.end();
      return { ok: true, value: token };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('exchangeCodeForToken', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async clientCredentialsGrant(providerName: string, scopes?: string[]): Promise<Result<StoredToken>> {
    const span = this.tracer.startSpan('identityBridge.clientCredentialsGrant');
    const startTime = Date.now();

    try {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new ProviderNotFoundError(providerName);
      }

      if (!provider.clientSecret) {
        throw new IdentityBridgeError('CLIENT_SECRET_MISSING', 'Client secret required for client credentials grant');
      }

      const tokenRequest: TokenRequest = {
        grant_type: GRANT_TYPES.CLIENT_CREDENTIALS,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        scope: scopes?.join(' ') || provider.scopes.join(' '),
      };

      const token = await this.requestToken(provider.issuer, tokenRequest, provider);
      await this.tokenStore.storeToken(token);

      if (this.config.enableHooks) {
        this.hooks.onTokenIssued?.(token);
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('clientCredentialsGrant', duration, true);
      span.end();
      return { ok: true, value: token };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('clientCredentialsGrant', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  private async requestToken(
    issuer: string,
    tokenRequest: TokenRequest,
    provider: IdentityProvider
  ): Promise<StoredToken> {
    const validatedRequest = TokenRequestSchema.parse(tokenRequest);

    const params = new URLSearchParams();
    Object.entries(validatedRequest).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });

    const result = await this.circuitBreaker.call(`token:${issuer}`, async () => {
      const response = await this.retryWithTimeout(() =>
        this.httpClient.post(`${issuer}/token`, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );
      return OAuthTokenSchema.parse(response.data);
    });

    if (!result.ok) throw result.error;

    const oauthToken = result.value;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + oauthToken.expires_in);

    const storedToken: StoredToken = {
      id: randomUUID(),
      access_token: oauthToken.access_token,
      refresh_token: oauthToken.refresh_token,
      token_type: oauthToken.token_type,
      expires_at: expiresAt.toISOString(),
      scope: oauthToken.scope,
      patient: oauthToken.patient,
      encounter: oauthToken.encounter,
      issuer,
      client_id: provider.clientId,
      created_at: new Date().toISOString(),
      metadata: {
        launch_context: {
          patient_id: oauthToken.patient,
          encounter_id: oauthToken.encounter,
        },
      },
    };

    return storedToken;
  }

  // ==================== Token Refresh ====================
  async refreshToken(tokenId: string): Promise<Result<TokenRefreshResult>> {
    const span = this.tracer.startSpan('identityBridge.refreshToken');
    const startTime = Date.now();

    try {
      const storedToken = await this.tokenStore.getToken(tokenId);
      if (!storedToken) throw new TokenNotFoundError(tokenId);
      if (!storedToken.refresh_token) {
        return {
          ok: true,
          value: {
            success: false,
            error: 'no_refresh_token',
            error_description: 'No refresh token available',
          },
        };
      }

      // Find provider associated with this token (we need to store provider name in token)
      // For simplicity, we assume we can find by issuer and client_id; in practice, we'd store provider name.
      const provider = Array.from(this.providers.values()).find(
        p => p.issuer === storedToken.issuer && p.clientId === storedToken.client_id
      );
      if (!provider) {
        throw new ProviderNotFoundError(`Provider for issuer ${storedToken.issuer} not found`);
      }

      const tokenRequest: TokenRequest = {
        grant_type: GRANT_TYPES.REFRESH_TOKEN,
        refresh_token: storedToken.refresh_token,
        client_id: provider.clientId,
        ...(provider.clientSecret && { client_secret: provider.clientSecret }),
      };

      const newToken = await this.requestToken(provider.issuer, tokenRequest, provider);
      await this.tokenStore.storeToken(newToken);
      await this.tokenStore.revokeToken(tokenId); // Optionally revoke old token

      if (this.config.enableHooks) {
        this.hooks.onTokenRefreshed?.(tokenId, newToken);
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('refreshToken', duration, true);
      span.end();
      return {
        ok: true,
        value: { success: true, token: newToken },
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('refreshToken', duration, false, error.message);
      span.recordException(error);
      span.end();
      return {
        ok: true,
        value: {
          success: false,
          error: 'refresh_failed',
          error_description: error.message,
        },
      };
    }
  }

  // ==================== Token Validation ====================
  async validateToken(tokenId: string): Promise<Result<TokenValidation>> {
    const span = this.tracer.startSpan('identityBridge.validateToken');
    const startTime = Date.now();

    try {
      const storedToken = await this.tokenStore.getToken(tokenId);
      if (!storedToken) {
        return {
          ok: true,
          value: {
            valid: false,
            token_id: tokenId,
            expires_at: '',
            scopes: [],
            errors: ['Token not found'],
          },
        };
      }

      const now = new Date();
      const expiresAt = new Date(storedToken.expires_at);
      const isExpired = now > expiresAt;

      const scopes = storedToken.scope.split(' ').filter(s => s.length > 0);
      const errors: string[] = [];
      const warnings: string[] = [];

      if (isExpired) errors.push('Token has expired');
      if (!storedToken.refresh_token && isExpired) errors.push('Token expired and no refresh token available');
      if (isExpired && storedToken.refresh_token) warnings.push('Token expired but can be refreshed');

      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      if (expiresAt < fiveMinutesFromNow && !isExpired) warnings.push('Token expires soon');

      const valid = !isExpired;
      if (!valid && this.config.enableHooks) {
        this.hooks.onTokenValidationFailed?.(tokenId, errors);
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('validateToken', duration, true);
      span.end();

      return {
        ok: true,
        value: {
          valid,
          token_id: tokenId,
          expires_at: storedToken.expires_at,
          scopes,
          patient: storedToken.patient,
          errors: errors.length ? errors : undefined,
          warnings: warnings.length ? warnings : undefined,
        },
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('validateToken', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Token Introspection ====================
  async introspectToken(tokenId: string): Promise<Result<{ active: boolean; [key: string]: any }>> {
    const span = this.tracer.startSpan('identityBridge.introspectToken');
    const startTime = Date.now();

    try {
      const storedToken = await this.tokenStore.getToken(tokenId);
      if (!storedToken) throw new TokenNotFoundError(tokenId);

      const provider = Array.from(this.providers.values()).find(
        p => p.issuer === storedToken.issuer && p.clientId === storedToken.client_id
      );
      if (!provider) {
        throw new ProviderNotFoundError(`Provider for issuer ${storedToken.issuer} not found`);
      }

      const result = await this.circuitBreaker.call(`introspect:${storedToken.issuer}`, async () => {
        const params = new URLSearchParams();
        params.append('token', storedToken.access_token);
        params.append('client_id', provider.clientId);
        if (provider.clientSecret) params.append('client_secret', provider.clientSecret);

        const response = await this.retryWithTimeout(() =>
          this.httpClient.post(`${storedToken.issuer}/introspect`, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
        );
        return response.data;
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics('introspectToken', duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('introspectToken', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Token Revocation ====================
  async revokeToken(tokenId: string): Promise<Result<void>> {
    const span = this.tracer.startSpan('identityBridge.revokeToken');
    const startTime = Date.now();

    try {
      const storedToken = await this.tokenStore.getToken(tokenId);
      if (!storedToken) throw new TokenNotFoundError(tokenId);

      const provider = Array.from(this.providers.values()).find(
        p => p.issuer === storedToken.issuer && p.clientId === storedToken.client_id
      );
      if (provider) {
        // Call revocation endpoint if available
        const params = new URLSearchParams();
        params.append('token', storedToken.access_token);
        params.append('client_id', provider.clientId);
        if (provider.clientSecret) params.append('client_secret', provider.clientSecret);
        params.append('token_type_hint', 'access_token');

        await this.circuitBreaker.call(`revoke:${storedToken.issuer}`, async () => {
          await this.retryWithTimeout(() =>
            this.httpClient.post(`${storedToken.issuer}/revoke`, params.toString(), {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })
          );
          return true;
        });
      }

      await this.tokenStore.revokeToken(tokenId);

      if (this.config.enableHooks) {
        this.hooks.onTokenRevoked?.(tokenId);
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('revokeToken', duration, true);
      span.end();
      return { ok: true, value: undefined };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('revokeToken', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== UserInfo ====================
  async getUserInfo(tokenId: string): Promise<Result<any>> {
    const span = this.tracer.startSpan('identityBridge.getUserInfo');
    const startTime = Date.now();

    try {
      const storedToken = await this.tokenStore.getToken(tokenId);
      if (!storedToken) throw new TokenNotFoundError(tokenId);

      const result = await this.circuitBreaker.call(`userinfo:${storedToken.issuer}`, async () => {
        const response = await this.retryWithTimeout(() =>
          this.httpClient.get(`${storedToken.issuer}/userinfo`, {
            headers: { Authorization: `Bearer ${storedToken.access_token}` },
          })
        );
        return response.data;
      });

      if (!result.ok) throw result.error;

      const duration = Date.now() - startTime;
      this.recordMetrics('getUserInfo', duration, true);
      span.end();
      return { ok: true, value: result.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getUserInfo', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Convenience Methods ====================
  async getValidTokenForPatient(
    patientId: string,
    clientId: string,
    autoRefresh: boolean = true
  ): Promise<Result<StoredToken>> {
    const span = this.tracer.startSpan('identityBridge.getValidTokenForPatient');
    const startTime = Date.now();

    try {
      let token = await this.tokenStore.getTokenByPatient(patientId, clientId);
      if (!token) {
        return { ok: false, error: new TokenNotFoundError(`No token for patient ${patientId}`) };
      }

      const validationResult = await this.validateToken(token.id);
      if (!validationResult.ok) throw validationResult.error;

      const validation = validationResult.value;
      if (!validation.valid && autoRefresh && token.refresh_token) {
        const refreshResult = await this.refreshToken(token.id);
        if (refreshResult.ok && refreshResult.value.success && refreshResult.value.token) {
          token = refreshResult.value.token;
        } else {
          return { ok: false, error: new IdentityBridgeError('REFRESH_FAILED', 'Unable to refresh token') };
        }
      } else if (!validation.valid) {
        return { ok: false, error: new TokenExpiredError(token.id) };
      }

      const duration = Date.now() - startTime;
      this.recordMetrics('getValidTokenForPatient', duration, true);
      span.end();
      return { ok: true, value: token };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getValidTokenForPatient', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async getTokenStatus(tokenId: string): Promise<Result<string>> {
    const validationResult = await this.validateToken(tokenId);
    if (!validationResult.ok) return { ok: false, error: validationResult.error };

    const validation = validationResult.value;
    if (!validation.valid) {
      const token = await this.tokenStore.getToken(tokenId);
      if (token?.refresh_token) {
        return { ok: true, value: TOKEN_STATUS.REFRESH_NEEDED };
      }
      return { ok: true, value: TOKEN_STATUS.EXPIRED };
    }
    return { ok: true, value: TOKEN_STATUS.ACTIVE };
  }

  async getAuthContext(tokenId: string): Promise<Result<AuthContext>> {
    const span = this.tracer.startSpan('identityBridge.getAuthContext');
    const startTime = Date.now();

    try {
      const token = await this.tokenStore.getToken(tokenId);
      if (!token) throw new TokenNotFoundError(tokenId);

      const validationResult = await this.validateToken(tokenId);
      if (!validationResult.ok) throw validationResult.error;
      if (!validationResult.value.valid) {
        throw new TokenExpiredError(tokenId);
      }

      // Find provider
      const provider = Array.from(this.providers.values()).find(
        p => p.issuer === token.issuer && p.clientId === token.client_id
      );
      if (!provider) {
        throw new ProviderNotFoundError(`Provider for issuer ${token.issuer} not found`);
      }

      // Optionally fetch user info
      let userInfo: any = null;
      try {
        const userInfoResult = await this.getUserInfo(tokenId);
        if (userInfoResult.ok) userInfo = userInfoResult.value;
      } catch {
        // Ignore userinfo failure
      }

      const authContext: AuthContext = {
        provider,
        token,
        user: {
          id: token.patient || userInfo?.sub || 'unknown',
          name: userInfo?.name,
          email: userInfo?.email,
        },
        session: {
          id: token.id,
          createdAt: token.created_at,
          lastActivity: token.last_used || token.created_at,
        },
      };

      const duration = Date.now() - startTime;
      this.recordMetrics('getAuthContext', duration, true);
      span.end();
      return { ok: true, value: authContext };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('getAuthContext', duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async updateTokenUsage(tokenId: string): Promise<Result<void>> {
    try {
      await this.tokenStore.updateToken(tokenId, { last_used: new Date().toISOString() });
      return { ok: true, value: undefined };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { ok: false, error };
    }
  }

  async cleanupExpiredTokens(): Promise<Result<number>> {
    try {
      const count = await this.tokenStore.cleanupExpiredTokens();
      return { ok: true, value: count };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { ok: false, error };
    }
  }

  async getActiveTokensCount(clientId: string): Promise<Result<number>> {
    try {
      const activeTokens = await this.tokenStore.getActiveTokens(clientId);
      return { ok: true, value: activeTokens.length };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { ok: false, error };
    }
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
      name: 'ATLAS Identity Bridge',
      version: '2.0.0',
      capabilities: [
        'oauth2_client',
        'smart_on_fhir',
        'pkce',
        'client_credentials',
        'token_refresh',
        'introspection',
        'revocation',
        'userinfo',
        'circuit_breaker',
        'retry',
        'metrics',
        'tracing',
        'hooks',
      ],
    };
  }

  // ==================== Private Helpers ====================
  private async retryWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    const start = Date.now();
    while (attempt < this.config.retry.maxAttempts) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        const elapsed = Date.now() - start;
        if (elapsed >= this.config.defaultTimeoutMs) {
          throw new Error(`Timeout after ${this.config.defaultTimeoutMs}ms`);
        }
        if (!this.retryStrategy.shouldRetry(attempt, err as Error)) {
          throw err;
        }
        const delay = this.retryStrategy.getDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private recordMetrics(operation: string, durationMs: number, success: boolean, error?: string): void {
    if (this.config.enableMetrics) {
      this.metrics.recordOperation('identity-bridge', operation, durationMs, success, error);
    }
    if (this.config.enableEventLogging) {
      this.logger.log({
        type: 'IDENTITY_OPERATION',
        timestamp: new Date().toISOString(),
        source: 'identity-bridge',
        operation,
        data: { durationMs, error },
        success,
      });
    }
  }
}

// ==================== Factory ====================
export function createIdentityBridge(
  tokenStore?: TokenStore,
  config?: Partial<IdentityBridgeConfig>,
  hooks?: IdentityBridgeHooks
): IdentityBridge {
  return new IdentityBridge(tokenStore, config, hooks);
}