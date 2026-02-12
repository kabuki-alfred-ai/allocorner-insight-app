import { PartialType } from '@nestjs/swagger';
import { CreateRecommendationDto } from './create-recommendation.dto.js';

export class UpdateRecommendationDto extends PartialType(
  CreateRecommendationDto,
) {}
