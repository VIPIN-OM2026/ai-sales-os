import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
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
