// triage-agent.ts
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Mutex } from 'async-mutex';
import {
  TriageRequest,
  TriageResult,
  Symptom,
  VitalSigns,
  TriageUrgency,
  CarePathway,
  DifferentialDiagnosis,
  TriageRequestSchema,
  TriageResultSchema,
  RED_FLAG_DEFINITIONS,
  SYMPTOM_URGENCY_MAP,
  ICD10_MAPPINGS,
  CONFIDENCE_THRESHOLDS,
  PATHWAY_TIME_FRAMES,
} from './types';

// ==================== Branded Types ====================
type SessionId = string & { __brand: 'SessionId' };
type PatientId = string & { __brand: 'PatientId' };
type AgentId = string & { __brand: 'AgentId' };

// ==================== Configuration ====================
export interface TriageAgentConfig {
  agentId: AgentId;
  defaultTimeoutMs: number;
  retry: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  // External service endpoints (if any)
  fhirServiceUrl?: string;
  terminologyServiceUrl?: string;
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

const defaultConfig: TriageAgentConfig = {
  agentId: 'atlas-agent-triage' as AgentId,
  defaultTimeoutMs: 5_000,
  retry: {
    maxAttempts: 2,
    baseDelayMs: 200,
    maxDelayMs: 1_000,
    jitterFactor: 0.2,
  },
  circuitBreaker: {
    failureThreshold: 3,
    timeoutMs: 30_000,
    halfOpenMaxCalls: 1,
  },
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Error ====================
export class TriageAgentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'TriageAgentError';
  }
}

// ==================== Metrics ====================
interface MetricsSnapshot {
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageDurationMs: number;
  errorCount: number;
  lastError?: string;
  urgencyDistribution: Record<TriageUrgency, number>;
  pathwayDistribution: Record<CarePathway, number>;
  durationHistogram: number[];
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();
  private readonly histogramBuckets = [0, 50, 100, 200, 500, 1000, 2000, 5000];

  recordRequest(
    agentId: string,
    durationMs: number,
    success: boolean,
    urgency?: TriageUrgency,
    pathway?: CarePathway,
    error?: string
  ): void {
    const key = agentId;
    let current = this.metrics.get(key);
    if (!current) {
      current = {
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        averageDurationMs: 0,
        errorCount: 0,
        urgencyDistribution: { ROUTINE: 0, SEMI_URGENT: 0, URGENT: 0, EMERGENT: 0 },
        pathwayDistribution: { ED: 0, URGENT_CARE: 0, PRIMARY_CARE: 0, TELEHEALTH: 0, HOME_CARE: 0 },
        durationHistogram: new Array(this.histogramBuckets.length).fill(0),
      };
    }

    current.requestCount++;
    if (success) {
      current.successCount++;
      if (urgency) current.urgencyDistribution[urgency]++;
      if (pathway) current.pathwayDistribution[pathway]++;
    } else {
      current.failureCount++;
      if (error) {
        current.errorCount++;
        current.lastError = error;
      }
    }

    current.averageDurationMs =
      (current.averageDurationMs * (current.requestCount - 1) + durationMs) / current.requestCount;

    const bucketIndex = this.histogramBuckets.findIndex(b => durationMs <= b);
    const idx = bucketIndex === -1 ? this.histogramBuckets.length - 1 : bucketIndex;
    current.durationHistogram[idx]++;

    this.metrics.set(key, current);
  }

