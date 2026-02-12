import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransversalDto } from './dto/create-transversal.dto.js';
import { UpdateTransversalDto } from './dto/update-transversal.dto.js';

@Injectable()
export class TransversalService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: string) {
    return this.prisma.transversalAnalysis.findMany({
      where: { projectId },
      orderBy: [{ axis: 'asc' }, { category: 'asc' }],
    });
  }

  create(projectId: string, dto: CreateTransversalDto) {
    return this.prisma.transversalAnalysis.create({
      data: {
        projectId,
        axis: dto.axis,
        category: dto.category,
        content: dto.content ?? '',
      },
    });
  }

  update(id: string, dto: UpdateTransversalDto) {
    return this.prisma.transversalAnalysis.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.transversalAnalysis.delete({
      where: { id },
    });
  }
}
