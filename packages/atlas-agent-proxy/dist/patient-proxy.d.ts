import { PatientMessage, AgentResponse, PatientSession } from './types';
type AgentId = string & {
    __brand: 'AgentId';
};
export interface PatientProxyConfig {
    agentId: AgentId;
    defaultTimeoutMs: number;
    retry: RetryConfig;
    circuitBreaker: CircuitBreakerConfig;
    sessionMaxDurationMs: number;
    sessionCleanupIntervalMs: number;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
    nlpServiceUrl?: string;
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
export declare class PatientProxyError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    messageCount: number;
    successCount: number;
    failureCount: number;
    averageProcessingTimeMs: number;
    emergencyEscalationCount: number;
    errorCount: number;
    lastError?: string;
    durationHistogram: number[];
}
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    sessionId: string;
    patientId: string;
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
interface HealthStatus {
    healthy: boolean;
    services: Map<string, {
        healthy: boolean;
        lastFailure?: string;
    }>;
    circuitBreakers: Map<string, {
        state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
        failures: number;
    }>;
}
export declare class PatientProxyAgent {
    private config;
    private sessionManager;
    private profileManager;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private messageAnalyzer;
    private contentTemplater;
    private watcher;
    private healthChecker;
    constructor(config?: Partial<PatientProxyConfig>);
    /**
     * Process an incoming patient message.
     */
    processMessage(message: PatientMessage): Promise<Result<AgentResponse>>;
    private retryWithTimeout;
    private generateResponse;
    private determineResponseType;
    private getResponseType;
    private generateNextSteps;
    private updateSessionContext;
    private triggerEmergencyEscalation;
    /**
     * Ends a patient session.
     */
    endSession(sessionId: string): Promise<Result<PatientSession>>;
    /**
     * Retrieves a session by ID.
     */
    getSession(sessionId: string): PatientSession | undefined;
    /**
     * Lists all active sessions.
     */
    listActiveSessions(): PatientSession[];
    /**
     * Returns performance metrics.
     */
    getMetrics(agentId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    /**
     * Returns logged events.
     */
    getEvents(): EventLog[];
    /**
     * Returns health status.
     */
    getHealth(): HealthStatus;
    /**
     * Returns agent information.
     */
    getAgentInfo(): {
        id: string;
        name: string;
        version: string;
        capabilities: string[];
    };
    /**
     * Shuts down the agent gracefully.
     */
    shutdown(): void;
}
export {};
//# sourceMappingURL=patient-proxy.d.ts.map