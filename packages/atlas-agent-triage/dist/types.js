"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATHWAY_TIME_FRAMES = exports.CONFIDENCE_THRESHOLDS = exports.ICD10_MAPPINGS = exports.SYMPTOM_URGENCY_MAP = exports.RED_FLAG_DEFINITIONS = exports.TriageResultSchema = exports.TriageRequestSchema = exports.VitalSignsSchema = exports.SymptomSchema = exports.DifferentialDiagnosisSchema = exports.CarePathwaySchema = exports.TriageUrgencySchema = void 0;
const zod_1 = require("zod");
// Triage urgency levels
exports.TriageUrgencySchema = zod_1.z.enum(['EMERGENT', 'URGENT', 'SEMI_URGENT', 'ROUTINE']);
// Care pathways
exports.CarePathwaySchema = zod_1.z.enum(['ED', 'URGENT_CARE', 'PRIMARY_CARE', 'TELEHEALTH', 'HOME_CARE']);
// Differential diagnosis
exports.DifferentialDiagnosisSchema = zod_1.z.object({
    condition: zod_1.z.string(),
    icd10: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    severity: zod_1.z.enum(['mild', 'moderate', 'severe', 'critical']).optional(),
    supporting_evidence: zod_1.z.array(zod_1.z.string()).optional(),
    red_flags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Symptom extraction
exports.SymptomSchema = zod_1.z.object({
    description: zod_1.z.string(),
    duration: zod_1.z.string().optional(),
    severity: zod_1.z.enum(['mild', 'moderate', 'severe']).optional(),
    onset: zod_1.z.enum(['sudden', 'gradual', 'unknown']).optional(),
    location: zod_1.z.string().optional(),
    radiation: zod_1.z.string().optional(),
    associated_symptoms: zod_1.z.array(zod_1.z.string()).optional(),
    aggravating_factors: zod_1.z.array(zod_1.z.string()).optional(),
    relieving_factors: zod_1.z.array(zod_1.z.string()).optional(),
});
// Vital signs
exports.VitalSignsSchema = zod_1.z.object({
    blood_pressure_systolic: zod_1.z.number().optional(),
    blood_pressure_diastolic: zod_1.z.number().optional(),
    heart_rate: zod_1.z.number().optional(),
    respiratory_rate: zod_1.z.number().optional(),
    temperature: zod_1.z.number().optional(),
    oxygen_saturation: zod_1.z.number().optional(),
    pain_scale: zod_1.z.number().min(0).max(10).optional(),
    blood_glucose: zod_1.z.number().optional(),
});
// Triage request
exports.TriageRequestSchema = zod_1.z.object({
    patient_id: zod_1.z.string(),
    symptoms: zod_1.z.array(exports.SymptomSchema),
    vital_signs: exports.VitalSignsSchema.optional(),
    medical_history: zod_1.z.array(zod_1.z.string()).optional(),
    medications: zod_1.z.array(zod_1.z.string()).optional(),
    allergies: zod_1.z.array(zod_1.z.string()).optional(),
    context: zod_1.z.object({
        encounter_id: zod_1.z.string().optional(),
        reported_by: zod_1.z.enum(['patient', 'caregiver', 'provider', 'system']),
        timestamp: zod_1.z.string(),
        location: zod_1.z.string().optional(), // home, clinic, hospital, etc.
    }).optional(),
});
// Triage result
exports.TriageResultSchema = zod_1.z.object({
    urgency: exports.TriageUrgencySchema,
    suggested_pathway: exports.CarePathwaySchema,
    differential: zod_1.z.array(exports.DifferentialDiagnosisSchema),
    red_flags: zod_1.z.array(zod_1.z.string()),
    reasoning: zod_1.z.string(),
    recommendations: zod_1.z.array(zod_1.z.string()),
    follow_up_required: zod_1.z.boolean(),
    time_frame: zod_1.z.string().optional(), // "immediate", "within 1 hour", "within 24 hours", etc.
    confidence_score: zod_1.z.number().min(0).max(1),
    requires_immediate_attention: zod_1.z.boolean(),
    suggested_actions: zod_1.z.array(zod_1.z.string()).optional(),
    contraindications: zod_1.z.array(zod_1.z.string()).optional(),
});
// Red flag definitions
exports.RED_FLAG_DEFINITIONS = {
    CHEST_PAIN: {
        symptoms: ['chest pain', 'chest pressure', 'chest tightness'],
        red_flags: ['radiating to arm/jaw', 'shortness of breath', 'diaphoresis', 'nausea', 'dizziness'],
        urgency: 'EMERGENT',
        pathway: 'ED',
        reasoning: 'Chest pain with radiation and systemic symptoms suggests potential cardiac emergency',
    },
    NEUROLOGICAL: {
        symptoms: ['headache', 'confusion', 'weakness', 'numbness', 'vision changes', 'speech difficulty'],
        red_flags: ['sudden onset', 'severe headache', 'focal neurological deficit', 'altered mental status'],
        urgency: 'EMERGENT',
        pathway: 'ED',
        reasoning: 'Acute neurological symptoms suggest potential stroke or intracranial pathology',
    },
    RESPIRATORY: {
        symptoms: ['shortness of breath', 'difficulty breathing', 'wheezing', 'cough'],
        red_flags: ['severe distress', 'low oxygen saturation', 'stridor', 'rapid onset'],
        urgency: 'EMERGENT',
        pathway: 'ED',
        reasoning: 'Respiratory distress requires immediate evaluation and intervention',
    },
    ABDOMINAL: {
        symptoms: ['abdominal pain', 'abdominal distension', 'vomiting', 'diarrhea'],
        red_flags: ['severe pain', 'rigid abdomen', 'fever', 'hypotension', 'blood in vomit/stool'],
        urgency: 'EMERGENT',
        pathway: 'ED',
        reasoning: 'Acute abdominal pain with peritoneal signs suggests surgical emergency',
    },
    PSYCHIATRIC: {
        symptoms: ['anxiety', 'depression', 'panic', 'agitation'],
        red_flags: ['suicidal ideation', 'homicidal ideation', 'psychosis', 'severe agitation'],
        urgency: 'EMERGENT',
        pathway: 'ED',
        reasoning: 'Psychiatric emergencies require immediate safety assessment',
    },
};
// Symptom to urgency mapping
exports.SYMPTOM_URGENCY_MAP = {
    // Emergent symptoms
    'chest pain': 'EMERGENT',
    'chest pressure': 'EMERGENT',
    'shortness of breath': 'EMERGENT',
    'difficulty breathing': 'EMERGENT',
    'severe bleeding': 'EMERGENT',
    'loss of consciousness': 'EMERGENT',
    'seizure': 'EMERGENT',
    'stroke symptoms': 'EMERGENT',
    'head injury': 'EMERGENT',
    'suicidal thoughts': 'EMERGENT',
    // Urgent symptoms
    'high fever': 'URGENT',
    'severe pain': 'URGENT',
    'vomiting blood': 'URGENT',
    'acute confusion': 'URGENT',
    'moderate bleeding': 'URGENT',
    // Semi-urgent symptoms
    'moderate pain': 'SEMI_URGENT',
    'persistent cough': 'SEMI_URGENT',
    'diarrhea': 'SEMI_URGENT',
    'moderate fever': 'SEMI_URGENT',
    // Routine symptoms
    'mild pain': 'ROUTINE',
    'cold symptoms': 'ROUTINE',
    'mild headache': 'ROUTINE',
    'medication refill': 'ROUTINE',
};
// ICD-10 code mappings for common conditions
exports.ICD10_MAPPINGS = {
    'chest pain': {
        'Acute Myocardial Infarction': 'I21.9',
        'Unstable Angina': 'I20.0',
        'Chest Pain, Unspecified': 'R07.9',
        'Gastroesophageal Reflux': 'K21.9',
        'Pleurisy': 'R09.1',
    },
    'headache': {
        'Migraine': 'G43.9',
        'Tension Headache': 'G44.2',
        'Cluster Headache': 'G44.0',
        'Headache, Unspecified': 'R51',
    },
    'abdominal pain': {
        'Acute Appendicitis': 'K35.9',
        'Gastroenteritis': 'K52.9',
        'Kidney Stone': 'N20.9',
        'Abdominal Pain, Unspecified': 'R10.9',
    },
    'shortness of breath': {
        'Acute Respiratory Failure': 'J96.0',
        'Pneumonia': 'J18.9',
        'Pulmonary Embolism': 'I26.9',
        'Asthma': 'J45.9',
        'Shortness of Breath': 'R06.02',
    },
};
// Triage confidence thresholds
exports.CONFIDENCE_THRESHOLDS = {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4,
};
// Pathway time frames
exports.PATHWAY_TIME_FRAMES = {
    ED: 'immediate',
    URGENT_CARE: 'within 4 hours',
    PRIMARY_CARE: 'within 24-48 hours',
    TELEHEALTH: 'within 2-4 hours',
    HOME_CARE: 'within 24 hours',
};
//# sourceMappingURL=types.js.map