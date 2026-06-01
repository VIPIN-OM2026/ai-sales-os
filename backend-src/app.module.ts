import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './common/database/database.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { LeadsModule } from './modules/leads/leads.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { appConfig, jwtConfig, redisConfig, aiConfig, whatsappConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      load: [appConfig, jwtConfig, redisConfig, aiConfig, whatsappConfig],
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthenticationModule,
    LeadsModule,
    WorkflowsModule,
    AnalyticsModule,
    AiAssistantModule,
  ],
})
export class AppModule {}
