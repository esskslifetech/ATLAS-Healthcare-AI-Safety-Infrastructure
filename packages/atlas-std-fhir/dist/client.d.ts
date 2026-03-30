import { z } from 'zod';
type anyResource = any;
type anyBundle = any;
type anyCapabilityStatement = any;
export declare const FhirConfigSchema: z.ZodObject<{
    baseUrl: z.ZodString;
    auth: z.ZodOptional<z.ZodObject<{
        token: z.ZodOptional<z.ZodString>;
        clientId: z.ZodOptional<z.ZodString>;
        clientSecret: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodEnum<["bearer", "basic", "oauth"]>>;
    }, "strip", z.ZodTypeAny, {
        token?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        type?: "bearer" | "basic" | "oauth" | undefined;
    }, {
        token?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        type?: "bearer" | "basic" | "oauth" | undefined;
    }>>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    baseUrl: string;
    timeout: number;
    auth?: {
        token?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        type?: "bearer" | "basic" | "oauth" | undefined;
    } | undefined;
}, {
    baseUrl: string;
    auth?: {
        token?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        type?: "bearer" | "basic" | "oauth" | undefined;
    } | undefined;
    timeout?: number | undefined;
}>;
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
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare class FhirClientError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
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
export declare class VendorNormalizer {
    static normalizeEpicExtensions(resource: any): any;
    static normalizeCernerExtensions(resource: any): any;
    static normalize(resource: any): any;
}
export declare class AtlasFhirClient {
    private client;
    private config;
    private retryStrategy;
    private circuitBreaker;
    private metrics;
    private logger;
    private tracer;
    private healthChecker;
    private observability;
    constructor(config: FhirConfig, retryConfig?: Partial<ClientRetryConfig>, circuitBreakerConfig?: Partial<ClientCircuitBreakerConfig>, observability?: Partial<ClientObservabilityConfig>);
    private setupInterceptors;
    private recordResponse;
    private normalizeResource;
    read(resourceType: string, id: string): Promise<anyResource>;
    create(resource: anyResource): Promise<anyResource>;
    update(resource: anyResource): Promise<anyResource>;
    delete(resourceType: string, id: string): Promise<void>;
    search(resourceType: string, params: Record<string, any>): Promise<anyBundle>;
    transaction(bundle: anyBundle): Promise<anyBundle>;
    batch(bundle: anyBundle): Promise<anyBundle>;
    capabilities(): Promise<anyCapabilityStatement>;
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    getEvents(): EventLog[];
    getHealth(): Promise<HealthStatus>;
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
}
export {};
//# sourceMappingURL=client.d.ts.map