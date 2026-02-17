import { ProcessingStatus, Tone } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsNumber, IsDate } from 'class-validator';

export class UpdateProcessingDto {
  @IsOptional()
  @IsEnum(['PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'])
  processingStatus?: ProcessingStatus;

  @IsOptional()
  @IsString()
  processingError?: string;

  @IsOptional()
  @IsDate()
  processedAt?: Date;

  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @IsOptional()
  @IsString()
  gcpJobId?: string;

  @IsOptional()
  @IsNumber()
  gcpDuration?: number;

  @IsOptional()
  @IsEnum(['POSITIVE', 'NEGATIVE', 'NEUTRAL'])
  tone?: Tone;

  @IsOptional()
  @IsString()
  transcriptTxt?: string;

  @IsOptional()
  @IsString()
  speaker?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}
