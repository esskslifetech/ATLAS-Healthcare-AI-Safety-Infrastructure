// types.ts
import { z } from 'zod';

// ==================== OAuth2 Token ====================
export const OAuthTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string(),
  patient: z.string().optional(), // SMART on FHIR patient context
  encounter: z.string().optional(), // SMART on FHIR encounter context
  issued_at: z.number().optional(),
  id_token: z.string().optional(), // OpenID Connect ID token
});

export type OAuthToken = z.infer<typeof OAuthTokenSchema>;

// ==================== Stored Token (with provider reference) ====================
export const StoredTokenSchema = z.object({
  id: z.string(),
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_type: z.literal('Bearer'),
  expires_at: z.string(),
  scope: z.string(),
  patient: z.string().optional(),
  encounter: z.string().optional(),
  issuer: z.string(),
  client_id: z.string(),
  provider_name: z.string().optional(), // NEW: reference to registered provider
  created_at: z.string(),
  last_used: z.string().optional(),
  metadata: z.object({
    user_id: z.string().optional(),
    practitioner_id: z.string().optional(),
    organization_id: z.string().optional(),
    launch_context: z.object({
      launch_id: z.string().optional(),
      patient_id: z.string().optional(),
      encounter_id: z.string().optional(),
    }).optional(),
  }).optional(),
});

export type StoredToken = z.infer<typeof StoredTokenSchema>;

// ==================== SMART on FHIR Configuration ====================
export const SmartConfigSchema = z.object({
  issuer: z.string().url(),
  authorization_endpoint: z.string().url(),
  token_endpoint: z.string().url(),
  registration_endpoint: z.string().url().optional(),
  introspection_endpoint: z.string().url().optional(),   // NEW
  revocation_endpoint: z.string().url().optional(),     // NEW
  userinfo_endpoint: z.string().url().optional(),       // NEW
  jwks_uri: z.string().url().optional(),
  response_types_supported: z.array(z.string()),
  scopes_supported: z.array(z.string()),
  grant_types_supported: z.array(z.string()),
  code_challenge_methods_supported: z.array(z.string()).optional(),
  token_endpoint_auth_methods_supported: z.array(z.string()).optional(),
  capabilities: z.array(z.string()),
});

export type SmartConfig = z.infer<typeof SmartConfigSchema>;

// ==================== Token Request ====================
export const TokenRequestSchema = z.object({
  grant_type: z.enum(['authorization_code', 'refresh_token', 'client_credentials', 'password']),
  code: z.string().optional(),
  redirect_uri: z.string().url().optional(),
  client_id: z.string(),
  client_secret: z.string().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  code_verifier: z.string().optional(),  // PKCE
  launch: z.string().optional(),          // SMART on FHIR launch context
});

export type TokenRequest = z.infer<typeof TokenRequestSchema>;

