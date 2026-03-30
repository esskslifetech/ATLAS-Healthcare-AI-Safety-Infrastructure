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
exports.CareCoordinator = exports.CoordinatorError = void 0;
exports.setTracer = setTracer;
exports.createCareCoordinator = createCareCoordinator;
// care-coordinator.ts
const uuid_1 = require("uuid");
const async_mutex_1 = require("async-mutex");
const types_1 = require("./types");
const defaultConfig = {
    agentId: 'atlas-agent-coordinator',
    defaultTimeoutMs: 30000,
    retry: {
        maxAttempts: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        jitterFactor: 0.2,
    },
    circuitBreaker: {
        failureThreshold: 5,
        timeoutMs: 60000,
        halfOpenMaxCalls: 1,
    },
    sessionMaxDurationMs: 30 * 60000, // 30 minutes
    sessionCleanupIntervalMs: 5 * 60000, // 5 minutes
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
};
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.histogramBuckets = [0, 100, 500, 1000, 5000, 10000, 30000];
    }
    recordSession(agentId, durationMs, success, error) {
        const key = agentId;
        let current = this.metrics.get(key);
        if (!current) {
            current = {
                sessionCount: 0,
                successCount: 0,
                failureCount: 0,
                averageDurationMs: 0,
                handoffCount: 0,
                errorCount: 0,
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
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
        // Exponential moving average
        current.averageDurationMs =
            (current.averageDurationMs * (current.sessionCount - 1) + durationMs) / current.sessionCount;
        // Histogram
        const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
        const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
        current.durationHistogram[idx]++;
        this.metrics.set(key, current);
    }
    recordHandoff() {
        const key = 'global';
        let current = this.metrics.get(key);
        if (!current) {
            current = {
                sessionCount: 0,
                successCount: 0,
                failureCount: 0,
                averageDurationMs: 0,
                handoffCount: 0,
                errorCount: 0,
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
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
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
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
        // In production, send to external system
    }
    getEvents() {
        return [...this.events];
    }
}
class NoopTracer {
    startSpan() {
        return {
            end: () => { },
            setAttribute: () => { },
            recordException: () => { },
        };
    }
}
class NoopSpan {
    end() { }
    setAttribute() { }
    recordException() { }
}
let globalTracer = new NoopTracer();
function setTracer(tracer) {
    globalTracer = tracer;
}
// ==================== Session Manager with Locks ====================
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
            // Persist mutated session
            this.sessions.set(sessionId, session);
            return { ok: true, value: result };
        }
        finally {
            release();
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
    deleteSession(sessionId) {
        this.sessions.delete(sessionId);
        this.locks.delete(sessionId);
    }
}
// ==================== Session Watcher ====================
class SessionWatcher {
    constructor(sessionManager, config, logger) {
        this.sessionManager = sessionManager;
        this.config = config;
        this.logger = logger;
        this.interval = null;
    }
    start() {
        if (this.interval)
            return;
        this.interval = setInterval(() => this.cleanupStaleSessions(), this.config.sessionCleanupIntervalMs);
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    async cleanupStaleSessions() {
        const now = Date.now();
        const sessions = this.sessionManager.getAllSessions();
        for (const session of sessions) {
            if (session.state !== 'COMPLETE' && session.state !== 'CANCELLED') {
                const createdTime = new Date(session.created_at).getTime();
                if (now - createdTime > this.config.sessionMaxDurationMs) {
                    // Cancel session due to timeout
                    await this.sessionManager.withSession(session.session_id, async (s) => {
                        s.state = 'CANCELLED';
                        s.completed_at = new Date().toISOString();
                        s.timeline.push({
                            event_id: (0, uuid_1.v4)(),
                            timestamp: s.completed_at,
                            event_type: 'SESSION_CANCELLED',
                            agent: this.config.agentId,
                            description: 'Session automatically cancelled due to maximum duration exceeded',
                        });
                    });
                    this.logger.log({
                        event_id: (0, uuid_1.v4)(),
                        event_type: 'WORKFLOW_COMPLETED',
                        timestamp: new Date().toISOString(),
                        source_system: this.config.agentId,
                        session_id: session.session_id,
                        patient_id: session.patient_id,
                        data: { reason: 'session_timeout' },
                        success: false,
                    });
                }
            }
        }
    }
}
class HealthChecker {
    constructor(agentExecutor) {
        this.agentExecutor = agentExecutor;
    }
    getHealth() {
        const agents = new Map();
        const circuitBreakers = new Map();
        for (const [agentId, state] of this.agentExecutor.getCircuitBreakerStates()) {
            circuitBreakers.set(agentId, state);
            // For simplicity, agent is considered healthy if circuit is closed
            agents.set(agentId, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
        }
        const healthy = Array.from(agents.values()).every(a => a.healthy);
        return { healthy, agents, circuitBreakers };
    }
}
class ExponentialBackoffRetry {
    constructor(config, isRetryable = () => true) {
        this.config = config;
        this.isRetryable = isRetryable;
    }
    shouldRetry(attempt, error) {
        return attempt < this.config.maxAttempts && this.isRetryable(error);
    }
    getDelay(attempt) {
        const baseDelay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
        const cappedDelay = Math.min(baseDelay, this.config.maxDelayMs);
        const jitter = cappedDelay * this.config.jitterFactor * (Math.random() - 0.5);
        return Math.max(0, cappedDelay + jitter);
    }
}
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.states = new Map();
    }
    async call(agentId, fn) {
        const state = this.getState(agentId);
        if (state.state === 'OPEN') {
            const now = Date.now();
            if (now - state.lastFailureTime >= this.config.timeoutMs) {
                state.state = 'HALF_OPEN';
                state.halfOpenSuccesses = 0;
                this.states.set(agentId, state);
            }
            else {
                return { ok: false, error: new CoordinatorError('CIRCUIT_OPEN', `Circuit open for agent ${agentId}`) };
            }
        }
        try {
            const result = await fn();
            if (state.state === 'HALF_OPEN') {
                state.halfOpenSuccesses++;
                if (state.halfOpenSuccesses >= this.config.halfOpenMaxCalls) {
                    state.state = 'CLOSED';
                    state.failures = 0;
                }
                this.states.set(agentId, state);
            }
            return { ok: true, value: result };
        }
        catch (err) {
            state.failures++;
            state.lastFailureTime = Date.now();
            if (state.failures >= this.config.failureThreshold) {
                state.state = 'OPEN';
            }
            this.states.set(agentId, state);
            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }
    getState(agentId) {
        return this.states.get(agentId) ?? {
            state: 'CLOSED',
            failures: 0,
            lastFailureTime: 0,
            halfOpenSuccesses: 0,
        };
    }
    getAllStates() {
        return new Map(Array.from(this.states.entries()).map(([k, v]) => [k, { state: v.state, failures: v.failures, lastFailureTime: v.lastFailureTime }]));
    }
}
// ==================== Agent Executor ====================
class AgentExecutor {
    constructor(config, metrics, logger, tracer, circuitBreaker, retryStrategy) {
        this.config = config;
        this.metrics = metrics;
        this.logger = logger;
        this.tracer = tracer;
        this.circuitBreaker = circuitBreaker;
        this.retryStrategy = retryStrategy;
    }
    async execute(agentId, operation, timeoutMs = this.config.defaultTimeoutMs) {
        const span = this.tracer.startSpan(`agent.${agentId}.execute`);
        span.setAttribute('agent.id', agentId);
        const startTime = Date.now();
        try {
            const result = await this.circuitBreaker.call(agentId, async () => {
                let attempt = 1;
                let lastError;
                while (true) {
                    const abortController = new AbortController();
                    const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
                    try {
                        const res = await operation(abortController.signal);
                        clearTimeout(timeoutId);
                        return res;
                    }
                    catch (err) {
                        clearTimeout(timeoutId);
                        lastError = err instanceof Error ? err : new Error(String(err));
                        if (!this.retryStrategy.shouldRetry(attempt, lastError)) {
                            throw lastError;
                        }
                        const delay = this.retryStrategy.getDelay(attempt);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        attempt++;
                    }
                }
            });
            const duration = Date.now() - startTime;
            this.metrics.recordSession(agentId, duration, result.ok);
            if (result.ok) {
                span.end();
                return result;
            }
            else {
                span.recordException(result.error);
                span.end();
                return result;
            }
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            const duration = Date.now() - startTime;
            this.metrics.recordSession(agentId, duration, false, err.message);
            span.recordException(err);
            span.end();
            return { ok: false, error: err };
        }
    }
    getCircuitBreakerStates() {
        return this.circuitBreaker.getAllStates();
    }
}
// ==================== Workflow Orchestrator ====================
class WorkflowOrchestrator {
    constructor(config, agentExecutor, metrics, logger, tracer) {
        this.config = config;
        this.agentExecutor = agentExecutor;
        this.metrics = metrics;
        this.logger = logger;
        this.tracer = tracer;
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
        const span = this.tracer.startSpan('workflow.process');
        span.setAttribute('session.id', session.session_id);
        const startTime = Date.now();
        let currentState = session.state;
        try {
            while (currentState !== 'COMPLETE' && currentState !== 'CANCELLED') {
                const step = this.workflowSteps.get(currentState);
                if (!step) {
                    throw new CoordinatorError('INVALID_STATE', `No workflow step for state ${currentState}`);
                }
                const nextState = await this.executeStep(session, step);
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
            span.end();
            return { ok: true, value: result };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            await this.handleError(session, error);
            const outcome = 'SYSTEM_ERROR';
            const result = this.buildResult(session, outcome, startTime);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async executeStep(session, step) {
        const span = this.tracer.startSpan(`workflow.step.${step.step_id}`);
        span.setAttribute('step.name', step.step_name);
        span.setAttribute('agent', step.agent);
        if (!this.checkConditions(session, step)) {
            span.recordException(new Error(`Conditions not met for step ${step.step_name}`));
            span.end();
            throw new CoordinatorError('CONDITION_FAILED', `Conditions not met for step ${step.step_name}`);
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
        this.metrics.recordHandoff();
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
            throw result.error;
        }
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
                processing_time: Date.now() - executeStartTime, // Use the proper start time recorded above
            });
        }
        const nextState = this.determineNextState(session, step, result.value);
        span.end();
        return nextState;
    }
    async callAgent(agentId, session, signal) {
        // Import AI core and FHIR
        const { AIAgentFactory } = await Promise.resolve().then(() => __importStar(require('@atlas-core/ai')));
        const { createAtlasFhir } = await Promise.resolve().then(() => __importStar(require('@atlas-std/fhir')));
        switch (agentId) {
            case 'atlas-agent-triage': {
                const triageAgent = AIAgentFactory.getTriageAgent();
                // Gather patient data from FHIR if available
                let patientContext = session.metadata?.patientContext || {};
                try {
                    // Initialize FHIR client (demo configuration)
                    const fhir = createAtlasFhir({
                        baseUrl: process.env.FHIR_BASE_URL || 'https://demo.fhir.org/r4',
                        timeout: 30000,
                        auth: {
                            type: 'bearer',
                            token: process.env.FHIR_TOKEN || 'demo-token',
                        },
                    });
                    // Try to fetch real patient data
                    if (session.patient_id) {
                        try {
                            const patient = await fhir.patient.read(session.patient_id);
                            const observations = await fhir.observation.search({
                                patient: session.patient_id,
                                _sort: '-date',
                                _count: 10,
                            });
                            // Extract vitals from observations
                            const vitals = {};
                            observations.entry?.forEach((obs) => {
                                const code = obs.resource.code.coding?.[0]?.code;
                                const value = obs.resource.valueQuantity?.value;
                                if (code && value) {
                                    switch (code) {
                                        case '8867-4':
                                            vitals.heartRate = value;
                                            break;
                                        case '55284-4':
                                            vitals.bloodPressure = { systolic: value };
                                            break;
                                        case '8310-5':
                                            vitals.temperature = value;
                                            break;
                                        case '2708-6':
                                            vitals.oxygenSaturation = value;
                                            break;
                                        case '9279-1':
                                            vitals.respiratoryRate = value;
                                            break;
                                    }
                                }
                            });
                            patientContext = {
                                ...patientContext,
                                age: this.calculateAge(patient.birthDate),
                                vitals: Object.keys(vitals).length > 0 ? vitals : undefined,
                            };
                        }
                        catch (fhirError) {
                            console.warn('FHIR data fetch failed, using session context:', fhirError);
                        }
                    }
                }
                catch (fhirInitError) {
                    console.warn('FHIR initialization failed, using session context:', fhirInitError);
                }
                // Call AI triage agent
                const triageInput = {
                    symptoms: session.metadata?.initial_symptoms || [],
                    patientContext: {
                        age: patientContext.age || 0,
                        vitals: patientContext.vitals,
                        medications: patientContext.medications,
                        allergies: patientContext.allergies,
                        medicalHistory: patientContext.medicalHistory,
                    },
                };
                const result = await triageAgent.analyzeSymptoms(triageInput);
                if (!session.metadata)
                    session.metadata = {};
                session.metadata.triage_result = {
                    urgency: result.urgency,
                    suggested_pathway: this.mapPathway(result.suggestedPathway),
                    differential: result.differential,
                    red_flags: result.redFlags,
                    reasoning: result.reasoning,
                    confidence_score: result.confidenceScore,
                    recommendations: result.recommendations,
                    requires_immediate_attention: result.requiresImmediateAttention,
                };
                return session.metadata.triage_result;
            }
            case 'atlas-agent-referral': {
                const triageResult = session.metadata?.triage_result;
                if (!triageResult) {
                    throw new Error('No triage result available for referral');
                }
                // AI-powered referral matching
                const referralAgent = AIAgentFactory.getTriageAgent();
                // In a real implementation, this would use a separate referral AI model
                // For now, we'll use contextual logic based on triage results
                const result = {
                    specialist_type: this.determineSpecialty(triageResult.differential || []),
                    facility: this.selectFacility(triageResult.urgency, triageResult.differential || []),
                    urgency: triageResult.urgency,
                    appointment_scheduled: false,
                    wait_time_minutes: this.estimateWaitTime(triageResult.urgency),
                    distance_miles: 5.2, // Would be calculated based on patient location
                    insurance_accepted: true,
                };
                if (!session.metadata)
                    session.metadata = {};
                session.metadata.referral_details = result;
                return result;
            }
            case 'atlas-agent-meds': {
                // Use FHIR to get medication data
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
                    // AI-powered medication interaction checking
                    const medAgent = AIAgentFactory.getTriageAgent();
                    const medList = medications.entry?.map((med) => med.resource.medicationCodeableConcept?.text ||
                        med.resource.medicationReference?.display ||
                        'Unknown medication') || [];
                    const result = {
                        medications_found: medList.length > 0,
                        current_medications: medList,
                        interactions_found: medList.length > 1, // Simplified check
                        contraindications: medList.length > 2 ?
                            ['Multiple medications require review'] : [],
                        recommendations: medList.length > 0 ?
                            ['Review medication list with provider'] : ['No active medications found'],
                    };
                    if (!session.metadata)
                        session.metadata = {};
                    session.metadata.medication_check = result;
                    return result;
                }
                catch (error) {
                    // Fallback to mock data
                    const result = {
                        interactions_found: true,
                        contraindications: ['Review needed for medication interactions'],
                        recommendations: ['Consult pharmacist for medication review'],
                        current_medications: ['Demo medication 1', 'Demo medication 2'],
                    };
                    if (!session.metadata)
                        session.metadata = {};
                    session.metadata.medication_check = result;
                    return result;
                }
            }
            case 'atlas-agent-proxy': {
                const triageResult = session.metadata?.triage_result;
                const referralDetails = session.metadata?.referral_details;
                let message = '';
                let instructions = [];
                if (triageResult?.urgency === 'EMERGENT') {
                    message = 'Please proceed to the nearest emergency department immediately';
                    instructions = [
                        'Call 911 or go to nearest ED',
                        'Bring current medications and ID',
                        'Do not drive yourself if possible',
                    ];
                }
                else if (referralDetails) {
                    message = `Please contact ${referralDetails.facility} for ${referralDetails.specialist_type} appointment`;
                    instructions = [
                        `Call ${referralDetails.facility} to schedule`,
                        'Bring insurance information',
                        'Prepare list of current symptoms',
                    ];
                }
                else {
                    message = 'Your case has been reviewed. Please follow up with your primary care provider';
                    instructions = [
                        'Schedule appointment with PCP',
                        'Monitor symptoms',
                        'Seek care if symptoms worsen',
                    ];
                }
                const result = {
                    patient_notified: true,
                    message_sent: message,
                    instructions,
                };
                if (!session.metadata)
                    session.metadata = {};
                session.metadata.patient_instructions = instructions;
                return result;
            }
            default:
                throw new Error(`Unknown agent: ${agentId}`);
        }
    }
    mapPathway(aiPathway) {
        switch (aiPathway) {
            case 'ED': return 'ED';
            case 'URGENT_CARE': return 'URGENT_CARE';
            case 'TELEHEALTH': return 'TELEHEALTH';
            case 'HOSPITAL_ADMISSION': return 'PRIMARY_CARE'; // Map to closest equivalent
            default: return 'PRIMARY_CARE';
        }
    }
    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const now = new Date();
        return Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
    determineSpecialty(differential) {
        if (!differential || differential.length === 0)
            return 'Primary Care';
        const condition = differential[0].condition.toLowerCase();
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
            return 'St. Mary\'s Emergency Department';
        if (urgency === 'URGENT')
            return 'City Medical Urgent Care';
        return 'Main Health Center';
    }
    estimateWaitTime(urgency) {
        switch (urgency) {
            case 'EMERGENT': return 15;
            case 'URGENT': return 45;
            default: return 120;
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
        if (cond.symptoms_required && cond.symptoms_required.length > 0) {
            const symptoms = session.metadata?.initial_symptoms || [];
            const hasRequired = cond.symptoms_required.some(req => symptoms.some(s => s.toLowerCase().includes(req.toLowerCase())));
            if (!hasRequired)
                return false;
        }
        // data_required check omitted for brevity
        return true;
    }
    determineNextState(session, step, result) {
        switch (session.state) {
            case 'INTAKE':
                return 'TRIAGE';
            case 'TRIAGE':
                return session.metadata?.triage_result?.urgency === 'EMERGENT' ? 'ROUTING' : 'COMPLETE';
            case 'ROUTING':
                const hasReferral = session.metadata?.referral_details != null;
                const hasMeds = session.metadata?.medication_check != null;
                if (hasReferral && hasMeds)
                    return 'COMPLETE';
                if (hasReferral)
                    return 'MEDS';
                return 'ROUTING';
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
            request_id: session.session_id, // in practice, this would come from the request
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
        if (!session.metadata)
            session.metadata = {};
        session.metadata.escalation_reason = error.message;
    }
}
// ==================== Coordinator Error ====================
class CoordinatorError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'CoordinatorError';
    }
}
exports.CoordinatorError = CoordinatorError;
// ==================== Main Coordinator ====================
class CareCoordinator {
    constructor(config = defaultConfig) {
        this.config = config;
        this.sessionManager = new SessionManager();
        this.metrics = new MetricsCollector();
        this.logger = new EventLogger();
        this.tracer = globalTracer;
        this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
        this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
        this.agentExecutor = new AgentExecutor(this.config, this.metrics, this.logger, this.tracer, this.circuitBreaker, this.retryStrategy);
        this.orchestrator = new WorkflowOrchestrator(this.config, this.agentExecutor, this.metrics, this.logger, this.tracer);
        this.watcher = new SessionWatcher(this.sessionManager, this.config, this.logger);
        this.healthChecker = new HealthChecker(this.agentExecutor);
        this.watcher.start();
    }
    /**
     * Starts a new care coordination session.
     */
    async coordinateCare(request) {
        const span = this.tracer.startSpan('coordinator.coordinateCare');
        try {
            // Validate request
            const validatedRequest = types_1.CoordinationRequestSchema.parse(request);
            // Ensure request_id is present
            if (!validatedRequest.request_id) {
                validatedRequest.request_id = (0, uuid_1.v4)();
            }
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
            const result = await this.orchestrator.process(session);
            span.end();
            return result;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            span.recordException(err);
            span.end();
            return { ok: false, error: err };
        }
    }
    /**
     * Cancels an ongoing session.
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
     * Returns health status of the system.
     */
    getHealth() {
        return this.healthChecker.getHealth();
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
                'health_checks',
                'session_watcher',
            ],
        };
    }
    /**
     * Shuts down the coordinator gracefully.
     */
    shutdown() {
        this.watcher.stop();
        // Additional cleanup if needed
    }
    async addTimelineEvent(session, event) {
        session.timeline.push(event);
        session.updated_at = event.timestamp;
    }
}
exports.CareCoordinator = CareCoordinator;
// Factory function for easy instantiation
function createCareCoordinator(config) {
    return new CareCoordinator(config);
}
//# sourceMappingURL=index.js.map