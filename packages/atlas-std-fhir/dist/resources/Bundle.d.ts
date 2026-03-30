import { AtlasFhirClient } from '../client';
type anyResource = any;
export interface BundleResourceConfig {
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
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare class BundleResourceError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    operationCount: number;
    successCount: number;
    failureCount: number;
    errorCount: number;
    lastError?: string;
    operationDistribution: Record<string, number>;
    durationHistogram: number[];
}
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    operation: string;
    bundleId?: string;
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
export declare class BundleResource {
    private client;
    private config;
    private metrics;
    private logger;
    private tracer;
    private circuitBreaker;
    private retryStrategy;
    private healthChecker;
    constructor(client: AtlasFhirClient, config?: Partial<BundleResourceConfig>);
    create(bundle: any): Promise<Result<any>>;
    read(id: string): Promise<Result<any>>;
    update(bundle: any): Promise<Result<any>>;
    delete(id: string): Promise<Result<void>>;
    createTransaction(entries: {
        method: 'POST' | 'PUT' | 'DELETE' | 'GET';
        url: string;
        resource?: anyResource;
        ifMatch?: string;
        ifNoneExist?: string;
    }[]): Promise<Result<any>>;
    createBatch(entries: {
        method: 'POST' | 'PUT' | 'DELETE' | 'GET';
        url: string;
        resource?: anyResource;
        ifMatch?: string;
        ifNoneExist?: string;
    }[]): Promise<Result<any>>;
    createDocument(params: {
        title: string;
        patientId: string;
        authorId: string;
        sections: {
            title: string;
            code: {
                system: string;
                code: string;
                display?: string;
            };
            entries: anyResource[];
        }[];
        timestamp?: string;
    }): Promise<Result<any>>;
    createSearchset(resources: anyResource[], total?: number): Promise<Result<any>>;
    extractResources<T extends anyResource>(bundle: any, resourceType: string): T[];
    extractFirstResource<T extends anyResource>(bundle: any, resourceType: string): T | undefined;
    getPaginationInfo(bundle: any): {
        total?: number;
        links: {
            self?: string;
            first?: string;
            previous?: string;
            next?: string;
            last?: string;
        };
    };
    validateBundle(bundle: any): {
        valid: boolean;
        errors: string[];
    };
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
    private generateUUID;
}
export declare function createBundleResource(client: AtlasFhirClient, config?: Partial<BundleResourceConfig>): BundleResource;
export {};
//# sourceMappingURL=Bundle.d.ts.map