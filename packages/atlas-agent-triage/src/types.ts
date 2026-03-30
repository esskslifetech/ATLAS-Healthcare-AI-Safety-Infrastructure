import { z } from 'zod';

// Triage urgency levels
export const TriageUrgencySchema = z.enum(['EMERGENT', 'URGENT', 'SEMI_URGENT', 'ROUTINE']);
export type TriageUrgency = z.infer<typeof TriageUrgencySchema>;

// Care pathways
export const CarePathwaySchema = z.enum(['ED', 'URGENT_CARE', 'PRIMARY_CARE', 'TELEHEALTH', 'HOME_CARE']);
export type CarePathway = z.infer<typeof CarePathwaySchema>;

// Differential diagnosis
export const DifferentialDiagnosisSchema = z.object({
  condition: z.string(),
  icd10: z.string(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional(),
  supporting_evidence: z.array(z.string()).optional(),
  red_flags: z.array(z.string()).optional(),
});
export type DifferentialDiagnosis = z.infer<typeof DifferentialDiagnosisSchema>;

// Symptom extraction
export const SymptomSchema = z.object({
  description: z.string(),
  duration: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  onset: z.enum(['sudden', 'gradual', 'unknown']).optional(),
  location: z.string().optional(),
  radiation: z.string().optional(),
  associated_symptoms: z.array(z.string()).optional(),
  aggravating_factors: z.array(z.string()).optional(),
  relieving_factors: z.array(z.string()).optional(),
});
export type Symptom = z.infer<typeof SymptomSchema>;

// Vital signs
export const VitalSignsSchema = z.object({
  blood_pressure_systolic: z.number().optional(),
  blood_pressure_diastolic: z.number().optional(),
  heart_rate: z.number().optional(),
  respiratory_rate: z.number().optional(),
  temperature: z.number().optional(),
  oxygen_saturation: z.number().optional(),
  pain_scale: z.number().min(0).max(10).optional(),
  blood_glucose: z.number().optional(),
});
export type VitalSigns = z.infer<typeof VitalSignsSchema>;

// Triage request
export const TriageRequestSchema = z.object({
  patient_id: z.string(),
  symptoms: z.array(SymptomSchema),
  vital_signs: VitalSignsSchema.optional(),
  medical_history: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  context: z.object({
    encounter_id: z.string().optional(),
    reported_by: z.enum(['patient', 'caregiver', 'provider', 'system']),
    timestamp: z.string(),
    location: z.string().optional(), // home, clinic, hospital, etc.
  }).optional(),
});
export type TriageRequest = z.infer<typeof TriageRequestSchema>;

// Triage result
export const TriageResultSchema = z.object({
  urgency: TriageUrgencySchema,
  suggested_pathway: CarePathwaySchema,
  differential: z.array(DifferentialDiagnosisSchema),
  red_flags: z.array(z.string()),
  reasoning: z.string(),
  recommendations: z.array(z.string()),
  follow_up_required: z.boolean(),
  time_frame: z.string().optional(), // "immediate", "within 1 hour", "within 24 hours", etc.
  confidence_score: z.number().min(0).max(1),
  requires_immediate_attention: z.boolean(),
  suggested_actions: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
});
export type TriageResult = z.infer<typeof TriageResultSchema>;

// Red flag definitions
export const RED_FLAG_DEFINITIONS = {
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
} as const;

// Symptom to urgency mapping
export const SYMPTOM_URGENCY_MAP = {
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
} as const;

// ICD-10 code mappings for common conditions
export const ICD10_MAPPINGS = {
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
} as const;

// Triage confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
} as const;

// Pathway time frames
export const PATHWAY_TIME_FRAMES = {
  ED: 'immediate',
  URGENT_CARE: 'within 4 hours',
  PRIMARY_CARE: 'within 24-48 hours',
  TELEHEALTH: 'within 2-4 hours',
  HOME_CARE: 'within 24 hours',
} as const;
