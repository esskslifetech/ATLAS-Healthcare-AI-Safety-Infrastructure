"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R4ModificationsService = exports.R4ModificationsError = void 0;
exports.setTracer = setTracer;
exports.getDefaultR4ModificationsService = getDefaultR4ModificationsService;
exports.normalizeResource = normalizeResource;
exports.applyVendorFixes = applyVendorFixes;
exports.mapVendorFields = mapVendorFields;
exports.detectVendor = detectVendor;
// r4-modifications.ts
const uuid_1 = require("uuid");
const defaultConfig = {
    enableMetrics: true,
    enableEventLogging: true,
    enableTracing: true,
    defaultVendor: undefined,
    vendorDetectionStrategy: 'extension',
};
// ==================== Custom Error ====================
class R4ModificationsError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'R4ModificationsError';
    }
}
exports.R4ModificationsError = R4ModificationsError;
class MetricsCollector {
    constructor() {
        this.metrics = new Map();
    }
    recordResource(moduleId, resourceType, vendor, success, error) {
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
        }
        else {
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
    getMetrics(moduleId) {
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
class VendorRegistry {
    constructor() {
        this.vendors = new Map();
    }
    register(definition) {
        this.vendors.set(definition.id, definition);
    }
    get(vendorId) {
        return this.vendors.get(vendorId);
    }
    getAll() {
        return Array.from(this.vendors.values());
    }
    detectVendor(resource, strategy) {
        if (strategy === 'extension' || strategy === 'both') {
            for (const vendor of this.vendors.values()) {
                if (resource.extension && vendor.detectionPatterns.extensionUrls) {
                    const hasMatch = resource.extension.some((ext) => vendor.detectionPatterns.extensionUrls.some(url => ext.url?.includes(url)));
                    if (hasMatch)
                        return vendor.id;
                }
            }
        }
        if (strategy === 'metadata' || strategy === 'both') {
            // Example: check resource.meta.tag for vendor-specific tags
            if (resource.meta?.tag) {
                for (const vendor of this.vendors.values()) {
                    if (vendor.detectionPatterns.metaTags) {
                        const hasMatch = resource.meta.tag.some((tag) => vendor.detectionPatterns.metaTags.some(t => tag.code === t || tag.display === t));
                        if (hasMatch)
                            return vendor.id;
                    }
                }
            }
            // Example: check source identifier like resource.identifier.system
            if (resource.identifier) {
                for (const vendor of this.vendors.values()) {
                    if (vendor.detectionPatterns.sourceIdentifier) {
                        const hasMatch = resource.identifier.some((id) => id.system?.includes(vendor.detectionPatterns.sourceIdentifier));
                        if (hasMatch)
                            return vendor.id;
                    }
                }
            }
        }
        return null;
    }
    getFixes(vendorId, resourceType) {
        const vendor = this.vendors.get(vendorId);
        if (!vendor)
            return [];
        return vendor.fixes.filter(fix => fix.appliesTo.includes(resourceType));
    }
    mapFields(resource, vendorId) {
        const vendor = this.vendors.get(vendorId);
        if (!vendor)
            return resource;
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
function epicStatusToFhirStatus(epicStatus) {
    const statusMap = {
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
function cernerEncounterTypeToFhirClass(cernerType) {
    const mapping = {
        AMB: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
        IMP: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'IMP', display: 'inpatient encounter' },
        EMER: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'EMER', display: 'emergency' },
    };
    return mapping[cernerType.code] || cernerType;
}
const epicVendor = {
    id: 'epic',
    name: 'Epic Systems',
    detectionPatterns: {
        extensionUrls: ['fhir.epic.com', 'epic.com'],
        metaTags: ['EPIC', 'EPIC-EHR'],
    },
    fixes: [
        {
            vendor: 'epic',
            appliesTo: ['Patient', 'Observation', 'Condition', 'MedicationRequest', 'Task'],
            fix: (resource) => {
                if (resource.extension) {
                    const normalizedExtensions = resource.extension.filter((ext) => {
                        return !ext.url?.includes('fhir.epic.com') && !ext.url?.includes('epic.com');
                    });
                    const epicExtensions = resource.extension.filter((ext) => ext.url?.includes('fhir.epic.com') || ext.url?.includes('epic.com'));
                    const workflowStatusExt = epicExtensions.find((ext) => ext.url?.includes('workflow-status'));
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
const cernerVendor = {
    id: 'cerner',
    name: 'Cerner Corporation',
    detectionPatterns: {
        extensionUrls: ['cerner.com'],
        metaTags: ['CERNER', 'CERNER-EHR'],
    },
    fixes: [
        {
            vendor: 'cerner',
            appliesTo: ['Patient', 'Observation', 'Condition', 'MedicationRequest', 'Encounter'],
            fix: (resource) => {
                if (resource.extension) {
                    const normalizedExtensions = resource.extension.filter((ext) => {
                        return !ext.url?.includes('cerner.com');
                    });
                    const cernerExtensions = resource.extension.filter((ext) => ext.url?.includes('cerner.com'));
                    const encounterTypeExt = cernerExtensions.find((ext) => ext.url?.includes('encounter-type'));
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
class R4ModificationsService {
    constructor(config = {}) {
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
    normalizeResource(resource) {
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
                    id: (0, uuid_1.v4)(),
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (this.config.enableMetrics) {
                this.metrics.recordResource('r4-modifications', resource?.resourceType || 'unknown', null, false, error.message);
            }
            if (this.config.enableEventLogging) {
                this.logger.log({
                    id: (0, uuid_1.v4)(),
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
    applyVendorFixes(resource, vendor) {
        const span = this.tracer.startSpan('r4Modifications.applyVendorFixes');
        span.setAttribute('resourceType', resource?.resourceType);
        span.setAttribute('vendor', vendor || 'auto');
        try {
            if (!resource || typeof resource !== 'object') {
                throw new R4ModificationsError('INVALID_INPUT', 'Resource must be a non-null object');
            }
            let targetVendor = null;
            if (vendor) {
                targetVendor = vendor;
                if (!this.registry.get(targetVendor)) {
                    throw new R4ModificationsError('VENDOR_NOT_FOUND', `Vendor ${vendor} not registered`);
                }
            }
            else {
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
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    /**
     * Map fields only (without fixes) using a specified vendor.
     */
    mapVendorFields(resource, vendor) {
        const span = this.tracer.startSpan('r4Modifications.mapVendorFields');
        span.setAttribute('vendor', vendor);
        try {
            if (!resource || typeof resource !== 'object') {
                throw new R4ModificationsError('INVALID_INPUT', 'Resource must be a non-null object');
            }
            const vendorId = vendor;
            const mapped = this.registry.mapFields(resource, vendorId);
            span.end();
            return { ok: true, value: mapped };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            span.recordException(error);
            span.end();
            return { ok: false, error };
        }
    }
    /**
     * Detect vendor from a resource.
     */
    detectVendor(resource) {
        const span = this.tracer.startSpan('r4Modifications.detectVendor');
        try {
            const vendor = this.registry.detectVendor(resource, this.config.vendorDetectionStrategy);
            span.end();
            return vendor;
        }
        catch (err) {
            span.end();
            return null;
        }
    }
    /**
     * Register a custom vendor.
     */
    registerVendor(definition) {
        this.registry.register(definition);
    }
    /**
     * Get metrics.
     */
    getMetrics(moduleId) {
        return this.metrics.getMetrics(moduleId);
    }
    /**
     * Get event logs.
     */
    getEvents() {
        return this.logger.getEvents();
    }
    /**
     * Get agent information.
     */
    getInfo() {
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
exports.R4ModificationsService = R4ModificationsService;
// ==================== Singleton Instance (Optional) ====================
let defaultService = null;
function getDefaultR4ModificationsService() {
    if (!defaultService) {
        defaultService = new R4ModificationsService();
    }
    return defaultService;
}
// ==================== Convenience Functions ====================
function normalizeResource(resource) {
    return getDefaultR4ModificationsService().normalizeResource(resource);
}
function applyVendorFixes(resource, vendor) {
    return getDefaultR4ModificationsService().applyVendorFixes(resource, vendor);
}
function mapVendorFields(resource, vendor) {
    return getDefaultR4ModificationsService().mapVendorFields(resource, vendor);
}
function detectVendor(resource) {
    return getDefaultR4ModificationsService().detectVendor(resource);
}
//# sourceMappingURL=r4-modifications.js.map