import { CareSession, CoordinationRequest, CoordinationResult, IntegrationEvent } from './types';
export interface CoordinatorConfig {
    agentId: string;
    defaultTimeoutMs: number;
    retryAttempts: number;
    retryBackoffMs: number;
    circuitBreakerThreshold: number;
    circuitBreakerTimeoutMs: number;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableNotifications: boolean;
    sessionRepoType: 'inmemory' | 'redis';
    redisUrl?: string;
}
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare function ok<T>(value: T): Result<T, never>;
export declare function err<E>(error: E): Result<never, E>;
export declare function isOk<T, E>(result: Result<T, E>): result is {
    ok: true;
    value: T;
};
export declare class CoordinatorError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
export declare class SessionNotFoundError extends CoordinatorError {
    constructor(sessionId: string);
}
export declare class ConcurrencyError extends CoordinatorError {
    constructor(message: string);
}
export declare class WorkflowError extends CoordinatorError {
    constructor(message: string, cause?: unknown);
}
interface Metrics {
    sessionCount: number;
    successCount: number;
    failureCount: number;
    averageDurationMs: number;
    handoffCount: number;
    errorCount: number;
    lastError?: string;
}
export declare class CareCoordinator {
    private config;
    private sessionRepo;
    private metrics;
    private logger;
    private agentExecutor;
    private orchestrator;
    private sharpFhirIntegration;
    private notificationService;
    constructor(config?: CoordinatorConfig);
    coordinateCare(request: CoordinationRequest): Promise<Result<CoordinationResult>>;
    cancelSession(sessionId: string): Promise<Result<boolean>>;
    getSession(sessionId: string): Promise<CareSession | undefined>;
    listActiveSessions(): Promise<CareSession[]>;
    getMetrics(agentId?: string): Promise<Metrics | Map<string, Metrics>>;
    getIntegrationEvents(): IntegrationEvent[];
    getAgentInfo(): {
        id: string;
        name: string;
        version: string;
        capabilities: string[];
    };
    private createSession;
    private addTimelineEvent;
}
export {};
//# sourceMappingURL=care-coordinator.d.ts.map