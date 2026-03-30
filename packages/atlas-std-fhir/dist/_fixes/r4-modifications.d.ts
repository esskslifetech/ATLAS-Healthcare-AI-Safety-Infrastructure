export type VendorId = string & {
    __brand: 'VendorId';
};
export type ResourceType = string;
export interface VendorFix {
    vendor: VendorId;
    appliesTo: ResourceType[];
    fix: (resource: any) => any;
}
export interface R4ModificationsConfig {
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
    defaultVendor?: VendorId;
    vendorDetectionStrategy: 'extension' | 'metadata' | 'both';
}
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare class R4ModificationsError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    resourceCount: number;
    successCount: number;
    failureCount: number;
    errorCount: number;
    lastError?: string;
    vendorDistribution: Record<string, number>;
    resourceTypeDistribution: Record<string, number>;
}
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    resourceType: string;
    vendor: string | null;
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
interface VendorDefinition {
    id: VendorId;
    name: string;
    detectionPatterns: {
        extensionUrls?: string[];
        metaTags?: string[];
        sourceIdentifier?: string;
    };
    fixes: VendorFix[];
    fieldMappings: Record<string, string>;
}
export declare class R4ModificationsService {
    private config;
    private registry;
    private metrics;
    private logger;
    private tracer;
    constructor(config?: Partial<R4ModificationsConfig>);
    /**
     * Normalizes a FHIR resource by detecting vendor and applying appropriate fixes and field mappings.
     */
    normalizeResource(resource: any): Result<any>;
    /**
     * Apply fixes only (without field mapping) using a specified vendor.
     */
    applyVendorFixes(resource: any, vendor?: string): Result<any>;
    /**
     * Map fields only (without fixes) using a specified vendor.
     */
    mapVendorFields(resource: any, vendor: string): Result<any>;
    /**
     * Detect vendor from a resource.
     */
    detectVendor(resource: any): string | null;
    /**
     * Register a custom vendor.
     */
    registerVendor(definition: VendorDefinition): void;
    /**
     * Get metrics.
     */
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    /**
     * Get event logs.
     */
    getEvents(): EventLog[];
    /**
     * Get agent information.
     */
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
}
export declare function getDefaultR4ModificationsService(): R4ModificationsService;
export declare function normalizeResource(resource: any): Result<any>;
export declare function applyVendorFixes(resource: any, vendor?: string): Result<any>;
export declare function mapVendorFields(resource: any, vendor: string): Result<any>;
export declare function detectVendor(resource: any): string | null;
export {};
//# sourceMappingURL=r4-modifications.d.ts.map