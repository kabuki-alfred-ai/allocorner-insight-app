import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStrategicActionDto, UpdateStrategicActionDto } from './dto/create-strategic-action.dto.js';

@Injectable()
export class StrategicActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId: string) {
    return this.prisma.strategicAction.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }

  async create(projectId: string, dto: CreateStrategicActionDto) {
    return this.prisma.strategicAction.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description ?? '',
        priority: dto.priority ?? 'MOYENNE',
        timeline: dto.timeline ?? '',
        resources: dto.resources ?? '',
        position: dto.position ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateStrategicActionDto) {
    return this.prisma.strategicAction.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.strategicAction.delete({
      where: { id },
    });
  }
}
