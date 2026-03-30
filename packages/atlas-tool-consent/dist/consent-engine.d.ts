import { ConsentPolicy, ConsentRequest, ConsentDecision, ConsentVerificationResult, ConsentAuditEntry } from './types';
export interface ConsentEngineConfig {
    defaultTimeoutMs: number;
    retry: RetryConfig;
    circuitBreaker: CircuitBreakerConfig;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
    emergencyAccessEnabled: boolean;
    defaultEmergencyScope: string[];
    cacheTTLMs: number;
    enableCache: boolean;
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
export declare class ConsentEngineError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
export declare class PolicyNotFoundError extends ConsentEngineError {
    constructor(policyId: string);
}
export declare class InvalidScopeError extends ConsentEngineError {
    constructor(scope: string);
}
export declare class ConditionViolationError extends ConsentEngineError {
    constructor(condition: string);
}
export interface ConsentHooks {
    onPolicyCreated?: (policy: ConsentPolicy) => void;
    onPolicyUpdated?: (old: ConsentPolicy, newPolicy: ConsentPolicy) => void;
    onPolicyRevoked?: (policy: ConsentPolicy, reason: string) => void;
    onConsentVerified?: (request: ConsentRequest, result: ConsentVerificationResult) => void;
    onConsentDenied?: (request: ConsentRequest, reason: string) => void;
    onEmergencyAccess?: (request: ConsentRequest) => void;
}
export interface ConsentStorage {
    createPolicy(policy: ConsentPolicy): Promise<ConsentPolicy>;
    getPolicy(patientId: string, purpose: string): Promise<ConsentPolicy | null>;
    getPolicyById(id: string): Promise<ConsentPolicy | null>;
    updatePolicy(id: string, policy: ConsentPolicy): Promise<ConsentPolicy>;
    revokePolicy(id: string, reason?: string): Promise<ConsentPolicy>;
    getPatientPolicies(patientId: string): Promise<ConsentPolicy[]>;
    getPolicyHistory(policyId: string): Promise<ConsentPolicy[]>;
    createDecision(decision: ConsentDecision): Promise<ConsentDecision>;
    getDecision(requestId: string): Promise<ConsentDecision | null>;
    addAuditEntry(entry: ConsentAuditEntry): Promise<ConsentAuditEntry>;
    getAuditEntries(patientId: string, limit?: number): Promise<ConsentAuditEntry[]>;
    hasActivePolicy(patientId: string, purpose: string): Promise<boolean>;
}
export declare class InMemoryConsentStorage implements ConsentStorage {
    private policies;
    private policyHistory;
    private decisions;
    private audit;
    private mutex;
    createPolicy(policy: ConsentPolicy): Promise<ConsentPolicy>;
    getPolicy(patientId: string, purpose: string): Promise<ConsentPolicy | null>;
    getPolicyById(id: string): Promise<ConsentPolicy | null>;
    updatePolicy(id: string, policy: ConsentPolicy): Promise<ConsentPolicy>;
    revokePolicy(id: string, reason?: string): Promise<ConsentPolicy>;
    getPatientPolicies(patientId: string): Promise<ConsentPolicy[]>;
    getPolicyHistory(policyId: string): Promise<ConsentPolicy[]>;
    createDecision(decision: ConsentDecision): Promise<ConsentDecision>;
    getDecision(requestId: string): Promise<ConsentDecision | null>;
    addAuditEntry(entry: ConsentAuditEntry): Promise<ConsentAuditEntry>;
    getAuditEntries(patientId: string, limit?: number): Promise<ConsentAuditEntry[]>;
    hasActivePolicy(patientId: string, purpose: string): Promise<boolean>;
}
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
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
    services: Map<string, {
        healthy: boolean;
        lastFailure?: string;
    }>;
    circuitBreakers: Map<string, {
        state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
        failures: number;
    }>;
    timestamp: string;
}
export declare class ConsentEngine {
    private storage;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    private policyCache?;
    private hooks;
    private mutex;
    constructor(storage?: ConsentStorage, config?: Partial<ConsentEngineConfig>, hooks?: ConsentHooks);
    /**
     * Creates a new consent policy.
     * @param policy - The policy to create.
     * @returns Result containing the created policy or an error.
     */
    createConsentPolicy(policy: ConsentPolicy): Promise<Result<ConsentPolicy>>;
    /**
     * Verifies if a consent request is allowed based on active policies.
     * @param request - The consent request.
     * @returns Result containing verification result or error.
     */
    verifyConsent(request: ConsentRequest): Promise<Result<ConsentVerificationResult>>;
    /**
     * Records a consent decision (e.g., after user interaction).
     * @param decision - The decision to record.
     * @returns Result containing the created decision or error.
     */
    recordDecision(decision: ConsentDecision): Promise<Result<ConsentDecision>>;
    /**
     * Revokes a consent policy.
     * @param policyId - The ID of the policy to revoke.
     * @param reason - The reason for revocation.
     * @returns Result containing the revoked policy or error.
     */
    revokeConsent(policyId: string, reason: string): Promise<Result<ConsentPolicy>>;
    /**
     * Gets audit entries for a patient.
     * @param patientId - The patient ID.
     * @param limit - Optional limit.
     * @returns Result containing audit entries or error.
     */
    getConsentAudit(patientId: string, limit?: number): Promise<Result<ConsentAuditEntry[]>>;
    /**
     * Checks if the patient has any active consent policy for any purpose.
     * @param patientId - The patient ID.
     * @returns Result containing boolean or error.
     */
    hasActiveConsent(patientId: string): Promise<Result<boolean>>;
    /**
     * Gets all consent policies for a patient.
     * @param patientId - The patient ID.
     * @returns Result containing list of policies or error.
     */
    getPatientConsentPolicies(patientId: string): Promise<Result<ConsentPolicy[]>>;
    /**
     * Gets consent statistics for a patient.
     * @param patientId - The patient ID.
     * @returns Result containing statistics or error.
     */
    getConsentStatistics(patientId: string): Promise<Result<{
        activePolicies: number;
        totalPolicies: number;
        lastActivity: string | null;
        scopesGranted: string[];
    }>>;
    /**
     * Creates a policy from a predefined template.
     * @param patientId - The patient ID.
     * @param templateName - The template name (e.g., 'standard_treatment', 'research').
     * @param grantedBy - Who grants the consent.
     * @returns Result containing created policy or error.
     */
    createPolicyFromTemplate(patientId: string, templateName: 'standard_treatment' | 'research', grantedBy: 'patient' | 'legal_representative' | 'proxy'): Promise<Result<ConsentPolicy>>;
    /**
     * Gets the version history of a policy.
     * @param policyId - The policy ID.
     * @returns Result containing list of policy versions or error.
     */
    getPolicyHistory(policyId: string): Promise<Result<ConsentPolicy[]>>;
    /**
     * Creates a default consent policy (standard treatment).
     */
    createDefaultConsentPolicy(patientId: string, grantedBy: string): ConsentPolicy;
    /**
     * Checks if requested scopes are a subset of granted scopes.
     */
    areScopesCompatible(requested: string[], granted: string[]): boolean;
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    getEvents(): EventLog[];
    getHealth(): Promise<HealthStatus>;
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
    private handleEmergencyAccess;
    private logConsentVerification;
    private retryWithTimeout;
    private recordMetrics;
    private evaluateConditions;
    private getPolicyTemplate;
}
export declare function createConsentEngine(storage?: ConsentStorage, config?: Partial<ConsentEngineConfig>, hooks?: ConsentHooks): ConsentEngine;
export {};
//# sourceMappingURL=consent-engine.d.ts.map