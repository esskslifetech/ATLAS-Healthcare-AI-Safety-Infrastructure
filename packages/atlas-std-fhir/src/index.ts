// ATLAS FHIR Standard Library
// Universal adapter for HL7 FHIR R4 resources

import { 
  AtlasFhirClient, 
  FhirConfig, 
  FhirConfigSchema, 
  ClientRetryConfig as RetryConfig, 
  VendorNormalizer 
} from './client';
import { 
  FhirSearchBuilder, 
  CommonSearches
} from './search';
import { 
  applyVendorFixes, 
  detectVendor, 
  normalizeResource, 
  mapVendorFields
} from './_fixes/r4-modifications';

// Resource imports
import { 
  PatientResource, 
  Patient, 
  PatientSchema, 
  PatientIdentifier, 
  PatientContact 
} from './resources/Patient';
import { 
  ObservationResource, 
  Observation, 
  ObservationSchema, 
  ObservationComponent, 
  ObservationReferenceRange 
} from './resources/Observation';
import { 
  ConditionResource, 
  Condition, 
  ConditionSchema, 
  ConditionEvidence 
} from './resources/Condition';
import { 
  MedicationRequestResource, 
  MedicationRequest, 
  MedicationRequestSchema, 
  MedicationRequestDispenseRequest, 
  MedicationRequestSubstitution 
} from './resources/MedicationRequest';
import { 
  EncounterResource, 
  Encounter, 
  EncounterSchema, 
  EncounterStatusHistory, 
  EncounterClassHistory, 
  EncounterHospitalization, 
  EncounterLocation 
} from './resources/Encounter';
import { 
  ReferralRequestResource, 
  ServiceRequest, 
  ServiceRequestSchema 
} from './resources/ReferralRequest';
import { 
  BundleResource
} from './resources/Bundle';

// Re-exports
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

// Main ATLAS FHIR class that combines all resources
export class AtlasFhir {
  private client: AtlasFhirClient;
  
  // Resource instances
  public patient: PatientResource;
  public observation: ObservationResource;
  public condition: ConditionResource;
  public medicationRequest: MedicationRequestResource;
  public encounter: EncounterResource;
  public referralRequest: ReferralRequestResource;
  public bundle: BundleResource;

  constructor(config: FhirConfig, retryConfig?: RetryConfig) {
    this.client = new AtlasFhirClient(config, retryConfig);
    
    // Initialize resource classes
    this.patient = new PatientResource(this.client);
    this.observation = new ObservationResource(this.client);
    this.condition = new ConditionResource(this.client);
    this.medicationRequest = new MedicationRequestResource(this.client);
    this.encounter = new EncounterResource(this.client);
    this.referralRequest = new ReferralRequestResource(this.client);
    this.bundle = new BundleResource(this.client);
  }

  // Direct access to underlying client for advanced operations
  get fhirClient(): AtlasFhirClient {
    return this.client;
  }

  // Convenience method for search builder
  get search(): FhirSearchBuilder {
    return new FhirSearchBuilder();
  }

  // Capability statement
  async capabilities(): Promise<any> {
    return this.client.capabilities();
  }

  // Transaction operations
  async transaction(bundle: any): Promise<any> {
    return this.client.transaction(bundle);
  }

  // Batch operations
  async batch(bundle: any): Promise<any> {
    return this.client.batch(bundle);
  }

  // Common search patterns
  get commonSearches() {
    return CommonSearches;
  }
}

// Factory function for easy instantiation
export function createAtlasFhir(config: FhirConfig, retryConfig?: RetryConfig): AtlasFhir {
  return new AtlasFhir(config, retryConfig);
}
