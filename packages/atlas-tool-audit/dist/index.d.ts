export { AuditEvent, AuditQuery, AuditStatistics, ChainValidation, AuditExport, AuditEventSchema, AuditQuerySchema, AuditStatisticsSchema, ChainValidationSchema, AuditExportSchema, HIPAA_EVENT_CATEGORIES, RETENTION_PERIODS, SECURITY_LEVELS, COMPLIANCE_FRAMEWORKS, } from './types';
import { AuditLogger } from './audit-logger';
export declare function createAuditLogger(config?: {
    systemId?: string;
    environment?: string;
}): AuditLogger;
export { AuditLogger } from './audit-logger';
export { AuditLogger as default } from './audit-logger';
//# sourceMappingURL=index.d.ts.map