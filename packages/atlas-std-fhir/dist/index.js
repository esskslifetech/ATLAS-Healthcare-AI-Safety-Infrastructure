"use strict";
// ATLAS FHIR Standard Library
// Universal adapter for HL7 FHIR R4 resources
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtlasFhir = exports.BundleResource = exports.ServiceRequestSchema = exports.ReferralRequestResource = exports.EncounterSchema = exports.EncounterResource = exports.MedicationRequestSchema = exports.MedicationRequestResource = exports.ConditionSchema = exports.ConditionResource = exports.ObservationSchema = exports.ObservationResource = exports.PatientSchema = exports.PatientResource = exports.mapVendorFields = exports.normalizeResource = exports.detectVendor = exports.applyVendorFixes = exports.CommonSearches = exports.FhirSearchBuilder = exports.VendorNormalizer = exports.FhirConfigSchema = exports.AtlasFhirClient = void 0;
exports.createAtlasFhir = createAtlasFhir;
const client_1 = require("./client");
Object.defineProperty(exports, "AtlasFhirClient", { enumerable: true, get: function () { return client_1.AtlasFhirClient; } });
Object.defineProperty(exports, "FhirConfigSchema", { enumerable: true, get: function () { return client_1.FhirConfigSchema; } });
Object.defineProperty(exports, "VendorNormalizer", { enumerable: true, get: function () { return client_1.VendorNormalizer; } });
const search_1 = require("./search");
Object.defineProperty(exports, "FhirSearchBuilder", { enumerable: true, get: function () { return search_1.FhirSearchBuilder; } });
Object.defineProperty(exports, "CommonSearches", { enumerable: true, get: function () { return search_1.CommonSearches; } });
const r4_modifications_1 = require("./_fixes/r4-modifications");
Object.defineProperty(exports, "applyVendorFixes", { enumerable: true, get: function () { return r4_modifications_1.applyVendorFixes; } });
Object.defineProperty(exports, "detectVendor", { enumerable: true, get: function () { return r4_modifications_1.detectVendor; } });
Object.defineProperty(exports, "normalizeResource", { enumerable: true, get: function () { return r4_modifications_1.normalizeResource; } });
Object.defineProperty(exports, "mapVendorFields", { enumerable: true, get: function () { return r4_modifications_1.mapVendorFields; } });
// Resource imports
const Patient_1 = require("./resources/Patient");
Object.defineProperty(exports, "PatientResource", { enumerable: true, get: function () { return Patient_1.PatientResource; } });
Object.defineProperty(exports, "PatientSchema", { enumerable: true, get: function () { return Patient_1.PatientSchema; } });
const Observation_1 = require("./resources/Observation");
Object.defineProperty(exports, "ObservationResource", { enumerable: true, get: function () { return Observation_1.ObservationResource; } });
Object.defineProperty(exports, "ObservationSchema", { enumerable: true, get: function () { return Observation_1.ObservationSchema; } });
const Condition_1 = require("./resources/Condition");
Object.defineProperty(exports, "ConditionResource", { enumerable: true, get: function () { return Condition_1.ConditionResource; } });
Object.defineProperty(exports, "ConditionSchema", { enumerable: true, get: function () { return Condition_1.ConditionSchema; } });
const MedicationRequest_1 = require("./resources/MedicationRequest");
Object.defineProperty(exports, "MedicationRequestResource", { enumerable: true, get: function () { return MedicationRequest_1.MedicationRequestResource; } });
Object.defineProperty(exports, "MedicationRequestSchema", { enumerable: true, get: function () { return MedicationRequest_1.MedicationRequestSchema; } });
const Encounter_1 = require("./resources/Encounter");
Object.defineProperty(exports, "EncounterResource", { enumerable: true, get: function () { return Encounter_1.EncounterResource; } });
Object.defineProperty(exports, "EncounterSchema", { enumerable: true, get: function () { return Encounter_1.EncounterSchema; } });
const ReferralRequest_1 = require("./resources/ReferralRequest");
Object.defineProperty(exports, "ReferralRequestResource", { enumerable: true, get: function () { return ReferralRequest_1.ReferralRequestResource; } });
Object.defineProperty(exports, "ServiceRequestSchema", { enumerable: true, get: function () { return ReferralRequest_1.ServiceRequestSchema; } });
const Bundle_1 = require("./resources/Bundle");
Object.defineProperty(exports, "BundleResource", { enumerable: true, get: function () { return Bundle_1.BundleResource; } });
// Main ATLAS FHIR class that combines all resources
class AtlasFhir {
    constructor(config, retryConfig) {
        this.client = new client_1.AtlasFhirClient(config, retryConfig);
        // Initialize resource classes
        this.patient = new Patient_1.PatientResource(this.client);
        this.observation = new Observation_1.ObservationResource(this.client);
        this.condition = new Condition_1.ConditionResource(this.client);
        this.medicationRequest = new MedicationRequest_1.MedicationRequestResource(this.client);
        this.encounter = new Encounter_1.EncounterResource(this.client);
        this.referralRequest = new ReferralRequest_1.ReferralRequestResource(this.client);
        this.bundle = new Bundle_1.BundleResource(this.client);
    }
    // Direct access to underlying client for advanced operations
    get fhirClient() {
        return this.client;
    }
    // Convenience method for search builder
    get search() {
        return new search_1.FhirSearchBuilder();
    }
    // Capability statement
    async capabilities() {
        return this.client.capabilities();
    }
    // Transaction operations
    async transaction(bundle) {
        return this.client.transaction(bundle);
    }
    // Batch operations
    async batch(bundle) {
        return this.client.batch(bundle);
    }
    // Common search patterns
    get commonSearches() {
        return search_1.CommonSearches;
    }
}
exports.AtlasFhir = AtlasFhir;
// Factory function for easy instantiation
function createAtlasFhir(config, retryConfig) {
    return new AtlasFhir(config, retryConfig);
}
//# sourceMappingURL=index.js.map