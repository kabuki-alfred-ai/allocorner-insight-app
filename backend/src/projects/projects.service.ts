import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { UpsertMetricsDto } from './dto/upsert-metrics.dto.js';
import { UpsertPlutchikDto } from './dto/upsert-plutchik.dto.js';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        ...dto,
        createdById: userId,
        members: {
          create: { userId },
        },
      },
      include: {
        metrics: true,
        plutchik: true,
        members: { include: { user: true } },
      },
    });
  }

  async findAll(user: { id: string; role: Role }) {
    const where =
      user.role === Role.SUPERADMIN
        ? {}
        : { members: { some: { userId: user.id } } };

    return this.prisma.project.findMany({
      where,
      include: {
        metrics: true,
        plutchik: true,
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        metrics: true,
        plutchik: true,
        ircBreakdown: true,
        objectives: { orderBy: { position: 'asc' } },
        strategicActions: { orderBy: { position: 'asc' } },
        resources: { orderBy: { position: 'asc' } },
        themes: {
          select: {
            id: true,
            name: true,
            count: true,
            color: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureExists(id);

    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    return this.prisma.project.delete({ where: { id } });
  }

  async upsertMetrics(projectId: string, dto: UpsertMetricsDto) {
    await this.ensureExists(projectId);

    return this.prisma.projectMetrics.upsert({
      where: { projectId },
      create: { projectId, ...dto },
      update: dto,
    });
  }

  async upsertPlutchik(projectId: string, dto: UpsertPlutchikDto) {
    await this.ensureExists(projectId);

    return this.prisma.projectPlutchik.upsert({
      where: { projectId },
      create: { projectId, ...dto },
      update: dto,
    });
  }

  async uploadLogo(projectId: string, file: Express.Multer.File) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, logoKey: true },
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    // Delete old logo if exists
    if (project.logoKey) {
      try {
        await this.storage.deleteLogo(project.logoKey);
      } catch (error) {
        // Ignore error if old logo doesn't exist
      }
    }

    // Upload new logo
    const logoKey = await this.storage.uploadLogo(
      projectId,
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    // Update project with new logo key
    return this.prisma.project.update({
      where: { id: projectId },
      data: { logoKey },
    });
  }

  private async ensureExists(id: string) {
    const count = await this.prisma.project.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException(`Project ${id} not found`);
    }
  }
}
