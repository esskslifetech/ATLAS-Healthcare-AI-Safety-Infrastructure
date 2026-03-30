import { z } from 'zod';
export declare const MessageTypeSchema: z.ZodEnum<["text", "symptom_report", "vital_signs", "medication_list", "allergy_list", "medical_history", "appointment_request", "prescription_refill", "lab_results", "emergency_alert", "follow_up", "educational_content", "system_notification"]>;
export type MessageType = z.infer<typeof MessageTypeSchema>;
export declare const MessageDirectionSchema: z.ZodEnum<["incoming", "outgoing"]>;
export type MessageDirection = z.infer<typeof MessageDirectionSchema>;
export declare const ChannelSchema: z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>;
export type Channel = z.infer<typeof ChannelSchema>;
export declare const PatientMessageSchema: z.ZodObject<{
    id: z.ZodString;
    patient_id: z.ZodString;
    session_id: z.ZodString;
    message_type: z.ZodEnum<["text", "symptom_report", "vital_signs", "medication_list", "allergy_list", "medical_history", "appointment_request", "prescription_refill", "lab_results", "emergency_alert", "follow_up", "educational_content", "system_notification"]>;
    direction: z.ZodEnum<["incoming", "outgoing"]>;
    channel: z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>;
    content: z.ZodString;
    timestamp: z.ZodString;
    metadata: z.ZodOptional<z.ZodObject<{
        symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        vital_signs: z.ZodOptional<z.ZodObject<{
            blood_pressure_systolic: z.ZodOptional<z.ZodNumber>;
            blood_pressure_diastolic: z.ZodOptional<z.ZodNumber>;
            heart_rate: z.ZodOptional<z.ZodNumber>;
            temperature: z.ZodOptional<z.ZodNumber>;
            oxygen_saturation: z.ZodOptional<z.ZodNumber>;
            pain_scale: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            blood_pressure_systolic?: number | undefined;
            blood_pressure_diastolic?: number | undefined;
            heart_rate?: number | undefined;
            temperature?: number | undefined;
            oxygen_saturation?: number | undefined;
            pain_scale?: number | undefined;
        }, {
            blood_pressure_systolic?: number | undefined;
            blood_pressure_diastolic?: number | undefined;
            heart_rate?: number | undefined;
            temperature?: number | undefined;
            oxygen_saturation?: number | undefined;
            pain_scale?: number | undefined;
        }>>;
        medications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        urgency: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "emergency"]>>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            url: z.ZodString;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            url: string;
            filename: string;
        }, {
            type: string;
            url: string;
            filename: string;
        }>, "many">>;
        language: z.ZodDefault<z.ZodString>;
        sentiment: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative", "anxious", "frustrated"]>>;
    }, "strip", z.ZodTypeAny, {
        language: string;
        vital_signs?: {
            blood_pressure_systolic?: number | undefined;
            blood_pressure_diastolic?: number | undefined;
            heart_rate?: number | undefined;
            temperature?: number | undefined;
            oxygen_saturation?: number | undefined;
            pain_scale?: number | undefined;
        } | undefined;
        symptoms?: string[] | undefined;
        medications?: string[] | undefined;
        allergies?: string[] | undefined;
        urgency?: "low" | "medium" | "high" | "emergency" | undefined;
        attachments?: {
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
    }, {
        vital_signs?: {
            blood_pressure_systolic?: number | undefined;
            blood_pressure_diastolic?: number | undefined;
            heart_rate?: number | undefined;
            temperature?: number | undefined;
            oxygen_saturation?: number | undefined;
            pain_scale?: number | undefined;
        } | undefined;
        symptoms?: string[] | undefined;
        medications?: string[] | undefined;
        allergies?: string[] | undefined;
        urgency?: "low" | "medium" | "high" | "emergency" | undefined;
        attachments?: {
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        language?: string | undefined;
        sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    patient_id: string;
    session_id: string;
    message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
    direction: "incoming" | "outgoing";
    channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
    content: string;
    timestamp: string;
    metadata?: {
        language: string;
        vital_signs?: {
            blood_pressure_systolic?: number | undefined;
            blood_pressure_diastolic?: number | undefined;
            heart_rate?: number | undefined;
            temperature?: number | undefined;
            oxygen_saturation?: number | undefined;
            pain_scale?: number | undefined;
        } | undefined;
        symptoms?: string[] | undefined;
        medications?: string[] | undefined;
        allergies?: string[] | undefined;
        urgency?: "low" | "medium" | "high" | "emergency" | undefined;
        attachments?: {
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
    } | undefined;
}, {
    id: string;
    patient_id: string;
    session_id: string;
    message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
    direction: "incoming" | "outgoing";
    channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
    content: string;
    timestamp: string;
    metadata?: {
        vital_signs?: {
            blood_pressure_systolic?: number | undefined;
            blood_pressure_diastolic?: number | undefined;
            heart_rate?: number | undefined;
            temperature?: number | undefined;
            oxygen_saturation?: number | undefined;
            pain_scale?: number | undefined;
        } | undefined;
        symptoms?: string[] | undefined;
        medications?: string[] | undefined;
        allergies?: string[] | undefined;
        urgency?: "low" | "medium" | "high" | "emergency" | undefined;
        attachments?: {
            type: string;
            url: string;
            filename: string;
        }[] | undefined;
        language?: string | undefined;
        sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
    } | undefined;
}>;
export type PatientMessage = z.infer<typeof PatientMessageSchema>;
export declare const AgentResponseSchema: z.ZodObject<{
    id: z.ZodString;
    session_id: z.ZodString;
    message_type: z.ZodEnum<["text", "symptom_report", "vital_signs", "medication_list", "allergy_list", "medical_history", "appointment_request", "prescription_refill", "lab_results", "emergency_alert", "follow_up", "educational_content", "system_notification"]>;
    channel: z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>;
    content: z.ZodString;
    timestamp: z.ZodString;
    metadata: z.ZodOptional<z.ZodObject<{
        response_type: z.ZodEnum<["informational", "clarification", "recommendation", "emergency", "educational"]>;
        triage_result: z.ZodOptional<z.ZodObject<{
            urgency: z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>;
            suggested_pathway: z.ZodEnum<["ED", "URGENT_CARE", "PRIMARY_CARE", "TELEHEALTH"]>;
            red_flags: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            red_flags: string[];
        }, {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            red_flags: string[];
        }>>;
        next_steps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        follow_up_required: z.ZodOptional<z.ZodBoolean>;
        escalation_triggered: z.ZodOptional<z.ZodBoolean>;
        consent_required: z.ZodOptional<z.ZodBoolean>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            content: z.ZodString;
            filename: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            content: string;
            filename: string;
        }, {
            type: string;
            content: string;
            filename: string;
        }>, "many">>;
        language: z.ZodDefault<z.ZodString>;
        reading_level: z.ZodDefault<z.ZodEnum<["basic", "intermediate", "advanced"]>>;
    }, "strip", z.ZodTypeAny, {
        language: string;
        response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
        reading_level: "basic" | "intermediate" | "advanced";
        attachments?: {
            type: string;
            content: string;
            filename: string;
        }[] | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            red_flags: string[];
        } | undefined;
        next_steps?: string[] | undefined;
        follow_up_required?: boolean | undefined;
        escalation_triggered?: boolean | undefined;
        consent_required?: boolean | undefined;
    }, {
        response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
        attachments?: {
            type: string;
            content: string;
            filename: string;
        }[] | undefined;
        language?: string | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            red_flags: string[];
        } | undefined;
        next_steps?: string[] | undefined;
        follow_up_required?: boolean | undefined;
        escalation_triggered?: boolean | undefined;
        consent_required?: boolean | undefined;
        reading_level?: "basic" | "intermediate" | "advanced" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    session_id: string;
    message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
    channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
    content: string;
    timestamp: string;
    metadata?: {
        language: string;
        response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
        reading_level: "basic" | "intermediate" | "advanced";
        attachments?: {
            type: string;
            content: string;
            filename: string;
        }[] | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            red_flags: string[];
        } | undefined;
        next_steps?: string[] | undefined;
        follow_up_required?: boolean | undefined;
        escalation_triggered?: boolean | undefined;
        consent_required?: boolean | undefined;
    } | undefined;
}, {
    id: string;
    session_id: string;
    message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
    channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
    content: string;
    timestamp: string;
    metadata?: {
        response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
        attachments?: {
            type: string;
            content: string;
            filename: string;
        }[] | undefined;
        language?: string | undefined;
        triage_result?: {
            urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
            suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
            red_flags: string[];
        } | undefined;
        next_steps?: string[] | undefined;
        follow_up_required?: boolean | undefined;
        escalation_triggered?: boolean | undefined;
        consent_required?: boolean | undefined;
        reading_level?: "basic" | "intermediate" | "advanced" | undefined;
    } | undefined;
}>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
export declare const PatientSessionSchema: z.ZodObject<{
    session_id: z.ZodString;
    patient_id: z.ZodString;
    start_time: z.ZodString;
    end_time: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["active", "completed", "escalated", "transferred"]>;
    channel: z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>;
    messages: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        id: z.ZodString;
        patient_id: z.ZodString;
        session_id: z.ZodString;
        message_type: z.ZodEnum<["text", "symptom_report", "vital_signs", "medication_list", "allergy_list", "medical_history", "appointment_request", "prescription_refill", "lab_results", "emergency_alert", "follow_up", "educational_content", "system_notification"]>;
        direction: z.ZodEnum<["incoming", "outgoing"]>;
        channel: z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>;
        content: z.ZodString;
        timestamp: z.ZodString;
        metadata: z.ZodOptional<z.ZodObject<{
            symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            vital_signs: z.ZodOptional<z.ZodObject<{
                blood_pressure_systolic: z.ZodOptional<z.ZodNumber>;
                blood_pressure_diastolic: z.ZodOptional<z.ZodNumber>;
                heart_rate: z.ZodOptional<z.ZodNumber>;
                temperature: z.ZodOptional<z.ZodNumber>;
                oxygen_saturation: z.ZodOptional<z.ZodNumber>;
                pain_scale: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            }, {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            }>>;
            medications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            urgency: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "emergency"]>>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                url: z.ZodString;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                url: string;
                filename: string;
            }, {
                type: string;
                url: string;
                filename: string;
            }>, "many">>;
            language: z.ZodDefault<z.ZodString>;
            sentiment: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative", "anxious", "frustrated"]>>;
        }, "strip", z.ZodTypeAny, {
            language: string;
            vital_signs?: {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            } | undefined;
            symptoms?: string[] | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            urgency?: "low" | "medium" | "high" | "emergency" | undefined;
            attachments?: {
                type: string;
                url: string;
                filename: string;
            }[] | undefined;
            sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
        }, {
            vital_signs?: {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            } | undefined;
            symptoms?: string[] | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            urgency?: "low" | "medium" | "high" | "emergency" | undefined;
            attachments?: {
                type: string;
                url: string;
                filename: string;
            }[] | undefined;
            language?: string | undefined;
            sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        patient_id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        direction: "incoming" | "outgoing";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            language: string;
            vital_signs?: {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            } | undefined;
            symptoms?: string[] | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            urgency?: "low" | "medium" | "high" | "emergency" | undefined;
            attachments?: {
                type: string;
                url: string;
                filename: string;
            }[] | undefined;
            sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
        } | undefined;
    }, {
        id: string;
        patient_id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        direction: "incoming" | "outgoing";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            vital_signs?: {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            } | undefined;
            symptoms?: string[] | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            urgency?: "low" | "medium" | "high" | "emergency" | undefined;
            attachments?: {
                type: string;
                url: string;
                filename: string;
            }[] | undefined;
            language?: string | undefined;
            sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        session_id: z.ZodString;
        message_type: z.ZodEnum<["text", "symptom_report", "vital_signs", "medication_list", "allergy_list", "medical_history", "appointment_request", "prescription_refill", "lab_results", "emergency_alert", "follow_up", "educational_content", "system_notification"]>;
        channel: z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>;
        content: z.ZodString;
        timestamp: z.ZodString;
        metadata: z.ZodOptional<z.ZodObject<{
            response_type: z.ZodEnum<["informational", "clarification", "recommendation", "emergency", "educational"]>;
            triage_result: z.ZodOptional<z.ZodObject<{
                urgency: z.ZodEnum<["EMERGENT", "URGENT", "SEMI_URGENT", "ROUTINE"]>;
                suggested_pathway: z.ZodEnum<["ED", "URGENT_CARE", "PRIMARY_CARE", "TELEHEALTH"]>;
                red_flags: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            }, {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            }>>;
            next_steps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            follow_up_required: z.ZodOptional<z.ZodBoolean>;
            escalation_triggered: z.ZodOptional<z.ZodBoolean>;
            consent_required: z.ZodOptional<z.ZodBoolean>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                content: z.ZodString;
                filename: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                type: string;
                content: string;
                filename: string;
            }, {
                type: string;
                content: string;
                filename: string;
            }>, "many">>;
            language: z.ZodDefault<z.ZodString>;
            reading_level: z.ZodDefault<z.ZodEnum<["basic", "intermediate", "advanced"]>>;
        }, "strip", z.ZodTypeAny, {
            language: string;
            response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
            reading_level: "basic" | "intermediate" | "advanced";
            attachments?: {
                type: string;
                content: string;
                filename: string;
            }[] | undefined;
            triage_result?: {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            } | undefined;
            next_steps?: string[] | undefined;
            follow_up_required?: boolean | undefined;
            escalation_triggered?: boolean | undefined;
            consent_required?: boolean | undefined;
        }, {
            response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
            attachments?: {
                type: string;
                content: string;
                filename: string;
            }[] | undefined;
            language?: string | undefined;
            triage_result?: {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            } | undefined;
            next_steps?: string[] | undefined;
            follow_up_required?: boolean | undefined;
            escalation_triggered?: boolean | undefined;
            consent_required?: boolean | undefined;
            reading_level?: "basic" | "intermediate" | "advanced" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            language: string;
            response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
            reading_level: "basic" | "intermediate" | "advanced";
            attachments?: {
                type: string;
                content: string;
                filename: string;
            }[] | undefined;
            triage_result?: {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            } | undefined;
            next_steps?: string[] | undefined;
            follow_up_required?: boolean | undefined;
            escalation_triggered?: boolean | undefined;
            consent_required?: boolean | undefined;
        } | undefined;
    }, {
        id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
            attachments?: {
                type: string;
                content: string;
                filename: string;
            }[] | undefined;
            language?: string | undefined;
            triage_result?: {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            } | undefined;
            next_steps?: string[] | undefined;
            follow_up_required?: boolean | undefined;
            escalation_triggered?: boolean | undefined;
            consent_required?: boolean | undefined;
            reading_level?: "basic" | "intermediate" | "advanced" | undefined;
        } | undefined;
    }>]>, "many">;
    context: z.ZodOptional<z.ZodObject<{
        chief_complaint: z.ZodOptional<z.ZodString>;
        symptoms_discussed: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        medications_discussed: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        allergies_discussed: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        vital_signs_collected: z.ZodDefault<z.ZodBoolean>;
        triage_performed: z.ZodDefault<z.ZodBoolean>;
        consent_obtained: z.ZodDefault<z.ZodBoolean>;
        escalation_triggered: z.ZodDefault<z.ZodBoolean>;
        provider_notified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        escalation_triggered: boolean;
        vital_signs_collected: boolean;
        triage_performed: boolean;
        consent_obtained: boolean;
        provider_notified: boolean;
        chief_complaint?: string | undefined;
        symptoms_discussed?: string[] | undefined;
        medications_discussed?: string[] | undefined;
        allergies_discussed?: string[] | undefined;
    }, {
        escalation_triggered?: boolean | undefined;
        chief_complaint?: string | undefined;
        symptoms_discussed?: string[] | undefined;
        medications_discussed?: string[] | undefined;
        allergies_discussed?: string[] | undefined;
        vital_signs_collected?: boolean | undefined;
        triage_performed?: boolean | undefined;
        consent_obtained?: boolean | undefined;
        provider_notified?: boolean | undefined;
    }>>;
    summary: z.ZodOptional<z.ZodObject<{
        total_messages: z.ZodNumber;
        patient_messages: z.ZodNumber;
        agent_messages: z.ZodNumber;
        session_duration: z.ZodOptional<z.ZodNumber>;
        resolution: z.ZodOptional<z.ZodEnum<["resolved", "escalated", "transferred", "abandoned"]>>;
        satisfaction_score: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_messages: number;
        patient_messages: number;
        agent_messages: number;
        session_duration?: number | undefined;
        resolution?: "escalated" | "transferred" | "resolved" | "abandoned" | undefined;
        satisfaction_score?: number | undefined;
    }, {
        total_messages: number;
        patient_messages: number;
        agent_messages: number;
        session_duration?: number | undefined;
        resolution?: "escalated" | "transferred" | "resolved" | "abandoned" | undefined;
        satisfaction_score?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "completed" | "escalated" | "transferred";
    patient_id: string;
    session_id: string;
    channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
    start_time: string;
    messages: ({
        id: string;
        patient_id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        direction: "incoming" | "outgoing";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            language: string;
            vital_signs?: {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            } | undefined;
            symptoms?: string[] | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            urgency?: "low" | "medium" | "high" | "emergency" | undefined;
            attachments?: {
                type: string;
                url: string;
                filename: string;
            }[] | undefined;
            sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
        } | undefined;
    } | {
        id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            language: string;
            response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
            reading_level: "basic" | "intermediate" | "advanced";
            attachments?: {
                type: string;
                content: string;
                filename: string;
            }[] | undefined;
            triage_result?: {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            } | undefined;
            next_steps?: string[] | undefined;
            follow_up_required?: boolean | undefined;
            escalation_triggered?: boolean | undefined;
            consent_required?: boolean | undefined;
        } | undefined;
    })[];
    end_time?: string | undefined;
    context?: {
        escalation_triggered: boolean;
        vital_signs_collected: boolean;
        triage_performed: boolean;
        consent_obtained: boolean;
        provider_notified: boolean;
        chief_complaint?: string | undefined;
        symptoms_discussed?: string[] | undefined;
        medications_discussed?: string[] | undefined;
        allergies_discussed?: string[] | undefined;
    } | undefined;
    summary?: {
        total_messages: number;
        patient_messages: number;
        agent_messages: number;
        session_duration?: number | undefined;
        resolution?: "escalated" | "transferred" | "resolved" | "abandoned" | undefined;
        satisfaction_score?: number | undefined;
    } | undefined;
}, {
    status: "active" | "completed" | "escalated" | "transferred";
    patient_id: string;
    session_id: string;
    channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
    start_time: string;
    messages: ({
        id: string;
        patient_id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        direction: "incoming" | "outgoing";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            vital_signs?: {
                blood_pressure_systolic?: number | undefined;
                blood_pressure_diastolic?: number | undefined;
                heart_rate?: number | undefined;
                temperature?: number | undefined;
                oxygen_saturation?: number | undefined;
                pain_scale?: number | undefined;
            } | undefined;
            symptoms?: string[] | undefined;
            medications?: string[] | undefined;
            allergies?: string[] | undefined;
            urgency?: "low" | "medium" | "high" | "emergency" | undefined;
            attachments?: {
                type: string;
                url: string;
                filename: string;
            }[] | undefined;
            language?: string | undefined;
            sentiment?: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | undefined;
        } | undefined;
    } | {
        id: string;
        session_id: string;
        message_type: "text" | "symptom_report" | "vital_signs" | "medication_list" | "allergy_list" | "medical_history" | "appointment_request" | "prescription_refill" | "lab_results" | "emergency_alert" | "follow_up" | "educational_content" | "system_notification";
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        content: string;
        timestamp: string;
        metadata?: {
            response_type: "emergency" | "informational" | "clarification" | "recommendation" | "educational";
            attachments?: {
                type: string;
                content: string;
                filename: string;
            }[] | undefined;
            language?: string | undefined;
            triage_result?: {
                urgency: "EMERGENT" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
                suggested_pathway: "ED" | "URGENT_CARE" | "PRIMARY_CARE" | "TELEHEALTH";
                red_flags: string[];
            } | undefined;
            next_steps?: string[] | undefined;
            follow_up_required?: boolean | undefined;
            escalation_triggered?: boolean | undefined;
            consent_required?: boolean | undefined;
            reading_level?: "basic" | "intermediate" | "advanced" | undefined;
        } | undefined;
    })[];
    end_time?: string | undefined;
    context?: {
        escalation_triggered?: boolean | undefined;
        chief_complaint?: string | undefined;
        symptoms_discussed?: string[] | undefined;
        medications_discussed?: string[] | undefined;
        allergies_discussed?: string[] | undefined;
        vital_signs_collected?: boolean | undefined;
        triage_performed?: boolean | undefined;
        consent_obtained?: boolean | undefined;
        provider_notified?: boolean | undefined;
    } | undefined;
    summary?: {
        total_messages: number;
        patient_messages: number;
        agent_messages: number;
        session_duration?: number | undefined;
        resolution?: "escalated" | "transferred" | "resolved" | "abandoned" | undefined;
        satisfaction_score?: number | undefined;
    } | undefined;
}>;
export type PatientSession = z.infer<typeof PatientSessionSchema>;
export declare const SymptomExtractionSchema: z.ZodObject<{
    symptoms: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        duration: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodEnum<["mild", "moderate", "severe"]>>;
        onset: z.ZodOptional<z.ZodEnum<["sudden", "gradual", "unknown"]>>;
        location: z.ZodOptional<z.ZodString>;
        associated_symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        duration?: string | undefined;
        severity?: "mild" | "moderate" | "severe" | undefined;
        onset?: "unknown" | "sudden" | "gradual" | undefined;
        location?: string | undefined;
        associated_symptoms?: string[] | undefined;
    }, {
        description: string;
        duration?: string | undefined;
        severity?: "mild" | "moderate" | "severe" | undefined;
        onset?: "unknown" | "sudden" | "gradual" | undefined;
        location?: string | undefined;
        associated_symptoms?: string[] | undefined;
    }>, "many">;
    confidence: z.ZodNumber;
    requires_clarification: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    symptoms: {
        description: string;
        duration?: string | undefined;
        severity?: "mild" | "moderate" | "severe" | undefined;
        onset?: "unknown" | "sudden" | "gradual" | undefined;
        location?: string | undefined;
        associated_symptoms?: string[] | undefined;
    }[];
    confidence: number;
    requires_clarification?: string[] | undefined;
}, {
    symptoms: {
        description: string;
        duration?: string | undefined;
        severity?: "mild" | "moderate" | "severe" | undefined;
        onset?: "unknown" | "sudden" | "gradual" | undefined;
        location?: string | undefined;
        associated_symptoms?: string[] | undefined;
    }[];
    confidence: number;
    requires_clarification?: string[] | undefined;
}>;
export type SymptomExtraction = z.infer<typeof SymptomExtractionSchema>;
export declare const HealthLiteracySchema: z.ZodEnum<["basic", "intermediate", "advanced"]>;
export type HealthLiteracy = z.infer<typeof HealthLiteracySchema>;
export declare const PatientProfileSchema: z.ZodObject<{
    patient_id: z.ZodString;
    preferred_language: z.ZodDefault<z.ZodString>;
    health_literacy: z.ZodEnum<["basic", "intermediate", "advanced"]>;
    communication_preferences: z.ZodObject<{
        channel: z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>;
        message_frequency: z.ZodEnum<["immediate", "hourly", "daily", "weekly"]>;
        reading_level: z.ZodEnum<["basic", "intermediate", "advanced"]>;
        medical_jargon_tolerance: z.ZodEnum<["low", "medium", "high"]>;
        empathy_level: z.ZodEnum<["formal", "friendly", "very_friendly"]>;
    }, "strip", z.ZodTypeAny, {
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        reading_level: "basic" | "intermediate" | "advanced";
        message_frequency: "immediate" | "hourly" | "daily" | "weekly";
        medical_jargon_tolerance: "low" | "medium" | "high";
        empathy_level: "formal" | "friendly" | "very_friendly";
    }, {
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        reading_level: "basic" | "intermediate" | "advanced";
        message_frequency: "immediate" | "hourly" | "daily" | "weekly";
        medical_jargon_tolerance: "low" | "medium" | "high";
        empathy_level: "formal" | "friendly" | "very_friendly";
    }>;
    accessibility_needs: z.ZodOptional<z.ZodObject<{
        large_text: z.ZodDefault<z.ZodBoolean>;
        voice_output: z.ZodDefault<z.ZodBoolean>;
        simple_language: z.ZodDefault<z.ZodBoolean>;
        visual_aids: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        large_text: boolean;
        voice_output: boolean;
        simple_language: boolean;
        visual_aids: boolean;
    }, {
        large_text?: boolean | undefined;
        voice_output?: boolean | undefined;
        simple_language?: boolean | undefined;
        visual_aids?: boolean | undefined;
    }>>;
    medical_background: z.ZodOptional<z.ZodObject<{
        chronic_conditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        current_medications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        known_allergies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preferred_provider: z.ZodOptional<z.ZodString>;
        emergency_contact: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            relationship: z.ZodString;
            phone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            relationship: string;
            phone: string;
        }, {
            name: string;
            relationship: string;
            phone: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        chronic_conditions?: string[] | undefined;
        current_medications?: string[] | undefined;
        known_allergies?: string[] | undefined;
        preferred_provider?: string | undefined;
        emergency_contact?: {
            name: string;
            relationship: string;
            phone: string;
        } | undefined;
    }, {
        chronic_conditions?: string[] | undefined;
        current_medications?: string[] | undefined;
        known_allergies?: string[] | undefined;
        preferred_provider?: string | undefined;
        emergency_contact?: {
            name: string;
            relationship: string;
            phone: string;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    preferred_language: string;
    health_literacy: "basic" | "intermediate" | "advanced";
    communication_preferences: {
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        reading_level: "basic" | "intermediate" | "advanced";
        message_frequency: "immediate" | "hourly" | "daily" | "weekly";
        medical_jargon_tolerance: "low" | "medium" | "high";
        empathy_level: "formal" | "friendly" | "very_friendly";
    };
    accessibility_needs?: {
        large_text: boolean;
        voice_output: boolean;
        simple_language: boolean;
        visual_aids: boolean;
    } | undefined;
    medical_background?: {
        chronic_conditions?: string[] | undefined;
        current_medications?: string[] | undefined;
        known_allergies?: string[] | undefined;
        preferred_provider?: string | undefined;
        emergency_contact?: {
            name: string;
            relationship: string;
            phone: string;
        } | undefined;
    } | undefined;
}, {
    patient_id: string;
    health_literacy: "basic" | "intermediate" | "advanced";
    communication_preferences: {
        channel: "chat" | "voice" | "sms" | "email" | "mobile_app";
        reading_level: "basic" | "intermediate" | "advanced";
        message_frequency: "immediate" | "hourly" | "daily" | "weekly";
        medical_jargon_tolerance: "low" | "medium" | "high";
        empathy_level: "formal" | "friendly" | "very_friendly";
    };
    preferred_language?: string | undefined;
    accessibility_needs?: {
        large_text?: boolean | undefined;
        voice_output?: boolean | undefined;
        simple_language?: boolean | undefined;
        visual_aids?: boolean | undefined;
    } | undefined;
    medical_background?: {
        chronic_conditions?: string[] | undefined;
        current_medications?: string[] | undefined;
        known_allergies?: string[] | undefined;
        preferred_provider?: string | undefined;
        emergency_contact?: {
            name: string;
            relationship: string;
            phone: string;
        } | undefined;
    } | undefined;
}>;
export type PatientProfile = z.infer<typeof PatientProfileSchema>;
export declare const ContentTemplateSchema: z.ZodObject<{
    template_id: z.ZodString;
    category: z.ZodEnum<["greeting", "symptom_collection", "vital_signs", "education", "emergency", "follow_up"]>;
    language: z.ZodString;
    health_literacy: z.ZodEnum<["basic", "intermediate", "advanced"]>;
    content: z.ZodString;
    variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    conditions: z.ZodOptional<z.ZodObject<{
        symptoms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        urgency: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        age_groups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        symptoms?: string[] | undefined;
        urgency?: string[] | undefined;
        age_groups?: string[] | undefined;
    }, {
        symptoms?: string[] | undefined;
        urgency?: string[] | undefined;
        age_groups?: string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    language: string;
    health_literacy: "basic" | "intermediate" | "advanced";
    template_id: string;
    category: "vital_signs" | "follow_up" | "emergency" | "greeting" | "symptom_collection" | "education";
    variables?: string[] | undefined;
    conditions?: {
        symptoms?: string[] | undefined;
        urgency?: string[] | undefined;
        age_groups?: string[] | undefined;
    } | undefined;
}, {
    content: string;
    language: string;
    health_literacy: "basic" | "intermediate" | "advanced";
    template_id: string;
    category: "vital_signs" | "follow_up" | "emergency" | "greeting" | "symptom_collection" | "education";
    variables?: string[] | undefined;
    conditions?: {
        symptoms?: string[] | undefined;
        urgency?: string[] | undefined;
        age_groups?: string[] | undefined;
    } | undefined;
}>;
export type ContentTemplate = z.infer<typeof ContentTemplateSchema>;
export declare const NotificationPreferencesSchema: z.ZodObject<{
    patient_id: z.ZodString;
    appointment_reminders: z.ZodDefault<z.ZodBoolean>;
    medication_reminders: z.ZodDefault<z.ZodBoolean>;
    test_results: z.ZodDefault<z.ZodBoolean>;
    health_tips: z.ZodDefault<z.ZodBoolean>;
    emergency_alerts: z.ZodDefault<z.ZodBoolean>;
    follow_up_care: z.ZodDefault<z.ZodBoolean>;
    preferred_channels: z.ZodArray<z.ZodEnum<["chat", "voice", "sms", "email", "mobile_app"]>, "many">;
    quiet_hours: z.ZodOptional<z.ZodObject<{
        start: z.ZodOptional<z.ZodString>;
        end: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start?: string | undefined;
        end?: string | undefined;
        timezone?: string | undefined;
    }, {
        start?: string | undefined;
        end?: string | undefined;
        timezone?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    appointment_reminders: boolean;
    medication_reminders: boolean;
    test_results: boolean;
    health_tips: boolean;
    emergency_alerts: boolean;
    follow_up_care: boolean;
    preferred_channels: ("chat" | "voice" | "sms" | "email" | "mobile_app")[];
    quiet_hours?: {
        start?: string | undefined;
        end?: string | undefined;
        timezone?: string | undefined;
    } | undefined;
}, {
    patient_id: string;
    preferred_channels: ("chat" | "voice" | "sms" | "email" | "mobile_app")[];
    appointment_reminders?: boolean | undefined;
    medication_reminders?: boolean | undefined;
    test_results?: boolean | undefined;
    health_tips?: boolean | undefined;
    emergency_alerts?: boolean | undefined;
    follow_up_care?: boolean | undefined;
    quiet_hours?: {
        start?: string | undefined;
        end?: string | undefined;
        timezone?: string | undefined;
    } | undefined;
}>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
export declare const EmergencyEscalationSchema: z.ZodObject<{
    escalation_id: z.ZodString;
    patient_id: z.ZodString;
    session_id: z.ZodString;
    trigger_reason: z.ZodString;
    urgency: z.ZodEnum<["EMERGENT", "URGENT"]>;
    symptoms: z.ZodArray<z.ZodString, "many">;
    vital_signs: z.ZodOptional<z.ZodObject<{
        blood_pressure_systolic: z.ZodOptional<z.ZodNumber>;
        blood_pressure_diastolic: z.ZodOptional<z.ZodNumber>;
        heart_rate: z.ZodOptional<z.ZodNumber>;
        temperature: z.ZodOptional<z.ZodNumber>;
        oxygen_saturation: z.ZodOptional<z.ZodNumber>;
        pain_scale: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
    }, {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
    }>>;
    actions_taken: z.ZodArray<z.ZodString, "many">;
    provider_notified: z.ZodBoolean;
    emergency_services_called: z.ZodBoolean;
    timestamp: z.ZodString;
    resolution: z.ZodOptional<z.ZodString>;
    resolution_timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patient_id: string;
    session_id: string;
    timestamp: string;
    symptoms: string[];
    urgency: "EMERGENT" | "URGENT";
    provider_notified: boolean;
    escalation_id: string;
    trigger_reason: string;
    actions_taken: string[];
    emergency_services_called: boolean;
    vital_signs?: {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
    } | undefined;
    resolution?: string | undefined;
    resolution_timestamp?: string | undefined;
}, {
    patient_id: string;
    session_id: string;
    timestamp: string;
    symptoms: string[];
    urgency: "EMERGENT" | "URGENT";
    provider_notified: boolean;
    escalation_id: string;
    trigger_reason: string;
    actions_taken: string[];
    emergency_services_called: boolean;
    vital_signs?: {
        blood_pressure_systolic?: number | undefined;
        blood_pressure_diastolic?: number | undefined;
        heart_rate?: number | undefined;
        temperature?: number | undefined;
        oxygen_saturation?: number | undefined;
        pain_scale?: number | undefined;
    } | undefined;
    resolution?: string | undefined;
    resolution_timestamp?: string | undefined;
}>;
export type EmergencyEscalation = z.infer<typeof EmergencyEscalationSchema>;
export declare const MessageAnalysisSchema: z.ZodObject<{
    message_id: z.ZodString;
    sentiment: z.ZodEnum<["positive", "neutral", "negative", "anxious", "frustrated", "confused"]>;
    urgency_indicators: z.ZodArray<z.ZodString, "many">;
    medical_keywords: z.ZodArray<z.ZodString, "many">;
    requires_medical_attention: z.ZodBoolean;
    requires_clarification: z.ZodArray<z.ZodString, "many">;
    suggested_responses: z.ZodArray<z.ZodString, "many">;
    confidence_score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    sentiment: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | "confused";
    requires_clarification: string[];
    message_id: string;
    urgency_indicators: string[];
    medical_keywords: string[];
    requires_medical_attention: boolean;
    suggested_responses: string[];
    confidence_score: number;
}, {
    sentiment: "positive" | "neutral" | "negative" | "anxious" | "frustrated" | "confused";
    requires_clarification: string[];
    message_id: string;
    urgency_indicators: string[];
    medical_keywords: string[];
    requires_medical_attention: boolean;
    suggested_responses: string[];
    confidence_score: number;
}>;
export type MessageAnalysis = z.infer<typeof MessageAnalysisSchema>;
//# sourceMappingURL=types.d.ts.map