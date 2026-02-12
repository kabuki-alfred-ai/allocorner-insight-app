import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateIrcBreakdownDto, UpdateIrcBreakdownDto } from './dto/create-irc-breakdown.dto.js';

@Injectable()
export class IrcBreakdownService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(projectId: string) {
    return this.prisma.ircBreakdown.findUnique({
      where: { projectId },
    });
  }

  async upsert(projectId: string, dto: CreateIrcBreakdownDto | UpdateIrcBreakdownDto) {
    const existing = await this.prisma.ircBreakdown.findUnique({
      where: { projectId },
    });

    if (existing) {
      return this.prisma.ircBreakdown.update({
        where: { projectId },
        data: dto,
      });
    }

    return this.prisma.ircBreakdown.create({
      data: {
        projectId,
        intensity: (dto as CreateIrcBreakdownDto).intensity ?? 0,
        thematicRichness: (dto as CreateIrcBreakdownDto).thematicRichness ?? 0,
        narrativeCoherence: (dto as CreateIrcBreakdownDto).narrativeCoherence ?? 0,
        originality: (dto as CreateIrcBreakdownDto).originality ?? 0,
      },
    });
  }
}
