import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpsertTrendsDto {
  @IsOptional()
  @IsArray()
  mainTrends?: any[];

  @IsOptional()
  @IsArray()
  strengths?: any[];

  @IsOptional()
  @IsArray()
  recurringWords?: any[];

  @IsOptional()
  @IsString()
  weakSignal?: string;

  @IsOptional()
  @IsString()
  weakSignalDetail?: string;
}
