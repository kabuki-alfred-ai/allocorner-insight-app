import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto.js';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsBoolean()
  wrappedPublished?: boolean;

  @IsOptional()
  @IsObject()
  wrappedTheme?: { primaryColor: string; bgColor: string; textColor: string };
}
