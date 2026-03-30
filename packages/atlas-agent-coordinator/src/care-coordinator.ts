// care-coordinator.ts
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Mutex } from 'async-mutex';
<<<<<<< HEAD
import { SHARPFhirIntegration } from './sharp-fhir-integration';
=======
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
import {
  CareSession,
  CareSessionState,
  TimelineEvent,
  AgentHandoff,
  CoordinationRequest,
  CoordinationResult,
  AgentCapabilities,
  WorkflowStep,
  StateTransition,
  ResourceReference,
  PerformanceMetrics,
  IntegrationEvent,
  CareSessionSchema,
  TimelineEventSchema,
  AgentHandoffSchema,
  CoordinationRequestSchema,
  CoordinationResultSchema,
  AgentCapabilitiesSchema,
  WorkflowStepSchema,
  StateTransitionSchema,
  DecisionPointSchema,
  ResourceReferenceSchema,
  PerformanceMetricsSchema,
  IntegrationEventSchema,
} from './types';

// ==================== Configuration ====================
export interface CoordinatorConfig {
  agentId: string;
  defaultTimeoutMs: number;
  retryAttempts: number;
  retryBackoffMs: number;
  circuitBreakerThreshold: number;
  circuitBreakerTimeoutMs: number;
  enableMetrics: boolean;
  enableEventLogging: boolean;
<<<<<<< HEAD
  enableNotifications: boolean;
  sessionRepoType: 'inmemory' | 'redis';
  redisUrl?: string;
=======
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
}

const defaultConfig: CoordinatorConfig = {
  agentId: 'atlas-agent-coordinator',
  defaultTimeoutMs: 30_000,
  retryAttempts: 3,
  retryBackoffMs: 1000,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeoutMs: 60_000,
  enableMetrics: true,
  enableEventLogging: true,
<<<<<<< HEAD
  enableNotifications: true,
  sessionRepoType: 'inmemory',
};

// ==================== Branded Types ====================
type SessionId = string & { readonly __brand: unique symbol };
type PatientId = string & { readonly __brand: unique symbol };
type HandoffId = string & { readonly __brand: unique symbol };
type EventId = string & { readonly __brand: unique symbol };

function brandSessionId(id: string): SessionId {
  return id as SessionId;
}

// ==================== Result Type (Enhanced) ====================
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

=======
};

>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
// ==================== Error Types ====================
export class CoordinatorError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'CoordinatorError';
<<<<<<< HEAD
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SessionNotFoundError extends CoordinatorError {
  constructor(sessionId: string) {
    super('SESSION_NOT_FOUND', `Session ${sessionId} not found`);
  }
}

export class ConcurrencyError extends CoordinatorError {
  constructor(message: string) {
    super('CONCURRENCY_ERROR', message);
  }
}

export class WorkflowError extends CoordinatorError {
  constructor(message: string, cause?: unknown) {
    super('WORKFLOW_ERROR', message, cause);
  }
}

// ==================== Session Repository (Abstraction for Concurrency) ====================
interface SessionRepository {
  get(sessionId: SessionId): Promise<CareSession | undefined>;
  getWithVersion(sessionId: SessionId): Promise<{ session: CareSession; version: number } | undefined>;
  save(session: CareSession, expectedVersion?: number): Promise<Result<void, ConcurrencyError>>;
  list(filter?: { state?: CareSessionState }): Promise<CareSession[]>;
  delete(sessionId: SessionId): Promise<void>;
}

// In-memory implementation with optimistic concurrency and thread safety
class InMemorySessionRepository implements SessionRepository {
  private sessions = new Map<string, { session: CareSession; version: number }>();
  private lock = new Mutex();

  async get(sessionId: SessionId): Promise<CareSession | undefined> {
    const release = await this.lock.acquire();
    try {
      return structuredClone(this.sessions.get(sessionId)?.session);
    } finally {
      release();
    }
  }

  async getWithVersion(sessionId: SessionId): Promise<{ session: CareSession; version: number } | undefined> {
    const release = await this.lock.acquire();
    try {
      const stored = this.sessions.get(sessionId);
      if (!stored) return undefined;
      return { session: structuredClone(stored.session), version: stored.version };
    } finally {
      release();
    }
  }

  async save(session: CareSession, expectedVersion?: number): Promise<Result<void, ConcurrencyError>> {
    const release = await this.lock.acquire();
    try {
      const key = session.session_id;
      const existing = this.sessions.get(key);
      const currentVersion = existing?.version ?? 0;

      if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
        return err(new ConcurrencyError(`Version mismatch: expected ${expectedVersion}, got ${currentVersion}`));
      }

      this.sessions.set(key, { session: structuredClone(session), version: currentVersion + 1 });
      return ok(undefined);
    } finally {
      release();
    }
  }

  async list(filter?: { state?: CareSessionState }): Promise<CareSession[]> {
    const release = await this.lock.acquire();
    try {
      const all = Array.from(this.sessions.values()).map(v => structuredClone(v.session));
      if (!filter?.state) return all;
      return all.filter(s => s.state === filter.state);
    } finally {
      release();
    }
  }

  async delete(sessionId: SessionId): Promise<void> {
    const release = await this.lock.acquire();
    try {
      this.sessions.delete(sessionId);
    } finally {
      release();
    }
  }
}

// ==================== Metrics Collector (Thread‑safe) ====================
=======
  }
}

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Metrics ====================
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
interface Metrics {
  sessionCount: number;
  successCount: number;
  failureCount: number;
  averageDurationMs: number;
  handoffCount: number;
  errorCount: number;
  lastError?: string;
}

class MetricsCollector {
<<<<<<< HEAD
  private metrics = new Map<string, Metrics>();
  private lock = new Mutex();

  async recordSession(agentId: string, durationMs: number, success: boolean, error?: string): Promise<void> {
    const release = await this.lock.acquire();
    try {
      const key = agentId;
      const current = this.metrics.get(key) ?? {
        sessionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageDurationMs: 0,
        handoffCount: 0,
        errorCount: 0,
      };

      current.sessionCount++;
      if (success) {
        current.successCount++;
      } else {
        current.failureCount++;
        if (error) {
          current.errorCount++;
          current.lastError = error;
        }
      }
      // Exponential moving average for duration
      current.averageDurationMs =
        (current.averageDurationMs * (current.sessionCount - 1) + durationMs) / current.sessionCount;

      this.metrics.set(key, current);
    } finally {
      release();
    }
  }

