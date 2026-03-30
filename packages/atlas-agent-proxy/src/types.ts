import { z } from 'zod';

// Message types
export const MessageTypeSchema = z.enum([
  'text',
  'symptom_report',
  'vital_signs',
  'medication_list',
  'allergy_list',
  'medical_history',
  'appointment_request',
  'prescription_refill',
  'lab_results',
  'emergency_alert',
  'follow_up',
  'educational_content',
  'system_notification'
]);
export type MessageType = z.infer<typeof MessageTypeSchema>;

// Message direction
export const MessageDirectionSchema = z.enum(['incoming', 'outgoing']);
export type MessageDirection = z.infer<typeof MessageDirectionSchema>;

// Communication channels
export const ChannelSchema = z.enum(['chat', 'voice', 'sms', 'email', 'mobile_app']);
export type Channel = z.infer<typeof ChannelSchema>;

// Patient message
export const PatientMessageSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  session_id: z.string(),
  message_type: MessageTypeSchema,
  direction: MessageDirectionSchema,
  channel: ChannelSchema,
  content: z.string(),
  timestamp: z.string(),
  metadata: z.object({
    symptoms: z.array(z.string()).optional(),
    vital_signs: z.object({
      blood_pressure_systolic: z.number().optional(),
      blood_pressure_diastolic: z.number().optional(),
      heart_rate: z.number().optional(),
      temperature: z.number().optional(),
      oxygen_saturation: z.number().optional(),
      pain_scale: z.number().min(0).max(10).optional(),
    }).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    urgency: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
    attachments: z.array(z.object({
      type: z.string(),
      url: z.string(),
      filename: z.string(),
    })).optional(),
    language: z.string().default('en'),
    sentiment: z.enum(['positive', 'neutral', 'negative', 'anxious', 'frustrated']).optional(),
  }).optional(),
});
export type PatientMessage = z.infer<typeof PatientMessageSchema>;

// Agent response
export const AgentResponseSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  message_type: MessageTypeSchema,
  channel: ChannelSchema,
  content: z.string(),
  timestamp: z.string(),
  metadata: z.object({
    response_type: z.enum(['informational', 'clarification', 'recommendation', 'emergency', 'educational']),
    triage_result: z.object({
      urgency: z.enum(['EMERGENT', 'URGENT', 'SEMI_URGENT', 'ROUTINE']),
      suggested_pathway: z.enum(['ED', 'URGENT_CARE', 'PRIMARY_CARE', 'TELEHEALTH']),
      red_flags: z.array(z.string()),
    }).optional(),
    next_steps: z.array(z.string()).optional(),
    follow_up_required: z.boolean().optional(),
    escalation_triggered: z.boolean().optional(),
    consent_required: z.boolean().optional(),
    attachments: z.array(z.object({
      type: z.string(),
      content: z.string(),
      filename: z.string(),
    })).optional(),
    language: z.string().default('en'),
    reading_level: z.enum(['basic', 'intermediate', 'advanced']).default('basic'),
  }).optional(),
});
export type AgentResponse = z.infer<typeof AgentResponseSchema>;

// Session information
export const PatientSessionSchema = z.object({
  session_id: z.string(),
  patient_id: z.string(),
  start_time: z.string(),
  end_time: z.string().optional(),
  status: z.enum(['active', 'completed', 'escalated', 'transferred']),
  channel: ChannelSchema,
  messages: z.array(z.union([PatientMessageSchema, AgentResponseSchema])),
  context: z.object({
    chief_complaint: z.string().optional(),
    symptoms_discussed: z.array(z.string()).optional(),
    medications_discussed: z.array(z.string()).optional(),
    allergies_discussed: z.array(z.string()).optional(),
    vital_signs_collected: z.boolean().default(false),
    triage_performed: z.boolean().default(false),
    consent_obtained: z.boolean().default(false),
    escalation_triggered: z.boolean().default(false),
    provider_notified: z.boolean().default(false),
  }).optional(),
  summary: z.object({
    total_messages: z.number(),
    patient_messages: z.number(),
    agent_messages: z.number(),
    session_duration: z.number().optional(), // in minutes
    resolution: z.enum(['resolved', 'escalated', 'transferred', 'abandoned']).optional(),
    satisfaction_score: z.number().min(1).max(5).optional(),
  }).optional(),
});
export type PatientSession = z.infer<typeof PatientSessionSchema>;

