<<<<<<< HEAD
# 🏥 **Project ATLAS** — *AI Clinical Decision Engine*

### The safety infrastructure healthcare AI has been missing — consent, audit, and identity — as open, plug-and-play tools.

---

## 🩺 What It Actually Does

A patient types: *"I have chest pain and my left arm is numb."*

ATLAS handles the entire clinical decision workflow:

```
1. 🤖  AI identifies EMERGENT urgency via GPT-4 clinical reasoning
2. 🛡️  Verifies patient consent before accessing any medical history
3. 📋  Fetches active medications from the live FHIR record
4. 🏥  Routes to the nearest ED with specialist recommendations
5. 🔐  Every step is logged in a cryptographically-signed, tamper-proof audit trail
```

**All in under 3 seconds. All via standard open protocols anyone can plug into.**

This is not a prototype of an idea. Every step above maps to real, working code.

---

## ✨ Core Capabilities

### 🧠 Generative AI Triage (`atlas-ai-core`)
- Uses **OpenAI GPT-4 Turbo** for deep clinical reasoning over unstructured symptom narratives.
- Automatically enriches AI context with live patient data via SHARP-authenticated FHIR queries.
- Structured JSON output with urgency classification, differential diagnoses, and actionable recommendations.
- Rule-based fallback engine ensures safety even when the LLM is unavailable.

### 🔬 Dedicated Triage Agent (`atlas-agent-triage`)
- Standalone clinical engine with ICD-10 mapped differential diagnoses.
- Vital-sign threshold analysis (O₂ saturation, blood pressure, heart rate, temperature, respiratory rate).
- Red flag identification and contraindication checking against patient medications and allergies.
- Configurable care pathway routing: **ED → Urgent Care → Primary Care → Telehealth**.

### 🔐 SMART on FHIR Identity (`atlas-tool-identity`)
- Full **OAuth2 + SMART on FHIR** client — Authorization Code, Client Credentials, and Token Refresh flows.
- **PKCE support** (SHA-256 code challenge) for public client security.
- Auto-discovery of `.well-known/smart-configuration` with TTL-aware caching.
- Compatible with Epic, Cerner, Azure Health Data Services, and any SMART-compliant EHR.

### 🔒 Cryptographic Audit MCP (`atlas-mcp-audit`)
- **SHA-256 hash chains** — every event is cryptographically linked to the previous one.
- Tamper-evident audit log with `verify_audit_trail` integrity checks.
- Exposed as a standard **MCP server** — any platform agent can log and query events via `log_audit_event` and `query_audit_events`.

### 🛡️ Patient Consent MCP (`atlas-mcp-consent`)
- HIPAA-scoped consent management (Treatment, Research, Data Sharing, Emergency).
- Full consent lifecycle: request, check, revoke, and audit.
- Exposed as a standard **MCP server** for plug-and-play use across the ecosystem.

### 📡 A2A Protocol & SHARP Context (`atlas-a2a-protocol`)
- Typed **Agent-to-Agent message bus** (REQUEST, RESPONSE, NOTIFICATION, HANDOFF).
- Full handoff lifecycle: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED / FAILED / TIMEOUT.
- **SHARP Extension Specs** — cryptographic propagation tokens carry patient context securely across agent boundaries.
- Agent capability discovery by type, capability, or FHIR resource type.

### 🌐 FHIR R4 Integration (`atlas-std-fhir`)
- Native FHIR R4 client for Patient, Observation, MedicationRequest, Condition, Encounter, and Bundle resources.
- Integrated with SHARP token authentication for secure cross-agent data access.

---

## 🏗️ System Architecture

