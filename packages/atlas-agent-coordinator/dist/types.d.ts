import { z } from 'zod';
export declare const UrgencySchema: z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>;
export type Urgency = z.infer<typeof UrgencySchema>;
export declare const CareSessionStateSchema: z.ZodEnum<["INTAKE", "TRIAGE", "ROUTING", "MEDS", "COMPLETE", "ESCALATED", "CANCELLED"]>;
export type CareSessionState = z.infer<typeof CareSessionStateSchema>;
export declare const TimelineEventTypeSchema: z.ZodEnum<["SESSION_START", "SYMPTOM_REPORT", "CONSENT_VERIFIED", "TRIAGE_COMPLETED", "REFERRAL_INITIATED", "MEDICATION_CHECK", "PROVIDER_NOTIFIED", "PATIENT_NOTIFIED", "SESSION_COMPLETE", "SESSION_CANCELLED", "ESCALATION_TRIGGERED", "ERROR_OCCURRED", "AGENT_HANDOFF"]>;
export type TimelineEventType = z.infer<typeof TimelineEventTypeSchema>;
export declare const AgentHandoffStatusSchema: z.ZodEnum<["initiated", "in_progress", "completed", "failed"]>;
export type AgentHandoffStatus = z.infer<typeof AgentHandoffStatusSchema>;
export declare const CoordinationOutcomeSchema: z.ZodEnum<["SUCCESSFUL_TRIAGE", "EMERGENCY_ESCALATION", "REFERRAL_SCHEDULED", "SELF_CARE_ADVICE", "PROVIDER_CONSULTATION", "SYSTEM_ERROR", "PATIENT_DECLINED"]>;
export type CoordinationOutcome = z.infer<typeof CoordinationOutcomeSchema>;
export declare const IntegrationEventTypeSchema: z.ZodEnum<["FHIR_RESOURCE_CREATED", "CONSENT_VERIFIED", "IDENTITY_TOKEN_ACQUIRED", "AUDIT_LOG_CREATED", "AGENT_HANDOFF", "EXTERNAL_SYSTEM_CALLED", "NOTIFICATION_SENT", "WORKFLOW_COMPLETED"]>;
export type IntegrationEventType = z.infer<typeof IntegrationEventTypeSchema>;
export declare const TimelineEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    timestamp: z.ZodString;
    event_type: z.ZodEnum<["SESSION_START", "SYMPTOM_REPORT", "CONSENT_VERIFIED", "TRIAGE_COMPLETED", "REFERRAL_INITIATED", "MEDICATION_CHECK", "PROVIDER_NOTIFIED", "PATIENT_NOTIFIED", "SESSION_COMPLETE", "SESSION_CANCELLED", "ESCALATION_TRIGGERED", "ERROR_OCCURRED", "AGENT_HANDOFF"]>;
    agent: z.ZodString;
    description: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
    fhir_resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    event_id: string;
    timestamp: string;
    event_type: "SESSION_START" | "SYMPTOM_REPORT" | "CONSENT_VERIFIED" | "TRIAGE_COMPLETED" | "REFERRAL_INITIATED" | "MEDICATION_CHECK" | "PROVIDER_NOTIFIED" | "PATIENT_NOTIFIED" | "SESSION_COMPLETE" | "SESSION_CANCELLED" | "ESCALATION_TRIGGERED" | "ERROR_OCCURRED" | "AGENT_HANDOFF";
    agent: string;
    description: string;
    data?: any;
    fhir_resources?: string[] | undefined;
}, {
    event_id: string;
    timestamp: string;
    event_type: "SESSION_START" | "SYMPTOM_REPORT" | "CONSENT_VERIFIED" | "TRIAGE_COMPLETED" | "REFERRAL_INITIATED" | "MEDICATION_CHECK" | "PROVIDER_NOTIFIED" | "PATIENT_NOTIFIED" | "SESSION_COMPLETE" | "SESSION_CANCELLED" | "ESCALATION_TRIGGERED" | "ERROR_OCCURRED" | "AGENT_HANDOFF";
    agent: string;
    description: string;
    data?: any;
    fhir_resources?: string[] | undefined;
}>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export declare const AgentHandoffSchema: z.ZodObject<{
    handoff_id: z.ZodString;
    from_agent: z.ZodString;
    to_agent: z.ZodString;
    timestamp: z.ZodString;
    reason: z.ZodString;
    context: z.ZodObject<{
        patient_id: z.ZodString;
        session_id: z.ZodString;
        urgency: z.ZodOptional<z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>>;
        symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        clinical_data: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        patient_id: string;
        session_id: string;
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        clinical_data?: any;
    }, {
        patient_id: string;
        session_id: string;
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        clinical_data?: any;
    }>;
    status: z.ZodEnum<["initiated", "in_progress", "completed", "failed"]>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    status: "initiated" | "in_progress" | "completed" | "failed";
    handoff_id: string;
    from_agent: string;
    to_agent: string;
    reason: string;
    context: {
        patient_id: string;
        session_id: string;
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        clinical_data?: any;
    };
}, {
    timestamp: string;
    status: "initiated" | "in_progress" | "completed" | "failed";
    handoff_id: string;
    from_agent: string;
    to_agent: string;
    reason: string;
    context: {
        patient_id: string;
        session_id: string;
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        clinical_data?: any;
    };
}>;
export type AgentHandoff = z.infer<typeof AgentHandoffSchema>;
export declare const CareSessionSchema: z.ZodObject<{
    session_id: z.ZodString;
    patient_id: z.ZodString;
    state: z.ZodEnum<["INTAKE", "TRIAGE", "ROUTING", "MEDS", "COMPLETE", "ESCALATED", "CANCELLED"]>;
    timeline: z.ZodArray<z.ZodObject<{
        event_id: z.ZodString;
        timestamp: z.ZodString;
        event_type: z.ZodEnum<["SESSION_START", "SYMPTOM_REPORT", "CONSENT_VERIFIED", "TRIAGE_COMPLETED", "REFERRAL_INITIATED", "MEDICATION_CHECK", "PROVIDER_NOTIFIED", "PATIENT_NOTIFIED", "SESSION_COMPLETE", "SESSION_CANCELLED", "ESCALATION_TRIGGERED", "ERROR_OCCURRED", "AGENT_HANDOFF"]>;
        agent: z.ZodString;
        description: z.ZodString;
        data: z.ZodOptional<z.ZodAny>;
        fhir_resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        event_id: string;
        timestamp: string;
        event_type: "SESSION_START" | "SYMPTOM_REPORT" | "CONSENT_VERIFIED" | "TRIAGE_COMPLETED" | "REFERRAL_INITIATED" | "MEDICATION_CHECK" | "PROVIDER_NOTIFIED" | "PATIENT_NOTIFIED" | "SESSION_COMPLETE" | "SESSION_CANCELLED" | "ESCALATION_TRIGGERED" | "ERROR_OCCURRED" | "AGENT_HANDOFF";
        agent: string;
        description: string;
        data?: any;
        fhir_resources?: string[] | undefined;
    }, {
        event_id: string;
        timestamp: string;
        event_type: "SESSION_START" | "SYMPTOM_REPORT" | "CONSENT_VERIFIED" | "TRIAGE_COMPLETED" | "REFERRAL_INITIATED" | "MEDICATION_CHECK" | "PROVIDER_NOTIFIED" | "PATIENT_NOTIFIED" | "SESSION_COMPLETE" | "SESSION_CANCELLED" | "ESCALATION_TRIGGERED" | "ERROR_OCCURRED" | "AGENT_HANDOFF";
        agent: string;
        description: string;
        data?: any;
        fhir_resources?: string[] | undefined;
    }>, "many">;
    fhir_resources: z.ZodArray<z.ZodString, "many">;
    agent_handoffs: z.ZodArray<z.ZodObject<{
        handoff_id: z.ZodString;
        from_agent: z.ZodString;
        to_agent: z.ZodString;
        timestamp: z.ZodString;
        reason: z.ZodString;
        context: z.ZodObject<{
            patient_id: z.ZodString;
            session_id: z.ZodString;
            urgency: z.ZodOptional<z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>>;
            symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            clinical_data: z.ZodOptional<z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            patient_id: string;
            session_id: string;
            urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
            symptoms?: string[] | undefined;
            clinical_data?: any;
        }, {
            patient_id: string;
            session_id: string;
            urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
            symptoms?: string[] | undefined;
            clinical_data?: any;
        }>;
        status: z.ZodEnum<["initiated", "in_progress", "completed", "failed"]>;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        status: "initiated" | "in_progress" | "completed" | "failed";
        handoff_id: string;
        from_agent: string;
        to_agent: string;
        reason: string;
        context: {
            patient_id: string;
            session_id: string;
            urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
            symptoms?: string[] | undefined;
            clinical_data?: any;
        };
    }, {
        timestamp: string;
        status: "initiated" | "in_progress" | "completed" | "failed";
        handoff_id: string;
        from_agent: string;
        to_agent: string;
        reason: string;
        context: {
            patient_id: string;
            session_id: string;
            urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
            symptoms?: string[] | undefined;
            clinical_data?: any;
        };
    }>, "many">;
    consent_ref: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    completed_at: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodObject<{
        initial_symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        patientContext: z.ZodOptional<z.ZodObject<{
            age: z.ZodOptional<z.ZodNumber>;
            vitals: z.ZodOptional<z.ZodObject<{
                heartRate: z.ZodOptional<z.ZodNumber>;
                bloodPressure: z.ZodOptional<z.ZodObject<{
                    systolic: z.ZodOptional<z.ZodNumber>;
                    diastolic: z.ZodOptional<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                }, {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                }>>;
                temperature: z.ZodOptional<z.ZodNumber>;
                oxygenSaturation: z.ZodOptional<z.ZodNumber>;
                respiratoryRate: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            }, {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            }>>;
            medications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            medicalHistory: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            age?: number | undefined;
            vitals?: {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            } | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            medicalHistory?: string[] | undefined;
        }, {
            age?: number | undefined;
            vitals?: {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            } | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            medicalHistory?: string[] | undefined;
        }>>;
        triage_result: z.ZodOptional<z.ZodObject<{
            urgency: z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>;
            suggested_pathway: z.ZodEnum<["ED", "URGENT_CARE", "PRIMARY_CARE", "TELEHEALTH"]>;
            differential: z.ZodOptional<z.ZodArray<z.ZodObject<{
                condition: z.ZodString;
                icd10: z.ZodOptional<z.ZodString>;
                confidence: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }, {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }>, "many">>;
            red_flags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            reasoning: z.ZodOptional<z.ZodString>;
            confidence_score: z.ZodNumber;
            recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            requires_immediate_attention: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            confidence_score: number;
            differential?: {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }[] | undefined;
            red_flags?: string[] | undefined;
            reasoning?: string | undefined;
            recommendations?: string[] | undefined;
            requires_immediate_attention?: boolean | undefined;
        }, {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            confidence_score: number;
            differential?: {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }[] | undefined;
            red_flags?: string[] | undefined;
            reasoning?: string | undefined;
            recommendations?: string[] | undefined;
            requires_immediate_attention?: boolean | undefined;
        }>>;
        referral_details: z.ZodOptional<z.ZodObject<{
            specialist_type: z.ZodOptional<z.ZodString>;
            facility: z.ZodOptional<z.ZodString>;
            urgency: z.ZodOptional<z.ZodString>;
            appointment_scheduled: z.ZodOptional<z.ZodBoolean>;
            wait_time_minutes: z.ZodOptional<z.ZodNumber>;
            distance_miles: z.ZodOptional<z.ZodNumber>;
            insurance_accepted: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            urgency?: string | undefined;
            specialist_type?: string | undefined;
            facility?: string | undefined;
            appointment_scheduled?: boolean | undefined;
            wait_time_minutes?: number | undefined;
            distance_miles?: number | undefined;
            insurance_accepted?: boolean | undefined;
        }, {
            urgency?: string | undefined;
            specialist_type?: string | undefined;
            facility?: string | undefined;
            appointment_scheduled?: boolean | undefined;
            wait_time_minutes?: number | undefined;
            distance_miles?: number | undefined;
            insurance_accepted?: boolean | undefined;
        }>>;
        medication_check: z.ZodOptional<z.ZodObject<{
            interactions_found: z.ZodOptional<z.ZodBoolean>;
            contraindications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            current_medications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            recommendations?: string[] | undefined;
            interactions_found?: boolean | undefined;
            contraindications?: string[] | undefined;
            current_medications?: string[] | undefined;
        }, {
            recommendations?: string[] | undefined;
            interactions_found?: boolean | undefined;
            contraindications?: string[] | undefined;
            current_medications?: string[] | undefined;
        }>>;
        provider_notifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        patient_instructions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        escalation_reason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        initial_symptoms?: string[] | undefined;
        patientContext?: {
            age?: number | undefined;
            vitals?: {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            } | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            medicalHistory?: string[] | undefined;
        } | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            confidence_score: number;
            differential?: {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }[] | undefined;
            red_flags?: string[] | undefined;
            reasoning?: string | undefined;
            recommendations?: string[] | undefined;
            requires_immediate_attention?: boolean | undefined;
        } | undefined;
        referral_details?: {
            urgency?: string | undefined;
            specialist_type?: string | undefined;
            facility?: string | undefined;
            appointment_scheduled?: boolean | undefined;
            wait_time_minutes?: number | undefined;
            distance_miles?: number | undefined;
            insurance_accepted?: boolean | undefined;
        } | undefined;
        medication_check?: {
            recommendations?: string[] | undefined;
            interactions_found?: boolean | undefined;
            contraindications?: string[] | undefined;
            current_medications?: string[] | undefined;
        } | undefined;
        provider_notifications?: string[] | undefined;
        patient_instructions?: string[] | undefined;
        escalation_reason?: string | undefined;
    }, {
        initial_symptoms?: string[] | undefined;
        patientContext?: {
            age?: number | undefined;
            vitals?: {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            } | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            medicalHistory?: string[] | undefined;
        } | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            confidence_score: number;
            differential?: {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }[] | undefined;
            red_flags?: string[] | undefined;
            reasoning?: string | undefined;
            recommendations?: string[] | undefined;
            requires_immediate_attention?: boolean | undefined;
        } | undefined;
        referral_details?: {
            urgency?: string | undefined;
            specialist_type?: string | undefined;
            facility?: string | undefined;
            appointment_scheduled?: boolean | undefined;
            wait_time_minutes?: number | undefined;
            distance_miles?: number | undefined;
            insurance_accepted?: boolean | undefined;
        } | undefined;
        medication_check?: {
            recommendations?: string[] | undefined;
            interactions_found?: boolean | undefined;
            contraindications?: string[] | undefined;
            current_medications?: string[] | undefined;
        } | undefined;
        provider_notifications?: string[] | undefined;
        patient_instructions?: string[] | undefined;
        escalation_reason?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    fhir_resources: string[];
    patient_id: string;
    session_id: string;
    state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    timeline: {
        event_id: string;
        timestamp: string;
        event_type: "SESSION_START" | "SYMPTOM_REPORT" | "CONSENT_VERIFIED" | "TRIAGE_COMPLETED" | "REFERRAL_INITIATED" | "MEDICATION_CHECK" | "PROVIDER_NOTIFIED" | "PATIENT_NOTIFIED" | "SESSION_COMPLETE" | "SESSION_CANCELLED" | "ESCALATION_TRIGGERED" | "ERROR_OCCURRED" | "AGENT_HANDOFF";
        agent: string;
        description: string;
        data?: any;
        fhir_resources?: string[] | undefined;
    }[];
    agent_handoffs: {
        timestamp: string;
        status: "initiated" | "in_progress" | "completed" | "failed";
        handoff_id: string;
        from_agent: string;
        to_agent: string;
        reason: string;
        context: {
            patient_id: string;
            session_id: string;
            urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
            symptoms?: string[] | undefined;
            clinical_data?: any;
        };
    }[];
    consent_ref: string;
    created_at: string;
    updated_at: string;
    completed_at?: string | undefined;
    metadata?: {
        initial_symptoms?: string[] | undefined;
        patientContext?: {
            age?: number | undefined;
            vitals?: {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            } | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            medicalHistory?: string[] | undefined;
        } | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            confidence_score: number;
            differential?: {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }[] | undefined;
            red_flags?: string[] | undefined;
            reasoning?: string | undefined;
            recommendations?: string[] | undefined;
            requires_immediate_attention?: boolean | undefined;
        } | undefined;
        referral_details?: {
            urgency?: string | undefined;
            specialist_type?: string | undefined;
            facility?: string | undefined;
            appointment_scheduled?: boolean | undefined;
            wait_time_minutes?: number | undefined;
            distance_miles?: number | undefined;
            insurance_accepted?: boolean | undefined;
        } | undefined;
        medication_check?: {
            recommendations?: string[] | undefined;
            interactions_found?: boolean | undefined;
            contraindications?: string[] | undefined;
            current_medications?: string[] | undefined;
        } | undefined;
        provider_notifications?: string[] | undefined;
        patient_instructions?: string[] | undefined;
        escalation_reason?: string | undefined;
    } | undefined;
}, {
    fhir_resources: string[];
    patient_id: string;
    session_id: string;
    state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    timeline: {
        event_id: string;
        timestamp: string;
        event_type: "SESSION_START" | "SYMPTOM_REPORT" | "CONSENT_VERIFIED" | "TRIAGE_COMPLETED" | "REFERRAL_INITIATED" | "MEDICATION_CHECK" | "PROVIDER_NOTIFIED" | "PATIENT_NOTIFIED" | "SESSION_COMPLETE" | "SESSION_CANCELLED" | "ESCALATION_TRIGGERED" | "ERROR_OCCURRED" | "AGENT_HANDOFF";
        agent: string;
        description: string;
        data?: any;
        fhir_resources?: string[] | undefined;
    }[];
    agent_handoffs: {
        timestamp: string;
        status: "initiated" | "in_progress" | "completed" | "failed";
        handoff_id: string;
        from_agent: string;
        to_agent: string;
        reason: string;
        context: {
            patient_id: string;
            session_id: string;
            urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
            symptoms?: string[] | undefined;
            clinical_data?: any;
        };
    }[];
    consent_ref: string;
    created_at: string;
    updated_at: string;
    completed_at?: string | undefined;
    metadata?: {
        initial_symptoms?: string[] | undefined;
        patientContext?: {
            age?: number | undefined;
            vitals?: {
                heartRate?: number | undefined;
                bloodPressure?: {
                    systolic?: number | undefined;
                    diastolic?: number | undefined;
                } | undefined;
                temperature?: number | undefined;
                oxygenSaturation?: number | undefined;
                respiratoryRate?: number | undefined;
            } | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            medicalHistory?: string[] | undefined;
        } | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            confidence_score: number;
            differential?: {
                condition: string;
                confidence: number;
                icd10?: string | undefined;
            }[] | undefined;
            red_flags?: string[] | undefined;
            reasoning?: string | undefined;
            recommendations?: string[] | undefined;
            requires_immediate_attention?: boolean | undefined;
        } | undefined;
        referral_details?: {
            urgency?: string | undefined;
            specialist_type?: string | undefined;
            facility?: string | undefined;
            appointment_scheduled?: boolean | undefined;
            wait_time_minutes?: number | undefined;
            distance_miles?: number | undefined;
            insurance_accepted?: boolean | undefined;
        } | undefined;
        medication_check?: {
            recommendations?: string[] | undefined;
            interactions_found?: boolean | undefined;
            contraindications?: string[] | undefined;
            current_medications?: string[] | undefined;
        } | undefined;
        provider_notifications?: string[] | undefined;
        patient_instructions?: string[] | undefined;
        escalation_reason?: string | undefined;
    } | undefined;
}>;
export type CareSession = z.infer<typeof CareSessionSchema>;
export declare const CoordinationRequestSchema: z.ZodObject<{
    request_id: z.ZodOptional<z.ZodString>;
    patient_id: z.ZodString;
    trigger: z.ZodEnum<["PATIENT_INITIATED", "PROVIDER_INITIATED", "SYSTEM_ALERT", "SCHEDULED_CHECKIN", "FOLLOW_UP"]>;
    initial_data: z.ZodObject<{
        symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        chief_complaint: z.ZodOptional<z.ZodString>;
        urgency: z.ZodOptional<z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>>;
        channel: z.ZodOptional<z.ZodEnum<["chat", "phone", "in_person", "portal"]>>;
        encounter_id: z.ZodOptional<z.ZodString>;
        provider_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        chief_complaint?: string | undefined;
        channel?: "chat" | "phone" | "in_person" | "portal" | undefined;
        encounter_id?: string | undefined;
        provider_id?: string | undefined;
    }, {
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        chief_complaint?: string | undefined;
        channel?: "chat" | "phone" | "in_person" | "portal" | undefined;
        encounter_id?: string | undefined;
        provider_id?: string | undefined;
    }>;
    context: z.ZodOptional<z.ZodObject<{
        time_of_day: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        available_resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        insurance_info: z.ZodOptional<z.ZodString>;
        preferences: z.ZodOptional<z.ZodObject<{
            language: z.ZodOptional<z.ZodString>;
            provider: z.ZodOptional<z.ZodString>;
            facility: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            facility?: string | undefined;
            language?: string | undefined;
            provider?: string | undefined;
        }, {
            facility?: string | undefined;
            language?: string | undefined;
            provider?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        time_of_day?: string | undefined;
        location?: string | undefined;
        available_resources?: string[] | undefined;
        insurance_info?: string | undefined;
        preferences?: {
            facility?: string | undefined;
            language?: string | undefined;
            provider?: string | undefined;
        } | undefined;
    }, {
        time_of_day?: string | undefined;
        location?: string | undefined;
        available_resources?: string[] | undefined;
        insurance_info?: string | undefined;
        preferences?: {
            facility?: string | undefined;
            language?: string | undefined;
            provider?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    trigger: "PATIENT_INITIATED" | "PROVIDER_INITIATED" | "SYSTEM_ALERT" | "SCHEDULED_CHECKIN" | "FOLLOW_UP";
    initial_data: {
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        chief_complaint?: string | undefined;
        channel?: "chat" | "phone" | "in_person" | "portal" | undefined;
        encounter_id?: string | undefined;
        provider_id?: string | undefined;
    };
    context?: {
        time_of_day?: string | undefined;
        location?: string | undefined;
        available_resources?: string[] | undefined;
        insurance_info?: string | undefined;
        preferences?: {
            facility?: string | undefined;
            language?: string | undefined;
            provider?: string | undefined;
        } | undefined;
    } | undefined;
    request_id?: string | undefined;
}, {
    patient_id: string;
    trigger: "PATIENT_INITIATED" | "PROVIDER_INITIATED" | "SYSTEM_ALERT" | "SCHEDULED_CHECKIN" | "FOLLOW_UP";
    initial_data: {
        urgency?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms?: string[] | undefined;
        chief_complaint?: string | undefined;
        channel?: "chat" | "phone" | "in_person" | "portal" | undefined;
        encounter_id?: string | undefined;
        provider_id?: string | undefined;
    };
    context?: {
        time_of_day?: string | undefined;
        location?: string | undefined;
        available_resources?: string[] | undefined;
        insurance_info?: string | undefined;
        preferences?: {
            facility?: string | undefined;
            language?: string | undefined;
            provider?: string | undefined;
        } | undefined;
    } | undefined;
    request_id?: string | undefined;
}>;
export type CoordinationRequest = z.infer<typeof CoordinationRequestSchema>;
export declare const CoordinationResultSchema: z.ZodObject<{
    request_id: z.ZodString;
    session_id: z.ZodString;
    final_state: z.ZodEnum<["INTAKE", "TRIAGE", "ROUTING", "MEDS", "COMPLETE", "ESCALATED", "CANCELLED"]>;
    outcome: z.ZodEnum<["SUCCESSFUL_TRIAGE", "EMERGENCY_ESCALATION", "REFERRAL_SCHEDULED", "SELF_CARE_ADVICE", "PROVIDER_CONSULTATION", "SYSTEM_ERROR", "PATIENT_DECLINED"]>;
    summary: z.ZodString;
    recommendations: z.ZodArray<z.ZodString, "many">;
    follow_up_actions: z.ZodArray<z.ZodString, "many">;
    fhir_resources_created: z.ZodArray<z.ZodString, "many">;
    providers_notified: z.ZodArray<z.ZodString, "many">;
    patient_instructions: z.ZodArray<z.ZodString, "many">;
    next_steps: z.ZodArray<z.ZodString, "many">;
    completion_time: z.ZodString;
    confidence_score: z.ZodNumber;
    requires_human_review: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    session_id: string;
    confidence_score: number;
    recommendations: string[];
    patient_instructions: string[];
    request_id: string;
    final_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    outcome: "SUCCESSFUL_TRIAGE" | "EMERGENCY_ESCALATION" | "REFERRAL_SCHEDULED" | "SELF_CARE_ADVICE" | "PROVIDER_CONSULTATION" | "SYSTEM_ERROR" | "PATIENT_DECLINED";
    summary: string;
    follow_up_actions: string[];
    fhir_resources_created: string[];
    providers_notified: string[];
    next_steps: string[];
    completion_time: string;
    requires_human_review: boolean;
}, {
    session_id: string;
    confidence_score: number;
    recommendations: string[];
    patient_instructions: string[];
    request_id: string;
    final_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    outcome: "SUCCESSFUL_TRIAGE" | "EMERGENCY_ESCALATION" | "REFERRAL_SCHEDULED" | "SELF_CARE_ADVICE" | "PROVIDER_CONSULTATION" | "SYSTEM_ERROR" | "PATIENT_DECLINED";
    summary: string;
    follow_up_actions: string[];
    fhir_resources_created: string[];
    providers_notified: string[];
    next_steps: string[];
    completion_time: string;
    requires_human_review: boolean;
}>;
export type CoordinationResult = z.infer<typeof CoordinationResultSchema>;
export declare const AgentCapabilitiesSchema: z.ZodObject<{
    agent_id: z.ZodString;
    agent_name: z.ZodString;
    capabilities: z.ZodArray<z.ZodString, "many">;
    supported_urgencies: z.ZodArray<z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>, "many">;
    supported_symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requires_consent: z.ZodDefault<z.ZodBoolean>;
    average_processing_time: z.ZodOptional<z.ZodNumber>;
    success_rate: z.ZodOptional<z.ZodNumber>;
    availability: z.ZodOptional<z.ZodObject<{
        available: z.ZodBoolean;
        current_load: z.ZodOptional<z.ZodNumber>;
        max_capacity: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        available: boolean;
        current_load?: number | undefined;
        max_capacity?: number | undefined;
    }, {
        available: boolean;
        current_load?: number | undefined;
        max_capacity?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    agent_id: string;
    agent_name: string;
    capabilities: string[];
    supported_urgencies: ("EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE")[];
    requires_consent: boolean;
    supported_symptoms?: string[] | undefined;
    average_processing_time?: number | undefined;
    success_rate?: number | undefined;
    availability?: {
        available: boolean;
        current_load?: number | undefined;
        max_capacity?: number | undefined;
    } | undefined;
}, {
    agent_id: string;
    agent_name: string;
    capabilities: string[];
    supported_urgencies: ("EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE")[];
    supported_symptoms?: string[] | undefined;
    requires_consent?: boolean | undefined;
    average_processing_time?: number | undefined;
    success_rate?: number | undefined;
    availability?: {
        available: boolean;
        current_load?: number | undefined;
        max_capacity?: number | undefined;
    } | undefined;
}>;
export type AgentCapabilities = z.infer<typeof AgentCapabilitiesSchema>;
export declare const WorkflowStepSchema: z.ZodObject<{
    step_id: z.ZodString;
    step_name: z.ZodString;
    agent: z.ZodString;
    required_state: z.ZodEnum<["INTAKE", "TRIAGE", "ROUTING", "MEDS", "COMPLETE", "ESCALATED", "CANCELLED"]>;
    next_states: z.ZodArray<z.ZodEnum<["INTAKE", "TRIAGE", "ROUTING", "MEDS", "COMPLETE", "ESCALATED", "CANCELLED"]>, "many">;
    conditions: z.ZodOptional<z.ZodObject<{
        urgency_required: z.ZodOptional<z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>>;
        symptoms_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        data_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        consent_required: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        urgency_required?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms_required?: string[] | undefined;
        data_required?: string[] | undefined;
        consent_required?: boolean | undefined;
    }, {
        urgency_required?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms_required?: string[] | undefined;
        data_required?: string[] | undefined;
        consent_required?: boolean | undefined;
    }>>;
    timeout_seconds: z.ZodOptional<z.ZodNumber>;
    retry_attempts: z.ZodDefault<z.ZodNumber>;
    fallback_agent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    agent: string;
    step_id: string;
    step_name: string;
    required_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    next_states: ("INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED")[];
    retry_attempts: number;
    conditions?: {
        urgency_required?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms_required?: string[] | undefined;
        data_required?: string[] | undefined;
        consent_required?: boolean | undefined;
    } | undefined;
    timeout_seconds?: number | undefined;
    fallback_agent?: string | undefined;
}, {
    agent: string;
    step_id: string;
    step_name: string;
    required_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    next_states: ("INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED")[];
    conditions?: {
        urgency_required?: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE" | undefined;
        symptoms_required?: string[] | undefined;
        data_required?: string[] | undefined;
        consent_required?: boolean | undefined;
    } | undefined;
    timeout_seconds?: number | undefined;
    retry_attempts?: number | undefined;
    fallback_agent?: string | undefined;
}>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export declare const StateTransitionSchema: z.ZodObject<{
    from_state: z.ZodEnum<["INTAKE", "TRIAGE", "ROUTING", "MEDS", "COMPLETE", "ESCALATED", "CANCELLED"]>;
    to_state: z.ZodEnum<["INTAKE", "TRIAGE", "ROUTING", "MEDS", "COMPLETE", "ESCALATED", "CANCELLED"]>;
    trigger: z.ZodString;
    agent: z.ZodString;
    conditions_met: z.ZodBoolean;
    timestamp: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    agent: string;
    reason: string;
    trigger: string;
    from_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    to_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    conditions_met: boolean;
}, {
    timestamp: string;
    agent: string;
    reason: string;
    trigger: string;
    from_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    to_state: "INTAKE" | "TRIAGE" | "ROUTING" | "MEDS" | "COMPLETE" | "ESCALATED" | "CANCELLED";
    conditions_met: boolean;
}>;
export type StateTransition = z.infer<typeof StateTransitionSchema>;
export declare const DecisionPointSchema: z.ZodObject<{
    decision_id: z.ZodString;
    session_id: z.ZodString;
    decision_type: z.ZodEnum<["URGENCY_ASSESSMENT", "CARE_PATHWAY_SELECTION", "SPECIALIST_MATCHING", "MEDICATION_REVIEW", "ESCALATION_DETERMINATION", "COMPLETION_CRITERIA"]>;
    options: z.ZodArray<z.ZodObject<{
        option: z.ZodString;
        probability: z.ZodNumber;
        reasoning: z.ZodString;
        agent_responsible: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reasoning: string;
        option: string;
        probability: number;
        agent_responsible: string;
    }, {
        reasoning: string;
        option: string;
        probability: number;
        agent_responsible: string;
    }>, "many">;
    selected_option: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodString;
    resolved: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    options: {
        reasoning: string;
        option: string;
        probability: number;
        agent_responsible: string;
    }[];
    session_id: string;
    decision_id: string;
    decision_type: "URGENCY_ASSESSMENT" | "CARE_PATHWAY_SELECTION" | "SPECIALIST_MATCHING" | "MEDICATION_REVIEW" | "ESCALATION_DETERMINATION" | "COMPLETION_CRITERIA";
    resolved: boolean;
    confidence?: number | undefined;
    selected_option?: string | undefined;
}, {
    timestamp: string;
    options: {
        reasoning: string;
        option: string;
        probability: number;
        agent_responsible: string;
    }[];
    session_id: string;
    decision_id: string;
    decision_type: "URGENCY_ASSESSMENT" | "CARE_PATHWAY_SELECTION" | "SPECIALIST_MATCHING" | "MEDICATION_REVIEW" | "ESCALATION_DETERMINATION" | "COMPLETION_CRITERIA";
    confidence?: number | undefined;
    selected_option?: string | undefined;
    resolved?: boolean | undefined;
}>;
export type DecisionPoint = z.infer<typeof DecisionPointSchema>;
export declare const ResourceReferenceSchema: z.ZodObject<{
    resource_type: z.ZodString;
    resource_id: z.ZodString;
    reference: z.ZodString;
    created_by: z.ZodString;
    created_at: z.ZodString;
    purpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    created_at: string;
    resource_type: string;
    resource_id: string;
    reference: string;
    created_by: string;
    purpose: string;
}, {
    created_at: string;
    resource_type: string;
    resource_id: string;
    reference: string;
    created_by: string;
    purpose: string;
}>;
export type ResourceReference = z.infer<typeof ResourceReferenceSchema>;
export declare const PerformanceMetricsSchema: z.ZodObject<{
    session_id: z.ZodString;
    total_duration: z.ZodNumber;
    agent_durations: z.ZodRecord<z.ZodString, z.ZodNumber>;
    state_transitions: z.ZodNumber;
    decisions_made: z.ZodNumber;
    resources_created: z.ZodNumber;
    errors_encountered: z.ZodNumber;
    patient_satisfaction: z.ZodOptional<z.ZodNumber>;
    clinical_appropriateness: z.ZodOptional<z.ZodNumber>;
    cost_efficiency: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    session_id: string;
    total_duration: number;
    agent_durations: Record<string, number>;
    state_transitions: number;
    decisions_made: number;
    resources_created: number;
    errors_encountered: number;
    patient_satisfaction?: number | undefined;
    clinical_appropriateness?: number | undefined;
    cost_efficiency?: number | undefined;
}, {
    session_id: string;
    total_duration: number;
    agent_durations: Record<string, number>;
    state_transitions: number;
    decisions_made: number;
    resources_created: number;
    errors_encountered: number;
    patient_satisfaction?: number | undefined;
    clinical_appropriateness?: number | undefined;
    cost_efficiency?: number | undefined;
}>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export declare const IntegrationEventSchema: z.ZodObject<{
    event_id: z.ZodString;
    event_type: z.ZodEnum<["FHIR_RESOURCE_CREATED", "CONSENT_VERIFIED", "IDENTITY_TOKEN_ACQUIRED", "AUDIT_LOG_CREATED", "AGENT_HANDOFF", "EXTERNAL_SYSTEM_CALLED", "NOTIFICATION_SENT", "WORKFLOW_COMPLETED"]>;
    timestamp: z.ZodString;
    source_system: z.ZodString;
    target_system: z.ZodOptional<z.ZodString>;
    session_id: z.ZodString;
    patient_id: z.ZodString;
    data: z.ZodAny;
    success: z.ZodBoolean;
    error_message: z.ZodOptional<z.ZodString>;
    processing_time: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    event_id: string;
    timestamp: string;
    event_type: "CONSENT_VERIFIED" | "AGENT_HANDOFF" | "FHIR_RESOURCE_CREATED" | "IDENTITY_TOKEN_ACQUIRED" | "AUDIT_LOG_CREATED" | "EXTERNAL_SYSTEM_CALLED" | "NOTIFICATION_SENT" | "WORKFLOW_COMPLETED";
    patient_id: string;
    session_id: string;
    source_system: string;
    success: boolean;
    data?: any;
    target_system?: string | undefined;
    error_message?: string | undefined;
    processing_time?: number | undefined;
}, {
    event_id: string;
    timestamp: string;
    event_type: "CONSENT_VERIFIED" | "AGENT_HANDOFF" | "FHIR_RESOURCE_CREATED" | "IDENTITY_TOKEN_ACQUIRED" | "AUDIT_LOG_CREATED" | "EXTERNAL_SYSTEM_CALLED" | "NOTIFICATION_SENT" | "WORKFLOW_COMPLETED";
    patient_id: string;
    session_id: string;
    source_system: string;
    success: boolean;
    data?: any;
    target_system?: string | undefined;
    error_message?: string | undefined;
    processing_time?: number | undefined;
}>;
export type IntegrationEvent = z.infer<typeof IntegrationEventSchema>;
//# sourceMappingURL=types.d.ts.map