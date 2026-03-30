"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditQuerySchema = exports.AuditEventSchema = void 0;
// ATLAS MCP Audit Server - Cryptographic Audit Trail via MCP
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const crypto_1 = require("crypto");
// ==================== Audit Schemas ====================
exports.AuditEventSchema = zod_1.z.object({
    eventId: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    agentId: zod_1.z.string(),
    patientId: zod_1.z.string(),
    action: zod_1.z.string(),
    resource: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.any()).optional(),
    previousHash: zod_1.z.string().optional(),
});
exports.AuditQuerySchema = zod_1.z.object({
    patientId: zod_1.z.string().optional(),
    agentId: zod_1.z.string().optional(),
    action: zod_1.z.string().optional(),
    fromTimestamp: zod_1.z.string().optional(),
    toTimestamp: zod_1.z.string().optional(),
    limit: zod_1.z.number().default(100),
});
class AuditManager {
    constructor() {
        this.events = [];
        this.lastHash = '';
    }
    async logEvent(event) {
        const eventData = {
            ...event,
            previousHash: this.lastHash,
        };
        // Create SHA-256 hash of the event data
        const hash = this.calculateHash(JSON.stringify(eventData));
        const record = {
            ...eventData,
            hash,
            signature: `signed_${hash}`, // Simplified signature
        };
        this.events.push(record);
        this.lastHash = hash;
        return record;
    }
    async queryEvents(query) {
        let filtered = [...this.events];
        if (query.patientId) {
            filtered = filtered.filter(e => e.patientId === query.patientId);
        }
        if (query.agentId) {
            filtered = filtered.filter(e => e.agentId === query.agentId);
        }
        if (query.action) {
            filtered = filtered.filter(e => e.action.toLowerCase().includes(query.action.toLowerCase()));
        }
        if (query.fromTimestamp) {
            const from = new Date(query.fromTimestamp);
            filtered = filtered.filter(e => new Date(e.timestamp) >= from);
        }
        if (query.toTimestamp) {
            const to = new Date(query.toTimestamp);
            filtered = filtered.filter(e => new Date(e.timestamp) <= to);
        }
        // Sort by timestamp (newest first) and limit
        return filtered
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, query.limit);
    }
    async verifyAuditTrail() {
        const issues = [];
        for (let i = 0; i < this.events.length; i++) {
            const event = this.events[i];
            // Verify hash
            const expectedData = {
                eventId: event.eventId,
                timestamp: event.timestamp,
                agentId: event.agentId,
                patientId: event.patientId,
                action: event.action,
                resource: event.resource,
                details: event.details,
                previousHash: event.previousHash,
            };
            const expectedHash = this.calculateHash(JSON.stringify(expectedData));
            if (event.hash !== expectedHash) {
                issues.push(`Hash mismatch for event ${event.eventId}`);
            }
            // Verify hash chain
            if (i > 0) {
                const previousEvent = this.events[i - 1];
                if (event.previousHash !== previousEvent.hash) {
                    issues.push(`Hash chain broken at event ${event.eventId}`);
                }
            }
        }
        return {
            valid: issues.length === 0,
            issues,
        };
    }
    async getAuditStatistics() {
        if (this.events.length === 0) {
            return {
                totalEvents: 0,
                eventsByAgent: {},
                eventsByAction: {},
                timeRange: null,
            };
        }
        const eventsByAgent = {};
        const eventsByAction = {};
        const timestamps = this.events.map(e => new Date(e.timestamp).getTime());
        const earliest = new Date(Math.min(...timestamps)).toISOString();
        const latest = new Date(Math.max(...timestamps)).toISOString();
        this.events.forEach(event => {
            eventsByAgent[event.agentId] = (eventsByAgent[event.agentId] || 0) + 1;
            eventsByAction[event.action] = (eventsByAction[event.action] || 0) + 1;
        });
        return {
            totalEvents: this.events.length,
            eventsByAgent,
            eventsByAction,
            timeRange: { earliest, latest },
        };
    }
    calculateHash(data) {
        return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
    }
}
// ==================== MCP Server Implementation ====================
const auditManager = new AuditManager();
const server = new index_js_1.Server({
    name: 'atlas-mcp-audit',
    version: '1.0.0',
});
// List available tools
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'log_audit_event',
                description: 'Log an audit event with cryptographic hash chain',
                inputSchema: {
                    type: 'object',
                    properties: {
                        eventId: { type: 'string', description: 'Unique event identifier' },
                        timestamp: { type: 'string', description: 'Event timestamp (ISO format)' },
                        agentId: { type: 'string', description: 'Agent performing the action' },
                        patientId: { type: 'string', description: 'Patient identifier' },
                        action: { type: 'string', description: 'Action being performed' },
                        resource: { type: 'string', description: 'Resource being accessed' },
                        details: { type: 'object', description: 'Additional event details' },
                    },
                    required: ['eventId', 'timestamp', 'agentId', 'patientId', 'action'],
                },
            },
            {
                name: 'query_audit_events',
                description: 'Query audit events with filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        patientId: { type: 'string', description: 'Filter by patient ID' },
                        agentId: { type: 'string', description: 'Filter by agent ID' },
                        action: { type: 'string', description: 'Filter by action type' },
                        fromTimestamp: { type: 'string', description: 'Filter events from this timestamp' },
                        toTimestamp: { type: 'string', description: 'Filter events to this timestamp' },
                        limit: { type: 'number', description: 'Maximum number of events to return', default: 100 },
                    },
                },
            },
            {
                name: 'verify_audit_trail',
                description: 'Verify the integrity of the audit trail hash chain',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'get_audit_statistics',
                description: 'Get audit statistics and summary',
                inputSchema: {
                    type: 'object',
                    properties: {},
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
            case 'log_audit_event': {
                const auditEvent = exports.AuditEventSchema.parse(args);
                const record = await auditManager.logEvent(auditEvent);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                event: {
                                    eventId: record.eventId,
                                    hash: record.hash,
                                    previousHash: record.previousHash,
                                    timestamp: record.timestamp,
                                },
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'query_audit_events': {
                const query = exports.AuditQuerySchema.parse(args);
                const events = await auditManager.queryEvents(query);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                events: events.map(e => ({
                                    eventId: e.eventId,
                                    timestamp: e.timestamp,
                                    agentId: e.agentId,
                                    patientId: e.patientId,
                                    action: e.action,
                                    hash: e.hash,
                                    previousHash: e.previousHash,
                                })),
                                total: events.length,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'verify_audit_trail': {
                const verification = await auditManager.verifyAuditTrail();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                valid: verification.valid,
                                issues: verification.issues,
                                totalEvents: auditManager['events'].length,
                            }, null, 2),
                        },
                    ],
                };
            }
            case 'get_audit_statistics': {
                const stats = await auditManager.getAuditStatistics();
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                statistics: stats,
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
    console.error('ATLAS MCP Audit Server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map