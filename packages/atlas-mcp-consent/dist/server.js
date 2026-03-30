"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentCheckSchema = exports.ConsentRequestSchema = void 0;
// ATLAS MCP Consent Server - Model Context Protocol Implementation
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
// ==================== Consent Schemas ====================
exports.ConsentRequestSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    consentType: zod_1.z.enum(['TREATMENT', 'RESEARCH', 'DATA_SHARING', 'EMERGENCY']),
    scope: zod_1.z.array(zod_1.z.string()),
    expiration: zod_1.z.string().optional(), // ISO datetime
    providerId: zod_1.z.string(),
    purpose: zod_1.z.string(),
});
exports.ConsentCheckSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    consentType: zod_1.z.string(),
    action: zod_1.z.string(),
    context: zod_1.z.record(zod_1.z.any()).optional(),
});
class ConsentManager {
    constructor() {
        this.consents = new Map();
    }
    async requestConsent(request) {
        const consentId = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // In a real implementation, this would trigger patient notification
        // For demo purposes, we auto-grant with proper logging
        const record = {
            id: consentId,
            patientId: request.patientId,
            consentType: request.consentType,
            scope: request.scope,
            granted: true, // Auto-granted for demo
            grantedAt: new Date().toISOString(),
            expiresAt: request.expiration,
            providerId: request.providerId,
            purpose: request.purpose,
            auditLog: [{
                    timestamp: new Date().toISOString(),
                    action: 'CONSENT_GRANTED',
                    actor: 'SYSTEM',
                    details: `Consent granted for ${request.consentType} - ${request.purpose}`,
                }],
        };
        this.consents.set(consentId, record);
        return record;
    }
    async checkConsent(check) {
        const patientConsents = Array.from(this.consents.values())
            .filter(c => c.patientId === check.patientId && c.consentType === check.consentType);
        if (patientConsents.length === 0) {
            return { allowed: false, reason: 'No consent record found' };
        }
        // Find most recent valid consent
        const validConsent = patientConsents
            .filter(c => c.granted && (!c.expiresAt || new Date(c.expiresAt) > new Date()))
            .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime())[0];
        if (!validConsent) {
            return { allowed: false, reason: 'No valid consent found' };
        }
        // Check if action is within scope
        const actionInScope = validConsent.scope.some(scope => check.action.toLowerCase().includes(scope.toLowerCase()) ||
            scope.toLowerCase().includes(check.action.toLowerCase()));
        if (!actionInScope) {
            return { allowed: false, reason: 'Action not within consent scope' };
        }
        // Log the consent check
        validConsent.auditLog.push({
            timestamp: new Date().toISOString(),
            action: 'CONSENT_CHECKED',
            actor: 'SYSTEM',
            details: `Checked consent for action: ${check.action}`,
        });
        return { allowed: true, consentId: validConsent.id };
    }
    async revokeConsent(consentId) {
        const consent = this.consents.get(consentId);
        if (!consent)
            return false;
        consent.granted = false;
        consent.auditLog.push({
            timestamp: new Date().toISOString(),
            action: 'CONSENT_REVOKED',
            actor: 'PATIENT',
            details: 'Consent revoked by patient',
        });
        return true;
    }
    getConsentHistory(patientId) {
        return Array.from(this.consents.values())
            .filter(c => c.patientId === patientId)
            .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime());
    }
}
// ==================== MCP Server Implementation ====================
const consentManager = new ConsentManager();
const server = new index_js_1.Server({
    name: 'atlas-mcp-consent',
    version: '1.0.0',
});
// List available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'request_consent',
                description: 'Request patient consent for a specific action or data sharing',
                inputSchema: {
                    type: 'object',
                    properties: {
                        patientId: { type: 'string', description: 'Patient identifier' },
                        consentType: {
                            type: 'string',
                            enum: ['TREATMENT', 'RESEARCH', 'DATA_SHARING', 'EMERGENCY'],
                            description: 'Type of consent being requested'
                        },
                        scope: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Scope of activities covered by this consent'
                        },
                        expiration: { type: 'string', description: 'Optional expiration datetime (ISO format)' },
                        providerId: { type: 'string', description: 'Healthcare provider requesting consent' },
                        purpose: { type: 'string', description: 'Purpose of the consent request' },
                    },
                    required: ['patientId', 'consentType', 'scope', 'providerId', 'purpose'],
                },
            },
            {
                name: 'check_consent',
                description: 'Check if patient has granted consent for a specific action',
                inputSchema: {
                    type: 'object',
                    properties: {
                        patientId: { type: 'string', description: 'Patient identifier' },
                        consentType: { type: 'string', description: 'Type of consent to check' },
                        action: { type: 'string', description: 'Specific action being performed' },
                        context: { type: 'object', description: 'Additional context for the consent check' },
                    },
                    required: ['patientId', 'consentType', 'action'],
                },
            },
            {
                name: 'revoke_consent',
                description: 'Revoke a previously granted consent',
                inputSchema: {
                    type: 'object',
                    properties: {
                        consentId: { type: 'string', description: 'Consent record identifier to revoke' },
                    },
                    required: ['consentId'],
                },
            },
            {
                name: 'get_consent_history',
                description: 'Get complete consent history for a patient',
                inputSchema: {
                    type: 'object',
                    properties: {
                        patientId: { type: 'string', description: 'Patient identifier' },
                    },
                    required: ['patientId'],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'request_consent': {
                const consentRequest = exports.ConsentRequestSchema.parse(args);
                const result = await consentManager.requestConsent(consentRequest);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                consent: {
                                    id: result.id,
                                    patientId: result.patientId,
                                    consentType: result.consentType,
                                    granted: result.granted,
                                    grantedAt: result.grantedAt,
                                    expiresAt: result.expiresAt,
                                    scope: result.scope,
                                },
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'check_consent': {
                const consentCheck = exports.ConsentCheckSchema.parse(args);
                const result = await consentManager.checkConsent(consentCheck);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                allowed: result.allowed,
                                consentId: result.consentId,
                                reason: result.reason,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'revoke_consent': {
                const { consentId } = args;
                const success = await consentManager.revokeConsent(consentId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success,
                                message: success ? 'Consent revoked successfully' : 'Consent not found',
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'get_consent_history': {
                const { patientId } = args;
                const history = consentManager.getConsentHistory(patientId);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                consents: history.map(c => ({
                                    id: c.id,
                                    consentType: c.consentType,
                                    granted: c.granted,
                                    grantedAt: c.grantedAt,
                                    expiresAt: c.expiresAt,
                                    scope: c.scope,
                                    purpose: c.purpose,
                                    auditEntries: c.auditLog.length,
                                })),
                            }, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, `Invalid arguments: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
        }
        throw error;
    }
});
// ==================== Server Startup ====================
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('ATLAS MCP Consent Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map