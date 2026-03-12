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

    // Parser les champs JSON qui peuvent être stockés sous forme de chaînes ou d'objets
    const result = {
      ...trends,
      mainTrends: this.parseJsonField(trends.mainTrends),
      strengths: this.parseJsonField(trends.strengths),
      recurringWords: this.parseJsonField(trends.recurringWords),
    };

    return result;
  }

  async upsert(projectId: string, dto: UpsertTrendsDto) {
    // S'assurer que les données sont stockées sous le bon format d'objets plats
    const sanitizeTrendItems = (items: any[]) => {
      if (!Array.isArray(items)) return [];
      return items.map((item) => {
        if (typeof item === 'string') return { title: item, content: '' };
        return {
          title: String(item?.title || item?.name || ''),
          content: String(item?.content || item?.description || ''),
        };
      });
    };

    const data = {
      mainTrends: sanitizeTrendItems(dto.mainTrends || []),
      strengths: sanitizeTrendItems(dto.strengths || []),
      recurringWords: Array.isArray(dto.recurringWords) ? dto.recurringWords : [],
      weakSignal: dto.weakSignal || '',
      weakSignalDetail: dto.weakSignalDetail || '',
    };

    return this.prisma.trends.upsert({
      where: { projectId },
      create: { ...data, projectId },
      update: data,
    });
  }

  private parseJsonField(field: any): any[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      const trimmed = field.trim();
      if (trimmed === '' || trimmed === '[]' || trimmed === '{}') return [];
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    // Si c'est un objet (mais pas un tableau), on essaie de voir si c'est un résultat Prisma JSON
    if (typeof field === 'object' && field !== null) {
      // Si c'est un objet avec des clés numériques (ex: {"0":{...}}), on extrait les valeurs
      const values = Object.values(field);
      return values.every(v => v !== null) ? values : [];
    }
    return [];
  }
}
