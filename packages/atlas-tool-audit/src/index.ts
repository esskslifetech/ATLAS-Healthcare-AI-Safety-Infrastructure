// ATLAS Audit Tool
// Immutable, tamper-evident HIPAA audit logging for healthcare AI agents

export {
  AuditEvent,
  AuditQuery,
  AuditStatistics,
  ChainValidation,
  AuditExport,
  AuditEventSchema,
  AuditQuerySchema,
  AuditStatisticsSchema,
  ChainValidationSchema,
  AuditExportSchema,
  HIPAA_EVENT_CATEGORIES,
  RETENTION_PERIODS,
  SECURITY_LEVELS,
  COMPLIANCE_FRAMEWORKS,
} from './types';

import { AuditLogger } from './audit-logger';

export function createAuditLogger(config?: { systemId?: string; environment?: string }): AuditLogger {
  return new AuditLogger(config);
}

export { AuditLogger } from './audit-logger';

// Re-export main class as default
export { AuditLogger as default } from './audit-logger';
