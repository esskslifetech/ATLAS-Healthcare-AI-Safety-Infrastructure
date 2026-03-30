import { TriageRequest, TriageResult, TriageUrgency, CarePathway } from './types';
type AgentId = string & {
    __brand: 'AgentId';
};
export interface TriageAgentConfig {
    agentId: AgentId;
    defaultTimeoutMs: number;
    retry: RetryConfig;
    circuitBreaker: CircuitBreakerConfig;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
    fhirServiceUrl?: string;
    terminologyServiceUrl?: string;
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
export declare class TriageAgentError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    requestCount: number;
    successCount: number;
    failureCount: number;
    averageDurationMs: number;
    errorCount: number;
    lastError?: string;
    urgencyDistribution: Record<TriageUrgency, number>;
    pathwayDistribution: Record<CarePathway, number>;
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
export declare class TriageAgent {
    private config;
    private engine;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    private eventEmitter;
    constructor(config?: Partial<TriageAgentConfig>);
    /**
     * Perform triage assessment on a patient request.
     */
    assessTriage(request: TriageRequest): Promise<Result<TriageResult>>;
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
     * Subscribes to integration events (e.g., for care coordinator).
     */
    on(event: string, listener: (...args: any[]) => void): void;
}
export {};
//# sourceMappingURL=triage-agent.d.ts.map