import { z } from 'zod';
export declare const TriageUrgencySchema: z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>;
export type TriageUrgency = z.infer<typeof TriageUrgencySchema>;
export declare const CarePathwaySchema: z.ZodEnum<["ED", "URGENT_CARE", "PRIMARY_CARE", "TELEHEALTH", "HOME_CARE"]>;
export type CarePathway = z.infer<typeof CarePathwaySchema>;
export declare const DifferentialDiagnosisSchema: z.ZodObject<{
    condition: z.ZodString;
    icd10: z.ZodString;
    confidence: z.ZodNumber;
    severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe", "critical"]>>;
    supporting_evidence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    red_flags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    condition: string;
    icd10: string;
    confidence: number;
    severity?: "mild" | "moderate" | "severe" | "critical" | undefined;
    supporting_evidence?: string[] | undefined;
    red_flags?: string[] | undefined;
}, {
    condition: string;
    icd10: string;
    confidence: number;
    severity?: "mild" | "moderate" | "severe" | "critical" | undefined;
    supporting_evidence?: string[] | undefined;
    red_flags?: string[] | undefined;
}>;
export type DifferentialDiagnosis = z.infer<typeof DifferentialDiagnosisSchema>;
export declare const SymptomSchema: z.ZodObject<{
    description: z.ZodString;
    duration: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe"]>>;
    onset: z.ZodOptional<z.ZodEnum<["sudden", "gradual", "unknown"]>>;
    location: z.ZodOptional<z.ZodString>;
    radiation: z.ZodOptional<z.ZodString>;
    associated_symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    aggravating_factors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    relieving_factors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    severity?: "mild" | "moderate" | "severe" | undefined;
    duration?: string | undefined;
    onset?: "sudden" | "gradual" | "unknown" | undefined;
    location?: string | undefined;
    radiation?: string | undefined;
    associated_symptoms?: string[] | undefined;
    aggravating_factors?: string[] | undefined;
    relieving_factors?: string[] | undefined;
}, {
    description: string;
    severity?: "mild" | "moderate" | "severe" | undefined;
    duration?: string | undefined;
    onset?: "sudden" | "gradual" | "unknown" | undefined;
    location?: string | undefined;
    radiation?: string | undefined;
    associated_symptoms?: string[] | undefined;
    aggravating_factors?: string[] | undefined;
    relieving_factors?: string[] | undefined;
}>;
export type Symptom = z.infer<typeof SymptomSchema>;
export declare const VitalSignsSchema: z.ZodObject<{
    blood_pressure_systolic: z.ZodOptional<z.ZodNumber>;
    blood_pressure_diastolic: z.ZodOptional<z.ZodNumber>;
    heart_rate: z.ZodOptional<z.ZodNumber>;
    respiratory_rate: z.ZodOptional<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNumber>;
    oxygen_saturation: z.ZodOptional<z.ZodNumber>;
    pain_scale: z.ZodOptional<z.ZodNumber>;
    blood_glucose: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    blood_pressure_systolic?: number | undefined;
    blood_pressure_diastolic?: number | undefined;
    heart_rate?: number | undefined;
    respiratory_rate?: number | undefined;
    temperature?: number | undefined;
    oxygen_saturation?: number | undefined;
    pain_scale?: number | undefined;
    blood_glucose?: number | undefined;
}, {
    blood_pressure_systolic?: number | undefined;
    blood_pressure_diastolic?: number | undefined;
    heart_rate?: number | undefined;
    respiratory_rate?: number | undefined;
    temperature?: number | undefined;
    oxygen_saturation?: number | undefined;
    pain_scale?: number | undefined;
    blood_glucose?: number | undefined;
}>;
export type VitalSigns = z.infer<typeof VitalSignsSchema>;
export declare const TriageRequestSchema: z.ZodObject<{
    patient_id: z.ZodString;
    symptoms: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        duration: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe"]>>;
        onset: z.ZodOptional<z.ZodEnum<["sudden", "gradual", "unknown"]>>;
        location: z.ZodOptional<z.ZodString>;
        radiation: z.ZodOptional<z.ZodString>;
        associated_symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        aggravating_factors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        relieving_factors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        severity?: "mild" | "moderate" | "severe" | undefined;
        duration?: string | undefined;
        onset?: "sudden" | "gradual" | "unknown" | undefined;
        location?: string | undefined;
        radiation?: string | undefined;
        associated_symptoms?: string[] | undefined;
        aggravating_factors?: string[] | undefined;
        relieving_factors?: string[] | undefined;
    }, {
        description: string;
        severity?: "mild" | "moderate" | "severe" | undefined;
        duration?: string | undefined;
        onset?: "sudden" | "gradual" | "unknown" | undefined;
        location?: string | undefined;
        radiation?: string | undefined;
        associated_symptoms?: string[] | undefined;
        aggravating_factors?: string[] | undefined;
        relieving_factors?: string[] | undefined;
    }>, "many">;
    vital_signs: z.ZodOptional<z.ZodObject<{
        blood_pressure_systolic: z.ZodOptional<z.ZodNumber>;
        blood_pressure_diastolic: z.ZodOptional<z.ZodNumber>;
        heart_rate: z.ZodOptional<z.ZodNumber>;
        respiratory_rate: z.ZodOptional<z.ZodNumber>;
        temperature: z.ZodOptional<z.ZodNumber>;
        oxygen_saturation: z.ZodOptional<z.ZodNumber>;
        pain_scale: z.ZodOptional<z.ZodNumber>;
        blood_glucose: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        respiratory_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
        blood_glucose?: number | undefined;
    }, {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        respiratory_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
        blood_glucose?: number | undefined;
    }>>;
    medical_history: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    medications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    context: z.ZodOptional<z.ZodObject<{
        encounter_id: z.ZodOptional<z.ZodString>;
        reported_by: z.ZodEnum<["patient", "caregiver", "provider", "system"]>;
        timestamp: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reported_by: "patient" | "caregiver" | "provider" | "system";
        timestamp: string;
        location?: string | undefined;
        encounter_id?: string | undefined;
    }, {
        reported_by: "patient" | "caregiver" | "provider" | "system";
        timestamp: string;
        location?: string | undefined;
        encounter_id?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    symptoms: {
        description: string;
        severity?: "mild" | "moderate" | "severe" | undefined;
        duration?: string | undefined;
        onset?: "sudden" | "gradual" | "unknown" | undefined;
        location?: string | undefined;
        radiation?: string | undefined;
        associated_symptoms?: string[] | undefined;
        aggravating_factors?: string[] | undefined;
        relieving_factors?: string[] | undefined;
    }[];
    vital_signs?: {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        respiratory_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
        blood_glucose?: number | undefined;
    } | undefined;
    medical_history?: string[] | undefined;
    medications?: string[] | undefined;
    allergies?: string[] | undefined;
    context?: {
        reported_by: "patient" | "caregiver" | "provider" | "system";
        timestamp: string;
        location?: string | undefined;
        encounter_id?: string | undefined;
    } | undefined;
}, {
    patient_id: string;
    symptoms: {
        description: string;
        severity?: "mild" | "moderate" | "severe" | undefined;
        duration?: string | undefined;
        onset?: "sudden" | "gradual" | "unknown" | undefined;
        location?: string | undefined;
        radiation?: string | undefined;
        associated_symptoms?: string[] | undefined;
        aggravating_factors?: string[] | undefined;
        relieving_factors?: string[] | undefined;
    }[];
    vital_signs?: {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        respiratory_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
        blood_glucose?: number | undefined;
    } | undefined;
    medical_history?: string[] | undefined;
    medications?: string[] | undefined;
    allergies?: string[] | undefined;
    context?: {
        reported_by: "patient" | "caregiver" | "provider" | "system";
        timestamp: string;
        location?: string | undefined;
        encounter_id?: string | undefined;
    } | undefined;
}>;
export type TriageRequest = z.infer<typeof TriageRequestSchema>;
export declare const TriageResultSchema: z.ZodObject<{
    urgency: z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>;
    suggested_pathway: z.ZodEnum<["ED", "URGENT_CARE", "PRIMARY_CARE", "TELEHEALTH", "HOME_CARE"]>;
    differential: z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        icd10: z.ZodString;
        confidence: z.ZodNumber;
        severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe", "critical"]>>;
        supporting_evidence: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        red_flags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        condition: string;
        icd10: string;
        confidence: number;
        severity?: "mild" | "moderate" | "severe" | "critical" | undefined;
        supporting_evidence?: string[] | undefined;
        red_flags?: string[] | undefined;
    }, {
        condition: string;
        icd10: string;
        confidence: number;
        severity?: "mild" | "moderate" | "severe" | "critical" | undefined;
        supporting_evidence?: string[] | undefined;
        red_flags?: string[] | undefined;
    }>, "many">;
    red_flags: z.ZodArray<z.ZodString, "many">;
    reasoning: z.ZodString;
    recommendations: z.ZodArray<z.ZodString, "many">;
    follow_up_required: z.ZodBoolean;
    time_frame: z.ZodOptional<z.ZodString>;
    confidence_score: z.ZodNumber;
    requires_immediate_attention: z.ZodBoolean;
    suggested_actions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    contraindications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    red_flags: string[];
    urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
    suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH" | "HOME_CARE";
    differential: {
        condition: string;
        icd10: string;
        confidence: number;
        severity?: "mild" | "moderate" | "severe" | "critical" | undefined;
        supporting_evidence?: string[] | undefined;
        red_flags?: string[] | undefined;
    }[];
    reasoning: string;
    recommendations: string[];
    follow_up_required: boolean;
    confidence_score: number;
    requires_immediate_attention: boolean;
    time_frame?: string | undefined;
    suggested_actions?: string[] | undefined;
    contraindications?: string[] | undefined;
}, {
    red_flags: string[];
    urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
    suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH" | "HOME_CARE";
    differential: {
        condition: string;
        icd10: string;
        confidence: number;
        severity?: "mild" | "moderate" | "severe" | "critical" | undefined;
        supporting_evidence?: string[] | undefined;
        red_flags?: string[] | undefined;
    }[];
    reasoning: string;
    recommendations: string[];
    follow_up_required: boolean;
    confidence_score: number;
    requires_immediate_attention: boolean;
    time_frame?: string | undefined;
    suggested_actions?: string[] | undefined;
    contraindications?: string[] | undefined;
}>;
export type TriageResult = z.infer<typeof TriageResultSchema>;
export declare const RED_FLAG_DEFINITIONS: {
    readonly CHEST_PAIN: {
        readonly symptoms: readonly ["chest pain", "chest pressure", "chest tightness"];
        readonly red_flags: readonly ["radiating to arm/jaw", "shortness of breath", "diaphoresis", "nausea", "dizziness"];
        readonly urgency: "EMERGENT";
        readonly pathway: "ED";
        readonly reasoning: "Chest pain with radiation and systemic symptoms suggests potential cardiac emergency";
    };
    readonly NEUROLOGICAL: {
        readonly symptoms: readonly ["headache", "confusion", "weakness", "numbness", "vision changes", "speech difficulty"];
        readonly red_flags: readonly ["sudden onset", "severe headache", "focal neurological deficit", "altered mental status"];
        readonly urgency: "EMERGENT";
        readonly pathway: "ED";
        readonly reasoning: "Acute neurological symptoms suggest potential stroke or intracranial pathology";
    };
    readonly RESPIRATORY: {
        readonly symptoms: readonly ["shortness of breath", "difficulty breathing", "wheezing", "cough"];
        readonly red_flags: readonly ["severe distress", "low oxygen saturation", "stridor", "rapid onset"];
        readonly urgency: "EMERGENT";
        readonly pathway: "ED";
        readonly reasoning: "Respiratory distress requires immediate evaluation and intervention";
    };
    readonly ABDOMINAL: {
        readonly symptoms: readonly ["abdominal pain", "abdominal distension", "vomiting", "diarrhea"];
        readonly red_flags: readonly ["severe pain", "rigid abdomen", "fever", "hypotension", "blood in vomit/stool"];
        readonly urgency: "EMERGENT";
        readonly pathway: "ED";
        readonly reasoning: "Acute abdominal pain with peritoneal signs suggests surgical emergency";
    };
    readonly PSYCHIATRIC: {
        readonly symptoms: readonly ["anxiety", "depression", "panic", "agitation"];
        readonly red_flags: readonly ["suicidal ideation", "homicidal ideation", "psychosis", "severe agitation"];
        readonly urgency: "EMERGENT";
        readonly pathway: "ED";
        readonly reasoning: "Psychiatric emergencies require immediate safety assessment";
    };
};
export declare const SYMPTOM_URGENCY_MAP: {
    readonly 'chest pain': "EMERGENT";
    readonly 'chest pressure': "EMERGENT";
    readonly 'shortness of breath': "EMERGENT";
    readonly 'difficulty breathing': "EMERGENT";
    readonly 'severe bleeding': "EMERGENT";
    readonly 'loss of consciousness': "EMERGENT";
    readonly seizure: "EMERGENT";
    readonly 'stroke symptoms': "EMERGENT";
    readonly 'head injury': "EMERGENT";
    readonly 'suicidal thoughts': "EMERGENT";
    readonly 'high fever': "URGENT";
    readonly 'severe pain': "URGENT";
    readonly 'vomiting blood': "URGENT";
    readonly 'acute confusion': "URGENT";
    readonly 'moderate bleeding': "URGENT";
    readonly 'moderate pain': "SEMI_URGENT";
    readonly 'persistent cough': "SEMI_URGENT";
    readonly diarrhea: "SEMI_URGENT";
    readonly 'moderate fever': "SEMI_URGENT";
    readonly 'mild pain': "ROUTINE";
    readonly 'cold symptoms': "ROUTINE";
    readonly 'mild headache': "ROUTINE";
    readonly 'medication refill': "ROUTINE";
};
export declare const ICD10_MAPPINGS: {
    readonly 'chest pain': {
        readonly 'Acute Myocardial Infarction': "I21.9";
        readonly 'Unstable Angina': "I20.0";
        readonly 'Chest Pain, Unspecified': "R07.9";
        readonly 'Gastroesophageal Reflux': "K21.9";
        readonly Pleurisy: "R09.1";
    };
    readonly headache: {
        readonly Migraine: "G43.9";
        readonly 'Tension Headache': "G44.2";
        readonly 'Cluster Headache': "G44.0";
        readonly 'Headache, Unspecified': "R51";
    };
    readonly 'abdominal pain': {
        readonly 'Acute Appendicitis': "K35.9";
        readonly Gastroenteritis: "K52.9";
        readonly 'Kidney Stone': "N20.9";
        readonly 'Abdominal Pain, Unspecified': "R10.9";
    };
    readonly 'shortness of breath': {
        readonly 'Acute Respiratory Failure': "J96.0";
        readonly Pneumonia: "J18.9";
        readonly 'Pulmonary Embolism': "I26.9";
        readonly Asthma: "J45.9";
        readonly 'Shortness of Breath': "R06.02";
    };
};
export declare const CONFIDENCE_THRESHOLDS: {
    readonly HIGH: 0.8;
    readonly MEDIUM: 0.6;
    readonly LOW: 0.4;
};
export declare const PATHWAY_TIME_FRAMES: {
    readonly ED: "immediate";
    readonly URGENT_CARE: "within 4 hours";
    readonly PRIMARY_CARE: "within 24-48 hours";
    readonly TELEHEALTH: "within 2-4 hours";
    readonly HOME_CARE: "within 24 hours";
};
//# sourceMappingURL=types.d.ts.map