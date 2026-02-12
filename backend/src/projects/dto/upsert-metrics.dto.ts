import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertMetricsDto {
  @IsInt()
  messagesCount: number;

  @IsNumber()
  avgDurationSec: number;

  @IsNumber()
  totalDurationSec: number;

  @IsNumber()
  participationRate: number;

  @IsNumber()
  ircScore: number;

  @IsNumber()
  tonalityAvg: number;

  @IsNumber()
  highEmotionShare: number;

  @IsOptional()
  @IsString()
  ircInterpretation?: string;

  @IsOptional()
  @IsString()
  emotionalClimate?: string;
}
