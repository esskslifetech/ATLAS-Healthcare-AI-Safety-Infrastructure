"use strict";
// identity-bridge.ts
// HIPAA-compliant OAuth2 / SMART on FHIR client with advanced resilience and observability
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityBridge = exports.InMemoryTokenStore = exports.TokenExpiredError = exports.InvalidGrantError = exports.ProviderNotFoundError = exports.TokenNotFoundError = exports.IdentityBridgeError = void 0;
exports.setTracer = setTracer;
exports.createIdentityBridge = createIdentityBridge;
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const async_mutex_1 = require("async-mutex");
const types_1 = require("./types"); // Assume these types are defined (may need extension)
const defaultConfig = {
    defaultTimeoutMs: 10000,
    retry: {
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 10000,
        jitterFactor: 0.2,
    },
    circuitBreaker: {
        failureThreshold: 5,
        timeoutMs: 30000,
        halfOpenMaxCalls: 1,
    },
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
    enableCache: true,
    cacheTTLMs: 300000, // 5 minutes
    enableHooks: true,
};
// ==================== Custom Errors ====================
class IdentityBridgeError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'IdentityBridgeError';
    }
}
exports.IdentityBridgeError = IdentityBridgeError;
class TokenNotFoundError extends IdentityBridgeError {
    constructor(tokenId) {
        super('TOKEN_NOT_FOUND', `Token ${tokenId} not found`);
    }
}
exports.TokenNotFoundError = TokenNotFoundError;
class ProviderNotFoundError extends IdentityBridgeError {
    constructor(providerName) {
        super('PROVIDER_NOT_FOUND', `Provider ${providerName} not registered`);
    }
}
exports.ProviderNotFoundError = ProviderNotFoundError;
class InvalidGrantError extends IdentityBridgeError {
    constructor(details) {
        super('INVALID_GRANT', `Invalid grant: ${details}`);
    }
}
exports.InvalidGrantError = InvalidGrantError;
class TokenExpiredError extends IdentityBridgeError {
    constructor(tokenId) {
        super('TOKEN_EXPIRED', `Token ${tokenId} has expired`);
    }
}
exports.TokenExpiredError = TokenExpiredError;
class NoopHooks {
}
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.histogramBuckets = [0, 50, 100, 200, 500, 1000, 2000, 5000];
    }
    recordOperation(moduleId, operation, durationMs, success, error) {
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
        }
        else {
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
    getMetrics(moduleId) {
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
class EventLogger {
    constructor() {
        this.events = [];
    }
    log(event) {
        this.events.push({ ...event, id: (0, crypto_1.randomUUID)() });
    }
    getEvents() {
        return [...this.events];
    }
}
class NoopTracer {
    startSpan() {
        return {
            end: () => { },
            setAttribute: () => { },
            recordException: () => { },
        };
    }
}
let globalTracer = new NoopTracer();
function setTracer(tracer) {
    globalTracer = tracer;
}
// ==================== Retry Strategy ====================
class ExponentialBackoffRetry {
    constructor(config) {
        this.config = config;
    }
    shouldRetry(attempt, error) {
        return attempt < this.config.maxAttempts;
    }
    getDelay(attempt) {
        const baseDelay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
        const cappedDelay = Math.min(baseDelay, this.config.maxDelayMs);
        const jitter = cappedDelay * this.config.jitterFactor * (Math.random() - 0.5);
        return Math.max(0, cappedDelay + jitter);
    }
}
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.states = new Map();
    }
    async call(serviceName, fn) {
        const state = this.getState(serviceName);
        if (state.state === 'OPEN') {
            const now = Date.now();
            if (now - state.lastFailureTime >= this.config.timeoutMs) {
                state.state = 'HALF_OPEN';
                state.halfOpenSuccesses = 0;
                this.states.set(serviceName, state);
            }
            else {
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
        }
        catch (err) {
            state.failures++;
            state.lastFailureTime = Date.now();
            if (state.failures >= this.config.failureThreshold) {
                state.state = 'OPEN';
            }
            this.states.set(serviceName, state);
            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }
    getState(serviceName) {
        return this.states.get(serviceName) ?? {
            state: 'CLOSED',
            failures: 0,
            lastFailureTime: 0,
            halfOpenSuccesses: 0,
        };
    }
    getAllStates() {
        return new Map(Array.from(this.states.entries()).map(([k, v]) => [k, { state: v.state, failures: v.failures, lastFailureTime: v.lastFailureTime }]));
    }
}
class HealthChecker {
    constructor(circuitBreaker, providers) {
        this.circuitBreaker = circuitBreaker;
        this.providers = providers;
    }
    async check() {
        const circuitBreakers = this.circuitBreaker.getAllStates();
        const providerStatuses = new Map();
        for (const [name, provider] of this.providers) {
            try {
                // Check if well-known endpoint is reachable (quick check)
                await axios_1.default.get(`${provider.issuer}/.well-known/smart-configuration`, { timeout: 5000 });
                providerStatuses.set(name, { healthy: true, lastCheck: new Date().toISOString() });
            }
            catch (err) {
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
    constructor(ttlMs) {
        this.ttlMs = ttlMs;
        this.cache = new Map();
        this.mutex = new async_mutex_1.Mutex();
    }
    async get(issuer) {
        return this.mutex.runExclusive(() => {
            const entry = this.cache.get(issuer);
            if (!entry)
                return null;
            if (Date.now() > entry.expiresAt) {
                this.cache.delete(issuer);
                return null;
            }
            return entry.config;
        });
    }
    async set(issuer, config) {
        return this.mutex.runExclusive(() => {
            this.cache.set(issuer, { config, expiresAt: Date.now() + this.ttlMs });
        });
    }
    async invalidate(issuer) {
        return this.mutex.runExclusive(() => {
            this.cache.delete(issuer);
        });
    }
}
// ==================== Concurrency-Safe Token Store ====================
class InMemoryTokenStore {
    constructor() {
        this.tokens = new Map();
        this.mutex = new async_mutex_1.Mutex();
    }
    async storeToken(token) {
        return this.mutex.runExclusive(() => {
            this.tokens.set(token.id, token);
        });
    }
    async getToken(tokenId) {
        return this.mutex.runExclusive(() => this.tokens.get(tokenId) ?? null);
    }
    async getTokenByPatient(patientId, clientId) {
        return this.mutex.runExclusive(() => {
            for (const token of this.tokens.values()) {
                if (token.patient === patientId && token.client_id === clientId) {
                    return token;
                }
            }
            return null;
        });
    }
    async updateToken(tokenId, updates) {
        return this.mutex.runExclusive(async () => {
            const existing = this.tokens.get(tokenId);
            if (!existing)
                throw new TokenNotFoundError(tokenId);
            const updated = { ...existing, ...updates };
            this.tokens.set(tokenId, updated);
            return updated;
        });
    }
    async revokeToken(tokenId) {
        return this.mutex.runExclusive(() => {
            this.tokens.delete(tokenId);
        });
    }
    async cleanupExpiredTokens() {
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
    async getActiveTokens(clientId) {
        return this.mutex.runExclusive(() => {
            const now = new Date();
            return Array.from(this.tokens.values())
                .filter(token => token.client_id === clientId && new Date(token.expires_at) > now);
        });
    }
}
exports.InMemoryTokenStore = InMemoryTokenStore;
// ==================== Main Identity Bridge ====================
class IdentityBridge {
    constructor(tokenStore, config, hooks) {
        this.providers = new Map();
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
        this.httpClient = axios_1.default.create({
            timeout: this.config.defaultTimeoutMs,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
        });
        this.healthChecker = new HealthChecker(this.circuitBreaker, this.providers);
    }
    // ==================== Provider Management ====================
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    // ==================== SMART on FHIR Configuration ====================
    async getSmartConfig(issuer) {
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
                const response = await this.retryWithTimeout(() => this.httpClient.get(`${issuer}/.well-known/smart-configuration`));
                return types_1.SmartConfigSchema.parse(response.data);
            });
            if (!result.ok)
                throw result.error;
            if (this.smartConfigCache) {
                await this.smartConfigCache.set(issuer, result.value);
            }
            const duration = Date.now() - startTime;
            this.recordMetrics('getSmartConfig', duration, true);
            span.end();
            return { ok: true, value: result.value };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('getSmartConfig', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    // ==================== PKCE Helpers ====================
    static generateCodeVerifier() {
        // Generate a random 43-128 character string (RFC 7636)
        return (0, crypto_1.randomUUID)() + (0, crypto_1.randomUUID)() + (0, crypto_1.randomUUID)(); // Simplistic; use a proper crypto in production
    }
    static async generateCodeChallenge(verifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    // ==================== Authorization URL Generation ====================
    generateAuthorizationUrl(providerName, options) {
        const provider = this.providers.get(providerName);
        if (!provider) {
            return { ok: false, error: new ProviderNotFoundError(providerName) };
        }
        const state = options?.state || (0, crypto_1.randomUUID)();
        const authRequest = {
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
                }
                else {
                    params.append(key, String(value));
                }
            }
        });
        return { ok: true, value: `${provider.issuer}/auth?${params.toString()}` };
    }
    // ==================== Token Exchange ====================
    async exchangeCodeForToken(providerName, code, codeVerifier) {
        const span = this.tracer.startSpan('identityBridge.exchangeCodeForToken');
        const startTime = Date.now();
        try {
            const provider = this.providers.get(providerName);
            if (!provider) {
                throw new ProviderNotFoundError(providerName);
            }
            const tokenRequest = {
                grant_type: types_1.GRANT_TYPES.AUTHORIZATION_CODE,
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('exchangeCodeForToken', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async clientCredentialsGrant(providerName, scopes) {
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
            const tokenRequest = {
                grant_type: types_1.GRANT_TYPES.CLIENT_CREDENTIALS,
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('clientCredentialsGrant', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async requestToken(issuer, tokenRequest, provider) {
        const validatedRequest = types_1.TokenRequestSchema.parse(tokenRequest);
        const params = new URLSearchParams();
        Object.entries(validatedRequest).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, String(value));
            }
        });
        const result = await this.circuitBreaker.call(`token:${issuer}`, async () => {
            const response = await this.retryWithTimeout(() => this.httpClient.post(`${issuer}/token`, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }));
            return types_1.OAuthTokenSchema.parse(response.data);
        });
        if (!result.ok)
            throw result.error;
        const oauthToken = result.value;
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + oauthToken.expires_in);
        const storedToken = {
            id: (0, crypto_1.randomUUID)(),
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
    async refreshToken(tokenId) {
        const span = this.tracer.startSpan('identityBridge.refreshToken');
        const startTime = Date.now();
        try {
            const storedToken = await this.tokenStore.getToken(tokenId);
            if (!storedToken)
                throw new TokenNotFoundError(tokenId);
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
            const provider = Array.from(this.providers.values()).find(p => p.issuer === storedToken.issuer && p.clientId === storedToken.client_id);
            if (!provider) {
                throw new ProviderNotFoundError(`Provider for issuer ${storedToken.issuer} not found`);
            }
            const tokenRequest = {
                grant_type: types_1.GRANT_TYPES.REFRESH_TOKEN,
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
        }
        catch (err) {
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
    async validateToken(tokenId) {
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
            const errors = [];
            const warnings = [];
            if (isExpired)
                errors.push('Token has expired');
            if (!storedToken.refresh_token && isExpired)
                errors.push('Token expired and no refresh token available');
            if (isExpired && storedToken.refresh_token)
                warnings.push('Token expired but can be refreshed');
            const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
            if (expiresAt < fiveMinutesFromNow && !isExpired)
                warnings.push('Token expires soon');
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('validateToken', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    // ==================== Token Introspection ====================
    async introspectToken(tokenId) {
        const span = this.tracer.startSpan('identityBridge.introspectToken');
        const startTime = Date.now();
        try {
            const storedToken = await this.tokenStore.getToken(tokenId);
            if (!storedToken)
                throw new TokenNotFoundError(tokenId);
            const provider = Array.from(this.providers.values()).find(p => p.issuer === storedToken.issuer && p.clientId === storedToken.client_id);
            if (!provider) {
                throw new ProviderNotFoundError(`Provider for issuer ${storedToken.issuer} not found`);
            }
            const result = await this.circuitBreaker.call(`introspect:${storedToken.issuer}`, async () => {
                const params = new URLSearchParams();
                params.append('token', storedToken.access_token);
                params.append('client_id', provider.clientId);
                if (provider.clientSecret)
                    params.append('client_secret', provider.clientSecret);
                const response = await this.retryWithTimeout(() => this.httpClient.post(`${storedToken.issuer}/introspect`, params.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }));
                return response.data;
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('introspectToken', duration, true);
            span.end();
            return { ok: true, value: result.value };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('introspectToken', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    // ==================== Token Revocation ====================
    async revokeToken(tokenId) {
        const span = this.tracer.startSpan('identityBridge.revokeToken');
        const startTime = Date.now();
        try {
            const storedToken = await this.tokenStore.getToken(tokenId);
            if (!storedToken)
                throw new TokenNotFoundError(tokenId);
            const provider = Array.from(this.providers.values()).find(p => p.issuer === storedToken.issuer && p.clientId === storedToken.client_id);
            if (provider) {
                // Call revocation endpoint if available
                const params = new URLSearchParams();
                params.append('token', storedToken.access_token);
                params.append('client_id', provider.clientId);
                if (provider.clientSecret)
                    params.append('client_secret', provider.clientSecret);
                params.append('token_type_hint', 'access_token');
                await this.circuitBreaker.call(`revoke:${storedToken.issuer}`, async () => {
                    await this.retryWithTimeout(() => this.httpClient.post(`${storedToken.issuer}/revoke`, params.toString(), {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    }));
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('revokeToken', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    // ==================== UserInfo ====================
    async getUserInfo(tokenId) {
        const span = this.tracer.startSpan('identityBridge.getUserInfo');
        const startTime = Date.now();
        try {
            const storedToken = await this.tokenStore.getToken(tokenId);
            if (!storedToken)
                throw new TokenNotFoundError(tokenId);
            const result = await this.circuitBreaker.call(`userinfo:${storedToken.issuer}`, async () => {
                const response = await this.retryWithTimeout(() => this.httpClient.get(`${storedToken.issuer}/userinfo`, {
                    headers: { Authorization: `Bearer ${storedToken.access_token}` },
                }));
                return response.data;
            });
            if (!result.ok)
                throw result.error;
            const duration = Date.now() - startTime;
            this.recordMetrics('getUserInfo', duration, true);
            span.end();
            return { ok: true, value: result.value };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('getUserInfo', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    // ==================== Convenience Methods ====================
    async getValidTokenForPatient(patientId, clientId, autoRefresh = true) {
        const span = this.tracer.startSpan('identityBridge.getValidTokenForPatient');
        const startTime = Date.now();
        try {
            let token = await this.tokenStore.getTokenByPatient(patientId, clientId);
            if (!token) {
                return { ok: false, error: new TokenNotFoundError(`No token for patient ${patientId}`) };
            }
            const validationResult = await this.validateToken(token.id);
            if (!validationResult.ok)
                throw validationResult.error;
            const validation = validationResult.value;
            if (!validation.valid && autoRefresh && token.refresh_token) {
                const refreshResult = await this.refreshToken(token.id);
                if (refreshResult.ok && refreshResult.value.success && refreshResult.value.token) {
                    token = refreshResult.value.token;
                }
                else {
                    return { ok: false, error: new IdentityBridgeError('REFRESH_FAILED', 'Unable to refresh token') };
                }
            }
            else if (!validation.valid) {
                return { ok: false, error: new TokenExpiredError(token.id) };
            }
            const duration = Date.now() - startTime;
            this.recordMetrics('getValidTokenForPatient', duration, true);
            span.end();
            return { ok: true, value: token };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('getValidTokenForPatient', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async getTokenStatus(tokenId) {
        const validationResult = await this.validateToken(tokenId);
        if (!validationResult.ok)
            return { ok: false, error: validationResult.error };
        const validation = validationResult.value;
        if (!validation.valid) {
            const token = await this.tokenStore.getToken(tokenId);
            if (token?.refresh_token) {
                return { ok: true, value: types_1.TOKEN_STATUS.REFRESH_NEEDED };
            }
            return { ok: true, value: types_1.TOKEN_STATUS.EXPIRED };
        }
        return { ok: true, value: types_1.TOKEN_STATUS.ACTIVE };
    }
    async getAuthContext(tokenId) {
        const span = this.tracer.startSpan('identityBridge.getAuthContext');
        const startTime = Date.now();
        try {
            const token = await this.tokenStore.getToken(tokenId);
            if (!token)
                throw new TokenNotFoundError(tokenId);
            const validationResult = await this.validateToken(tokenId);
            if (!validationResult.ok)
                throw validationResult.error;
            if (!validationResult.value.valid) {
                throw new TokenExpiredError(tokenId);
            }
            // Find provider
            const provider = Array.from(this.providers.values()).find(p => p.issuer === token.issuer && p.clientId === token.client_id);
            if (!provider) {
                throw new ProviderNotFoundError(`Provider for issuer ${token.issuer} not found`);
            }
            // Optionally fetch user info
            let userInfo = null;
            try {
                const userInfoResult = await this.getUserInfo(tokenId);
                if (userInfoResult.ok)
                    userInfo = userInfoResult.value;
            }
            catch {
                // Ignore userinfo failure
            }
            const authContext = {
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('getAuthContext', duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async updateTokenUsage(tokenId) {
        try {
            await this.tokenStore.updateToken(tokenId, { last_used: new Date().toISOString() });
            return { ok: true, value: undefined };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { ok: false, error };
        }
    }
    async cleanupExpiredTokens() {
        try {
            const count = await this.tokenStore.cleanupExpiredTokens();
            return { ok: true, value: count };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { ok: false, error };
        }
    }
    async getActiveTokensCount(clientId) {
        try {
            const activeTokens = await this.tokenStore.getActiveTokens(clientId);
            return { ok: true, value: activeTokens.length };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return { ok: false, error };
        }
    }
    // ==================== Observability ====================
    getMetrics(moduleId) {
        return this.metrics.getMetrics(moduleId);
    }
    getEvents() {
        return this.logger.getEvents();
    }
    async getHealth() {
        return this.healthChecker.check();
    }
    getInfo() {
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
    async retryWithTimeout(fn) {
        let attempt = 0;
        const start = Date.now();
        while (attempt < this.config.retry.maxAttempts) {
            try {
                return await fn();
            }
            catch (err) {
                attempt++;
                const elapsed = Date.now() - start;
                if (elapsed >= this.config.defaultTimeoutMs) {
                    throw new Error(`Timeout after ${this.config.defaultTimeoutMs}ms`);
                }
                if (!this.retryStrategy.shouldRetry(attempt, err)) {
                    throw err;
                }
                const delay = this.retryStrategy.getDelay(attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error('Max retries exceeded');
    }
    recordMetrics(operation, durationMs, success, error) {
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
exports.IdentityBridge = IdentityBridge;
// ==================== Factory ====================
function createIdentityBridge(tokenStore, config, hooks) {
    return new IdentityBridge(tokenStore, config, hooks);
}
//# sourceMappingURL=identity-bridge.js.map