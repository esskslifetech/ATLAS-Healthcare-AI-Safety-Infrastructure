"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareCoordinator = exports.CoordinatorError = void 0;
// care-coordinator.ts
const uuid_1 = require("uuid");
const async_mutex_1 = require("async-mutex");
const types_1 = require("./types");
const defaultConfig = {
    agentId: 'atlas-agent-coordinator',
    defaultTimeoutMs: 30000,
    retryAttempts: 3,
    retryBackoffMs: 1000,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeoutMs: 60000,
    enableMetrics: true,
    enableEventLogging: true,
};
// ==================== Error Types ====================
class CoordinatorError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'CoordinatorError';
    }
}
exports.CoordinatorError = CoordinatorError;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
    }
    recordSession(agentId, durationMs, success, error) {
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
        }
        else {
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
    recordHandoff() {
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
    getMetrics(agentId) {
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
    constructor() {
        this.events = [];
    }
    log(event) {
        this.events.push(event);
        // In production, also send to external logging system
    }
    getEvents() {
        return [...this.events];
    }
}
// ==================== Session Manager ====================
class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.locks = new Map();
    }
    async withSession(sessionId, operation) {
        const mutex = this.locks.get(sessionId) ?? new async_mutex_1.Mutex();
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
        }
        finally {
            release();
            // Clean up lock if session no longer exists
            if (!this.sessions.has(sessionId)) {
                this.locks.delete(sessionId);
            }
        }
    }
    createSession(request) {
        const sessionId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const session = {
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
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
}
// ==================== Agent Executor (with retry, timeout, circuit breaker) ====================
class AgentExecutor {
    constructor(config, metrics, logger) {
        this.config = config;
        this.metrics = metrics;
        this.logger = logger;
        this.circuitBreakers = new Map();
    }
    async execute(agentId, operation, timeoutMs = this.config.defaultTimeoutMs) {
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
            }
            else {
                return {
                    ok: false,
                    error: new CoordinatorError('CIRCUIT_OPEN', `Circuit breaker open for agent ${agentId}`),
                };
            }
        }
        const startTime = Date.now();
        let attempt = 0;
        let lastError;
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
            }
            catch (err) {
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
    constructor(config, agentExecutor, metrics, logger) {
        this.config = config;
        this.agentExecutor = agentExecutor;
        this.metrics = metrics;
        this.logger = logger;
        this.workflowSteps = new Map();
        this.initializeWorkflow();
    }
    initializeWorkflow() {
        const steps = [
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
    async process(session) {
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            await this.handleError(session, error);
            const outcome = 'SYSTEM_ERROR';
            const result = this.buildResult(session, outcome, startTime);
            return { ok: false, error };
        }
    }
    async executeStep(session, step) {
        // Check conditions
        if (!this.checkConditions(session, step)) {
            throw new CoordinatorError('CONDITION_FAILED', `Conditions not met for step ${step.step_name}`);
        }
        // Create handoff record
        const handoff = {
            handoff_id: (0, uuid_1.v4)(),
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
        const result = await this.agentExecutor.execute(step.agent, async (signal) => {
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
        if (updatedHandoff)
            updatedHandoff.status = 'completed';
        // Record integration event
        if (this.config.enableEventLogging) {
            this.logger.log({
                event_id: (0, uuid_1.v4)(),
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
    simulateAgent(agentId, session, signal) {
        // Simulate work; if aborted, reject
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (signal.aborted) {
                    reject(new Error('Aborted'));
                    return;
                }
                // Simulate result based on agent
                let result;
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
    checkConditions(session, step) {
        if (!step.conditions)
            return true;
        const cond = step.conditions;
        if (cond.urgency_required && session.metadata?.triage_result?.urgency !== cond.urgency_required)
            return false;
        if (cond.consent_required && !session.consent_ref)
            return false;
        if (cond.symptoms_required) {
            const symptoms = session.metadata?.initial_symptoms || [];
            const hasRequired = cond.symptoms_required.some(req => symptoms.some(s => s.toLowerCase().includes(req.toLowerCase())));
            if (!hasRequired)
                return false;
        }
        // data_required could be checked here
        return true;
    }
    determineNextState(session, step, result) {
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
                if (hasReferral && hasMeds)
                    return 'COMPLETE';
                if (hasReferral)
                    return 'MEDS';
                return 'ROUTING'; // stay in routing until referral done
            case 'MEDS':
                return 'COMPLETE';
            default:
                return 'COMPLETE';
        }
    }
    isSessionComplete(session) {
        const triage = session.metadata?.triage_result;
        if (!triage)
            return false;
        if (triage.urgency === 'EMERGENT') {
            return session.metadata?.referral_details != null && session.metadata?.medication_check != null;
        }
        return true;
    }
    determineOutcome(session) {
        const triageUrgency = session.metadata?.triage_result?.urgency;
        if (triageUrgency === 'EMERGENT')
            return 'EMERGENCY_ESCALATION';
        if (session.metadata?.referral_details)
            return 'REFERRAL_SCHEDULED';
        return 'SUCCESSFUL_TRIAGE';
    }
    async completeSession(session, outcome) {
        session.completed_at = new Date().toISOString();
        session.state = 'COMPLETE';
        // Add timeline event
        session.timeline.push({
            event_id: (0, uuid_1.v4)(),
            timestamp: session.completed_at,
            event_type: 'SESSION_COMPLETE',
            agent: this.config.agentId,
            description: `Care coordination session completed with outcome: ${outcome}`,
        });
    }
    buildResult(session, outcome, startTime) {
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
    generateSummary(session) {
        const triage = session.metadata?.triage_result;
        const referral = session.metadata?.referral_details;
        let summary = `Session for patient ${session.patient_id}. `;
        if (triage)
            summary += `Triage: ${triage.urgency} urgency, ${triage.suggested_pathway} pathway. `;
        if (referral)
            summary += `Referral to ${referral.specialist_type} at ${referral.facility}. `;
        summary += `Completed with ${session.agent_handoffs.length} handoffs.`;
        return summary;
    }
    generateRecommendations(session) {
        const recs = [];
        const triage = session.metadata?.triage_result;
        if (triage?.urgency === 'EMERGENT')
            recs.push('Seek immediate emergency medical care');
        if (session.metadata?.medication_check?.contraindications)
            recs.push('Review medication interactions with provider');
        return recs;
    }
    generateFollowUp(session) {
        const actions = [];
        if (session.metadata?.referral_details)
            actions.push('Schedule appointment with referred specialist');
        actions.push('Document care coordination in patient record');
        return actions;
    }
    generateNextSteps(session) {
        const steps = [];
        const triage = session.metadata?.triage_result;
        if (triage?.suggested_pathway === 'ED')
            steps.push('Proceed to nearest emergency department');
        if (session.metadata?.referral_details)
            steps.push(`Contact ${session.metadata.referral_details.facility} for appointment`);
        return steps;
    }
    calculateConfidence(session) {
        let confidence = 0.7;
        if (session.metadata?.triage_result)
            confidence += 0.1;
        if (session.metadata?.referral_details)
            confidence += 0.1;
        if (session.metadata?.medication_check)
            confidence += 0.1;
        const errorEvents = session.timeline.filter(e => e.event_type === 'ERROR_OCCURRED').length;
        confidence -= errorEvents * 0.1;
        return Math.max(0, Math.min(1, confidence));
    }
    async handleError(session, error) {
        session.timeline.push({
            event_id: (0, uuid_1.v4)(),
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
class CareCoordinator {
    constructor(config = defaultConfig) {
        this.config = config;
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
    async coordinateCare(request) {
        try {
            const validatedRequest = types_1.CoordinationRequestSchema.parse(request);
            const session = this.sessionManager.createSession(validatedRequest);
            // Add initial timeline event
            await this.addTimelineEvent(session, {
                event_id: (0, uuid_1.v4)(),
                timestamp: new Date().toISOString(),
                event_type: 'SESSION_START',
                agent: this.config.agentId,
                description: `Care coordination session started for ${validatedRequest.trigger}`,
                data: validatedRequest,
            });
            // Process workflow
            const result = await this.orchestrator.process(session);
            return result;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            return { ok: false, error: err };
        }
    }
    /**
     * Cancels an ongoing session.
     * @param sessionId - The ID of the session to cancel.
     * @returns true if cancelled, false if not found.
     */
    async cancelSession(sessionId) {
        const result = await this.sessionManager.withSession(sessionId, async (session) => {
            if (session.state === 'COMPLETE' || session.state === 'CANCELLED') {
                return false;
            }
            session.state = 'CANCELLED';
            session.completed_at = new Date().toISOString();
            await this.addTimelineEvent(session, {
                event_id: (0, uuid_1.v4)(),
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
    getSession(sessionId) {
        return this.sessionManager.getSession(sessionId);
    }
    /**
     * Lists all active sessions.
     */
    listActiveSessions() {
        return this.sessionManager.getAllSessions().filter(s => s.state !== 'COMPLETE' && s.state !== 'CANCELLED');
    }
    /**
     * Returns performance metrics.
     */
    getMetrics(agentId) {
        return this.metrics.getMetrics(agentId);
    }
    /**
     * Returns logged integration events.
     */
    getIntegrationEvents() {
        return this.logger.getEvents();
    }
    /**
     * Returns agent information.
     */
    getAgentInfo() {
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
    async addTimelineEvent(session, event) {
        session.timeline.push(event);
        session.updated_at = event.timestamp;
    }
}
exports.CareCoordinator = CareCoordinator;
//# sourceMappingURL=care-coordinator.js.map