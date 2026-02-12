import { IsOptional, IsString, IsEnum } from 'class-validator';
import { EmotionalLoad } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class QueryMessagesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  themeId?: string;

  @IsOptional()
  @IsString()
  emotion?: string;

  @IsOptional()
  @IsEnum(EmotionalLoad)
  emotionalLoad?: EmotionalLoad;

  @IsOptional()
  @IsString()
  search?: string;
}
