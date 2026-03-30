"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentAuditEntrySchema = exports.ConsentVerificationResultSchema = exports.ConsentDecisionSchema = exports.ConsentRequestSchema = exports.ConsentPolicySchema = exports.ConsentConditionsSchema = exports.EMERGENCY_ACCESS_LEVELS = exports.CONSENT_STATUS = exports.CONSENT_PURPOSES = exports.CONSENT_SCOPES = void 0;
// types.ts
const zod_1 = require("zod");
// ==================== Consent Scope Definitions ====================
exports.CONSENT_SCOPES = {
    READ_CONDITIONS: 'read_conditions',
    READ_MEDICATIONS: 'read_medications',
    READ_OBSERVATIONS: 'read_observations',
    READ_ENCOUNTERS: 'read_encounters',
    READ_ALLERGIES: 'read_allergies',
    READ_IMMUNIZATIONS: 'read_immunizations',
    READ_GENETIC: 'read_genetic', // New: genetic data
    WRITE_MEDICATIONS: 'write_medications',
    WRITE_ENCOUNTERS: 'write_encounters',
    CARE_COORDINATION: 'care_coordination',
    EMERGENCY_ACCESS: 'emergency_access',
};
// ==================== Consent Purpose Definitions ====================
exports.CONSENT_PURPOSES = {
    TREATMENT: 'treatment',
    PAYMENT: 'payment',
    HEALTHCARE_OPERATIONS: 'healthcare_operations',
    PUBLIC_HEALTH: 'public_health',
    RESEARCH: 'research',
    CARE_COORDINATION: 'care_coordination',
};
// ==================== Consent Status Definitions ====================
exports.CONSENT_STATUS = {
    ACTIVE: 'active',
    REVOKED: 'revoked',
    EXPIRED: 'expired',
    SUSPENDED: 'suspended',
};
// ==================== Emergency Access Levels ====================
exports.EMERGENCY_ACCESS_LEVELS = {
    NONE: 'none',
    LIMITED: 'limited', // Basic demographics, allergies, medications
    FULL: 'full', // All available health information
    CRITICAL: 'critical', // Only life-threatening information
};
// ==================== Conditions Schema ====================
exports.ConsentConditionsSchema = zod_1.z.object({
    time_range: zod_1.z.object({
        start: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), // HH:MM
        end: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }).optional(),
    days: zod_1.z.array(zod_1.z.enum([
        'weekday', 'weekend',
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ])).optional(),
    // Additional condition types can be added here
}).optional();
// ==================== Consent Policy Schema ====================
exports.ConsentPolicySchema = zod_1.z.object({
    id: zod_1.z.string().optional(), // Added by storage
    version: zod_1.z.number().optional(), // Incremented on updates
    patient_id: zod_1.z.string(),
    scope: zod_1.z.array(zod_1.z.enum([
        'read_conditions',
        'read_medications',
        'read_observations',
        'read_encounters',
        'read_allergies',
        'read_immunizations',
        'read_genetic',
        'write_medications',
        'write_encounters',
        'care_coordination',
        'emergency_access'
    ])),
    granular_fields: zod_1.z.array(zod_1.z.string()).optional(), // Specific data fields allowed (e.g., 'lab_results', 'vital_signs')
    purpose: zod_1.z.enum([
        'treatment',
        'payment',
        'healthcare_operations',
        'public_health',
        'research',
        'care_coordination'
    ]),
    granted_by: zod_1.z.enum(['patient', 'legal_representative', 'proxy']),
    granted_date: zod_1.z.string(),
    expires: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'revoked', 'expired', 'suspended']),
    conditions: exports.ConsentConditionsSchema, // Structured conditions (time, day, etc.)
    emergency_override: zod_1.z.boolean().default(false),
    audit_required: zod_1.z.boolean().default(true),
    metadata: zod_1.z.object({
        ip_address: zod_1.z.string().optional(),
        user_agent: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        consent_method: zod_1.z.enum(['digital_signature', 'written', 'verbal', 'electronic']),
        language: zod_1.z.string().default('en'),
        description: zod_1.z.string().optional(),
        template: zod_1.z.string().optional(),
    }).optional(),
});
// ==================== Consent Request Schema ====================
exports.ConsentRequestSchema = zod_1.z.object({
    patient_id: zod_1.z.string(),
    requested_scope: zod_1.z.array(zod_1.z.enum([
        'read_conditions',
        'read_medications',
        'read_observations',
        'read_encounters',
        'read_allergies',
        'read_immunizations',
        'read_genetic',
        'write_medications',
        'write_encounters',
        'care_coordination',
        'emergency_access'
    ])),
    requested_fields: zod_1.z.array(zod_1.z.string()).optional(), // Optional: which data fields are being requested
    purpose: zod_1.z.enum([
        'treatment',
        'payment',
        'healthcare_operations',
        'public_health',
        'research',
        'care_coordination'
    ]),
    requester_id: zod_1.z.string(),
    requester_type: zod_1.z.enum(['agent', 'practitioner', 'system', 'organization']),
    context: zod_1.z.object({
        encounter_id: zod_1.z.string().optional(),
        urgency: zod_1.z.enum(['routine', 'urgent', 'emergency']).default('routine'),
        session_id: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        ip_address: zod_1.z.string().optional(),
        user_agent: zod_1.z.string().optional(),
    }).optional(),
});
// ==================== Consent Decision Schema ====================
exports.ConsentDecisionSchema = zod_1.z.object({
    request_id: zod_1.z.string(),
    patient_id: zod_1.z.string(),
    decision: zod_1.z.enum(['granted', 'denied', 'partial']),
    granted_scope: zod_1.z.array(zod_1.z.string()).optional(),
    denied_scope: zod_1.z.array(zod_1.z.string()).optional(),
    granted_fields: zod_1.z.array(zod_1.z.string()).optional(),
    denied_fields: zod_1.z.array(zod_1.z.string()).optional(),
    reason: zod_1.z.string().optional(),
    conditions: zod_1.z.array(zod_1.z.string()).optional(),
    expires: zod_1.z.string().optional(),
    decision_timestamp: zod_1.z.string(),
    decision_maker: zod_1.z.enum(['patient', 'legal_representative', 'proxy', 'system']),
    metadata: zod_1.z.object({
        ip_address: zod_1.z.string().optional(),
        user_agent: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        decision_method: zod_1.z.enum(['digital_signature', 'written', 'verbal', 'electronic', 'automatic']),
        language: zod_1.z.string().default('en'),
    }).optional(),
});
// ==================== Consent Verification Result Schema ====================
exports.ConsentVerificationResultSchema = zod_1.z.object({
    allowed: zod_1.z.boolean(),
    patient_id: zod_1.z.string(),
    requested_scope: zod_1.z.array(zod_1.z.string()),
    granted_scope: zod_1.z.array(zod_1.z.string()),
    denied_scope: zod_1.z.array(zod_1.z.string()),
    fields_granted: zod_1.z.array(zod_1.z.string()).optional(),
    fields_denied: zod_1.z.array(zod_1.z.string()).optional(),
    purpose: zod_1.z.string(),
    consent_policy_id: zod_1.z.string(),
    verification_timestamp: zod_1.z.string(),
    expires: zod_1.z.string().optional(),
    emergency_override: zod_1.z.boolean().optional(),
    reason: zod_1.z.string().optional(),
    conditions: zod_1.z.array(zod_1.z.string()).optional(),
    audit_log_id: zod_1.z.string().optional(),
});
// ==================== Consent Audit Entry Schema ====================
exports.ConsentAuditEntrySchema = zod_1.z.object({
    event_id: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    patient_id: zod_1.z.string(),
    actor: zod_1.z.string(),
    action: zod_1.z.enum([
        'consent_granted',
        'consent_denied',
        'consent_revoked',
        'consent_verified',
        'access_granted',
        'access_denied'
    ]),
    scope: zod_1.z.array(zod_1.z.string()),
    purpose: zod_1.z.string(),
    result: zod_1.z.enum(['success', 'failure', 'partial']),
    details: zod_1.z.string().optional(),
    ip_address: zod_1.z.string().optional(),
    user_agent: zod_1.z.string().optional(),
    session_id: zod_1.z.string().optional(),
    consent_policy_id: zod_1.z.string().optional(),
    fields_requested: zod_1.z.array(zod_1.z.string()).optional(),
    fields_granted: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=types.js.map