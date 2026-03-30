import { z } from 'zod';
export declare const AuditEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    timestamp: z.ZodString;
    agentId: z.ZodString;
    patientId: z.ZodString;
    action: z.ZodString;
    resource: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    previousHash: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    timestamp: string;
    agentId: string;
    patientId: string;
    action: string;
    resource?: string | undefined;
    details?: Record<string, any> | undefined;
    previousHash?: string | undefined;
}, {
    eventId: string;
    timestamp: string;
    agentId: string;
    patientId: string;
    action: string;
    resource?: string | undefined;
    details?: Record<string, any> | undefined;
    previousHash?: string | undefined;
}>;
export declare const AuditQuerySchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    agentId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    fromTimestamp: z.ZodOptional<z.ZodString>;
    toTimestamp: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    agentId?: string | undefined;
    patientId?: string | undefined;
    action?: string | undefined;
    fromTimestamp?: string | undefined;
    toTimestamp?: string | undefined;
}, {
    agentId?: string | undefined;
    patientId?: string | undefined;
    action?: string | undefined;
    fromTimestamp?: string | undefined;
    toTimestamp?: string | undefined;
    limit?: number | undefined;
}>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditQuery = z.infer<typeof AuditQuerySchema>;
//# sourceMappingURL=server.d.ts.map