import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateRecommendationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsInt()
  position?: number;
}
