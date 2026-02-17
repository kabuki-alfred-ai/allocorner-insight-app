import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateObjectiveDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class UpdateObjectiveDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
