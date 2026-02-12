import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRecommendationDto } from './dto/create-recommendation.dto.js';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto.js';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: string) {
    return this.prisma.recommendation.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }

  create(projectId: string, dto: CreateRecommendationDto) {
    return this.prisma.recommendation.create({
      data: { ...dto, projectId },
    });
  }

  update(id: string, dto: UpdateRecommendationDto) {
    return this.prisma.recommendation.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.recommendation.delete({
      where: { id },
    });
  }
}
