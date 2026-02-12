import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateThemeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  temporality?: string;

  @IsOptional()
  @IsString()
  emotionLabel?: string;

  @IsOptional()
  @IsString()
  analysis?: string;

  @IsOptional()
  @IsString()
  verbatimTotem?: string;

  @IsOptional()
  @IsInt()
  count?: number;

  @IsOptional()
  @IsString()
  color?: string;
}
