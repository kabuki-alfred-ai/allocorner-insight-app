import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertPlutchikDto {
  @IsNumber()
  joy: number;

  @IsNumber()
  trust: number;

  @IsNumber()
  sadness: number;

  @IsNumber()
  anticipation: number;

  @IsNumber()
  anger: number;

  @IsNumber()
  surprise: number;

  @IsNumber()
  fear: number;

  @IsOptional()
  @IsString()
  cocktailSummary?: string;
}
