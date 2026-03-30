// types.ts
import { z } from 'zod';

// ==================== Consent Scope Definitions ====================
export const CONSENT_SCOPES = {
  READ_CONDITIONS: 'read_conditions',
  READ_MEDICATIONS: 'read_medications',
  READ_OBSERVATIONS: 'read_observations',
  READ_ENCOUNTERS: 'read_encounters',
  READ_ALLERGIES: 'read_allergies',
  READ_IMMUNIZATIONS: 'read_immunizations',
  READ_GENETIC: 'read_genetic',           // New: genetic data
  WRITE_MEDICATIONS: 'write_medications',
  WRITE_ENCOUNTERS: 'write_encounters',
  CARE_COORDINATION: 'care_coordination',
  EMERGENCY_ACCESS: 'emergency_access',
} as const;

// ==================== Consent Purpose Definitions ====================
export const CONSENT_PURPOSES = {
  TREATMENT: 'treatment',
  PAYMENT: 'payment',
  HEALTHCARE_OPERATIONS: 'healthcare_operations',
  PUBLIC_HEALTH: 'public_health',
  RESEARCH: 'research',
  CARE_COORDINATION: 'care_coordination',
} as const;

// ==================== Consent Status Definitions ====================
export const CONSENT_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended',
} as const;

// ==================== Emergency Access Levels ====================
export const EMERGENCY_ACCESS_LEVELS = {
  NONE: 'none',
  LIMITED: 'limited',    // Basic demographics, allergies, medications
  FULL: 'full',          // All available health information
  CRITICAL: 'critical',  // Only life-threatening information
} as const;

// ==================== Conditions Schema ====================
export const ConsentConditionsSchema = z.object({
  time_range: z.object({
    start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), // HH:MM
    end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  }).optional(),
  days: z.array(z.enum([
    'weekday', 'weekend',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ])).optional(),
  // Additional condition types can be added here
}).optional();

export type ConsentConditions = z.infer<typeof ConsentConditionsSchema>;

// ==================== Consent Policy Schema ====================
export const ConsentPolicySchema = z.object({
  id: z.string().optional(),               // Added by storage
  version: z.number().optional(),          // Incremented on updates
  patient_id: z.string(),
  scope: z.array(z.enum([
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
  granular_fields: z.array(z.string()).optional(), // Specific data fields allowed (e.g., 'lab_results', 'vital_signs')
  purpose: z.enum([
    'treatment',
    'payment',
    'healthcare_operations',
    'public_health',
    'research',
    'care_coordination'
  ]),
  granted_by: z.enum(['patient', 'legal_representative', 'proxy']),
  granted_date: z.string(),
  expires: z.string().optional(),
  status: z.enum(['active', 'revoked', 'expired', 'suspended']),
  conditions: ConsentConditionsSchema,     // Structured conditions (time, day, etc.)
  emergency_override: z.boolean().default(false),
  audit_required: z.boolean().default(true),
  metadata: z.object({
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
    location: z.string().optional(),
    consent_method: z.enum(['digital_signature', 'written', 'verbal', 'electronic']),
    language: z.string().default('en'),
    description: z.string().optional(),
    template: z.string().optional(),
  }).optional(),
});

export type ConsentPolicy = z.infer<typeof ConsentPolicySchema>;

// ==================== Consent Request Schema ====================
export const ConsentRequestSchema = z.object({
  patient_id: z.string(),
  requested_scope: z.array(z.enum([
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
  requested_fields: z.array(z.string()).optional(), // Optional: which data fields are being requested
  purpose: z.enum([
    'treatment',
    'payment',
    'healthcare_operations',
    'public_health',
    'research',
    'care_coordination'
  ]),
  requester_id: z.string(),
  requester_type: z.enum(['agent', 'practitioner', 'system', 'organization']),
  context: z.object({
    encounter_id: z.string().optional(),
    urgency: z.enum(['routine', 'urgent', 'emergency']).default('routine'),
    session_id: z.string().optional(),
    description: z.string().optional(),
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
  }).optional(),
});

export type ConsentRequest = z.infer<typeof ConsentRequestSchema>;

// ==================== Consent Decision Schema ====================
export const ConsentDecisionSchema = z.object({
  request_id: z.string(),
  patient_id: z.string(),
  decision: z.enum(['granted', 'denied', 'partial']),
  granted_scope: z.array(z.string()).optional(),
  denied_scope: z.array(z.string()).optional(),
  granted_fields: z.array(z.string()).optional(),
  denied_fields: z.array(z.string()).optional(),
  reason: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  expires: z.string().optional(),
  decision_timestamp: z.string(),
  decision_maker: z.enum(['patient', 'legal_representative', 'proxy', 'system']),
  metadata: z.object({
    ip_address: z.string().optional(),
    user_agent: z.string().optional(),
    location: z.string().optional(),
    decision_method: z.enum(['digital_signature', 'written', 'verbal', 'electronic', 'automatic']),
    language: z.string().default('en'),
  }).optional(),
});

export type ConsentDecision = z.infer<typeof ConsentDecisionSchema>;

// ==================== Consent Verification Result Schema ====================
export const ConsentVerificationResultSchema = z.object({
  allowed: z.boolean(),
  patient_id: z.string(),
  requested_scope: z.array(z.string()),
  granted_scope: z.array(z.string()),
  denied_scope: z.array(z.string()),
  fields_granted: z.array(z.string()).optional(),
  fields_denied: z.array(z.string()).optional(),
  purpose: z.string(),
  consent_policy_id: z.string(),
  verification_timestamp: z.string(),
  expires: z.string().optional(),
  emergency_override: z.boolean().optional(),
  reason: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  audit_log_id: z.string().optional(),
});

export type ConsentVerificationResult = z.infer<typeof ConsentVerificationResultSchema>;

// ==================== Consent Audit Entry Schema ====================
export const ConsentAuditEntrySchema = z.object({
  event_id: z.string(),
  timestamp: z.string(),
  patient_id: z.string(),
  actor: z.string(),
  action: z.enum([
    'consent_granted',
    'consent_denied',
    'consent_revoked',
    'consent_verified',
    'access_granted',
    'access_denied'
  ]),
  scope: z.array(z.string()),
  purpose: z.string(),
  result: z.enum(['success', 'failure', 'partial']),
  details: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  consent_policy_id: z.string().optional(),
  fields_requested: z.array(z.string()).optional(),
  fields_granted: z.array(z.string()).optional(),
});

export type ConsentAuditEntry = z.infer<typeof ConsentAuditEntrySchema>;