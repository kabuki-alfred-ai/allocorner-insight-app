import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateIrcBreakdownDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  intensity: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  thematicRichness: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  narrativeCoherence: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  originality: number;
}

export class UpdateIrcBreakdownDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  intensity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  thematicRichness?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  narrativeCoherence?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  originality?: number;
}
