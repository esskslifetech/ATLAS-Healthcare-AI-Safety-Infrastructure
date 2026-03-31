"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = exports.AuditLoggerError = void 0;
exports.setTracer = setTracer;
exports.createAuditLogger = createAuditLogger;
// audit-logger.ts
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
const async_mutex_1 = require("async-mutex");
const types_1 = require("./types");
const defaultConfig = {
    systemId: 'atlas-audit-system',
    environment: 'development',
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
    retentionPeriodDays: types_1.RETENTION_PERIODS.HIPAA_MINIMUM,
    defaultPageSize: 100,
    hashAlgorithm: 'sha256',
};
// ==================== Custom Error ====================
class AuditLoggerError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'AuditLoggerError';
    }
}
exports.AuditLoggerError = AuditLoggerError;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
    }
    recordEvent(moduleId, action, result, success, error) {
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
        }
        else {
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
    getMetrics(moduleId) {
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
// ==================== Audit Store (Thread‑safe, Append‑only) ====================
class AuditStore {
    constructor() {
        this.events = [];
        this.lastHash = null;
        this.lock = new async_mutex_1.Mutex();
    }
    async appendEvent(event) {
        const release = await this.lock.acquire();
        try {
            this.events.push(event);
            this.lastHash = event.hash;
        }
        finally {
            release();
        }
    }
    async queryEvents(query) {
        const release = await this.lock.acquire();
        try {
            let filtered = [...this.events];
            if (query.patient_id)
                filtered = filtered.filter(e => e.patient_id === query.patient_id);
            if (query.actor_id)
                filtered = filtered.filter(e => e.actor.id === query.actor_id);
            if (query.actor_type)
                filtered = filtered.filter(e => e.actor.type === query.actor_type);
            if (query.action)
                filtered = filtered.filter(e => e.action === query.action);
            if (query.resource_type)
                filtered = filtered.filter(e => e.resource.type === query.resource_type);
            if (query.resource_id)
                filtered = filtered.filter(e => e.resource.id === query.resource_id);
            if (query.result)
                filtered = filtered.filter(e => e.result === query.result);
            if (query.start_date) {
                filtered = filtered.filter(e => e.timestamp >= query.start_date);
            }
            if (query.end_date) {
                filtered = filtered.filter(e => e.timestamp <= query.end_date);
            }
            // Sort by timestamp if specified
            if (query.sort_by === 'timestamp') {
                filtered.sort((a, b) => {
                    const aTime = new Date(a.timestamp).getTime();
                    const bTime = new Date(b.timestamp).getTime();
                    return query.sort_order === 'desc' ? bTime - aTime : aTime - bTime;
                });
            }
            const offset = query.offset || 0;
            const limit = query.limit ?? this.defaultPageSize();
            return filtered.slice(offset, offset + limit);
        }
        finally {
            release();
        }
    }
    async getStatistics(query) {
        const release = await this.lock.acquire();
        try {
            // Use internal query logic to avoid deadlock
            let filtered = [...this.events];
            if (query.patient_id)
                filtered = filtered.filter(e => e.patient_id === query.patient_id);
            if (query.actor_id)
                filtered = filtered.filter(e => e.actor.id === query.actor_id);
            if (query.actor_type)
                filtered = filtered.filter(e => e.actor.type === query.actor_type);
            if (query.action)
                filtered = filtered.filter(e => e.action === query.action);
            if (query.resource_type)
                filtered = filtered.filter(e => e.resource.type === query.resource_type);
            if (query.resource_id)
                filtered = filtered.filter(e => e.resource.id === query.resource_id);
            if (query.result)
                filtered = filtered.filter(e => e.result === query.result);
            if (query.start_date) {
                filtered = filtered.filter(e => e.timestamp >= query.start_date);
            }
            if (query.end_date) {
                filtered = filtered.filter(e => e.timestamp <= query.end_date);
            }
            const stats = {
                total_events: filtered.length,
                events_by_type: {},
                events_by_action: {},
                events_by_actor: {},
                events_by_actor_type: {},
                events_by_resource_type: {},
                events_by_result: {},
                events_by_hour: {},
                unique_patients: new Set(),
                unique_actors: new Set(),
                date_range: { start: '', end: '' },
                error_rate: 0,
                access_denied_rate: 0,
            };
            for (const e of filtered) {
                stats.events_by_type[e.type] = (stats.events_by_type[e.type] || 0) + 1;
                stats.events_by_action[e.action] = (stats.events_by_action[e.action] || 0) + 1;
                stats.events_by_actor[e.actor.id] = (stats.events_by_actor[e.actor.id] || 0) + 1;
                stats.events_by_actor_type[e.actor.type] = (stats.events_by_actor_type[e.actor.type] || 0) + 1;
                stats.events_by_resource_type[e.resource.type] = (stats.events_by_resource_type[e.resource.type] || 0) + 1;
                stats.events_by_result[e.result] = (stats.events_by_result[e.result] || 0) + 1;
                const hour = new Date(e.timestamp).toISOString().slice(0, 13);
                stats.events_by_hour[hour] = (stats.events_by_hour[hour] || 0) + 1;
                if (e.patient_id)
                    stats.unique_patients.add(e.patient_id);
                stats.unique_actors.add(e.actor.id);
            }
            if (filtered.length) {
                const times = filtered.map(e => new Date(e.timestamp).getTime());
                stats.date_range.start = new Date(Math.min(...times)).toISOString();
                stats.date_range.end = new Date(Math.max(...times)).toISOString();
                stats.error_rate = (stats.events_by_result['FAILURE'] || 0) / filtered.length;
                stats.access_denied_rate = (stats.events_by_action['ACCESS_DENIED'] || 0) / filtered.length;
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
        }
        finally {
            release();
        }
    }
    async getLastHash() {
        const release = await this.lock.acquire();
        try {
            return this.lastHash;
        }
        finally {
            release();
        }
    }
    async getAllEvents() {
        const release = await this.lock.acquire();
        try {
            return [...this.events];
        }
        finally {
            release();
        }
    }
    async getEventCount() {
        const release = await this.lock.acquire();
        try {
            return this.events.length;
        }
        finally {
            release();
        }
    }
    defaultPageSize() {
        return 100;
    }
}
// ==================== Main Audit Logger ====================
class AuditLogger {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.store = new AuditStore();
        this.metrics = new MetricsCollector();
        this.logger = new EventLogger();
        this.tracer = globalTracer;
    }
    // ==================== Public Methods ====================
    async logEvent(event) {
        const span = this.tracer.startSpan('auditLogger.logEvent');
        const startTime = Date.now();
        try {
            const eventId = (0, uuid_1.v4)();
            const timestamp = new Date().toISOString();
            const previousHash = await this.store.getLastHash();
            const auditEvent = {
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
            const validated = types_1.AuditEventSchema.parse(auditEvent);
            await this.store.appendEvent(validated);
            const duration = Date.now() - startTime;
            this.recordMetrics('logEvent', validated.action, validated.result, true);
            if (this.config.enableEventLogging) {
                this.logger.log({
                    id: (0, uuid_1.v4)(),
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            const duration = Date.now() - startTime;
            this.recordMetrics('logEvent', event.action || 'UNKNOWN', event.result || 'failure', false, error.message);
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async logAccess(params) {
        return this.logEvent({
            actor: {
                type: params.actor.type,
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
    async logSystemEvent(params) {
        return this.logEvent({
            actor: { id: this.config.systemId, type: 'system', name: 'ATLAS System' },
            action: 'SYSTEM_EVENT',
            resource: { type: 'System', id: this.config.systemId },
            result: params.result || 'success',
            details: params.details,
            metadata: params.metadata,
        });
    }
    async queryEvents(query) {
        const span = this.tracer.startSpan('auditLogger.queryEvents');
        try {
            const validated = types_1.AuditQuerySchema.parse(query);
            const events = await this.store.queryEvents(validated);
            span.end();
            return { ok: true, value: events };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async getStatistics(query) {
        const span = this.tracer.startSpan('auditLogger.getStatistics');
        try {
            const fullQuery = {
                ...query,
                sort_by: query?.sort_by || 'timestamp',
                sort_order: query?.sort_order || 'desc',
            };
            const stats = await this.store.getStatistics(fullQuery);
            span.end();
            return { ok: true, value: stats };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async validateChain() {
        const span = this.tracer.startSpan('auditLogger.validateChain');
        try {
            const events = await this.store.getAllEvents();
            const tampered = [];
            let firstTampered;
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
                    if (!firstTampered)
                        firstTampered = e.event_id;
                }
                if (i > 0 && e.previous_hash !== events[i - 1].hash) {
                    isValid = false;
                    if (!firstTampered)
                        firstTampered = e.event_id;
                    tampered.push(e.event_id);
                }
            }
            const chainIntegrity = isValid ? 'VALID' : (tampered.length ? 'TAMPERED' : 'BROKEN');
            const result = {
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async exportEvents(query, format = 'json', exportedBy, purpose, consentRef) {
        const span = this.tracer.startSpan('auditLogger.exportEvents');
        try {
            const eventsResult = await this.queryEvents(query);
            if (!eventsResult.ok)
                return eventsResult;
            const events = eventsResult.value;
            const exportId = (0, uuid_1.v4)();
            const timestamp = new Date().toISOString();
            const checksum = this.calculateExportChecksum(events);
            const auditExport = {
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
                    type: exportedBy.type,
                    id: exportedBy.id,
                    name: exportedBy.name,
                },
                purpose,
                consent_ref: consentRef,
            };
            // Log the export as an audit event
            await this.logEvent({
                actor: {
                    type: exportedBy.type,
                    id: exportedBy.id,
                    name: exportedBy.name,
                },
                action: 'DATA_EXPORT',
                resource: { type: 'AuditExport', id: exportId },
                result: 'success',
                details: `Exported ${events.length} audit events in ${format} format`,
            });
            const validated = types_1.AuditExportSchema.parse(auditExport);
            span.end();
            return { ok: true, value: validated };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async checkRetentionCompliance() {
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    async createHipaaComplianceReport(dateRange) {
        const span = this.tracer.startSpan('auditLogger.createReport');
        try {
            const query = {
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
            const recommendations = [];
            if (!chain.valid)
                recommendations.push('Audit chain integrity compromised – investigate tampering');
            if (!retention.compliant)
                recommendations.push('Retention policy violations detected – review data retention');
            if (stats.error_rate > 0.05)
                recommendations.push('High error rate detected – review system performance');
            if (stats.access_denied_rate > 0.1)
                recommendations.push('High access denial rate – review consent policies');
            const report = {
                report_id: (0, uuid_1.v4)(),
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    getSystemInfo() {
        return {
            systemId: this.config.systemId,
            environment: this.config.environment,
            eventCount: this.store.getEventCount(),
        };
    }
    // ==================== Observability ====================
    getMetrics(moduleId) {
        return this.metrics.getMetrics(moduleId);
    }
    getEvents() {
        return this.logger.getEvents();
    }
    getInfo() {
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
    calculateHash(event) {
        const stringified = JSON.stringify(event, Object.keys(event).sort());
        return (0, crypto_1.createHash)(this.config.hashAlgorithm).update(stringified).digest('hex');
    }
    calculateExportChecksum(events) {
        const stringified = JSON.stringify(events);
        return (0, crypto_1.createHash)(this.config.hashAlgorithm).update(stringified).digest('hex');
    }
    recordMetrics(operation, action, result, success, error) {
        if (this.config.enableMetrics) {
            this.metrics.recordEvent('audit-logger', `${operation}:${action}`, result, success, error);
        }
        if (this.config.enableEventLogging && !success) {
            this.logger.log({
                id: (0, uuid_1.v4)(),
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
exports.AuditLogger = AuditLogger;
// ==================== Convenience Factory ====================
function createAuditLogger(config) {
    return new AuditLogger(config);
}
//# sourceMappingURL=audit-logger.js.map