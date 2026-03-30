// index.ts
// ATLAS Identity Tool
// SMART on FHIR OAuth2 token management for healthcare AI agents

// ==================== Re-export types from types.ts ====================
export {
  OAuthToken,
  StoredToken,
  SmartConfig,
  TokenRequest,
  AuthorizationRequest,
  TokenValidation,
  TokenRefreshResult,
  IntrospectionRequest,
  IntrospectionResponse,
  RevocationRequest,
  UserInfo,
  TokenStore,
  IdentityProvider,
  AuthContext,
  OAuthTokenSchema,
  StoredTokenSchema,
  SmartConfigSchema,
  TokenRequestSchema,
  AuthorizationRequestSchema,
  TokenValidationSchema,
  TokenRefreshResultSchema,
  IntrospectionRequestSchema,
  IntrospectionResponseSchema,
  RevocationRequestSchema,
  UserInfoSchema,
  SMART_SCOPES,
  TOKEN_STATUS,
  GRANT_TYPES,
} from './types';

// ==================== Re-export main classes and utilities ====================
export {
  IdentityBridge,
  InMemoryTokenStore,
  createIdentityBridge,
} from './identity-bridge';

// ==================== Export result type ====================
export type { Result } from './identity-bridge';

// ==================== Export custom errors ====================
export {
  IdentityBridgeError,
  TokenNotFoundError,
  ProviderNotFoundError,
  InvalidGrantError,
  TokenExpiredError,
} from './identity-bridge';

// ==================== Export configuration types ====================
export type {
  IdentityBridgeConfig,
  RetryConfig,
  CircuitBreakerConfig,
} from './identity-bridge';

// ==================== Export hooks ====================
export type { IdentityBridgeHooks } from './identity-bridge';

// ==================== Export observability types ====================
export type { HealthStatus, MetricsSnapshot } from './identity-bridge';

// ==================== Default export ====================
export { IdentityBridge as default } from './identity-bridge';