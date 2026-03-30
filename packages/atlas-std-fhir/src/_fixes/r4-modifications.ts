// r4-modifications.ts
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Mutex } from 'async-mutex';

// ==================== Types ====================
export type VendorId = string & { __brand: 'VendorId' };
export type ResourceType = string;

export interface VendorFix {
  vendor: VendorId;
  appliesTo: ResourceType[];
  fix: (resource: any) => any;
}

// ==================== Configuration ====================
export interface R4ModificationsConfig {
  enableMetrics: boolean;
  enableEventLogging: boolean;
  enableTracing: boolean;
  defaultVendor?: VendorId;
  vendorDetectionStrategy: 'extension' | 'metadata' | 'both';
}

const defaultConfig: R4ModificationsConfig = {
  enableMetrics: true,
  enableEventLogging: true,
  enableTracing: true,
  defaultVendor: undefined,
  vendorDetectionStrategy: 'extension',
};

// ==================== Result Type ====================
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ==================== Custom Error ====================
export class R4ModificationsError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'R4ModificationsError';
  }
}

// ==================== Metrics ====================
interface MetricsSnapshot {
  resourceCount: number;
  successCount: number;
  failureCount: number;
  errorCount: number;
  lastError?: string;
  vendorDistribution: Record<string, number>;
  resourceTypeDistribution: Record<string, number>;
}

class MetricsCollector {
  private metrics = new Map<string, MetricsSnapshot>();

  recordResource(
    moduleId: string,
    resourceType: string,
    vendor: string | null,
    success: boolean,
    error?: string
  ): void {
    const key = moduleId;
    let current = this.metrics.get(key);
    if (!current) {
      current = {
        resourceCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        vendorDistribution: {},
        resourceTypeDistribution: {},
      };
    }

    current.resourceCount++;
    if (success) {
      current.successCount++;
    } else {
      current.failureCount++;
      if (error) {
        current.errorCount++;
        current.lastError = error;
      }
    }

    const vendorKey = vendor || 'unknown';
    current.vendorDistribution[vendorKey] = (current.vendorDistribution[vendorKey] || 0) + 1;
    current.resourceTypeDistribution[resourceType] = (current.resourceTypeDistribution[resourceType] || 0) + 1;

    this.metrics.set(key, current);
  }

  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    if (moduleId) {
      return this.metrics.get(moduleId) ?? {
        resourceCount: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
        vendorDistribution: {},
        resourceTypeDistribution: {},
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
  resourceType: string;
  vendor: string | null;
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

// ==================== Vendor Registry ====================
interface VendorDefinition {
  id: VendorId;
  name: string;
  detectionPatterns: {
    extensionUrls?: string[];
    metaTags?: string[];
    sourceIdentifier?: string;
  };
  fixes: VendorFix[];
  fieldMappings: Record<string, string>;
}

class VendorRegistry {
  private vendors = new Map<VendorId, VendorDefinition>();

  register(definition: VendorDefinition): void {
    this.vendors.set(definition.id, definition);
  }

  get(vendorId: VendorId): VendorDefinition | undefined {
    return this.vendors.get(vendorId);
  }

  getAll(): VendorDefinition[] {
    return Array.from(this.vendors.values());
  }

  detectVendor(resource: any, strategy: string): VendorId | null {
    if (strategy === 'extension' || strategy === 'both') {
      for (const vendor of this.vendors.values()) {
        if (resource.extension && vendor.detectionPatterns.extensionUrls) {
          const hasMatch = resource.extension.some((ext: any) =>
            vendor.detectionPatterns.extensionUrls!.some(url => ext.url?.includes(url))
          );
          if (hasMatch) return vendor.id;
        }
      }
    }

    if (strategy === 'metadata' || strategy === 'both') {
      // Example: check resource.meta.tag for vendor-specific tags
      if (resource.meta?.tag) {
        for (const vendor of this.vendors.values()) {
          if (vendor.detectionPatterns.metaTags) {
            const hasMatch = resource.meta.tag.some((tag: any) =>
              vendor.detectionPatterns.metaTags!.some(t => tag.code === t || tag.display === t)
            );
            if (hasMatch) return vendor.id;
          }
        }
      }

      // Example: check source identifier like resource.identifier.system
      if (resource.identifier) {
        for (const vendor of this.vendors.values()) {
          if (vendor.detectionPatterns.sourceIdentifier) {
            const hasMatch = resource.identifier.some((id: any) =>
              id.system?.includes(vendor.detectionPatterns.sourceIdentifier!)
            );
            if (hasMatch) return vendor.id;
          }
        }
      }
    }

    return null;
  }

  getFixes(vendorId: VendorId, resourceType: string): VendorFix[] {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) return [];
    return vendor.fixes.filter(fix => fix.appliesTo.includes(resourceType));
  }

  mapFields(resource: any, vendorId: VendorId): any {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) return resource;

    const mapped = { ...resource };
    for (const [vendorField, fhirField] of Object.entries(vendor.fieldMappings)) {
      if (mapped[vendorField] !== undefined) {
        mapped[fhirField] = mapped[vendorField];
        delete mapped[vendorField];
      }
    }
    return mapped;
  }
}

// ==================== Predefined Vendors ====================
// Helper functions for vendor-specific conversions
function epicStatusToFhirStatus(epicStatus: string): string {
  const statusMap: Record<string, string> = {
    COMPLETED: 'completed',
    IN_PROGRESS: 'in-progress',
    CANCELLED: 'cancelled',
    READY: 'ready',
    RECEIVED: 'received',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  };
  return statusMap[epicStatus] || epicStatus.toLowerCase();
}

function cernerEncounterTypeToFhirClass(cernerType: any): any {
  const mapping: Record<string, any> = {
    AMB: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
    IMP: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'IMP', display: 'inpatient encounter' },
    EMER: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER', display: 'emergency' },
  };
  return mapping[cernerType.code] || cernerType;
}

