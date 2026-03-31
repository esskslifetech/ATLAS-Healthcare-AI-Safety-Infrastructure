"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationEventSchema = exports.PerformanceMetricsSchema = exports.ResourceReferenceSchema = exports.DecisionPointSchema = exports.StateTransitionSchema = exports.WorkflowStepSchema = exports.AgentCapabilitiesSchema = exports.CoordinationResultSchema = exports.CoordinationRequestSchema = exports.CareSessionSchema = exports.AgentHandoffSchema = exports.TimelineEventSchema = exports.IntegrationEventTypeSchema = exports.CoordinationOutcomeSchema = exports.AgentHandoffStatusSchema = exports.TimelineEventTypeSchema = exports.CareSessionStateSchema = exports.UrgencySchema = void 0;
// types.ts
const zod_1 = require("zod");
// ==================== Enums & Base Types ====================
exports.UrgencySchema = zod_1.z.enum(['EMERGENT', 'URGENT', 'SEMI_URGENT', 'ROUTINE']);
exports.CareSessionStateSchema = zod_1.z.enum([
    'INTAKE',
    'TRIAGE',
    'ROUTING',
    'MEDS',
    'COMPLETE',
    'ESCALATED',
    'CANCELLED',
]);
exports.TimelineEventTypeSchema = zod_1.z.enum([
    'SESSION_START',
    'SYMPTOM_REPORT',
    'CONSENT_VERIFIED',
    'TRIAGE_COMPLETED',
    'REFERRAL_INITIATED',
    'MEDICATION_CHECK',
    'PROVIDER_NOTIFIED',
    'PATIENT_NOTIFIED',
    'SESSION_COMPLETE',
    'SESSION_CANCELLED',
    'ESCALATION_TRIGGERED',
    'ERROR_OCCURRED',
    'AGENT_HANDOFF',
]);
exports.AgentHandoffStatusSchema = zod_1.z.enum(['initiated', 'in_progress', 'completed', 'failed']);
exports.CoordinationOutcomeSchema = zod_1.z.enum([
    'SUCCESSFUL_TRIAGE',
    'EMERGENCY_ESCALATION',
    'REFERRAL_SCHEDULED',
    'SELF_CARE_ADVICE',
    'PROVIDER_CONSULTATION',
    'SYSTEM_ERROR',
    'PATIENT_DECLINED',
]);
exports.IntegrationEventTypeSchema = zod_1.z.enum([
    'FHIR_RESOURCE_CREATED',
    'CONSENT_VERIFIED',
    'IDENTITY_TOKEN_ACQUIRED',
    'AUDIT_LOG_CREATED',
    'AGENT_HANDOFF',
    'EXTERNAL_SYSTEM_CALLED',
    'NOTIFICATION_SENT',
    'WORKFLOW_COMPLETED',
]);
// ==================== Timeline Event ====================
exports.TimelineEventSchema = zod_1.z.object({
    event_id: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    event_type: exports.TimelineEventTypeSchema,
    agent: zod_1.z.string(),
    description: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    fhir_resources: zod_1.z.array(zod_1.z.string()).optional(),
});
// ==================== Agent Handoff ====================
exports.AgentHandoffSchema = zod_1.z.object({
    handoff_id: zod_1.z.string(),
    from_agent: zod_1.z.string(),
    to_agent: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    reason: zod_1.z.string(),
    context: zod_1.z.object({
        patient_id: zod_1.z.string(),
        session_id: zod_1.z.string(),
        urgency: exports.UrgencySchema.optional(),
        symptoms: zod_1.z.array(zod_1.z.string()).optional(),
        clinical_data: zod_1.z.any().optional(),
    }),
    status: exports.AgentHandoffStatusSchema,
});
// ==================== Care Session ====================
exports.CareSessionSchema = zod_1.z.object({
    session_id: zod_1.z.string(),
    patient_id: zod_1.z.string(),
    state: exports.CareSessionStateSchema,
    timeline: zod_1.z.array(exports.TimelineEventSchema),
    fhir_resources: zod_1.z.array(zod_1.z.string()),
    agent_handoffs: zod_1.z.array(exports.AgentHandoffSchema),
    consent_ref: zod_1.z.string(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
    completed_at: zod_1.z.string().optional(),
    metadata: zod_1.z
        .object({
        initial_symptoms: zod_1.z.array(zod_1.z.string()).optional(),
        patientContext: zod_1.z
            .object({
            age: zod_1.z.number().optional(),
            vitals: zod_1.z
                .object({
                heartRate: zod_1.z.number().optional(),
                bloodPressure: zod_1.z
                    .object({
                    systolic: zod_1.z.number().optional(),
                    diastolic: zod_1.z.number().optional(),
                })
                    .optional(),
                temperature: zod_1.z.number().optional(),
                oxygenSaturation: zod_1.z.number().optional(),
                respiratoryRate: zod_1.z.number().optional(),
            })
                .optional(),
            medications: zod_1.z.array(zod_1.z.string()).optional(),
            allergies: zod_1.z.array(zod_1.z.string()).optional(),
            medicalHistory: zod_1.z.array(zod_1.z.string()).optional(),
        })
            .optional(),
        clinicalContext: zod_1.z.any().optional(),
        sharpContext: zod_1.z.any().optional(),
        triage_result: zod_1.z
            .object({
            urgency: exports.UrgencySchema,
            suggested_pathway: zod_1.z.enum(['ED', 'URGENT_CARE', 'PRIMARY_CARE', 'TELEHEALTH']),
            differential: zod_1.z
                .array(zod_1.z.object({
                condition: zod_1.z.string(),
                icd10: zod_1.z.string().optional(),
                confidence: zod_1.z.number().min(0).max(1),
            }))
                .optional(),
            red_flags: zod_1.z.array(zod_1.z.string()).optional(),
            reasoning: zod_1.z.string().optional(),
            confidence_score: zod_1.z.number().min(0).max(1),
            recommendations: zod_1.z.array(zod_1.z.string()).optional(),
            requires_immediate_attention: zod_1.z.boolean().optional(),
        })
            .optional(),
        referral_details: zod_1.z
            .object({
            specialist_type: zod_1.z.string().optional(),
            facility: zod_1.z.string().optional(),
            urgency: zod_1.z.string().optional(),
            appointment_scheduled: zod_1.z.boolean().optional(),
            wait_time_minutes: zod_1.z.number().optional(),
            distance_miles: zod_1.z.number().optional(),
            insurance_accepted: zod_1.z.boolean().optional(),
        })
            .optional(),
        medication_check: zod_1.z
            .object({
            interactions_found: zod_1.z.boolean().optional(),
            contraindications: zod_1.z.array(zod_1.z.string()).optional(),
            recommendations: zod_1.z.array(zod_1.z.string()).optional(),
            current_medications: zod_1.z.array(zod_1.z.string()).optional(),
        })
            .optional(),
        provider_notifications: zod_1.z.array(zod_1.z.string()).optional(),
        patient_instructions: zod_1.z.array(zod_1.z.string()).optional(),
        escalation_reason: zod_1.z.string().optional(),
    })
        .optional(),
});
// ==================== Coordination Request ====================
exports.CoordinationRequestSchema = zod_1.z.object({
    request_id: zod_1.z.string().optional(), // will be generated if not provided
    patient_id: zod_1.z.string(),
    trigger: zod_1.z.enum([
        'PATIENT_INITIATED',
        'PROVIDER_INITIATED',
        'SYSTEM_ALERT',
        'SCHEDULED_CHECKIN',
        'FOLLOW_UP',
    ]),
    initial_data: zod_1.z.object({
        symptoms: zod_1.z.array(zod_1.z.string()).optional(),
        chief_complaint: zod_1.z.string().optional(),
        urgency: exports.UrgencySchema.optional(),
        channel: zod_1.z.enum(['chat', 'phone', 'in_person', 'portal']).optional(),
        encounter_id: zod_1.z.string().optional(),
        provider_id: zod_1.z.string().optional(),
    }),
    context: zod_1.z
        .object({
        time_of_day: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        available_resources: zod_1.z.array(zod_1.z.string()).optional(),
        insurance_info: zod_1.z.string().optional(),
        preferences: zod_1.z
            .object({
            language: zod_1.z.string().optional(),
            provider: zod_1.z.string().optional(),
            facility: zod_1.z.string().optional(),
        })
            .optional(),
    })
        .optional(),
});
// ==================== Coordination Result ====================
exports.CoordinationResultSchema = zod_1.z.object({
    request_id: zod_1.z.string(),
    session_id: zod_1.z.string(),
    final_state: exports.CareSessionStateSchema,
    outcome: exports.CoordinationOutcomeSchema,
    summary: zod_1.z.string(),
    recommendations: zod_1.z.array(zod_1.z.string()),
    follow_up_actions: zod_1.z.array(zod_1.z.string()),
    fhir_resources_created: zod_1.z.array(zod_1.z.string()),
    providers_notified: zod_1.z.array(zod_1.z.string()),
    patient_instructions: zod_1.z.array(zod_1.z.string()),
    next_steps: zod_1.z.array(zod_1.z.string()),
    completion_time: zod_1.z.string(),
    confidence_score: zod_1.z.number().min(0).max(1),
    requires_human_review: zod_1.z.boolean(),
});
// ==================== Agent Capabilities ====================
exports.AgentCapabilitiesSchema = zod_1.z.object({
    agent_id: zod_1.z.string(),
    agent_name: zod_1.z.string(),
    capabilities: zod_1.z.array(zod_1.z.string()),
    supported_urgencies: zod_1.z.array(exports.UrgencySchema),
    supported_symptoms: zod_1.z.array(zod_1.z.string()).optional(),
    requires_consent: zod_1.z.boolean().default(true),
    average_processing_time: zod_1.z.number().optional(), // seconds
    success_rate: zod_1.z.number().optional(),
    availability: zod_1.z
        .object({
        available: zod_1.z.boolean(),
        current_load: zod_1.z.number().optional(),
        max_capacity: zod_1.z.number().optional(),
    })
        .optional(),
});
// ==================== Workflow Step ====================
exports.WorkflowStepSchema = zod_1.z.object({
    step_id: zod_1.z.string(),
    step_name: zod_1.z.string(),
    agent: zod_1.z.string(),
    required_state: exports.CareSessionStateSchema,
    next_states: zod_1.z.array(exports.CareSessionStateSchema),
    conditions: zod_1.z
        .object({
        urgency_required: exports.UrgencySchema.optional(),
        symptoms_required: zod_1.z.array(zod_1.z.string()).optional(),
        data_required: zod_1.z.array(zod_1.z.string()).optional(),
        consent_required: zod_1.z.boolean().optional(),
    })
        .optional(),
    timeout_seconds: zod_1.z.number().optional(),
    retry_attempts: zod_1.z.number().default(3),
    fallback_agent: zod_1.z.string().optional(),
});
// ==================== State Transition ====================
exports.StateTransitionSchema = zod_1.z.object({
    from_state: exports.CareSessionStateSchema,
    to_state: exports.CareSessionStateSchema,
    trigger: zod_1.z.string(),
    agent: zod_1.z.string(),
    conditions_met: zod_1.z.boolean(),
    timestamp: zod_1.z.string(),
    reason: zod_1.z.string(),
});
// ==================== Decision Point ====================
exports.DecisionPointSchema = zod_1.z.object({
    decision_id: zod_1.z.string(),
    session_id: zod_1.z.string(),
    decision_type: zod_1.z.enum([
        'URGENCY_ASSESSMENT',
        'CARE_PATHWAY_SELECTION',
        'SPECIALIST_MATCHING',
        'MEDICATION_REVIEW',
        'ESCALATION_DETERMINATION',
        'COMPLETION_CRITERIA',
    ]),
    options: zod_1.z.array(zod_1.z.object({
        option: zod_1.z.string(),
        probability: zod_1.z.number().min(0).max(1),
        reasoning: zod_1.z.string(),
        agent_responsible: zod_1.z.string(),
    })),
    selected_option: zod_1.z.string().optional(),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    timestamp: zod_1.z.string(),
    resolved: zod_1.z.boolean().default(false),
});
// ==================== Resource Reference ====================
exports.ResourceReferenceSchema = zod_1.z.object({
    resource_type: zod_1.z.string(),
    resource_id: zod_1.z.string(),
    reference: zod_1.z.string(),
    created_by: zod_1.z.string(),
    created_at: zod_1.z.string(),
    purpose: zod_1.z.string(),
});
// ==================== Performance Metrics ====================
exports.PerformanceMetricsSchema = zod_1.z.object({
    session_id: zod_1.z.string(),
    total_duration: zod_1.z.number(), // seconds
    agent_durations: zod_1.z.record(zod_1.z.number()), // per agent
    state_transitions: zod_1.z.number(),
    decisions_made: zod_1.z.number(),
    resources_created: zod_1.z.number(),
    errors_encountered: zod_1.z.number(),
    patient_satisfaction: zod_1.z.number().min(1).max(5).optional(),
    clinical_appropriateness: zod_1.z.number().min(1).max(5).optional(),
    cost_efficiency: zod_1.z.number().optional(),
});
// ==================== Integration Event ====================
exports.IntegrationEventSchema = zod_1.z.object({
    event_id: zod_1.z.string(),
    event_type: exports.IntegrationEventTypeSchema,
    timestamp: zod_1.z.string(),
    source_system: zod_1.z.string(),
    target_system: zod_1.z.string().optional(),
    session_id: zod_1.z.string(),
    patient_id: zod_1.z.string(),
    data: zod_1.z.any(),
    success: zod_1.z.boolean(),
    error_message: zod_1.z.string().optional(),
    processing_time: zod_1.z.number().optional(),
});
//# sourceMappingURL=types.js.map