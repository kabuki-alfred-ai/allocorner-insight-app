import { IsString, IsOptional, IsIn, IsInt, Min } from 'class-validator';

export class CreateStrategicActionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['HAUTE', 'MOYENNE', 'BASSE'])
  priority?: 'HAUTE' | 'MOYENNE' | 'BASSE';

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsString()
  resources?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateStrategicActionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['HAUTE', 'MOYENNE', 'BASSE'])
  priority?: 'HAUTE' | 'MOYENNE' | 'BASSE';

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsString()
  resources?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