```text
┌───────────────────────────────────────────────────────────────────────┐
│                           PROJECT ATLAS                               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │              IDENTITY LAYER (atlas-tool-identity)               │  │
│  │         SMART on FHIR · OAuth2 · PKCE · Token Lifecycle         │  │
│  └──────────────────────────────┬──────────────────────────────────┘  │
│                                 │                                     │
│  ┌──────────────────────────────▼──────────────────────────────────┐  │
│  │          CARE COORDINATOR (atlas-agent-coordinator)             │  │
│  │        A2A Message Bus · SHARP Context Propagation              │  │
│  └─────────┬──────────────┬──────────────┬───────────┬─────────────┘  │
│            │              │              │           │                 │
│  ┌─────────▼──────┐ ┌─────▼──────┐ ┌────▼────┐ ┌───▼─────────┐      │
│  │ AI Triage Agent│ │Triage Agent│ │  Proxy  │ │   Referral  │      │
│  │ (GPT-4 Turbo)  │ │ (Rule-Based│ │  Agent  │ │    Agent    │      │
│  │ atlas-ai-core  │ │   ICD-10)  │ │         │ │             │      │
│  └────────────────┘ └────────────┘ └─────────┘ └─────────────┘      │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                  MCP SUPERPOWERS (Tools)                        │  │
│  │  ┌───────────────────────┐   ┌──────────────────────────────┐   │  │
│  │  │   atlas-mcp-consent   │   │      atlas-mcp-audit         │   │  │
│  │  │   HIPAA Consent Mgmt  │   │   SHA-256 Hash Chain Audit   │   │  │
│  │  └───────────────────────┘   └──────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
=======
# 🏥 ATLAS — Verifiable Healthcare AI Infrastructure

### Safe AI decisions with cryptographic audit trails and patient consent enforcement

---

## 🚀 Overview

Healthcare AI is powerful—but unsafe without auditability and consent enforcement.

ATLAS solves this by introducing a verifiable execution layer for clinical AI systems. It combines Generative AI with MCP-based consent and audit servers to ensure every decision is explainable, authorized, and cryptographically provable.

---

## ⚠️ The Problem

- Healthcare AI systems operate as black boxes
- No verifiable audit trail for decisions
- No enforceable patient consent boundaries
- Difficult to deploy safely in real clinical environments

## ✅ The Solution

ATLAS introduces:
- **Verifiable AI execution** via SHA-256 audit chains
- **Consent-aware workflows** enforced at runtime
- **Interoperable MCP tools** usable by any agent

---

## ✨ Key Features & "Superpowers"

ATLAS is built defensively on modern standards. It exposes native MCP servers ("Superpowers") that any agent in the ecosystem can leverage:

### 🧠 1. Generative AI Core (`atlas-ai-core`)
- Uses **OpenAI (GPT-4 Turbo)** to digest unstructured patient symptoms alongside structured context (age, vitals, medical history, medications).
- Context-aware clinical reasoning outputs standardized JSON differential diagnoses with evidence-based urgency and recommendations.

### 🔒 2. Cryptographic Audit MCP (`atlas-mcp-audit`)
- **Verifiable Logging:** Step-by-step audit traceability for all AI decisions.
- **SHA-256 Hash Chains:** Every event is cryptographically linked to the previous one, ensuring the log's integrity cannot be tampered with.
- **MCP Server:** Exposes tools for agents to `log_audit_event`, `query_audit_events`, and `verify_audit_trail`.

### 🛡️ 3. Patient Consent MCP (`atlas-mcp-consent`)
- **Scoped Verification:** Verifies patient consent boundaries before any AI agent takes action (e.g., Treatment, Data Sharing, Emergency).
- **MCP Server:** Exposes standard tools to `request_consent`, `check_consent`, and `revoke_consent`.

### 🌐 4. Care Coordinator (`atlas-agent-coordinator`)
- A multi-agent orchestrator managing the workflow lifecycle.
- Handles handoffs between intake, symptom triage, care routing, and medication checks.
- Enforces strict circuit-breaking, retry logic, and timeouts.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     PROJECT ATLAS                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                CARE COORDINATOR (A2A)                 │  │
│  │  Orchestrates session state and agent handoffs        │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │                               │
│  ┌──────────────────────────▼────────────────────────────┐  │
│  │                 AI AGENT INTERFACE                    │  │
│  │   ┌────────────┐   ┌────────────┐   ┌─────────────┐   │  │
│  │   │   Intake   │   │   Triage   │   │   Routing   │   │  │
│  │   │   Agent    │   │   Agent    │   │   Agent     │   │  │
│  │   └────────────┘   └──────┬─────┘   └─────────────┘   │  │
│  └───────────────────────────┼───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                MCP SUPERPOWERS (Tools)                │  │
│  │  ┌──────────────────────┐   ┌──────────────────────┐  │  │
│  │  │  atlas-mcp-consent   │   │   atlas-mcp-audit    │  │  │
│  │  │  (HIPAA Scopes)      │   │   (SHA-256 Chains)   │  │  │
│  │  └──────────────────────┘   └──────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
```

---

<<<<<<< HEAD
## 📦 Package Overview

> Each package below is fully implemented. Click the proof link to see the core logic.

