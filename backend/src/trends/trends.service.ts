import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertTrendsDto } from './dto/upsert-trends.dto.js';

@Injectable()
export class TrendsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(projectId: string) {
    const trends = await this.prisma.trends.findUnique({
      where: { projectId },
    });

    if (!trends) {
      return null;
    }

    // Parser les champs JSON qui sont stockés comme des chaînes
    return {
      ...trends,
      mainTrends: this.parseJsonField(trends.mainTrends),
      strengths: this.parseJsonField(trends.strengths),
      recurringWords: this.parseJsonField(trends.recurringWords),
    };
  }

  upsert(projectId: string, dto: UpsertTrendsDto) {
    return this.prisma.trends.upsert({
      where: { projectId },
      create: { ...dto, projectId },
      update: dto,
    });
  }

  private parseJsonField(field: any): any[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}
