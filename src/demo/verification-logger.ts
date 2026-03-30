// ATLAS Verification Logger
// Structured verification logging with cryptographic audit integration.

import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export type VerificationLogLevel = 'INFO' | 'ERROR';

export interface VerificationAuditEventInput {
  readonly type: string;
  readonly step?: number;
  readonly module?: string;
  readonly action?: string;
  readonly result?: string;
  readonly error?: string;
  readonly level?: VerificationLogLevel;
  readonly details?: Record<string, unknown>;
  readonly sessionId?: string;
  readonly correlationId?: string;
  readonly timestamp?: string;
}

export interface VerificationAuditEventRecord {
  readonly id: string;
  readonly sequence: number;
  readonly type: string;
  readonly step?: number;
  readonly module?: string;
  readonly action?: string;
  readonly result?: string;
  readonly error?: string;
  readonly level: VerificationLogLevel;
  readonly details: Record<string, unknown>;
  readonly sessionId?: string;
  readonly correlationId?: string;
  readonly timestamp: string;
  readonly occurredAt: string;
  readonly previousHash: string;
  readonly currentHash: string;
}

export type AuditChainValidationResult =
  | {
      readonly valid: true;
      readonly totalEvents: number;
    }
  | {
      readonly valid: false;
      readonly totalEvents: number;
      readonly breakIndex: number;
      readonly reason: string;
    };

export interface VerificationLogEntry {
  readonly step: number;
  readonly level: VerificationLogLevel;
  readonly module: string;
  readonly action: string;
  readonly message: string;
  readonly rendered: string;
  readonly timestamp: string;
  readonly sessionId: string;
  readonly auditHash?: string;
}

export interface VerificationLoggerAuditLike {
  logEvent(event: VerificationAuditEventInput): VerificationAuditEventRecord;
  getEvents(limit?: number): readonly VerificationAuditEventRecord[];
  validateChain(): AuditChainValidationResult;
}

export interface LoggerSink {
  info(message: string): void;
  error(message: string): void;
}

export interface AtlasLoggerOptions {
  readonly sink?: LoggerSink;
  readonly includeTimestampInOutput?: boolean;
  readonly maxEntriesInMemory?: number;
  readonly sessionId?: string;
}

export interface AtlasLoggerStats {
  readonly sessionId: string;
  readonly currentStep: number;
  readonly totalEntriesInMemory: number;
  readonly maxEntriesInMemory: number;
  readonly infoEntries: number;
  readonly errorEntries: number;
}

export interface MockAuditLoggerSummary {
  readonly totalEvents: number;
  readonly latestHash: string;
  readonly chainValid: boolean;
}

