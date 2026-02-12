import { PartialType } from '@nestjs/swagger';
import { CreateTransversalDto } from './create-transversal.dto.js';

export class UpdateTransversalDto extends PartialType(CreateTransversalDto) {}
