import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/guards/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.analyticsService.getDashboardMetrics(user.organizationId);
  }

  @Get('pipeline')
  getPipeline(@CurrentUser() user: any) {
    return this.analyticsService.getPipelineSummary(user.organizationId);
  }
}