const epicVendor: VendorDefinition = {
  id: 'epic' as VendorId,
  name: 'Epic Systems',
  detectionPatterns: {
    extensionUrls: ['fhir.epic.com', 'epic.com'],
    metaTags: ['EPIC', 'EPIC-EHR'],
  },
  fixes: [
    {
      vendor: 'epic' as VendorId,
      appliesTo: ['Patient', 'Observation', 'Condition', 'MedicationRequest', 'Task'],
      fix: (resource: any) => {
        if (resource.extension) {
          const normalizedExtensions = resource.extension.filter((ext: any) => {
            return !ext.url?.includes('fhir.epic.com') && !ext.url?.includes('epic.com');
          });

          const epicExtensions = resource.extension.filter((ext: any) =>
            ext.url?.includes('fhir.epic.com') || ext.url?.includes('epic.com')
          );

          const workflowStatusExt = epicExtensions.find((ext: any) =>
            ext.url?.includes('workflow-status')
          );

          if (workflowStatusExt && resource.resourceType === 'Task') {
            resource.status = epicStatusToFhirStatus(workflowStatusExt.valueString);
          }

          resource.extension = normalizedExtensions.length > 0 ? normalizedExtensions : undefined;
        }
        return resource;
      },
    },
  ],
  fieldMappings: {
    workflowStatus: 'status',
    department: 'serviceType',
    visitType: 'type',
  },
};

const cernerVendor: VendorDefinition = {
  id: 'cerner' as VendorId,
  name: 'Cerner Corporation',
  detectionPatterns: {
    extensionUrls: ['cerner.com'],
    metaTags: ['CERNER', 'CERNER-EHR'],
  },
  fixes: [
    {
      vendor: 'cerner' as VendorId,
      appliesTo: ['Patient', 'Observation', 'Condition', 'MedicationRequest', 'Encounter'],
      fix: (resource: any) => {
        if (resource.extension) {
          const normalizedExtensions = resource.extension.filter((ext: any) => {
            return !ext.url?.includes('cerner.com');
          });

          const cernerExtensions = resource.extension.filter((ext: any) =>
            ext.url?.includes('cerner.com')
          );

          const encounterTypeExt = cernerExtensions.find((ext: any) =>
            ext.url?.includes('encounter-type')
          );

          if (encounterTypeExt && resource.resourceType === 'Encounter') {
            resource.class = cernerEncounterTypeToFhirClass(encounterTypeExt.valueCoding);
          }

          resource.extension = normalizedExtensions.length > 0 ? normalizedExtensions : undefined;
        }
        return resource;
      },
    },
  ],
  fieldMappings: {
    encounterType: 'class',
    patientClass: 'class',
    orderStatus: 'status',
  },
};

// ==================== Main R4 Modifications Service ====================
export class R4ModificationsService {
  private config: R4ModificationsConfig;
  private registry: VendorRegistry;
  private metrics: MetricsCollector;
  private logger: EventLogger;
  private tracer: Tracer;

  constructor(config: Partial<R4ModificationsConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.registry = new VendorRegistry();
    this.metrics = new MetricsCollector();
    this.logger = new EventLogger();
    this.tracer = globalTracer;

    // Register built-in vendors
    this.registry.register(epicVendor);
    this.registry.register(cernerVendor);
  }

