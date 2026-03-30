"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageAnalysisSchema = exports.EmergencyEscalationSchema = exports.NotificationPreferencesSchema = exports.ContentTemplateSchema = exports.PatientProfileSchema = exports.HealthLiteracySchema = exports.SymptomExtractionSchema = exports.PatientSessionSchema = exports.AgentResponseSchema = exports.PatientMessageSchema = exports.ChannelSchema = exports.MessageDirectionSchema = exports.MessageTypeSchema = void 0;
const zod_1 = require("zod");
// Message types
exports.MessageTypeSchema = zod_1.z.enum([
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
// Message direction
exports.MessageDirectionSchema = zod_1.z.enum(['incoming', 'outgoing']);
// Communication channels
exports.ChannelSchema = zod_1.z.enum(['chat', 'voice', 'sms', 'email', 'mobile_app']);
// Patient message
exports.PatientMessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    patient_id: zod_1.z.string(),
    session_id: zod_1.z.string(),
    message_type: exports.MessageTypeSchema,
    direction: exports.MessageDirectionSchema,
    channel: exports.ChannelSchema,
    content: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    metadata: zod_1.z.object({
        symptoms: zod_1.z.array(zod_1.z.string()).optional(),
        vital_signs: zod_1.z.object({
            blood_pressure_systolic: zod_1.z.number().optional(),
            blood_pressure_diastolic: zod_1.z.number().optional(),
            heart_rate: zod_1.z.number().optional(),
            temperature: zod_1.z.number().optional(),
            oxygen_saturation: zod_1.z.number().optional(),
            pain_scale: zod_1.z.number().min(0).max(10).optional(),
        }).optional(),
        medications: zod_1.z.array(zod_1.z.string()).optional(),
        allergies: zod_1.z.array(zod_1.z.string()).optional(),
        urgency: zod_1.z.enum(['low', 'medium', 'high', 'emergency']).optional(),
        attachments: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            url: zod_1.z.string(),
            filename: zod_1.z.string(),
        })).optional(),
        language: zod_1.z.string().default('en'),
        sentiment: zod_1.z.enum(['positive', 'neutral', 'negative', 'anxious', 'frustrated']).optional(),
    }).optional(),
});
// Agent response
exports.AgentResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    session_id: zod_1.z.string(),
    message_type: exports.MessageTypeSchema,
    channel: exports.ChannelSchema,
    content: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    metadata: zod_1.z.object({
        response_type: zod_1.z.enum(['informational', 'clarification', 'recommendation', 'emergency', 'educational']),
        triage_result: zod_1.z.object({
            urgency: zod_1.z.enum(['EMERGENT', 'URGENT', 'SEMI_URGENT', 'ROUTINE']),
            suggested_pathway: zod_1.z.enum(['ED', 'URGENT_CARE', 'PRIMARY_CARE', 'TELEHEALTH']),
            red_flags: zod_1.z.array(zod_1.z.string()),
        }).optional(),
        next_steps: zod_1.z.array(zod_1.z.string()).optional(),
        follow_up_required: zod_1.z.boolean().optional(),
        escalation_triggered: zod_1.z.boolean().optional(),
        consent_required: zod_1.z.boolean().optional(),
        attachments: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            content: zod_1.z.string(),
            filename: zod_1.z.string(),
        })).optional(),
        language: zod_1.z.string().default('en'),
        reading_level: zod_1.z.enum(['basic', 'intermediate', 'advanced']).default('basic'),
    }).optional(),
});
// Session information
exports.PatientSessionSchema = zod_1.z.object({
    session_id: zod_1.z.string(),
    patient_id: zod_1.z.string(),
    start_time: zod_1.z.string(),
    end_time: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'completed', 'escalated', 'transferred']),
    channel: exports.ChannelSchema,
    messages: zod_1.z.array(zod_1.z.union([exports.PatientMessageSchema, exports.AgentResponseSchema])),
    context: zod_1.z.object({
        chief_complaint: zod_1.z.string().optional(),
        symptoms_discussed: zod_1.z.array(zod_1.z.string()).optional(),
        medications_discussed: zod_1.z.array(zod_1.z.string()).optional(),
        allergies_discussed: zod_1.z.array(zod_1.z.string()).optional(),
        vital_signs_collected: zod_1.z.boolean().default(false),
        triage_performed: zod_1.z.boolean().default(false),
        consent_obtained: zod_1.z.boolean().default(false),
        escalation_triggered: zod_1.z.boolean().default(false),
        provider_notified: zod_1.z.boolean().default(false),
    }).optional(),
    summary: zod_1.z.object({
        total_messages: zod_1.z.number(),
        patient_messages: zod_1.z.number(),
        agent_messages: zod_1.z.number(),
        session_duration: zod_1.z.number().optional(), // in minutes
        resolution: zod_1.z.enum(['resolved', 'escalated', 'transferred', 'abandoned']).optional(),
        satisfaction_score: zod_1.z.number().min(1).max(5).optional(),
    }).optional(),
});
// Symptom extraction result
exports.SymptomExtractionSchema = zod_1.z.object({
    symptoms: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        duration: zod_1.z.string().optional(),
        severity: zod_1.z.enum(['mild', 'moderate', 'severe']).optional(),
        onset: zod_1.z.enum(['sudden', 'gradual', 'unknown']).optional(),
        location: zod_1.z.string().optional(),
        associated_symptoms: zod_1.z.array(zod_1.z.string()).optional(),
    })),
    confidence: zod_1.z.number().min(0).max(1),
    requires_clarification: zod_1.z.array(zod_1.z.string()).optional(),
});
// Health literacy level
exports.HealthLiteracySchema = zod_1.z.enum(['basic', 'intermediate', 'advanced']);
// Patient profile
exports.PatientProfileSchema = zod_1.z.object({
    patient_id: zod_1.z.string(),
    preferred_language: zod_1.z.string().default('en'),
    health_literacy: exports.HealthLiteracySchema,
    communication_preferences: zod_1.z.object({
        channel: exports.ChannelSchema,
        message_frequency: zod_1.z.enum(['immediate', 'hourly', 'daily', 'weekly']),
        reading_level: zod_1.z.enum(['basic', 'intermediate', 'advanced']),
        medical_jargon_tolerance: zod_1.z.enum(['low', 'medium', 'high']),
        empathy_level: zod_1.z.enum(['formal', 'friendly', 'very_friendly']),
    }),
    accessibility_needs: zod_1.z.object({
        large_text: zod_1.z.boolean().default(false),
        voice_output: zod_1.z.boolean().default(false),
        simple_language: zod_1.z.boolean().default(true),
        visual_aids: zod_1.z.boolean().default(false),
    }).optional(),
    medical_background: zod_1.z.object({
        chronic_conditions: zod_1.z.array(zod_1.z.string()).optional(),
        current_medications: zod_1.z.array(zod_1.z.string()).optional(),
        known_allergies: zod_1.z.array(zod_1.z.string()).optional(),
        preferred_provider: zod_1.z.string().optional(),
        emergency_contact: zod_1.z.object({
            name: zod_1.z.string(),
            relationship: zod_1.z.string(),
            phone: zod_1.z.string(),
        }).optional(),
    }).optional(),
});
// Content templates
exports.ContentTemplateSchema = zod_1.z.object({
    template_id: zod_1.z.string(),
    category: zod_1.z.enum(['greeting', 'symptom_collection', 'vital_signs', 'education', 'emergency', 'follow_up']),
    language: zod_1.z.string(),
    health_literacy: exports.HealthLiteracySchema,
    content: zod_1.z.string(),
    variables: zod_1.z.array(zod_1.z.string()).optional(),
    conditions: zod_1.z.object({
        symptoms: zod_1.z.array(zod_1.z.string()).optional(),
        urgency: zod_1.z.array(zod_1.z.string()).optional(),
        age_groups: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
});
// Notification preferences
exports.NotificationPreferencesSchema = zod_1.z.object({
    patient_id: zod_1.z.string(),
    appointment_reminders: zod_1.z.boolean().default(true),
    medication_reminders: zod_1.z.boolean().default(true),
    test_results: zod_1.z.boolean().default(true),
    health_tips: zod_1.z.boolean().default(false),
    emergency_alerts: zod_1.z.boolean().default(true),
    follow_up_care: zod_1.z.boolean().default(true),
    preferred_channels: zod_1.z.array(exports.ChannelSchema),
    quiet_hours: zod_1.z.object({
        start: zod_1.z.string().optional(), // HH:MM format
        end: zod_1.z.string().optional(), // HH:MM format
        timezone: zod_1.z.string().optional(),
    }).optional(),
});
// In MessageAnalyzer.analyzeSentiment()
const confusedWords = ['confused', 'unsure', 'don\'t understand', 'what does this mean'];
const analyzeConfusion = (content) => {
    if (confusedWords.some(word => content.includes(word)))
        return 'confused';
    return 'neutral';
};
// Emergency escalation
exports.EmergencyEscalationSchema = zod_1.z.object({
    escalation_id: zod_1.z.string(),
    patient_id: zod_1.z.string(),
    session_id: zod_1.z.string(),
    trigger_reason: zod_1.z.string(),
    urgency: zod_1.z.enum(['EMERGENT', 'URGENT']),
    symptoms: zod_1.z.array(zod_1.z.string()),
    vital_signs: zod_1.z.object({
        blood_pressure_systolic: zod_1.z.number().optional(),
        blood_pressure_diastolic: zod_1.z.number().optional(),
        heart_rate: zod_1.z.number().optional(),
        temperature: zod_1.z.number().optional(),
        oxygen_saturation: zod_1.z.number().optional(),
        pain_scale: zod_1.z.number().min(0).max(10).optional(),
    }).optional(),
    actions_taken: zod_1.z.array(zod_1.z.string()),
    provider_notified: zod_1.z.boolean(),
    emergency_services_called: zod_1.z.boolean(),
    timestamp: zod_1.z.string(),
    resolution: zod_1.z.string().optional(),
    resolution_timestamp: zod_1.z.string().optional(),
});
// Message analysis
exports.MessageAnalysisSchema = zod_1.z.object({
    message_id: zod_1.z.string(),
    sentiment: zod_1.z.enum(['positive', 'neutral', 'negative', 'anxious', 'frustrated', 'confused']),
    urgency_indicators: zod_1.z.array(zod_1.z.string()),
    medical_keywords: zod_1.z.array(zod_1.z.string()),
    requires_medical_attention: zod_1.z.boolean(),
    requires_clarification: zod_1.z.array(zod_1.z.string()),
    suggested_responses: zod_1.z.array(zod_1.z.string()),
    confidence_score: zod_1.z.number().min(0).max(1),
});
//# sourceMappingURL=types.js.map