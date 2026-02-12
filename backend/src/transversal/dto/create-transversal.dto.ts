import { IsOptional, IsString } from 'class-validator';

export class CreateTransversalDto {
  @IsString()
  axis: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  content?: string;
}