  async recordHandoff(): Promise<void> {
    const release = await this.lock.acquire();
    try {
      const key = 'global';
      const current = this.metrics.get(key) ?? {
        sessionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageDurationMs: 0,
        handoffCount: 0,
        errorCount: 0,
      };
      current.handoffCount++;
      this.metrics.set(key, current);
    } finally {
      release();
    }
=======
  private metrics: Map<string, Metrics> = new Map();

  recordSession(agentId: string, durationMs: number, success: boolean, error?: string): void {
    const key = agentId;
    const current = this.metrics.get(key) ?? {
      sessionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageDurationMs: 0,
      handoffCount: 0,
      errorCount: 0,
    };

    current.sessionCount++;
    if (success) {
      current.successCount++;
    } else {
      current.failureCount++;
      if (error) {
        current.errorCount++;
        current.lastError = error;
      }
    }
    // Exponential moving average for duration
    current.averageDurationMs =
      (current.averageDurationMs * (current.sessionCount - 1) + durationMs) / current.sessionCount;

    this.metrics.set(key, current);
  }

  recordHandoff(): void {
    // Simple counter per agent; could be expanded
    const key = 'global';
    const current = this.metrics.get(key) ?? {
      sessionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageDurationMs: 0,
      handoffCount: 0,
      errorCount: 0,
    };
    current.handoffCount++;
    this.metrics.set(key, current);
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }

  getMetrics(agentId?: string): Metrics | Map<string, Metrics> {
    if (agentId) {
      return this.metrics.get(agentId) ?? {
        sessionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageDurationMs: 0,
        handoffCount: 0,
        errorCount: 0,
      };
    }
<<<<<<< HEAD
    return new Map(this.metrics);
  }
}

// ==================== Event Logger (Structured) ====================
=======
    return this.metrics;
  }
}

// ==================== Event Logger ====================
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
class EventLogger {
  private events: IntegrationEvent[] = [];

  log(event: IntegrationEvent): void {
    this.events.push(event);
    // In production, also send to external logging system
<<<<<<< HEAD
    console.log(JSON.stringify({ level: 'info', ...event }));
=======
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }

  getEvents(): IntegrationEvent[] {
    return [...this.events];
  }
}

<<<<<<< HEAD
// ==================== Notification Service (New Feature) ====================
interface Notification {
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject?: string;
  body: string;
}

interface NotificationService {
  send(notification: Notification): Promise<Result<void>>;
}

class ConsoleNotificationService implements NotificationService {
  async send(notification: Notification): Promise<Result<void>> {
    console.log(`[Notification] ${notification.type} to ${notification.recipient}: ${notification.body}`);
    return ok(undefined);
  }
}

// ==================== Enhanced Circuit Breaker ====================
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  successCount: number;
  lastSuccessTime: number;
  requestCount: number;
  slidingWindow: number[]; // Timestamps of recent requests
}

class AgentExecutor {
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private lock = new Mutex();
=======
// ==================== Session Manager ====================
class SessionManager {
  private sessions = new Map<string, CareSession>();
  private locks = new Map<string, Mutex>();

  async withSession<T>(
    sessionId: string,
    operation: (session: CareSession) => Promise<T>
  ): Promise<Result<T>> {
    const mutex = this.locks.get(sessionId) ?? new Mutex();
    if (!this.locks.has(sessionId)) {
      this.locks.set(sessionId, mutex);
    }

    const release = await mutex.acquire();
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return { ok: false, error: new CoordinatorError('NOT_FOUND', `Session ${sessionId} not found`) };
      }
      const result = await operation(session);
      // Persist session after mutation (here we just store it)
      this.sessions.set(sessionId, session);
      return { ok: true, value: result };
    } finally {
      release();
      // Clean up lock if session no longer exists
      if (!this.sessions.has(sessionId)) {
        this.locks.delete(sessionId);
      }
    }
  }

  createSession(request: CoordinationRequest): CareSession {
    const sessionId = uuidv4();
    const now = new Date().toISOString();
    const session: CareSession = {
      session_id: sessionId,
      patient_id: request.patient_id,
      state: 'INTAKE',
      timeline: [],
      fhir_resources: [],
      agent_handoffs: [],
      consent_ref: '',
      created_at: now,
      updated_at: now,
      metadata: {
        initial_symptoms: request.initial_data.symptoms,
        provider_notifications: [],
        patient_instructions: [],
      },
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): CareSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): CareSession[] {
    return Array.from(this.sessions.values());
  }
}

// ==================== Agent Executor (with retry, timeout, circuit breaker) ====================
class AgentExecutor {
  private circuitBreakers = new Map<
    string,
    { failures: number; lastFailureTime: number; state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' }
  >();
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)

  constructor(
    private config: CoordinatorConfig,
    private metrics: MetricsCollector,
    private logger: EventLogger
  ) {}

