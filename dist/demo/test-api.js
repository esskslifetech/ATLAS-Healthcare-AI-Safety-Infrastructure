"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAtlasAPI = testAtlasAPI;
const strict_1 = __importDefault(require("node:assert/strict"));
const node_crypto_1 = require("node:crypto");
const api_demo_1 = require("./api-demo");
class ConsoleReporter {
    constructor(silent, writer) {
        this.silent = silent;
        this.writer = writer;
    }
    line(text = '') {
        if (!this.silent) {
            this.writer(text);
        }
    }
    section(title) {
        if (!this.silent) {
            this.writer('');
            this.writer(title);
            this.writer('-'.repeat(60));
        }
    }
    success(text) {
        if (!this.silent) {
            this.writer(`✅ ${text}`);
        }
    }
    warning(text) {
        if (!this.silent) {
            this.writer(`⚠️ ${text}`);
        }
    }
}
const SUCCESS_CASES = [
    {
        name: '🔴 TEST 1: EMERGENCY CHEST PAIN',
        patientId: 'maria-123',
        symptoms: ['chest pain', '2 hours', 'sweating', 'nausea'],
        patientContext: {
            age: 45,
            vitals: {
                bp: '140/90',
                hr: 110,
                tempC: 37.2,
                oxygenSaturation: 97,
            },
            symptomDurationHours: 2,
        },
        expectedUrgency: 'EMERGENT',
        expectedPathway: 'ED',
    },
    {
        name: '🟡 TEST 2: URGENT FEVER WITH VITALS',
        patientId: 'john-456',
        symptoms: ['high fever', 'severe headache'],
        patientContext: {
            age: 72,
            vitals: {
                bp: '150/95',
                hr: 95,
                tempC: 39.2,
                oxygenSaturation: 96,
            },
            symptomDurationHours: 8,
        },
        expectedUrgency: 'URGENT',
        expectedPathway: 'URGENT_CARE',
    },
    {
        name: '🟢 TEST 3: ROUTINE COUGH WITH CONTEXT',
        patientId: 'sarah-789',
        symptoms: ['mild cough', '2 days', 'runny nose'],
        patientContext: {
            age: 28,
            vitals: {
                bp: '120/80',
                hr: 75,
                tempC: 37.0,
                oxygenSaturation: 99,
            },
            symptomDurationHours: 48,
        },
        expectedUrgency: 'ROUTINE',
        expectedPathway: 'SELF_CARE',
    },
];
function createReporter(options = {}) {
    return new ConsoleReporter(options.silent === true, options.writer ?? console.log);
}
function formatPercent(value) {
    return `${(value * 100).toFixed(0)}%`;
}
function formatMegabytes(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function shortHash(hash) {
    return hash.slice(0, 16);
}
async function runSuccessCase(atlas, reporter, testCase) {
    reporter.section(testCase.name);
    const requestId = (0, node_crypto_1.randomUUID)();
    const result = await atlas.processPatientRequest({
        requestId,
        patientId: testCase.patientId,
        symptoms: testCase.symptoms,
        patientContext: testCase.patientContext,
        consent: {
            provided: true,
            scope: 'TRIAGE',
        },
    });
    strict_1.default.equal(result.success, true, `${testCase.name} should succeed`);
    if (!result.success) {
        throw new Error(`Unexpected non-success result for ${testCase.name}`);
    }
    strict_1.default.equal(result.triage.urgency, testCase.expectedUrgency, `${testCase.name} urgency mismatch`);
    strict_1.default.equal(result.triage.pathway, testCase.expectedPathway, `${testCase.name} pathway mismatch`);
    strict_1.default.equal(result.audit.chainValid, true, `${testCase.name} audit chain must be valid`);
    strict_1.default.ok(result.audit.totalEvents > 0, `${testCase.name} should create audit events`);
    reporter.line(`Request ID: ${result.requestId}`);
    reporter.line(`Patient ID: ${result.patientId}`);
    reporter.line(`Result: ✅ SUCCESS`);
    reporter.line(`Triage: ${result.triage.urgency} → ${result.triage.pathway}`);
    reporter.line(`Confidence: ${formatPercent(result.triage.confidence)}`);
    reporter.line(`Risk Score: ${formatPercent(result.triage.riskScore)}`);
    reporter.line(`Reasoning: ${result.triage.reasoning}`);
    reporter.line(`Red Flags: ${result.triage.redFlags.join(', ') || 'None'}`);
    reporter.line(`Recommendations: ${result.triage.recommendations.join(' | ')}`);
    reporter.line(`Audit Valid: ${result.audit.chainValid ? '✅ VALID' : '❌ BROKEN'}`);
    reporter.line(`Total Events: ${result.audit.totalEvents}`);
    reporter.line(`Latest Hash: ${shortHash(result.audit.latestHash)}`);
    return {
        name: testCase.name,
        requestId: result.requestId,
        patientId: result.patientId,
        urgency: result.triage.urgency,
        pathway: result.triage.pathway,
        confidence: result.triage.confidence,
        riskScore: result.triage.riskScore,
        reasoning: result.triage.reasoning,
        redFlags: result.triage.redFlags,
        totalAuditEvents: result.audit.totalEvents,
        latestHash: result.audit.latestHash,
    };
}
async function runPreviewIsolationCheck(atlas, reporter) {
    reporter.section('🧪 TEST 4: PREVIEW MODE DOES NOT WRITE AUDIT EVENTS');
    const before = await atlas.getAuditReport(100);
    const requestId = (0, node_crypto_1.randomUUID)();
    const preview = atlas.previewTriage({
        requestId,
        symptoms: ['itchy eyes', 'runny nose', 'sneezing'],
        patientContext: {
            age: 31,
            symptomDurationHours: 12,
        },
    });
    const after = await atlas.getAuditReport(100);
    strict_1.default.equal(after.totalEvents, before.totalEvents, 'Preview triage must not change audit event count');
    strict_1.default.equal(preview.pathway, 'SELF_CARE');
    strict_1.default.equal(preview.urgency, 'ROUTINE');
    reporter.line(`Request ID: ${requestId}`);
    reporter.line(`Preview Triage: ${preview.urgency} → ${preview.pathway}`);
    reporter.line(`Confidence: ${formatPercent(preview.confidence)}`);
    reporter.line(`Audit Events Before: ${before.totalEvents}`);
    reporter.line(`Audit Events After: ${after.totalEvents}`);
    reporter.success('Preview mode is side-effect free');
    return {
        requestId,
        urgency: preview.urgency,
        pathway: preview.pathway,
        confidence: preview.confidence,
        auditEventsBefore: before.totalEvents,
        auditEventsAfter: after.totalEvents,
    };
}
async function runConsentDeniedCheck(atlas, reporter) {
    reporter.section('🛡️ TEST 5: CONSENT DENIED SAFETY PATH');
    const requestId = (0, node_crypto_1.randomUUID)();
    const result = await atlas.processPatientRequest({
        requestId,
        patientId: 'blocked-patient-001',
        symptoms: ['cough'],
        consent: {
            provided: false,
            scope: 'TRIAGE',
        },
    });
    strict_1.default.equal(result.success, false, 'Consent-denied scenario must fail safely');
    if (result.success) {
        throw new Error('Expected consent-denied scenario to fail');
    }
    strict_1.default.equal(result.code, 'CONSENT_REQUIRED');
    strict_1.default.equal(typeof result.message, 'string');
    strict_1.default.equal(result.audit.chainValid, true);
    reporter.line(`Request ID: ${result.requestId}`);
    reporter.line(`Patient ID: ${result.patientId}`);
    reporter.line(`Result: ✅ SAFE DENIAL`);
    reporter.line(`Code: ${result.code}`);
    reporter.line(`Message: ${result.message}`);
    reporter.line(`Audit Valid: ${result.audit.chainValid ? '✅ VALID' : '❌ BROKEN'}`);
    reporter.line(`Total Events: ${result.audit.totalEvents}`);
    reporter.line(`Latest Hash: ${shortHash(result.audit.latestHash)}`);
    return {
        requestId: result.requestId,
        patientId: result.patientId,
        code: result.code,
        message: result.message,
        totalAuditEvents: result.audit.totalEvents,
        latestHash: result.audit.latestHash,
    };
}
function printSystemStatus(reporter, status) {
    reporter.section('📊 SYSTEM STATUS');
    reporter.line(`Status: ${status.status}`);
    reporter.line(`Name: ${status.name}`);
    reporter.line(`Version: ${status.version}`);
    reporter.line(`Timestamp: ${status.now}`);
    reporter.line(`Uptime: ${status.uptimeSeconds}s`);
    reporter.line(`Memory RSS: ${formatMegabytes(status.memory.rssBytes)}`);
    reporter.line(`Heap Used: ${formatMegabytes(status.memory.heapUsedBytes)}`);
    reporter.line(`Audit Events: ${status.audit.totalEvents}`);
    reporter.line(`Chain Valid: ${status.audit.chainValid ? '✅ VALID' : '❌ BROKEN'}`);
    reporter.line(`Latest Hash: ${shortHash(status.audit.latestHash)}`);
}
function printAuditReport(reporter, auditReport, validation) {
    reporter.section('🔒 AUDIT REPORT');
    reporter.line(`Total Events: ${auditReport.totalEvents}`);
    reporter.line(`Chain Integrity: ${auditReport.chainValid ? '✅ VALID' : '❌ BROKEN'}`);
    reporter.line(`Latest Hash: ${shortHash(auditReport.latestHash)}`);
    reporter.line(`Validation: ${validation.valid ? '✅ VALID' : `❌ BROKEN at index ${validation.breakIndex}`}`);
    reporter.line();
    reporter.line('Recent Events:');
    for (const event of auditReport.events) {
        reporter.line(`  #${event.sequence} [${event.type}] request=${event.requestId} patient=${event.patientRef ?? 'n/a'} outcome=${event.outcome ?? 'n/a'}`);
    }
}
function printApiUsageGuide(reporter) {
    reporter.section('🚀 API ENDPOINTS');
    reporter.line('GET  /health          - System health and summary');
    reporter.line('GET  /ready           - Readiness with audit validation');
    reporter.line('POST /triage/preview  - Side-effect-free triage preview');
    reporter.line('POST /triage          - Process patient triage request');
    reporter.line('GET  /audit           - Privacy-aware audit report');
    reporter.line('GET  /audit/validate  - Full audit-chain validation');
    reporter.line('GET  /                - API documentation');
    reporter.section('📡 SAMPLE API USAGE');
    reporter.line('curl -X POST http://localhost:3000/triage \\');
    reporter.line('  -H "Content-Type: application/json" \\');
    reporter.line(`  -d '${JSON.stringify({
        patientId: 'maria-123',
        symptoms: ['chest pain', 'sweating'],
        patientContext: {
            age: 45,
            vitals: {
                hr: 110,
                tempC: 37.2,
                bp: '140/90',
            },
        },
        consent: {
            provided: true,
            scope: 'TRIAGE',
        },
    })}'`);
}
async function testAtlasAPI(options = {}) {
    const reporter = createReporter(options);
    reporter.line('🧪 ATLAS API FUNCTIONALITY TEST');
    reporter.line('='.repeat(60));
    const atlas = new api_demo_1.AtlasAPISystem();
    const successfulCases = [];
    for (const testCase of SUCCESS_CASES) {
        successfulCases.push(await runSuccessCase(atlas, reporter, testCase));
    }
    const previewCheck = await runPreviewIsolationCheck(atlas, reporter);
    const consentDeniedCheck = await runConsentDeniedCheck(atlas, reporter);
    const [systemStatus, auditReport, auditValidation] = await Promise.all([
        atlas.getSystemStatus(),
        atlas.getAuditReport(20),
        atlas.validateAuditChain(),
    ]);
    strict_1.default.equal(systemStatus.status, 'ACTIVE');
    strict_1.default.equal(auditReport.chainValid, true);
    strict_1.default.equal(auditValidation.valid, true);
    strict_1.default.ok(auditReport.totalEvents >= successfulCases.length * 5);
    printSystemStatus(reporter, systemStatus);
    printAuditReport(reporter, auditReport, auditValidation);
    reporter.section('🔗 SECURITY & PLATFORM HIGHLIGHTS');
    reporter.success('Real SHA-256 cryptographic audit chains');
    reporter.success('Context-aware medical triage');
    reporter.success('Risk-aware scoring using symptoms and patient context');
    reporter.success('Consent-aware safety controls');
    reporter.success('Preview mode without side effects');
    reporter.success('Privacy-aware audit summaries');
    reporter.success('Modern REST API surface');
    reporter.success('Rate-limiting support at the HTTP layer');
    printApiUsageGuide(reporter);
    reporter.section('🎉 ATLAS API TEST COMPLETE');
    reporter.line('The API successfully demonstrates:');
    reporter.line('• Direct service-level triage execution');
    reporter.line('• Safe emergency and non-emergency classification');
    reporter.line('• Immutable cryptographic audit trail behavior');
    reporter.line('• Explicit consent-denied handling');
    reporter.line('• Side-effect-free preview mode');
    reporter.line('• Production-oriented API contracts');
    return {
        successfulCases,
        previewCheck,
        consentDeniedCheck,
        systemStatus,
        auditReport,
        auditValidation,
    };
}
const isDirectRun = require.main === module;
if (isDirectRun) {
    void testAtlasAPI().catch((error) => {
        console.error('ATLAS API test failed:', error);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=test-api.js.map