// Symptom extraction result
export const SymptomExtractionSchema = z.object({
  symptoms: z.array(z.object({
    description: z.string(),
    duration: z.string().optional(),
    severity: z.enum(['mild', 'moderate', 'severe']).optional(),
    onset: z.enum(['sudden', 'gradual', 'unknown']).optional(),
    location: z.string().optional(),
    associated_symptoms: z.array(z.string()).optional(),
  })),
  confidence: z.number().min(0).max(1),
  requires_clarification: z.array(z.string()).optional(),
});
export type SymptomExtraction = z.infer<typeof SymptomExtractionSchema>;

// Health literacy level
export const HealthLiteracySchema = z.enum(['basic', 'intermediate', 'advanced']);
export type HealthLiteracy = z.infer<typeof HealthLiteracySchema>;

// Patient profile
export const PatientProfileSchema = z.object({
  patient_id: z.string(),
  preferred_language: z.string().default('en'),
  health_literacy: HealthLiteracySchema,
  communication_preferences: z.object({
    channel: ChannelSchema,
    message_frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
    reading_level: z.enum(['basic', 'intermediate', 'advanced']),
    medical_jargon_tolerance: z.enum(['low', 'medium', 'high']),
    empathy_level: z.enum(['formal', 'friendly', 'very_friendly']),
  }),
  accessibility_needs: z.object({
    large_text: z.boolean().default(false),
    voice_output: z.boolean().default(false),
    simple_language: z.boolean().default(true),
    visual_aids: z.boolean().default(false),
  }).optional(),
  medical_background: z.object({
    chronic_conditions: z.array(z.string()).optional(),
    current_medications: z.array(z.string()).optional(),
    known_allergies: z.array(z.string()).optional(),
    preferred_provider: z.string().optional(),
    emergency_contact: z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
    }).optional(),
  }).optional(),
});
export type PatientProfile = z.infer<typeof PatientProfileSchema>;

// Content templates
export const ContentTemplateSchema = z.object({
  template_id: z.string(),
  category: z.enum(['greeting', 'symptom_collection', 'vital_signs', 'education', 'emergency', 'follow_up']),
  language: z.string(),
  health_literacy: HealthLiteracySchema,
  content: z.string(),
  variables: z.array(z.string()).optional(),
  conditions: z.object({
    symptoms: z.array(z.string()).optional(),
    urgency: z.array(z.string()).optional(),
    age_groups: z.array(z.string()).optional(),
  }).optional(),
});
export type ContentTemplate = z.infer<typeof ContentTemplateSchema>;

// Notification preferences
export const NotificationPreferencesSchema = z.object({
  patient_id: z.string(),
  appointment_reminders: z.boolean().default(true),
  medication_reminders: z.boolean().default(true),
  test_results: z.boolean().default(true),
  health_tips: z.boolean().default(false),
  emergency_alerts: z.boolean().default(true),
  follow_up_care: z.boolean().default(true),
  preferred_channels: z.array(ChannelSchema),
  quiet_hours: z.object({
    start: z.string().optional(), // HH:MM format
    end: z.string().optional(),   // HH:MM format
    timezone: z.string().optional(),
  }).optional(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

// In MessageAnalyzer.analyzeSentiment()
const confusedWords = ['confused', 'unsure', 'don\'t understand', 'what does this mean'];
const analyzeConfusion = (content: string) => {
  if (confusedWords.some(word => content.includes(word))) return 'confused';
  return 'neutral';
};

// Emergency escalation
export const EmergencyEscalationSchema = z.object({
  escalation_id: z.string(),
  patient_id: z.string(),
  session_id: z.string(),
  trigger_reason: z.string(),
  urgency: z.enum(['EMERGENT', 'URGENT']),
  symptoms: z.array(z.string()),
  vital_signs: z.object({
    blood_pressure_systolic: z.number().optional(),
    blood_pressure_diastolic: z.number().optional(),
    heart_rate: z.number().optional(),
    temperature: z.number().optional(),
    oxygen_saturation: z.number().optional(),
    pain_scale: z.number().min(0).max(10).optional(),
  }).optional(),
  actions_taken: z.array(z.string()),
  provider_notified: z.boolean(),
  emergency_services_called: z.boolean(),
  timestamp: z.string(),
  resolution: z.string().optional(),
  resolution_timestamp: z.string().optional(),
});
export type EmergencyEscalation = z.infer<typeof EmergencyEscalationSchema>;

// Message analysis
export const MessageAnalysisSchema = z.object({
  message_id: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'anxious', 'frustrated', 'confused']),
  urgency_indicators: z.array(z.string()),
  medical_keywords: z.array(z.string()),
  requires_medical_attention: z.boolean(),
  requires_clarification: z.array(z.string()),
  suggested_responses: z.array(z.string()),
  confidence_score: z.number().min(0).max(1),
});
export type MessageAnalysis = z.infer<typeof MessageAnalysisSchema>;
