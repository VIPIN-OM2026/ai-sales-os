import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

// Simple health endpoint for Render uptime checks
@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async check() {
    const dbOk = await this.db.healthCheck();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: { database: dbOk ? 'up' : 'down', api: 'up' },
    };
  }
}
