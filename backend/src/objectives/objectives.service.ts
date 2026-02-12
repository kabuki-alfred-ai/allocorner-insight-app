import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateObjectiveDto, UpdateObjectiveDto } from './dto/create-objective.dto.js';

@Injectable()
export class ObjectivesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId: string) {
    return this.prisma.projectObjective.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }

  async create(projectId: string, dto: CreateObjectiveDto) {
    return this.prisma.projectObjective.create({
      data: {
        projectId,
        content: dto.content,
        position: dto.position ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateObjectiveDto) {
    return this.prisma.projectObjective.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.projectObjective.delete({
      where: { id },
    });
  }

  async reorder(projectId: string, ids: string[]) {
    const updates = ids.map((id, index) =>
      this.prisma.projectObjective.update({
        where: { id },
        data: { position: index },
      }),
    );
    await this.prisma.$transaction(updates);
  }
}
