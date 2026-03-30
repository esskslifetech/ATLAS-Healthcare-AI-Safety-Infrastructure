import { z } from 'zod';
export declare const RETENTION_PERIODS: {
    readonly HIPAA_MINIMUM: number;
    readonly EU_GDPR: number;
    readonly CUSTOM: number;
};
export declare const SECURITY_LEVELS: {
    readonly PUBLIC: "public";
    readonly INTERNAL: "internal";
    readonly CONFIDENTIAL: "confidential";
    readonly RESTRICTED: "restricted";
};
export declare const HIPAA_EVENT_CATEGORIES: {
    readonly ACCESS: "access";
    readonly DISCLOSURE: "disclosure";
    readonly CONSENT: "consent";
    readonly SECURITY: "security";
    readonly SYSTEM: "system";
};
export declare const COMPLIANCE_FRAMEWORKS: {
    readonly HIPAA: "hipaa";
    readonly GDPR: "gdpr";
    readonly ISO27001: "iso27001";
    readonly HITRUST: "hitrust";
};
export declare const AuditEventSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    type: z.ZodString;
    source: z.ZodString;
    action: z.ZodString;
    actor: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        name?: string | undefined;
        role?: string | undefined;
    }, {
        id: string;
        type: string;
        name?: string | undefined;
        role?: string | undefined;
    }>;
    resource: z.ZodObject<{
        type: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id?: string | undefined;
    }, {
        type: string;
        id?: string | undefined;
    }>;
    patient_id: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodString>;
    result: z.ZodEnum<["success", "failure", "partial"]>;
    hash: z.ZodString;
    previous_hash: z.ZodOptional<z.ZodString>;
    event_id: z.ZodString;
    purpose: z.ZodOptional<z.ZodString>;
    consent_ref: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    timestamp: string;
    type: string;
    source: string;
    action: string;
    actor: {
        id: string;
        type: string;
        name?: string | undefined;
        role?: string | undefined;
    };
    resource: {
        type: string;
        id?: string | undefined;
    };
    result: "success" | "failure" | "partial";
    hash: string;
    event_id: string;
    patient_id?: string | undefined;
    details?: string | undefined;
    previous_hash?: string | undefined;
    purpose?: string | undefined;
    consent_ref?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    timestamp: string;
    type: string;
    source: string;
    action: string;
    actor: {
        id: string;
        type: string;
        name?: string | undefined;
        role?: string | undefined;
    };
    resource: {
        type: string;
        id?: string | undefined;
    };
    result: "success" | "failure" | "partial";
    hash: string;
    event_id: string;
    patient_id?: string | undefined;
    details?: string | undefined;
    previous_hash?: string | undefined;
    purpose?: string | undefined;
    consent_ref?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const AuditQuerySchema: z.ZodObject<{
    patient_id: z.ZodOptional<z.ZodString>;
    actor_id: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    sort_by: z.ZodDefault<z.ZodString>;
    sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    purpose: z.ZodOptional<z.ZodString>;
    result: z.ZodOptional<z.ZodEnum<["success", "failure", "partial"]>>;
    actor_type: z.ZodOptional<z.ZodString>;
    resource_type: z.ZodOptional<z.ZodString>;
    resource_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sort_by: string;
    sort_order: "asc" | "desc";
    action?: string | undefined;
    patient_id?: string | undefined;
    result?: "success" | "failure" | "partial" | undefined;
    purpose?: string | undefined;
    actor_id?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    actor_type?: string | undefined;
    resource_type?: string | undefined;
    resource_id?: string | undefined;
}, {
    action?: string | undefined;
    patient_id?: string | undefined;
    result?: "success" | "failure" | "partial" | undefined;
    purpose?: string | undefined;
    actor_id?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: "asc" | "desc" | undefined;
    actor_type?: string | undefined;
    resource_type?: string | undefined;
    resource_id?: string | undefined;
}>;
export declare const AuditStatisticsSchema: z.ZodObject<{
    total_events: z.ZodNumber;
    events_by_type: z.ZodRecord<z.ZodString, z.ZodNumber>;
    events_by_action: z.ZodRecord<z.ZodString, z.ZodNumber>;
    events_by_actor: z.ZodRecord<z.ZodString, z.ZodNumber>;
    events_by_actor_type: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    events_by_resource_type: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    events_by_result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    events_by_hour: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    unique_actors: z.ZodOptional<z.ZodNumber>;
    date_range: z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>;
    unique_patients: z.ZodNumber;
    error_rate: z.ZodNumber;
    access_denied_rate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_action: Record<string, number>;
    events_by_actor: Record<string, number>;
    date_range: {
        start: string;
        end: string;
    };
    unique_patients: number;
    error_rate: number;
    access_denied_rate: number;
    events_by_actor_type?: Record<string, number> | undefined;
    events_by_resource_type?: Record<string, number> | undefined;
    events_by_result?: Record<string, number> | undefined;
    events_by_hour?: Record<string, number> | undefined;
    unique_actors?: number | undefined;
}, {
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_action: Record<string, number>;
    events_by_actor: Record<string, number>;
    date_range: {
        start: string;
        end: string;
    };
    unique_patients: number;
    error_rate: number;
    access_denied_rate: number;
    events_by_actor_type?: Record<string, number> | undefined;
    events_by_resource_type?: Record<string, number> | undefined;
    events_by_result?: Record<string, number> | undefined;
    events_by_hour?: Record<string, number> | undefined;
    unique_actors?: number | undefined;
}>;
export declare const ChainValidationSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    total_events: z.ZodNumber;
    first_event_hash: z.ZodOptional<z.ZodString>;
    last_event_hash: z.ZodOptional<z.ZodString>;
    breaks: z.ZodArray<z.ZodObject<{
        event_index: z.ZodNumber;
        expected_hash: z.ZodString;
        actual_hash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        event_index: number;
        expected_hash: string;
        actual_hash: string;
    }, {
        event_index: number;
        expected_hash: string;
        actual_hash: string;
    }>, "many">;
    tampered: z.ZodOptional<z.ZodBoolean>;
    first_tampered_event: z.ZodOptional<z.ZodString>;
    tampered_events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    chain_integrity: z.ZodOptional<z.ZodString>;
    validation_timestamp: z.ZodOptional<z.ZodString>;
    total_events_checked: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    total_events: number;
    breaks: {
        event_index: number;
        expected_hash: string;
        actual_hash: string;
    }[];
    first_event_hash?: string | undefined;
    last_event_hash?: string | undefined;
    tampered?: boolean | undefined;
    first_tampered_event?: string | undefined;
    tampered_events?: string[] | undefined;
    chain_integrity?: string | undefined;
    validation_timestamp?: string | undefined;
    total_events_checked?: number | undefined;
}, {
    valid: boolean;
    total_events: number;
    breaks: {
        event_index: number;
        expected_hash: string;
        actual_hash: string;
    }[];
    first_event_hash?: string | undefined;
    last_event_hash?: string | undefined;
    tampered?: boolean | undefined;
    first_tampered_event?: string | undefined;
    tampered_events?: string[] | undefined;
    chain_integrity?: string | undefined;
    validation_timestamp?: string | undefined;
    total_events_checked?: number | undefined;
}>;
export declare const AuditExportSchema: z.ZodObject<{
    export_id: z.ZodString;
    timestamp: z.ZodString;
    format: z.ZodEnum<["json", "csv", "xml"]>;
    query: z.ZodObject<{
        patient_id: z.ZodOptional<z.ZodString>;
        actor_id: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodNumber>;
        offset: z.ZodOptional<z.ZodNumber>;
        sort_by: z.ZodDefault<z.ZodString>;
        sort_order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
        purpose: z.ZodOptional<z.ZodString>;
        result: z.ZodOptional<z.ZodEnum<["success", "failure", "partial"]>>;
        actor_type: z.ZodOptional<z.ZodString>;
        resource_type: z.ZodOptional<z.ZodString>;
        resource_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        sort_by: string;
        sort_order: "asc" | "desc";
        action?: string | undefined;
        patient_id?: string | undefined;
        result?: "success" | "failure" | "partial" | undefined;
        purpose?: string | undefined;
        actor_id?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        actor_type?: string | undefined;
        resource_type?: string | undefined;
        resource_id?: string | undefined;
    }, {
        action?: string | undefined;
        patient_id?: string | undefined;
        result?: "success" | "failure" | "partial" | undefined;
        purpose?: string | undefined;
        actor_id?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        sort_by?: string | undefined;
        sort_order?: "asc" | "desc" | undefined;
        actor_type?: string | undefined;
        resource_type?: string | undefined;
        resource_id?: string | undefined;
    }>;
    event_count: z.ZodNumber;
    total_events: z.ZodOptional<z.ZodNumber>;
    checksum: z.ZodString;
    compressed: z.ZodBoolean;
    events: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodString;
        type: z.ZodString;
        source: z.ZodString;
        action: z.ZodString;
        actor: z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            type: string;
            name?: string | undefined;
            role?: string | undefined;
        }, {
            id: string;
            type: string;
            name?: string | undefined;
            role?: string | undefined;
        }>;
        resource: z.ZodObject<{
            type: z.ZodString;
            id: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            id?: string | undefined;
        }, {
            type: string;
            id?: string | undefined;
        }>;
        patient_id: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodString>;
        result: z.ZodEnum<["success", "failure", "partial"]>;
        hash: z.ZodString;
        previous_hash: z.ZodOptional<z.ZodString>;
        event_id: z.ZodString;
        purpose: z.ZodOptional<z.ZodString>;
        consent_ref: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        timestamp: string;
        type: string;
        source: string;
        action: string;
        actor: {
            id: string;
            type: string;
            name?: string | undefined;
            role?: string | undefined;
        };
        resource: {
            type: string;
            id?: string | undefined;
        };
        result: "success" | "failure" | "partial";
        hash: string;
        event_id: string;
        patient_id?: string | undefined;
        details?: string | undefined;
        previous_hash?: string | undefined;
        purpose?: string | undefined;
        consent_ref?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        id: string;
        timestamp: string;
        type: string;
        source: string;
        action: string;
        actor: {
            id: string;
            type: string;
            name?: string | undefined;
            role?: string | undefined;
        };
        resource: {
            type: string;
            id?: string | undefined;
        };
        result: "success" | "failure" | "partial";
        hash: string;
        event_id: string;
        patient_id?: string | undefined;
        details?: string | undefined;
        previous_hash?: string | undefined;
        purpose?: string | undefined;
        consent_ref?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>, "many">>;
    file_size: z.ZodOptional<z.ZodNumber>;
    exported_by: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type?: string | undefined;
        name?: string | undefined;
    }, {
        id: string;
        type?: string | undefined;
        name?: string | undefined;
    }>>;
    purpose: z.ZodOptional<z.ZodString>;
    consent_ref: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    export_id: string;
    format: "json" | "csv" | "xml";
    query: {
        sort_by: string;
        sort_order: "asc" | "desc";
        action?: string | undefined;
        patient_id?: string | undefined;
        result?: "success" | "failure" | "partial" | undefined;
        purpose?: string | undefined;
        actor_id?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        actor_type?: string | undefined;
        resource_type?: string | undefined;
        resource_id?: string | undefined;
    };
    event_count: number;
    checksum: string;
    compressed: boolean;
    purpose?: string | undefined;
    consent_ref?: string | undefined;
    total_events?: number | undefined;
    events?: {
        id: string;
        timestamp: string;
        type: string;
        source: string;
        action: string;
        actor: {
            id: string;
            type: string;
            name?: string | undefined;
            role?: string | undefined;
        };
        resource: {
            type: string;
            id?: string | undefined;
        };
        result: "success" | "failure" | "partial";
        hash: string;
        event_id: string;
        patient_id?: string | undefined;
        details?: string | undefined;
        previous_hash?: string | undefined;
        purpose?: string | undefined;
        consent_ref?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[] | undefined;
    file_size?: number | undefined;
    exported_by?: {
        id: string;
        type?: string | undefined;
        name?: string | undefined;
    } | undefined;
}, {
    timestamp: string;
    export_id: string;
    format: "json" | "csv" | "xml";
    query: {
        action?: string | undefined;
        patient_id?: string | undefined;
        result?: "success" | "failure" | "partial" | undefined;
        purpose?: string | undefined;
        actor_id?: string | undefined;
        start_date?: string | undefined;
        end_date?: string | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
        sort_by?: string | undefined;
        sort_order?: "asc" | "desc" | undefined;
        actor_type?: string | undefined;
        resource_type?: string | undefined;
        resource_id?: string | undefined;
    };
    event_count: number;
    checksum: string;
    compressed: boolean;
    purpose?: string | undefined;
    consent_ref?: string | undefined;
    total_events?: number | undefined;
    events?: {
        id: string;
        timestamp: string;
        type: string;
        source: string;
        action: string;
        actor: {
            id: string;
            type: string;
            name?: string | undefined;
            role?: string | undefined;
        };
        resource: {
            type: string;
            id?: string | undefined;
        };
        result: "success" | "failure" | "partial";
        hash: string;
        event_id: string;
        patient_id?: string | undefined;
        details?: string | undefined;
        previous_hash?: string | undefined;
        purpose?: string | undefined;
        consent_ref?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }[] | undefined;
    file_size?: number | undefined;
    exported_by?: {
        id: string;
        type?: string | undefined;
        name?: string | undefined;
    } | undefined;
}>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditQuery = z.infer<typeof AuditQuerySchema>;
export type AuditStatistics = z.infer<typeof AuditStatisticsSchema>;
export type ChainValidation = z.infer<typeof ChainValidationSchema>;
export type AuditExport = z.infer<typeof AuditExportSchema>;
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
        result?: 'success' | 'failure' | 'partial';
        details?: string;
    }): Promise<Result<AuditEvent>>;
    logConsentVerification(params: {
        actor: {
            id: string;
            type: string;
            name?: string;
            role?: string;
        };
        patient_id: string;
        consent_ref: string;
        result: 'success' | 'failure';
        details?: string;
    }): Promise<Result<AuditEvent>>;
    logSystemEvent(params: {
        action: string;
        details?: string;
        result?: 'success' | 'failure' | 'partial';
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
//# sourceMappingURL=types.d.ts.map