import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '../../common/database/database.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { ResourceNotFoundException } from '../../common/exceptions/app.exception';

// Processes workflow trigger events and executes step chains
@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(private readonly db: DatabaseService) {}

  async createWorkflow(organizationId: string, dto: CreateWorkflowDto) {
    const workflow = await this.db.workflow.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        triggerEvent: dto.triggerEvent,
        steps: {
          create: dto.steps.map((step, index) => ({
            stepOrder: index,
            stepType: step.stepType,
            config: step.config || {},
          })),
        },
      },
      include: { steps: true },
    });

    return { message: 'Workflow created', data: workflow };
  }

  async getWorkflows(organizationId: string) {
    const workflows = await this.db.workflow.findMany({
      where: { organizationId },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return { message: 'OK', data: workflows };
  }

  async toggleWorkflowStatus(id: string, organizationId: string) {
    const workflow = await this.db.workflow.findFirst({ where: { id, organizationId } });
    if (!workflow) throw new ResourceNotFoundException('Workflow', id);

    const newStatus = workflow.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = await this.db.workflow.update({
      where: { id },
      data: { status: newStatus },
    });
    return { message: `Workflow ${newStatus.toLowerCase()}`, data: updated };
  }

  // Triggered by event emitter when a lead is created
  @OnEvent('lead.created')
  async handleLeadCreated(payload: { leadId: string; organizationId: string }) {
    await this.triggerWorkflowsForEvent('lead.created', payload);
  }

  @OnEvent('lead.stage_changed')
  async handleLeadStageChanged(payload: { leadId: string; organizationId: string; newStage: string }) {
    await this.triggerWorkflowsForEvent('lead.stage_changed', payload);
  }

  private async triggerWorkflowsForEvent(event: string, context: Record<string, any>) {
    const activeWorkflows = await this.db.workflow.findMany({
      where: { organizationId: context.organizationId, triggerEvent: event, status: 'ACTIVE' },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });

    for (const workflow of activeWorkflows) {
      await this.db.workflowRun.create({
        data: {
          workflowId: workflow.id,
          leadId: context.leadId,
          context,
          status: 'running',
        },
      });

      await this.db.workflow.update({
        where: { id: workflow.id },
        data: { triggerCount: { increment: 1 } },
      });

      this.logger.log(`Workflow triggered: ${workflow.name} for lead ${context.leadId}`);
    }
  }
}
