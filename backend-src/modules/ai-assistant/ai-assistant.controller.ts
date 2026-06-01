import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/guards/current-user.decorator';
import { IsString } from 'class-validator';

class AskQueryDto {
  @IsString() question: string;
  @IsString() context: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiAssistantController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Post('query')
  answerQuery(@Body() dto: AskQueryDto) {
    return this.aiService.answerSalesQuery(dto.question, dto.context);
  }
}