// ==================== Authorization Request ====================
export const AuthorizationRequestSchema = z.object({
  response_type: z.literal('code'),
  client_id: z.string(),
  redirect_uri: z.string().url(),
  scope: z.string(),
  state: z.string(),
  aud: z.string(), // Audience (issuer URL)
  code_challenge: z.string().optional(),
  code_challenge_method: z.enum(['S256']).optional(),
  launch: z.string().optional(),
  launch_context: z.object({
    patient: z.string().optional(),
    encounter: z.string().optional(),
    practitioner: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
});

export type AuthorizationRequest = z.infer<typeof AuthorizationRequestSchema>;

// ==================== Token Validation Result ====================
export const TokenValidationSchema = z.object({
  valid: z.boolean(),
  token_id: z.string(),
  expires_at: z.string(),
  scopes: z.array(z.string()),
  patient: z.string().optional(),
  practitioner: z.string().optional(),
  organization: z.string().optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export type TokenValidation = z.infer<typeof TokenValidationSchema>;

// ==================== Token Refresh Result ====================
export const TokenRefreshResultSchema = z.object({
  success: z.boolean(),
  token: StoredTokenSchema.optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export type TokenRefreshResult = z.infer<typeof TokenRefreshResultSchema>;

// ==================== Introspection ====================
export const IntrospectionRequestSchema = z.object({
  token: z.string(),
  token_type_hint: z.enum(['access_token', 'refresh_token']).optional(),
  client_id: z.string(),
  client_secret: z.string().optional(),
});

export type IntrospectionRequest = z.infer<typeof IntrospectionRequestSchema>;

export const IntrospectionResponseSchema = z.object({
  active: z.boolean(),
  scope: z.string().optional(),
  client_id: z.string().optional(),
  username: z.string().optional(),
  token_type: z.string().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  nbf: z.number().optional(),
  sub: z.string().optional(),
  aud: z.string().optional(),
  iss: z.string().optional(),
  jti: z.string().optional(),
});

export type IntrospectionResponse = z.infer<typeof IntrospectionResponseSchema>;

// ==================== Revocation ====================
export const RevocationRequestSchema = z.object({
  token: z.string(),
  token_type_hint: z.enum(['access_token', 'refresh_token']).optional(),
  client_id: z.string(),
  client_secret: z.string().optional(),
});

export type RevocationRequest = z.infer<typeof RevocationRequestSchema>;

// ==================== UserInfo ====================
export const UserInfoSchema = z.object({
  sub: z.string(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  middle_name: z.string().optional(),
  nickname: z.string().optional(),
  preferred_username: z.string().optional(),
  profile: z.string().url().optional(),
  picture: z.string().url().optional(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
  gender: z.string().optional(),
  birthdate: z.string().optional(),
  zoneinfo: z.string().optional(),
  locale: z.string().optional(),
  phone_number: z.string().optional(),
  phone_number_verified: z.boolean().optional(),
  address: z.object({
    formatted: z.string().optional(),
    street_address: z.string().optional(),
    locality: z.string().optional(),
    region: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  updated_at: z.number().optional(),
  // SMART on FHIR extensions
  fhirUser: z.string().optional(),
  patient: z.string().optional(),
  encounter: z.string().optional(),
  practitioner: z.string().optional(),
  organization: z.string().optional(),
  location: z.string().optional(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;

// ==================== Standard SMART on FHIR Scopes ====================
export const SMART_SCOPES = {
  // Patient-level scopes
  PATIENT_READ: 'patient/*.read',
  PATIENT_WRITE: 'patient/*.write',
  OBSERVATION_READ: 'patient/Observation.read',
  OBSERVATION_WRITE: 'patient/Observation.write',
  CONDITION_READ: 'patient/Condition.read',
  CONDITION_WRITE: 'patient/Condition.write',
  MEDICATION_READ: 'patient/Medication.read',
  MEDICATION_WRITE: 'patient/Medication.write',
  MEDICATION_REQUEST_READ: 'patient/MedicationRequest.read',
  MEDICATION_REQUEST_WRITE: 'patient/MedicationRequest.write',
  ENCOUNTER_READ: 'patient/Encounter.read',
  ENCOUNTER_WRITE: 'patient/Encounter.write',

  // System-level scopes
  SYSTEM_READ: 'system/*.read',
  SYSTEM_WRITE: 'system/*.write',

  // OpenID Connect scopes
  OPENID: 'openid',
  PROFILE: 'profile',
  FHIR_USER: 'fhirUser',

  // Launch contexts
  LAUNCH: 'launch',
  LAUNCH_PATIENT: 'launch/patient',
  LAUNCH_ENCOUNTER: 'launch/encounter',

  // Online access
  ONLINE_ACCESS: 'online_access',
  OFFLINE_ACCESS: 'offline_access',
} as const;

// ==================== Token Status ====================
export const TOKEN_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  REFRESH_NEEDED: 'refresh_needed',
} as const;

// ==================== Grant Types ====================
export const GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
  CLIENT_CREDENTIALS: 'client_credentials',
  PASSWORD: 'password',
} as const;

// ==================== Token Store Interface ====================
export interface TokenStore {
  storeToken(token: StoredToken): Promise<void>;
  getToken(tokenId: string): Promise<StoredToken | null>;
  getTokenByPatient(patientId: string, clientId: string): Promise<StoredToken | null>;
  updateToken(tokenId: string, updates: Partial<StoredToken>): Promise<StoredToken>;
  revokeToken(tokenId: string): Promise<void>;
  cleanupExpiredTokens(): Promise<number>;
  getActiveTokens(clientId: string): Promise<StoredToken[]>;
}

// ==================== Identity Provider Configuration ====================
export interface IdentityProvider {
  name: string;
  issuer: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  additionalParams?: Record<string, string>;
  // Optional endpoints (can be overridden if discovery not used)
  tokenEndpoint?: string;
  authorizationEndpoint?: string;
  introspectionEndpoint?: string;
  revocationEndpoint?: string;
  userinfoEndpoint?: string;
}

// ==================== Authentication Context ====================
export interface AuthContext {
  provider: IdentityProvider;
  token: StoredToken;
  user: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
    fhirUser?: string;
  };
  session: {
    id: string;
    createdAt: string;
    lastActivity: string;
  };
}