| Package | Role | Proof |
|---|---|---|
| `atlas-ai-core` | GPT-4 Turbo AI triage + structured output | [`AITriageAgent.analyzeSymptoms()`](packages/atlas-ai-core/src/index.ts) |
| `atlas-agent-coordinator` | SHARP-wired workflow orchestrator | [`callAgent()`](packages/atlas-agent-coordinator/src/care-coordinator.ts) |
| `atlas-agent-triage` | Rule-based clinical engine (ICD-10, vitals, red flags) | [`TriageEngine.assessUrgency()`](packages/atlas-agent-triage/src/triage-agent.ts) |
| `atlas-agent-proxy` | Patient-facing communication layer | [`PatientProxyAgent.processMessage()`](packages/atlas-agent-proxy/src/patient-proxy.ts) |
| `atlas-mcp-audit` | MCP server — SHA-256 cryptographic audit trail | [`server.ts`](packages/atlas-mcp-audit/src/server.ts) |
| `atlas-mcp-consent` | MCP server — HIPAA-scoped consent management | [`server.ts`](packages/atlas-mcp-consent/src/server.ts) |
| `atlas-tool-identity` | SMART on FHIR OAuth2 identity bridge + PKCE | [`IdentityBridge.exchangeCodeForToken()`](packages/atlas-tool-identity/src/identity-bridge.ts) |
| `atlas-a2a-protocol` | A2A message bus + SHARP Extension Specs | [`A2AProtocolManager.initiateHandoff()`](packages/atlas-a2a-protocol/src/index.ts) |
| `atlas-std-fhir` | FHIR R4 client (Patient, Observation, Meds, Conditions) | [`client.ts`](packages/atlas-std-fhir/src/client.ts) |
| `atlas-tool-audit` | Core audit logger with hash-chain integrity | [`audit-logger.ts`](packages/atlas-tool-audit/src/audit-logger.ts) |
| `atlas-tool-consent` | Core consent engine logic | [`consent-engine.ts`](packages/atlas-tool-consent/src/consent-engine.ts) |

---

=======
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
## 🚀 Quick Start

### 1. Install Dependencies
```bash
<<<<<<< HEAD
=======
# Install dependencies from the root
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
npm install
```

### 2. Configure Environment
<<<<<<< HEAD
```bash
# Required: OpenAI API key for AI triage
export OPENAI_API_KEY="sk-..."

# Optional: FHIR server (defaults to demo endpoint)
export FHIR_BASE_URL="https://launch.smarthealthit.org/v/r4/fhir"
export FHIR_TOKEN="your-smart-token"
```

### 3. Run the System
```bash
# Start the main API server
node -r ts-node/register src/demo/api-demo.ts
```

### 4. Run MCP Servers
The MCP servers expose audit and consent capabilities to any MCP-compatible agent platform:
```bash
# Audit MCP server
npx ts-node packages/atlas-mcp-audit/src/server.ts

# Consent MCP server
npx ts-node packages/atlas-mcp-consent/src/server.ts
=======
Set up your OpenAI API key for the generative AI core:
```bash
export OPENAI_API_KEY="your-sk-key-here"
```

### 3. Run the Demos
ATLAS includes several demo scripts to illustrate its capabilities:
```bash
# Start the API server
node -r ts-node/register src/demo/api-demo.ts

# Test API functionality
node -r ts-node/register src/demo/test-api.ts

# (For MCP Servers, run them via a standard MCP client or prompt environment)
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
```

---

<<<<<<< HEAD
## 🎯 Hackathon Alignment — Agents Assemble

ATLAS addresses the **"Healthcare AI Endgame"** head-on:

| Requirement | Implementation |
|---|---|
| **Generative AI** | GPT-4 Turbo clinical reasoning via `atlas-ai-core` |
| **MCP Superpowers** | Two production-quality MCP servers (audit + consent) |
| **A2A Standards** | Full A2A message bus with typed handoffs and SHARP context propagation |
| **FHIR Integration** | FHIR R4 client + SMART on FHIR OAuth2 authentication |
| **SHARP Extension Specs** | Complete implementation in `atlas-a2a-protocol` |
| **Healthcare Safety** | SHA-256 hash chains, HIPAA consent scopes, SMART auth |

---

**ATLAS demonstrates the endgame of healthcare AI: powerful multi-agent intelligence, constrained by cryptographic safety, patient consent, and interoperable standards.**
=======
## 🎯 Perfect For "Agents Assemble"

This project was built for the **Agents Assemble - The Healthcare AI Endgame** hackathon, targeting the exact requirements of the Prompt Opinion platform:
- **Standards Built-In:** Fully integrates Model Context Protocol (MCP) servers to expose reusable tools across the ecosystem.
- **The AI Factor:** Utilizes Generative AI to understand complex, unstructured patient presentation that standard "rule engines" cannot capture.
- **Feasible & Secure:** Designed from day one with compliance in mind via cryptographic SHA-256 auditing and explicit patient consent protocols. 

---

**ATLAS demonstrates the endgame of healthcare AI: powerful, interoperable intelligence constrained by rigorous cryptographic safety and patient consent.**

---

## 👨‍💻 Author

**Kanishk Soni**  
[GitHub](https://github.com/esskslifetech) | [Repository](https://github.com/esskslifetech/ATLAS-Healthcare-AI-Safety-Infrastructure)
>>>>>>> 0f764913 (🏥 Initial commit: ATLAS Verifiable Healthcare AI Infrastructure)
