import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

// All dashboard metrics computed here — single place to optimize queries
@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboardMetrics(organizationId: string) {
    const [
      totalLeads,
      leadsByStage,
      leadsBySource,
      recentActivity,
      topLeads,
    ] = await Promise.all([
      this.db.lead.count({ where: { organizationId, deletedAt: null } }),
      this.getLeadsByStage(organizationId),
      this.getLeadsBySource(organizationId),
      this.getRecentActivity(organizationId),
      this.getTopLeadsByScore(organizationId),
    ]);

    return {
      message: 'OK',
      data: { totalLeads, leadsByStage, leadsBySource, recentActivity, topLeads },
    };
  }

  async getPipelineSummary(organizationId: string) {
    const stages = await this.db.lead.groupBy({
      by: ['stage'],
      where: { organizationId, deletedAt: null },
      _count: { id: true },
      _sum: { dealValue: true },
    });

    const pipeline = stages.map((s) => ({
      stage: s.stage,
      count: s._count.id,
      totalValue: Number(s._sum.dealValue || 0),
    }));

    return { message: 'OK', data: { pipeline } };
  }

  private async getLeadsByStage(organizationId: string) {
    return this.db.lead.groupBy({
      by: ['stage'],
      where: { organizationId, deletedAt: null },
      _count: { id: true },
    });
  }

  private async getLeadsBySource(organizationId: string) {
    return this.db.lead.groupBy({
      by: ['source'],
      where: { organizationId, deletedAt: null },
      _count: { id: true },
    });
  }

  private async getRecentActivity(organizationId: string) {
    return this.db.activityLog.findMany({
      where: { organizationId },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  private async getTopLeadsByScore(organizationId: string) {
    return this.db.lead.findMany({
      where: { organizationId, deletedAt: null, aiScore: { not: null } },
      orderBy: { aiScore: 'desc' },
      take: 10,
      select: { id: true, fullName: true, company: true, aiScore: true, stage: true, dealValue: true },
    });
  }
}
