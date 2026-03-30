import { AuditEvent, AuditQuery, AuditStatistics, ChainValidation, AuditExport } from './types';
export interface AuditLoggerConfig {
    systemId: string;
    environment: string;
    enableMetrics: boolean;
    enableEventLogging: boolean;
    enableTracing: boolean;
    retentionPeriodDays: number;
    defaultPageSize: number;
    hashAlgorithm: string;
}
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare class AuditLoggerError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(code: string, message: string, cause?: unknown | undefined);
}
interface MetricsSnapshot {
    eventCount: number;
    successCount: number;
    failureCount: number;
    errorCount: number;
    lastError?: string;
    actionDistribution: Record<string, number>;
    resultDistribution: Record<string, number>;
}
interface EventLog {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    action: string;
    eventId: string;
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
export declare class AuditLogger {
    private store;
    private config;
    private metrics;
    private logger;
    private tracer;
    constructor(config?: Partial<AuditLoggerConfig>);
    logEvent(event: Partial<AuditEvent>): Promise<Result<AuditEvent>>;
    logAccess(params: {
        actor: {
            id: string;
            type: string;
            name?: string;
            role?: string;
        };
        resource: {
            type: string;
            id?: string;
        };
        patient_id: string;
        purpose: string;
        consent_ref?: string;
        result: 'success' | 'failure' | 'partial';
        details?: string;
    }): Promise<Result<AuditEvent>>;
    logSystemEvent(params: {
        action: string;
        details?: string;
        result: 'success' | 'failure' | 'partial';
        metadata?: any;
    }): Promise<Result<AuditEvent>>;
    queryEvents(query: AuditQuery): Promise<Result<AuditEvent[]>>;
    getStatistics(query?: Partial<AuditQuery>): Promise<Result<AuditStatistics>>;
    validateChain(): Promise<Result<ChainValidation>>;
    exportEvents(query: AuditQuery, format: "json" | "csv" | "xml" | undefined, exportedBy: {
        id: string;
        type: string;
        name?: string;
    }, purpose: string, consentRef?: string): Promise<Result<AuditExport>>;
    checkRetentionCompliance(): Promise<Result<{
        compliant: boolean;
        eventsToRetain: number;
        eventsExpired: number;
        retentionPeriod: number;
    }>>;
    createHipaaComplianceReport(dateRange?: {
        start: string;
        end: string;
    }): Promise<Result<{
        report_id: string;
        timestamp: string;
        date_range: {
            start: string;
            end: string;
        };
        total_events: number;
        access_events: number;
        disclosure_events: number;
        consent_events: number;
        security_events: number;
        unique_patients: number;
        chain_valid: boolean;
        retention_compliant: boolean;
        recommendations: string[];
    }>>;
    getSystemInfo(): {
        systemId: string;
        environment: string;
        eventCount: Promise<number>;
    };
    getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot>;
    getEvents(): EventLog[];
    getInfo(): {
        name: string;
        version: string;
        capabilities: string[];
    };
    private calculateHash;
    private calculateExportChecksum;
    private recordMetrics;
}
export declare function createAuditLogger(config?: Partial<AuditLoggerConfig>): AuditLogger;
export {};
//# sourceMappingURL=audit-logger.d.ts.map