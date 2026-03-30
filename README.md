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
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install dependencies from the root
npm install
```

### 2. Configure Environment
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
```

---

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