  /**
   * Normalizes a FHIR resource by detecting vendor and applying appropriate fixes and field mappings.
   */
  normalizeResource(resource: any): Result<any> {
    const span = this.tracer.startSpan('r4Modifications.normalizeResource');
    span.setAttribute('resourceType', resource?.resourceType);
    const startTime = Date.now();

    try {
      if (!resource || typeof resource !== 'object') {
        throw new R4ModificationsError('INVALID_INPUT', 'Resource must be a non-null object');
      }

      // Detect vendor
      let vendor = this.registry.detectVendor(resource, this.config.vendorDetectionStrategy);
      if (!vendor && this.config.defaultVendor) {
        vendor = this.config.defaultVendor;
      }

      // Apply fixes
      let fixed = { ...resource };
      if (vendor) {
        const fixes = this.registry.getFixes(vendor, fixed.resourceType);
        for (const fix of fixes) {
          fixed = fix.fix(fixed);
        }
        fixed = this.registry.mapFields(fixed, vendor);
      }

      const duration = Date.now() - startTime;
      if (this.config.enableMetrics) {
        this.metrics.recordResource('r4-modifications', fixed.resourceType, vendor || null, true);
      }
      if (this.config.enableEventLogging) {
        this.logger.log({
          id: uuidv4(),
          type: 'RESOURCE_NORMALIZED',
          timestamp: new Date().toISOString(),
          source: 'r4-modifications',
          resourceType: fixed.resourceType,
          vendor: vendor || null,
          data: { originalResourceType: resource.resourceType },
          success: true,
        });
      }
      span.end();
      return { ok: true, value: fixed };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (this.config.enableMetrics) {
        this.metrics.recordResource('r4-modifications', resource?.resourceType || 'unknown', null, false, error.message);
      }
      if (this.config.enableEventLogging) {
        this.logger.log({
          id: uuidv4(),
          type: 'RESOURCE_NORMALIZE_FAILED',
          timestamp: new Date().toISOString(),
          source: 'r4-modifications',
          resourceType: resource?.resourceType || 'unknown',
          vendor: null,
          data: { error: error.message },
          success: false,
        });
      }
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Apply fixes only (without field mapping) using a specified vendor.
   */
  applyVendorFixes(resource: any, vendor?: string): Result<any> {
    const span = this.tracer.startSpan('r4Modifications.applyVendorFixes');
    span.setAttribute('resourceType', resource?.resourceType);
    span.setAttribute('vendor', vendor || 'auto');

    try {
      if (!resource || typeof resource !== 'object') {
        throw new R4ModificationsError('INVALID_INPUT', 'Resource must be a non-null object');
      }

      let targetVendor: VendorId | null = null;
      if (vendor) {
        targetVendor = vendor as VendorId;
        if (!this.registry.get(targetVendor)) {
          throw new R4ModificationsError('VENDOR_NOT_FOUND', `Vendor ${vendor} not registered`);
        }
      } else {
        targetVendor = this.registry.detectVendor(resource, this.config.vendorDetectionStrategy);
      }

      let fixed = { ...resource };
      if (targetVendor) {
        const fixes = this.registry.getFixes(targetVendor, fixed.resourceType);
        for (const fix of fixes) {
          fixed = fix.fix(fixed);
        }
      }

      span.end();
      return { ok: true, value: fixed };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Map fields only (without fixes) using a specified vendor.
   */
  mapVendorFields(resource: any, vendor: string): Result<any> {
    const span = this.tracer.startSpan('r4Modifications.mapVendorFields');
    span.setAttribute('vendor', vendor);

    try {
      if (!resource || typeof resource !== 'object') {
        throw new R4ModificationsError('INVALID_INPUT', 'Resource must be a non-null object');
      }

      const vendorId = vendor as VendorId;
      const mapped = this.registry.mapFields(resource, vendorId);
      span.end();
      return { ok: true, value: mapped };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      span.recordException(error);
      span.end();
      return { ok: false, error };
    }
  }

  /**
   * Detect vendor from a resource.
   */
  detectVendor(resource: any): string | null {
    const span = this.tracer.startSpan('r4Modifications.detectVendor');
    try {
      const vendor = this.registry.detectVendor(resource, this.config.vendorDetectionStrategy);
      span.end();
      return vendor;
    } catch (err) {
      span.end();
      return null;
    }
  }

  /**
   * Register a custom vendor.
   */
  registerVendor(definition: VendorDefinition): void {
    this.registry.register(definition);
  }

  /**
   * Get metrics.
   */
  getMetrics(moduleId?: string): MetricsSnapshot | Map<string, MetricsSnapshot> {
    return this.metrics.getMetrics(moduleId);
  }

  /**
   * Get event logs.
   */
  getEvents(): EventLog[] {
    return this.logger.getEvents();
  }

  /**
   * Get agent information.
   */
  getInfo(): { name: string; version: string; capabilities: string[] } {
    return {
      name: 'FHIR R4 Modifications Service',
      version: '1.0.0',
      capabilities: [
        'vendor_detection',
        'vendor_specific_fixes',
        'field_mapping',
        'resource_normalization',
        'observability',
        'extensible_registry',
      ],
    };
  }
}

// ==================== Singleton Instance (Optional) ====================
let defaultService: R4ModificationsService | null = null;

export function getDefaultR4ModificationsService(): R4ModificationsService {
  if (!defaultService) {
    defaultService = new R4ModificationsService();
  }
  return defaultService;
}

// ==================== Convenience Functions ====================
export function normalizeResource(resource: any): Result<any> {
  return getDefaultR4ModificationsService().normalizeResource(resource);
}

export function applyVendorFixes(resource: any, vendor?: string): Result<any> {
  return getDefaultR4ModificationsService().applyVendorFixes(resource, vendor);
}

export function mapVendorFields(resource: any, vendor: string): Result<any> {
  return getDefaultR4ModificationsService().mapVendorFields(resource, vendor);
}

export function detectVendor(resource: any): string | null {
  return getDefaultR4ModificationsService().detectVendor(resource);
}