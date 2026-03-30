import { z } from 'zod';
export declare const ConsentRequestSchema: z.ZodObject<{
    patientId: z.ZodString;
    consentType: z.ZodEnum<["TREATMENT", "RESEARCH", "DATA_SHARING", "EMERGENCY"]>;
    scope: z.ZodArray<z.ZodString, "many">;
    expiration: z.ZodOptional<z.ZodString>;
    providerId: z.ZodString;
    purpose: z.ZodString;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    consentType: "TREATMENT" | "RESEARCH" | "DATA_SHARING" | "EMERGENCY";
    scope: string[];
    providerId: string;
    purpose: string;
    expiration?: string | undefined;
}, {
    patientId: string;
    consentType: "TREATMENT" | "RESEARCH" | "DATA_SHARING" | "EMERGENCY";
    scope: string[];
    providerId: string;
    purpose: string;
    expiration?: string | undefined;
}>;
export declare const ConsentCheckSchema: z.ZodObject<{
    patientId: z.ZodString;
    consentType: z.ZodString;
    action: z.ZodString;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    consentType: string;
    action: string;
    context?: Record<string, any> | undefined;
}, {
    patientId: string;
    consentType: string;
    action: string;
    context?: Record<string, any> | undefined;
}>;
export type ConsentRequest = z.infer<typeof ConsentRequestSchema>;
export type ConsentCheck = z.infer<typeof ConsentCheckSchema>;
//# sourceMappingURL=server.d.ts.map