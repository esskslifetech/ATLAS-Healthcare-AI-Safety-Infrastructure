// sharp-extension.ts
// SHARP Extension Specs Implementation
// Prompt Opinion SHARP Extension Specs for context propagation

import { randomUUID } from 'crypto';
import { Mutex } from 'async-mutex';
import { z } from 'zod';
import crypto from 'crypto';

// ==================== Configuration ====================
export interface SHARPConfig {
  secretKey: string;
  fhirTokenTTLMs: number;
  consentTokenTTLMs: number;
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  enableCache: boolean;
  cacheTTLMs: number;
}

const defaultConfig: SHARPConfig = {
  secretKey: crypto.randomBytes(32).toString('hex'),
  fhirTokenTTLMs: 60 * 60 * 1000,   // 1 hour
  consentTokenTTLMs: 24 * 60 * 60 * 1000, // 24 hours
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
  enableCache: true,
  cacheTTLMs: 300_000, // 5 minutes
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Errors ====================
export class SHARPError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'SHARPError';
  }
}

export class ContextNotFoundError extends SHARPError {
  constructor(sessionId: string) {
    super('CONTEXT_NOT_FOUND', `Context for session ${sessionId} not found`);
  }
}

export class HandoffNotFoundError extends SHARPError {
  constructor(handoffId: string) {
    super('HANDOFF_NOT_FOUND', `Handoff ${handoffId} not found`);
  }
}

export class AgentNotFoundError extends SHARPError {
  constructor(agentId: string) {
    super('AGENT_NOT_FOUND', `Agent ${agentId} not registered`);
  }
}

// ==================== Hooks ====================
export interface SHARPHooks {
  onAgentRegistered?: (agent: SHARPAgentCapability) => void;
  onHandoffInitiated?: (handoff: SHARPHandoff) => void;
  onHandoffAccepted?: (handoff: SHARPHandoff) => void;
  onHandoffCompleted?: (handoff: SHARPHandoff) => void;
  onContextCreated?: (context: SHARPContext) => void;
  onTokenGenerated?: (type: string, patientId: string) => void;
}

class NoopHooks implements SHARPHooks {}

// ==================== Core Schemas ====================
export const SHARPContextSchema = z.object({
  patientId: z.string(),
  fhirToken: z.string().optional(),
  consentToken: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.string(),
  propagationToken: z.string(), // Cryptographic token for context propagation
  metadata: z.record(z.any()).optional(),
});

export const SHARPHandoffSchema = z.object({
  handoffId: z.string(),
  fromAgent: z.string(),
  toAgent: z.string(),
  context: SHARPContextSchema,
  urgency: z.enum(['ROUTINE', 'URGENT', 'EMERGENT']),
  handoffType: z.enum(['CARE_COORDINATION', 'ESCALATION', 'REFERRAL', 'INFO_SHARING']),
  requiredCapabilities: z.array(z.string()).optional(),
  fhirResources: z.array(z.string()).optional(),
  timeline: z.object({
    requested: z.string(),
    accepted: z.string().optional(),
    completed: z.string().optional(),
    failed: z.string().optional(),
  }),
  status: z.enum(['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'TIMEOUT']),
  auditTrail: z.array(z.object({
    timestamp: z.string(),
    agent: z.string(),
    action: z.string(),
    signature: z.string(),
  })).optional(),
});

export const SHARPAgentCapabilitySchema = z.object({
  agentId: z.string(),
  agentType: z.enum(['TRIAGE', 'REFERRAL', 'MEDICATION', 'NOTIFICATION', 'COORDINATOR']),
  capabilities: z.array(z.string()),
  supportedSHARPOperations: z.array(z.enum([
    'CONTEXT_PROPAGATION',
    'FHIR_ACCESS',
    'CONSENT_VERIFICATION',
    'AUDIT_LOGGING',
    'HANDOFF_MANAGEMENT'
  ])),
  fhirResources: z.array(z.string()).optional(),
  endpoints: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  lastHeartbeat: z.string(),
  sharpVersion: z.string().default('1.0'),
});

export type SHARPContext = z.infer<typeof SHARPContextSchema>;
export type SHARPHandoff = z.infer<typeof SHARPHandoffSchema>;
export type SHARPAgentCapability = z.infer<typeof SHARPAgentCapabilitySchema>;

// ==================== Metrics ====================
interface MetricsSnapshot {
  agentCount: number;
  activeHandoffs: number;
  totalHandoffs: number;
  contextCount: number;
  tokenGenerationCount: number;
  tokenValidationSuccess: number;
  tokenValidationFailure: number;
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
          contextCount: 0,
          tokenGenerationCount: 0,
          tokenValidationSuccess: 0,
          tokenValidationFailure: 0,
          operationCounts: {},
        };
      }
      current.operationCounts[operation] = (current.operationCounts[operation] || 0) + 1;
      if (!success && error) current.lastError = error;
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
          contextCount: 0,
          tokenGenerationCount: 0,
          tokenValidationSuccess: 0,
          tokenValidationFailure: 0,
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
        contextCount: 0,
        tokenGenerationCount: 0,
        tokenValidationSuccess: 0,
        tokenValidationFailure: 0,
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
  services: Map<string, { healthy: boolean; lastFailure?: string }>;
}