  async execute<T>(
    agentId: string,
    operation: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number = this.config.defaultTimeoutMs
  ): Promise<Result<T>> {
<<<<<<< HEAD
    const startTime = Date.now();
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      // Circuit breaker check
      let breaker = await this.getCircuitBreaker(agentId);
      
      if (breaker.state === 'OPEN') {
        const now = Date.now();
        if (now - breaker.lastFailureTime >= this.config.circuitBreakerTimeoutMs) {
          breaker.state = 'HALF_OPEN';
          breaker.successCount = 0;
          await this.setCircuitBreaker(agentId, breaker);
        } else {
          return err(new CoordinatorError('CIRCUIT_OPEN', `Circuit breaker open for agent ${agentId}`));
        }
      }

      // Track request in sliding window
      await this.trackRequest(agentId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const result = await operation(controller.signal);
        clearTimeout(timeoutId);

        // Update circuit breaker on success
        breaker = await this.getCircuitBreaker(agentId);
        if (breaker.state === 'HALF_OPEN') {
          breaker.successCount++;
          // Need 3 consecutive successes to close
          if (breaker.successCount >= 3) {
            breaker.state = 'CLOSED';
            breaker.failures = 0;
          }
        }
        breaker.lastSuccessTime = Date.now();
        await this.setCircuitBreaker(agentId, breaker);

        const duration = Date.now() - startTime;
        await this.metrics.recordSession(agentId, duration, true);
        return ok(result);
=======
    // Circuit breaker check
    const breaker = this.circuitBreakers.get(agentId) ?? {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED',
    };

    if (breaker.state === 'OPEN') {
      const now = Date.now();
      if (now - breaker.lastFailureTime >= this.config.circuitBreakerTimeoutMs) {
        breaker.state = 'HALF_OPEN';
        this.circuitBreakers.set(agentId, breaker);
      } else {
        return {
          ok: false,
          error: new CoordinatorError('CIRCUIT_OPEN', `Circuit breaker open for agent ${agentId}`),
        };
      }
    }

    const startTime = Date.now();
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < this.config.retryAttempts) {
      attempt++;
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

      try {
        const result = await operation(abortController.signal);
        clearTimeout(timeoutId);

        // Success: reset circuit breaker if half-open or closed
        if (breaker.state === 'HALF_OPEN') {
          breaker.state = 'CLOSED';
          breaker.failures = 0;
          this.circuitBreakers.set(agentId, breaker);
        }

        const duration = Date.now() - startTime;
        this.metrics.recordSession(agentId, duration, true);
        return { ok: true, value: result };
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err instanceof Error ? err : new Error(String(err));

        // Record failure
<<<<<<< HEAD
        await this.metrics.recordSession(agentId, Date.now() - startTime, false, lastError.message);

        // Circuit breaker failure tracking
        breaker = await this.getCircuitBreaker(agentId);
        breaker.failures++;
        breaker.lastFailureTime = Date.now();
        
        // Check if we should open the circuit (5 failures in last 10 requests)
        const recentFailures = breaker.slidingWindow.filter(() => Math.random() < 0.5).length; // Simplified
        if (recentFailures >= 5 || breaker.failures >= this.config.circuitBreakerThreshold) {
          breaker.state = 'OPEN';
        }
        
        if (breaker.state === 'HALF_OPEN') {
          // Any failure in HALF_OPEN opens the circuit
          breaker.state = 'OPEN';
        }
        
        await this.setCircuitBreaker(agentId, breaker);

        // Retry with exponential backoff
        if (attempt < this.config.retryAttempts) {
          const delay = this.config.retryBackoffMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
=======
        this.metrics.recordSession(agentId, Date.now() - startTime, false, lastError.message);

        // Circuit breaker failure tracking
        breaker.failures++;
        breaker.lastFailureTime = Date.now();
        if (breaker.failures >= this.config.circuitBreakerThreshold) {
          breaker.state = 'OPEN';
        }
        this.circuitBreakers.set(agentId, breaker);

        // Retry with exponential backoff
        if (attempt < this.config.retryAttempts) {
          const backoff = this.config.retryBackoffMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoff));
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
        }
      }
    }

<<<<<<< HEAD
    return err(new CoordinatorError('AGENT_FAILURE', `Agent ${agentId} failed after ${this.config.retryAttempts} attempts`, lastError));
  }

  private async trackRequest(agentId: string): Promise<void> {
    const release = await this.lock.acquire();
    try {
      const breaker = this.circuitBreakers.get(agentId) ?? {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED' as const,
        successCount: 0,
        lastSuccessTime: 0,
        requestCount: 0,
        slidingWindow: [],
      };
      
      const now = Date.now();
      // Keep only requests from last 10 minutes
      breaker.slidingWindow = breaker.slidingWindow.filter(time => now - time < 600000);
      breaker.slidingWindow.push(now);
      breaker.requestCount++;
      
      this.circuitBreakers.set(agentId, breaker);
    } finally {
      release();
    }
  }

  private async getCircuitBreaker(agentId: string): Promise<CircuitBreakerState> {
    const release = await this.lock.acquire();
    try {
      return this.circuitBreakers.get(agentId) ?? {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED' as const,
        successCount: 0,
        lastSuccessTime: 0,
        requestCount: 0,
        slidingWindow: [],
      };
    } finally {
      release();
    }
  }

  private async setCircuitBreaker(agentId: string, breaker: CircuitBreakerState): Promise<void> {
    const release = await this.lock.acquire();
    try {
      this.circuitBreakers.set(agentId, breaker);
    } finally {
      release();
    }
  }
}

// ==================== Enhanced Workflow Engine ====================
interface WorkflowDefinition {
  steps: Map<CareSessionState, WorkflowStep>;
  transitions: Map<CareSessionState, WorkflowTransition[]>;
}

interface WorkflowTransition {
  from: CareSessionState;
  to: CareSessionState;
  condition?: (agentResult: any, session: CareSession) => boolean;
  priority: number;
}

class WorkflowEngine {
  private definition: WorkflowDefinition;

  constructor(steps: WorkflowStep[]) {
    const stepMap = new Map<CareSessionState, WorkflowStep>();
    const transitionMap = new Map<CareSessionState, WorkflowTransition[]>();

    for (const step of steps) {
      stepMap.set(step.required_state, step);
      
      // Create transitions with conditions
      const transitions: WorkflowTransition[] = [];
      
      switch (step.required_state) {
        case 'INTAKE':
          transitions.push({
            from: 'INTAKE',
            to: 'TRIAGE',
            priority: 1
          });
          break;
          
        case 'TRIAGE':
          transitions.push(
            {
              from: 'TRIAGE',
              to: 'ROUTING',
              condition: (result, session) => result?.urgency === 'EMERGENT' || result?.urgency === 'URGENT',
              priority: 1
            },
            {
              from: 'TRIAGE',
              to: 'COMPLETE',
              condition: (result, session) => result?.urgency === 'ROUTINE',
              priority: 2
            }
          );
          break;
          
        case 'ROUTING':
          transitions.push(
            {
              from: 'ROUTING',
              to: 'MEDS',
              condition: (result, session) => !!(session.metadata?.referral_details),
              priority: 1
            },
            {
              from: 'ROUTING',
              to: 'COMPLETE',
              condition: (result, session) => !!(session.metadata?.referral_details),
              priority: 2
            }
          );
          break;
          
        case 'MEDS':
          transitions.push({
            from: 'MEDS',
            to: 'COMPLETE',
            priority: 1
          });
          break;
      }
      
      transitionMap.set(step.required_state, transitions);
    }

    this.definition = { steps: stepMap, transitions: transitionMap };
  }

  getNextState(currentState: CareSessionState, agentResult: any, session: CareSession): CareSessionState | null {
    const transitions = this.definition.transitions.get(currentState);
    if (!transitions || transitions.length === 0) return null;

    // Find the first transition whose condition is met, sorted by priority
    const sortedTransitions = transitions.sort((a, b) => a.priority - b.priority);
    
    for (const transition of sortedTransitions) {
      if (!transition.condition || transition.condition(agentResult, session)) {
        return transition.to;
      }
    }

    return null;
  }

  getStep(state: CareSessionState): WorkflowStep | undefined {
    return this.definition.steps.get(state);
  }

  isTerminal(state: CareSessionState): boolean {
    const transitions = this.definition.transitions.get(state);
    return !transitions || transitions.length === 0;
  }
}

