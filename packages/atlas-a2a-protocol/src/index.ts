<<<<<<< HEAD
// a2a-protocol.ts
// ATLAS A2A Protocol – Agent-to-Agent Communication using SHARP Extension Specs

import { randomUUID } from 'crypto';
import { Mutex } from 'async-mutex';
import { z } from 'zod';
import {
  SHARPExtensionManager,
  SHARPContext,
  SHARPHandoff,
} from './sharp-extension';

// ==================== Configuration ====================
export interface A2AConfig {
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  enableCache: boolean;
  cacheTTLMs: number;
  handoffTimeoutMs: number;
  heartbeatTimeoutMinutes: number;
}

const defaultConfig: A2AConfig = {
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
  enableCache: true,
  cacheTTLMs: 300_000, // 5 minutes
  handoffTimeoutMs: 30_000, // 30 seconds
  heartbeatTimeoutMinutes: 5,
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Errors ====================
export class A2AError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'A2AError';
  }
}

export class AgentNotFoundError extends A2AError {
  constructor(agentId: string) {
    super('AGENT_NOT_FOUND', `Agent ${agentId} not found`);
  }
}

export class HandoffNotFoundError extends A2AError {
  constructor(handoffId: string) {
    super('HANDOFF_NOT_FOUND', `Handoff ${handoffId} not found`);
  }
}

export class UnauthorizedHandoffError extends A2AError {
  constructor(agentId: string, handoffId: string) {
    super('UNAUTHORIZED_HANDOFF', `Agent ${agentId} not authorized to accept handoff ${handoffId}`);
  }
}

// ==================== Hooks ====================
export interface A2AHooks {
  onAgentRegistered?: (agent: AgentCapability) => void;
  onAgentUnregistered?: (agentId: string) => void;
  onMessageSent?: (message: A2AMessage) => void;
  onMessageReceived?: (message: A2AMessage) => void;
  onHandoffInitiated?: (handoff: Handoff) => void;
  onHandoffAccepted?: (handoff: Handoff) => void;
  onHandoffCompleted?: (handoff: Handoff) => void;
  onHandoffFailed?: (handoff: Handoff, error: Error) => void;
}

class NoopHooks implements A2AHooks {}

// ==================== Schemas ====================
=======
// ATLAS A2A Protocol - Agent-to-Agent Communication using SHARP Extension Specs
import { z } from 'zod';

// ==================== SHARP Protocol Schemas ====================
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
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
<<<<<<< HEAD
  signature: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  requiresResponse: z.boolean().default(false),
  correlationId: z.string().optional(),
=======
  signature: z.string().optional(), // For message integrity
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  requiresResponse: z.boolean().default(false),
  correlationId: z.string().optional(), // For request-response correlation
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
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

<<<<<<< HEAD
// ==================== Metrics ====================
interface MetricsSnapshot {
  agentCount: number;
  activeHandoffs: number;
  totalHandoffs: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  lastError?: string;
  operationCounts: Record<string, number>;
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();
  private mutex = new Mutex();

  async recordOperation(
    moduleId: string,
    operation: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.mutex.runExclusive(() => {
      let current = this.metrics.get(moduleId);
      if (!current) {
        current = {
          agentCount: 0,
          activeHandoffs: 0,
          totalHandoffs: 0,
          messagesSent: 0,
          messagesReceived: 0,
          errors: 0,
          operationCounts: {},
        };
      }
      current.operationCounts[operation] = (current.operationCounts[operation] || 0) + 1;
      if (!success && error) {
        current.errors++;
        current.lastError = error;
      }
      this.metrics.set(moduleId, current);
    });
  }

  async updateCounters(
    moduleId: string,
    updates: Partial<MetricsSnapshot>
  ): Promise<void> {
    await this.mutex.runExclusive(() => {
      let current = this.metrics.get(moduleId);
      if (!current) {
        current = {
          agentCount: 0,
          activeHandoffs: 0,
          totalHandoffs: 0,
          messagesSent: 0,
          messagesReceived: 0,
          errors: 0,
          operationCounts: {},
        };
      }
      Object.assign(current, updates);
      this.metrics.set(moduleId, current);
    });
  }

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (moduleId) {
      return this.metrics.get(moduleId) ?? {
        agentCount: 0,
        activeHandoffs: 0,
        totalHandoffs: 0,
        messagesSent: 0,
        messagesReceived: 0,
        errors: 0,
        operationCounts: {},
      };
    }
    return new Map(this.metrics);
  }
}

