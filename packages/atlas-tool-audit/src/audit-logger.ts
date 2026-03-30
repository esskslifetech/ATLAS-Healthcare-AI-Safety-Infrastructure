// audit-logger.ts
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { z } from 'zod';
import { Mutex } from 'async-mutex';
import {
  AuditEvent,
  AuditQuery,
  AuditStatistics,
  ChainValidation,
  AuditExport,
  AuditEventSchema,
  AuditQuerySchema,
  AuditStatisticsSchema,
  ChainValidationSchema,
  AuditExportSchema,
  HIPAA_EVENT_CATEGORIES,
  RETENTION_PERIODS,
  SECURITY_LEVELS,
  COMPLIANCE_FRAMEWORKS,
} from './types';

// ==================== Configuration ====================
export interface AuditLoggerConfig {
  systemId: string;
  environment: string;
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  retentionPeriodDays: number;
  defaultPageSize: number;
  hashAlgorithm: string;
}

const defaultConfig: AuditLoggerConfig = {
  systemId: 'atlas-audit-system',
  environment: 'development',
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
  retentionPeriodDays: RETENTION_PERIODS.HIPAA_MINIMUM,
  defaultPageSize: 100,
  hashAlgorithm: 'sha256',
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Error ====================
export class AuditLoggerError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AuditLoggerError';
  }
}

// ==================== Metrics ====================
interface MetricsSnapshot {
  eventCount: number;
  successCount: number;
  failureCount: number;
  errorCount: number;
  lastError?: string;
  actionDistribution: Record<string, number>;
  resultDistribution: Record<string, number>;
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();

