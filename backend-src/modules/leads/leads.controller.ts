import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { CurrentUser } from '../../common/guards/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles('ORG_ADMIN', 'MANAGER', 'SALES_AGENT')
  createLead(@CurrentUser() user: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.createLead(user.organizationId, dto);
  }

  @Get()
  getLeads(@CurrentUser() user: any, @Query() filters: FilterLeadsDto) {
    return this.leadsService.getLeads(user.organizationId, filters);
  }

  @Get(':id')
  getLeadById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.getLeadById(id, user.organizationId);
  }

  @Patch(':id')
  updateLead(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.updateLead(id, user.organizationId, dto);
  }

  @Delete(':id')
  @Roles('ORG_ADMIN', 'MANAGER')
  deleteLead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.deleteLead(id, user.organizationId);
  }
}
