"use strict";
// index.ts
// ATLAS Triage Agent
// Symptom classification and urgency assessment for healthcare AI
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
exports.createTriageAgent = createTriageAgent;
const triage_agent_1 = require("./triage-agent");
// Convenience factory function
function createTriageAgent() {
    return new triage_agent_1.TriageAgent();
}
// Re-export main class as default
var triage_agent_2 = require("./triage-agent");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return triage_agent_2.TriageAgent; } });
//# sourceMappingURL=index.js.map