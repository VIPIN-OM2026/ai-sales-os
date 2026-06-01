import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CompletionOptions {
  system?: string;
  prompt: string;
  maxTokens?: number;
}

@Injectable()
export class AnthropicProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = config.get('ai.anthropicKey');
  }

  async complete(options: CompletionOptions): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: options.maxTokens || 500,
        system: options.system,
        messages: [{ role: 'user', content: options.prompt }],
      }),
    });

    if (!response.ok) {
      this.logger.error(`Anthropic API error: ${response.status}`);
      throw new Error('AI completion failed');
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }
}