// ==================== Event Logger ====================
interface EventLog {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  operation: string;
  data: any;
  success: boolean;
}

class EventLogger {
  private events: EventLog[] = [];
  private mutex = new Mutex();

  async log(event: Omit<EventLog, 'id'>): Promise<void> {
    await this.mutex.runExclusive(() => {
      this.events.push({ ...event, id: randomUUID() });
    });
  }

  getEvents(): EventLog[] {
    return [...this.events];
  }
}

// ==================== Tracer ====================
interface Span {
  end(): void;
  setAttribute(key: string, value: unknown): void;
  recordException(error: Error): void;
}

interface Tracer {
  startSpan(name: string, options?: { attributes?: Record<string, unknown> }): Span;
}

class NoopTracer implements Tracer {
  startSpan(): Span {
    return {
      end: () => {},
      setAttribute: () => {},
      recordException: () => {},
    };
  }
}

let globalTracer: Tracer = new NoopTracer();

export function setTracer(tracer: Tracer): void {
  globalTracer = tracer;
}

// ==================== Health Checker ====================
export interface HealthStatus {
  healthy: boolean;
  agents: Map<string, { healthy: boolean; lastHeartbeat?: string }>;
  activeHandoffs: number;
}

class HealthChecker {
  constructor(private config: A2AConfig, private getAgents: () => AgentCapability[], private getActiveHandoffs: () => Handoff[]) {}

  check(): HealthStatus {
    const agents = this.getAgents();
    const agentStatus = new Map<string, { healthy: boolean; lastHeartbeat?: string }>();
    const now = Date.now();
    for (const agent of agents) {
      const lastHeartbeat = new Date(agent.lastHeartbeat).getTime();
      const healthy = now - lastHeartbeat <= this.config.heartbeatTimeoutMinutes * 60 * 1000;
      agentStatus.set(agent.agentId, { healthy, lastHeartbeat: agent.lastHeartbeat });
    }
    const activeHandoffs = this.getActiveHandoffs().length;
    const healthy = Array.from(agentStatus.values()).every(a => a.healthy);
    return { healthy, agents: agentStatus, activeHandoffs };
  }
}

// ==================== Agent Capabilities Cache ====================
class AgentCapabilitiesCache {
  private cache = new Map<string, { capabilities: AgentCapability; expiresAt: number }>();
  private mutex = new Mutex();

  constructor(private ttlMs: number) {}

  async get(agentId: string): Promise<AgentCapability | null> {
    return this.mutex.runExclusive(() => {
      const entry = this.cache.get(agentId);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(agentId);
        return null;
      }
      return entry.capabilities;
    });
  }

  async set(agentId: string, capabilities: AgentCapability): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.cache.set(agentId, { capabilities, expiresAt: Date.now() + this.ttlMs });
    });
  }

  async invalidate(agentId: string): Promise<void> {
    return this.mutex.runExclusive(() => {
      this.cache.delete(agentId);
    });
  }
}

// ==================== A2A Protocol Manager ====================
=======
// ==================== A2A Protocol Implementation ====================
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
export class A2AProtocolManager {
  private agents = new Map<string, AgentCapability>();
  private messageHandlers = new Map<string, (message: A2AMessage) => Promise<A2AMessage | void>>();
  private activeHandoffs = new Map<string, Handoff>();
<<<<<<< HEAD
  private config: A2AConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private healthChecker: HealthChecker;
  private hooks: A2AHooks;
  private cache?: AgentCapabilitiesCache;
  private mutex = new Mutex(); // for shared maps

