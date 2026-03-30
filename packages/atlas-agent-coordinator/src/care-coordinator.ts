// care-coordinator.ts
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Mutex } from 'async-mutex';
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
};

// ==================== Error Types ====================
export class CoordinatorError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'CoordinatorError';
  }
}

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Metrics ====================
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
    return this.metrics;
  }
}

// ==================== Event Logger ====================
class EventLogger {
  private events: IntegrationEvent[] = [];

  log(event: IntegrationEvent): void {
    this.events.push(event);
    // In production, also send to external logging system
  }

  getEvents(): IntegrationEvent[] {
    return [...this.events];
  }
}

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
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err instanceof Error ? err : new Error(String(err));

        // Record failure
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
        }
      }
    }

    return {
      ok: false,
      error: new CoordinatorError('AGENT_FAILURE', `Agent ${agentId} failed after ${this.config.retryAttempts} attempts`, lastError),
    };
  }
}

// ==================== Workflow Orchestrator ====================
class WorkflowOrchestrator {
  private workflowSteps = new Map<CareSessionState, WorkflowStep>();

  constructor(
    private config: CoordinatorConfig,
    private agentExecutor: AgentExecutor,
    private metrics: MetricsCollector,
    private logger: EventLogger
  ) {
    this.initializeWorkflow();
  }

  private initializeWorkflow(): void {
    const steps: WorkflowStep[] = [
      {
        step_id: 'intake',
        step_name: 'Patient Intake',
        agent: 'atlas-agent-proxy',
        required_state: 'INTAKE',
        next_states: ['TRIAGE'],
        conditions: {
          symptoms_required: [],
        },
        timeout_seconds: 300,
        retry_attempts: 3,
      },
      {
        step_id: 'triage',
        step_name: 'Symptom Triage',
        agent: 'atlas-agent-triage',
        required_state: 'TRIAGE',
        next_states: ['ROUTING', 'COMPLETE'],
        conditions: {
          symptoms_required: ['pain', 'fever', 'shortness of breath'],
        },
        timeout_seconds: 180,
        retry_attempts: 3,
      },
      {
        step_id: 'routing',
        step_name: 'Care Routing',
        agent: 'atlas-agent-referral',
        required_state: 'ROUTING',
        next_states: ['MEDS', 'COMPLETE'],
        conditions: {
          urgency_required: 'EMERGENT',
        },
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

    steps.forEach(step => {
      this.workflowSteps.set(step.required_state, step);
    });
  }

  async process(session: CareSession): Promise<Result<CoordinationResult>> {
    const startTime = Date.now();
    let currentState = session.state;

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
      }

      const outcome = this.determineOutcome(session);
      await this.completeSession(session, outcome);
      const result = this.buildResult(session, outcome, startTime);
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
      if (step.fallback_agent) {
        const fallbackStep = { ...step, agent: step.fallback_agent };
        return this.executeStep(session, fallbackStep);
      }
      throw result.error;
    }

    // Update handoff status
    const updatedHandoff = session.agent_handoffs.find(h => h.handoff_id === handoff.handoff_id);
    if (updatedHandoff) updatedHandoff.status = 'completed';

    // Record integration event
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
  }

  private checkConditions(session: CareSession, step: WorkflowStep): boolean {
    if (!step.conditions) return true;
    const cond = step.conditions;
    if (cond.urgency_required && session.metadata?.triage_result?.urgency !== cond.urgency_required) return false;
    if (cond.consent_required && !session.consent_ref) return false;
    if (cond.symptoms_required) {
      const symptoms = session.metadata?.initial_symptoms || [];
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
    // Add timeline event
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
  private sessionManager: SessionManager;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private agentExecutor: AgentExecutor;
  private orchestrator: WorkflowOrchestrator;

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
  getIntegrationEvents(): IntegrationEvent[] {
    return this.logger.getEvents();
  }

  /**
   * Returns agent information.
   */
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
      ],
    };
  }

  private async addTimelineEvent(session: CareSession, event: TimelineEvent): Promise<void> {
    session.timeline.push(event);
    session.updated_at = event.timestamp;
  }
}