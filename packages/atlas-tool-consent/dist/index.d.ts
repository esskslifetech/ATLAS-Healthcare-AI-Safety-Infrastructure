export { ConsentPolicy, ConsentRequest, ConsentDecision, ConsentVerificationResult, ConsentAuditEntry, ConsentPolicySchema, ConsentRequestSchema, ConsentDecisionSchema, ConsentVerificationResultSchema, ConsentAuditEntrySchema, CONSENT_SCOPES, CONSENT_PURPOSES, CONSENT_STATUS, EMERGENCY_ACCESS_LEVELS, } from './types';
export { ConsentEngine, createConsentEngine, } from './consent-engine';
export { ConsentStorage, InMemoryConsentStorage, } from './consent-engine';
export type { Result } from './consent-engine';
export { ConsentEngineError, PolicyNotFoundError, InvalidScopeError, ConditionViolationError, } from './consent-engine';
export type { ConsentEngineConfig, RetryConfig, CircuitBreakerConfig, } from './consent-engine';
export type { ConsentHooks } from './consent-engine';
export type { HealthStatus, MetricsSnapshot } from './consent-engine';
export { ConsentEngine as default } from './consent-engine';
//# sourceMappingURL=index.d.ts.map