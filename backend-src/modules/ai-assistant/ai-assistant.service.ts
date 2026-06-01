import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';

interface Lead {
  fullName: string;
  company: string;
  source: string;
  dealValue: number;
  stage: string;
  notes: string;
}

// Provider-agnostic AI layer — swap provider via config without changing callers
@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private readonly openai: OpenAiProvider,
    private readonly anthropic: AnthropicProvider,
    private readonly config: ConfigService,
  ) {}

  private getActiveProvider() {
    const provider = this.config.get('ai.provider');
    return provider === 'anthropic' ? this.anthropic : this.openai;
  }

  async scoreLead(lead: Lead): Promise<number> {
    const prompt = `
Score this sales lead from 0 to 100 based on conversion potential.
Lead: ${lead.fullName} at ${lead.company}
Source: ${lead.source}, Stage: ${lead.stage}, Deal value: ${lead.dealValue}
Notes: ${lead.notes || 'None'}

Respond with ONLY a number between 0 and 100. No explanation.`;

    const result = await this.getActiveProvider().complete({
      system: 'You are a sales AI that scores leads. Return only a number.',
      prompt,
      maxTokens: 10,
    });

    const score = parseInt(result.trim(), 10);
    return isNaN(score) ? 50 : Math.min(100, Math.max(0, score));
  }

  async draftFollowUpMessage(lead: Lead, channel: 'whatsapp' | 'email'): Promise<string> {
    const prompt = `
Draft a ${channel === 'whatsapp' ? 'short WhatsApp message (max 2 sentences)' : 'professional email'} 
follow-up for this lead.
Name: ${lead.fullName}, Company: ${lead.company}, Stage: ${lead.stage}
Keep it warm, professional, and action-oriented. Don't be pushy.`;

    return this.getActiveProvider().complete({
      system: 'You are a sales assistant writing follow-up messages for SME businesses.',
      prompt,
      maxTokens: 200,
    });
  }

  async generateLeadSummary(lead: Lead): Promise<string> {
    const prompt = `
Write a 2-sentence sales summary for this lead.
${lead.fullName} at ${lead.company}. Stage: ${lead.stage}. Value: ${lead.dealValue}. Notes: ${lead.notes}`;

    return this.getActiveProvider().complete({
      system: 'You summarize sales leads concisely for sales agents.',
      prompt,
      maxTokens: 100,
    });
  }

  async answerSalesQuery(question: string, context: string): Promise<string> {
    return this.getActiveProvider().complete({
      system: `You are an AI Sales & Operations assistant for SMEs.
Context: ${context}
Be concise, actionable, and practical.`,
      prompt: question,
      maxTokens: 500,
    });
  }
}