  constructor(config?: Partial<A2AConfig>, hooks?: A2AHooks) {
    this.config = { ...defaultConfig, ...config };
    this.hooks = hooks || new NoopHooks();
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;
    if (this.config.enableCache) {
      this.cache = new AgentCapabilitiesCache(this.config.cacheTTLMs);
    }
    this.healthChecker = new HealthChecker(
      this.config,
      () => this.getActiveAgents(),
      () => this.getActiveHandoffs()
    );
=======

  constructor() {
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    this.initializeDefaultAgents();
  }

  // ==================== Agent Registration ====================
<<<<<<< HEAD
  async registerAgent(capability: AgentCapability): Promise<Result<void>> {
    const span = this.tracer.startSpan('a2a.registerAgent');
    try {
      const validated = AgentCapabilitySchema.parse(capability);
      await this.mutex.runExclusive(async () => {
        this.agents.set(validated.agentId, validated);
        if (this.cache) await this.cache.set(validated.agentId, validated);
        await this.metrics.updateCounters('a2a', { agentCount: this.agents.size });
        await this.logger.log({
          type: 'AGENT_REGISTERED',
          timestamp: new Date().toISOString(),
          source: 'a2a-manager',
          operation: 'registerAgent',
          data: { agentId: validated.agentId, type: validated.agentType },
          success: true,
        });
      });
      if (this.config.enableHooks) {
        this.hooks.onAgentRegistered?.(validated);
      }
      span.end();
      return { ok: true, value: undefined };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('a2a', 'registerAgent', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async unregisterAgent(agentId: string): Promise<Result<void>> {
    const span = this.tracer.startSpan('a2a.unregisterAgent');
    try {
      await this.mutex.runExclusive(async () => {
        this.agents.delete(agentId);
        if (this.cache) await this.cache.invalidate(agentId);
        await this.metrics.updateCounters('a2a', { agentCount: this.agents.size });
        await this.logger.log({
          type: 'AGENT_UNREGISTERED',
          timestamp: new Date().toISOString(),
          source: 'a2a-manager',
          operation: 'unregisterAgent',
          data: { agentId },
          success: true,
        });
      });
      if (this.config.enableHooks) {
        this.hooks.onAgentUnregistered?.(agentId);
      }
      span.end();
      return { ok: true, value: undefined };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('a2a', 'unregisterAgent', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
=======
  registerAgent(capability: AgentCapability): void {
    this.agents.set(capability.agentId, capability);
    console.log(`Agent registered: ${capability.agentId} (${capability.agentType})`);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`Agent unregistered: ${agentId}`);
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }

  getActiveAgents(): AgentCapability[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === 'ACTIVE')
      .sort((a, b) => new Date(b.lastHeartbeat).getTime() - new Date(a.lastHeartbeat).getTime());
  }

  findAgentsByCapability(capability: string): AgentCapability[] {
<<<<<<< HEAD
    return this.getActiveAgents().filter(agent =>
=======
    return this.getActiveAgents().filter(agent => 
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
      agent.capabilities.includes(capability)
    );
  }

  // ==================== Message Handling ====================
<<<<<<< HEAD
  async registerMessageHandler(
    agentId: string,
    handler: (message: A2AMessage) => Promise<A2AMessage | void>
  ): Promise<Result<void>> {
    const span = this.tracer.startSpan('a2a.registerMessageHandler');
    try {
      await this.mutex.runExclusive(() => {
        this.messageHandlers.set(agentId, handler);
      });
      await this.logger.log({
        type: 'HANDLER_REGISTERED',
        timestamp: new Date().toISOString(),
        source: 'a2a-manager',
        operation: 'registerMessageHandler',
        data: { agentId },
        success: true,
      });
      span.end();
      return { ok: true, value: undefined };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('a2a', 'registerMessageHandler', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async sendMessage(message: A2AMessage): Promise<Result<A2AMessage | null>> {
    const span = this.tracer.startSpan('a2a.sendMessage');
    span.setAttribute('from', message.fromAgent);
    span.setAttribute('to', message.toAgent);
    try {
      const validatedMessage = A2AMessageSchema.parse(message);
      const targetAgent = await this.getAgent(validatedMessage.toAgent);
      if (!targetAgent) {
        throw new AgentNotFoundError(validatedMessage.toAgent);
      }
      if (targetAgent.status !== 'ACTIVE') {
        throw new A2AError('AGENT_INACTIVE', `Agent ${validatedMessage.toAgent} is ${targetAgent.status}`);
      }

      // Add signature (simplified)
      validatedMessage.signature = this.generateSignature(validatedMessage);

      await this.logger.log({
        type: 'MESSAGE_SENT',
        timestamp: new Date().toISOString(),
        source: 'a2a-manager',
        operation: 'sendMessage',
        data: {
          messageId: validatedMessage.messageId,
          from: validatedMessage.fromAgent,
          to: validatedMessage.toAgent,
          type: validatedMessage.messageType,
        },
        success: true,
      });
      await this.metrics.updateCounters('a2a', { messagesSent: 1 });

      if (this.config.enableHooks) {
        this.hooks.onMessageSent?.(validatedMessage);
      }

      // Route to target agent
      const handler = this.messageHandlers.get(validatedMessage.toAgent);
      if (handler) {
        const response = await handler(validatedMessage);
        if (response) {
          await this.metrics.updateCounters('a2a', { messagesReceived: 1 });
          if (this.config.enableHooks) this.hooks.onMessageReceived?.(response);
        }
        span.end();
        return { ok: true, value: response || null };
      }

      span.end();
      return { ok: true, value: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('a2a', 'sendMessage', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async broadcastMessage(
    fromAgent: string,
    messageType: string,
    payload: any,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
  ): Promise<Result<void>> {
    const span = this.tracer.startSpan('a2a.broadcastMessage');
    try {
      const activeAgents = this.getActiveAgents().filter(agent => agent.agentId !== fromAgent);
      const promises = activeAgents.map(async agent => {
        const message: A2AMessage = {
          messageId: randomUUID(),
          timestamp: new Date().toISOString(),
          fromAgent,
          toAgent: agent.agentId,
          messageType: messageType as any,
          sessionId: 'broadcast',
          patientId: 'system',
          payload,
          priority,
          requiresResponse: false,
          protocolVersion: '1.0',
        };
        await this.sendMessage(message);
      });
      await Promise.allSettled(promises);
      span.end();
      return { ok: true, value: undefined };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Handoff Management ====================
  async initiateHandoff(handoff: Handoff): Promise<Result<Handoff>> {
    const span = this.tracer.startSpan('a2a.initiateHandoff');
    try {
      const validatedHandoff = HandoffSchema.parse(handoff);
      validatedHandoff.status = 'PENDING';
      validatedHandoff.timeline.requested = new Date().toISOString();

      await this.mutex.runExclusive(async () => {
        this.activeHandoffs.set(validatedHandoff.handoffId, validatedHandoff);
        await this.metrics.updateCounters('a2a', {
          totalHandoffs: this.activeHandoffs.size,
          activeHandoffs: this.getActiveHandoffsCount(),
        });
        await this.logger.log({
          type: 'HANDOFF_INITIATED',
          timestamp: new Date().toISOString(),
          source: 'a2a-manager',
          operation: 'initiateHandoff',
          data: {
            handoffId: validatedHandoff.handoffId,
            from: validatedHandoff.fromAgent,
            to: validatedHandoff.toAgent,
          },
          success: true,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onHandoffInitiated?.(validatedHandoff);
      }

      // Send handoff request message
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
        protocolVersion: '1.0',
      };
      const sendResult = await this.sendMessage(handoffMessage);
      if (!sendResult.ok) {
        throw sendResult.error;
      }

      span.end();
      return { ok: true, value: validatedHandoff };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('a2a', 'initiateHandoff', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async acceptHandoff(handoffId: string, acceptingAgent: string): Promise<Result<Handoff>> {
    const span = this.tracer.startSpan('a2a.acceptHandoff');
    try {
      const handoff = await this.mutex.runExclusive(() => this.activeHandoffs.get(handoffId));
      if (!handoff) return { ok: false, error: new HandoffNotFoundError(handoffId) };
      if (handoff.toAgent !== acceptingAgent) {
        return { ok: false, error: new UnauthorizedHandoffError(acceptingAgent, handoffId) };
      }

      handoff.status = 'ACCEPTED';
      handoff.timeline.accepted = new Date().toISOString();

      await this.mutex.runExclusive(async () => {
        this.activeHandoffs.set(handoffId, handoff);
        await this.metrics.updateCounters('a2a', { activeHandoffs: this.getActiveHandoffsCount() });
        await this.logger.log({
          type: 'HANDOFF_ACCEPTED',
          timestamp: new Date().toISOString(),
          source: 'a2a-manager',
          operation: 'acceptHandoff',
          data: { handoffId, acceptingAgent },
          success: true,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onHandoffAccepted?.(handoff);
      }

      // Send acceptance notification
      const acceptanceMessage: A2AMessage = {
        messageId: `accept_${handoffId}`,
        timestamp: new Date().toISOString(),
        fromAgent: acceptingAgent,
        toAgent: handoff.fromAgent,
        messageType: 'RESPONSE',
        sessionId: handoff.sessionId,
        patientId: handoff.patientId,
        payload: { handoffId, status: 'ACCEPTED' },
        correlationId: `handoff_${handoffId}`,
        protocolVersion: '1.0',
        priority: 'NORMAL',
        requiresResponse: false,
      };
      await this.sendMessage(acceptanceMessage);

      span.end();
      return { ok: true, value: handoff };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('a2a', 'acceptHandoff', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async completeHandoff(handoffId: string, result: any, completingAgent: string): Promise<Result<Handoff>> {
    const span = this.tracer.startSpan('a2a.completeHandoff');
    try {
      const handoff = await this.mutex.runExclusive(() => this.activeHandoffs.get(handoffId));
      if (!handoff) return { ok: false, error: new HandoffNotFoundError(handoffId) };
      if (handoff.toAgent !== completingAgent) {
        return { ok: false, error: new UnauthorizedHandoffError(completingAgent, handoffId) };
      }

      handoff.status = 'COMPLETED';
      handoff.timeline.completed = new Date().toISOString();

      await this.mutex.runExclusive(async () => {
        this.activeHandoffs.set(handoffId, handoff);
        await this.metrics.updateCounters('a2a', { activeHandoffs: this.getActiveHandoffsCount() });
        await this.logger.log({
          type: 'HANDOFF_COMPLETED',
          timestamp: new Date().toISOString(),
          source: 'a2a-manager',
          operation: 'completeHandoff',
          data: { handoffId, completingAgent },
          success: true,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onHandoffCompleted?.(handoff);
      }

      // Send completion notification
      const completionMessage: A2AMessage = {
        messageId: `complete_${handoffId}`,
        timestamp: new Date().toISOString(),
        fromAgent: completingAgent,
        toAgent: handoff.fromAgent,
        messageType: 'RESPONSE',
        sessionId: handoff.sessionId,
        patientId: handoff.patientId,
        payload: { handoffId, status: 'COMPLETED', result },
        correlationId: `handoff_${handoffId}`,
        protocolVersion: '1.0',
        priority: 'NORMAL',
        requiresResponse: false,
      };
      await this.sendMessage(completionMessage);

      span.end();
      return { ok: true, value: handoff };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('a2a', 'completeHandoff', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async failHandoff(handoffId: string, reason: string, failingAgent: string): Promise<Result<Handoff>> {
    const span = this.tracer.startSpan('a2a.failHandoff');
    try {
      const handoff = await this.mutex.runExclusive(() => this.activeHandoffs.get(handoffId));
      if (!handoff) return { ok: false, error: new HandoffNotFoundError(handoffId) };

      handoff.status = 'FAILED';
      handoff.timeline.failed = new Date().toISOString();

      await this.mutex.runExclusive(async () => {
        this.activeHandoffs.set(handoffId, handoff);
        await this.metrics.updateCounters('a2a', { activeHandoffs: this.getActiveHandoffsCount() });
        await this.logger.log({
          type: 'HANDOFF_FAILED',
          timestamp: new Date().toISOString(),
          source: 'a2a-manager',
          operation: 'failHandoff',
          data: { handoffId, reason, failingAgent },
          success: false,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onHandoffFailed?.(handoff, new Error(reason));
      }

      span.end();
      return { ok: true, value: handoff };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
=======
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
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }

  getActiveHandoffs(): Handoff[] {
    return Array.from(this.activeHandoffs.values())
      .filter(handoff => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(handoff.status));
  }

<<<<<<< HEAD
  private getActiveHandoffsCount(): number {
    let count = 0;
    for (const handoff of this.activeHandoffs.values()) {
      if (['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(handoff.status)) count++;
    }
    return count;
  }

=======
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  // ==================== Agent Discovery ====================
  async discoverAgents(criteria: {
    agentType?: string;
    capability?: string;
    fhirResource?: string;
<<<<<<< HEAD
  }): Promise<Result<AgentCapability[]>> {
    const span = this.tracer.startSpan('a2a.discoverAgents');
    try {
      let agents = this.getActiveAgents();
      if (criteria.agentType) {
        agents = agents.filter(agent => agent.agentType === criteria.agentType);
      }
      if (criteria.capability) {
        agents = agents.filter(agent => agent.capabilities.includes(criteria.capability!));
      }
      if (criteria.fhirResource) {
        agents = agents.filter(agent => agent.fhirResources?.includes(criteria.fhirResource!));
      }
      span.end();
      return { ok: true, value: agents };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Health Monitoring ====================
  async updateHeartbeat(agentId: string): Promise<Result<void>> {
    const span = this.tracer.startSpan('a2a.updateHeartbeat');
    try {
      const agent = await this.getAgent(agentId);
      if (!agent) return { ok: false, error: new AgentNotFoundError(agentId) };
      agent.lastHeartbeat = new Date().toISOString();
      if (this.cache) await this.cache.set(agentId, agent);
      await this.logger.log({
        type: 'HEARTBEAT',
        timestamp: new Date().toISOString(),
        source: 'a2a-manager',
        operation: 'updateHeartbeat',
        data: { agentId },
        success: true,
      });
      span.end();
      return { ok: true, value: undefined };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  getStaleAgents(timeoutMinutes: number = this.config.heartbeatTimeoutMinutes): AgentCapability[] {
=======
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
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return Array.from(this.agents.values())
      .filter(agent => new Date(agent.lastHeartbeat) < cutoff)
      .filter(agent => agent.status === 'ACTIVE');
  }

<<<<<<< HEAD
  // ==================== Observability ====================
  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    return this.metrics.getMetrics(moduleId);
  }

  getEvents(): EventLog[] {
    return this.logger.getEvents();
  }

  getHealth(): HealthStatus {
    return this.healthChecker.check();
  }

  // ==================== Private Helpers ====================
  private async getAgent(agentId: string): Promise<AgentCapability | null> {
    if (this.cache) {
      const cached = await this.cache.get(agentId);
      if (cached) return cached;
    }
    const agent = this.agents.get(agentId);
    if (agent && this.cache) await this.cache.set(agentId, agent);
    return agent || null;
  }

  private initializeDefaultAgents(): void {
    const defaultAgents: AgentCapability[] = [
      {
        agentId: 'atlas-agent-coordinator',
        agentType: 'COORDINATOR',
        capabilities: ['WORKFLOW_ORCHESTRATION', 'CARE_COORDINATION', 'SESSION_MANAGEMENT'],
        supportedMessageTypes: ['REQUEST', 'RESPONSE', 'NOTIFICATION', 'HANDOFF'],
        fhirResources: ['Patient', 'Encounter', 'ServiceRequest'],
        status: 'ACTIVE',
        lastHeartbeat: new Date().toISOString(),
      },
      {
        agentId: 'atlas-agent-triage',
        agentType: 'TRIAGE',
        capabilities: ['SYMPTOM_ANALYSIS', 'URGENCY_ASSESSMENT', 'DIFFERENTIAL_DIAGNOSIS'],
        supportedMessageTypes: ['REQUEST', 'RESPONSE'],
        fhirResources: ['Patient', 'Observation', 'Condition'],
        status: 'ACTIVE',
        lastHeartbeat: new Date().toISOString(),
      },
      {
        agentId: 'atlas-agent-referral',
        agentType: 'REFERRAL',
        capabilities: ['SPECIALIST_MATCHING', 'APPOINTMENT_SCHEDULING', 'FACILITY_SELECTION'],
        supportedMessageTypes: ['REQUEST', 'RESPONSE'],
        fhirResources: ['ServiceRequest', 'HealthcareService', 'Location'],
        status: 'ACTIVE',
        lastHeartbeat: new Date().toISOString(),
      },
      {
        agentId: 'atlas-agent-meds',
        agentType: 'MEDICATION',
        capabilities: ['MEDICATION_REVIEW', 'INTERACTION_CHECKING', 'CONTRAINDICATION_ASSESSMENT'],
        supportedMessageTypes: ['REQUEST', 'RESPONSE'],
        fhirResources: ['MedicationRequest', 'Medication', 'AllergyIntolerance'],
        status: 'ACTIVE',
        lastHeartbeat: new Date().toISOString(),
      },
      {
        agentId: 'atlas-agent-proxy',
        agentType: 'NOTIFICATION',
        capabilities: ['PATIENT_NOTIFICATION', 'PROVIDER_ALERTING', 'INSTRUCTION_DELIVERY'],
        supportedMessageTypes: ['REQUEST', 'RESPONSE', 'NOTIFICATION'],
        status: 'ACTIVE',
        lastHeartbeat: new Date().toISOString(),
      },
    ];

    defaultAgents.forEach(agent => {
      this.registerAgent(agent).catch(console.error);
=======
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
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    });
  }

  private generateSignature(message: A2AMessage): string {
<<<<<<< HEAD
    // Simplified signature; in production, use crypto with a secret key
=======
    // In production, this would use real cryptographic signing
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    const data = JSON.stringify(message);
    return `signed_${Buffer.from(data).toString('base64').slice(0, 16)}`;
  }
}

<<<<<<< HEAD
// ==================== SHARP Integration ====================
export class SHARPIntegration {
  constructor(private a2aManager: A2AProtocolManager) {}

  // Initialize SHARP context for a new session
  initializeSHARPSession(
    patientId: string,
    sessionId: string,
    fhirScopes: string[] = [],
    consentScopes: string[] = []
  ): SHARPContext {
    // This would integrate with the SHARP extension manager
    return {
      patientId,
      sessionId,
      timestamp: new Date().toISOString(),
      propagationToken: `token_${Date.now()}`,
      fhirToken: fhirScopes.length > 0 ? `fhir_${Date.now()}` : undefined,
      consentToken: consentScopes.length > 0 ? `consent_${Date.now()}` : undefined,
      metadata: {},
    };
  }

  // Get FHIR access for a context
  async getFHIRAccess(
    context: SHARPContext,
    requiredScope: string
  ): Promise<Result<{ authorized: boolean; token?: string }>> {
    // Simplified FHIR access check
    return { ok: true, value: { authorized: !!context.fhirToken, token: context.fhirToken } };
  }

  // Get consent access for a context
  async getConsentAccess(
    context: SHARPContext,
    requiredScope: string
  ): Promise<Result<{ authorized: boolean; patientId?: string }>> {
    // Simplified consent access check
    return { ok: true, value: { authorized: !!context.consentToken, patientId: context.patientId } };
  }

  // Create SHARP-compliant handoff
  async createSHARPHandoff(
    fromAgent: string,
    toAgent: string,
    context: SHARPContext,
    urgency: 'ROUTINE' | 'URGENT' | 'EMERGENT' = 'ROUTINE',
    handoffType: 'CARE_COORDINATION' | 'ESCALATION' | 'REFERRAL' | 'INFO_SHARING' = 'CARE_COORDINATION'
  ): Promise<Result<SHARPHandoff>> {
    const handoff: SHARPHandoff = {
      handoffId: `sharp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromAgent,
      toAgent,
      context,
      urgency,
      handoffType,
      requiredCapabilities: [],
      fhirResources: ['Patient', 'Encounter', 'Observation'],
      timeline: { requested: new Date().toISOString() },
      status: 'PENDING',
    };
    return { ok: true, value: handoff };
  }

  // Export SHARP protocol capabilities
  exportSHARPProtocol(): any {
    return {
      specification: 'SHARP-Extension-Specs/v1.0',
      version: '1.0.0',
      capabilities: {
        contextPropagation: true,
        fhirTokenManagement: true,
        consentVerification: true,
        auditLogging: true,
        handoffManagement: true,
      },
    };
  }
}

// ==================== Legacy SHARP Extension Adapter ====================
=======
// ==================== SHARP Extension Integration ====================
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
export class SHARPExtensionAdapter {
  constructor(private a2aManager: A2AProtocolManager) {}

  // Convert SHARP handoff requests to A2A protocol
<<<<<<< HEAD
  async handleSHARPHandoff(sharpRequest: any): Promise<Result<Handoff>> {
=======
  async handleSHARPHandoff(sharpRequest: any): Promise<Handoff> {
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
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
<<<<<<< HEAD
    return this.a2aManager.initiateHandoff(handoff);
=======

    return await this.a2aManager.initiateHandoff(handoff);
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }

  // Export A2A capabilities in SHARP format
  exportSHARPCapabilities(): any {
    const agents = this.a2aManager.getActiveAgents();
<<<<<<< HEAD
=======
    
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
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

<<<<<<< HEAD
// ==================== Factory ====================
export function createA2AProtocolManager(
  config?: Partial<A2AConfig>,
  hooks?: A2AHooks
): A2AProtocolManager {
  return new A2AProtocolManager(config, hooks);
}
=======
// ==================== Exports ====================
export type { A2AMessage, Handoff, AgentCapability };
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
