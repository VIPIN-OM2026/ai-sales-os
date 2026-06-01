import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadsRepository } from './leads.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { ResourceNotFoundException } from '../../common/exceptions/app.exception';
import { WORKFLOW_EVENTS } from '../../common/constants';

// Thin service: coordinates repo + events. No DB logic here.
@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepo: LeadsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createLead(organizationId: string, dto: CreateLeadDto) {
    const lead = await this.leadsRepo.create(organizationId, dto);

    // Trigger workflow automation
    this.eventEmitter.emit(WORKFLOW_EVENTS.LEAD_CREATED, {
      leadId: lead.id,
      organizationId,
    });

    return { message: 'Lead created', data: lead };
  }

  async getLeads(organizationId: string, filters: FilterLeadsDto) {
    const result = await this.leadsRepo.findAll(organizationId, filters);
    return { message: 'OK', data: result };
  }

  async getLeadById(id: string, organizationId: string) {
    const lead = await this.leadsRepo.findById(id, organizationId);
    if (!lead) throw new ResourceNotFoundException('Lead', id);
    return { message: 'OK', data: lead };
  }

  async updateLead(id: string, organizationId: string, dto: UpdateLeadDto) {
    await this.getLeadById(id, organizationId); // Verify ownership

    const previousStage = dto.stage;
    const lead = await this.leadsRepo.update(id, organizationId, dto);

    if (dto.stage && dto.stage !== previousStage) {
      this.eventEmitter.emit(WORKFLOW_EVENTS.LEAD_STAGE_CHANGED, {
        leadId: id,
        organizationId,
        newStage: dto.stage,
      });
    }

    return { message: 'Lead updated', data: lead };
  }

  async deleteLead(id: string, organizationId: string) {
    await this.getLeadById(id, organizationId);
    await this.leadsRepo.softDelete(id);
    return { message: 'Lead deleted' };
  }
}
