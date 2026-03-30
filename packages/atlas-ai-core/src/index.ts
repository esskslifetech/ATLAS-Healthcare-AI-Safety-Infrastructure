// ATLAS AI Core - Generative AI Integration Layer
import OpenAI from 'openai';
import { z } from 'zod';

// ==================== AI Configuration ====================
export interface AIConfig {
  openaiApiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

export const defaultAIConfig: AIConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4-turbo-preview',
  temperature: 0.1, // Low temperature for consistent medical reasoning
  maxTokens: 2000,
  timeoutMs: 30000,
};

// ==================== Clinical Schemas ====================
export const TriageInputSchema = z.object({
  symptoms: z.array(z.string()),
  patientContext: z.object({
    age: z.number(),
    vitals: z.object({
      heartRate: z.number().optional(),
      bloodPressure: z.object({
        systolic: z.number().optional(),
        diastolic: z.number().optional(),
      }).optional(),
      temperature: z.number().optional(),
      oxygenSaturation: z.number().optional(),
      respiratoryRate: z.number().optional(),
    }).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    medicalHistory: z.array(z.string()).optional(),
  }).optional(),
});

export const TriageOutputSchema = z.object({
  urgency: z.enum(['ROUTINE', 'URGENT', 'EMERGENT']),
  suggestedPathway: z.enum(['TELEHEALTH', 'URGENT_CARE', 'ED', 'HOSPITAL_ADMISSION']),
  differential: z.array(z.object({
    condition: z.string(),
    icd10: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  redFlags: z.array(z.string()),
  reasoning: z.string(),
  confidenceScore: z.number().min(0).max(1),
  recommendations: z.array(z.string()),
  requiresImmediateAttention: z.boolean(),
});

export type TriageInput = z.infer<typeof TriageInputSchema>;
export type TriageOutput = z.infer<typeof TriageOutputSchema>;

// ==================== AI Agents ====================
export class AITriageAgent {
  private client: OpenAI;

  constructor(private config: AIConfig = defaultAIConfig) {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
      timeout: config.timeoutMs,
    });
  }

  async analyzeSymptoms(input: TriageInput): Promise<TriageOutput> {
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
      return TriageOutputSchema.parse(parsed);
    } catch (error) {
      console.error('AI Triage Error:', error);
      // Fallback to rule-based logic if AI fails
      return this.fallbackTriage(input);
    }
  }

  private buildTriagePrompt(input: TriageInput): string {
    const { symptoms, patientContext } = input;
    
    let prompt = `PATIENT SYMPTOMS:\n${symptoms.join(', ')}\n\n`;
    
    if (patientContext) {
      prompt += `PATIENT CONTEXT:\n`;
      prompt += `- Age: ${patientContext.age}\n`;
      
      if (patientContext.vitals) {
        prompt += `- Vitals: `;
        const vitals = [];
        if (patientContext.vitals.heartRate) vitals.push(`HR: ${patientContext.vitals.heartRate}`);
        if (patientContext.vitals.bloodPressure) {
          vitals.push(`BP: ${patientContext.vitals.bloodPressure.systolic}/${patientContext.vitals.bloodPressure.diastolic}`);
        }
        if (patientContext.vitals.temperature) vitals.push(`Temp: ${patientContext.vitals.temperature}°C`);
        if (patientContext.vitals.oxygenSaturation) vitals.push(`O2: ${patientContext.vitals.oxygenSaturation}%`);
        if (patientContext.vitals.respiratoryRate) vitals.push(`RR: ${patientContext.vitals.respiratoryRate}`);
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

  private getSystemPrompt(): string {
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

  private fallbackTriage(input: TriageInput): TriageOutput {
    // Simple rule-based fallback
    const emergencySymptoms = ['chest pain', 'shortness of breath', 'difficulty breathing', 'severe headache', 'neurological', 'bleeding'];
    const urgentSymptoms = ['fever', 'pain', 'injury', 'infection'];
    
    const hasEmergency = input.symptoms.some(s => 
      emergencySymptoms.some(e => s.toLowerCase().includes(e))
    );
    
    const hasUrgent = input.symptoms.some(s => 
      urgentSymptoms.some(u => s.toLowerCase().includes(u))
    );

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

// ==================== AI Agent Factory ====================
export class AIAgentFactory {
  private static triageAgent: AITriageAgent | null = null;

  static getTriageAgent(config?: AIConfig): AITriageAgent {
    if (!this.triageAgent) {
      this.triageAgent = new AITriageAgent(config);
    }
    return this.triageAgent;
  }

  static reset(): void {
    this.triageAgent = null;
  }
}

// ==================== Exports ====================
// Classes and types are exported through their declarations