  recordEvent(moduleId: string, action: string, result: string, success: boolean, error?: string): void {
    const key = moduleId;
    let current = this.metrics.get(key);
    if (!current) {
      current = {
        eventCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        actionDistribution: {},
        resultDistribution: {},
      };
    }

    current.eventCount++;
    if (success) {
      current.successCount++;
    } else {
      current.failureCount++;
      if (error) {
        current.errorCount++;
        current.lastError = error;
      }
    }
    current.actionDistribution[action] = (current.actionDistribution[action] || 0) + 1;
    current.resultDistribution[result] = (current.resultDistribution[result] || 0) + 1;

    this.metrics.set(key, current);
  }

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (moduleId) {
      return this.metrics.get(moduleId) ?? {
        eventCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        actionDistribution: {},
        resultDistribution: {},
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
  action: string;
  eventId: string;
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

// ==================== Audit Store (Thread‑safe, Append‑only) ====================
class AuditStore {
  private events: AuditEvent[] = [];
  private lastHash: string | null = null;
  private lock: Mutex = new Mutex();

  async appendEvent(event: AuditEvent): Promise<void> {
    const release = await this.lock.acquire();
    try {
      this.events.push(event);
      this.lastHash = event.hash;
    } finally {
      release();
    }
  }

  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    const release = await this.lock.acquire();
    try {
      let filtered = [...this.events];

      if (query.patient_id) filtered = filtered.filter(e => e.patient_id === query.patient_id);
      if (query.actor_id) filtered = filtered.filter(e => e.actor.id === query.actor_id);
      if (query.actor_type) filtered = filtered.filter(e => e.actor.type === query.actor_type);
      if (query.action) filtered = filtered.filter(e => e.action === query.action);
      if (query.resource_type) filtered = filtered.filter(e => e.resource.type === query.resource_type);
      if (query.resource_id) filtered = filtered.filter(e => e.resource.id === query.resource_id);
      if (query.result) filtered = filtered.filter(e => e.result === query.result);
      if (query.start_date) {
        const start = new Date(query.start_date);
        filtered = filtered.filter(e => new Date(e.timestamp) >= start);
      }
      if (query.end_date) {
        const end = new Date(query.end_date);
        filtered = filtered.filter(e => new Date(e.timestamp) <= end);
      }
      if (query.purpose) filtered = filtered.filter(e => e.purpose === query.purpose);

      filtered.sort((a, b) => {
        const aTime = new Date(a.timestamp).getTime();
        const bTime = new Date(b.timestamp).getTime();
        return query.sort_order === 'desc' ? bTime - aTime : aTime - bTime;
      });

      const offset = query.offset || 0;
      const limit = query.limit ?? this.defaultPageSize();
      return filtered.slice(offset, offset + limit);
    } finally {
      release();
    }
  }

  async getStatistics(query: AuditQuery): Promise<AuditStatistics> {
    const release = await this.lock.acquire();
    try {
      const events = await this.queryEvents(query);
      const stats = {
        total_events: events.length,
        events_by_type: {} as Record<string, number>,
        events_by_action: {} as Record<string, number>,
        events_by_actor: {} as Record<string, number>,
        events_by_actor_type: {} as Record<string, number>,
        events_by_resource_type: {} as Record<string, number>,
        events_by_result: {} as Record<string, number>,
        events_by_hour: {} as Record<string, number>,
        unique_patients: new Set<string>(),
        unique_actors: new Set<string>(),
        date_range: { start: '', end: '' },
        error_rate: 0,
        access_denied_rate: 0,
      };

      for (const e of events) {
        stats.events_by_type[e.type] = (stats.events_by_type[e.type] || 0) + 1;
        stats.events_by_action[e.action] = (stats.events_by_action[e.action] || 0) + 1;
        stats.events_by_actor[e.actor.id] = (stats.events_by_actor[e.actor.id] || 0) + 1;
        stats.events_by_actor_type[e.actor.type] = (stats.events_by_actor_type[e.actor.type] || 0) + 1;
        stats.events_by_resource_type[e.resource.type] = (stats.events_by_resource_type[e.resource.type] || 0) + 1;
        stats.events_by_result[e.result] = (stats.events_by_result[e.result] || 0) + 1;
        const hour = new Date(e.timestamp).toISOString().slice(0, 13);
        stats.events_by_hour[hour] = (stats.events_by_hour[hour] || 0) + 1;
        if (e.patient_id) stats.unique_patients.add(e.patient_id);
        stats.unique_actors.add(e.actor.id);
      }

      if (events.length) {
        const times = events.map(e => new Date(e.timestamp).getTime());
        stats.date_range.start = new Date(Math.min(...times)).toISOString();
        stats.date_range.end = new Date(Math.max(...times)).toISOString();
        stats.error_rate = (stats.events_by_result['FAILURE'] || 0) / events.length;
        stats.access_denied_rate = (stats.events_by_action['ACCESS_DENIED'] || 0) / events.length;
      }

      return {
        total_events: stats.total_events,
        events_by_type: stats.events_by_type,
        events_by_action: stats.events_by_action,
        events_by_actor: stats.events_by_actor,
        events_by_actor_type: stats.events_by_actor_type,
        events_by_resource_type: stats.events_by_resource_type,
        events_by_result: stats.events_by_result,
        events_by_hour: stats.events_by_hour,
        unique_patients: stats.unique_patients.size,
        unique_actors: stats.unique_actors.size,
        date_range: stats.date_range,
        error_rate: stats.error_rate,
        access_denied_rate: stats.access_denied_rate,
      };
    } finally {
      release();
    }
  }

  async getLastHash(): Promise<string | null> {
    const release = await this.lock.acquire();
    try {
      return this.lastHash;
    } finally {
      release();
    }
  }

  async getAllEvents(): Promise<AuditEvent[]> {
    const release = await this.lock.acquire();
    try {
      return [...this.events];
    } finally {
      release();
    }
  }

  async getEventCount(): Promise<number> {
    const release = await this.lock.acquire();
    try {
      return this.events.length;
    } finally {
      release();
    }
  }

  private defaultPageSize(): number {
    return 100;
  }
}

// ==================== Main Audit Logger ====================
export class AuditLogger {
  private store: AuditStore;
  private config: AuditLoggerConfig;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.store = new AuditStore();
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;
  }

  // ==================== Public Methods ====================
  async logEvent(event: Partial<AuditEvent>): Promise<Result<AuditEvent>> {
    const span = this.tracer.startSpan('auditLogger.logEvent');
    const startTime = Date.now();
    try {
      const eventId = uuidv4();
      const timestamp = new Date().toISOString();
      const previousHash = await this.store.getLastHash();

      const auditEvent: AuditEvent = {
        id: eventId,
        event_id: eventId,
        timestamp,
        type: event.type || 'AUDIT_EVENT',
        source: event.source || 'audit-logger',
        actor: event.actor || { id: 'unknown', type: 'system', name: 'Unknown Actor' },
        action: event.action || 'SYSTEM_EVENT',
        resource: event.resource || { type: 'unknown', id: 'unknown' },
        patient_id: event.patient_id,
        purpose: event.purpose,
        consent_ref: event.consent_ref,
        result: event.result || 'success',
        details: event.details,
        metadata: {
          ...event.metadata,
          system_version: '1.0.0',
          environment: this.config.environment,
        },
        hash: '',
        previous_hash: previousHash || undefined,
      };

      auditEvent.hash = this.calculateHash(auditEvent);
      const validated = AuditEventSchema.parse(auditEvent);
      await this.store.appendEvent(validated);

      const duration = Date.now() - startTime;
      this.recordMetrics('logEvent', validated.action, validated.result, true);
      if (this.config.enableEventLogging) {
        this.logger.log({
          id: uuidv4(),
          type: 'AUDIT_EVENT',
          timestamp: validated.timestamp,
          source: 'audit-logger',
          action: validated.action,
          eventId: validated.event_id,
          data: { result: validated.result, patient_id: validated.patient_id },
          success: true,
        });
      }
      span.end();
      return { ok: true, value: validated };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const duration = Date.now() - startTime;
      this.recordMetrics('logEvent', event.action || 'UNKNOWN', event.result || 'failure', false, error.message);
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async logAccess(params: {
    actor: { id: string; type: string; name?: string; role?: string };
    resource: { type: string; id?: string };
    patient_id: string;
    purpose: string;
    consent_ref?: string;
    result: 'success' | 'failure' | 'partial';
    details?: string;
  }): Promise<Result<AuditEvent>> {
    return this.logEvent({
      actor: {
        type: params.actor.type as any,
        id: params.actor.id,
        name: params.actor.name,
        role: params.actor.role,
      },
      action: params.result === 'failure' ? 'ACCESS_DENIED' : 'ACCESS_GRANTED',
      resource: params.resource,
      patient_id: params.patient_id,
      purpose: params.purpose,
      consent_ref: params.consent_ref,
      result: params.result,
      details: params.details,
    });
  }

  async logSystemEvent(params: {
    action: string;
    details?: string;
    result: 'success' | 'failure' | 'partial';
    metadata?: any;
  }): Promise<Result<AuditEvent>> {
    return this.logEvent({
      actor: { id: this.config.systemId, type: 'system', name: 'ATLAS System' },
      action: 'SYSTEM_EVENT',
      resource: { type: 'System', id: this.config.systemId },
      result: params.result || 'success',
      details: params.details,
      metadata: params.metadata,
    });
  }

  async queryEvents(query: AuditQuery): Promise<Result<AuditEvent[]>> {
    const span = this.tracer.startSpan('auditLogger.queryEvents');
    try {
      const validated = AuditQuerySchema.parse(query);
      const events = await this.store.queryEvents(validated);
      span.end();
      return { ok: true, value: events };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async getStatistics(query?: Partial<AuditQuery>): Promise<Result<AuditStatistics>> {
    const span = this.tracer.startSpan('auditLogger.getStatistics');
    try {
      const fullQuery: AuditQuery = {
        ...query,
        sort_by: query?.sort_by || 'timestamp',
        sort_order: query?.sort_order || 'desc',
      };
      const stats = await this.store.getStatistics(fullQuery);
      span.end();
      return { ok: true, value: stats };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async validateChain(): Promise<Result<ChainValidation>> {
    const span = this.tracer.startSpan('auditLogger.validateChain');
    try {
      const events = await this.store.getAllEvents();
      const tampered: string[] = [];
      let firstTampered: string | undefined;
      let isValid = true;

      for (let i = 0; i < events.length; i++) {
        const e = events[i];
        const recalc = this.calculateHash({ 
          id: e.id,
          timestamp: e.timestamp,
          type: e.type,
          source: e.source,
          action: e.action,
          actor: e.actor,
          resource: e.resource,
          patient_id: e.patient_id,
          details: e.details,
          result: e.result,
          previous_hash: e.previous_hash,
          event_id: e.event_id,
          purpose: e.purpose,
          consent_ref: e.consent_ref,
          metadata: e.metadata,
        });
        if (recalc !== e.hash) {
          isValid = false;
          tampered.push(e.event_id);
          if (!firstTampered) firstTampered = e.event_id;
        }
        if (i > 0 && e.previous_hash !== events[i - 1].hash) {
          isValid = false;
          if (!firstTampered) firstTampered = e.event_id;
          tampered.push(e.event_id);
        }
      }

      const chainIntegrity = isValid ? 'VALID' : (tampered.length ? 'TAMPERED' : 'BROKEN');
      const result: ChainValidation = {
        valid: isValid,
        total_events: events.length,
        breaks: [],
        first_event_hash: events[0]?.hash,
        last_event_hash: events[events.length - 1]?.hash,
        tampered: tampered.length > 0,
        first_tampered_event: firstTampered,
        tampered_events: tampered,
        chain_integrity: chainIntegrity,
        validation_timestamp: new Date().toISOString(),
        total_events_checked: events.length,
      };
      span.end();
      return { ok: true, value: result };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async exportEvents(
    query: AuditQuery,
    format: 'json' | 'csv' | 'xml' = 'json',
    exportedBy: { id: string; type: string; name?: string },
    purpose: string,
    consentRef?: string
  ): Promise<Result<AuditExport>> {
    const span = this.tracer.startSpan('auditLogger.exportEvents');
    try {
      const eventsResult = await this.queryEvents(query);
      if (!eventsResult.ok) return eventsResult as any;
      const events = eventsResult.value;

      const exportId = uuidv4();
      const timestamp = new Date().toISOString();
      const checksum = this.calculateExportChecksum(events);

      const auditExport: AuditExport = {
        export_id: exportId,
        timestamp,
        format,
        query,
        event_count: events.length,
        total_events: events.length,
        file_size: JSON.stringify(events).length,
        checksum,
        compressed: false,
        events,
        exported_by: {
          type: exportedBy.type as any,
          id: exportedBy.id,
          name: exportedBy.name,
        },
        purpose,
        consent_ref: consentRef,
      };

      // Log the export as an audit event
      await this.logEvent({
        actor: {
          type: exportedBy.type as any,
          id: exportedBy.id,
          name: exportedBy.name,
        },
        action: 'DATA_EXPORT',
        resource: { type: 'AuditExport', id: exportId },
        result: 'success',
        details: `Exported ${events.length} audit events in ${format} format`,
      });

      const validated = AuditExportSchema.parse(auditExport);
      span.end();
      return { ok: true, value: validated };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async checkRetentionCompliance(): Promise<Result<{
    compliant: boolean;
    eventsToRetain: number;
    eventsExpired: number;
    retentionPeriod: number;
  }>> {
    const span = this.tracer.startSpan('auditLogger.checkRetention');
    try {
      const allEvents = await this.store.getAllEvents();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.config.retentionPeriodDays);
      const expired = allEvents.filter(e => new Date(e.timestamp) < cutoff).length;
      const retained = allEvents.length - expired;
      const result = {
        compliant: expired === 0,
        eventsToRetain: retained,
        eventsExpired: expired,
        retentionPeriod: this.config.retentionPeriodDays,
      };
      span.end();
      return { ok: true, value: result };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  async createHipaaComplianceReport(dateRange?: { start: string; end: string }): Promise<Result<{
    report_id: string;
    timestamp: string;
    date_range: { start: string; end: string };
    total_events: number;
    access_events: number;
    disclosure_events: number;
    consent_events: number;
    security_events: number;
    unique_patients: number;
    chain_valid: boolean;
    retention_compliant: boolean;
    recommendations: string[];
  }>> {
    const span = this.tracer.startSpan('auditLogger.createReport');
    try {
      const query: AuditQuery = {
        sort_by: 'timestamp',
        sort_order: 'desc',
        ...dateRange,
      };
      const statsResult = await this.getStatistics(query);
      const chainResult = await this.validateChain();
      const retentionResult = await this.checkRetentionCompliance();

      if (!statsResult.ok || !chainResult.ok || !retentionResult.ok) {
        throw new Error('Failed to gather compliance data');
      }

      const stats = statsResult.value;
      const chain = chainResult.value;
      const retention = retentionResult.value;

      const recommendations: string[] = [];
      if (!chain.valid) recommendations.push('Audit chain integrity compromised – investigate tampering');
      if (!retention.compliant) recommendations.push('Retention policy violations detected – review data retention');
      if (stats.error_rate > 0.05) recommendations.push('High error rate detected – review system performance');
      if (stats.access_denied_rate > 0.1) recommendations.push('High access denial rate – review consent policies');

      const report = {
        report_id: uuidv4(),
        timestamp: new Date().toISOString(),
        date_range: dateRange || stats.date_range,
        total_events: stats.total_events,
        access_events: (stats.events_by_action['ACCESS_GRANTED'] || 0) + (stats.events_by_action['ACCESS_DENIED'] || 0),
        disclosure_events: stats.events_by_action['DATA_SHARE'] || 0,
        consent_events: stats.events_by_action['CONSENT_VERIFIED'] || 0,
        security_events: (stats.events_by_action['LOGIN'] || 0) + (stats.events_by_action['LOGOUT'] || 0) + (stats.events_by_action['ERROR'] || 0),
        unique_patients: stats.unique_patients,
        chain_valid: chain.valid,
        retention_compliant: retention.compliant,
        recommendations,
      };
      span.end();
      return { ok: true, value: report };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  getSystemInfo(): { systemId: string; environment: string; eventCount: Promise<number> } {
    return {
      systemId: this.config.systemId,
      environment: this.config.environment,
      eventCount: this.store.getEventCount(),
    };
  }

  // ==================== Observability ====================
  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    return this.metrics.getMetrics(moduleId);
  }

  getEvents(): EventLog[] {
    return this.logger.getEvents();
  }

  getInfo(): { name: string; version: string; capabilities: string[] } {
    return {
      name: 'ATLAS Audit Logger',
      version: '1.0.0',
      capabilities: [
        'event_logging',
        'chain_integrity',
        'compliance_reporting',
        'retention_management',
        'observability',
      ],
    };
  }

  // ==================== Private Helpers ====================
  private calculateHash(event: Omit<AuditEvent, 'hash'>): string {
    const stringified = JSON.stringify(event, Object.keys(event).sort());
    return createHash(this.config.hashAlgorithm).update(stringified).digest('hex');
  }

  private calculateExportChecksum(events: AuditEvent[]): string {
    const stringified = JSON.stringify(events);
    return createHash(this.config.hashAlgorithm).update(stringified).digest('hex');
  }

  private recordMetrics(operation: string, action: string, result: string, success: boolean, error?: string): void {
    if (this.config.enableMetrics) {
      this.metrics.recordEvent('audit-logger', `${operation}:${action}`, result, success, error);
    }
    if (this.config.enableEventLogging && !success) {
      this.logger.log({
        id: uuidv4(),
        type: 'AUDIT_OPERATION_FAILURE',
        timestamp: new Date().toISOString(),
        source: 'audit-logger',
        action: `${operation}:${action}`,
        eventId: '',
        data: { error },
        success: false,
      });
    }
  }
}

// ==================== Convenience Factory ====================
export function createAuditLogger(config?: Partial<AuditLoggerConfig>): AuditLogger {
  return new AuditLogger(config);
}