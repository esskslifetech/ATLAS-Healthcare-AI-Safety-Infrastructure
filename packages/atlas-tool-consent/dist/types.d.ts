import { z } from 'zod';
export declare const CONSENT_SCOPES: {
    readonly READ_CONDITIONS: "read_conditions";
    readonly READ_MEDICATIONS: "read_medications";
    readonly READ_OBSERVATIONS: "read_observations";
    readonly READ_ENCOUNTERS: "read_encounters";
    readonly READ_ALLERGIES: "read_allergies";
    readonly READ_IMMUNIZATIONS: "read_immunizations";
    readonly READ_GENETIC: "read_genetic";
    readonly WRITE_MEDICATIONS: "write_medications";
    readonly WRITE_ENCOUNTERS: "write_encounters";
    readonly CARE_COORDINATION: "care_coordination";
    readonly EMERGENCY_ACCESS: "emergency_access";
};
export declare const CONSENT_PURPOSES: {
    readonly TREATMENT: "treatment";
    readonly PAYMENT: "payment";
    readonly HEALTHCARE_OPERATIONS: "healthcare_operations";
    readonly PUBLIC_HEALTH: "public_health";
    readonly RESEARCH: "research";
    readonly CARE_COORDINATION: "care_coordination";
};
export declare const CONSENT_STATUS: {
    readonly ACTIVE: "active";
    readonly REVOKED: "revoked";
    readonly EXPIRED: "expired";
    readonly SUSPENDED: "suspended";
};
export declare const EMERGENCY_ACCESS_LEVELS: {
    readonly NONE: "none";
    readonly LIMITED: "limited";
    readonly FULL: "full";
    readonly CRITICAL: "critical";
};
export declare const ConsentConditionsSchema: z.ZodOptional<z.ZodObject<{
    time_range: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    days: z.ZodOptional<z.ZodArray<z.ZodEnum<["weekday", "weekend", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    time_range?: {
        start: string;
        end: string;
    } | undefined;
    days?: ("weekday" | "weekend" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
}, {
    time_range?: {
        start: string;
        end: string;
    } | undefined;
    days?: ("weekday" | "weekend" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
}>>;
export type ConsentConditions = z.infer<typeof ConsentConditionsSchema>;
export declare const ConsentPolicySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodNumber>;
    patient_id: z.ZodString;
    scope: z.ZodArray<z.ZodEnum<["read_conditions", "read_medications", "read_observations", "read_encounters", "read_allergies", "read_immunizations", "read_genetic", "write_medications", "write_encounters", "care_coordination", "emergency_access"]>, "many">;
    granular_fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    purpose: z.ZodEnum<["treatment", "payment", "healthcare_operations", "public_health", "research", "care_coordination"]>;
    granted_by: z.ZodEnum<["patient", "legal_representative", "proxy"]>;
    granted_date: z.ZodString;
    expires: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "revoked", "expired", "suspended"]>;
    conditions: z.ZodOptional<z.ZodObject<{
        time_range: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        days: z.ZodOptional<z.ZodArray<z.ZodEnum<["weekday", "weekend", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        time_range?: {
            start: string;
            end: string;
        } | undefined;
        days?: ("weekday" | "weekend" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    }, {
        time_range?: {
            start: string;
            end: string;
        } | undefined;
        days?: ("weekday" | "weekend" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    }>>;
    emergency_override: z.ZodDefault<z.ZodBoolean>;
    audit_required: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodObject<{
        ip_address: z.ZodOptional<z.ZodString>;
        user_agent: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        consent_method: z.ZodEnum<["digital_signature", "written", "verbal", "electronic"]>;
        language: z.ZodDefault<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        template: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        consent_method: "digital_signature" | "written" | "verbal" | "electronic";
        language: string;
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        template?: string | undefined;
    }, {
        consent_method: "digital_signature" | "written" | "verbal" | "electronic";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
        language?: string | undefined;
        description?: string | undefined;
        template?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "revoked" | "expired" | "suspended";
    patient_id: string;
    scope: ("read_conditions" | "read_medications" | "read_observations" | "read_encounters" | "read_allergies" | "read_immunizations" | "read_genetic" | "write_medications" | "write_encounters" | "care_coordination" | "emergency_access")[];
    purpose: "care_coordination" | "treatment" | "payment" | "healthcare_operations" | "public_health" | "research";
    granted_by: "patient" | "legal_representative" | "proxy";
    granted_date: string;
    emergency_override: boolean;
    audit_required: boolean;
    id?: string | undefined;
    version?: number | undefined;
    granular_fields?: string[] | undefined;
    expires?: string | undefined;
    conditions?: {
        time_range?: {
            start: string;
            end: string;
        } | undefined;
        days?: ("weekday" | "weekend" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    } | undefined;
    metadata?: {
        consent_method: "digital_signature" | "written" | "verbal" | "electronic";
        language: string;
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
        description?: string | undefined;
        template?: string | undefined;
    } | undefined;
}, {
    status: "active" | "revoked" | "expired" | "suspended";
    patient_id: string;
    scope: ("read_conditions" | "read_medications" | "read_observations" | "read_encounters" | "read_allergies" | "read_immunizations" | "read_genetic" | "write_medications" | "write_encounters" | "care_coordination" | "emergency_access")[];
    purpose: "care_coordination" | "treatment" | "payment" | "healthcare_operations" | "public_health" | "research";
    granted_by: "patient" | "legal_representative" | "proxy";
    granted_date: string;
    id?: string | undefined;
    version?: number | undefined;
    granular_fields?: string[] | undefined;
    expires?: string | undefined;
    conditions?: {
        time_range?: {
            start: string;
            end: string;
        } | undefined;
        days?: ("weekday" | "weekend" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[] | undefined;
    } | undefined;
    emergency_override?: boolean | undefined;
    audit_required?: boolean | undefined;
    metadata?: {
        consent_method: "digital_signature" | "written" | "verbal" | "electronic";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
        language?: string | undefined;
        description?: string | undefined;
        template?: string | undefined;
    } | undefined;
}>;
export type ConsentPolicy = z.infer<typeof ConsentPolicySchema>;
export declare const ConsentRequestSchema: z.ZodObject<{
    patient_id: z.ZodString;
    requested_scope: z.ZodArray<z.ZodEnum<["read_conditions", "read_medications", "read_observations", "read_encounters", "read_allergies", "read_immunizations", "read_genetic", "write_medications", "write_encounters", "care_coordination", "emergency_access"]>, "many">;
    requested_fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    purpose: z.ZodEnum<["treatment", "payment", "healthcare_operations", "public_health", "research", "care_coordination"]>;
    requester_id: z.ZodString;
    requester_type: z.ZodEnum<["agent", "practitioner", "system", "organization"]>;
    context: z.ZodOptional<z.ZodObject<{
        encounter_id: z.ZodOptional<z.ZodString>;
        urgency: z.ZodDefault<z.ZodEnum<["routine", "urgent", "emergency"]>>;
        session_id: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        ip_address: z.ZodOptional<z.ZodString>;
        user_agent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        urgency: "routine" | "urgent" | "emergency";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        description?: string | undefined;
        encounter_id?: string | undefined;
        session_id?: string | undefined;
    }, {
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        description?: string | undefined;
        encounter_id?: string | undefined;
        urgency?: "routine" | "urgent" | "emergency" | undefined;
        session_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    purpose: "care_coordination" | "treatment" | "payment" | "healthcare_operations" | "public_health" | "research";
    requested_scope: ("read_conditions" | "read_medications" | "read_observations" | "read_encounters" | "read_allergies" | "read_immunizations" | "read_genetic" | "write_medications" | "write_encounters" | "care_coordination" | "emergency_access")[];
    requester_id: string;
    requester_type: "agent" | "practitioner" | "system" | "organization";
    requested_fields?: string[] | undefined;
    context?: {
        urgency: "routine" | "urgent" | "emergency";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        description?: string | undefined;
        encounter_id?: string | undefined;
        session_id?: string | undefined;
    } | undefined;
}, {
    patient_id: string;
    purpose: "care_coordination" | "treatment" | "payment" | "healthcare_operations" | "public_health" | "research";
    requested_scope: ("read_conditions" | "read_medications" | "read_observations" | "read_encounters" | "read_allergies" | "read_immunizations" | "read_genetic" | "write_medications" | "write_encounters" | "care_coordination" | "emergency_access")[];
    requester_id: string;
    requester_type: "agent" | "practitioner" | "system" | "organization";
    requested_fields?: string[] | undefined;
    context?: {
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        description?: string | undefined;
        encounter_id?: string | undefined;
        urgency?: "routine" | "urgent" | "emergency" | undefined;
        session_id?: string | undefined;
    } | undefined;
}>;
export type ConsentRequest = z.infer<typeof ConsentRequestSchema>;
export declare const ConsentDecisionSchema: z.ZodObject<{
    request_id: z.ZodString;
    patient_id: z.ZodString;
    decision: z.ZodEnum<["granted", "denied", "partial"]>;
    granted_scope: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    denied_scope: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    granted_fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    denied_fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    reason: z.ZodOptional<z.ZodString>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    expires: z.ZodOptional<z.ZodString>;
    decision_timestamp: z.ZodString;
    decision_maker: z.ZodEnum<["patient", "legal_representative", "proxy", "system"]>;
    metadata: z.ZodOptional<z.ZodObject<{
        ip_address: z.ZodOptional<z.ZodString>;
        user_agent: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        decision_method: z.ZodEnum<["digital_signature", "written", "verbal", "electronic", "automatic"]>;
        language: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        language: string;
        decision_method: "digital_signature" | "written" | "verbal" | "electronic" | "automatic";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
    }, {
        decision_method: "digital_signature" | "written" | "verbal" | "electronic" | "automatic";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
        language?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    request_id: string;
    decision: "granted" | "denied" | "partial";
    decision_timestamp: string;
    decision_maker: "patient" | "legal_representative" | "proxy" | "system";
    expires?: string | undefined;
    conditions?: string[] | undefined;
    metadata?: {
        language: string;
        decision_method: "digital_signature" | "written" | "verbal" | "electronic" | "automatic";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
    } | undefined;
    granted_scope?: string[] | undefined;
    denied_scope?: string[] | undefined;
    granted_fields?: string[] | undefined;
    denied_fields?: string[] | undefined;
    reason?: string | undefined;
}, {
    patient_id: string;
    request_id: string;
    decision: "granted" | "denied" | "partial";
    decision_timestamp: string;
    decision_maker: "patient" | "legal_representative" | "proxy" | "system";
    expires?: string | undefined;
    conditions?: string[] | undefined;
    metadata?: {
        decision_method: "digital_signature" | "written" | "verbal" | "electronic" | "automatic";
        ip_address?: string | undefined;
        user_agent?: string | undefined;
        location?: string | undefined;
        language?: string | undefined;
    } | undefined;
    granted_scope?: string[] | undefined;
    denied_scope?: string[] | undefined;
    granted_fields?: string[] | undefined;
    denied_fields?: string[] | undefined;
    reason?: string | undefined;
}>;
export type ConsentDecision = z.infer<typeof ConsentDecisionSchema>;
export declare const ConsentVerificationResultSchema: z.ZodObject<{
    allowed: z.ZodBoolean;
    patient_id: z.ZodString;
    requested_scope: z.ZodArray<z.ZodString, "many">;
    granted_scope: z.ZodArray<z.ZodString, "many">;
    denied_scope: z.ZodArray<z.ZodString, "many">;
    fields_granted: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    fields_denied: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    purpose: z.ZodString;
    consent_policy_id: z.ZodString;
    verification_timestamp: z.ZodString;
    expires: z.ZodOptional<z.ZodString>;
    emergency_override: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    audit_log_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    purpose: string;
    requested_scope: string[];
    granted_scope: string[];
    denied_scope: string[];
    allowed: boolean;
    consent_policy_id: string;
    verification_timestamp: string;
    expires?: string | undefined;
    conditions?: string[] | undefined;
    emergency_override?: boolean | undefined;
    reason?: string | undefined;
    fields_granted?: string[] | undefined;
    fields_denied?: string[] | undefined;
    audit_log_id?: string | undefined;
}, {
    patient_id: string;
    purpose: string;
    requested_scope: string[];
    granted_scope: string[];
    denied_scope: string[];
    allowed: boolean;
    consent_policy_id: string;
    verification_timestamp: string;
    expires?: string | undefined;
    conditions?: string[] | undefined;
    emergency_override?: boolean | undefined;
    reason?: string | undefined;
    fields_granted?: string[] | undefined;
    fields_denied?: string[] | undefined;
    audit_log_id?: string | undefined;
}>;
export type ConsentVerificationResult = z.infer<typeof ConsentVerificationResultSchema>;
export declare const ConsentAuditEntrySchema: z.ZodObject<{
    event_id: z.ZodString;
    timestamp: z.ZodString;
    patient_id: z.ZodString;
    actor: z.ZodString;
    action: z.ZodEnum<["consent_granted", "consent_denied", "consent_revoked", "consent_verified", "access_granted", "access_denied"]>;
    scope: z.ZodArray<z.ZodString, "many">;
    purpose: z.ZodString;
    result: z.ZodEnum<["success", "failure", "partial"]>;
    details: z.ZodOptional<z.ZodString>;
    ip_address: z.ZodOptional<z.ZodString>;
    user_agent: z.ZodOptional<z.ZodString>;
    session_id: z.ZodOptional<z.ZodString>;
    consent_policy_id: z.ZodOptional<z.ZodString>;
    fields_requested: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    fields_granted: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    scope: string[];
    purpose: string;
    event_id: string;
    timestamp: string;
    actor: string;
    action: "consent_granted" | "consent_denied" | "consent_revoked" | "consent_verified" | "access_granted" | "access_denied";
    result: "partial" | "success" | "failure";
    ip_address?: string | undefined;
    user_agent?: string | undefined;
    session_id?: string | undefined;
    fields_granted?: string[] | undefined;
    consent_policy_id?: string | undefined;
    details?: string | undefined;
    fields_requested?: string[] | undefined;
}, {
    patient_id: string;
    scope: string[];
    purpose: string;
    event_id: string;
    timestamp: string;
    actor: string;
    action: "consent_granted" | "consent_denied" | "consent_revoked" | "consent_verified" | "access_granted" | "access_denied";
    result: "partial" | "success" | "failure";
    ip_address?: string | undefined;
    user_agent?: string | undefined;
    session_id?: string | undefined;
    fields_granted?: string[] | undefined;
    consent_policy_id?: string | undefined;
    details?: string | undefined;
    fields_requested?: string[] | undefined;
}>;
export type ConsentAuditEntry = z.infer<typeof ConsentAuditEntrySchema>;
//# sourceMappingURL=types.d.ts.map