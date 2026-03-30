"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAgentFactory = exports.AITriageAgent = exports.TriageOutputSchema = exports.TriageInputSchema = exports.defaultAIConfig = void 0;
// ATLAS AI Core - Generative AI Integration Layer
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("zod");
exports.defaultAIConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.1, // Low temperature for consistent medical reasoning
    maxTokens: 2000,
    timeoutMs: 30000,
};
// ==================== Clinical Schemas ====================
exports.TriageInputSchema = zod_1.z.object({
    symptoms: zod_1.z.array(zod_1.z.string()),
    patientContext: zod_1.z.object({
        age: zod_1.z.number(),
        vitals: zod_1.z.object({
            heartRate: zod_1.z.number().optional(),
            bloodPressure: zod_1.z.object({
                systolic: zod_1.z.number().optional(),
                diastolic: zod_1.z.number().optional(),
            }).optional(),
            temperature: zod_1.z.number().optional(),
            oxygenSaturation: zod_1.z.number().optional(),
            respiratoryRate: zod_1.z.number().optional(),
        }).optional(),
        medications: zod_1.z.array(zod_1.z.string()).optional(),
        allergies: zod_1.z.array(zod_1.z.string()).optional(),
        medicalHistory: zod_1.z.array(zod_1.z.string()).optional(),
    }).optional(),
});
exports.TriageOutputSchema = zod_1.z.object({
    urgency: zod_1.z.enum(['ROUTINE', 'URGENT', 'EMERGENT']),
    suggestedPathway: zod_1.z.enum(['TELEHEALTH', 'URGENT_CARE', 'ED', 'HOSPITAL_ADMISSION']),
    differential: zod_1.z.array(zod_1.z.object({
        condition: zod_1.z.string(),
        icd10: zod_1.z.string(),
        confidence: zod_1.z.number().min(0).max(1),
    })),
    redFlags: zod_1.z.array(zod_1.z.string()),
    reasoning: zod_1.z.string(),
    confidenceScore: zod_1.z.number().min(0).max(1),
    recommendations: zod_1.z.array(zod_1.z.string()),
    requiresImmediateAttention: zod_1.z.boolean(),
});
// ==================== AI Agents ====================
class AITriageAgent {
    constructor(config = exports.defaultAIConfig) {
        this.config = config;
        if (!config.openaiApiKey) {
            throw new Error('OpenAI API key is required');
        }
        this.client = new openai_1.default({
            apiKey: config.openaiApiKey,
            timeout: config.timeoutMs,
        });
    }
    async analyzeSymptoms(input) {
        const prompt = this.buildTriagePrompt(input);
        try {
            const response = await this.client.chat.completions.create({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt(),
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
                response_format: { type: 'json_object' },
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from AI model');
            }
            const parsed = JSON.parse(content);
            return exports.TriageOutputSchema.parse(parsed);
        }
        catch (error) {
            console.error('AI Triage Error:', error);
            // Fallback to rule-based logic if AI fails
            return this.fallbackTriage(input);
        }
    }
    buildTriagePrompt(input) {
        const { symptoms, patientContext } = input;
        let prompt = `PATIENT SYMPTOMS:\n${symptoms.join(', ')}\n\n`;
        if (patientContext) {
            prompt += `PATIENT CONTEXT:\n`;
            prompt += `- Age: ${patientContext.age}\n`;
            if (patientContext.vitals) {
                prompt += `- Vitals: `;
                const vitals = [];
                if (patientContext.vitals.heartRate)
                    vitals.push(`HR: ${patientContext.vitals.heartRate}`);
                if (patientContext.vitals.bloodPressure) {
                    vitals.push(`BP: ${patientContext.vitals.bloodPressure.systolic}/${patientContext.vitals.bloodPressure.diastolic}`);
                }
                if (patientContext.vitals.temperature)
                    vitals.push(`Temp: ${patientContext.vitals.temperature}°C`);
                if (patientContext.vitals.oxygenSaturation)
                    vitals.push(`O2: ${patientContext.vitals.oxygenSaturation}%`);
                if (patientContext.vitals.respiratoryRate)
                    vitals.push(`RR: ${patientContext.vitals.respiratoryRate}`);
                prompt += vitals.join(', ') + '\n';
            }
            if (patientContext.medications?.length) {
                prompt += `- Medications: ${patientContext.medications.join(', ')}\n`;
            }
            if (patientContext.allergies?.length) {
                prompt += `- Allergies: ${patientContext.allergies.join(', ')}\n`;
            }
            if (patientContext.medicalHistory?.length) {
                prompt += `- Medical History: ${patientContext.medicalHistory.join(', ')}\n`;
            }
        }
        prompt += `\nPlease analyze this case and provide triage recommendations in the specified JSON format.`;
        return prompt;
    }
    getSystemPrompt() {
        return `You are an experienced emergency medicine physician and clinical triage specialist. 

Your task is to analyze patient symptoms and context to determine appropriate triage level and care pathway.

CRITICAL RULES:
1. Be conservative - when in doubt, choose higher urgency
2. Consider age and vital signs carefully
3. Identify any red flags that require immediate attention
4. Provide evidence-based differential diagnoses with realistic confidence scores
5. Generate clear, actionable recommendations

RESPONSE FORMAT (JSON):
{
  "urgency": "ROUTINE|URGENT|EMERGENT",
  "suggestedPathway": "TELEHEALTH|URGENT_CARE|ED|HOSPITAL_ADMISSION", 
  "differential": [
    {
      "condition": "Specific diagnosis name",
      "icd10": "ICD-10 code",
      "confidence": 0.0-1.0
    }
  ],
  "redFlags": ["List any concerning symptoms/signs"],
  "reasoning": "Detailed clinical reasoning for your decision",
  "confidenceScore": 0.0-1.0,
  "recommendations": ["Specific actionable recommendations"],
  "requiresImmediateAttention": true/false
}

URGENCY DEFINITIONS:
- ROUTINE: Non-urgent, can wait 24-72 hours
- URGENT: Needs attention within 2-6 hours  
- EMERGENT: Needs immediate attention (within minutes to 1 hour)

Consider red flags like: chest pain, difficulty breathing, neurological symptoms, severe bleeding, etc.>`;
    }
    fallbackTriage(input) {
        // Simple rule-based fallback
        const emergencySymptoms = ['chest pain', 'shortness of breath', 'difficulty breathing', 'severe headache', 'neurological', 'bleeding'];
        const urgentSymptoms = ['fever', 'pain', 'injury', 'infection'];
        const hasEmergency = input.symptoms.some(s => emergencySymptoms.some(e => s.toLowerCase().includes(e)));
        const hasUrgent = input.symptoms.some(s => urgentSymptoms.some(u => s.toLowerCase().includes(u)));
        if (hasEmergency) {
            return {
                urgency: 'EMERGENT',
                suggestedPathway: 'ED',
                differential: [{ condition: 'Emergency condition', icd10: 'R69', confidence: 0.8 }],
                redFlags: ['Emergency symptoms detected'],
                reasoning: 'Emergency symptoms require immediate evaluation',
                confidenceScore: 0.7,
                recommendations: ['Seek emergency care immediately'],
                requiresImmediateAttention: true,
            };
        }
        if (hasUrgent) {
            return {
                urgency: 'URGENT',
                suggestedPathway: 'URGENT_CARE',
                differential: [{ condition: 'Urgent condition', icd10: 'R69', confidence: 0.6 }],
                redFlags: [],
                reasoning: 'Urgent symptoms require timely evaluation',
                confidenceScore: 0.6,
                recommendations: ['Seek urgent care within 6 hours'],
                requiresImmediateAttention: false,
            };
        }
        return {
            urgency: 'ROUTINE',
            suggestedPathway: 'TELEHEALTH',
            differential: [{ condition: 'Routine condition', icd10: 'Z00.0', confidence: 0.5 }],
            redFlags: [],
            reasoning: 'Routine symptoms can be managed with standard care',
            confidenceScore: 0.5,
            recommendations: ['Schedule routine appointment'],
            requiresImmediateAttention: false,
        };
    }
}
exports.AITriageAgent = AITriageAgent;
// ==================== AI Agent Factory ====================
class AIAgentFactory {
    static getTriageAgent(config) {
        if (!this.triageAgent) {
            this.triageAgent = new AITriageAgent(config);
        }
        return this.triageAgent;
    }
    static reset() {
        this.triageAgent = null;
    }
}
exports.AIAgentFactory = AIAgentFactory;
AIAgentFactory.triageAgent = null;
// ==================== Exports ====================
// Classes and types are exported through their declarations
//# sourceMappingURL=index.js.map