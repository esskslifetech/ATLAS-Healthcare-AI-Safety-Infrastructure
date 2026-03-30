// patient-proxy.ts
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Mutex } from 'async-mutex';
import {
  PatientMessage,
  AgentResponse,
  PatientSession,
  SymptomExtraction,
  PatientProfile,
  ContentTemplate,
  NotificationPreferences,
  EmergencyEscalation,
  MessageAnalysis,
  PatientMessageSchema,
  AgentResponseSchema,
  PatientSessionSchema,
  SymptomExtractionSchema,
  PatientProfileSchema,
  ContentTemplateSchema,
  NotificationPreferencesSchema,
  EmergencyEscalationSchema,
  MessageAnalysisSchema,
  MessageType,
  MessageDirection,
  Channel,
  HealthLiteracy,
} from './types';

// ==================== Branded Types ====================
type SessionId = string & { __brand: 'SessionId' };
type PatientId = string & { __brand: 'PatientId' };
type AgentId = string & { __brand: 'AgentId' };

// ==================== Configuration ====================
export interface PatientProxyConfig {
  agentId: AgentId;
  defaultTimeoutMs: number;
  retry: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  sessionMaxDurationMs: number;
  sessionCleanupIntervalMs: number;
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  // NLP service endpoint (if external)
  nlpServiceUrl?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  halfOpenMaxCalls: number;
}

const defaultConfig: PatientProxyConfig = {
  agentId: 'atlas-agent-proxy' as AgentId,
  defaultTimeoutMs: 10_000,
  retry: {
    maxAttempts: 3,
    baseDelayMs: 500,
    maxDelayMs: 5_000,
    jitterFactor: 0.2,
  },
  circuitBreaker: {
    failureThreshold: 5,
    timeoutMs: 30_000,
    halfOpenMaxCalls: 1,
  },
  sessionMaxDurationMs: 30 * 60_000,
  sessionCleanupIntervalMs: 5 * 60_000,
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Error ====================
export class PatientProxyError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'PatientProxyError';
  }
}

// ==================== Metrics ====================
interface MetricsSnapshot {
  messageCount: number;
  successCount: number;
  failureCount: number;
  averageProcessingTimeMs: number;
  emergencyEscalationCount: number;
  errorCount: number;
  lastError?: string;
  durationHistogram: number[];
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();
  private readonly histogramBuckets = [0, 100, 500, 1000, 5000, 10000, 30000];

