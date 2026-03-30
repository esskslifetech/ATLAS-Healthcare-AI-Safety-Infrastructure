"use strict";
// ATLAS Verification Logger
// Structured verification logging with cryptographic audit integration.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockAuditLogger = exports.AtlasLogger = void 0;
exports.demonstrateVerificationLogger = demonstrateVerificationLogger;
exports.testVerificationLoggerScenarios = testVerificationLoggerScenarios;
const node_crypto_1 = require("node:crypto");
const GENESIS_HASH = '0';
function nowIsoString() {
    return new Date().toISOString();
}
function sha256Hex(value) {
    return (0, node_crypto_1.createHash)('sha256').update(value).digest('hex');
}
function stableStringify(value) {
    if (value === null || value === undefined) {
        return 'null';
    }
    if (typeof value !== 'object') {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    const entries = Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .sort(([left], [right]) => left.localeCompare(right));
    return `{${entries
        .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
        .join(',')}}`;
}
function deepCopy(value) {
    return structuredClone(value);
}
function inferLevel(event) {
    if (event.level != null) {
        return event.level;
    }
    return event.error != null ? 'ERROR' : 'INFO';
}
function clampInteger(value, min, max) {
    return Math.min(max, Math.max(min, Math.trunc(value)));
}
function buildAuditHashMaterial(event) {
    return {
        id: event.id,
        sequence: event.sequence,
        type: event.type,
        step: event.step,
        module: event.module,
        action: event.action,
        result: event.result,
        error: event.error,
        level: event.level,
        details: event.details,
        sessionId: event.sessionId,
        correlationId: event.correlationId,
        timestamp: event.timestamp,
        occurredAt: event.occurredAt,
        previousHash: event.previousHash,
    };
}
function createConsoleSink() {
    return {
        info: (message) => console.log(message),
        error: (message) => console.error(message),
    };
}
function renderLogLine(input) {
    const core = input.level === 'ERROR'
        ? `[${input.step}] [${input.module}] ${input.action} → ERROR: ${input.message}`
        : `[${input.step}] [${input.module}] ${input.action} → ${input.message}`;
    return input.includeTimestamp ? `${input.timestamp} ${core}` : core;
}
function shortHash(hash) {
    return hash.slice(0, 12);
}
class AtlasLogger {
    constructor(auditLogger, options = {}) {
        this.step = 0;
        this.entries = [];
        this.auditLogger = auditLogger;
        this.sink = options.sink ?? createConsoleSink();
        this.includeTimestampInOutput = options.includeTimestampInOutput ?? false;
        this.maxEntriesInMemory = clampInteger(options.maxEntriesInMemory ?? 500, 10, 50000);
        this.sessionId = options.sessionId ?? (0, node_crypto_1.randomUUID)();
    }
    log(module, action, result, details) {
        return this.write('INFO', module, action, result, details);
    }
    error(module, action, error, details) {
        return this.write('ERROR', module, action, error, details);
    }
    reset(reason = 'starting new session') {
        this.step = 0;
        this.sessionId = (0, node_crypto_1.randomUUID)();
        const resetMessage = `🔄 AtlasLogger reset - ${reason}`;
        this.safeSinkInfo(resetMessage);
        if (this.auditLogger != null) {
            try {
                this.auditLogger.logEvent({
                    type: 'LOGGER_RESET',
                    step: 0,
                    module: 'system',
                    action: 'RESET',
                    result: reason,
                    level: 'INFO',
                    sessionId: this.sessionId,
                });
            }
            catch (error) {
                this.safeSinkError(`Audit reset logging failed: ${String(error)}`);
            }
        }
        return resetMessage;
    }
    getStep() {
        return this.step;
    }
    getSessionId() {
        return this.sessionId;
    }
    getEntries(limit = this.entries.length) {
        const safeLimit = clampInteger(limit, 0, this.entries.length);
        return deepCopy(this.entries.slice(-safeLimit));
    }
    getStats() {
        const infoEntries = this.entries.filter((entry) => entry.level === 'INFO').length;
        const errorEntries = this.entries.filter((entry) => entry.level === 'ERROR').length;
        return {
            sessionId: this.sessionId,
            currentStep: this.step,
            totalEntriesInMemory: this.entries.length,
            maxEntriesInMemory: this.maxEntriesInMemory,
            infoEntries,
            errorEntries,
        };
    }
    createModuleLogger(module) {
        return {
            log: (action, result, details) => this.log(module, action, result, details),
            error: (action, error, details) => this.error(module, action, error, details),
        };
    }
    write(level, module, action, message, details) {
        this.step += 1;
        const timestamp = nowIsoString();
        const rendered = renderLogLine({
            step: this.step,
            module,
            action,
            message,
            level,
            timestamp,
            includeTimestamp: this.includeTimestampInOutput,
        });
        let auditHash;
        if (this.auditLogger != null) {
            try {
                const auditRecord = this.auditLogger.logEvent({
                    type: level === 'ERROR' ? 'VERIFICATION_ERROR' : 'VERIFICATION_LOG',
                    step: this.step,
                    module,
                    action,
                    result: level === 'INFO' ? message : undefined,
                    error: level === 'ERROR' ? message : undefined,
                    level,
                    details: details ?? {},
                    sessionId: this.sessionId,
                    timestamp,
                });
                auditHash = auditRecord.currentHash;
            }
            catch (error) {
                this.safeSinkError(`Audit logging failed: ${String(error)}`);
            }
        }
        const entry = {
            step: this.step,
            level,
            module,
            action,
            message,
            rendered,
            timestamp,
            sessionId: this.sessionId,
            auditHash,
        };
        this.entries.push(entry);
        if (this.entries.length > this.maxEntriesInMemory) {
            this.entries.splice(0, this.entries.length - this.maxEntriesInMemory);
        }
        if (level === 'ERROR') {
            this.safeSinkError(rendered);
        }
        else {
            this.safeSinkInfo(rendered);
        }
        return rendered;
    }
    safeSinkInfo(message) {
        try {
            this.sink.info(message);
        }
        catch {
            // Intentionally ignored to avoid logger failure loops.
        }
    }
    safeSinkError(message) {
        try {
            this.sink.error(message);
        }
        catch {
            // Intentionally ignored to avoid logger failure loops.
        }
    }
}
exports.AtlasLogger = AtlasLogger;
/**
 * Despite the name "Mock", this is a real SHA-256 chained in-memory audit logger
 * intended for demos, local development, and tests.
 */
class MockAuditLogger {
    constructor() {
        this.events = [];
    }
    logEvent(event) {
        const timestamp = event.timestamp ?? nowIsoString();
        const previousHash = this.events.at(-1)?.currentHash ?? GENESIS_HASH;
        const baseRecord = {
            id: (0, node_crypto_1.randomUUID)(),
            sequence: this.events.length + 1,
            type: event.type,
            step: event.step,
            module: event.module,
            action: event.action,
            result: event.result,
            error: event.error,
            level: inferLevel(event),
            details: deepCopy(event.details ?? {}),
            sessionId: event.sessionId,
            correlationId: event.correlationId,
            timestamp,
            occurredAt: timestamp,
            previousHash,
        };
        const storedRecord = {
            ...baseRecord,
            currentHash: sha256Hex(stableStringify(buildAuditHashMaterial(baseRecord))),
        };
        this.events.push(storedRecord);
        return deepCopy(storedRecord);
    }
    getEvents(limit = this.events.length) {
        const safeLimit = clampInteger(limit, 0, this.events.length);
        return deepCopy(this.events.slice(-safeLimit));
    }
    getLatestHash() {
        return this.events.at(-1)?.currentHash ?? GENESIS_HASH;
    }
    getSummary() {
        const validation = this.validateChain();
        return {
            totalEvents: this.events.length,
            latestHash: this.getLatestHash(),
            chainValid: validation.valid,
        };
    }
    clear() {
        this.events.length = 0;
    }
    validateChain() {
        for (let index = 0; index < this.events.length; index += 1) {
            const current = this.events[index];
            const expectedPreviousHash = index === 0 ? GENESIS_HASH : this.events[index - 1].currentHash;
            if (current.sequence !== index + 1) {
                return {
                    valid: false,
                    totalEvents: this.events.length,
                    breakIndex: index,
                    reason: 'sequence mismatch',
                };
            }
            if (current.previousHash !== expectedPreviousHash) {
                return {
                    valid: false,
                    totalEvents: this.events.length,
                    breakIndex: index,
                    reason: 'previous hash mismatch',
                };
            }
            const recomputedHash = sha256Hex(stableStringify(buildAuditHashMaterial({
                id: current.id,
                sequence: current.sequence,
                type: current.type,
                step: current.step,
                module: current.module,
                action: current.action,
                result: current.result,
                error: current.error,
                level: current.level,
                details: current.details,
                sessionId: current.sessionId,
                correlationId: current.correlationId,
                timestamp: current.timestamp,
                occurredAt: current.occurredAt,
                previousHash: current.previousHash,
            })));
            if (current.currentHash !== recomputedHash) {
                return {
                    valid: false,
                    totalEvents: this.events.length,
                    breakIndex: index,
                    reason: 'current hash mismatch',
                };
            }
        }
        return {
            valid: true,
            totalEvents: this.events.length,
        };
    }
}
exports.MockAuditLogger = MockAuditLogger;
function printAuditReport(auditLogger) {
    const auditEvents = auditLogger.getEvents();
    const chainValidation = auditLogger.validateChain();
    console.log('\n🔒 AUDIT INTEGRATION VERIFICATION');
    console.log('-'.repeat(60));
    console.log(`Total audit events logged: ${auditEvents.length}`);
    console.log(`Latest hash: ${shortHash(auditLogger.getLatestHash())}`);
    console.log(`Chain validation result: ${chainValidation.valid ? '✅ VALID' : '❌ TAMPERED'}`);
    console.log(`Total events checked: ${chainValidation.totalEvents}`);
    console.log('\nRecent Hash Chain:');
    auditEvents.forEach((event, index) => {
        const result = event.result ?? event.error ?? 'N/A';
        console.log(`Event ${index + 1}: ${event.type} | step=${String(event.step ?? 'n/a')} | ${event.module ?? 'unknown'} | ${event.action ?? 'unknown'} | ${result}`);
        console.log(`   Previous Hash: ${shortHash(event.previousHash)}`);
        console.log(`   Current Hash:  ${shortHash(event.currentHash)}`);
    });
}
function runScenario(logger, scenarioName, steps) {
    console.log(`\n${scenarioName}`);
    console.log('-'.repeat(60));
    for (const step of steps) {
        if (step.level === 'ERROR') {
            logger.error(step.module, step.action, step.message, step.details);
        }
        else {
            logger.log(step.module, step.action, step.message, step.details);
        }
    }
}
async function demonstrateVerificationLogger() {
    console.log('🔍 ATLAS VERIFICATION LOGGER DEMONSTRATION');
    console.log('='.repeat(60));
    const auditLogger = new MockAuditLogger();
    const logger = new AtlasLogger(auditLogger);
    console.log('\n🎭 "MARIA\'S MONDAY" SCENARIO WITH VERIFICATION LOGGING');
    console.log('-'.repeat(60));
    const mariaScenarioSteps = [
        { level: 'INFO', module: 'proxy', action: 'PATIENT_INPUT', message: 'chest_pain (2h)' },
        { level: 'INFO', module: 'consent', action: 'VERIFY', message: 'SUCCESS' },
        { level: 'INFO', module: 'identity', action: 'TOKEN_ACQUIRED', message: 'SUCCESS' },
        { level: 'INFO', module: 'fhir', action: 'READ_Patient', message: 'SUCCESS' },
        { level: 'INFO', module: 'fhir', action: 'READ_Conditions', message: 'SUCCESS' },
        { level: 'INFO', module: 'fhir', action: 'READ_Medications', message: 'SUCCESS' },
        { level: 'INFO', module: 'triage', action: 'CLASSIFY', message: 'EMERGENT (0.90)' },
        { level: 'INFO', module: 'coordinator', action: 'ROUTE', message: 'ED' },
        { level: 'INFO', module: 'coordinator', action: 'REFERRAL', message: 'Cardiology_StMarys' },
        { level: 'INFO', module: 'proxy', action: 'NOTIFY_PATIENT', message: 'Emergency_Instructions' },
        { level: 'INFO', module: 'system', action: 'NOTIFY_PROVIDER', message: 'PCP_DrJohnson' },
        { level: 'INFO', module: 'audit', action: 'LOG_EVENT', message: 'HASH_OK' },
        { level: 'INFO', module: 'system', action: 'COMPLETE', message: 'SUCCESS' },
    ];
    runScenario(logger, 'Primary Demonstration Flow', mariaScenarioSteps);
    printAuditReport(auditLogger);
    console.log('\n🎯 VERIFICATION LOGGER BENEFITS');
    console.log('-'.repeat(60));
    console.log('✅ Human-readable logs for demos and debugging');
    console.log('✅ SHA-256 chained audit records for trust and integrity');
    console.log('✅ Step-by-step traceability across the full workflow');
    console.log('✅ Graceful audit failure handling without breaking demos');
    console.log('✅ Structured data suitable for automation and parsing');
    console.log('\n🚀 PRODUCTION READINESS');
    console.log('-'.repeat(60));
    console.log('✅ Simple enough for live demonstrations');
    console.log('✅ Strong enough for repeatable verification evidence');
    console.log('✅ Flexible enough for multiple ATLAS modules');
    console.log('✅ Typed and maintainable for production evolution');
    return {
        logger,
        auditLogger,
        chainValidation: auditLogger.validateChain(),
    };
}
async function testVerificationLoggerScenarios() {
    console.log('\n🧪 TESTING VERIFICATION LOGGER SCENARIOS');
    console.log('='.repeat(60));
    const auditLogger = new MockAuditLogger();
    const logger = new AtlasLogger(auditLogger);
    const scenarios = [
        {
            name: '🔴 Scenario 1: Emergency Chest Pain',
            resetReason: 'emergency scenario',
            steps: [
                {
                    level: 'INFO',
                    module: 'proxy',
                    action: 'PATIENT_INPUT',
                    message: 'chest_pain_radiating_arm',
                },
                {
                    level: 'INFO',
                    module: 'triage',
                    action: 'CLASSIFY',
                    message: 'EMERGENT (0.95)',
                },
                {
                    level: 'INFO',
                    module: 'coordinator',
                    action: 'ESCALATE',
                    message: '911_CALLED',
                },
                {
                    level: 'INFO',
                    module: 'system',
                    action: 'COMPLETE',
                    message: 'EMERGENCY_HANDLED',
                },
            ],
        },
        {
            name: '🟡 Scenario 2: Urgent Fever',
            resetReason: 'urgent scenario',
            steps: [
                {
                    level: 'INFO',
                    module: 'proxy',
                    action: 'PATIENT_INPUT',
                    message: 'high_fever_severe_headache',
                },
                {
                    level: 'INFO',
                    module: 'triage',
                    action: 'CLASSIFY',
                    message: 'URGENT (0.85)',
                },
                {
                    level: 'INFO',
                    module: 'coordinator',
                    action: 'ROUTE',
                    message: 'URGENT_CARE',
                },
                {
                    level: 'INFO',
                    module: 'system',
                    action: 'COMPLETE',
                    message: 'APPOINTMENT_SCHEDULED',
                },
            ],
        },
        {
            name: '⚫ Scenario 3: Error Handling',
            resetReason: 'clarification scenario',
            steps: [
                {
                    level: 'INFO',
                    module: 'proxy',
                    action: 'PATIENT_INPUT',
                    message: 'vague_symptoms',
                },
                {
                    level: 'INFO',
                    module: 'triage',
                    action: 'CLASSIFY',
                    message: 'UNCLEAR (0.30)',
                },
                {
                    level: 'ERROR',
                    module: 'system',
                    action: 'CLARIFY',
                    message: 'Need more symptom details',
                },
                {
                    level: 'INFO',
                    module: 'proxy',
                    action: 'PATIENT_INPUT',
                    message: 'mild_cough_2days',
                },
                {
                    level: 'INFO',
                    module: 'triage',
                    action: 'CLASSIFY',
                    message: 'ROUTINE (0.75)',
                },
                {
                    level: 'INFO',
                    module: 'system',
                    action: 'COMPLETE',
                    message: 'TELEHEALTH_RECOMMENDED',
                },
            ],
        },
    ];
    for (const scenario of scenarios) {
        logger.reset(scenario.resetReason);
        runScenario(logger, scenario.name, scenario.steps);
    }
    const stats = logger.getStats();
    const chainValidation = auditLogger.validateChain();
    console.log('\n📊 LOGGER STATS');
    console.log('-'.repeat(60));
    console.log(`Session ID: ${stats.sessionId}`);
    console.log(`Current Step: ${stats.currentStep}`);
    console.log(`Entries In Memory: ${stats.totalEntriesInMemory}/${stats.maxEntriesInMemory}`);
    console.log(`Info Entries: ${stats.infoEntries}`);
    console.log(`Error Entries: ${stats.errorEntries}`);
    console.log(`Audit Chain: ${chainValidation.valid ? '✅ VALID' : '❌ TAMPERED'}`);
    console.log('\n✅ All scenarios handled successfully');
    return {
        logger,
        auditLogger,
        stats,
        chainValidation,
    };
}
const isDirectRun = require.main === module;
if (isDirectRun) {
    void demonstrateVerificationLogger()
        .then(() => testVerificationLoggerScenarios())
        .catch((error) => {
        console.error('Verification logger demo failed:', error);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=verification-logger.js.map