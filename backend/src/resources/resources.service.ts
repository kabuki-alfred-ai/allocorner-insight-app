import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateResourceDto, UpdateResourceDto } from './dto/create-resource.dto.js';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId: string) {
    return this.prisma.projectResource.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.projectResource.findUnique({ where: { id } });
  }

  async create(projectId: string, dto: CreateResourceDto) {
    return this.prisma.projectResource.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description ?? '',
        type: dto.type,
        size: dto.size ?? '',
        fileKey: dto.fileKey,
        position: dto.position ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateResourceDto) {
    return this.prisma.projectResource.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.projectResource.delete({
      where: { id },
    });
  }
}
