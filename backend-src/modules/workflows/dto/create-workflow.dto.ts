import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowStepType } from '@prisma/client';

class WorkflowStepDto {
  @IsEnum(WorkflowStepType)
  stepType: WorkflowStepType;

  @IsOptional()
  config?: Record<string, any>;
}

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  triggerEvent: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];
}