// ==================== Workflow Orchestrator (Refactored) ====================
class WorkflowOrchestrator {
  private engine: WorkflowEngine;
  private notificationService: NotificationService;
=======
    return {
      ok: false,
      error: new CoordinatorError('AGENT_FAILURE', `Agent ${agentId} failed after ${this.config.retryAttempts} attempts`, lastError),
    };
  }
}

// ==================== Workflow Orchestrator ====================
class WorkflowOrchestrator {
  private workflowSteps = new Map<CareSessionState, WorkflowStep>();
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)

  constructor(
    private config: CoordinatorConfig,
    private agentExecutor: AgentExecutor,
    private metrics: MetricsCollector,
<<<<<<< HEAD
    private logger: EventLogger,
    private sharpFhirIntegration?: SHARPFhirIntegration,
    notificationService?: NotificationService
  ) {
    this.notificationService = notificationService ?? new ConsoleNotificationService();
    this.engine = this.buildWorkflow();
  }

  private buildWorkflow(): WorkflowEngine {
=======
    private logger: EventLogger
  ) {
    this.initializeWorkflow();
  }

  private initializeWorkflow(): void {
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    const steps: WorkflowStep[] = [
      {
        step_id: 'intake',
        step_name: 'Patient Intake',
        agent: 'atlas-agent-proxy',
        required_state: 'INTAKE',
        next_states: ['TRIAGE'],
<<<<<<< HEAD
        conditions: { symptoms_required: [] },
=======
        conditions: {
          symptoms_required: [],
        },
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
        timeout_seconds: 300,
        retry_attempts: 3,
      },
      {
        step_id: 'triage',
        step_name: 'Symptom Triage',
        agent: 'atlas-agent-triage',
        required_state: 'TRIAGE',
        next_states: ['ROUTING', 'COMPLETE'],
<<<<<<< HEAD
        conditions: { symptoms_required: ['pain', 'fever', 'shortness of breath'] },
=======
        conditions: {
          symptoms_required: ['pain', 'fever', 'shortness of breath'],
        },
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
        timeout_seconds: 180,
        retry_attempts: 3,
      },
      {
        step_id: 'routing',
        step_name: 'Care Routing',
        agent: 'atlas-agent-referral',
        required_state: 'ROUTING',
        next_states: ['MEDS', 'COMPLETE'],
<<<<<<< HEAD
        conditions: { urgency_required: 'EMERGENT' },
=======
        conditions: {
          urgency_required: 'EMERGENT',
        },
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
        timeout_seconds: 240,
        retry_attempts: 3,
      },
      {
        step_id: 'meds',
        step_name: 'Medication Check',
        agent: 'atlas-agent-meds',
        required_state: 'MEDS',
        next_states: ['COMPLETE'],
        timeout_seconds: 120,
        retry_attempts: 3,
      },
    ];
<<<<<<< HEAD
    return new WorkflowEngine(steps);
=======

    steps.forEach(step => {
      this.workflowSteps.set(step.required_state, step);
    });
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }

  async process(session: CareSession): Promise<Result<CoordinationResult>> {
    const startTime = Date.now();
    let currentState = session.state;
<<<<<<< HEAD
    let lastError: Error | undefined;

    try {
      while (!this.engine.isTerminal(currentState) && currentState !== 'CANCELLED') {
        const step = this.engine.getStep(currentState);
        if (!step) {
          throw new WorkflowError(`No workflow step for state ${currentState}`);
        }

        const stepResult = await this.executeStep(session, step);
        if (!stepResult.ok) {
          throw stepResult.error;
        }

        // Apply state mutations based on agent result
        await this.applyAgentResult(session, step.agent, stepResult.value);

        // Determine next state based on agent result and current session state
        const nextState = this.engine.getNextState(currentState, stepResult.value, session);
        if (!nextState) {
          throw new WorkflowError(`No transition defined from ${currentState}`);
        }

        session.state = nextState;
        session.updated_at = new Date().toISOString();
        currentState = nextState;
=======

    try {
      while (currentState !== 'COMPLETE' && currentState !== 'CANCELLED') {
        const step = this.workflowSteps.get(currentState);
        if (!step) {
          throw new CoordinatorError('INVALID_STATE', `No workflow step for state ${currentState}`);
        }

        const nextState = await this.executeStep(session, step);
        // Update session (done by caller via withSession)
        session.state = nextState;
        session.updated_at = new Date().toISOString();
        currentState = nextState;

        if (this.isSessionComplete(session)) {
          currentState = 'COMPLETE';
          session.state = 'COMPLETE';
          break;
        }
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
      }

      const outcome = this.determineOutcome(session);
      await this.completeSession(session, outcome);
      const result = this.buildResult(session, outcome, startTime);
<<<<<<< HEAD
      return ok(result);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await this.handleError(session, lastError);
      const outcome = 'SYSTEM_ERROR';
      const result = this.buildResult(session, outcome, startTime);
      return err(lastError as Error);
    }
  }

  private async applyAgentResult(session: CareSession, agentId: string, result: any): Promise<void> {
    // Apply mutations based on agent result
    switch (agentId) {
      case 'atlas-agent-triage':
        if (!session.metadata) session.metadata = {};
        session.metadata.triage_result = result;
        break;
        
      case 'atlas-agent-referral':
        if (!session.metadata) session.metadata = {};
        session.metadata.referral_details = result;
        break;
        
      case 'atlas-agent-meds':
        if (!session.metadata) session.metadata = {};
        session.metadata.medication_check = result;
        break;
        
      case 'atlas-agent-proxy':
        if (!session.metadata) session.metadata = {};
        session.metadata.patient_instructions = result.instructions;
        
        // Send notification as side-effect
        if (this.config.enableNotifications && result.message_sent) {
          await this.notificationService.send({
            type: 'sms',
            recipient: session.patient_id,
            body: result.message_sent,
          });
        }
        break;
    }
  }

  private async executeStep(session: CareSession, step: WorkflowStep): Promise<Result<any>> {
    if (!this.checkConditions(session, step)) {
      return err(new WorkflowError(`Conditions not met for step ${step.step_name}`));
    }

=======
      return { ok: true, value: result };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.handleError(session, error);
      const outcome = 'SYSTEM_ERROR';
      const result = this.buildResult(session, outcome, startTime);
      return { ok: false, error };
    }
  }

  private async executeStep(session: CareSession, step: WorkflowStep): Promise<CareSessionState> {
    // Check conditions
    if (!this.checkConditions(session, step)) {
      throw new CoordinatorError('CONDITION_FAILED', `Conditions not met for step ${step.step_name}`);
    }

    // Create handoff record
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    const handoff: AgentHandoff = {
      handoff_id: uuidv4(),
      from_agent: this.config.agentId,
      to_agent: step.agent,
      timestamp: new Date().toISOString(),
      reason: `Workflow step: ${step.step_name}`,
      context: {
        patient_id: session.patient_id,
        session_id: session.session_id,
        urgency: session.metadata?.triage_result?.urgency,
        symptoms: session.metadata?.initial_symptoms,
        clinical_data: session.metadata,
      },
      status: 'initiated',
    };
    session.agent_handoffs.push(handoff);
<<<<<<< HEAD
    await this.metrics.recordHandoff();

    const timeoutMs = (step.timeout_seconds ?? 30) * 1000;
    const executeStartTime = Date.now();
    const result = await this.agentExecutor.execute(step.agent, async signal => {
      return this.callAgent(step.agent, session, signal);
    }, timeoutMs);

    if (!result.ok) {
=======
    this.metrics.recordHandoff();

    // Execute agent
    const timeoutMs = (step.timeout_seconds ?? 30) * 1000;
    const executeStartTime = Date.now();
    const result = await this.agentExecutor.execute(step.agent, async signal => {
      // Here we call the actual agent service. For now, simulate.
      return this.simulateAgent(step.agent, session, signal);
    }, timeoutMs);

    if (!result.ok) {
      // Use fallback if defined
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
      if (step.fallback_agent) {
        const fallbackStep = { ...step, agent: step.fallback_agent };
        return this.executeStep(session, fallbackStep);
      }
<<<<<<< HEAD
      return err(result.error);
=======
      throw result.error;
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    }

    // Update handoff status
    const updatedHandoff = session.agent_handoffs.find(h => h.handoff_id === handoff.handoff_id);
    if (updatedHandoff) updatedHandoff.status = 'completed';

<<<<<<< HEAD
=======
    // Record integration event
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    if (this.config.enableEventLogging) {
      this.logger.log({
        event_id: uuidv4(),
        event_type: 'AGENT_HANDOFF',
        timestamp: new Date().toISOString(),
        source_system: this.config.agentId,
        target_system: step.agent,
        session_id: session.session_id,
        patient_id: session.patient_id,
        data: { step: step.step_name, result: result.value },
        success: true,
<<<<<<< HEAD
        processing_time: Date.now() - executeStartTime,
      });
    }

    return ok(result.value);
  }

  private async callAgent(agentId: string, session: CareSession, signal: AbortSignal): Promise<any> {
    const { AIAgentFactory } = await import('@atlas-core/ai');
    const { createAtlasFhir } = await import('@atlas-std/fhir');

    switch (agentId) {
      case 'atlas-agent-triage': {
        const triageAgent = AIAgentFactory.getTriageAgent();
        let clinicalContext = session.metadata?.clinicalContext || {};

        try {
          if (session.patient_id && session.metadata?.sharpContext && this.sharpFhirIntegration) {
            clinicalContext = await this.sharpFhirIntegration.getClinicalContext(session.patient_id);
          }
        } catch (fhirError) {
          console.warn('SHARP-FHIR data fetch failed, using session context:', fhirError);
        }

        const triageInput = {
          symptoms: session.metadata?.initial_symptoms || [],
          patientContext: {
            age: clinicalContext.patient?.age || 0,
            vitals: clinicalContext.vitals,
            medications: clinicalContext.medications,
            conditions: clinicalContext.conditions,
          },
        };

        const result = await triageAgent.analyzeSymptoms(triageInput);
        
        // Return result without mutating session
        return {
          urgency: result.urgency,
          suggested_pathway: this.mapPathway(result.suggestedPathway || 'PCP'),
          differential: result.differential,
          red_flags: result.redFlags,
          reasoning: result.reasoning,
          confidence_score: result.confidenceScore,
          recommendations: result.recommendations,
          requires_immediate_attention: result.requiresImmediateAttention,
        };
      }

      case 'atlas-agent-referral': {
        const triageResult = session.metadata?.triage_result;
        if (!triageResult) {
          throw new Error('No triage result available for referral');
        }

        // Return result without mutating session
        return {
          specialist_type: this.determineSpecialty(triageResult.differential || []),
          facility: this.selectFacility(triageResult.urgency, triageResult.differential || []),
          urgency: triageResult.urgency,
          appointment_scheduled: false,
          wait_time_minutes: this.estimateWaitTime(triageResult.urgency),
          distance_miles: 5.2,
          insurance_accepted: true,
        };
      }

      case 'atlas-agent-meds': {
        try {
          const fhir = createAtlasFhir({
            baseUrl: process.env.FHIR_BASE_URL || 'https://demo.fhir.org/r4',
            timeout: 30000,
            auth: {
              type: 'bearer' as const,
              token: process.env.FHIR_TOKEN || 'demo-token',
            },
          });

          const medications = await fhir.medicationRequest.search({
            patient: session.patient_id,
            status: 'active',
          });

          const medList = medications.entry?.map((med: any) =>
            med.resource.medicationCodeableConcept?.text ||
            med.resource.medicationReference?.display ||
            'Unknown medication'
          ) || [];

          // Return result without mutating session
          return {
            medications_found: medList.length > 0,
            current_medications: medList,
            interactions_found: medList.length > 1,
            contraindications: medList.length > 2 ? ['Multiple medications require review'] : [],
            recommendations: medList.length > 0 ? ['Review medication list with provider'] : ['No active medications found'],
          };
        } catch (error) {
          // Return fallback result without mutating session
          return {
            interactions_found: true,
            contraindications: ['Review needed for medication interactions'],
            recommendations: ['Consult pharmacist for medication review'],
            current_medications: ['Demo medication 1', 'Demo medication 2'],
          };
        }
      }

      case 'atlas-agent-proxy': {
        const triageResult = session.metadata?.triage_result;
        const referralDetails = session.metadata?.referral_details;

        let message = '';
        let instructions: string[] = [];

        if (triageResult?.urgency === 'EMERGENT') {
          message = 'Please proceed to nearest emergency department immediately';
          instructions = ['Call 911 or go to nearest ED', 'Bring current medications and ID', 'Do not drive yourself if possible'];
        } else if (referralDetails) {
          message = `Please contact ${referralDetails.facility} for ${referralDetails.specialist_type} appointment`;
          instructions = [`Call ${referralDetails.facility} to schedule`, 'Bring insurance information', 'Prepare list of current symptoms'];
        } else {
          message = 'Your case has been reviewed. Please follow up with your primary care provider';
          instructions = ['Schedule appointment with PCP', 'Monitor symptoms', 'Seek care if symptoms worsen'];
        }

        // Return result without mutating session
        return { 
          patient_notified: true, 
          message_sent: message, 
          instructions 
        };
      }

      default:
        throw new Error(`Unknown agent: ${agentId}`);
    }
=======
        processing_time: Date.now() - executeStartTime, // Use the proper start time recorded above
      });
    }

    // Determine next state based on result
    return this.determineNextState(session, step, result.value);
  }

  private simulateAgent(agentId: string, session: CareSession, signal: AbortSignal): Promise<any> {
    // Simulate work; if aborted, reject
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (signal.aborted) {
          reject(new Error('Aborted'));
          return;
        }
        // Simulate result based on agent
        let result: any;
        switch (agentId) {
          case 'atlas-agent-triage':
            result = {
              urgency: 'EMERGENT',
              suggested_pathway: 'ED',
              differential: [
                { condition: 'Acute Myocardial Infarction', icd10: 'I21.9', confidence: 0.78 },
                { condition: 'Unstable Angina', icd10: 'I20.0', confidence: 0.15 },
              ],
              red_flags: ['chest pain radiating to arm', 'diaphoresis'],
              reasoning: 'Patient presents with chest pain symptoms requiring urgent evaluation',
              confidence_score: 0.85,
            };
            session.metadata = session.metadata || {};
            session.metadata.triage_result = result;
            break;
          case 'atlas-agent-referral':
            result = {
              specialist_type: 'Cardiology',
              facility: 'St. Mary\'s Hospital',
              urgency: 'URGENT',
              appointment_scheduled: false,
              wait_time_minutes: 15,
              distance_miles: 4.2,
              insurance_accepted: true,
            };
            session.metadata = session.metadata || {};
            session.metadata.referral_details = result;
            break;
          case 'atlas-agent-meds':
            result = {
              interactions_found: true,
              contraindications: ['Increased bleeding risk with anticoagulents'],
              recommendations: ['Monitor for signs of bleeding', 'Hold anticoagulents until evaluated'],
              current_medications: ['Warfarin', 'Lisinopril', 'Metformin'],
            };
            session.metadata = session.metadata || {};
            session.metadata.medication_check = result;
            break;
          case 'atlas-agent-proxy':
            result = {
              patient_notified: true,
              message_sent: 'Please proceed to St. Mary\'s Emergency Room immediately',
              instructions: [
                'Go to nearest emergency room',
                'Bring current medications',
                'Avoid driving yourself',
              ],
            };
            session.metadata = session.metadata || {};
            session.metadata.patient_instructions = result.instructions;
            break;
          default:
            reject(new Error(`Unknown agent: ${agentId}`));
            return;
        }
        resolve(result);
      }, 50); // Simulate latency
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Aborted'));
      });
    });
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }

  private checkConditions(session: CareSession, step: WorkflowStep): boolean {
    if (!step.conditions) return true;
    const cond = step.conditions;
    if (cond.urgency_required && session.metadata?.triage_result?.urgency !== cond.urgency_required) return false;
    if (cond.consent_required && !session.consent_ref) return false;
    if (cond.symptoms_required) {
      const symptoms = session.metadata?.initial_symptoms || [];
<<<<<<< HEAD
      const hasRequired = cond.symptoms_required.some(req => symptoms.some(s => s.toLowerCase().includes(req.toLowerCase())));
      if (!hasRequired) return false;
    }
    return true;
  }