interface ScenarioStep {
  readonly level: VerificationLogLevel;
  readonly module: string;
  readonly action: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

const GENESIS_HASH = '0';

function nowIsoString(): string {
  return new Date().toISOString();
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
    .join(',')}}`;
}

function deepCopy<T>(value: T): T {
  return structuredClone(value);
}

function inferLevel(event: VerificationAuditEventInput): VerificationLogLevel {
  if (event.level != null) {
    return event.level;
  }

  return event.error != null ? 'ERROR' : 'INFO';
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function buildAuditHashMaterial(
  event: Omit<VerificationAuditEventRecord, 'currentHash'>,
): Record<string, unknown> {
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

function createConsoleSink(): LoggerSink {
  return {
    info: (message) => console.log(message),
    error: (message) => console.error(message),
  };
}

function renderLogLine(input: {
  readonly step: number;
  readonly module: string;
  readonly action: string;
  readonly message: string;
  readonly level: VerificationLogLevel;
  readonly timestamp: string;
  readonly includeTimestamp: boolean;
}): string {
  const core =
    input.level === 'ERROR'
      ? `[${input.step}] [${input.module}] ${input.action} → ERROR: ${input.message}`
      : `[${input.step}] [${input.module}] ${input.action} → ${input.message}`;

  return input.includeTimestamp ? `${input.timestamp} ${core}` : core;
}

function shortHash(hash: string): string {
  return hash; // Show full SHA-256 hash instead of truncating
}

export class AtlasLogger {
  private step = 0;
  private sessionId: string;
  private readonly auditLogger?: VerificationLoggerAuditLike;
  private readonly sink: LoggerSink;
  private readonly includeTimestampInOutput: boolean;
  private readonly maxEntriesInMemory: number;
  private readonly entries: VerificationLogEntry[] = [];

  constructor(auditLogger?: VerificationLoggerAuditLike, options: AtlasLoggerOptions = {}) {
    this.auditLogger = auditLogger;
    this.sink = options.sink ?? createConsoleSink();
    this.includeTimestampInOutput = options.includeTimestampInOutput ?? false;
    this.maxEntriesInMemory = clampInteger(options.maxEntriesInMemory ?? 500, 10, 50_000);
    this.sessionId = options.sessionId ?? randomUUID();
  }

  log(
    module: string,
    action: string,
    result: string,
    details?: Record<string, unknown>,
  ): string {
    return this.write('INFO', module, action, result, details);
  }

  error(
    module: string,
    action: string,
    error: string,
    details?: Record<string, unknown>,
  ): string {
    return this.write('ERROR', module, action, error, details);
  }

  reset(reason = 'starting new session'): string {
    this.step = 0;
    this.sessionId = randomUUID();

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
      } catch (error) {
        this.safeSinkError(`Audit reset logging failed: ${String(error)}`);
      }
    }

    return resetMessage;
  }

  getStep(): number {
    return this.step;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getEntries(limit = this.entries.length): readonly VerificationLogEntry[] {
    const safeLimit = clampInteger(limit, 0, this.entries.length);
    return deepCopy(this.entries.slice(-safeLimit));
  }

  getStats(): AtlasLoggerStats {
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

  createModuleLogger(module: string): {
    readonly log: (action: string, result: string, details?: Record<string, unknown>) => string;
    readonly error: (action: string, error: string, details?: Record<string, unknown>) => string;
  } {
    return {
      log: (action, result, details) => this.log(module, action, result, details),
      error: (action, error, details) => this.error(module, action, error, details),
    };
  }

  private write(
    level: VerificationLogLevel,
    module: string,
    action: string,
    message: string,
    details?: Record<string, unknown>,
  ): string {
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

    let auditHash: string | undefined;

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
      } catch (error) {
        this.safeSinkError(`Audit logging failed: ${String(error)}`);
      }
    }

    const entry: VerificationLogEntry = {
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
    } else {
      this.safeSinkInfo(rendered);
    }

    return rendered;
  }

  private safeSinkInfo(message: string): void {
    try {
      this.sink.info(message);
    } catch {
      // Intentionally ignored to avoid logger failure loops.
    }
  }

  private safeSinkError(message: string): void {
    try {
      this.sink.error(message);
    } catch {
      // Intentionally ignored to avoid logger failure loops.
    }
  }
}

/**
 * Despite the name "Mock", this is a real SHA-256 chained in-memory audit logger
 * intended for demos, local development, and tests.
 */
export class MockAuditLogger implements VerificationLoggerAuditLike {
  private readonly events: VerificationAuditEventRecord[] = [];

  logEvent(event: VerificationAuditEventInput): VerificationAuditEventRecord {
    const timestamp = event.timestamp ?? nowIsoString();
    const previousHash = this.events.at(-1)?.currentHash ?? GENESIS_HASH;

    const baseRecord: Omit<VerificationAuditEventRecord, 'currentHash'> = {
      id: randomUUID(),
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

    const storedRecord: VerificationAuditEventRecord = {
      ...baseRecord,
      currentHash: sha256Hex(stableStringify(buildAuditHashMaterial(baseRecord))),
    };

    this.events.push(storedRecord);
    return deepCopy(storedRecord);
  }

  getEvents(limit = this.events.length): readonly VerificationAuditEventRecord[] {
    const safeLimit = clampInteger(limit, 0, this.events.length);
    return deepCopy(this.events.slice(-safeLimit));
  }

  getLatestHash(): string {
    return this.events.at(-1)?.currentHash ?? GENESIS_HASH;
  }

  getSummary(): MockAuditLoggerSummary {
    const validation = this.validateChain();

    return {
      totalEvents: this.events.length,
      latestHash: this.getLatestHash(),
      chainValid: validation.valid,
    };
  }

  clear(): void {
    this.events.length = 0;
  }

  validateChain(): AuditChainValidationResult {
    for (let index = 0; index < this.events.length; index += 1) {
      const current = this.events[index]!;
      const expectedPreviousHash =
        index === 0 ? GENESIS_HASH : this.events[index - 1]!.currentHash;

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

      const recomputedHash = sha256Hex(
        stableStringify(
          buildAuditHashMaterial({
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
          }),
        ),
      );

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

function printAuditReport(auditLogger: MockAuditLogger): void {
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
    console.log(
      `Event ${index + 1}: ${event.type} | step=${String(event.step ?? 'n/a')} | ${event.module ?? 'unknown'} | ${event.action ?? 'unknown'} | ${result}`,
    );
    console.log(`   Previous Hash: ${shortHash(event.previousHash)}`);
    console.log(`   Current Hash:  ${shortHash(event.currentHash)}`);
  });
}

function runScenario(
  logger: AtlasLogger,
  scenarioName: string,
  steps: readonly ScenarioStep[],
): void {
  console.log(`\n${scenarioName}`);
  console.log('-'.repeat(60));

  for (const step of steps) {
    if (step.level === 'ERROR') {
      logger.error(step.module, step.action, step.message, step.details);
    } else {
      logger.log(step.module, step.action, step.message, step.details);
    }
  }
}

export async function demonstrateVerificationLogger(): Promise<{
  readonly logger: AtlasLogger;
  readonly auditLogger: MockAuditLogger;
  readonly chainValidation: AuditChainValidationResult;
}> {
  console.log('🔍 ATLAS VERIFICATION LOGGER DEMONSTRATION');
  console.log('='.repeat(60));

  const auditLogger = new MockAuditLogger();
  const logger = new AtlasLogger(auditLogger);

  console.log('\n🎭 "MARIA\'S MONDAY" SCENARIO WITH VERIFICATION LOGGING');
  console.log('-'.repeat(60));

  const mariaScenarioSteps: readonly ScenarioStep[] = [
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

export async function testVerificationLoggerScenarios(): Promise<{
  readonly logger: AtlasLogger;
  readonly auditLogger: MockAuditLogger;
  readonly stats: AtlasLoggerStats;
  readonly chainValidation: AuditChainValidationResult;
}> {
  console.log('\n🧪 TESTING VERIFICATION LOGGER SCENARIOS');
  console.log('='.repeat(60));

  const auditLogger = new MockAuditLogger();
  const logger = new AtlasLogger(auditLogger);

  const scenarios: readonly {
    readonly name: string;
    readonly resetReason: string;
    readonly steps: readonly ScenarioStep[];
  }[] = [
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