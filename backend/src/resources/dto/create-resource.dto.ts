import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  fileKey?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  fileKey?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
