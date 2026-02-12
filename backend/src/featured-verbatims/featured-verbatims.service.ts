import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFeaturedVerbatimDto } from './dto/create-featured-verbatim.dto.js';

@Injectable()
export class FeaturedVerbatimsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: string) {
    return this.prisma.featuredVerbatim.findMany({
      where: { projectId },
      include: { message: true },
    });
  }

  create(projectId: string, dto: CreateFeaturedVerbatimDto) {
    return this.prisma.featuredVerbatim.create({
      data: {
        projectId,
        category: dto.category,
        messageId: dto.messageId,
        citation: dto.citation,
        implication: dto.implication ?? '',
      },
    });
  }

  remove(id: string) {
    return this.prisma.featuredVerbatim.delete({
      where: { id },
    });
  }
}
