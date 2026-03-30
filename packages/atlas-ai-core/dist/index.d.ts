import { z } from 'zod';
export interface AIConfig {
    openaiApiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
}
export declare const defaultAIConfig: AIConfig;
export declare const TriageInputSchema: z.ZodObject<{
    symptoms: z.ZodArray<z.ZodString, "many">;
    patientContext: z.ZodOptional<z.ZodObject<{
        age: z.ZodNumber;
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
        age: number;
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
        age: number;
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
}, "strip", z.ZodTypeAny, {
    symptoms: string[];
    patientContext?: {
        age: number;
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
}, {
    symptoms: string[];
    patientContext?: {
        age: number;
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
}>;
export declare const TriageOutputSchema: z.ZodObject<{
    urgency: z.ZodEnum<["ROUTINE", "URGENT", "EMERGENT"]>;
    suggestedPathway: z.ZodEnum<["TELEHEALTH", "URGENT_CARE", "ED", "HOSPITAL_ADMISSION"]>;
    differential: z.ZodArray<z.ZodObject<{
        condition: z.ZodString;
        icd10: z.ZodString;
        confidence: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        condition: string;
        icd10: string;
        confidence: number;
    }, {
        condition: string;
        icd10: string;
        confidence: number;
    }>, "many">;
    redFlags: z.ZodArray<z.ZodString, "many">;
    reasoning: z.ZodString;
    confidenceScore: z.ZodNumber;
    recommendations: z.ZodArray<z.ZodString, "many">;
    requiresImmediateAttention: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    urgency: "ROUTINE" | "URGENT" | "EMERGENT";
    suggestedPathway: "TELEHEALTH" | "URGENT_CARE" | "ED" | "HOSPITAL_ADMISSION";
    differential: {
        condition: string;
        icd10: string;
        confidence: number;
    }[];
    redFlags: string[];
    reasoning: string;
    confidenceScore: number;
    recommendations: string[];
    requiresImmediateAttention: boolean;
}, {
    urgency: "ROUTINE" | "URGENT" | "EMERGENT";
    suggestedPathway: "TELEHEALTH" | "URGENT_CARE" | "ED" | "HOSPITAL_ADMISSION";
    differential: {
        condition: string;
        icd10: string;
        confidence: number;
    }[];
    redFlags: string[];
    reasoning: string;
    confidenceScore: number;
    recommendations: string[];
    requiresImmediateAttention: boolean;
}>;
export type TriageInput = z.infer<typeof TriageInputSchema>;
export type TriageOutput = z.infer<typeof TriageOutputSchema>;
export declare class AITriageAgent {
    private config;
    private client;
    constructor(config?: AIConfig);
    analyzeSymptoms(input: TriageInput): Promise<TriageOutput>;
    private buildTriagePrompt;
    private getSystemPrompt;
    private fallbackTriage;
}
export declare class AIAgentFactory {
    private static triageAgent;
    static getTriageAgent(config?: AIConfig): AITriageAgent;
    static reset(): void;
}
//# sourceMappingURL=index.d.ts.map