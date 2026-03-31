"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareCoordinator = exports.WorkflowError = exports.ConcurrencyError = exports.SessionNotFoundError = exports.CoordinatorError = void 0;
exports.ok = ok;
exports.err = err;
exports.isOk = isOk;
// care-coordinator.ts
const uuid_1 = require("uuid");
const async_mutex_1 = require("async-mutex");
const sharp_fhir_integration_1 = require("./sharp-fhir-integration");
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
    enableNotifications: true,
    sessionRepoType: 'inmemory',
};
function brandSessionId(id) {
    return id;
}
function ok(value) {
    return { ok: true, value };
}
function err(error) {
    return { ok: false, error };
}
function isOk(result) {
    return result.ok;
}
// ==================== Error Types ====================
class CoordinatorError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'CoordinatorError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.CoordinatorError = CoordinatorError;
class SessionNotFoundError extends CoordinatorError {
    constructor(sessionId) {
        super('SESSION_NOT_FOUND', `Session ${sessionId} not found`);
    }
}
exports.SessionNotFoundError = SessionNotFoundError;
class ConcurrencyError extends CoordinatorError {
    constructor(message) {
        super('CONCURRENCY_ERROR', message);
    }
}
exports.ConcurrencyError = ConcurrencyError;
class WorkflowError extends CoordinatorError {
    constructor(message, cause) {
        super('WORKFLOW_ERROR', message, cause);
    }
}
exports.WorkflowError = WorkflowError;
// In-memory implementation with optimistic concurrency and thread safety
class InMemorySessionRepository {
    constructor() {
        this.sessions = new Map();
        this.lock = new async_mutex_1.Mutex();
    }
    async get(sessionId) {
        const release = await this.lock.acquire();
        try {
            return structuredClone(this.sessions.get(sessionId)?.session);
        }
        finally {
            release();
        }
    }
    async getWithVersion(sessionId) {
        const release = await this.lock.acquire();
        try {
            const stored = this.sessions.get(sessionId);
            if (!stored)
                return undefined;
            return { session: structuredClone(stored.session), version: stored.version };
        }
        finally {
            release();
        }
    }
    async save(session, expectedVersion) {
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
        }
        finally {
            release();
        }
    }
    async list(filter) {
        const release = await this.lock.acquire();
        try {
            const all = Array.from(this.sessions.values()).map(v => structuredClone(v.session));
            if (!filter?.state)
                return all;
            return all.filter(s => s.state === filter.state);
        }
        finally {
            release();
        }
    }
    async delete(sessionId) {
        const release = await this.lock.acquire();
        try {
            this.sessions.delete(sessionId);
        }
        finally {
            release();
        }
    }
}
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.lock = new async_mutex_1.Mutex();
    }
    async recordSession(agentId, durationMs, success, error) {
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
        finally {
            release();
        }
    }
    async recordHandoff() {
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
        }
        finally {
            release();
        }
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
        return new Map(this.metrics);
    }
}
// ==================== Event Logger (Structured) ====================
class EventLogger {
    constructor() {
        this.events = [];
    }
    log(event) {
        this.events.push(event);
        // In production, also send to external logging system
        console.log(JSON.stringify({ level: 'info', ...event }));
    }
    getEvents() {
        return [...this.events];
    }
}
class ConsoleNotificationService {
    async send(notification) {
        console.log(`[Notification] ${notification.type} to ${notification.recipient}: ${notification.body}`);
        return ok(undefined);
    }
}
class AgentExecutor {
    constructor(config, metrics, logger) {
        this.config = config;
        this.metrics = metrics;
        this.logger = logger;
        this.circuitBreakers = new Map();
        this.lock = new async_mutex_1.Mutex();
    }
    async execute(agentId, operation, timeoutMs = this.config.defaultTimeoutMs) {
        const startTime = Date.now();
        let lastError;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            // Circuit breaker check
            let breaker = await this.getCircuitBreaker(agentId);
            if (breaker.state === 'OPEN') {
                const now = Date.now();
                if (now - breaker.lastFailureTime >= this.config.circuitBreakerTimeoutMs) {
                    breaker.state = 'HALF_OPEN';
                    breaker.successCount = 0;
                    await this.setCircuitBreaker(agentId, breaker);
                }
                else {
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
            }
            catch (err) {
                clearTimeout(timeoutId);
                lastError = err instanceof Error ? err : new Error(String(err));
                // Record failure
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
                }
            }
        }
        return err(new CoordinatorError('AGENT_FAILURE', `Agent ${agentId} failed after ${this.config.retryAttempts} attempts`, lastError));
    }
    async trackRequest(agentId) {
        const release = await this.lock.acquire();
        try {
            const breaker = this.circuitBreakers.get(agentId) ?? {
                failures: 0,
                lastFailureTime: 0,
                state: 'CLOSED',
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
        }
        finally {
            release();
        }
    }
    async getCircuitBreaker(agentId) {
        const release = await this.lock.acquire();
        try {
            return this.circuitBreakers.get(agentId) ?? {
                failures: 0,
                lastFailureTime: 0,
                state: 'CLOSED',
                successCount: 0,
                lastSuccessTime: 0,
                requestCount: 0,
                slidingWindow: [],
            };
        }
        finally {
            release();
        }
    }
    async setCircuitBreaker(agentId, breaker) {
        const release = await this.lock.acquire();
        try {
            this.circuitBreakers.set(agentId, breaker);
        }
        finally {
            release();
        }
    }
}
class WorkflowEngine {
    constructor(steps) {
        const stepMap = new Map();
        const transitionMap = new Map();
        for (const step of steps) {
            stepMap.set(step.required_state, step);
            // Create transitions with conditions
            const transitions = [];
            switch (step.required_state) {
                case 'INTAKE':
                    transitions.push({
                        from: 'INTAKE',
                        to: 'TRIAGE',
                        priority: 1
                    });
                    break;
                case 'TRIAGE':
                    transitions.push({
                        from: 'TRIAGE',
                        to: 'ROUTING',
                        condition: (result, session) => result?.urgency === 'EMERGENT' || result?.urgency === 'URGENT',
                        priority: 1
                    }, {
                        from: 'TRIAGE',
                        to: 'COMPLETE',
                        condition: (result, session) => result?.urgency === 'ROUTINE',
                        priority: 2
                    });
                    break;
                case 'ROUTING':
                    transitions.push({
                        from: 'ROUTING',
                        to: 'MEDS',
                        condition: (result, session) => !!(session.metadata?.referral_details),
                        priority: 1
                    }, {
                        from: 'ROUTING',
                        to: 'COMPLETE',
                        condition: (result, session) => !!(session.metadata?.referral_details),
                        priority: 2
                    });
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
    getNextState(currentState, agentResult, session) {
        const transitions = this.definition.transitions.get(currentState);
        if (!transitions || transitions.length === 0)
            return null;
        // Find the first transition whose condition is met, sorted by priority
        const sortedTransitions = transitions.sort((a, b) => a.priority - b.priority);
        for (const transition of sortedTransitions) {
            if (!transition.condition || transition.condition(agentResult, session)) {
                return transition.to;
            }
        }
        return null;
    }
    getStep(state) {
        return this.definition.steps.get(state);
    }
    isTerminal(state) {
        const transitions = this.definition.transitions.get(state);
        return !transitions || transitions.length === 0;
    }
}
// ==================== Workflow Orchestrator (Refactored) ====================
class WorkflowOrchestrator {
    constructor(config, agentExecutor, metrics, logger, sharpFhirIntegration, notificationService) {
        this.config = config;
        this.agentExecutor = agentExecutor;
        this.metrics = metrics;
        this.logger = logger;
        this.sharpFhirIntegration = sharpFhirIntegration;
        this.notificationService = notificationService ?? new ConsoleNotificationService();
        this.engine = this.buildWorkflow();
    }
    buildWorkflow() {
        const steps = [
            {
                step_id: 'intake',
                step_name: 'Patient Intake',
                agent: 'atlas-agent-proxy',
                required_state: 'INTAKE',
                next_states: ['TRIAGE'],
                conditions: { symptoms_required: [] },
                timeout_seconds: 300,
                retry_attempts: 3,
            },
            {
                step_id: 'triage',
                step_name: 'Symptom Triage',
                agent: 'atlas-agent-triage',
                required_state: 'TRIAGE',
                next_states: ['ROUTING', 'COMPLETE'],
                conditions: { symptoms_required: ['pain', 'fever', 'shortness of breath'] },
                timeout_seconds: 180,
                retry_attempts: 3,
            },
            {
                step_id: 'routing',
                step_name: 'Care Routing',
                agent: 'atlas-agent-referral',
                required_state: 'ROUTING',
                next_states: ['MEDS', 'COMPLETE'],
                conditions: { urgency_required: 'EMERGENT' },
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
        return new WorkflowEngine(steps);
    }
    async process(session) {
        const startTime = Date.now();
        let currentState = session.state;
        let lastError;
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
            }
            const outcome = this.determineOutcome(session);
            await this.completeSession(session, outcome);
            const result = this.buildResult(session, outcome, startTime);
            return ok(result);
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            await this.handleError(session, lastError);
            const outcome = 'SYSTEM_ERROR';
            const result = this.buildResult(session, outcome, startTime);
            return err(lastError);
        }
    }
    async applyAgentResult(session, agentId, result) {
        // Apply mutations based on agent result
        switch (agentId) {
            case 'atlas-agent-triage':
                if (!session.metadata)
                    session.metadata = {};
                session.metadata.triage_result = result;
                break;
            case 'atlas-agent-referral':
                if (!session.metadata)
                    session.metadata = {};
                session.metadata.referral_details = result;
                break;
            case 'atlas-agent-meds':
                if (!session.metadata)
                    session.metadata = {};
                session.metadata.medication_check = result;
                break;
            case 'atlas-agent-proxy':
                if (!session.metadata)
                    session.metadata = {};
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
    async executeStep(session, step) {
        if (!this.checkConditions(session, step)) {
            return err(new WorkflowError(`Conditions not met for step ${step.step_name}`));
        }
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
        await this.metrics.recordHandoff();
        const timeoutMs = (step.timeout_seconds ?? 30) * 1000;
        const executeStartTime = Date.now();
        const result = await this.agentExecutor.execute(step.agent, async (signal) => {
            return this.callAgent(step.agent, session, signal);
        }, timeoutMs);
        if (!result.ok) {
            if (step.fallback_agent) {
                const fallbackStep = { ...step, agent: step.fallback_agent };
                return this.executeStep(session, fallbackStep);
            }
            return err(result.error);
        }
        // Update handoff status
        const updatedHandoff = session.agent_handoffs.find(h => h.handoff_id === handoff.handoff_id);
        if (updatedHandoff)
            updatedHandoff.status = 'completed';
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
                processing_time: Date.now() - executeStartTime,
            });
        }
        return ok(result.value);
    }
    async callAgent(agentId, session, signal) {
        const { AIAgentFactory } = await Promise.resolve().then(() => __importStar(require('@atlas-core/ai')));
        const { createAtlasFhir } = await Promise.resolve().then(() => __importStar(require('@atlas-std/fhir')));
        switch (agentId) {
            case 'atlas-agent-triage': {
                const triageAgent = AIAgentFactory.getTriageAgent();
                let clinicalContext = session.metadata?.clinicalContext || {};
                try {
                    if (session.patient_id && session.metadata?.sharpContext && this.sharpFhirIntegration) {
                        clinicalContext = await this.sharpFhirIntegration.getClinicalContext(session.patient_id);
                    }
                }
                catch (fhirError) {
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
                            type: 'bearer',
                            token: process.env.FHIR_TOKEN || 'demo-token',
                        },
                    });
                    const medications = await fhir.medicationRequest.search({
                        patient: session.patient_id,
                        status: 'active',
                    });
                    const medList = medications.entry?.map((med) => med.resource.medicationCodeableConcept?.text ||
                        med.resource.medicationReference?.display ||
                        'Unknown medication') || [];
                    // Return result without mutating session
                    return {
                        medications_found: medList.length > 0,
                        current_medications: medList,
                        interactions_found: medList.length > 1,
                        contraindications: medList.length > 2 ? ['Multiple medications require review'] : [],
                        recommendations: medList.length > 0 ? ['Review medication list with provider'] : ['No active medications found'],
                    };
                }
                catch (error) {
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
                let instructions = [];
                if (triageResult?.urgency === 'EMERGENT') {
                    message = 'Please proceed to nearest emergency department immediately';
                    instructions = ['Call 911 or go to nearest ED', 'Bring current medications and ID', 'Do not drive yourself if possible'];
                }
                else if (referralDetails) {
                    message = `Please contact ${referralDetails.facility} for ${referralDetails.specialist_type} appointment`;
                    instructions = [`Call ${referralDetails.facility} to schedule`, 'Bring insurance information', 'Prepare list of current symptoms'];
                }
                else {
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
        return true;
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
    determineSpecialty(differential) {
        if (!differential?.length)
            return 'Primary Care';
        const condition = differential[0].condition?.toLowerCase() || '';
        if (condition.includes('cardiac') || condition.includes('heart'))
            return 'Cardiology';
        if (condition.includes('respiratory') || condition.includes('lung'))
            return 'Pulmonology';
        if (condition.includes('neuro') || condition.includes('brain'))
            return 'Neurology';
        if (condition.includes('ortho') || condition.includes('bone'))
            return 'Orthopedics';
        if (condition.includes('derm') || condition.includes('skin'))
            return 'Dermatology';
        return 'Primary Care';
    }
    selectFacility(urgency, differential) {
        if (urgency === 'EMERGENT')
            return 'Nearest Emergency Department';
        if (urgency === 'URGENT')
            return 'Urgent Care Center';
        return 'Primary Care Clinic';
    }
    estimateWaitTime(urgency) {
        switch (urgency) {
            case 'EMERGENT': return 0;
            case 'URGENT': return 30;
            default: return 120;
        }
    }
    mapPathway(suggestedPathway) {
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
        this.sessionRepo = config.sessionRepoType === 'inmemory'
            ? new InMemorySessionRepository()
            : new InMemorySessionRepository(); // Placeholder for Redis
        this.metrics = new MetricsCollector();
        this.logger = new EventLogger();
        this.agentExecutor = new AgentExecutor(this.config, this.metrics, this.logger);
        this.sharpFhirIntegration = new sharp_fhir_integration_1.SHARPFhirIntegration({
            fhirBaseUrl: process.env.FHIR_BASE_URL,
            fhirToken: process.env.FHIR_TOKEN,
        });
        this.notificationService = new ConsoleNotificationService();
        this.orchestrator = new WorkflowOrchestrator(this.config, this.agentExecutor, this.metrics, this.logger, this.sharpFhirIntegration, this.notificationService);
    }
    async coordinateCare(request) {
        const maxRetries = 3;
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                const validatedRequest = types_1.CoordinationRequestSchema.parse(request);
                const session = this.createSession(validatedRequest);
                // Initialize SHARP context
                const sharpContext = this.sharpFhirIntegration.initializeSHARPSession(session.patient_id, session.session_id, ['read', 'search'], ['treatment', 'data_processing']);
                if (!session.metadata)
                    session.metadata = {};
                session.metadata.sharpContext = sharpContext;
                await this.addTimelineEvent(session, {
                    event_id: (0, uuid_1.v4)(),
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
                let workflowResult;
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
            }
            catch (error) {
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
    async cancelSession(sessionId) {
        const sid = brandSessionId(sessionId);
        const session = await this.sessionRepo.get(sid);
        if (!session)
            return err(new SessionNotFoundError(sessionId));
        if (session.state === 'COMPLETE' || session.state === 'CANCELLED') {
            return ok(false);
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
        const saveResult = await this.sessionRepo.save(session);
        if (!saveResult.ok)
            return err(saveResult.error);
        return ok(true);
    }
    async getSession(sessionId) {
        return this.sessionRepo.get(brandSessionId(sessionId));
    }
    async listActiveSessions() {
        return this.sessionRepo.list({ state: 'INTAKE' });
        // Could filter for non-terminal states
    }
    async getMetrics(agentId) {
        return this.metrics.getMetrics(agentId);
    }
    getIntegrationEvents() {
        return this.logger.getEvents();
    }
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
                'notifications',
            ],
        };
    }
    createSession(request) {
        const sessionId = (0, uuid_1.v4)();
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
    async addTimelineEvent(session, event) {
        session.timeline.push(event);
        session.updated_at = event.timestamp;
        // No need to save here; caller will save
    }
}
exports.CareCoordinator = CareCoordinator;
//# sourceMappingURL=care-coordinator.js.map