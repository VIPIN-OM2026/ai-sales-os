import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';
import { LeadSource, LeadStage, Industry } from '@prisma/client';

export class CreateLeadDto {
  @IsString()
  fullName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadStage)
  @IsOptional()
  stage?: LeadStage;

  @IsNumber()
  @IsOptional()
  dealValue?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  assignedUserId?: string;
}
