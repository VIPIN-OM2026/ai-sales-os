import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { buildPaginationParams, buildPaginatedResult } from '../../common/utilities/pagination.util';

// Single source of truth for all lead DB queries
@Injectable()
export class LeadsRepository {
  constructor(private readonly db: DatabaseService) {}

  private readonly selectFields = {
    id: true, fullName: true, email: true, phone: true, company: true,
    industry: true, source: true, stage: true, aiScore: true, dealValue: true,
    notes: true, tags: true, lastContactedAt: true, createdAt: true, updatedAt: true,
    assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
  };

  async create(organizationId: string, dto: CreateLeadDto) {
    return this.db.lead.create({
      data: { ...dto, organizationId },
      select: this.selectFields,
    });
  }

  async findAll(organizationId: string, filters: FilterLeadsDto) {
    const { page, limit, skip } = buildPaginationParams(filters);

    const where: any = {
      organizationId,
      deletedAt: null,
      ...(filters.stage && { stage: filters.stage }),
      ...(filters.source && { source: filters.source }),
      ...(filters.industry && { industry: filters.industry }),
      ...(filters.assignedUserId && { assignedUserId: filters.assignedUserId }),
      ...(filters.search && {
        OR: [
          { fullName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { company: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.db.lead.findMany({ where, skip, take: limit, select: this.selectFields, orderBy: { createdAt: 'desc' } }),
      this.db.lead.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, limit);
  }

  async findById(id: string, organizationId: string) {
    return this.db.lead.findFirst({
      where: { id, organizationId, deletedAt: null },
      select: { ...this.selectFields, activities: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateLeadDto) {
    return this.db.lead.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
      select: this.selectFields,
    });
  }

  async softDelete(id: string) {
    return this.db.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateAiScore(id: string, score: number) {
    return this.db.lead.update({
      where: { id },
      data: { aiScore: score },
    });
  }
}
