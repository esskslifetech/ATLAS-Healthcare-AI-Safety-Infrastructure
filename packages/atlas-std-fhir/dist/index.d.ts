import { AtlasFhirClient, FhirConfig, FhirConfigSchema, ClientRetryConfig as RetryConfig, VendorNormalizer } from './client';
import { FhirSearchBuilder, CommonSearches } from './search';
import { applyVendorFixes, detectVendor, normalizeResource, mapVendorFields } from './_fixes/r4-modifications';
import { PatientResource, Patient, PatientSchema, PatientIdentifier, PatientContact } from './resources/Patient';
import { ObservationResource, Observation, ObservationSchema, ObservationComponent, ObservationReferenceRange } from './resources/Observation';
import { ConditionResource, Condition, ConditionSchema, ConditionEvidence } from './resources/Condition';
import { MedicationRequestResource, MedicationRequest, MedicationRequestSchema, MedicationRequestDispenseRequest, MedicationRequestSubstitution } from './resources/MedicationRequest';
import { EncounterResource, Encounter, EncounterSchema, EncounterStatusHistory, EncounterClassHistory, EncounterHospitalization, EncounterLocation } from './resources/Encounter';
import { ReferralRequestResource, ServiceRequest, ServiceRequestSchema } from './resources/ReferralRequest';
import { BundleResource } from './resources/Bundle';
export { AtlasFhirClient, FhirConfig, FhirConfigSchema, RetryConfig, VendorNormalizer };
export { FhirSearchBuilder, CommonSearches };
export { applyVendorFixes, detectVendor, normalizeResource, mapVendorFields };
export { PatientResource, Patient, PatientSchema, PatientIdentifier, PatientContact };
export { ObservationResource, Observation, ObservationSchema, ObservationComponent, ObservationReferenceRange };
export { ConditionResource, Condition, ConditionSchema, ConditionEvidence };
export { MedicationRequestResource, MedicationRequest, MedicationRequestSchema, MedicationRequestDispenseRequest, MedicationRequestSubstitution };
export { EncounterResource, Encounter, EncounterSchema, EncounterStatusHistory, EncounterClassHistory, EncounterHospitalization, EncounterLocation };
export { ReferralRequestResource, ServiceRequest, ServiceRequestSchema };
export { BundleResource };
export declare class AtlasFhir {
    private client;
    patient: PatientResource;
    observation: ObservationResource;
    condition: ConditionResource;
    medicationRequest: MedicationRequestResource;
    encounter: EncounterResource;
    referralRequest: ReferralRequestResource;
    bundle: BundleResource;
    constructor(config: FhirConfig, retryConfig?: RetryConfig);
    get fhirClient(): AtlasFhirClient;
    get search(): FhirSearchBuilder;
    capabilities(): Promise<any>;
    transaction(bundle: any): Promise<any>;
    batch(bundle: any): Promise<any>;
    get commonSearches(): typeof CommonSearches;
}
export declare function createAtlasFhir(config: FhirConfig, retryConfig?: RetryConfig): AtlasFhir;
//# sourceMappingURL=index.d.ts.map