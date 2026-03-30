// ATLAS MCP Audit Server - Cryptographic Audit Trail via MCP
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createHash } from 'crypto';

// ==================== Audit Schemas ====================
export const AuditEventSchema = z.object({
  eventId: z.string(),
  timestamp: z.string(),
  agentId: z.string(),
  patientId: z.string(),
  action: z.string(),
  resource: z.string().optional(),
  details: z.record(z.any()).optional(),
  previousHash: z.string().optional(),
});

export const AuditQuerySchema = z.object({
  patientId: z.string().optional(),
  agentId: z.string().optional(),
  action: z.string().optional(),
  fromTimestamp: z.string().optional(),
  toTimestamp: z.string().optional(),
  limit: z.number().default(100),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AuditQuery = z.infer<typeof AuditQuerySchema>;

// ==================== Audit Management ====================
interface AuditRecord extends AuditEvent {
  hash: string;
  signature: string; // In production, this would be a real cryptographic signature
}

class AuditManager {
  private events: AuditRecord[] = [];
  private lastHash: string = '';

  async logEvent(event: AuditEvent): Promise<AuditRecord> {
    const eventData = {
      ...event,
      previousHash: this.lastHash,
    };

    // Create SHA-256 hash of the event data
    const hash = this.calculateHash(JSON.stringify(eventData));
    
    const record: AuditRecord = {
      ...eventData,
      hash,
      signature: `signed_${hash}`, // Simplified signature
    };

    this.events.push(record);
    this.lastHash = hash;
    
    return record;
  }

  async queryEvents(query: AuditQuery): Promise<AuditRecord[]> {
    let filtered = [...this.events];

    if (query.patientId) {
      filtered = filtered.filter(e => e.patientId === query.patientId);
    }

    if (query.agentId) {
      filtered = filtered.filter(e => e.agentId === query.agentId);
    }

    if (query.action) {
      filtered = filtered.filter(e => e.action.toLowerCase().includes(query.action!.toLowerCase()));
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

  async verifyAuditTrail(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
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

  async getAuditStatistics(): Promise<{
    totalEvents: number;
    eventsByAgent: Record<string, number>;
    eventsByAction: Record<string, number>;
    timeRange: { earliest: string; latest: string } | null;
  }> {
    if (this.events.length === 0) {
      return {
        totalEvents: 0,
        eventsByAgent: {},
        eventsByAction: {},
        timeRange: null,
      };
    }

    const eventsByAgent: Record<string, number> = {};
    const eventsByAction: Record<string, number> = {};
    
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

  private calculateHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
}

// ==================== MCP Server Implementation ====================
const auditManager = new AuditManager();

const server = new Server(
  {
    name: 'atlas-mcp-audit',
    version: '1.0.0',
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
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
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'log_audit_event': {
        const auditEvent = AuditEventSchema.parse(args);
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
        const query = AuditQuerySchema.parse(args);
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
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid arguments: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
});

// ==================== Server Startup ====================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ATLAS MCP Audit Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
