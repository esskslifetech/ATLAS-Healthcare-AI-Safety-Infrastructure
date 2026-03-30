"use strict";
// ATLAS Audit Tool
// Immutable, tamper-evident HIPAA audit logging for healthcare AI agents
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.AuditLogger = exports.COMPLIANCE_FRAMEWORKS = exports.SECURITY_LEVELS = exports.RETENTION_PERIODS = exports.HIPAA_EVENT_CATEGORIES = exports.AuditExportSchema = exports.ChainValidationSchema = exports.AuditStatisticsSchema = exports.AuditQuerySchema = exports.AuditEventSchema = void 0;
exports.createAuditLogger = createAuditLogger;
var types_1 = require("./types");
Object.defineProperty(exports, "AuditEventSchema", { enumerable: true, get: function () { return types_1.AuditEventSchema; } });
Object.defineProperty(exports, "AuditQuerySchema", { enumerable: true, get: function () { return types_1.AuditQuerySchema; } });
Object.defineProperty(exports, "AuditStatisticsSchema", { enumerable: true, get: function () { return types_1.AuditStatisticsSchema; } });
Object.defineProperty(exports, "ChainValidationSchema", { enumerable: true, get: function () { return types_1.ChainValidationSchema; } });
Object.defineProperty(exports, "AuditExportSchema", { enumerable: true, get: function () { return types_1.AuditExportSchema; } });
Object.defineProperty(exports, "HIPAA_EVENT_CATEGORIES", { enumerable: true, get: function () { return types_1.HIPAA_EVENT_CATEGORIES; } });
Object.defineProperty(exports, "RETENTION_PERIODS", { enumerable: true, get: function () { return types_1.RETENTION_PERIODS; } });
Object.defineProperty(exports, "SECURITY_LEVELS", { enumerable: true, get: function () { return types_1.SECURITY_LEVELS; } });
Object.defineProperty(exports, "COMPLIANCE_FRAMEWORKS", { enumerable: true, get: function () { return types_1.COMPLIANCE_FRAMEWORKS; } });
const audit_logger_1 = require("./audit-logger");
function createAuditLogger(config) {
    return new audit_logger_1.AuditLogger(config);
}
var audit_logger_2 = require("./audit-logger");
Object.defineProperty(exports, "AuditLogger", { enumerable: true, get: function () { return audit_logger_2.AuditLogger; } });
// Re-export main class as default
var audit_logger_3 = require("./audit-logger");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return audit_logger_3.AuditLogger; } });
//# sourceMappingURL=index.js.map