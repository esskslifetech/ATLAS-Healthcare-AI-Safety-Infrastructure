// index.ts
// ATLAS Consent Tool
// HIPAA-compliant patient consent verification for healthcare AI agents

// ==================== Re-export types from types.ts ====================
export {
  ConsentPolicy,
  ConsentRequest,
  ConsentDecision,
  ConsentVerificationResult,
  ConsentAuditEntry,
  ConsentPolicySchema,
  ConsentRequestSchema,
  ConsentDecisionSchema,
  ConsentVerificationResultSchema,
  ConsentAuditEntrySchema,
  CONSENT_SCOPES,
  CONSENT_PURPOSES,
  CONSENT_STATUS,
  EMERGENCY_ACCESS_LEVELS,
} from './types';

// ==================== Export main engine and factory ====================
export {
  ConsentEngine,
  createConsentEngine,
} from './consent-engine';

// ==================== Export storage implementations ====================
export {
  ConsentStorage,
  InMemoryConsentStorage,
} from './consent-engine';

// ==================== Export result type and errors ====================
export type { Result } from './consent-engine';
export {
  ConsentEngineError,
  PolicyNotFoundError,
  InvalidScopeError,
  ConditionViolationError,
} from './consent-engine';

// ==================== Export configuration types ====================
export type {
  ConsentEngineConfig,
  RetryConfig,
  CircuitBreakerConfig,
} from './consent-engine';

// ==================== Export hooks ====================
export type { ConsentHooks } from './consent-engine';

// ==================== Export observability types ====================
export type { HealthStatus, MetricsSnapshot } from './consent-engine';

// ==================== Default export ====================
export { ConsentEngine as default } from './consent-engine';