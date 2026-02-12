import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerbatimCategory } from '@prisma/client';

export class CreateFeaturedVerbatimDto {
  @IsEnum(VerbatimCategory)
  category: VerbatimCategory;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsString()
  citation: string;

  @IsOptional()
  @IsString()
  implication?: string;
}
