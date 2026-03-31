// types.ts
import { z } from 'zod';

// ==================== Enums & Base Types ====================
export const UrgencySchema = z.enum(['EMERGENT', 'URGENT', 'SEMI_URGENT', 'ROUTINE']);
export type Urgency = z.infer<typeof UrgencySchema>;

export const CareSessionStateSchema = z.enum([
  'INTAKE',
  'TRIAGE',
  'ROUTING',
  'MEDS',
  'COMPLETE',
  'ESCALATED',
  'CANCELLED',
]);
export type CareSessionState = z.infer<typeof CareSessionStateSchema>;

export const TimelineEventTypeSchema = z.enum([
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
export type TimelineEventType = z.infer<typeof TimelineEventTypeSchema>;

export const AgentHandoffStatusSchema = z.enum(['initiated', 'in_progress', 'completed', 'failed']);
export type AgentHandoffStatus = z.infer<typeof AgentHandoffStatusSchema>;

export const CoordinationOutcomeSchema = z.enum([
  'SUCCESSFUL_TRIAGE',
  'EMERGENCY_ESCALATION',
  'REFERRAL_SCHEDULED',
  'SELF_CARE_ADVICE',
  'PROVIDER_CONSULTATION',
  'SYSTEM_ERROR',
  'PATIENT_DECLINED',
]);
export type CoordinationOutcome = z.infer<typeof CoordinationOutcomeSchema>;

export const IntegrationEventTypeSchema = z.enum([
  'FHIR_RESOURCE_CREATED',
  'CONSENT_VERIFIED',
  'IDENTITY_TOKEN_ACQUIRED',
  'AUDIT_LOG_CREATED',
  'AGENT_HANDOFF',
  'EXTERNAL_SYSTEM_CALLED',
  'NOTIFICATION_SENT',
  'WORKFLOW_COMPLETED',
]);
export type IntegrationEventType = z.infer<typeof IntegrationEventTypeSchema>;

// ==================== Timeline Event ====================
export const TimelineEventSchema = z.object({
  event_id: z.string(),
  timestamp: z.string(),
  event_type: TimelineEventTypeSchema,
  agent: z.string(),
  description: z.string(),
  data: z.any().optional(),
  fhir_resources: z.array(z.string()).optional(),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

// ==================== Agent Handoff ====================
export const AgentHandoffSchema = z.object({
  handoff_id: z.string(),
  from_agent: z.string(),
  to_agent: z.string(),
  timestamp: z.string(),
  reason: z.string(),
  context: z.object({
    patient_id: z.string(),
    session_id: z.string(),
    urgency: UrgencySchema.optional(),
    symptoms: z.array(z.string()).optional(),
    clinical_data: z.any().optional(),
  }),
  status: AgentHandoffStatusSchema,
});
export type AgentHandoff = z.infer<typeof AgentHandoffSchema>;

// ==================== Care Session ====================
export const CareSessionSchema = z.object({
  session_id: z.string(),
  patient_id: z.string(),
  state: CareSessionStateSchema,
  timeline: z.array(TimelineEventSchema),
  fhir_resources: z.array(z.string()),
  agent_handoffs: z.array(AgentHandoffSchema),
  consent_ref: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().optional(),
  metadata: z
    .object({
      initial_symptoms: z.array(z.string()).optional(),
      patientContext: z
        .object({
          age: z.number().optional(),
          vitals: z
            .object({
              heartRate: z.number().optional(),
              bloodPressure: z
                .object({
                  systolic: z.number().optional(),
                  diastolic: z.number().optional(),
                })
                .optional(),
              temperature: z.number().optional(),
              oxygenSaturation: z.number().optional(),
              respiratoryRate: z.number().optional(),
            })
            .optional(),
          medications: z.array(z.string()).optional(),
          allergies: z.array(z.string()).optional(),
          medicalHistory: z.array(z.string()).optional(),
        })
        .optional(),
      clinicalContext: z.any().optional(),
      sharpContext: z.any().optional(),
      triage_result: z
        .object({
          urgency: UrgencySchema,
          suggested_pathway: z.enum(['ED', 'URGENT_CARE', 'PRIMARY_CARE', 'TELEHEALTH']),
          differential: z
            .array(
              z.object({
                condition: z.string(),
                icd10: z.string().optional(),
                confidence: z.number().min(0).max(1),
              })
            )
            .optional(),
          red_flags: z.array(z.string()).optional(),
          reasoning: z.string().optional(),
          confidence_score: z.number().min(0).max(1),
          recommendations: z.array(z.string()).optional(),
          requires_immediate_attention: z.boolean().optional(),
        })
        .optional(),
      referral_details: z
        .object({
          specialist_type: z.string().optional(),
          facility: z.string().optional(),
          urgency: z.string().optional(),
          appointment_scheduled: z.boolean().optional(),
          wait_time_minutes: z.number().optional(),
          distance_miles: z.number().optional(),
          insurance_accepted: z.boolean().optional(),
        })
        .optional(),
      medication_check: z
        .object({
          interactions_found: z.boolean().optional(),
          contraindications: z.array(z.string()).optional(),
          recommendations: z.array(z.string()).optional(),
          current_medications: z.array(z.string()).optional(),
        })
        .optional(),
      provider_notifications: z.array(z.string()).optional(),
      patient_instructions: z.array(z.string()).optional(),
      escalation_reason: z.string().optional(),
    })
    .optional(),
});
export type CareSession = z.infer<typeof CareSessionSchema>;

// ==================== Coordination Request ====================
export const CoordinationRequestSchema = z.object({
  request_id: z.string().optional(), // will be generated if not provided
  patient_id: z.string(),
  trigger: z.enum([
    'PATIENT_INITIATED',
    'PROVIDER_INITIATED',
    'SYSTEM_ALERT',
    'SCHEDULED_CHECKIN',
    'FOLLOW_UP',
  ]),
  initial_data: z.object({
    symptoms: z.array(z.string()).optional(),
    chief_complaint: z.string().optional(),
    urgency: UrgencySchema.optional(),
    channel: z.enum(['chat', 'phone', 'in_person', 'portal']).optional(),
    encounter_id: z.string().optional(),
    provider_id: z.string().optional(),
  }),
  context: z
    .object({
      time_of_day: z.string().optional(),
      location: z.string().optional(),
      available_resources: z.array(z.string()).optional(),
      insurance_info: z.string().optional(),
      preferences: z
        .object({
          language: z.string().optional(),
          provider: z.string().optional(),
          facility: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});
export type CoordinationRequest = z.infer<typeof CoordinationRequestSchema>;

// ==================== Coordination Result ====================
export const CoordinationResultSchema = z.object({
  request_id: z.string(),
  session_id: z.string(),
  final_state: CareSessionStateSchema,
  outcome: CoordinationOutcomeSchema,
  summary: z.string(),
  recommendations: z.array(z.string()),
  follow_up_actions: z.array(z.string()),
  fhir_resources_created: z.array(z.string()),
  providers_notified: z.array(z.string()),
  patient_instructions: z.array(z.string()),
  next_steps: z.array(z.string()),
  completion_time: z.string(),
  confidence_score: z.number().min(0).max(1),
  requires_human_review: z.boolean(),
});
export type CoordinationResult = z.infer<typeof CoordinationResultSchema>;

// ==================== Agent Capabilities ====================
export const AgentCapabilitiesSchema = z.object({
  agent_id: z.string(),
  agent_name: z.string(),
  capabilities: z.array(z.string()),
  supported_urgencies: z.array(UrgencySchema),
  supported_symptoms: z.array(z.string()).optional(),
  requires_consent: z.boolean().default(true),
  average_processing_time: z.number().optional(), // seconds
  success_rate: z.number().optional(),
  availability: z
    .object({
      available: z.boolean(),
      current_load: z.number().optional(),
      max_capacity: z.number().optional(),
    })
    .optional(),
});
export type AgentCapabilities = z.infer<typeof AgentCapabilitiesSchema>;

// ==================== Workflow Step ====================
export const WorkflowStepSchema = z.object({
  step_id: z.string(),
  step_name: z.string(),
  agent: z.string(),
  required_state: CareSessionStateSchema,
  next_states: z.array(CareSessionStateSchema),
  conditions: z
    .object({
      urgency_required: UrgencySchema.optional(),
      symptoms_required: z.array(z.string()).optional(),
      data_required: z.array(z.string()).optional(),
      consent_required: z.boolean().optional(),
    })
    .optional(),
  timeout_seconds: z.number().optional(),
  retry_attempts: z.number().default(3),
  fallback_agent: z.string().optional(),
});
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

// ==================== State Transition ====================
export const StateTransitionSchema = z.object({
  from_state: CareSessionStateSchema,
  to_state: CareSessionStateSchema,
  trigger: z.string(),
  agent: z.string(),
  conditions_met: z.boolean(),
  timestamp: z.string(),
  reason: z.string(),
});
export type StateTransition = z.infer<typeof StateTransitionSchema>;

// ==================== Decision Point ====================
export const DecisionPointSchema = z.object({
  decision_id: z.string(),
  session_id: z.string(),
  decision_type: z.enum([
    'URGENCY_ASSESSMENT',
    'CARE_PATHWAY_SELECTION',
    'SPECIALIST_MATCHING',
    'MEDICATION_REVIEW',
    'ESCALATION_DETERMINATION',
    'COMPLETION_CRITERIA',
  ]),
  options: z.array(
    z.object({
      option: z.string(),
      probability: z.number().min(0).max(1),
      reasoning: z.string(),
      agent_responsible: z.string(),
    })
  ),
  selected_option: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  timestamp: z.string(),
  resolved: z.boolean().default(false),
});
export type DecisionPoint = z.infer<typeof DecisionPointSchema>;

// ==================== Resource Reference ====================
export const ResourceReferenceSchema = z.object({
  resource_type: z.string(),
  resource_id: z.string(),
  reference: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  purpose: z.string(),
});
export type ResourceReference = z.infer<typeof ResourceReferenceSchema>;

// ==================== Performance Metrics ====================
export const PerformanceMetricsSchema = z.object({
  session_id: z.string(),
  total_duration: z.number(), // seconds
  agent_durations: z.record(z.number()), // per agent
  state_transitions: z.number(),
  decisions_made: z.number(),
  resources_created: z.number(),
  errors_encountered: z.number(),
  patient_satisfaction: z.number().min(1).max(5).optional(),
  clinical_appropriateness: z.number().min(1).max(5).optional(),
  cost_efficiency: z.number().optional(),
});
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// ==================== Integration Event ====================
export const IntegrationEventSchema = z.object({
  event_id: z.string(),
  event_type: IntegrationEventTypeSchema,
  timestamp: z.string(),
  source_system: z.string(),
  target_system: z.string().optional(),
  session_id: z.string(),
  patient_id: z.string(),
  data: z.any(),
  success: z.boolean(),
  error_message: z.string().optional(),
  processing_time: z.number().optional(),
});
export type IntegrationEvent = z.infer<typeof IntegrationEventSchema>;