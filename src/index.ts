// ATLAS - Agent Toolkit for Lifecycle-Aware Systems
// Healthcare AI Endgame: Interoperable Care-Coordination Agents

import { createAtlasFhir } from '@atlas-std/fhir';
import { createConsentEngine } from '@atlas-tool/consent';
import { createAuditLogger } from '@atlas-tool/audit';
import { createIdentityBridge } from '@atlas-tool/identity';

import { createTriageAgent } from '@atlas-agent/triage';
import { createPatientProxyAgent } from '@atlas-agent/proxy';
import { createCareCoordinator } from '@atlas-agent/coordinator';

import { runMariaScenario } from './demo/maria-scenario';

// Re-exports
export { createAtlasFhir, AtlasFhir } from '@atlas-std/fhir';
export { createConsentEngine, ConsentEngine } from '@atlas-tool/consent';
export { createAuditLogger, AuditLogger } from '@atlas-tool/audit';
export { createIdentityBridge, IdentityBridge } from '@atlas-tool/identity';

export { createTriageAgent, TriageAgent } from '@atlas-agent/triage';
export { createPatientProxyAgent, PatientProxyAgent } from '@atlas-agent/proxy';
export { createCareCoordinator, CareCoordinator } from '@atlas-agent/coordinator';

export { runMariaScenario } from './demo/maria-scenario';

export const ATLAS_NAME = 'ATLAS' as const;
export const ATLAS_VERSION = '2.0.0' as const;
export const DEFAULT_ENVIRONMENT = 'development' as const;
export const DEFAULT_SYSTEM_ID = 'atlas-system' as const;
export const DEFAULT_FHIR_BASE_URL = 'https://hapi.fhir.org/baseR4' as const;

export const ATLAS_CAPABILITIES = [
  'fhir_interoperability',
  'consent_management',
  'audit_logging',
  'identity_brokerage',
  'agent_coordination',
  'patient_communication',
  'triage_assessment',
  'care_coordination',
] as const;

export type AtlasCapability = (typeof ATLAS_CAPABILITIES)[number];

type AtlasFhirClient = ReturnType<typeof createAtlasFhir>;
type AtlasConsentEngine = ReturnType<typeof createConsentEngine>;
type AtlasAuditLogger = ReturnType<typeof createAuditLogger>;
type AtlasIdentityBridge = ReturnType<typeof createIdentityBridge>;
type AtlasTriageAgent = ReturnType<typeof createTriageAgent>;
type AtlasPatientProxyAgent = ReturnType<typeof createPatientProxyAgent>;
type AtlasCareCoordinator = ReturnType<typeof createCareCoordinator>;

type AtlasFhirConfig = Parameters<typeof createAtlasFhir>[0];
type MariaScenarioOptions = Parameters<typeof runMariaScenario>[0];
type MariaScenarioResult = Awaited<ReturnType<typeof runMariaScenario>>;

export interface AtlasAgents {
  readonly triage: AtlasTriageAgent;
  readonly proxy: AtlasPatientProxyAgent;
  readonly coordinator: AtlasCareCoordinator;
}

export interface AtlasComponents {
  readonly fhir: AtlasFhirClient;
  readonly consent: AtlasConsentEngine;
  readonly audit: AtlasAuditLogger;
  readonly identity: AtlasIdentityBridge;
  readonly agents: AtlasAgents;
}

export interface AtlasFactories {
  readonly createAtlasFhir: typeof createAtlasFhir;
  readonly createConsentEngine: typeof createConsentEngine;
  readonly createAuditLogger: typeof createAuditLogger;
  readonly createIdentityBridge: typeof createIdentityBridge;
  readonly createTriageAgent: typeof createTriageAgent;
  readonly createPatientProxyAgent: typeof createPatientProxyAgent;
  readonly createCareCoordinator: typeof createCareCoordinator;
}

export interface AtlasConfig {
  readonly fhir?: AtlasFhirConfig;
  readonly environment?: string;
  readonly systemId?: string;
  readonly factories?: Partial<AtlasFactories>;
}

export interface AtlasComplianceStatus {
  readonly hipaa: 'compliant';
  readonly fhir: 'r4';
  readonly smart: 'enabled';
}