  recordMessage(agentId: string, durationMs: number, success: boolean, error?: string): void {
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
    } else {
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

  recordEmergencyEscalation(): void {
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

  getMetrics(agentId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
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

// ==================== Event Logger ====================
interface EventLog {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  sessionId: string;
  patientId: string;
  data: any;
  success: boolean;
}

class EventLogger {
  private events: EventLog[] = [];

  log(event: EventLog): void {
    this.events.push(event);
  }

  getEvents(): EventLog[] {
    return [...this.events];
  }
}

// ==================== Tracer (OpenTelemetry compatible) ====================
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

// ==================== Retry Strategy ====================
interface RetryStrategy {
  shouldRetry(attempt: number, error: Error): boolean;
  getDelay(attempt: number): number;
}

class ExponentialBackoffRetry implements RetryStrategy {
  constructor(
    private config: RetryConfig,
    private isRetryable: (error: Error) => boolean = () => true
  ) {}

  shouldRetry(attempt: number, error: Error): boolean {
    return attempt < this.config.maxAttempts && this.isRetryable(error);
  }

  getDelay(attempt: number): number {
    const baseDelay = this.config.baseDelayMs * Math.pow(2, attempt - 1);
    const cappedDelay = Math.min(baseDelay, this.config.maxDelayMs);
    const jitter = cappedDelay * this.config.jitterFactor * (Math.random() - 0.5);
    return Math.max(0, cappedDelay + jitter);
  }
}

// ==================== Circuit Breaker ====================
interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureTime: number;
  halfOpenSuccesses: number;
}

class CircuitBreaker {
  private states = new Map<string, CircuitBreakerState>();

  constructor(private config: CircuitBreakerConfig) {}

  async call<T>(serviceName: string, fn: () => Promise<T>): Promise<Result<T>> {
    const state = this.getState(serviceName);

    if (state.state === 'OPEN') {
      const now = Date.now();
      if (now - state.lastFailureTime >= this.config.timeoutMs) {
        state.state = 'HALF_OPEN';
        state.halfOpenSuccesses = 0;
        this.states.set(serviceName, state);
      } else {
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
    } catch (err) {
      state.failures++;
      state.lastFailureTime = Date.now();
      if (state.failures >= this.config.failureThreshold) {
        state.state = 'OPEN';
      }
      this.states.set(serviceName, state);
      return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  getState(serviceName: string): CircuitBreakerState {
    return this.states.get(serviceName) ?? {
      state: 'CLOSED',
      failures: 0,
      lastFailureTime: 0,
      halfOpenSuccesses: 0,
    };
  }

  getAllStates(): Map<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number; lastFailureTime: number }> {
    return new Map(Array.from(this.states.entries()).map(([k, v]) => [k, { state: v.state, failures: v.failures, lastFailureTime: v.lastFailureTime }]));
  }
}

// ==================== Message Analyzer ====================
class MessageAnalyzer {
  // In a real implementation, this could call an external NLP service.
  // For now, simulate with rule-based analysis.

  async analyze(message: PatientMessage, signal?: AbortSignal): Promise<MessageAnalysis> {
    const content = message.content.toLowerCase();
    const sentiment = this.analyzeSentiment(content);
    const urgencyIndicators = this.identifyUrgencyIndicators(content);
    const medicalKeywords = this.extractMedicalKeywords(content);
    const requiresMedicalAttention = this.assessMedicalAttentionNeed(content, urgencyIndicators);
    const requiresClarification = this.identifyClarificationNeeds(content, medicalKeywords);
    const suggestedResponses = this.generateSuggestedResponses(content, sentiment, urgencyIndicators);
    const confidenceScore = this.calculateConfidence(content, medicalKeywords, urgencyIndicators);

    return MessageAnalysisSchema.parse({
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

  private analyzeSentiment(content: string): MessageAnalysis['sentiment'] {
    const anxietyWords = ['worried', 'anxious', 'scared', 'panic', 'afraid', 'nervous'];
    const frustrationWords = ['frustrated', 'annoyed', 'upset', 'angry', 'mad'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst'];
    const positiveWords = ['good', 'better', 'great', 'happy', 'relieved'];

    if (anxietyWords.some(word => content.includes(word))) return 'anxious';
    if (frustrationWords.some(word => content.includes(word))) return 'frustrated';
    if (negativeWords.some(word => content.includes(word))) return 'negative';
    if (positiveWords.some(word => content.includes(word))) return 'positive';
    return 'neutral';
  }

  private identifyUrgencyIndicators(content: string): string[] {
    const indicators: string[] = [];
    const emergencyWords = ['emergency', '911', 'ambulance', 'call help', 'immediate', 'right away'];
    const urgentWords = ['urgent', 'asap', 'soon', 'quickly', 'hurry'];
    const severeWords = ['severe', 'terrible', 'awful', 'extreme', 'unbearable'];
    const durationWords = ['hours', 'days', 'weeks', 'months'];

    if (emergencyWords.some(word => content.includes(word))) indicators.push('emergency');
    if (urgentWords.some(word => content.includes(word))) indicators.push('urgent');
    if (severeWords.some(word => content.includes(word))) indicators.push('severe');
    if (durationWords.some(word => content.includes(word))) indicators.push('duration_mentioned');

    return indicators;
  }

  private extractMedicalKeywords(content: string): string[] {
    const keywords: string[] = [];
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
      if (content.includes(kw)) keywords.push(kw);
    }
    return [...new Set(keywords)];
  }

  private assessMedicalAttentionNeed(content: string, urgencyIndicators: string[]): boolean {
    const emergencySymptoms = [
      'chest pain', 'shortness of breath', 'difficulty breathing',
      'loss of consciousness', 'seizure', 'stroke', 'heart attack'
    ];
    if (emergencySymptoms.some(symptom => content.includes(symptom))) return true;
    if (urgencyIndicators.includes('emergency')) return true;
    if (content.includes('severe pain') || content.includes('terrible pain')) return true;
    return false;
  }

  private identifyClarificationNeeds(content: string, medicalKeywords: string[]): string[] {
    const needs: string[] = [];
    if (content.includes('pain') && !content.includes('where') && !content.includes('location')) needs.push('pain_location');
    if (content.includes('pain') && !content.includes('scale') && !content.includes('1-10')) needs.push('pain_severity');
    if (medicalKeywords.length > 0 && !content.includes('how long') && !content.includes('since when')) needs.push('symptom_duration');
    if (content.includes('fever') && !content.match(/\d+\.?\d*\s*degree/)) needs.push('temperature_reading');
    return needs;
  }

  private generateSuggestedResponses(content: string, sentiment: string, urgencyIndicators: string[]): string[] {
    const responses: string[] = [];
    if (urgencyIndicators.includes('emergency')) {
      responses.push('This sounds like it needs immediate medical attention. Please call emergency services or go to the nearest emergency room.');
      responses.push('Can you tell me more about your symptoms while you wait for help?');
      return responses;
    }
    if (sentiment === 'anxious' || sentiment === 'frustrated') {
      responses.push('I understand this is concerning for you. Let me help you figure out the best next step.');
    }
    responses.push('Can you tell me more about what you\'re experiencing?');
    if (this.extractMedicalKeywords(content).length > 0) {
      responses.push('I\'m here to help assess your symptoms and guide you to appropriate care.');
    }
    return responses;
  }

  private calculateConfidence(content: string, medicalKeywords: string[], urgencyIndicators: string[]): number {
    let confidence = 0.3;
    confidence += Math.min(medicalKeywords.length * 0.1, 0.3);
    confidence += Math.min(urgencyIndicators.length * 0.1, 0.2);
    if (content.length > 50) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }
}

// ==================== Content Templater ====================
class ContentTemplater {
  private templates = new Map<string, ContentTemplate>();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    const templates: ContentTemplate[] = [
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
    ];
    templates.forEach(t => this.templates.set(t.template_id, t));
  }

  getTemplate(category: string, language: string, healthLiteracy: HealthLiteracy): ContentTemplate | undefined {
    return Array.from(this.templates.values()).find(
      t => t.category === category && t.language === language && t.health_literacy === healthLiteracy
    );
  }

  personalize(template: ContentTemplate, patientName: string, symptoms: string[]): string {
    let content = template.content;
    content = content.replace('{patient_name}', patientName || 'you');
    content = content.replace('{symptoms}', symptoms.join(', '));
    return content;
  }
}

// ==================== Session Manager ====================
class SessionManager {
  private sessions = new Map<SessionId, PatientSession>();
  private locks = new Map<SessionId, Mutex>();

  async withSession<T>(
    sessionId: SessionId,
    operation: (session: PatientSession) => Promise<T>
  ): Promise<Result<T>> {
    const mutex = this.locks.get(sessionId) ?? new Mutex();
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
    } finally {
      release();
      if (!this.sessions.has(sessionId)) {
        this.locks.delete(sessionId);
      }
    }
  }

  getOrCreateSession(message: PatientMessage): PatientSession {
    const sessionId = message.session_id as SessionId;
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

  getSession(sessionId: SessionId): PatientSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): PatientSession[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(sessionId: SessionId): void {
    this.sessions.delete(sessionId);
    this.locks.delete(sessionId);
  }
}

// ==================== Session Watcher ====================
class SessionWatcher {
  private interval: NodeJS.Timeout | null = null;

  constructor(
    private sessionManager: SessionManager,
    private config: PatientProxyConfig,
    private logger: EventLogger
  ) {}

  start(): void {
    if (this.interval) return;
    this.interval = setInterval(() => this.cleanupStaleSessions(), this.config.sessionCleanupIntervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async cleanupStaleSessions(): Promise<void> {
    const now = Date.now();
    const sessions = this.sessionManager.getAllSessions();
    for (const session of sessions) {
      if (session.status !== 'completed' && session.status !== 'escalated') {
        const startTime = new Date(session.start_time).getTime();
        if (now - startTime > this.config.sessionMaxDurationMs) {
          await this.sessionManager.withSession(session.session_id as SessionId, async s => {
            s.status = 'completed';
            s.end_time = new Date().toISOString();
            s.summary = s.summary || { total_messages: 0, patient_messages: 0, agent_messages: 0 };
            s.summary.session_duration = Math.floor((now - startTime) / 1000);
          });
          this.logger.log({
            id: uuidv4(),
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
  private profiles = new Map<PatientId, PatientProfile>();

  async getProfile(patientId: PatientId): Promise<PatientProfile> {
    let profile = this.profiles.get(patientId);
    if (!profile) {
      // Create default profile
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
      this.profiles.set(patientId, profile as any);
    }
    return profile as any;
  }

  updateProfile(patientId: PatientId, updates: Partial<PatientProfile>): void {
    const existing = this.profiles.get(patientId);
    if (existing) {
      Object.assign(existing, updates);
      this.profiles.set(patientId, existing);
    }
  }
}

// ==================== Health Checker ====================
interface HealthStatus {
  healthy: boolean;
  services: Map<string, { healthy: boolean; lastFailure?: string }>;
  circuitBreakers: Map<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number }>;
}

class HealthChecker {
  constructor(private circuitBreaker: CircuitBreaker) {}

  getHealth(): HealthStatus {
    const circuitBreakers = this.circuitBreaker.getAllStates();
    const services = new Map<string, { healthy: boolean; lastFailure?: string }>();
    for (const [service, state] of circuitBreakers) {
      services.set(service, { healthy: state.state === 'CLOSED', lastFailure: state.lastFailureTime ? new Date(state.lastFailureTime).toISOString() : undefined });
    }
    const healthy = Array.from(services.values()).every(s => s.healthy);
    return { healthy, services, circuitBreakers };
  }
}

// ==================== Main Patient Proxy Agent ====================
export class PatientProxyAgent {
  private config: PatientProxyConfig;
  private sessionManager: SessionManager;
  private profileManager: PatientProfileManager;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RetryStrategy;
  private messageAnalyzer: MessageAnalyzer;
  private contentTemplater: ContentTemplater;
  private watcher: SessionWatcher;
  private healthChecker: HealthChecker;

  constructor(config: Partial<PatientProxyConfig> = {}) {
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
    this.watcher = new SessionWatcher(this.sessionManager, this.config, this.logger);
    this.healthChecker = new HealthChecker(this.circuitBreaker);

    this.watcher.start();
  }

  /**
   * Process an incoming patient message.
   */
  async processMessage(message: PatientMessage): Promise<Result<AgentResponse>> {
    const span = this.tracer.startSpan('patientProxy.processMessage');
    span.setAttribute('session.id', message.session_id);
    const startTime = Date.now();

    try {
      const validatedMessage = PatientMessageSchema.parse(message);
      const session = await this.sessionManager.withSession(validatedMessage.session_id as SessionId, async s => {
        // If session doesn't exist, we'll getOrCreate outside the lock, but we need to ensure it's created first
        // We'll handle session creation outside the lock.
        return s;
      });

      // If session doesn't exist, create it outside lock (simplified: getOrCreateSession is already handling it)
      const sessionObj = this.sessionManager.getOrCreateSession(validatedMessage);

      // Acquire lock for the session
      const result = await this.sessionManager.withSession(sessionObj.session_id as SessionId, async s => {
        // Add message to session
        s.messages.push(validatedMessage);

        // Analyze message (could be external call, so use circuit breaker & retry)
        const analysisResult = await this.circuitBreaker.call('nlpService', async () => {
          return await this.retryWithTimeout(() => this.messageAnalyzer.analyze(validatedMessage), this.config.defaultTimeoutMs);
        });

        if (!analysisResult.ok) {
          throw analysisResult.error;
        }
        const analysis = analysisResult.value;

        // Get patient profile
        const profile = await this.profileManager.getProfile(validatedMessage.patient_id as PatientId);

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

        return response;
      });

      const duration = Date.now() - startTime;
      this.metrics.recordMessage(this.config.agentId, duration, result.ok);
      if (!result.ok) {
        this.metrics.recordMessage(this.config.agentId, duration, false, result.error.message);
      }

      span.end();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.metrics.recordMessage(this.config.agentId, duration, false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  private async retryWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

      let attempt = 0;
      const executeWithRetry = async (): Promise<void> => {
        while (attempt < this.config.retry.maxAttempts) {
          try {
            const result = await fn();
            clearTimeout(timeoutId);
            resolve(result);
            return;
          } catch (err) {
            attempt++;
            if (!this.retryStrategy.shouldRetry(attempt, err as Error)) {
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

  private async generateResponse(
    message: PatientMessage,
    analysis: MessageAnalysis,
    profile: PatientProfile,
    session: PatientSession
  ): Promise<AgentResponse> {
    const responseId = uuidv4();

    // Select template based on analysis and profile
    let category = 'informational';
    if (analysis.requires_medical_attention) category = 'emergency';
    else if (analysis.requires_clarification.length > 0) category = 'symptom_collection';
    else if (analysis.medical_keywords.length > 0) category = 'symptom_collection';

    const template = this.contentTemplater.getTemplate(category, profile.preferred_language, profile.health_literacy) ||
                     this.contentTemplater.getTemplate('greeting', 'en', 'basic');

    if (!template) {
      throw new PatientProxyError('NO_TEMPLATE', 'No suitable content template found');
    }

    const personalizedContent = this.contentTemplater.personalize(template, message.patient_id, analysis.medical_keywords);

    const responseType = this.determineResponseType(analysis, session);

    const response: AgentResponse = {
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

    return AgentResponseSchema.parse(response);
  }

  private determineResponseType(analysis: MessageAnalysis, session: PatientSession): "emergency" | "informational" | "clarification" | "recommendation" | "educational" {
    if (analysis.requires_medical_attention) return 'emergency';
    if (analysis.requires_clarification.length > 0) return 'clarification';
    if (analysis.medical_keywords.length > 0) return 'recommendation';
    return 'informational';
  }

  private getResponseType(responseType: "emergency" | "informational" | "clarification" | "recommendation" | "educational"): MessageType {
    switch (responseType) {
      case 'emergency': return 'emergency_alert';
      case 'clarification': return 'text';
      case 'recommendation': return 'text';
      case 'educational': return 'educational_content';
      default: return 'text';
    }
  }

  private generateNextSteps(analysis: MessageAnalysis, session: PatientSession): string[] {
    const steps: string[] = [];
    if (analysis.requires_clarification.length > 0) steps.push('Provide more details about your symptoms');
    if (analysis.requires_medical_attention) steps.push('Seek immediate medical attention');
    if (!session.context?.vital_signs_collected && analysis.medical_keywords.length > 0) steps.push('Provide vital signs if available');
    return steps;
  }

  private updateSessionContext(session: PatientSession, message: PatientMessage, analysis: MessageAnalysis): void {
    if (!session.context) session.context = { escalation_triggered: false, vital_signs_collected: false, triage_performed: false, consent_obtained: false, provider_notified: false };
    // Update symptoms discussed
    if (analysis.medical_keywords.length > 0) {
      session.context.symptoms_discussed = [...(session.context.symptoms_discussed || []), ...analysis.medical_keywords];
    }
    // Update summary
    if (session.summary) {
      session.summary.total_messages = session.messages.length;
      session.summary.patient_messages = session.messages.filter(m => ("patient_id" in m)).length;
      session.summary.agent_messages = session.messages.filter(m => !("patient_id" in m)).length;
    }
  }

  private async triggerEmergencyEscalation(message: PatientMessage, analysis: MessageAnalysis, session: PatientSession): Promise<EmergencyEscalation> {
    const escalation: EmergencyEscalation = {
      escalation_id: uuidv4(),
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

    // Update session status
    session.status = 'escalated';
    if (session.context) {
      session.context.escalation_triggered = true;
      session.context.provider_notified = true;
    }

    this.metrics.recordEmergencyEscalation();
    this.logger.log({
      id: uuidv4(),
      type: 'EMERGENCY_ESCALATION',
      timestamp: escalation.timestamp,
      source: this.config.agentId,
      sessionId: message.session_id,
      patientId: message.patient_id,
      data: escalation,
      success: true,
    });

    return EmergencyEscalationSchema.parse(escalation);
  }

  /**
   * Ends a patient session.
   */
  async endSession(sessionId: string): Promise<Result<PatientSession>> {
    const result = await this.sessionManager.withSession(sessionId as SessionId, async session => {
      session.end_time = new Date().toISOString();
      session.status = 'completed';
      if (session.start_time) {
        const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
        session.summary = session.summary || { total_messages: 0, patient_messages: 0, agent_messages: 0 };
        session.summary.session_duration = Math.floor(duration / (1000 * 60)); // minutes
      }
      return session;
    });
    return result;
  }

  /**
   * Retrieves a session by ID.
   */
  getSession(sessionId: string): PatientSession | undefined {
    return this.sessionManager.getSession(sessionId as SessionId);
  }

  /**
   * Lists all active sessions.
   */
  listActiveSessions(): PatientSession[] {
    return this.sessionManager.getAllSessions().filter(s => s.status === 'active');
  }

  /**
   * Returns performance metrics.
   */
  getMetrics(agentId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    return this.metrics.getMetrics(agentId);
  }

  /**
   * Returns logged events.
   */
  getEvents(): EventLog[] {
    return this.logger.getEvents();
  }

  /**
   * Returns health status.
   */
  getHealth(): HealthStatus {
    return this.healthChecker.getHealth();
  }

  /**
   * Returns agent information.
   */
  getAgentInfo(): { id: string; name: string; version: string; capabilities: string[] } {
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
      ],
    };
  }

  /**
   * Shuts down the agent gracefully.
   */
  shutdown(): void {
    this.watcher.stop();
  }
}