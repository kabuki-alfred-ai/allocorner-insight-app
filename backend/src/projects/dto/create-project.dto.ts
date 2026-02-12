import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  clientName: string;

  @IsString()
  title: string;

  @IsString()
  dates: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  analyst?: string;

  @IsOptional()
  @IsString()
  methodology?: string;

  @IsOptional()
  @IsInt()
  participantsEstimated?: number;
}