class HealthChecker {
  constructor(private config: SHARPConfig) {}

  check(): HealthStatus {
    // For SHARP, health is mostly internal; we can check if secretKey exists.
    const healthy = !!this.config.secretKey;
    const services = new Map<string, { healthy: boolean }>();
    services.set('sharp-manager', { healthy });
    return { healthy, services };
  }
}

// ==================== Agent Capabilities Cache ====================
class AgentCapabilitiesCache {
  private cache = new Map<string, { capabilities: SHARPAgentCapability; expiresAt: number }>();
  private mutex = new Mutex();

  constructor(private ttlMs: number) {}

  async get(agentId: string): Promise<SHARPAgentCapability | null> {
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

  async set(agentId: string, capabilities: SHARPAgentCapability): Promise<void> {
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

// ==================== SHARP Extension Manager ====================
export class SHARPExtensionManager {
  private agents = new Map<string, SHARPAgentCapability>();
  private activeHandoffs = new Map<string, SHARPHandoff>();
  private contextStore = new Map<string, SHARPContext>();
  private secretKey: string;
  private config: SHARPConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private healthChecker: HealthChecker;
  private hooks: SHARPHooks;
  private cache?: AgentCapabilitiesCache;
  private mutex = new Mutex(); // for shared state

  constructor(config?: Partial<SHARPConfig>, hooks?: SHARPHooks) {
    this.config = { ...defaultConfig, ...config };
    this.secretKey = this.config.secretKey;
    this.hooks = hooks || new NoopHooks();
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;
    this.healthChecker = new HealthChecker(this.config);
    if (this.config.enableCache) {
      this.cache = new AgentCapabilitiesCache(this.config.cacheTTLMs);
    }
  }

  // ==================== Agent Registration ====================
  async registerAgent(capability: SHARPAgentCapability): Promise<Result<void>> {
    const span = this.tracer.startSpan('sharp.registerAgent');
    try {
      const validated = SHARPAgentCapabilitySchema.parse(capability);
      await this.mutex.runExclusive(async () => {
        this.agents.set(validated.agentId, validated);
        if (this.cache) {
          await this.cache.set(validated.agentId, validated);
        }
        await this.metrics.updateCounters('sharp', { agentCount: this.agents.size });
        await this.logger.log({
          type: 'AGENT_REGISTERED',
          timestamp: new Date().toISOString(),
          source: 'sharp-manager',
          operation: 'registerAgent',
          data: { agentId: validated.agentId, version: validated.sharpVersion },
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
      await this.metrics.recordOperation('sharp', 'registerAgent', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async getActiveAgents(): Promise<Result<SHARPAgentCapability[]>> {
    const span = this.tracer.startSpan('sharp.getActiveAgents');
    try {
      const agents = Array.from(this.agents.values())
        .filter(agent => agent.status === 'ACTIVE')
        .sort((a, b) => new Date(b.lastHeartbeat).getTime() - new Date(a.lastHeartbeat).getTime());
      span.end();
      return { ok: true, value: agents };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async findAgentsByCapability(capability: string): Promise<Result<SHARPAgentCapability[]>> {
    const span = this.tracer.startSpan('sharp.findAgentsByCapability');
    try {
      const agentsResult = await this.getActiveAgents();
      if (!agentsResult.ok) throw agentsResult.error;
      const filtered = agentsResult.value.filter(agent =>
        agent.capabilities.includes(capability)
      );
      span.end();
      return { ok: true, value: filtered };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Context Management ====================
  async createContext(
    patientId: string,
    sessionId: string,
    fhirToken?: string,
    consentToken?: string
  ): Promise<Result<SHARPContext>> {
    const span = this.tracer.startSpan('sharp.createContext');
    try {
      const timestamp = new Date().toISOString();
      const propagationToken = this.generatePropagationToken(patientId, sessionId, timestamp);

      const context: SHARPContext = {
        patientId,
        sessionId,
        timestamp,
        propagationToken,
        fhirToken,
        consentToken,
        metadata: {},
      };

      await this.mutex.runExclusive(async () => {
        this.contextStore.set(sessionId, context);
        await this.metrics.updateCounters('sharp', { contextCount: this.contextStore.size });
        await this.logger.log({
          type: 'CONTEXT_CREATED',
          timestamp: new Date().toISOString(),
          source: 'sharp-manager',
          operation: 'createContext',
          data: { patientId, sessionId },
          success: true,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onContextCreated?.(context);
      }

      span.end();
      return { ok: true, value: context };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('sharp', 'createContext', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async validateContext(context: SHARPContext): Promise<Result<boolean>> {
    const span = this.tracer.startSpan('sharp.validateContext');
    try {
      SHARPContextSchema.parse(context);
      const expectedToken = this.generatePropagationToken(
        context.patientId,
        context.sessionId,
        context.timestamp
      );
      const valid = context.propagationToken === expectedToken;
      span.end();
      return { ok: true, value: valid };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async propagateContext(sessionId: string, targetAgent: string): Promise<Result<SHARPContext>> {
    const span = this.tracer.startSpan('sharp.propagateContext');
    try {
      const context = await this.mutex.runExclusive(() => this.contextStore.get(sessionId));
      if (!context) return { ok: false, error: new ContextNotFoundError(sessionId) };

      const validation = await this.validateContext(context);
      if (!validation.ok) return { ok: false, error: validation.error };
      if (!validation.value) {
        return { ok: false, error: new SHARPError('INVALID_CONTEXT', 'Context validation failed') };
      }

      const propagatedContext: SHARPContext = {
        ...context,
        timestamp: new Date().toISOString(),
        metadata: {
          ...context.metadata,
          propagatedTo: targetAgent,
          propagatedAt: new Date().toISOString(),
        },
      };
      propagatedContext.propagationToken = this.generatePropagationToken(
        propagatedContext.patientId,
        propagatedContext.sessionId,
        propagatedContext.timestamp
      );

      span.end();
      return { ok: true, value: propagatedContext };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Handoff Management ====================
  async initiateHandoff(
    handoff: Omit<SHARPHandoff, 'timeline' | 'status' | 'auditTrail'>
  ): Promise<Result<SHARPHandoff>> {
    const span = this.tracer.startSpan('sharp.initiateHandoff');
    try {
      const validatedHandoff: SHARPHandoff = {
        ...handoff,
        timeline: { requested: new Date().toISOString() },
        status: 'PENDING',
        auditTrail: [{
          timestamp: new Date().toISOString(),
          agent: handoff.fromAgent,
          action: 'HANDOFF_INITIATED',
          signature: this.signAction(handoff.fromAgent, 'HANDOFF_INITIATED', handoff.handoffId),
        }],
      };

      SHARPHandoffSchema.parse(validatedHandoff);

      await this.mutex.runExclusive(async () => {
        this.activeHandoffs.set(validatedHandoff.handoffId, validatedHandoff);
        await this.metrics.updateCounters('sharp', {
          totalHandoffs: this.activeHandoffs.size,
          activeHandoffs: this.getActiveHandoffsCount(),
        });
        await this.logger.log({
          type: 'HANDOFF_INITIATED',
          timestamp: new Date().toISOString(),
          source: 'sharp-manager',
          operation: 'initiateHandoff',
          data: { handoffId: validatedHandoff.handoffId, from: handoff.fromAgent, to: handoff.toAgent },
          success: true,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onHandoffInitiated?.(validatedHandoff);
      }

      span.end();
      return { ok: true, value: validatedHandoff };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('sharp', 'initiateHandoff', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async acceptHandoff(handoffId: string, acceptingAgent: string): Promise<Result<SHARPHandoff>> {
    const span = this.tracer.startSpan('sharp.acceptHandoff');
    try {
      const handoff = await this.mutex.runExclusive(() => this.activeHandoffs.get(handoffId));
      if (!handoff) return { ok: false, error: new HandoffNotFoundError(handoffId) };
      if (handoff.toAgent !== acceptingAgent) {
        return {
          ok: false,
          error: new SHARPError('UNAUTHORIZED', `Agent ${acceptingAgent} not authorized to accept handoff ${handoffId}`),
        };
      }

      handoff.status = 'ACCEPTED';
      handoff.timeline.accepted = new Date().toISOString();
      handoff.auditTrail = handoff.auditTrail || [];
      handoff.auditTrail.push({
        timestamp: new Date().toISOString(),
        agent: acceptingAgent,
        action: 'HANDOFF_ACCEPTED',
        signature: this.signAction(acceptingAgent, 'HANDOFF_ACCEPTED', handoffId),
      });

      await this.mutex.runExclusive(async () => {
        this.activeHandoffs.set(handoffId, handoff);
        await this.metrics.updateCounters('sharp', { activeHandoffs: this.getActiveHandoffsCount() });
        await this.logger.log({
          type: 'HANDOFF_ACCEPTED',
          timestamp: new Date().toISOString(),
          source: 'sharp-manager',
          operation: 'acceptHandoff',
          data: { handoffId, acceptingAgent },
          success: true,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onHandoffAccepted?.(handoff);
      }

      span.end();
      return { ok: true, value: handoff };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('sharp', 'acceptHandoff', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async completeHandoff(handoffId: string, result: any, completingAgent: string): Promise<Result<SHARPHandoff>> {
    const span = this.tracer.startSpan('sharp.completeHandoff');
    try {
      const handoff = await this.mutex.runExclusive(() => this.activeHandoffs.get(handoffId));
      if (!handoff) return { ok: false, error: new HandoffNotFoundError(handoffId) };

      handoff.status = 'COMPLETED';
      handoff.timeline.completed = new Date().toISOString();
      handoff.auditTrail = handoff.auditTrail || [];
      handoff.auditTrail.push({
        timestamp: new Date().toISOString(),
        agent: completingAgent,
        action: 'HANDOFF_COMPLETED',
        signature: this.signAction(completingAgent, 'HANDOFF_COMPLETED', handoffId),
      });

      // Store result in context metadata
      const context = this.contextStore.get(handoff.context.sessionId);
      if (context) {
        context.metadata = {
          ...context.metadata,
          handoffResult: result,
          completedAt: new Date().toISOString(),
        };
      }

      await this.mutex.runExclusive(async () => {
        this.activeHandoffs.set(handoffId, handoff);
        await this.metrics.updateCounters('sharp', { activeHandoffs: this.getActiveHandoffsCount() });
        await this.logger.log({
          type: 'HANDOFF_COMPLETED',
          timestamp: new Date().toISOString(),
          source: 'sharp-manager',
          operation: 'completeHandoff',
          data: { handoffId, completingAgent },
          success: true,
        });
      });

      if (this.config.enableHooks) {
        this.hooks.onHandoffCompleted?.(handoff);
      }

      span.end();
      return { ok: true, value: handoff };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.metrics.recordOperation('sharp', 'completeHandoff', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async getActiveHandoffs(): Promise<Result<SHARPHandoff[]>> {
    const span = this.tracer.startSpan('sharp.getActiveHandoffs');
    try {
      const active = Array.from(this.activeHandoffs.values())
        .filter(handoff => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(handoff.status));
      span.end();
      return { ok: true, value: active };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  private getActiveHandoffsCount(): number {
    let count = 0;
    for (const handoff of this.activeHandoffs.values()) {
      if (['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(handoff.status)) count++;
    }
    return count;
  }

  // ==================== FHIR Token Management ====================
  generateFHIRToken(patientId: string, scopes: string[]): Result<string> {
    const span = this.tracer.startSpan('sharp.generateFHIRToken');
    try {
      const payload = {
        patientId,
        scopes,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.config.fhirTokenTTLMs).toISOString(),
      };
      const token = this.signToken(payload);
      this.metrics.updateCounters('sharp', { tokenGenerationCount: 1 }).catch(console.error);
      this.logger.log({
        type: 'TOKEN_GENERATED',
        timestamp: new Date().toISOString(),
        source: 'sharp-manager',
        operation: 'generateFHIRToken',
        data: { patientId, scopes },
        success: true,
      }).catch(console.error);
      if (this.config.enableHooks) this.hooks.onTokenGenerated?.('fhir', patientId);
      span.end();
      return { ok: true, value: token };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  validateFHIRToken(token: string): Result<{ valid: boolean; patientId?: string; scopes?: string[] }> {
    const span = this.tracer.startSpan('sharp.validateFHIRToken');
    try {
      const payload = this.verifyToken(token);
      const now = new Date();
      const expiresAt = new Date(payload.expiresAt);
      const valid = now <= expiresAt;
      const result = valid
        ? { valid: true, patientId: payload.patientId, scopes: payload.scopes }
        : { valid: false };
      this.metrics.updateCounters('sharp', {
        tokenValidationSuccess: valid ? 1 : 0,
        tokenValidationFailure: valid ? 0 : 1,
      }).catch(console.error);
      span.end();
      return { ok: true, value: result };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.metrics.updateCounters('sharp', { tokenValidationFailure: 1 }).catch(console.error);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Consent Token Management ====================
  generateConsentToken(patientId: string, consentScopes: string[]): Result<string> {
    const span = this.tracer.startSpan('sharp.generateConsentToken');
    try {
      const payload = {
        patientId,
        consentScopes,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.config.consentTokenTTLMs).toISOString(),
      };
      const token = this.signToken(payload);
      this.metrics.updateCounters('sharp', { tokenGenerationCount: 1 }).catch(console.error);
      this.logger.log({
        type: 'TOKEN_GENERATED',
        timestamp: new Date().toISOString(),
        source: 'sharp-manager',
        operation: 'generateConsentToken',
        data: { patientId, consentScopes },
        success: true,
      }).catch(console.error);
      if (this.config.enableHooks) this.hooks.onTokenGenerated?.('consent', patientId);
      span.end();
      return { ok: true, value: token };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  validateConsentToken(token: string, requiredScope: string): Result<{ valid: boolean; patientId?: string }> {
    const span = this.tracer.startSpan('sharp.validateConsentToken');
    try {
      const payload = this.verifyToken(token);
      const now = new Date();
      const expiresAt = new Date(payload.expiresAt);
      if (now > expiresAt) {
        this.metrics.updateCounters('sharp', { tokenValidationFailure: 1 }).catch(console.error);
        span.end();
        return { ok: true, value: { valid: false } };
      }
      const hasScope = payload.consentScopes.includes(requiredScope);
      const valid = hasScope;
      this.metrics.updateCounters('sharp', {
        tokenValidationSuccess: valid ? 1 : 0,
        tokenValidationFailure: valid ? 0 : 1,
      }).catch(console.error);
      span.end();
      return { ok: true, value: { valid, patientId: payload.patientId } };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.metrics.updateCounters('sharp', { tokenValidationFailure: 1 }).catch(console.error);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== SHARP Protocol Export ====================
  async exportSHARPProtocol(): Promise<Result<any>> {
    const span = this.tracer.startSpan('sharp.exportSHARPProtocol');
    try {
      const agentsResult = await this.getActiveAgents();
      if (!agentsResult.ok) throw agentsResult.error;
      const agents = agentsResult.value;
      const activeHandoffsResult = await this.getActiveHandoffs();
      if (!activeHandoffsResult.ok) throw activeHandoffsResult.error;
      const protocol = {
        specification: 'SHARP-Extension-Specs/v1.0',
        version: '1.0.0',
        capabilities: {
          contextPropagation: true,
          fhirTokenManagement: true,
          consentVerification: true,
          auditLogging: true,
          handoffManagement: true,
        },
        agents: agents.map(agent => ({
          agentId: agent.agentId,
          agentType: agent.agentType,
          capabilities: agent.capabilities,
          supportedOperations: agent.supportedSHARPOperations,
          fhirResources: agent.fhirResources || [],
          endpoints: agent.endpoints || [],
          sharpVersion: agent.sharpVersion,
          status: agent.status,
        })),
        activeHandoffs: activeHandoffsResult.value.length,
        activeContexts: this.contextStore.size,
      };
      span.end();
      return { ok: true, value: protocol };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  // ==================== Observability ====================
  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    return this.metrics.getMetrics(moduleId);
  }

  getEvents(): EventLog[] {
    return this.logger.getEvents();
  }

  async getHealth(): Promise<HealthStatus> {
    return this.healthChecker.check();
  }

  // ==================== Private Methods ====================
  private generatePropagationToken(patientId: string, sessionId: string, timestamp: string): string {
    const data = `${patientId}:${sessionId}:${timestamp}`;
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  private signToken(payload: any): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', this.secretKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private verifyToken(token: string): any {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', this.secretKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
  }

  private signAction(agent: string, action: string, handoffId: string): string {
    const data = `${agent}:${action}:${handoffId}:${new Date().toISOString()}`;
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }
}

// ==================== SHARP Extension Adapter ====================
export class SHARPExtensionAdapter {
  constructor(private sharpManager: SHARPExtensionManager) {}

  async initializeSession(
    patientId: string,
    sessionId: string,
    fhirScopes: string[] = [],
    consentScopes: string[] = []
  ): Promise<Result<SHARPContext>> {
    const span = globalTracer.startSpan('sharpAdapter.initializeSession');
    try {
      let fhirToken: string | undefined;
      let consentToken: string | undefined;
      if (fhirScopes.length) {
        const tokenResult = this.sharpManager.generateFHIRToken(patientId, fhirScopes);
        if (!tokenResult.ok) throw tokenResult.error;
        fhirToken = tokenResult.value;
      }
      if (consentScopes.length) {
        const tokenResult = this.sharpManager.generateConsentToken(patientId, consentScopes);
        if (!tokenResult.ok) throw tokenResult.error;
        consentToken = tokenResult.value;
      }
      const contextResult = await this.sharpManager.createContext(patientId, sessionId, fhirToken, consentToken);
      span.end();
      return contextResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async getFHIRAccess(context: SHARPContext, requiredScope: string): Promise<Result<{ authorized: boolean; token?: string }>> {
    const span = globalTracer.startSpan('sharpAdapter.getFHIRAccess');
    try {
      if (!context.fhirToken) {
        span.end();
        return { ok: true, value: { authorized: false } };
      }
      const validation = this.sharpManager.validateFHIRToken(context.fhirToken);
      if (!validation.ok) throw validation.error;
      const { valid, patientId, scopes } = validation.value;
      const authorized = valid && patientId === context.patientId && scopes?.includes(requiredScope);
      span.end();
      return { ok: true, value: { authorized, token: context.fhirToken } };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async getConsentAccess(context: SHARPContext, requiredScope: string): Promise<Result<{ authorized: boolean; patientId?: string }>> {
    const span = globalTracer.startSpan('sharpAdapter.getConsentAccess');
    try {
      if (!context.consentToken) {
        span.end();
        return { ok: true, value: { authorized: false } };
      }
      const validation = this.sharpManager.validateConsentToken(context.consentToken, requiredScope);
      if (!validation.ok) throw validation.error;
      span.end();
      return { ok: true, value: validation.value };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async createHandoff(
    fromAgent: string,
    toAgent: string,
    context: SHARPContext,
    urgency: 'ROUTINE' | 'URGENT' | 'EMERGENT' = 'ROUTINE',
    handoffType: 'CARE_COORDINATION' | 'ESCALATION' | 'REFERRAL' | 'INFO_SHARING' = 'CARE_COORDINATION'
  ): Promise<Result<SHARPHandoff>> {
    const span = globalTracer.startSpan('sharpAdapter.createHandoff');
    try {
      const handoffId = `sharp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const handoff = await this.sharpManager.initiateHandoff({
        handoffId,
        fromAgent,
        toAgent,
        context,
        urgency,
        handoffType,
        requiredCapabilities: [],
        fhirResources: ['Patient', 'Encounter', 'Observation'],
      });
      span.end();
      return handoff;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }
}

// ==================== Factory ====================
export function createSHARPExtensionManager(
  config?: Partial<SHARPConfig>,
  hooks?: SHARPHooks
): SHARPExtensionManager {
  return new SHARPExtensionManager(config, hooks);
}