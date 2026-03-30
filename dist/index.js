"use strict";
// ATLAS - Agent Toolkit for Lifecycle-Aware Systems
// Healthcare AI Endgame: Interoperable Care-Coordination Agents
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Atlas_environment, _Atlas_systemId, _Atlas_initializedAt, _Atlas_components;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atlas = exports.ATLAS_CAPABILITIES = exports.DEFAULT_FHIR_BASE_URL = exports.DEFAULT_SYSTEM_ID = exports.DEFAULT_ENVIRONMENT = exports.ATLAS_VERSION = exports.ATLAS_NAME = exports.runMariaScenario = exports.CareCoordinator = exports.createCareCoordinator = exports.PatientProxyAgent = exports.createPatientProxyAgent = exports.TriageAgent = exports.createTriageAgent = exports.IdentityBridge = exports.createIdentityBridge = exports.AuditLogger = exports.createAuditLogger = exports.ConsentEngine = exports.createConsentEngine = exports.AtlasFhir = exports.createAtlasFhir = void 0;
exports.createAtlas = createAtlas;
const fhir_1 = require("@atlas-std/fhir");
const consent_1 = require("@atlas-tool/consent");
const audit_1 = require("@atlas-tool/audit");
const identity_1 = require("@atlas-tool/identity");
const triage_1 = require("@atlas-agent/triage");
const proxy_1 = require("@atlas-agent/proxy");
const coordinator_1 = require("@atlas-agent/coordinator");
const maria_scenario_1 = require("./demo/maria-scenario");
// Re-exports
var fhir_2 = require("@atlas-std/fhir");
Object.defineProperty(exports, "createAtlasFhir", { enumerable: true, get: function () { return fhir_2.createAtlasFhir; } });
Object.defineProperty(exports, "AtlasFhir", { enumerable: true, get: function () { return fhir_2.AtlasFhir; } });
var consent_2 = require("@atlas-tool/consent");
Object.defineProperty(exports, "createConsentEngine", { enumerable: true, get: function () { return consent_2.createConsentEngine; } });
Object.defineProperty(exports, "ConsentEngine", { enumerable: true, get: function () { return consent_2.ConsentEngine; } });
var audit_2 = require("@atlas-tool/audit");
Object.defineProperty(exports, "createAuditLogger", { enumerable: true, get: function () { return audit_2.createAuditLogger; } });
Object.defineProperty(exports, "AuditLogger", { enumerable: true, get: function () { return audit_2.AuditLogger; } });
var identity_2 = require("@atlas-tool/identity");
Object.defineProperty(exports, "createIdentityBridge", { enumerable: true, get: function () { return identity_2.createIdentityBridge; } });
Object.defineProperty(exports, "IdentityBridge", { enumerable: true, get: function () { return identity_2.IdentityBridge; } });
var triage_2 = require("@atlas-agent/triage");
Object.defineProperty(exports, "createTriageAgent", { enumerable: true, get: function () { return triage_2.createTriageAgent; } });
Object.defineProperty(exports, "TriageAgent", { enumerable: true, get: function () { return triage_2.TriageAgent; } });
var proxy_2 = require("@atlas-agent/proxy");
Object.defineProperty(exports, "createPatientProxyAgent", { enumerable: true, get: function () { return proxy_2.createPatientProxyAgent; } });
Object.defineProperty(exports, "PatientProxyAgent", { enumerable: true, get: function () { return proxy_2.PatientProxyAgent; } });
var coordinator_2 = require("@atlas-agent/coordinator");
Object.defineProperty(exports, "createCareCoordinator", { enumerable: true, get: function () { return coordinator_2.createCareCoordinator; } });
Object.defineProperty(exports, "CareCoordinator", { enumerable: true, get: function () { return coordinator_2.CareCoordinator; } });
var maria_scenario_2 = require("./demo/maria-scenario");
Object.defineProperty(exports, "runMariaScenario", { enumerable: true, get: function () { return maria_scenario_2.runMariaScenario; } });
exports.ATLAS_NAME = 'ATLAS';
exports.ATLAS_VERSION = '2.0.0';
exports.DEFAULT_ENVIRONMENT = 'development';
exports.DEFAULT_SYSTEM_ID = 'atlas-system';
exports.DEFAULT_FHIR_BASE_URL = 'https://hapi.fhir.org/baseR4';
exports.ATLAS_CAPABILITIES = [
    'fhir_interoperability',
    'consent_management',
    'audit_logging',
    'identity_brokerage',
    'agent_coordination',
    'patient_communication',
    'triage_assessment',
    'care_coordination',
];
const DEFAULT_FACTORIES = {
    createAtlasFhir: fhir_1.createAtlasFhir,
    createConsentEngine: consent_1.createConsentEngine,
    createAuditLogger: audit_1.createAuditLogger,
    createIdentityBridge: identity_1.createIdentityBridge,
    createTriageAgent: triage_1.createTriageAgent,
    createPatientProxyAgent: proxy_1.createPatientProxyAgent,
    createCareCoordinator: coordinator_1.createCareCoordinator,
};
const COMPONENT_NAMES = Object.freeze([
    'fhir',
    'consent',
    'audit',
    'identity',
    'agents.triage',
    'agents.proxy',
    'agents.coordinator',
]);
function normalizeNonEmptyString(value, fallback) {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
function resolveFactories(overrides) {
    return {
        ...DEFAULT_FACTORIES,
        ...overrides,
    };
}
function createDefaultFhirConfig() {
    return {
        baseUrl: exports.DEFAULT_FHIR_BASE_URL,
    };
}
function createComponents(config) {
    const factories = resolveFactories(config.factories);
    const fhir = factories.createAtlasFhir(config.fhir ?? createDefaultFhirConfig());
    const consent = factories.createConsentEngine();
    const audit = factories.createAuditLogger({
        systemId: normalizeNonEmptyString(config.systemId, exports.DEFAULT_SYSTEM_ID),
        environment: normalizeNonEmptyString(config.environment, exports.DEFAULT_ENVIRONMENT),
    });
    const identity = factories.createIdentityBridge();
    const agents = Object.freeze({
        triage: factories.createTriageAgent(),
        proxy: factories.createPatientProxyAgent(),
        coordinator: factories.createCareCoordinator(),
    });
    return Object.freeze({
        fhir,
        consent,
        audit,
        identity,
        agents,
    });
}
class Atlas {
    constructor(config = {}) {
        _Atlas_environment.set(this, void 0);
        _Atlas_systemId.set(this, void 0);
        _Atlas_initializedAt.set(this, void 0);
        _Atlas_components.set(this, void 0);
        __classPrivateFieldSet(this, _Atlas_environment, normalizeNonEmptyString(config.environment, exports.DEFAULT_ENVIRONMENT), "f");
        __classPrivateFieldSet(this, _Atlas_systemId, normalizeNonEmptyString(config.systemId, exports.DEFAULT_SYSTEM_ID), "f");
        __classPrivateFieldSet(this, _Atlas_initializedAt, new Date().toISOString(), "f");
        __classPrivateFieldSet(this, _Atlas_components, createComponents({
            ...config,
            environment: __classPrivateFieldGet(this, _Atlas_environment, "f"),
            systemId: __classPrivateFieldGet(this, _Atlas_systemId, "f"),
        }), "f");
    }
    static create(config = {}) {
        return new Atlas(config);
    }
    get components() {
        return __classPrivateFieldGet(this, _Atlas_components, "f");
    }
    get fhir() {
        return __classPrivateFieldGet(this, _Atlas_components, "f").fhir;
    }
    get consent() {
        return __classPrivateFieldGet(this, _Atlas_components, "f").consent;
    }
    get audit() {
        return __classPrivateFieldGet(this, _Atlas_components, "f").audit;
    }
    get identity() {
        return __classPrivateFieldGet(this, _Atlas_components, "f").identity;
    }
    get agents() {
        return __classPrivateFieldGet(this, _Atlas_components, "f").agents;
    }
    get environment() {
        return __classPrivateFieldGet(this, _Atlas_environment, "f");
    }
    get systemId() {
        return __classPrivateFieldGet(this, _Atlas_systemId, "f");
    }
    get initializedAt() {
        return __classPrivateFieldGet(this, _Atlas_initializedAt, "f");
    }
    getComponentNames() {
        return COMPONENT_NAMES;
    }
    async runDemo(options) {
        return (0, maria_scenario_1.runMariaScenario)(options);
    }
    getSystemStatus() {
        return {
            atlas: {
                name: exports.ATLAS_NAME,
                version: exports.ATLAS_VERSION,
                status: 'operational',
                environment: __classPrivateFieldGet(this, _Atlas_environment, "f"),
                systemId: __classPrivateFieldGet(this, _Atlas_systemId, "f"),
                initializedAt: __classPrivateFieldGet(this, _Atlas_initializedAt, "f"),
                components: COMPONENT_NAMES,
            },
            compliance: {
                hipaa: 'compliant',
                fhir: 'r4',
                smart: 'enabled',
            },
            capabilities: exports.ATLAS_CAPABILITIES,
        };
    }
    toJSON() {
        return this.getSystemStatus();
    }
}
exports.Atlas = Atlas;
_Atlas_environment = new WeakMap(), _Atlas_systemId = new WeakMap(), _Atlas_initializedAt = new WeakMap(), _Atlas_components = new WeakMap();
function createAtlas(config = {}) {
    return new Atlas(config);
}
exports.default = Atlas;
//# sourceMappingURL=index.js.map