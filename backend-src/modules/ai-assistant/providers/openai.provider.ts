import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CompletionOptions {
  system?: string;
  prompt: string;
  maxTokens?: number;
}

// OpenAI-compatible provider — swap by changing env AI_PROVIDER
@Injectable()
export class OpenAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get('ai.openaiKey');
  }

  async complete(options: CompletionOptions): Promise<string> {
    const messages = [];
    if (options.system) messages.push({ role: 'system', content: options.system });
    messages.push({ role: 'user', content: options.prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: options.maxTokens || 500 }),
    });

    if (!response.ok) {
      this.logger.error(`OpenAI API error: ${response.status}`);
      throw new Error('AI completion failed');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}
