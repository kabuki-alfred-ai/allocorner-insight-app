import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmotionalLoad, Tone } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  filename: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  speaker?: string;

  @IsOptional()
  @IsString()
  transcriptTxt?: string;

  @IsOptional()
  @IsEnum(EmotionalLoad)
  emotionalLoad?: EmotionalLoad;

  @IsOptional()
  @IsEnum(Tone)
  tone?: Tone;

  @IsOptional()
  @IsString()
  quote?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  themeIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emotions?: string[];
}