export interface AtlasSystemStatus {
  readonly atlas: {
    readonly name: typeof ATLAS_NAME;
    readonly version: typeof ATLAS_VERSION;
    readonly status: 'operational';
    readonly environment: string;
    readonly systemId: string;
    readonly initializedAt: string;
    readonly components: readonly string[];
  };
  readonly compliance: AtlasComplianceStatus;
  readonly capabilities: readonly AtlasCapability[];
}

const DEFAULT_FACTORIES: AtlasFactories = {
  createAtlasFhir,
  createConsentEngine,
  createAuditLogger,
  createIdentityBridge,
  createTriageAgent,
  createPatientProxyAgent,
  createCareCoordinator,
};

const COMPONENT_NAMES = Object.freeze([
  'fhir',
  'consent',
  'audit',
  'identity',
  'agents.triage',
  'agents.proxy',
  'agents.coordinator',
] as const);

function normalizeNonEmptyString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function resolveFactories(overrides?: Partial<AtlasFactories>): AtlasFactories {
  return {
    ...DEFAULT_FACTORIES,
    ...overrides,
  };
}

function createDefaultFhirConfig(): AtlasFhirConfig {
  return {
    baseUrl: DEFAULT_FHIR_BASE_URL,
  } as AtlasFhirConfig;
}

function createComponents(config: AtlasConfig): AtlasComponents {
  const factories = resolveFactories(config.factories);

  const fhir = factories.createAtlasFhir(config.fhir ?? createDefaultFhirConfig());
  const consent = factories.createConsentEngine();
  const audit = factories.createAuditLogger({
    systemId: normalizeNonEmptyString(config.systemId, DEFAULT_SYSTEM_ID),
    environment: normalizeNonEmptyString(config.environment, DEFAULT_ENVIRONMENT),
  });
  const identity = factories.createIdentityBridge();

  const agents: AtlasAgents = Object.freeze({
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

export class Atlas {
  readonly #environment: string;
  readonly #systemId: string;
  readonly #initializedAt: string;
  readonly #components: AtlasComponents;

  constructor(config: AtlasConfig = {}) {
    this.#environment = normalizeNonEmptyString(config.environment, DEFAULT_ENVIRONMENT);
    this.#systemId = normalizeNonEmptyString(config.systemId, DEFAULT_SYSTEM_ID);
    this.#initializedAt = new Date().toISOString();
    this.#components = createComponents({
      ...config,
      environment: this.#environment,
      systemId: this.#systemId,
    });
  }

  static create(config: AtlasConfig = {}): Atlas {
    return new Atlas(config);
  }

  get components(): AtlasComponents {
    return this.#components;
  }

  get fhir(): AtlasFhirClient {
    return this.#components.fhir;
  }

  get consent(): AtlasConsentEngine {
    return this.#components.consent;
  }

  get audit(): AtlasAuditLogger {
    return this.#components.audit;
  }

  get identity(): AtlasIdentityBridge {
    return this.#components.identity;
  }

  get agents(): AtlasAgents {
    return this.#components.agents;
  }

  get environment(): string {
    return this.#environment;
  }

  get systemId(): string {
    return this.#systemId;
  }

  get initializedAt(): string {
    return this.#initializedAt;
  }

  getComponentNames(): readonly string[] {
    return COMPONENT_NAMES;
  }

  async runDemo(options?: MariaScenarioOptions): Promise<MariaScenarioResult> {
    return runMariaScenario(options);
  }

  getSystemStatus(): AtlasSystemStatus {
    return {
      atlas: {
        name: ATLAS_NAME,
        version: ATLAS_VERSION,
        status: 'operational',
        environment: this.#environment,
        systemId: this.#systemId,
        initializedAt: this.#initializedAt,
        components: COMPONENT_NAMES,
      },
      compliance: {
        hipaa: 'compliant',
        fhir: 'r4',
        smart: 'enabled',
      },
      capabilities: ATLAS_CAPABILITIES,
    };
  }

  toJSON(): AtlasSystemStatus {
    return this.getSystemStatus();
  }
}

export function createAtlas(config: AtlasConfig = {}): Atlas {
  return new Atlas(config);
}

export default Atlas;