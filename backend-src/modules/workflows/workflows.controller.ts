import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CurrentUser } from '../../common/guards/current-user.decorator';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @Roles('ORG_ADMIN', 'MANAGER')
  createWorkflow(@CurrentUser() user: any, @Body() dto: CreateWorkflowDto) {
    return this.workflowsService.createWorkflow(user.organizationId, dto);
  }

  @Get()
  getWorkflows(@CurrentUser() user: any) {
    return this.workflowsService.getWorkflows(user.organizationId);
  }

  @Patch(':id/toggle')
  @Roles('ORG_ADMIN', 'MANAGER')
  toggleStatus(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workflowsService.toggleWorkflowStatus(id, user.organizationId);
  }
}
