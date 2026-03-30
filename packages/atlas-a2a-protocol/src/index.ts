// ATLAS A2A Protocol - Agent-to-Agent Communication using SHARP Extension Specs
import { z } from 'zod';

// ==================== SHARP Protocol Schemas ====================
export const A2AMessageSchema = z.object({
  messageId: z.string(),
  timestamp: z.string(),
  fromAgent: z.string(),
  toAgent: z.string(),
  messageType: z.enum(['REQUEST', 'RESPONSE', 'NOTIFICATION', 'HANDOFF']),
  protocolVersion: z.string().default('1.0'),
  sessionId: z.string(),
  patientId: z.string(),
  payload: z.record(z.any()),
  signature: z.string().optional(), // For message integrity
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  requiresResponse: z.boolean().default(false),
  correlationId: z.string().optional(), // For request-response correlation
});

export const HandoffSchema = z.object({
  handoffId: z.string(),
  fromAgent: z.string(),
  toAgent: z.string(),
  handoffType: z.enum(['CARE_COORDINATION', 'ESCALATION', 'REFERRAL', 'INFO_SHARING']),
  patientId: z.string(),
  sessionId: z.string(),
  context: z.record(z.any()),
  urgency: z.enum(['ROUTINE', 'URGENT', 'EMERGENT']),
  requiredCapabilities: z.array(z.string()).optional(),
  timeline: z.object({
    requested: z.string(),
    accepted: z.string().optional(),
    completed: z.string().optional(),
    failed: z.string().optional(),
  }),
  status: z.enum(['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'TIMEOUT']),
});

export const AgentCapabilitySchema = z.object({
  agentId: z.string(),
  agentType: z.enum(['TRIAGE', 'REFERRAL', 'MEDICATION', 'NOTIFICATION', 'COORDINATOR']),
  capabilities: z.array(z.string()),
  supportedMessageTypes: z.array(z.string()),
  fhirResources: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  endpoint: z.string().optional(),
  lastHeartbeat: z.string(),
});

export type A2AMessage = z.infer<typeof A2AMessageSchema>;
export type Handoff = z.infer<typeof HandoffSchema>;
export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;

// ==================== A2A Protocol Implementation ====================
export class A2AProtocolManager {
  private agents = new Map<string, AgentCapability>();
  private messageHandlers = new Map<string, (message: A2AMessage) => Promise<A2AMessage | void>>();
  private activeHandoffs = new Map<string, Handoff>();

  constructor() {
    this.initializeDefaultAgents();
  }

  // ==================== Agent Registration ====================
  registerAgent(capability: AgentCapability): void {
    this.agents.set(capability.agentId, capability);
    console.log(`Agent registered: ${capability.agentId} (${capability.agentType})`);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`Agent unregistered: ${agentId}`);
  }

  getActiveAgents(): AgentCapability[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === 'ACTIVE')
      .sort((a, b) => new Date(b.lastHeartbeat).getTime() - new Date(a.lastHeartbeat).getTime());
  }

  findAgentsByCapability(capability: string): AgentCapability[] {
    return this.getActiveAgents().filter(agent => 
      agent.capabilities.includes(capability)
    );
  }

  // ==================== Message Handling ====================
  registerMessageHandler(agentId: string, handler: (message: A2AMessage) => Promise<A2AMessage | void>): void {
    this.messageHandlers.set(agentId, handler);
  }

  async sendMessage(message: A2AMessage): Promise<A2AMessage | null> {
    const targetAgent = this.agents.get(message.toAgent);
    
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${message.toAgent}`);
    }

    if (targetAgent.status !== 'ACTIVE') {
      throw new Error(`Target agent not active: ${message.toAgent} (${targetAgent.status})`);
    }

    // Validate message
    const validatedMessage = A2AMessageSchema.parse(message);

    // Add signature in production
    validatedMessage.signature = this.generateSignature(validatedMessage);

    console.log(`Sending message: ${message.fromAgent} -> ${message.toAgent} (${message.messageType})`);

    // Route to target agent
    const handler = this.messageHandlers.get(message.toAgent);
    if (handler) {
      try {
        const response = await handler(validatedMessage);
        return response;
      } catch (error) {
        console.error(`Message handling failed for ${message.toAgent}:`, error);
        return null;
      }
    }

    // If no handler, treat as delivered
    return null;
  }

  async broadcastMessage(fromAgent: string, messageType: string, payload: any, priority = 'NORMAL'): Promise<void> {
    const activeAgents = this.getActiveAgents().filter(agent => agent.agentId !== fromAgent);
    
    const promises = activeAgents.map(agent => 
      this.sendMessage({
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        fromAgent,
        toAgent: agent.agentId,
        messageType: messageType as any,
        sessionId: 'broadcast',
        patientId: 'system',
        payload,
        priority: priority as any,
        requiresResponse: false,
      })
    );

    await Promise.allSettled(promises);
  }

  // ==================== Handoff Management ====================
  async initiateHandoff(handoff: Handoff): Promise<Handoff> {
    const validatedHandoff = HandoffSchema.parse(handoff);
    validatedHandoff.status = 'PENDING';
    validatedHandoff.timeline.requested = new Date().toISOString();

    this.activeHandoffs.set(validatedHandoff.handoffId, validatedHandoff);

    // Send handoff request to target agent
    const handoffMessage: A2AMessage = {
      messageId: `handoff_${validatedHandoff.handoffId}`,
      timestamp: new Date().toISOString(),
      fromAgent: validatedHandoff.fromAgent,
      toAgent: validatedHandoff.toAgent,
      messageType: 'HANDOFF',
      sessionId: validatedHandoff.sessionId,
      patientId: validatedHandoff.patientId,
      payload: {
        handoffType: validatedHandoff.handoffType,
        context: validatedHandoff.context,
        urgency: validatedHandoff.urgency,
        requiredCapabilities: validatedHandoff.requiredCapabilities,
      },
      priority: validatedHandoff.urgency === 'EMERGENT' ? 'URGENT' : 'NORMAL',
      requiresResponse: true,
    };

    await this.sendMessage(handoffMessage);
    return validatedHandoff;
  }

  async acceptHandoff(handoffId: string, acceptingAgent: string): Promise<Handoff> {
    const handoff = this.activeHandoffs.get(handoffId);
    if (!handoff) {
      throw new Error(`Handoff not found: ${handoffId}`);
    }

    if (handoff.toAgent !== acceptingAgent) {
      throw new Error(`Agent ${acceptingAgent} not authorized to accept handoff ${handoffId}`);
    }

    handoff.status = 'ACCEPTED';
    handoff.timeline.accepted = new Date().toISOString();

    // Send acceptance notification
    await this.sendMessage({
      messageId: `accept_${handoffId}`,
      timestamp: new Date().toISOString(),
      fromAgent: acceptingAgent,
      toAgent: handoff.fromAgent,
      messageType: 'RESPONSE',
      sessionId: handoff.sessionId,
      patientId: handoff.patientId,
      payload: { handoffId, status: 'ACCEPTED' },
      correlationId: `handoff_${handoffId}`,
    });

    return handoff;
  }

  async completeHandoff(handoffId: string, result: any): Promise<Handoff> {
    const handoff = this.activeHandoffs.get(handoffId);
    if (!handoff) {
      throw new Error(`Handoff not found: ${handoffId}`);
    }

    handoff.status = 'COMPLETED';
    handoff.timeline.completed = new Date().toISOString();

    // Send completion notification
    await this.sendMessage({
      messageId: `complete_${handoffId}`,
      timestamp: new Date().toISOString(),
      fromAgent: handoff.toAgent,
      toAgent: handoff.fromAgent,
      messageType: 'RESPONSE',
      sessionId: handoff.sessionId,
      patientId: handoff.patientId,
      payload: { handoffId, status: 'COMPLETED', result },
      correlationId: `handoff_${handoffId}`,
    });

    return handoff;
  }

  getActiveHandoffs(): Handoff[] {
    return Array.from(this.activeHandoffs.values())
      .filter(handoff => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(handoff.status));
  }

  // ==================== Agent Discovery ====================
  async discoverAgents(criteria: {
    agentType?: string;
    capability?: string;
    fhirResource?: string;
  }): Promise<AgentCapability[]> {
    let agents = this.getActiveAgents();

    if (criteria.agentType) {
      agents = agents.filter(agent => agent.agentType === criteria.agentType);
    }

    if (criteria.capability) {
      agents = agents.filter(agent => agent.capabilities.includes(criteria.capability!));
    }

    if (criteria.fhirResource) {
      agents = agents.filter(agent => 
        agent.fhirResources?.includes(criteria.fhirResource!)
      );
    }

    return agents;
  }

  // ==================== Health Monitoring ====================
  updateHeartbeat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date().toISOString();
    }
  }

  getStaleAgents(timeoutMinutes = 5): AgentCapability[] {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return Array.from(this.agents.values())
      .filter(agent => new Date(agent.lastHeartbeat) < cutoff)
      .filter(agent => agent.status === 'ACTIVE');
  }

  // ==================== Private Methods ====================
  private initializeDefaultAgents(): void {
    // Register default ATLAS agents
    this.registerAgent({
      agentId: 'atlas-agent-coordinator',
      agentType: 'COORDINATOR',
      capabilities: ['WORKFLOW_ORCHESTRATION', 'CARE_COORDINATION', 'SESSION_MANAGEMENT'],
      supportedMessageTypes: ['REQUEST', 'RESPONSE', 'NOTIFICATION', 'HANDOFF'],
      fhirResources: ['Patient', 'Encounter', 'ServiceRequest'],
      status: 'ACTIVE',
      lastHeartbeat: new Date().toISOString(),
    });

    this.registerAgent({
      agentId: 'atlas-agent-triage',
      agentType: 'TRIAGE',
      capabilities: ['SYMPTOM_ANALYSIS', 'URGENCY_ASSESSMENT', 'DIFFERENTIAL_DIAGNOSIS'],
      supportedMessageTypes: ['REQUEST', 'RESPONSE'],
      fhirResources: ['Patient', 'Observation', 'Condition'],
      status: 'ACTIVE',
      lastHeartbeat: new Date().toISOString(),
    });

    this.registerAgent({
      agentId: 'atlas-agent-referral',
      agentType: 'REFERRAL',
      capabilities: ['SPECIALIST_MATCHING', 'APPOINTMENT_SCHEDULING', 'FACILITY_SELECTION'],
      supportedMessageTypes: ['REQUEST', 'RESPONSE'],
      fhirResources: ['ServiceRequest', 'HealthcareService', 'Location'],
      status: 'ACTIVE',
      lastHeartbeat: new Date().toISOString(),
    });

    this.registerAgent({
      agentId: 'atlas-agent-meds',
      agentType: 'MEDICATION',
      capabilities: ['MEDICATION_REVIEW', 'INTERACTION_CHECKING', 'CONTRAINDICATION_ASSESSMENT'],
      supportedMessageTypes: ['REQUEST', 'RESPONSE'],
      fhirResources: ['MedicationRequest', 'Medication', 'AllergyIntolerance'],
      status: 'ACTIVE',
      lastHeartbeat: new Date().toISOString(),
    });

    this.registerAgent({
      agentId: 'atlas-agent-proxy',
      agentType: 'NOTIFICATION',
      capabilities: ['PATIENT_NOTIFICATION', 'PROVIDER_ALERTING', 'INSTRUCTION_DELIVERY'],
      supportedMessageTypes: ['REQUEST', 'RESPONSE', 'NOTIFICATION'],
      status: 'ACTIVE',
      lastHeartbeat: new Date().toISOString(),
    });
  }

  private generateSignature(message: A2AMessage): string {
    // In production, this would use real cryptographic signing
    const data = JSON.stringify(message);
    return `signed_${Buffer.from(data).toString('base64').slice(0, 16)}`;
  }
}

// ==================== SHARP Extension Integration ====================
export class SHARPExtensionAdapter {
  constructor(private a2aManager: A2AProtocolManager) {}

  // Convert SHARP handoff requests to A2A protocol
  async handleSHARPHandoff(sharpRequest: any): Promise<Handoff> {
    const handoff: Handoff = {
      handoffId: sharpRequest.handoffId || `sharp_${Date.now()}`,
      fromAgent: sharpRequest.fromAgent || 'sharp-system',
      toAgent: sharpRequest.toAgent,
      handoffType: 'CARE_COORDINATION',
      patientId: sharpRequest.patientId,
      sessionId: sharpRequest.sessionId,
      context: sharpRequest.context || {},
      urgency: sharpRequest.urgency || 'ROUTINE',
      timeline: {
        requested: new Date().toISOString(),
      },
      status: 'PENDING',
    };

    return await this.a2aManager.initiateHandoff(handoff);
  }

  // Export A2A capabilities in SHARP format
  exportSHARPCapabilities(): any {
    const agents = this.a2aManager.getActiveAgents();
    
    return {
      specification: 'SHARP-Extension-Specs/v1.0',
      agents: agents.map(agent => ({
        agentId: agent.agentId,
        agentType: agent.agentType,
        capabilities: agent.capabilities,
        supportedResources: agent.fhirResources || [],
        endpoints: agent.endpoint ? [agent.endpoint] : [],
        protocols: ['A2A/v1.0', 'SHARP/v1.0'],
      })),
    };
  }
}

// ==================== Exports ====================
export type { A2AMessage, Handoff, AgentCapability };
