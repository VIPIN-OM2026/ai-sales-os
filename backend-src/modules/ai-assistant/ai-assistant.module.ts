import { Module } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';

@Module({
  controllers: [AiAssistantController],
  providers: [AiAssistantService, OpenAiProvider, AnthropicProvider],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