  getMetrics(agentId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (agentId) {
      return this.metrics.get(agentId) ?? {
        requestCount: 0,
        successCount: 0,
        failureCount: 0,
        averageDurationMs: 0,
        errorCount: 0,
        urgencyDistribution: { ROUTINE: 0, SEMI_URGENT: 0, URGENT: 0, EMERGENT: 0 },
        pathwayDistribution: { ED: 0, URGENT_CARE: 0, PRIMARY_CARE: 0, TELEHEALTH: 0, HOME_CARE: 0 },
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
        return { ok: false, error: new TriageAgentError('CIRCUIT_OPEN', `Circuit open for service ${serviceName}`) };
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

// ==================== Triage Engine ====================
class TriageEngine {
  // Core triage logic extracted from original class
  assessUrgency(symptoms: Symptom[], vitalSigns?: VitalSigns): TriageUrgency {
    let maxUrgency: TriageUrgency = 'ROUTINE';

    if (vitalSigns) {
      const vitalUrgency = this.assessVitalSignUrgency(vitalSigns);
      if (this.compareUrgency(vitalUrgency, maxUrgency) > 0) maxUrgency = vitalUrgency;
    }

    for (const symptom of symptoms) {
      const symptomUrgency = this.assessSymptomUrgency(symptom);
      if (this.compareUrgency(symptomUrgency, maxUrgency) > 0) maxUrgency = symptomUrgency;
    }

    return maxUrgency;
  }

  private assessVitalSignUrgency(vitalSigns: VitalSigns): TriageUrgency {
    if (vitalSigns.oxygen_saturation && vitalSigns.oxygen_saturation < 90) return 'EMERGENT';
    if (vitalSigns.blood_pressure_systolic && vitalSigns.blood_pressure_systolic < 90) return 'EMERGENT';
    if (vitalSigns.blood_pressure_systolic && vitalSigns.blood_pressure_systolic > 180) return 'URGENT';
    if (vitalSigns.blood_pressure_diastolic && vitalSigns.blood_pressure_diastolic > 120) return 'URGENT';
    if (vitalSigns.heart_rate && vitalSigns.heart_rate < 40) return 'EMERGENT';
    if (vitalSigns.heart_rate && vitalSigns.heart_rate > 120) return 'URGENT';
    if (vitalSigns.respiratory_rate && (vitalSigns.respiratory_rate < 8 || vitalSigns.respiratory_rate > 30)) return 'URGENT';
    if (vitalSigns.temperature && vitalSigns.temperature < 35) return 'EMERGENT';
    if (vitalSigns.temperature && vitalSigns.temperature > 39.5) return 'URGENT';
    if (vitalSigns.pain_scale && vitalSigns.pain_scale >= 8) return 'URGENT';
    return 'ROUTINE';
  }

  private assessSymptomUrgency(symptom: Symptom): TriageUrgency {
    const desc = symptom.description.toLowerCase();
    for (const [symptomKey, urgency] of Object.entries(SYMPTOM_URGENCY_MAP)) {
      if (desc.includes(symptomKey)) return urgency as TriageUrgency;
    }
    if (symptom.severity === 'severe') return 'URGENT';
    if (symptom.onset === 'sudden') return 'URGENT';
    return 'ROUTINE';
  }

  private compareUrgency(a: TriageUrgency, b: TriageUrgency): number {
    const order = { ROUTINE: 0, SEMI_URGENT: 1, URGENT: 2, EMERGENT: 3 };
    return order[a] - order[b];
  }

  identifyRedFlags(symptoms: Symptom[], vitalSigns?: VitalSigns): string[] {
    const redFlags: string[] = [];
    for (const symptom of symptoms) {
      const desc = symptom.description.toLowerCase();
      for (const definition of Object.values(RED_FLAG_DEFINITIONS)) {
        if (definition.symptoms.some(s => desc.includes(s))) {
          const present = definition.red_flags.filter(flag =>
            symptom.associated_symptoms?.some(s => s.toLowerCase().includes(flag)) || desc.includes(flag)
          );
          redFlags.push(...present);
        }
      }
      if (desc.includes('chest') && symptom.radiation) redFlags.push('chest pain radiation');
      if (symptom.severity === 'severe') redFlags.push(`severe ${symptom.description}`);
      if (symptom.onset === 'sudden') redFlags.push(`sudden onset ${symptom.description}`);
    }
    if (vitalSigns) {
      if (vitalSigns.oxygen_saturation && vitalSigns.oxygen_saturation < 92) redFlags.push('low oxygen saturation');
      if (vitalSigns.heart_rate && (vitalSigns.heart_rate < 50 || vitalSigns.heart_rate > 110)) redFlags.push('abnormal heart rate');
      if (vitalSigns.pain_scale && vitalSigns.pain_scale >= 7) redFlags.push('severe pain');
    }
    return [...new Set(redFlags)];
  }

  generateDifferential(symptoms: Symptom[], medicalHistory?: string[]): DifferentialDiagnosis[] {
    const differential: DifferentialDiagnosis[] = [];
    for (const symptom of symptoms) {
      const desc = symptom.description.toLowerCase();
      for (const [symptomKey, conditions] of Object.entries(ICD10_MAPPINGS)) {
        if (desc.includes(symptomKey)) {
          for (const [condition, icd10] of Object.entries(conditions)) {
            const existing = differential.find(d => d.condition === condition);
            if (existing) {
              existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
            } else {
              differential.push({
                condition,
                icd10,
                confidence: this.calculateInitialConfidence(symptom, condition),
                severity: this.assessConditionSeverity(condition),
                supporting_evidence: [symptom.description],
                red_flags: this.getConditionRedFlags(condition),
              });
            }
          }
        }
      }
    }
    differential.sort((a, b) => b.confidence - a.confidence);
    return differential.slice(0, 5);
  }

  private calculateInitialConfidence(symptom: Symptom, condition: string): number {
    let confidence = 0.3;
    if (symptom.severity === 'severe') confidence += 0.1;
    if (symptom.onset === 'sudden') confidence += 0.1;
    if (['chest pain', 'shortness of breath', 'loss of consciousness'].some(s => symptom.description.toLowerCase().includes(s))) confidence += 0.2;
    return Math.min(confidence, 0.9);
  }

  private assessConditionSeverity(condition: string): 'mild' | 'moderate' | 'severe' | 'critical' {
    const severe = ['Acute Myocardial Infarction', 'Pulmonary Embolism', 'Acute Respiratory Failure', 'Acute Appendicitis'];
    const moderate = ['Unstable Angina', 'Pneumonia', 'Asthma', 'Migraine'];
    if (severe.some(c => condition.includes(c))) return 'critical';
    if (moderate.some(c => condition.includes(c))) return 'severe';
    return 'moderate';
  }

  private getConditionRedFlags(condition: string): string[] {
    const map: Record<string, string[]> = {
      'Acute Myocardial Infarction': ['chest pain radiation', 'diaphoresis', 'nausea', 'dyspnea'],
      'Pulmonary Embolism': ['sudden dyspnea', 'chest pain', 'tachycardia', 'hypoxia'],
      'Stroke': ['focal neurological deficit', 'sudden onset', 'confusion', 'visual changes'],
      'Appendicitis': ['right lower quadrant pain', 'fever', 'rebound tenderness', 'anorexia'],
    };
    return map[condition] || [];
  }

  determinePathway(urgency: TriageUrgency, redFlags: string[]): CarePathway {
    switch (urgency) {
      case 'EMERGENT': return 'ED';
      case 'URGENT': return redFlags.length > 0 ? 'ED' : 'URGENT_CARE';
      case 'SEMI_URGENT': return 'URGENT_CARE';
      default: return 'PRIMARY_CARE';
    }
  }

  generateReasoning(request: TriageRequest, urgency: TriageUrgency, redFlags: string[], differential: DifferentialDiagnosis[]): string {
    const symptoms = request.symptoms.map(s => s.description).join(', ');
    let reasoning = `Patient presents with ${symptoms}.`;
    if (request.vital_signs) {
      reasoning += ` Vital signs show ${this.formatVitalSigns(request.vital_signs)}.`;
    }
    if (redFlags.length) {
      reasoning += ` Red flags identified: ${redFlags.join(', ')}.`;
    }
    reasoning += ` Based on symptom pattern and vital signs, urgency assessed as ${urgency}.`;
    if (differential.length) {
      const top = differential[0];
      reasoning += ` Most likely diagnosis is ${top.condition} (confidence: ${(top.confidence * 100).toFixed(1)}%).`;
    }
    return reasoning;
  }

  private formatVitalSigns(vitalSigns: VitalSigns): string {
    const parts = [];
    if (vitalSigns.blood_pressure_systolic && vitalSigns.blood_pressure_diastolic) parts.push(`BP ${vitalSigns.blood_pressure_systolic}/${vitalSigns.blood_pressure_diastolic}`);
    if (vitalSigns.heart_rate) parts.push(`HR ${vitalSigns.heart_rate}`);
    if (vitalSigns.oxygen_saturation) parts.push(`O2 sat ${vitalSigns.oxygen_saturation}%`);
    if (vitalSigns.temperature) parts.push(`Temp ${vitalSigns.temperature}°C`);
    return parts.join(', ');
  }

  generateRecommendations(urgency: TriageUrgency, pathway: CarePathway, differential: DifferentialDiagnosis[]): string[] {
    const recs: string[] = [];
    switch (urgency) {
      case 'EMERGENT':
        recs.push('Seek emergency medical care immediately');
        recs.push('Call emergency services or go to nearest emergency department');
        break;
      case 'URGENT':
        recs.push('Seek urgent medical evaluation within 4 hours');
        recs.push('Visit urgent care center or emergency department');
        break;
      case 'SEMI_URGENT':
        recs.push('Schedule medical evaluation within 24-48 hours');
        recs.push('Contact primary care provider for appointment');
        break;
      case 'ROUTINE':
        recs.push('Schedule routine medical evaluation');
        recs.push('Monitor symptoms and seek care if worsens');
        break;
    }
    if (differential.length) {
      const top = differential[0];
      if (top.condition.includes('Cardiac') || top.condition.includes('Myocardial')) {
        recs.push('Avoid physical exertion');
        recs.push('Take aspirin if not allergic (chew 325mg)');
      }
      if (top.condition.includes('Respiratory') || top.condition.includes('Pulmonary')) {
        recs.push('Sit upright to ease breathing');
        recs.push('Use prescribed inhalers if available');
      }
    }
    return recs;
  }

  generateSuggestedActions(urgency: TriageUrgency, pathway: CarePathway, redFlags: string[]): string[] {
    const actions = [];
    if (urgency === 'EMERGENT') {
      actions.push('Activate emergency response protocol');
      actions.push('Prepare for potential interventions');
    }
    if (redFlags.length) actions.push('Prioritize evaluation of red flag symptoms');
    actions.push(`Route to ${pathway} for appropriate care`);
    return actions;
  }

  identifyContraindications(request: TriageRequest, differential: DifferentialDiagnosis[]): string[] {
    const contraindications = [];
    if (request.medications) {
      for (const med of request.medications) {
        if (med.toLowerCase().includes('blood thinner') || med.toLowerCase().includes('anticoagulant')) {
          contraindications.push('Avoid NSAIDs without medical supervision');
        }
        if (med.toLowerCase().includes('beta blocker')) {
          contraindications.push('Avoid certain cardiac medications without monitoring');
        }
      }
    }
    if (request.allergies) {
      for (const allergy of request.allergies) {
        if (allergy.toLowerCase().includes('penicillin')) contraindications.push('Avoid penicillin-class antibiotics');
        if (allergy.toLowerCase().includes('sulfa')) contraindications.push('Avoid sulfa-containing medications');
      }
    }
    return [...new Set(contraindications)];
  }

  calculateConfidence(symptoms: Symptom[], differential: DifferentialDiagnosis[]): number {
    if (!differential.length) return 0.1;
    const symptomWeight = Math.min(symptoms.length * 0.1, 0.3);
    const differentialWeight = differential[0].confidence * 0.7;
    return Math.min(symptomWeight + differentialWeight, 1.0);
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

// ==================== Event Emitter for Integration ====================
class IntegrationEventEmitter {
  private emitter = new (require('events').EventEmitter)();

  emit(event: string, payload: any): void {
    this.emitter.emit(event, payload);
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }
}

// ==================== Main Triage Agent ====================
export class TriageAgent {
  private config: TriageAgentConfig;
  private engine: TriageEngine;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RetryStrategy;
  private healthChecker: HealthChecker;
  private eventEmitter: IntegrationEventEmitter;

  constructor(config: Partial<TriageAgentConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.engine = new TriageEngine();
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreaker);
    this.retryStrategy = new ExponentialBackoffRetry(this.config.retry);
    this.healthChecker = new HealthChecker(this.circuitBreaker);
    this.eventEmitter = new IntegrationEventEmitter();
  }

  /**
   * Perform triage assessment on a patient request.
   */
  async assessTriage(request: TriageRequest): Promise<Result<TriageResult>> {
    const span = this.tracer.startSpan('triageAgent.assessTriage');
    span.setAttribute('patient.id', request.patient_id);
    const startTime = Date.now();

    try {
      const validatedRequest = TriageRequestSchema.parse(request);

      // Optionally, we could call external FHIR/terminology services via circuit breaker.
      // For now, we just run the engine synchronously.
      const urgency = this.engine.assessUrgency(validatedRequest.symptoms, validatedRequest.vital_signs);
      const redFlags = this.engine.identifyRedFlags(validatedRequest.symptoms, validatedRequest.vital_signs);
      const differential = this.engine.generateDifferential(validatedRequest.symptoms, validatedRequest.medical_history);
      const pathway = this.engine.determinePathway(urgency, redFlags);
      const reasoning = this.engine.generateReasoning(validatedRequest, urgency, redFlags, differential);
      const recommendations = this.engine.generateRecommendations(urgency, pathway, differential);
      const suggestedActions = this.engine.generateSuggestedActions(urgency, pathway, redFlags);
      const contraindications = this.engine.identifyContraindications(validatedRequest, differential);
      const confidenceScore = this.engine.calculateConfidence(validatedRequest.symptoms, differential);

      const result: TriageResult = {
        urgency,
        suggested_pathway: pathway,
        differential,
        red_flags: redFlags,
        reasoning,
        recommendations,
        follow_up_required: urgency !== 'ROUTINE',
        time_frame: PATHWAY_TIME_FRAMES[pathway],
        confidence_score: confidenceScore,
        requires_immediate_attention: urgency === 'EMERGENT',
        suggested_actions: suggestedActions,
        contraindications,
      };

      const duration = Date.now() - startTime;
      this.metrics.recordRequest(this.config.agentId, duration, true, urgency, pathway);
      this.logger.log({
        id: uuidv4(),
        type: 'TRIAGE_COMPLETED',
        timestamp: new Date().toISOString(),
        source: this.config.agentId,
        sessionId: validatedRequest.context?.encounter_id || 'unknown',
        patientId: validatedRequest.patient_id,
        data: { urgency, pathway, differentialCount: differential.length },
        success: true,
      });

      if (this.config.enableEventLogging) {
        this.eventEmitter.emit('triage_completed', {
          patientId: validatedRequest.patient_id,
          sessionId: validatedRequest.context?.encounter_id,
          result,
        });
      }

      span.end();
      return { ok: true, value: TriageResultSchema.parse(result) };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.metrics.recordRequest(this.config.agentId, duration, false, undefined, undefined, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
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
      name: 'ATLAS Triage Agent',
      version: '1.0.0',
      capabilities: [
        'symptom_classification',
        'urgency_assessment',
        'differential_diagnosis',
        'red_flag_identification',
        'care_pathway_recommendation',
        'vital_signs_analysis',
        'circuit_breaker',
        'observability',
      ],
    };
  }

  /**
   * Subscribes to integration events (e.g., for care coordinator).
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }
}