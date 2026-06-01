import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [AnalyticsController, HealthController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