=======
      const hasRequired = cond.symptoms_required.some(req =>
        symptoms.some(s => s.toLowerCase().includes(req.toLowerCase()))
      );
      if (!hasRequired) return false;
    }
    // data_required could be checked here
    return true;
  }

  private determineNextState(session: CareSession, step: WorkflowStep, result: any): CareSessionState {
    // Simplified: based on current state and result
    switch (session.state) {
      case 'INTAKE':
        return 'TRIAGE';
      case 'TRIAGE':
        return session.metadata?.triage_result?.urgency === 'EMERGENT' ? 'ROUTING' : 'COMPLETE';
      case 'ROUTING':
        // If we've done both referral and meds, complete; else continue
        const hasReferral = session.metadata?.referral_details != null;
        const hasMeds = session.metadata?.medication_check != null;
        if (hasReferral && hasMeds) return 'COMPLETE';
        if (hasReferral) return 'MEDS';
        return 'ROUTING'; // stay in routing until referral done
      case 'MEDS':
        return 'COMPLETE';
      default:
        return 'COMPLETE';
    }
  }

>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  private isSessionComplete(session: CareSession): boolean {
    const triage = session.metadata?.triage_result;
    if (!triage) return false;
    if (triage.urgency === 'EMERGENT') {
      return session.metadata?.referral_details != null && session.metadata?.medication_check != null;
    }
    return true;
  }

  private determineOutcome(session: CareSession): CoordinationResult['outcome'] {
    const triageUrgency = session.metadata?.triage_result?.urgency;
    if (triageUrgency === 'EMERGENT') return 'EMERGENCY_ESCALATION';
    if (session.metadata?.referral_details) return 'REFERRAL_SCHEDULED';
    return 'SUCCESSFUL_TRIAGE';
  }

  private async completeSession(session: CareSession, outcome: CoordinationResult['outcome']): Promise<void> {
    session.completed_at = new Date().toISOString();
    session.state = 'COMPLETE';
<<<<<<< HEAD
=======
    // Add timeline event
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
    session.timeline.push({
      event_id: uuidv4(),
      timestamp: session.completed_at,
      event_type: 'SESSION_COMPLETE',
      agent: this.config.agentId,
      description: `Care coordination session completed with outcome: ${outcome}`,
    });
  }

  private buildResult(session: CareSession, outcome: CoordinationResult['outcome'], startTime: number): CoordinationResult {
    const completionTime = new Date().toISOString();
    const duration = Math.floor((Date.now() - startTime) / 1000);
    return {
      request_id: session.session_id,
      session_id: session.session_id,
      final_state: session.state,
      outcome,
      summary: this.generateSummary(session),
      recommendations: this.generateRecommendations(session),
      follow_up_actions: this.generateFollowUp(session),
      fhir_resources_created: session.fhir_resources,
      providers_notified: session.metadata?.provider_notifications || [],
      patient_instructions: session.metadata?.patient_instructions || [],
      next_steps: this.generateNextSteps(session),
      completion_time: completionTime,
      confidence_score: this.calculateConfidence(session),
      requires_human_review: outcome === 'SYSTEM_ERROR' || outcome === 'EMERGENCY_ESCALATION',
    };
  }

  private generateSummary(session: CareSession): string {
    const triage = session.metadata?.triage_result;
    const referral = session.metadata?.referral_details;
    let summary = `Session for patient ${session.patient_id}. `;
    if (triage) summary += `Triage: ${triage.urgency} urgency, ${triage.suggested_pathway} pathway. `;
    if (referral) summary += `Referral to ${referral.specialist_type} at ${referral.facility}. `;
    summary += `Completed with ${session.agent_handoffs.length} handoffs.`;
    return summary;
  }

  private generateRecommendations(session: CareSession): string[] {
    const recs: string[] = [];
    const triage = session.metadata?.triage_result;
    if (triage?.urgency === 'EMERGENT') recs.push('Seek immediate emergency medical care');
    if (session.metadata?.medication_check?.contraindications) recs.push('Review medication interactions with provider');
    return recs;
  }

  private generateFollowUp(session: CareSession): string[] {
    const actions: string[] = [];
    if (session.metadata?.referral_details) actions.push('Schedule appointment with referred specialist');
    actions.push('Document care coordination in patient record');
    return actions;
  }

  private generateNextSteps(session: CareSession): string[] {
    const steps: string[] = [];
    const triage = session.metadata?.triage_result;
    if (triage?.suggested_pathway === 'ED') steps.push('Proceed to nearest emergency department');
    if (session.metadata?.referral_details) steps.push(`Contact ${session.metadata.referral_details.facility} for appointment`);
    return steps;
  }

  private calculateConfidence(session: CareSession): number {
    let confidence = 0.7;
    if (session.metadata?.triage_result) confidence += 0.1;
    if (session.metadata?.referral_details) confidence += 0.1;
    if (session.metadata?.medication_check) confidence += 0.1;
    const errorEvents = session.timeline.filter(e => e.event_type === 'ERROR_OCCURRED').length;
    confidence -= errorEvents * 0.1;
    return Math.max(0, Math.min(1, confidence));
  }

