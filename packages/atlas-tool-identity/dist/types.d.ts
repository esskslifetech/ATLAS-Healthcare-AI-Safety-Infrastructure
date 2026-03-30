import { z } from 'zod';
export declare const OAuthTokenSchema: z.ZodObject<{
    access_token: z.ZodString;
    token_type: z.ZodLiteral<"Bearer">;
    expires_in: z.ZodNumber;
    refresh_token: z.ZodOptional<z.ZodString>;
    scope: z.ZodString;
    patient: z.ZodOptional<z.ZodString>;
    encounter: z.ZodOptional<z.ZodString>;
    issued_at: z.ZodOptional<z.ZodNumber>;
    id_token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    access_token: string;
    token_type: "Bearer";
    scope: string;
    expires_in: number;
    refresh_token?: string | undefined;
    patient?: string | undefined;
    encounter?: string | undefined;
    issued_at?: number | undefined;
    id_token?: string | undefined;
}, {
    access_token: string;
    token_type: "Bearer";
    scope: string;
    expires_in: number;
    refresh_token?: string | undefined;
    patient?: string | undefined;
    encounter?: string | undefined;
    issued_at?: number | undefined;
    id_token?: string | undefined;
}>;
export type OAuthToken = z.infer<typeof OAuthTokenSchema>;
export declare const StoredTokenSchema: z.ZodObject<{
    id: z.ZodString;
    access_token: z.ZodString;
    refresh_token: z.ZodOptional<z.ZodString>;
    token_type: z.ZodLiteral<"Bearer">;
    expires_at: z.ZodString;
    scope: z.ZodString;
    patient: z.ZodOptional<z.ZodString>;
    encounter: z.ZodOptional<z.ZodString>;
    issuer: z.ZodString;
    client_id: z.ZodString;
    provider_name: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    last_used: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodString>;
        practitioner_id: z.ZodOptional<z.ZodString>;
        organization_id: z.ZodOptional<z.ZodString>;
        launch_context: z.ZodOptional<z.ZodObject<{
            launch_id: z.ZodOptional<z.ZodString>;
            patient_id: z.ZodOptional<z.ZodString>;
            encounter_id: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            launch_id?: string | undefined;
            patient_id?: string | undefined;
            encounter_id?: string | undefined;
        }, {
            launch_id?: string | undefined;
            patient_id?: string | undefined;
            encounter_id?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        user_id?: string | undefined;
        practitioner_id?: string | undefined;
        organization_id?: string | undefined;
        launch_context?: {
            launch_id?: string | undefined;
            patient_id?: string | undefined;
            encounter_id?: string | undefined;
        } | undefined;
    }, {
        user_id?: string | undefined;
        practitioner_id?: string | undefined;
        organization_id?: string | undefined;
        launch_context?: {
            launch_id?: string | undefined;
            patient_id?: string | undefined;
            encounter_id?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    access_token: string;
    token_type: "Bearer";
    expires_at: string;
    scope: string;
    issuer: string;
    client_id: string;
    created_at: string;
    refresh_token?: string | undefined;
    patient?: string | undefined;
    encounter?: string | undefined;
    provider_name?: string | undefined;
    last_used?: string | undefined;
    metadata?: {
        user_id?: string | undefined;
        practitioner_id?: string | undefined;
        organization_id?: string | undefined;
        launch_context?: {
            launch_id?: string | undefined;
            patient_id?: string | undefined;
            encounter_id?: string | undefined;
        } | undefined;
    } | undefined;
}, {
    id: string;
    access_token: string;
    token_type: "Bearer";
    expires_at: string;
    scope: string;
    issuer: string;
    client_id: string;
    created_at: string;
    refresh_token?: string | undefined;
    patient?: string | undefined;
    encounter?: string | undefined;
    provider_name?: string | undefined;
    last_used?: string | undefined;
    metadata?: {
        user_id?: string | undefined;
        practitioner_id?: string | undefined;
        organization_id?: string | undefined;
        launch_context?: {
            launch_id?: string | undefined;
            patient_id?: string | undefined;
            encounter_id?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export type StoredToken = z.infer<typeof StoredTokenSchema>;
export declare const SmartConfigSchema: z.ZodObject<{
    issuer: z.ZodString;
    authorization_endpoint: z.ZodString;
    token_endpoint: z.ZodString;
    registration_endpoint: z.ZodOptional<z.ZodString>;
    introspection_endpoint: z.ZodOptional<z.ZodString>;
    revocation_endpoint: z.ZodOptional<z.ZodString>;
    userinfo_endpoint: z.ZodOptional<z.ZodString>;
    jwks_uri: z.ZodOptional<z.ZodString>;
    response_types_supported: z.ZodArray<z.ZodString, "many">;
    scopes_supported: z.ZodArray<z.ZodString, "many">;
    grant_types_supported: z.ZodArray<z.ZodString, "many">;
    code_challenge_methods_supported: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    token_endpoint_auth_methods_supported: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    capabilities: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    response_types_supported: string[];
    scopes_supported: string[];
    grant_types_supported: string[];
    capabilities: string[];
    registration_endpoint?: string | undefined;
    introspection_endpoint?: string | undefined;
    revocation_endpoint?: string | undefined;
    userinfo_endpoint?: string | undefined;
    jwks_uri?: string | undefined;
    code_challenge_methods_supported?: string[] | undefined;
    token_endpoint_auth_methods_supported?: string[] | undefined;
}, {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    response_types_supported: string[];
    scopes_supported: string[];
    grant_types_supported: string[];
    capabilities: string[];
    registration_endpoint?: string | undefined;
    introspection_endpoint?: string | undefined;
    revocation_endpoint?: string | undefined;
    userinfo_endpoint?: string | undefined;
    jwks_uri?: string | undefined;
    code_challenge_methods_supported?: string[] | undefined;
    token_endpoint_auth_methods_supported?: string[] | undefined;
}>;
export type SmartConfig = z.infer<typeof SmartConfigSchema>;
export declare const TokenRequestSchema: z.ZodObject<{
    grant_type: z.ZodEnum<["authorization_code", "refresh_token", "client_credentials", "password"]>;
    code: z.ZodOptional<z.ZodString>;
    redirect_uri: z.ZodOptional<z.ZodString>;
    client_id: z.ZodString;
    client_secret: z.ZodOptional<z.ZodString>;
    refresh_token: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodString>;
    code_verifier: z.ZodOptional<z.ZodString>;
    launch: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    grant_type: "refresh_token" | "authorization_code" | "client_credentials" | "password";
    refresh_token?: string | undefined;
    code?: string | undefined;
    scope?: string | undefined;
    redirect_uri?: string | undefined;
    launch?: string | undefined;
    client_secret?: string | undefined;
    code_verifier?: string | undefined;
}, {
    client_id: string;
    grant_type: "refresh_token" | "authorization_code" | "client_credentials" | "password";
    refresh_token?: string | undefined;
    code?: string | undefined;
    scope?: string | undefined;
    redirect_uri?: string | undefined;
    launch?: string | undefined;
    client_secret?: string | undefined;
    code_verifier?: string | undefined;
}>;
export type TokenRequest = z.infer<typeof TokenRequestSchema>;
export declare const AuthorizationRequestSchema: z.ZodObject<{
    response_type: z.ZodLiteral<"code">;
    client_id: z.ZodString;
    redirect_uri: z.ZodString;
    scope: z.ZodString;
    state: z.ZodString;
    aud: z.ZodString;
    code_challenge: z.ZodOptional<z.ZodString>;
    code_challenge_method: z.ZodOptional<z.ZodEnum<["S256"]>>;
    launch: z.ZodOptional<z.ZodString>;
    launch_context: z.ZodOptional<z.ZodObject<{
        patient: z.ZodOptional<z.ZodString>;
        encounter: z.ZodOptional<z.ZodString>;
        practitioner: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        patient?: string | undefined;
        encounter?: string | undefined;
        practitioner?: string | undefined;
        location?: string | undefined;
    }, {
        patient?: string | undefined;
        encounter?: string | undefined;
        practitioner?: string | undefined;
        location?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    scope: string;
    client_id: string;
    response_type: "code";
    redirect_uri: string;
    state: string;
    aud: string;
    launch_context?: {
        patient?: string | undefined;
        encounter?: string | undefined;
        practitioner?: string | undefined;
        location?: string | undefined;
    } | undefined;
    code_challenge?: string | undefined;
    code_challenge_method?: "S256" | undefined;
    launch?: string | undefined;
}, {
    scope: string;
    client_id: string;
    response_type: "code";
    redirect_uri: string;
    state: string;
    aud: string;
    launch_context?: {
        patient?: string | undefined;
        encounter?: string | undefined;
        practitioner?: string | undefined;
        location?: string | undefined;
    } | undefined;
    code_challenge?: string | undefined;
    code_challenge_method?: "S256" | undefined;
    launch?: string | undefined;
}>;
export type AuthorizationRequest = z.infer<typeof AuthorizationRequestSchema>;
export declare const TokenValidationSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    token_id: z.ZodString;
    expires_at: z.ZodString;
    scopes: z.ZodArray<z.ZodString, "many">;
    patient: z.ZodOptional<z.ZodString>;
    practitioner: z.ZodOptional<z.ZodString>;
    organization: z.ZodOptional<z.ZodString>;
    errors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    expires_at: string;
    token_id: string;
    scopes: string[];
    patient?: string | undefined;
    practitioner?: string | undefined;
    organization?: string | undefined;
    errors?: string[] | undefined;
    warnings?: string[] | undefined;
}, {
    valid: boolean;
    expires_at: string;
    token_id: string;
    scopes: string[];
    patient?: string | undefined;
    practitioner?: string | undefined;
    organization?: string | undefined;
    errors?: string[] | undefined;
    warnings?: string[] | undefined;
}>;
export type TokenValidation = z.infer<typeof TokenValidationSchema>;
export declare const TokenRefreshResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    token: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        access_token: z.ZodString;
        refresh_token: z.ZodOptional<z.ZodString>;
        token_type: z.ZodLiteral<"Bearer">;
        expires_at: z.ZodString;
        scope: z.ZodString;
        patient: z.ZodOptional<z.ZodString>;
        encounter: z.ZodOptional<z.ZodString>;
        issuer: z.ZodString;
        client_id: z.ZodString;
        provider_name: z.ZodOptional<z.ZodString>;
        created_at: z.ZodString;
        last_used: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodObject<{
            user_id: z.ZodOptional<z.ZodString>;
            practitioner_id: z.ZodOptional<z.ZodString>;
            organization_id: z.ZodOptional<z.ZodString>;
            launch_context: z.ZodOptional<z.ZodObject<{
                launch_id: z.ZodOptional<z.ZodString>;
                patient_id: z.ZodOptional<z.ZodString>;
                encounter_id: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            }, {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            user_id?: string | undefined;
            practitioner_id?: string | undefined;
            organization_id?: string | undefined;
            launch_context?: {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            } | undefined;
        }, {
            user_id?: string | undefined;
            practitioner_id?: string | undefined;
            organization_id?: string | undefined;
            launch_context?: {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        access_token: string;
        token_type: "Bearer";
        expires_at: string;
        scope: string;
        issuer: string;
        client_id: string;
        created_at: string;
        refresh_token?: string | undefined;
        patient?: string | undefined;
        encounter?: string | undefined;
        provider_name?: string | undefined;
        last_used?: string | undefined;
        metadata?: {
            user_id?: string | undefined;
            practitioner_id?: string | undefined;
            organization_id?: string | undefined;
            launch_context?: {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            } | undefined;
        } | undefined;
    }, {
        id: string;
        access_token: string;
        token_type: "Bearer";
        expires_at: string;
        scope: string;
        issuer: string;
        client_id: string;
        created_at: string;
        refresh_token?: string | undefined;
        patient?: string | undefined;
        encounter?: string | undefined;
        provider_name?: string | undefined;
        last_used?: string | undefined;
        metadata?: {
            user_id?: string | undefined;
            practitioner_id?: string | undefined;
            organization_id?: string | undefined;
            launch_context?: {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            } | undefined;
        } | undefined;
    }>>;
    error: z.ZodOptional<z.ZodString>;
    error_description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    error?: string | undefined;
    token?: {
        id: string;
        access_token: string;
        token_type: "Bearer";
        expires_at: string;
        scope: string;
        issuer: string;
        client_id: string;
        created_at: string;
        refresh_token?: string | undefined;
        patient?: string | undefined;
        encounter?: string | undefined;
        provider_name?: string | undefined;
        last_used?: string | undefined;
        metadata?: {
            user_id?: string | undefined;
            practitioner_id?: string | undefined;
            organization_id?: string | undefined;
            launch_context?: {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    error_description?: string | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    token?: {
        id: string;
        access_token: string;
        token_type: "Bearer";
        expires_at: string;
        scope: string;
        issuer: string;
        client_id: string;
        created_at: string;
        refresh_token?: string | undefined;
        patient?: string | undefined;
        encounter?: string | undefined;
        provider_name?: string | undefined;
        last_used?: string | undefined;
        metadata?: {
            user_id?: string | undefined;
            practitioner_id?: string | undefined;
            organization_id?: string | undefined;
            launch_context?: {
                launch_id?: string | undefined;
                patient_id?: string | undefined;
                encounter_id?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    error_description?: string | undefined;
}>;
export type TokenRefreshResult = z.infer<typeof TokenRefreshResultSchema>;
export declare const IntrospectionRequestSchema: z.ZodObject<{
    token: z.ZodString;
    token_type_hint: z.ZodOptional<z.ZodEnum<["access_token", "refresh_token"]>>;
    client_id: z.ZodString;
    client_secret: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    token: string;
    client_secret?: string | undefined;
    token_type_hint?: "access_token" | "refresh_token" | undefined;
}, {
    client_id: string;
    token: string;
    client_secret?: string | undefined;
    token_type_hint?: "access_token" | "refresh_token" | undefined;
}>;
export type IntrospectionRequest = z.infer<typeof IntrospectionRequestSchema>;
export declare const IntrospectionResponseSchema: z.ZodObject<{
    active: z.ZodBoolean;
    scope: z.ZodOptional<z.ZodString>;
    client_id: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    token_type: z.ZodOptional<z.ZodString>;
    exp: z.ZodOptional<z.ZodNumber>;
    iat: z.ZodOptional<z.ZodNumber>;
    nbf: z.ZodOptional<z.ZodNumber>;
    sub: z.ZodOptional<z.ZodString>;
    aud: z.ZodOptional<z.ZodString>;
    iss: z.ZodOptional<z.ZodString>;
    jti: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    active: boolean;
    token_type?: string | undefined;
    scope?: string | undefined;
    client_id?: string | undefined;
    aud?: string | undefined;
    username?: string | undefined;
    exp?: number | undefined;
    iat?: number | undefined;
    nbf?: number | undefined;
    sub?: string | undefined;
    iss?: string | undefined;
    jti?: string | undefined;
}, {
    active: boolean;
    token_type?: string | undefined;
    scope?: string | undefined;
    client_id?: string | undefined;
    aud?: string | undefined;
    username?: string | undefined;
    exp?: number | undefined;
    iat?: number | undefined;
    nbf?: number | undefined;
    sub?: string | undefined;
    iss?: string | undefined;
    jti?: string | undefined;
}>;
export type IntrospectionResponse = z.infer<typeof IntrospectionResponseSchema>;
export declare const RevocationRequestSchema: z.ZodObject<{
    token: z.ZodString;
    token_type_hint: z.ZodOptional<z.ZodEnum<["access_token", "refresh_token"]>>;
    client_id: z.ZodString;
    client_secret: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    token: string;
    client_secret?: string | undefined;
    token_type_hint?: "access_token" | "refresh_token" | undefined;
}, {
    client_id: string;
    token: string;
    client_secret?: string | undefined;
    token_type_hint?: "access_token" | "refresh_token" | undefined;
}>;
export type RevocationRequest = z.infer<typeof RevocationRequestSchema>;
export declare const UserInfoSchema: z.ZodObject<{
    sub: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    given_name: z.ZodOptional<z.ZodString>;
    family_name: z.ZodOptional<z.ZodString>;
    middle_name: z.ZodOptional<z.ZodString>;
    nickname: z.ZodOptional<z.ZodString>;
    preferred_username: z.ZodOptional<z.ZodString>;
    profile: z.ZodOptional<z.ZodString>;
    picture: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    email_verified: z.ZodOptional<z.ZodBoolean>;
    gender: z.ZodOptional<z.ZodString>;
    birthdate: z.ZodOptional<z.ZodString>;
    zoneinfo: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    phone_number_verified: z.ZodOptional<z.ZodBoolean>;
    address: z.ZodOptional<z.ZodObject<{
        formatted: z.ZodOptional<z.ZodString>;
        street_address: z.ZodOptional<z.ZodString>;
        locality: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        postal_code: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        formatted?: string | undefined;
        street_address?: string | undefined;
        locality?: string | undefined;
        region?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    }, {
        formatted?: string | undefined;
        street_address?: string | undefined;
        locality?: string | undefined;
        region?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    }>>;
    updated_at: z.ZodOptional<z.ZodNumber>;
    fhirUser: z.ZodOptional<z.ZodString>;
    patient: z.ZodOptional<z.ZodString>;
    encounter: z.ZodOptional<z.ZodString>;
    practitioner: z.ZodOptional<z.ZodString>;
    organization: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sub: string;
    patient?: string | undefined;
    encounter?: string | undefined;
    name?: string | undefined;
    practitioner?: string | undefined;
    location?: string | undefined;
    organization?: string | undefined;
    given_name?: string | undefined;
    family_name?: string | undefined;
    middle_name?: string | undefined;
    nickname?: string | undefined;
    preferred_username?: string | undefined;
    profile?: string | undefined;
    picture?: string | undefined;
    website?: string | undefined;
    email?: string | undefined;
    email_verified?: boolean | undefined;
    gender?: string | undefined;
    birthdate?: string | undefined;
    zoneinfo?: string | undefined;
    locale?: string | undefined;
    phone_number?: string | undefined;
    phone_number_verified?: boolean | undefined;
    address?: {
        formatted?: string | undefined;
        street_address?: string | undefined;
        locality?: string | undefined;
        region?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    } | undefined;
    updated_at?: number | undefined;
    fhirUser?: string | undefined;
}, {
    sub: string;
    patient?: string | undefined;
    encounter?: string | undefined;
    name?: string | undefined;
    practitioner?: string | undefined;
    location?: string | undefined;
    organization?: string | undefined;
    given_name?: string | undefined;
    family_name?: string | undefined;
    middle_name?: string | undefined;
    nickname?: string | undefined;
    preferred_username?: string | undefined;
    profile?: string | undefined;
    picture?: string | undefined;
    website?: string | undefined;
    email?: string | undefined;
    email_verified?: boolean | undefined;
    gender?: string | undefined;
    birthdate?: string | undefined;
    zoneinfo?: string | undefined;
    locale?: string | undefined;
    phone_number?: string | undefined;
    phone_number_verified?: boolean | undefined;
    address?: {
        formatted?: string | undefined;
        street_address?: string | undefined;
        locality?: string | undefined;
        region?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    } | undefined;
    updated_at?: number | undefined;
    fhirUser?: string | undefined;
}>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export declare const SMART_SCOPES: {
    readonly PATIENT_READ: "patient/*.read";
    readonly PATIENT_WRITE: "patient/*.write";
    readonly OBSERVATION_READ: "patient/Observation.read";
    readonly OBSERVATION_WRITE: "patient/Observation.write";
    readonly CONDITION_READ: "patient/Condition.read";
    readonly CONDITION_WRITE: "patient/Condition.write";
    readonly MEDICATION_READ: "patient/Medication.read";
    readonly MEDICATION_WRITE: "patient/Medication.write";
    readonly MEDICATION_REQUEST_READ: "patient/MedicationRequest.read";
    readonly MEDICATION_REQUEST_WRITE: "patient/MedicationRequest.write";
    readonly ENCOUNTER_READ: "patient/Encounter.read";
    readonly ENCOUNTER_WRITE: "patient/Encounter.write";
    readonly SYSTEM_READ: "system/*.read";
    readonly SYSTEM_WRITE: "system/*.write";
    readonly OPENID: "openid";
    readonly PROFILE: "profile";
    readonly FHIR_USER: "fhirUser";
    readonly LAUNCH: "launch";
    readonly LAUNCH_PATIENT: "launch/patient";
    readonly LAUNCH_ENCOUNTER: "launch/encounter";
    readonly ONLINE_ACCESS: "online_access";
    readonly OFFLINE_ACCESS: "offline_access";
};
export declare const TOKEN_STATUS: {
    readonly ACTIVE: "active";
    readonly EXPIRED: "expired";
    readonly REVOKED: "revoked";
    readonly REFRESH_NEEDED: "refresh_needed";
};
export declare const GRANT_TYPES: {
    readonly AUTHORIZATION_CODE: "authorization_code";
    readonly REFRESH_TOKEN: "refresh_token";
    readonly CLIENT_CREDENTIALS: "client_credentials";
    readonly PASSWORD: "password";
};
export interface TokenStore {
    storeToken(token: StoredToken): Promise<void>;
    getToken(tokenId: string): Promise<StoredToken | null>;
    getTokenByPatient(patientId: string, clientId: string): Promise<StoredToken | null>;
    updateToken(tokenId: string, updates: Partial<StoredToken>): Promise<StoredToken>;
    revokeToken(tokenId: string): Promise<void>;
    cleanupExpiredTokens(): Promise<number>;
    getActiveTokens(clientId: string): Promise<StoredToken[]>;
}
export interface IdentityProvider {
    name: string;
    issuer: string;
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    scopes: string[];
    additionalParams?: Record<string, string>;
    tokenEndpoint?: string;
    authorizationEndpoint?: string;
    introspectionEndpoint?: string;
    revocationEndpoint?: string;
    userinfoEndpoint?: string;
}
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
//# sourceMappingURL=types.d.ts.map