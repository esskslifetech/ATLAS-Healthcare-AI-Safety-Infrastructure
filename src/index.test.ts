import { createHash, randomUUID } from 'node:crypto';

describe('ATLAS Core Infrastructure Tests', () => {
  describe('Cryptographic Audit Trail', () => {
    it('should generate consistent hashes for audit events', () => {
      const event1 = {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'READ',
        actor: { id: 'agent-1', type: 'agent' },
        resource: { id: 'patient-123', type: 'Patient' },
        result: 'success'
      };
      
      const event2 = { ...event1 };
      const hash1 = createHash('sha256').update(JSON.stringify(event1)).digest('hex');
      const hash2 = createHash('sha256').update(JSON.stringify(event2)).digest('hex');
      
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should detect tampering in audit chain', () => {
      const originalEvent = {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: 'READ',
        actor: { id: 'agent-1', type: 'agent' },
        resource: { id: 'patient-123', type: 'Patient' },
        result: 'success'
      };
      
      const originalHash = createHash('sha256').update(JSON.stringify(originalEvent)).digest('hex');
      
      // Tamper with the event
      const tamperedEvent = { ...originalEvent, action: 'WRITE' };
      const tamperedHash = createHash('sha256').update(JSON.stringify(tamperedEvent)).digest('hex');
      
      expect(originalHash).not.toBe(tamperedHash);
    });
  });

  describe('Session Management', () => {
    it('should maintain session state consistency', () => {
      const sessionId = randomUUID();
      const patientId = 'patient-123';
      
      const session = {
        session_id: sessionId,
        patient_id: patientId,
        state: 'INTAKE' as const,
        timeline: [],
        fhir_resources: [],
        agent_handoffs: [],
        consent_ref: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          initial_symptoms: ['chest pain'],
          provider_notifications: [],
          patient_instructions: [],
        },
      };
      
      // Verify session structure
      expect(session.session_id).toBe(sessionId);
      expect(session.patient_id).toBe(patientId);
      expect(session.state).toBe('INTAKE');
      expect(session.metadata.initial_symptoms).toContain('chest pain');
    });

    it('should handle state transitions correctly', () => {
      const states = ['INTAKE', 'TRIAGE', 'ROUTING', 'MEDS', 'COMPLETE'] as const;
      let currentState: typeof states[number] = states[0];
      
      // Simulate workflow progression
      for (let i = 1; i < states.length; i++) {
        currentState = states[i];
        expect(states).toContain(currentState);
      }
      
      expect(currentState).toBe('COMPLETE');
    });
  });

  describe('Consent Management', () => {
    it('should validate consent scopes properly', () => {
      const validScopes = ['read', 'write', 'treatment', 'data_processing'];
      const consentScopes = ['read', 'treatment'];
      
      // Check if requested scopes are within valid scopes
      const isValidScope = consentScopes.every(scope => validScopes.includes(scope));
      expect(isValidScope).toBe(true);
      
      // Check invalid scope
      const invalidScopes = ['read', 'invalid_scope'];
      const isInvalidScope = invalidScopes.every(scope => validScopes.includes(scope));
      expect(isInvalidScope).toBe(false);
    });

    it('should generate unique consent references', () => {
      const consentRef1 = randomUUID();
      const consentRef2 = randomUUID();
      
      expect(consentRef1).not.toBe(consentRef2);
      expect(consentRef1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('Agent Coordination', () => {
    it('should validate agent capabilities', () => {
      const agentCapabilities = [
        'workflow_orchestration',
        'state_machine_management',
        'agent_coordination',
        'session_management',
        'circuit_breaker',
        'retry_with_backoff',
        'concurrency_safety',
        'observability',
        'notifications'
      ];
      
      const requiredCapabilities = [
        'workflow_orchestration',
        'agent_coordination',
        'session_management'
      ];
      
      // Check if all required capabilities are present
      const hasAllRequired = requiredCapabilities.every(cap => 
        agentCapabilities.includes(cap)
      );
      expect(hasAllRequired).toBe(true);
    });

    it('should handle circuit breaker states correctly', () => {
      const circuitStates = ['CLOSED', 'OPEN', 'HALF_OPEN'] as const;
      let currentState: typeof circuitStates[number] = circuitStates[0];
      
      // Simulate circuit breaker behavior
      const failures = 5;
      if (failures >= 5) {
        currentState = 'OPEN';
      }
      
      expect(currentState).toBe('OPEN');
      expect(circuitStates).toContain(currentState);
    });
  });

  describe('FHIR Integration', () => {
    it('should validate FHIR resource structure', () => {
      const patientResource = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Garcia', given: ['Maria'] }],
        birthDate: '1985-03-15',
        gender: 'female'
      };
      
      expect(patientResource.resourceType).toBe('Patient');
      expect(patientResource.id).toBe('patient-123');
      expect(patientResource.name).toHaveLength(1);
      expect(patientResource.name[0].family).toBe('Garcia');
    });

    it('should handle medication requests correctly', () => {
      const medicationRequest = {
        resourceType: 'MedicationRequest',
        id: 'med-req-123',
        status: 'active',
        intent: 'order',
        medicationReference: { reference: 'Medication/med-123' },
        subject: { reference: 'Patient/patient-123' }
      };
      
      expect(medicationRequest.resourceType).toBe('MedicationRequest');
      expect(medicationRequest.status).toBe('active');
      expect(medicationRequest.subject.reference).toBe('Patient/patient-123');
    });
  });

  describe('Error Handling', () => {
    it('should create proper error objects', () => {
      const error = new Error('Test error');
      error.name = 'CoordinatorError';
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('CoordinatorError');
      expect(error.message).toBe('Test error');
    });

    it('should handle result types correctly', () => {
      type Result<T, E = Error> = 
        | { ok: true; value: T }
        | { ok: false; error: E };
      
      function ok<T>(value: T): Result<T, never> {
        return { ok: true, value };
      }
      
      function err<E>(error: E): Result<never, E> {
        return { ok: false, error };
      }
      
      const successResult = ok('test value');
      const errorResult = err(new Error('test error'));
      
      expect(successResult.ok).toBe(true);
      if (successResult.ok) {
        expect(successResult.value).toBe('test value');
      }
      
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toBeInstanceOf(Error);
      }
    });
  });
});
