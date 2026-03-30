import { StoredToken, SmartConfig, TokenValidation, TokenRefreshResult, TokenStore, IdentityProvider, AuthContext } from './types';
export interface IdentityBridgeConfig {
    defaultTimeoutMs: number;
    retry: RetryConfig;
    circuitBreaker: CircuitBreakerConfig;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
    enableCache: boolean;
    cacheTTLMs: number;
    enableHooks: boolean;
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
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare class IdentityBridgeError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
export declare class TokenNotFoundError extends IdentityBridgeError {
    constructor(tokenId: string);
}
export declare class ProviderNotFoundError extends IdentityBridgeError {
    constructor(providerName: string);
}
export declare class InvalidGrantError extends IdentityBridgeError {
    constructor(details: string);
}
export declare class TokenExpiredError extends IdentityBridgeError {
    constructor(tokenId: string);
}
export interface IdentityBridgeHooks {
    onTokenIssued?: (token: StoredToken) => void;
    onTokenRefreshed?: (oldTokenId: string, newToken: StoredToken) => void;
    onTokenRevoked?: (tokenId: string) => void;
    onTokenValidationFailed?: (tokenId: string, errors: string[]) => void;
    onProviderHealthChanged?: (providerName: string, healthy: boolean) => void;
}
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
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    operation: string;
    data: any;
    success: boolean;
}
interface Span {
    end(): void;
    setAttribute(key: string, value: unknown): void;
    recordException(error: Error): void;
}
interface Tracer {
    startSpan(name: string, options?: {
        attributes?: Record<string, unknown>;
    }): Span;
}
export declare function setTracer(tracer: Tracer): void;
export interface HealthStatus {
    healthy: boolean;
    providers: Map<string, {
        healthy: boolean;
        lastCheck: string;
        error?: string;
    }>;
    circuitBreakers: Map<string, {
        state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
        failures: number;
    }>;
}
export declare class InMemoryTokenStore implements TokenStore {
    private tokens;
    private mutex;
    storeToken(token: StoredToken): Promise<void>;
    getToken(tokenId: string): Promise<StoredToken | null>;
    getTokenByPatient(patientId: string, clientId: string): Promise<StoredToken | null>;
    updateToken(tokenId: string, updates: Partial<StoredToken>): Promise<StoredToken>;
    revokeToken(tokenId: string): Promise<void>;
    cleanupExpiredTokens(): Promise<number>;
    getActiveTokens(clientId: string): Promise<StoredToken[]>;
}
export declare class IdentityBridge {
    private tokenStore;
    private httpClient;
    private providers;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    private smartConfigCache?;
    private hooks;
    constructor(tokenStore?: TokenStore, config?: Partial<IdentityBridgeConfig>, hooks?: IdentityBridgeHooks);
    registerProvider(provider: IdentityProvider): void;
    getProvider(name: string): IdentityProvider | undefined;
    getSmartConfig(issuer: string): Promise<Result<SmartConfig>>;
    static generateCodeVerifier(): string;
    static generateCodeChallenge(verifier: string): Promise<string>;
    generateAuthorizationUrl(providerName: string, options?: {
        state?: string;
        codeChallenge?: string;
        launch?: string;
        patient?: string;
        encounter?: string;
    }): Result<string>;
    exchangeCodeForToken(providerName: string, code: string, codeVerifier?: string): Promise<Result<StoredToken>>;
    clientCredentialsGrant(providerName: string, scopes?: string[]): Promise<Result<StoredToken>>;
    private requestToken;
    refreshToken(tokenId: string): Promise<Result<TokenRefreshResult>>;
    validateToken(tokenId: string): Promise<Result<TokenValidation>>;
    introspectToken(tokenId: string): Promise<Result<{
        active: boolean;
        [key: string]: any;
    }>>;
    revokeToken(tokenId: string): Promise<Result<void>>;
    getUserInfo(tokenId: string): Promise<Result<any>>;
    getValidTokenForPatient(patientId: string, clientId: string, autoRefresh?: boolean): Promise<Result<StoredToken>>;
    getTokenStatus(tokenId: string): Promise<Result<string>>;
    getAuthContext(tokenId: string): Promise<Result<AuthContext>>;
    updateTokenUsage(tokenId: string): Promise<Result<void>>;
    cleanupExpiredTokens(): Promise<Result<number>>;
    getActiveTokensCount(clientId: string): Promise<Result<number>>;
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    getEvents(): EventLog[];
    getHealth(): Promise<HealthStatus>;
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
    private retryWithTimeout;
    private recordMetrics;
}
export declare function createIdentityBridge(tokenStore?: TokenStore, config?: Partial<IdentityBridgeConfig>, hooks?: IdentityBridgeHooks): IdentityBridge;
export {};
//# sourceMappingURL=identity-bridge.d.ts.map