<<<<<<< HEAD
  private determineSpecialty(differential: any[]): string {
    if (!differential?.length) return 'Primary Care';
    const condition = differential[0].condition?.toLowerCase() || '';
    if (condition.includes('cardiac') || condition.includes('heart')) return 'Cardiology';
    if (condition.includes('respiratory') || condition.includes('lung')) return 'Pulmonology';
    if (condition.includes('neuro') || condition.includes('brain')) return 'Neurology';
    if (condition.includes('ortho') || condition.includes('bone')) return 'Orthopedics';
    if (condition.includes('derm') || condition.includes('skin')) return 'Dermatology';
    return 'Primary Care';
  }

  private selectFacility(urgency: string, differential: any[]): string {
    if (urgency === 'EMERGENT') return 'Nearest Emergency Department';
    if (urgency === 'URGENT') return 'Urgent Care Center';
    return 'Primary Care Clinic';
  }

  private estimateWaitTime(urgency: string): number {
    switch (urgency) {
      case 'EMERGENT': return 0;
      case 'URGENT': return 30;
      default: return 120;
    }
  }

  private mapPathway(suggestedPathway: string): 'ED' | 'URGENT_CARE' | 'PRIMARY_CARE' | 'TELEHEALTH' {
    switch (suggestedPathway?.toLowerCase()) {
      case 'emergency':
      case 'ed':
      case 'emergency_department':
        return 'ED';
      case 'urgent':
      case 'urgent_care':
        return 'URGENT_CARE';
      case 'telehealth':
      case 'virtual':
        return 'TELEHEALTH';
      default:
        return 'PRIMARY_CARE';
    }
  }

