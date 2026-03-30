# ATLAS — Verifiable Healthcare AI Safety Infrastructure

**Every AI diagnosis gets a cryptographic receipt. Every action checks patient consent first.**

---

## ⚡ Problem Pitch

ATLAS is a safety layer for healthcare AI that ensures every decision is:

- ✅ **Verified** by patient consent
- ✅ **Logged** with cryptographic proof
- ✅ **Explainable** with structured reasoning

Think: **Stripe for healthcare AI safety.**

---

## The Problem (30 seconds)

Healthcare AI is moving fast. Too fast.

```
❌ Black box decisions — no audit trail
❌ No patient consent enforcement  
❌ "Trust us, the AI is right" isn't good enough
```

**ATLAS adds a safety layer that makes AI decisions:**
- ✅ Cryptographically auditable
- ✅ Consent-aware at runtime
- ✅ Explainable with structured reasoning

---

## How It Works

```
Patient describes symptoms
        ↓
   [Consent Check] ←── Is this action allowed?
        ↓ Approved
   AI processes case with context
        ↓
   Generates differential diagnosis
        ↓
   [Audit Log] ←── SHA-256 hash chain entry
        ↓
   Explainable JSON output
```

**Three components, one guarantee:** Every decision is traceable and authorized.

---

## The Stack

| Component | What It Does |
|-----------|--------------|
| **AI Core** | LLM-based clinical reasoning (GPT-4 Turbo) + patient context → structured differential diagnoses |
| **Consent MCP** | Runtime permission checks before any AI action |
| **Audit MCP** | SHA-256 hash chains — tamper-evident logging |
| **Coordinator** | Multi-agent orchestration with circuit breakers |

---

## Live Demo

```bash
# Clone and run
git clone https://github.com/esskslifetech/ATLAS-Healthcare-AI-Safety-Infrastructure
cd ATLAS
npm install

# Set your key
export OPENAI_API_KEY="your-key"

# Run the demo
node -r ts-node/register src/demo/api-demo.ts
```

**What you'll see:**

```json
{
  "patient_id": "PT-2024-001",
  "consent_verified": true,
  "consent_scope": ["treatment", "data_processing"],
  "diagnosis": {
    "differentials": [
      {
        "condition": "Acute Bronchitis",
        "confidence": 0.72,
        "urgency": "routine",
        "evidence": ["persistent_cough_7days", "no_fever", "clear_lungs"]
      },
      {
        "condition": "Upper Respiratory Infection", 
        "confidence": 0.58,
        "urgency": "routine",
        "evidence": ["congestion", "sore_throat", "mild_fatigue"]
      }
    ]
  },
  "audit": {
    "event_id": "AUD-7f3a9c2e",
    "hash": "sha256:8f2d4b1a...",
    "prev_hash": "sha256:3c9e7f2a...",
    "timestamp": "2024-03-15T14:32:01Z"
  }
}
```

---

## Why This Wins

### 🏆 It's infrastructure, not an app

Judges see chatbots all day. ATLAS is different:

> "We built the safety layer that ANY healthcare AI needs"

That's a platform play. That's defensible.

→ **This means ATLAS doesn't compete with healthcare AI apps — it powers them.**

### 🔒 The audit chain is real

```
Event 1 → SHA-256 → Hash A
Event 2 → SHA-256 → Hash B (includes Hash A)
Event 3 → SHA-256 → Hash C (includes Hash B)
                    ↓
        Tamper with Event 1?
        → Entire chain breaks
        → Instantly detectable
```

Not theater. Actual cryptographic integrity.

### 🛡️ Consent isn't optional

```typescript
// This fails if consent isn't granted
const result = await aiCore.diagnose(patientData);
// Error: CONSENT_REQUIRED — scope 'treatment' not verified

// This succeeds only after consent check
const consent = await consentServer.check(patientId, 'treatment');
if (consent.approved) {
  const result = await aiCore.diagnose(patientData);
}
```

### 🧠 Explanations, not just answers

Every diagnosis includes:
- **Confidence scores** — we know when we're uncertain
- **Evidence attribution** — which symptoms led to which conclusion
- **Urgency classification** — routine, urgent, emergency

---

## Architecture (Simplified)

```
┌─────────────────────────────────────────┐
│           CARE COORDINATOR              │
│     (Multi-agent orchestration)         │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ↓            ↓            ↓
┌────────┐  ┌────────┐  ┌────────┐
│ Intake │→ │ Triage │→ │Routing │
│ Agent  │  │ Agent  │  │ Agent  │
└────────┘  └────┬───┘  └────────┘
                 │
         ┌───────┴───────┐
         ↓               ↓
   ┌───────────┐   ┌───────────┐
   │  CONSENT  │   │   AUDIT   │
   │   MCP     │   │    MCP    │
   │  Server   │   │   Server  │
   └───────────┘   └───────────┘
```

**Two MCP servers** that any agent in the ecosystem can use.

---

## Tech Details

- **Language**: TypeScript
- **AI**: LLM-based clinical reasoning (GPT-4 Turbo) + patient context
- **Protocol**: MCP 1.0
- **Crypto**: SHA-256 hash chains
- **Architecture**: Multi-agent with circuit breakers

---

## Author

**Kanishk Soni**
[GitHub](https://github.com/esskslifetech) | [Repo](https://github.com/esskslifetech/ATLAS-Healthcare-AI-Safety-Infrastructure)

---

*Built for Agents Assemble — Healthcare AI Endgame*
