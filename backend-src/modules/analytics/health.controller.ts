import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Controller()
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  // Root endpoint — Railway sometimes checks /
  @Get()
  root() {
    return { status: 'ok', service: 'AI Sales OS API', version: '1.0.0' };
  }

  // Health endpoint — used by Railway healthcheck
  @Get('api/v1/health')
  async health() {
    const dbOk = await this.db.healthCheck();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: dbOk ? 'up' : 'connecting',
      },
    };
  }
}