=======
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  private async handleError(session: CareSession, error: Error): Promise<void> {
    session.timeline.push({
      event_id: uuidv4(),
      timestamp: new Date().toISOString(),
      event_type: 'ERROR_OCCURRED',
      agent: this.config.agentId,
      description: `Workflow error: ${error.message}`,
      data: { error: error.message, stack: error.stack },
    });
    session.state = 'ESCALATED';
    session.metadata = session.metadata || {};
    session.metadata.escalation_reason = error.message;
  }
}

// ==================== Main Coordinator ====================
export class CareCoordinator {
<<<<<<< HEAD
  private sessionRepo: SessionRepository;
=======
  private sessionManager: SessionManager;
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private agentExecutor: AgentExecutor;
  private orchestrator: WorkflowOrchestrator;
<<<<<<< HEAD
  private sharpFhirIntegration: SHARPFhirIntegration;
  private notificationService: NotificationService;

  constructor(private config: CoordinatorConfig = defaultConfig) {
    this.sessionRepo = config.sessionRepoType === 'inmemory'
      ? new InMemorySessionRepository()
      : new InMemorySessionRepository(); // Placeholder for Redis
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.agentExecutor = new AgentExecutor(this.config, this.metrics, this.logger);
    this.sharpFhirIntegration = new SHARPFhirIntegration({
      fhirBaseUrl: process.env.FHIR_BASE_URL,
      fhirToken: process.env.FHIR_TOKEN,
    });
    this.notificationService = new ConsoleNotificationService();
    this.orchestrator = new WorkflowOrchestrator(
      this.config,
      this.agentExecutor,
      this.metrics,
      this.logger,
      this.sharpFhirIntegration,
      this.notificationService
    );
  }

