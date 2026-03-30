"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRANT_TYPES = exports.TOKEN_STATUS = exports.SMART_SCOPES = exports.UserInfoSchema = exports.RevocationRequestSchema = exports.IntrospectionResponseSchema = exports.IntrospectionRequestSchema = exports.TokenRefreshResultSchema = exports.TokenValidationSchema = exports.AuthorizationRequestSchema = exports.TokenRequestSchema = exports.SmartConfigSchema = exports.StoredTokenSchema = exports.OAuthTokenSchema = void 0;
// types.ts
const zod_1 = require("zod");
// ==================== OAuth2 Token ====================
exports.OAuthTokenSchema = zod_1.z.object({
    access_token: zod_1.z.string(),
    token_type: zod_1.z.literal('Bearer'),
    expires_in: zod_1.z.number(),
    refresh_token: zod_1.z.string().optional(),
    scope: zod_1.z.string(),
    patient: zod_1.z.string().optional(), // SMART on FHIR patient context
    encounter: zod_1.z.string().optional(), // SMART on FHIR encounter context
    issued_at: zod_1.z.number().optional(),
    id_token: zod_1.z.string().optional(), // OpenID Connect ID token
});
// ==================== Stored Token (with provider reference) ====================
exports.StoredTokenSchema = zod_1.z.object({
    id: zod_1.z.string(),
    access_token: zod_1.z.string(),
    refresh_token: zod_1.z.string().optional(),
    token_type: zod_1.z.literal('Bearer'),
    expires_at: zod_1.z.string(),
    scope: zod_1.z.string(),
    patient: zod_1.z.string().optional(),
    encounter: zod_1.z.string().optional(),
    issuer: zod_1.z.string(),
    client_id: zod_1.z.string(),
    provider_name: zod_1.z.string().optional(), // NEW: reference to registered provider
    created_at: zod_1.z.string(),
    last_used: zod_1.z.string().optional(),
    metadata: zod_1.z.object({
        user_id: zod_1.z.string().optional(),
        practitioner_id: zod_1.z.string().optional(),
        organization_id: zod_1.z.string().optional(),
        launch_context: zod_1.z.object({
            launch_id: zod_1.z.string().optional(),
            patient_id: zod_1.z.string().optional(),
            encounter_id: zod_1.z.string().optional(),
        }).optional(),
    }).optional(),
});
// ==================== SMART on FHIR Configuration ====================
exports.SmartConfigSchema = zod_1.z.object({
    issuer: zod_1.z.string().url(),
    authorization_endpoint: zod_1.z.string().url(),
    token_endpoint: zod_1.z.string().url(),
    registration_endpoint: zod_1.z.string().url().optional(),
    introspection_endpoint: zod_1.z.string().url().optional(), // NEW
    revocation_endpoint: zod_1.z.string().url().optional(), // NEW
    userinfo_endpoint: zod_1.z.string().url().optional(), // NEW
    jwks_uri: zod_1.z.string().url().optional(),
    response_types_supported: zod_1.z.array(zod_1.z.string()),
    scopes_supported: zod_1.z.array(zod_1.z.string()),
    grant_types_supported: zod_1.z.array(zod_1.z.string()),
    code_challenge_methods_supported: zod_1.z.array(zod_1.z.string()).optional(),
    token_endpoint_auth_methods_supported: zod_1.z.array(zod_1.z.string()).optional(),
    capabilities: zod_1.z.array(zod_1.z.string()),
});
// ==================== Token Request ====================
exports.TokenRequestSchema = zod_1.z.object({
    grant_type: zod_1.z.enum(['authorization_code', 'refresh_token', 'client_credentials', 'password']),
    code: zod_1.z.string().optional(),
    redirect_uri: zod_1.z.string().url().optional(),
    client_id: zod_1.z.string(),
    client_secret: zod_1.z.string().optional(),
    refresh_token: zod_1.z.string().optional(),
    scope: zod_1.z.string().optional(),
    code_verifier: zod_1.z.string().optional(), // PKCE
    launch: zod_1.z.string().optional(), // SMART on FHIR launch context
});
// ==================== Authorization Request ====================
exports.AuthorizationRequestSchema = zod_1.z.object({
    response_type: zod_1.z.literal('code'),
    client_id: zod_1.z.string(),
    redirect_uri: zod_1.z.string().url(),
    scope: zod_1.z.string(),
    state: zod_1.z.string(),
    aud: zod_1.z.string(), // Audience (issuer URL)
    code_challenge: zod_1.z.string().optional(),
    code_challenge_method: zod_1.z.enum(['S256']).optional(),
    launch: zod_1.z.string().optional(),
    launch_context: zod_1.z.object({
        patient: zod_1.z.string().optional(),
        encounter: zod_1.z.string().optional(),
        practitioner: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
    }).optional(),
});
// ==================== Token Validation Result ====================
exports.TokenValidationSchema = zod_1.z.object({
    valid: zod_1.z.boolean(),
    token_id: zod_1.z.string(),
    expires_at: zod_1.z.string(),
    scopes: zod_1.z.array(zod_1.z.string()),
    patient: zod_1.z.string().optional(),
    practitioner: zod_1.z.string().optional(),
    organization: zod_1.z.string().optional(),
    errors: zod_1.z.array(zod_1.z.string()).optional(),
    warnings: zod_1.z.array(zod_1.z.string()).optional(),
});
// ==================== Token Refresh Result ====================
exports.TokenRefreshResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    token: exports.StoredTokenSchema.optional(),
    error: zod_1.z.string().optional(),
    error_description: zod_1.z.string().optional(),
});
// ==================== Introspection ====================
exports.IntrospectionRequestSchema = zod_1.z.object({
    token: zod_1.z.string(),
    token_type_hint: zod_1.z.enum(['access_token', 'refresh_token']).optional(),
    client_id: zod_1.z.string(),
    client_secret: zod_1.z.string().optional(),
});
exports.IntrospectionResponseSchema = zod_1.z.object({
    active: zod_1.z.boolean(),
    scope: zod_1.z.string().optional(),
    client_id: zod_1.z.string().optional(),
    username: zod_1.z.string().optional(),
    token_type: zod_1.z.string().optional(),
    exp: zod_1.z.number().optional(),
    iat: zod_1.z.number().optional(),
    nbf: zod_1.z.number().optional(),
    sub: zod_1.z.string().optional(),
    aud: zod_1.z.string().optional(),
    iss: zod_1.z.string().optional(),
    jti: zod_1.z.string().optional(),
});
// ==================== Revocation ====================
exports.RevocationRequestSchema = zod_1.z.object({
    token: zod_1.z.string(),
    token_type_hint: zod_1.z.enum(['access_token', 'refresh_token']).optional(),
    client_id: zod_1.z.string(),
    client_secret: zod_1.z.string().optional(),
});
// ==================== UserInfo ====================
exports.UserInfoSchema = zod_1.z.object({
    sub: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    given_name: zod_1.z.string().optional(),
    family_name: zod_1.z.string().optional(),
    middle_name: zod_1.z.string().optional(),
    nickname: zod_1.z.string().optional(),
    preferred_username: zod_1.z.string().optional(),
    profile: zod_1.z.string().url().optional(),
    picture: zod_1.z.string().url().optional(),
    website: zod_1.z.string().url().optional(),
    email: zod_1.z.string().email().optional(),
    email_verified: zod_1.z.boolean().optional(),
    gender: zod_1.z.string().optional(),
    birthdate: zod_1.z.string().optional(),
    zoneinfo: zod_1.z.string().optional(),
    locale: zod_1.z.string().optional(),
    phone_number: zod_1.z.string().optional(),
    phone_number_verified: zod_1.z.boolean().optional(),
    address: zod_1.z.object({
        formatted: zod_1.z.string().optional(),
        street_address: zod_1.z.string().optional(),
        locality: zod_1.z.string().optional(),
        region: zod_1.z.string().optional(),
        postal_code: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
    }).optional(),
    updated_at: zod_1.z.number().optional(),
    // SMART on FHIR extensions
    fhirUser: zod_1.z.string().optional(),
    patient: zod_1.z.string().optional(),
    encounter: zod_1.z.string().optional(),
    practitioner: zod_1.z.string().optional(),
    organization: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
});
// ==================== Standard SMART on FHIR Scopes ====================
exports.SMART_SCOPES = {
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
};
// ==================== Token Status ====================
exports.TOKEN_STATUS = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    REVOKED: 'revoked',
    REFRESH_NEEDED: 'refresh_needed',
};
// ==================== Grant Types ====================
exports.GRANT_TYPES = {
    AUTHORIZATION_CODE: 'authorization_code',
    REFRESH_TOKEN: 'refresh_token',
    CLIENT_CREDENTIALS: 'client_credentials',
    PASSWORD: 'password',
};
//# sourceMappingURL=types.js.map