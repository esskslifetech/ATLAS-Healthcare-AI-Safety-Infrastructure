"use strict";
// index.ts
// ATLAS Consent Tool
// HIPAA-compliant patient consent verification for healthcare AI agents
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.ConditionViolationError = exports.InvalidScopeError = exports.PolicyNotFoundError = exports.ConsentEngineError = exports.InMemoryConsentStorage = exports.createConsentEngine = exports.ConsentEngine = exports.EMERGENCY_ACCESS_LEVELS = exports.CONSENT_STATUS = exports.CONSENT_PURPOSES = exports.CONSENT_SCOPES = exports.ConsentAuditEntrySchema = exports.ConsentVerificationResultSchema = exports.ConsentDecisionSchema = exports.ConsentRequestSchema = exports.ConsentPolicySchema = void 0;
// ==================== Re-export types from types.ts ====================
var types_1 = require("./types");
Object.defineProperty(exports, "ConsentPolicySchema", { enumerable: true, get: function () { return types_1.ConsentPolicySchema; } });
Object.defineProperty(exports, "ConsentRequestSchema", { enumerable: true, get: function () { return types_1.ConsentRequestSchema; } });
Object.defineProperty(exports, "ConsentDecisionSchema", { enumerable: true, get: function () { return types_1.ConsentDecisionSchema; } });
Object.defineProperty(exports, "ConsentVerificationResultSchema", { enumerable: true, get: function () { return types_1.ConsentVerificationResultSchema; } });
Object.defineProperty(exports, "ConsentAuditEntrySchema", { enumerable: true, get: function () { return types_1.ConsentAuditEntrySchema; } });
Object.defineProperty(exports, "CONSENT_SCOPES", { enumerable: true, get: function () { return types_1.CONSENT_SCOPES; } });
Object.defineProperty(exports, "CONSENT_PURPOSES", { enumerable: true, get: function () { return types_1.CONSENT_PURPOSES; } });
Object.defineProperty(exports, "CONSENT_STATUS", { enumerable: true, get: function () { return types_1.CONSENT_STATUS; } });
Object.defineProperty(exports, "EMERGENCY_ACCESS_LEVELS", { enumerable: true, get: function () { return types_1.EMERGENCY_ACCESS_LEVELS; } });
// ==================== Export main engine and factory ====================
var consent_engine_1 = require("./consent-engine");
Object.defineProperty(exports, "ConsentEngine", { enumerable: true, get: function () { return consent_engine_1.ConsentEngine; } });
Object.defineProperty(exports, "createConsentEngine", { enumerable: true, get: function () { return consent_engine_1.createConsentEngine; } });
// ==================== Export storage implementations ====================
var consent_engine_2 = require("./consent-engine");
Object.defineProperty(exports, "InMemoryConsentStorage", { enumerable: true, get: function () { return consent_engine_2.InMemoryConsentStorage; } });
var consent_engine_3 = require("./consent-engine");
Object.defineProperty(exports, "ConsentEngineError", { enumerable: true, get: function () { return consent_engine_3.ConsentEngineError; } });
Object.defineProperty(exports, "PolicyNotFoundError", { enumerable: true, get: function () { return consent_engine_3.PolicyNotFoundError; } });
Object.defineProperty(exports, "InvalidScopeError", { enumerable: true, get: function () { return consent_engine_3.InvalidScopeError; } });
Object.defineProperty(exports, "ConditionViolationError", { enumerable: true, get: function () { return consent_engine_3.ConditionViolationError; } });
// ==================== Default export ====================
var consent_engine_4 = require("./consent-engine");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return consent_engine_4.ConsentEngine; } });
//# sourceMappingURL=index.js.map