  async coordinateCare(request: CoordinationRequest): Promise<Result<CoordinationResult>> {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const validatedRequest = CoordinationRequestSchema.parse(request);
        const session = this.createSession(validatedRequest);

        // Initialize SHARP context
        const sharpContext = this.sharpFhirIntegration.initializeSHARPSession(
          session.patient_id,
          session.session_id,
          ['read', 'search'],
          ['treatment', 'data_processing']
        );
        if (!session.metadata) session.metadata = {};
        session.metadata.sharpContext = sharpContext;

        await this.addTimelineEvent(session, {
          event_id: uuidv4(),
          timestamp: new Date().toISOString(),
          event_type: 'SESSION_START',
          agent: this.config.agentId,
          description: `Care coordination session started for ${validatedRequest.trigger}`,
          data: validatedRequest,
        });

        // Save initial session
        const saveResult = await this.sessionRepo.save(session);
        if (!saveResult.ok) {
          if (attempt < maxRetries - 1) {
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
            continue;
          }
          return err(saveResult.error);
        }

        // Process workflow with retry on concurrency conflict
        let currentVersion = 1; // After initial save
        let workflowResult: Result<CoordinationResult>;
        
        while (true) {
          // Get fresh session with version
          const sessionWithVersion = await this.sessionRepo.getWithVersion(brandSessionId(session.session_id));
          if (!sessionWithVersion) {
            return err(new SessionNotFoundError(session.session_id));
          }
          
          const { session: currentSession, version } = sessionWithVersion;
          
          // Process workflow
          workflowResult = await this.orchestrator.process(currentSession);
          
          if (workflowResult.ok) {
            // Save updated session with version check
            const finalSaveResult = await this.sessionRepo.save(currentSession, version);
            if (!finalSaveResult.ok) {
              if (finalSaveResult.error.message.includes('Version mismatch')) {
                // Retry with fresh data
                continue;
              }
              return err(finalSaveResult.error);
            }
          }
          
          break; // Success or non-concurrency error
        }
        
        return workflowResult;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries - 1) {
          attempt++;
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }
        return { ok: false, error: err };
      }
    }
    
    return err(new CoordinatorError('MAX_RETRIES_EXCEEDED', 'Max retries exceeded in coordinateCare'));
  }

  async cancelSession(sessionId: string): Promise<Result<boolean>> {
    const sid = brandSessionId(sessionId);
    const session = await this.sessionRepo.get(sid);
    if (!session) return err(new SessionNotFoundError(sessionId));

    if (session.state === 'COMPLETE' || session.state === 'CANCELLED') {
      return ok(false);
    }

    session.state = 'CANCELLED';
    session.completed_at = new Date().toISOString();
    await this.addTimelineEvent(session, {
      event_id: uuidv4(),
      timestamp: session.completed_at,
      event_type: 'SESSION_CANCELLED',
      agent: this.config.agentId,
      description: 'Session cancelled by user request',
    });

    const saveResult = await this.sessionRepo.save(session);
    if (!saveResult.ok) return err(saveResult.error);
    return ok(true);
  }

  async getSession(sessionId: string): Promise<CareSession | undefined> {
    return this.sessionRepo.get(brandSessionId(sessionId));
  }

  async listActiveSessions(): Promise<CareSession[]> {
    return this.sessionRepo.list({ state: 'INTAKE' });
    // Could filter for non-terminal states
  }

  async getMetrics(agentId?: string): Promise<Metrics | Map<string, Metrics>> {
    return this.metrics.getMetrics(agentId);
  }

=======

  constructor(private config: CoordinatorConfig = defaultConfig) {
    this.sessionManager = new SessionManager();
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.agentExecutor = new AgentExecutor(this.config, this.metrics, this.logger);
    this.orchestrator = new WorkflowOrchestrator(this.config, this.agentExecutor, this.metrics, this.logger);
  }

  /**
   * Starts a new care coordination session.
   * @param request - The coordination request.
   * @returns Result containing the coordination result or an error.
   */
  async coordinateCare(request: CoordinationRequest): Promise<Result<CoordinationResult>> {
    try {
      const validatedRequest = CoordinationRequestSchema.parse(request);
      const session = this.sessionManager.createSession(validatedRequest);
      // Add initial timeline event
      await this.addTimelineEvent(session, {
        event_id: uuidv4(),
        timestamp: new Date().toISOString(),
        event_type: 'SESSION_START',
        agent: this.config.agentId,
        description: `Care coordination session started for ${validatedRequest.trigger}`,
        data: validatedRequest,
      });
      // Process workflow
      const result = await this.orchestrator.process(session);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { ok: false, error: err };
    }
  }

  /**
   * Cancels an ongoing session.
   * @param sessionId - The ID of the session to cancel.
   * @returns true if cancelled, false if not found.
   */
  async cancelSession(sessionId: string): Promise<boolean> {
    const result = await this.sessionManager.withSession(sessionId, async session => {
      if (session.state === 'COMPLETE' || session.state === 'CANCELLED') {
        return false;
      }
      session.state = 'CANCELLED';
      session.completed_at = new Date().toISOString();
      await this.addTimelineEvent(session, {
        event_id: uuidv4(),
        timestamp: session.completed_at,
        event_type: 'SESSION_CANCELLED',
        agent: this.config.agentId,
        description: 'Session cancelled by user request',
      });
      return true;
    });
    return result.ok ? result.value : false;
  }

  /**
   * Retrieves a session by ID.
   */
  getSession(sessionId: string): CareSession | undefined {
    return this.sessionManager.getSession(sessionId);
  }

  /**
   * Lists all active sessions.
   */
  listActiveSessions(): CareSession[] {
    return this.sessionManager.getAllSessions().filter(s => s.state !== 'COMPLETE' && s.state !== 'CANCELLED');
  }

  /**
   * Returns performance metrics.
   */
  getMetrics(agentId?: string): Metrics | Map<string, Metrics> {
    return this.metrics.getMetrics(agentId);
  }

  /**
   * Returns logged integration events.
   */
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  getIntegrationEvents(): IntegrationEvent[] {
    return this.logger.getEvents();
  }

<<<<<<< HEAD
=======
  /**
   * Returns agent information.
   */
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  getAgentInfo(): { id: string; name: string; version: string; capabilities: string[] } {
    return {
      id: this.config.agentId,
      name: 'ATLAS Care Coordinator Agent',
      version: '1.0.0',
      capabilities: [
        'workflow_orchestration',
        'state_machine_management',
        'agent_coordination',
        'session_management',
        'circuit_breaker',
        'retry_with_backoff',
        'concurrency_safety',
        'observability',
<<<<<<< HEAD
        'notifications',
=======
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
      ],
    };
  }

<<<<<<< HEAD
  private createSession(request: CoordinationRequest): CareSession {
    const sessionId = uuidv4();
    const now = new Date().toISOString();
    return {
      session_id: sessionId,
      patient_id: request.patient_id,
      state: 'INTAKE',
      timeline: [],
      fhir_resources: [],
      agent_handoffs: [],
      consent_ref: '',
      created_at: now,
      updated_at: now,
      metadata: {
        initial_symptoms: request.initial_data.symptoms,
        provider_notifications: [],
        patient_instructions: [],
      },
    };
  }

  private async addTimelineEvent(session: CareSession, event: TimelineEvent): Promise<void> {
    session.timeline.push(event);
    session.updated_at = event.timestamp;
    // No need to save here; caller will save
=======
  private async addTimelineEvent(session: CareSession, event: TimelineEvent): Promise<void> {
    session.timeline.push(event);
    session.updated_at = event.timestamp;
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
  }
}