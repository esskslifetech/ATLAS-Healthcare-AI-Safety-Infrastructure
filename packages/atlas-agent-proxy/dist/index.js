"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientProxyAgent = exports.PatientProxyError = void 0;
exports.setTracer = setTracer;
exports.createPatientProxyAgent = createPatientProxyAgent;
// patient-proxy.ts
const uuid_1 = require("uuid");
const async_mutex_1 = require("async-mutex");
const events_1 = require("events");
const types_1 = require("./types");
const defaultConfig = {
    agentId: 'atlas-agent-proxy',
    defaultTimeoutMs: 10000,
    retry: {
        maxAttempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        jitterFactor: 0.2,
    },
    circuitBreaker: {
        failureThreshold: 5,
        timeoutMs: 30000,
        halfOpenMaxCalls: 1,
    },
    sessionMaxDurationMs: 30 * 60000,
    sessionCleanupIntervalMs: 5 * 60000,
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
    careCoordinator: { emitEvents: false },
};
// ==================== Custom Error ====================
class PatientProxyError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'PatientProxyError';
    }
}
exports.PatientProxyError = PatientProxyError;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
        this.histogramBuckets = [0, 100, 500, 1000, 5000, 10000, 30000];
    }
    recordMessage(agentId, durationMs, success, error) {
        const key = agentId;
        let current = this.metrics.get(key);
        if (!current) {
            current = {
                messageCount: 0,
                successCount: 0,
                failureCount: 0,
                averageProcessingTimeMs: 0,
                emergencyEscalationCount: 0,
                errorCount: 0,
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        current.messageCount++;
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
        current.averageProcessingTimeMs =
            (current.averageProcessingTimeMs * (current.messageCount - 1) + durationMs) / current.messageCount;
        const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
        const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
        current.durationHistogram[idx]++;
        this.metrics.set(key, current);
    }
    recordEmergencyEscalation() {
        const key = 'global';
        let current = this.metrics.get(key);
        if (!current) {
            current = {
                messageCount: 0,
                successCount: 0,
                failureCount: 0,
                averageProcessingTimeMs: 0,
                emergencyEscalationCount: 0,
                errorCount: 0,
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        current.emergencyEscalationCount++;
        this.metrics.set(key, current);
    }
    getMetrics(agentId) {
        if (agentId) {
            return this.metrics.get(agentId) ?? {
                messageCount: 0,
                successCount: 0,
                failureCount: 0,
                averageProcessingTimeMs: 0,
                emergencyEscalationCount: 0,
                errorCount: 0,
                durationHistogram: new Array(this.histogramBuckets.length).fill(0),
            };
        }
        return this.metrics;
    }
}
class EventLogger {
    constructor() {
        this.events = [];
    }
    log(event) {
        this.events.push(event);
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
let globalTracer = new NoopTracer();
function setTracer(tracer) {
    globalTracer = tracer;
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
    async call(serviceName, fn) {
        const state = this.getState(serviceName);
        if (state.state === 'OPEN') {
            const now = Date.now();
            if (now - state.lastFailureTime >= this.config.timeoutMs) {
                state.state = 'HALF_OPEN';
                state.halfOpenSuccesses = 0;
                this.states.set(serviceName, state);
            }
            else {
                return { ok: false, error: new PatientProxyError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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
                this.states.set(serviceName, state);
            }
            return { ok: true, value: result };
        }
        catch (err) {
            state.failures++;
            state.lastFailureTime = Date.now();
            if (state.failures >= this.config.failureThreshold) {
                state.state = 'OPEN';
            }
            this.states.set(serviceName, state);
            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }
    getState(serviceName) {
        return this.states.get(serviceName) ?? {
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
// ==================== Message Analyzer ====================
class MessageAnalyzer {
    async analyze(message, signal) {
        const content = message.content.toLowerCase();
        const sentiment = this.analyzeSentiment(content);
        const urgencyIndicators = this.identifyUrgencyIndicators(content);
        const medicalKeywords = this.extractMedicalKeywords(content);
        const requiresMedicalAttention = this.assessMedicalAttentionNeed(content, urgencyIndicators);
        const requiresClarification = this.identifyClarificationNeeds(content, medicalKeywords);
        const suggestedResponses = this.generateSuggestedResponses(content, sentiment, urgencyIndicators);
        const confidenceScore = this.calculateConfidence(content, medicalKeywords, urgencyIndicators);
        return types_1.MessageAnalysisSchema.parse({
            message_id: message.id,
            sentiment,
            urgency_indicators: urgencyIndicators,
            medical_keywords: medicalKeywords,
            requires_medical_attention: requiresMedicalAttention,
            requires_clarification: requiresClarification,
            suggested_responses: suggestedResponses,
            confidence_score: confidenceScore,
        });
    }
    analyzeSentiment(content) {
        const anxietyWords = ['worried', 'anxious', 'scared', 'panic', 'afraid', 'nervous'];
        const frustrationWords = ['frustrated', 'annoyed', 'upset', 'angry', 'mad'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst'];
        const positiveWords = ['good', 'better', 'great', 'happy', 'relieved'];
        const confusedWords = ['confused', 'unsure', 'don\'t understand', 'what does this mean', 'unclear'];
        if (confusedWords.some(word => content.includes(word)))
            return 'confused';
        if (anxietyWords.some(word => content.includes(word)))
            return 'anxious';
        if (frustrationWords.some(word => content.includes(word)))
            return 'frustrated';
        if (negativeWords.some(word => content.includes(word)))
            return 'negative';
        if (positiveWords.some(word => content.includes(word)))
            return 'positive';
        return 'neutral';
    }
    identifyUrgencyIndicators(content) {
        const indicators = [];
        const emergencyWords = ['emergency', '911', 'ambulance', 'call help', 'immediate', 'right away'];
        const urgentWords = ['urgent', 'asap', 'soon', 'quickly', 'hurry'];
        const severeWords = ['severe', 'terrible', 'awful', 'extreme', 'unbearable'];
        const durationWords = ['hours', 'days', 'weeks', 'months'];
        if (emergencyWords.some(word => content.includes(word)))
            indicators.push('emergency');
        if (urgentWords.some(word => content.includes(word)))
            indicators.push('urgent');
        if (severeWords.some(word => content.includes(word)))
            indicators.push('severe');
        if (durationWords.some(word => content.includes(word)))
            indicators.push('duration_mentioned');
        return indicators;
    }
    extractMedicalKeywords(content) {
        const keywords = [];
        const symptoms = [
            'pain', 'headache', 'chest pain', 'abdominal pain', 'back pain',
            'fever', 'cough', 'shortness of breath', 'difficulty breathing',
            'nausea', 'vomiting', 'diarrhea', 'constipation',
            'dizziness', 'fatigue', 'weakness', 'numbness', 'tingling',
            'rash', 'swelling', 'bleeding', 'bruising'
        ];
        const medications = [
            'aspirin', 'tylenol', 'advil', 'ibuprofen', 'blood pressure',
            'diabetes', 'insulin', 'antibiotics', 'allergy medicine'
        ];
        const bodyParts = [
            'head', 'chest', 'stomach', 'abdomen', 'back', 'arm', 'leg',
            'heart', 'lungs', 'kidney', 'liver', 'brain'
        ];
        const allKeywords = [...symptoms, ...medications, ...bodyParts];
        for (const kw of allKeywords) {
            if (content.includes(kw))
                keywords.push(kw);
        }
        return [...new Set(keywords)];
    }
    assessMedicalAttentionNeed(content, urgencyIndicators) {
        const emergencySymptoms = [
            'chest pain', 'shortness of breath', 'difficulty breathing',
            'loss of consciousness', 'seizure', 'stroke', 'heart attack'
        ];
        if (emergencySymptoms.some(symptom => content.includes(symptom)))
            return true;
        if (urgencyIndicators.includes('emergency'))
            return true;
        if (content.includes('severe pain') || content.includes('terrible pain'))
            return true;
        return false;
    }
    identifyClarificationNeeds(content, medicalKeywords) {
        const needs = [];
        if (content.includes('pain') && !content.includes('where') && !content.includes('location'))
            needs.push('pain_location');
        if (content.includes('pain') && !content.includes('scale') && !content.includes('1-10'))
            needs.push('pain_severity');
        if (medicalKeywords.length > 0 && !content.includes('how long') && !content.includes('since when'))
            needs.push('symptom_duration');
        if (content.includes('fever') && !content.match(/\d+\.?\d*\s*degree/))
            needs.push('temperature_reading');
        return needs;
    }
    generateSuggestedResponses(content, sentiment, urgencyIndicators) {
        const responses = [];
        if (urgencyIndicators.includes('emergency')) {
            responses.push('This sounds like it needs immediate medical attention. Please call emergency services or go to the nearest emergency room.');
            responses.push('Can you tell me more about your symptoms while you wait for help?');
            return responses;
        }
        if (sentiment === 'anxious' || sentiment === 'frustrated') {
            responses.push('I understand this is concerning for you. Let me help you figure out the best next step.');
        }
        if (sentiment === 'confused') {
            responses.push('I\'ll try to explain that in simpler terms. Let me help you understand.');
        }
        responses.push('Can you tell me more about what you\'re experiencing?');
        if (this.extractMedicalKeywords(content).length > 0) {
            responses.push('I\'m here to help assess your symptoms and guide you to appropriate care.');
        }
        return responses;
    }
    calculateConfidence(content, medicalKeywords, urgencyIndicators) {
        let confidence = 0.3;
        confidence += Math.min(medicalKeywords.length * 0.1, 0.3);
        confidence += Math.min(urgencyIndicators.length * 0.1, 0.2);
        if (content.length > 50)
            confidence += 0.1;
        return Math.min(confidence, 1.0);
    }
}
// ==================== Content Templater ====================
class ContentTemplater {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }
    initializeTemplates() {
        const templates = [
            {
                template_id: 'greeting_basic',
                category: 'greeting',
                language: 'en',
                health_literacy: 'basic',
                content: 'Hello! I\'m here to help you with your health concerns. What symptoms are you experiencing today?',
            },
            {
                template_id: 'emergency_response',
                category: 'emergency',
                language: 'en',
                health_literacy: 'basic',
                content: 'This sounds like it needs immediate medical attention. Please call emergency services (911) or go to the nearest emergency room right away. I\'ll stay with you while you wait.',
            },
            {
                template_id: 'symptom_collection',
                category: 'symptom_collection',
                language: 'en',
                health_literacy: 'intermediate',
                content: 'Thank you for sharing that information. To help me better understand your symptoms, could you tell me: 1) Where exactly are you feeling this? 2) How severe is it on a scale of 1-10? 3) When did it start?',
            },
            {
                template_id: 'vital_signs_request',
                category: 'vital_signs',
                language: 'en',
                health_literacy: 'basic',
                content: 'If you have them available, could you share your current vital signs? This includes your temperature, blood pressure, and heart rate.',
            },
            {
                template_id: 'educational_content',
                category: 'education',
                language: 'en',
                health_literacy: 'basic',
                content: 'Here\'s some helpful information about {condition}. {content}',
                variables: ['condition', 'content'],
            },
        ];
        templates.forEach(t => this.templates.set(t.template_id, t));
    }
    getTemplate(category, language, healthLiteracy) {
        return Array.from(this.templates.values()).find(t => t.category === category && t.language === language && t.health_literacy === healthLiteracy);
    }
    personalize(template, patientName, symptoms, additional) {
        let content = template.content;
        content = content.replace('{patient_name}', patientName || 'you');
        content = content.replace('{symptoms}', symptoms.join(', '));
        if (additional) {
            for (const [key, value] of Object.entries(additional)) {
                content = content.replace(`{${key}}`, value);
            }
        }
        return content;
    }
}
// ==================== Educational Content Suggestion ====================
class EducationalContentService {
    constructor() {
        this.contentMap = {
            chest_pain: 'Chest pain can be a sign of a heart attack. If you have chest pain, call emergency services immediately.',
            headache: 'Headaches can be caused by stress, dehydration, or other factors. If it\'s severe or persistent, seek medical advice.',
            fever: 'Fever is often a sign of infection. Rest, drink fluids, and monitor your temperature.',
            // More mappings...
        };
    }
    suggest(symptoms) {
        // Find best match
        const matchedSymptom = symptoms.find(s => this.contentMap[s.toLowerCase()]);
        if (matchedSymptom) {
            return this.contentMap[matchedSymptom];
        }
        return null;
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
                return { ok: false, error: new PatientProxyError('NOT_FOUND', `Session ${sessionId} not found`) };
            }
            const result = await operation(session);
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
    getOrCreateSession(message) {
        const sessionId = message.session_id;
        let session = this.sessions.get(sessionId);
        if (!session) {
            session = {
                session_id: sessionId,
                patient_id: message.patient_id,
                start_time: message.timestamp,
                status: 'active',
                channel: message.channel,
                messages: [],
                context: {
                    vital_signs_collected: false,
                    triage_performed: false,
                    consent_obtained: false,
                    escalation_triggered: false,
                    provider_notified: false,
                },
                summary: {
                    total_messages: 0,
                    patient_messages: 0,
                    agent_messages: 0,
                },
            };
            this.sessions.set(sessionId, session);
        }
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
            if (session.status !== 'completed' && session.status !== 'escalated') {
                const startTime = new Date(session.start_time).getTime();
                if (now - startTime > this.config.sessionMaxDurationMs) {
                    await this.sessionManager.withSession(session.session_id, async (s) => {
                        s.status = 'completed';
                        s.end_time = new Date().toISOString();
                        s.summary = s.summary || { total_messages: 0, patient_messages: 0, agent_messages: 0 };
                        s.summary.session_duration = Math.floor((now - startTime) / 1000);
                    });
                    this.logger.log({
                        id: (0, uuid_1.v4)(),
                        type: 'SESSION_TIMEOUT',
                        timestamp: new Date().toISOString(),
                        source: this.config.agentId,
                        sessionId: session.session_id,
                        patientId: session.patient_id,
                        data: { reason: 'inactivity_timeout' },
                        success: false,
                    });
                }
            }
        }
    }
}
// ==================== Patient Profile Manager ====================
class PatientProfileManager {
    constructor() {
        this.profiles = new Map();
    }
    async getProfile(patientId) {
        let profile = this.profiles.get(patientId);
        if (!profile) {
            profile = {
                patient_id: patientId,
                preferred_language: 'en',
                health_literacy: 'intermediate',
                communication_preferences: {
                    channel: 'chat',
                    message_frequency: 'immediate',
                    reading_level: 'intermediate',
                    medical_jargon_tolerance: 'low',
                    empathy_level: 'friendly',
                },
                accessibility_needs: {
                    simple_language: true,
                    large_text: false,
                    voice_output: false,
                    visual_aids: false,
                },
            };
            this.profiles.set(patientId, profile);
        }
        return profile;
    }
    updateProfile(patientId, updates) {
        const existing = this.profiles.get(patientId);
        if (existing) {
            Object.assign(existing, updates);
            this.profiles.set(patientId, existing);
        }
    }
}
class HealthChecker {
    constructor(circuitBreaker) {
        this.circuitBreaker = circuitBreaker;
    }
    getHealth() {
        const circuitBreakers = this.circuitBreaker.getAllStates();
        const services = new Map();
        for (const [service, state] of circuitBreakers) {
            services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
        }
        const healthy = Array.from(services.values()).every(s => s.healthy);
        return { healthy, services, circuitBreakers };
    }
}
// ==================== Event Emitter for Integration ====================
class IntegrationEventEmitter {
    constructor() {
        this.emitter = new events_1.EventEmitter();
    }
    emit(event, payload) {
        this.emitter.emit(event, payload);
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
}
// ==================== Main Patient Proxy Agent ====================
class PatientProxyAgent {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.sessionManager = new SessionManager();
        this.profileManager = new PatientProfileManager();
        this.metrics = new MetricsCollector();
        this.logger = new EventLogger();
        this.tracer = globalTracer;
        this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
        this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
        this.messageAnalyzer = new MessageAnalyzer();
        this.contentTemplater = new ContentTemplater();
        this.educationalService = new EducationalContentService();
        this.watcher = new SessionWatcher(this.sessionManager, this.config, this.logger);
        this.healthChecker = new HealthChecker(this.circuitBreaker);
        this.eventEmitter = new IntegrationEventEmitter();
        this.watcher.start();
    }
    /**
     * Process an incoming patient message.
     */
    async processMessage(message) {
        const span = this.tracer.startSpan('patientProxy.processMessage');
        span.setAttribute('session.id', message.session_id);
        const startTime = Date.now();
        try {
            const validatedMessage = types_1.PatientMessageSchema.parse(message);
            const sessionObj = this.sessionManager.getOrCreateSession(validatedMessage);
            // Acquire lock for the session
            const result = await this.sessionManager.withSession(sessionObj.session_id, async (s) => {
                // Add message to session
                s.messages.push(validatedMessage);
                // Analyze message (external NLP call with circuit breaker & retry)
                const analysisResult = await this.circuitBreaker.call('nlpService', async () => {
                    return await this.retryWithTimeout(() => this.messageAnalyzer.analyze(validatedMessage), this.config.defaultTimeoutMs);
                });
                if (!analysisResult.ok) {
                    throw analysisResult.error;
                }
                const analysis = analysisResult.value;
                // Get patient profile
                const profile = await this.profileManager.getProfile(validatedMessage.patient_id);
                // Generate response
                const response = await this.generateResponse(validatedMessage, analysis, profile, s);
                // Add response to session
                s.messages.push(response);
                // Update session context
                this.updateSessionContext(s, validatedMessage, analysis);
                // Check for emergency escalation
                if (analysis.requires_medical_attention && analysis.urgency_indicators.includes('emergency')) {
                    await this.triggerEmergencyEscalation(validatedMessage, analysis, s);
                }
                // Optionally suggest educational content
                if (analysis.medical_keywords.length > 0 && !analysis.requires_medical_attention) {
                    const educational = this.educationalService.suggest(analysis.medical_keywords);
                    if (educational && this.config.careCoordinator?.emitEvents) {
                        this.eventEmitter.emit('educational_content', {
                            patientId: validatedMessage.patient_id,
                            sessionId: validatedMessage.session_id,
                            content: educational,
                        });
                    }
                }
                // Emit event to care coordinator if configured
                if (this.config.careCoordinator?.emitEvents) {
                    this.eventEmitter.emit('message_processed', {
                        sessionId: validatedMessage.session_id,
                        patientId: validatedMessage.patient_id,
                        analysis,
                        response,
                    });
                }
                return response;
            });
            const duration = Date.now() - startTime;
            this.metrics.recordMessage(this.config.agentId, duration, result.ok);
            if (!result.ok) {
                this.metrics.recordMessage(this.config.agentId, duration, false, result.error.message);
            }
            span.end();
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.metrics.recordMessage(this.config.agentId, duration, false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async retryWithTimeout(fn, timeoutMs) {
        return new Promise(async (resolve, reject) => {
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
            let attempt = 0;
            const executeWithRetry = async () => {
                while (attempt < this.config.retry.maxAttempts) {
                    try {
                        const result = await fn();
                        clearTimeout(timeoutId);
                        resolve(result);
                        return;
                    }
                    catch (err) {
                        attempt++;
                        if (!this.retryStrategy.shouldRetry(attempt, err)) {
                            clearTimeout(timeoutId);
                            reject(err);
                            return;
                        }
                        const delay = this.retryStrategy.getDelay(attempt);
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
                clearTimeout(timeoutId);
                reject(new Error('Max retries exceeded'));
            };
            executeWithRetry();
        });
    }
    async generateResponse(message, analysis, profile, session) {
        const responseId = (0, uuid_1.v4)();
        // Select template based on analysis and profile
        let category = 'informational';
        if (analysis.requires_medical_attention)
            category = 'emergency';
        else if (analysis.requires_clarification.length > 0)
            category = 'symptom_collection';
        else if (analysis.medical_keywords.length > 0)
            category = 'symptom_collection';
        const template = this.contentTemplater.getTemplate(category, profile.preferred_language, profile.health_literacy) ||
            this.contentTemplater.getTemplate('greeting', 'en', 'basic');
        if (!template) {
            throw new PatientProxyError('NO_TEMPLATE', 'No suitable content template found');
        }
        const personalizedContent = this.contentTemplater.personalize(template, message.patient_id, analysis.medical_keywords);
        const responseType = this.determineResponseType(analysis, session);
        const response = {
            id: responseId,
            session_id: message.session_id,
            message_type: this.getResponseType(responseType),
            channel: message.channel,
            content: personalizedContent,
            timestamp: new Date().toISOString(),
            metadata: {
                response_type: responseType,
                next_steps: this.generateNextSteps(analysis, session),
                follow_up_required: analysis.requires_medical_attention,
                escalation_triggered: analysis.urgency_indicators.includes('emergency'),
                language: profile.preferred_language,
                reading_level: profile.communication_preferences.reading_level,
            },
        };
        return types_1.AgentResponseSchema.parse(response);
    }
    determineResponseType(analysis, session) {
        if (analysis.requires_medical_attention)
            return 'emergency';
        if (analysis.requires_clarification.length > 0)
            return 'clarification';
        if (analysis.medical_keywords.length > 0)
            return 'recommendation';
        return 'informational';
    }
    getResponseType(responseType) {
        switch (responseType) {
            case 'emergency': return 'emergency_alert';
            case 'clarification': return 'text';
            case 'recommendation': return 'text';
            case 'educational': return 'educational_content';
            default: return 'text';
        }
    }
    generateNextSteps(analysis, session) {
        const steps = [];
        if (analysis.requires_clarification.length > 0)
            steps.push('Provide more details about your symptoms');
        if (analysis.requires_medical_attention)
            steps.push('Seek immediate medical attention');
        if (!session.context?.vital_signs_collected && analysis.medical_keywords.length > 0)
            steps.push('Provide vital signs if available');
        return steps;
    }
    updateSessionContext(session, message, analysis) {
        if (!session.context)
            session.context = {
                vital_signs_collected: false,
                triage_performed: false,
                consent_obtained: false,
                escalation_triggered: false,
                provider_notified: false,
            };
        if (analysis.medical_keywords.length > 0) {
            session.context.symptoms_discussed = [...(session.context.symptoms_discussed || []), ...analysis.medical_keywords];
        }
        if (session.summary) {
            session.summary.total_messages = session.messages.length;
            session.summary.patient_messages = session.messages.filter(m => ('patient_id' in m)).length;
            session.summary.agent_messages = session.messages.filter(m => !('patient_id' in m)).length;
        }
    }
    async triggerEmergencyEscalation(message, analysis, session) {
        const escalation = {
            escalation_id: (0, uuid_1.v4)(),
            patient_id: message.patient_id,
            session_id: message.session_id,
            trigger_reason: 'Emergency symptoms detected in patient message',
            urgency: analysis.urgency_indicators.includes('emergency') ? 'EMERGENT' : 'URGENT',
            symptoms: analysis.medical_keywords,
            vital_signs: message.metadata?.vital_signs,
            actions_taken: ['Notified emergency response team', 'Activated emergency protocol'],
            provider_notified: true,
            emergency_services_called: analysis.urgency_indicators.includes('emergency'),
            timestamp: new Date().toISOString(),
        };
        session.status = 'escalated';
        if (session.context) {
            session.context.escalation_triggered = true;
            session.context.provider_notified = true;
        }
        this.metrics.recordEmergencyEscalation();
        this.logger.log({
            id: (0, uuid_1.v4)(),
            type: 'EMERGENCY_ESCALATION',
            timestamp: escalation.timestamp,
            source: this.config.agentId,
            sessionId: message.session_id,
            patientId: message.patient_id,
            data: escalation,
            success: true,
        });
        // Emit to care coordinator if configured
        if (this.config.careCoordinator?.emitEvents) {
            this.eventEmitter.emit('emergency_escalation', escalation);
        }
        return types_1.EmergencyEscalationSchema.parse(escalation);
    }
    /**
     * Ends a patient session.
     */
    async endSession(sessionId) {
        const result = await this.sessionManager.withSession(sessionId, async (session) => {
            session.end_time = new Date().toISOString();
            session.status = 'completed';
            if (session.start_time) {
                const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
                session.summary = session.summary || { total_messages: 0, patient_messages: 0, agent_messages: 0 };
                session.summary.session_duration = Math.floor(duration / (1000 * 60));
            }
            // Generate summary
            session.summary = session.summary || { total_messages: 0, patient_messages: 0, agent_messages: 0 };
            session.summary.resolution = session.context?.escalation_triggered ? 'escalated' : 'resolved';
            return session;
        });
        return result;
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
        return this.sessionManager.getAllSessions().filter(s => s.status === 'active');
    }
    /**
     * Returns performance metrics.
     */
    getMetrics(agentId) {
        return this.metrics.getMetrics(agentId);
    }
    /**
     * Returns logged events.
     */
    getEvents() {
        return this.logger.getEvents();
    }
    /**
     * Returns health status.
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
            name: 'ATLAS Patient Proxy Agent',
            version: '1.0.0',
            capabilities: [
                'natural_language_processing',
                'symptom_extraction',
                'sentiment_analysis',
                'urgency_assessment',
                'emergency_escalation',
                'health_literacy_adaptation',
                'multi_channel_communication',
                'personalized_responses',
                'circuit_breaker',
                'retry_with_backoff',
                'concurrency_safety',
                'observability',
                'educational_content_suggestion',
                'integration_events',
            ],
        };
    }
    /**
     * Subscribes to integration events (e.g., for care coordinator).
     */
    on(event, listener) {
        this.eventEmitter.on(event, listener);
    }
    /**
     * Shuts down the agent gracefully.
     */
    shutdown() {
        this.watcher.stop();
    }
}
exports.PatientProxyAgent = PatientProxyAgent;
// Factory function for easy instantiation
function createPatientProxyAgent(config) {
    return new PatientProxyAgent(config);
}
//# sourceMappingURL=index.js.map