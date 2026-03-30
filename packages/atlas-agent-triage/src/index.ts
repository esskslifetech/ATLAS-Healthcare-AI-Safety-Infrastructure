// index.ts
// ATLAS Triage Agent
// Symptom classification and urgency assessment for healthcare AI

import { TriageAgent } from './triage-agent';

// Convenience factory function
export function createTriageAgent(): TriageAgent {
  return new TriageAgent();
}

// Re-export main class as default
export { TriageAgent as default } from './triage-agent';