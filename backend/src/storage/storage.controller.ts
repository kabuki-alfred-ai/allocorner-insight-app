import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Res,
  Header,
  Query,
} from '@nestjs/common';
// import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from './storage.service.js';

@Controller('storage')
@UseGuards(JwtAuthGuard, ProjectMemberGuard)
export class StorageController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get('audio/:projectId/:messageId/url')
  async getAudioUrl(
    @Param('projectId') projectId: string,
    @Param('messageId') messageId: string,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.projectId !== projectId) {
      throw new NotFoundException('Message not found in this project');
    }

    if (!message.audioKey) {
      throw new NotFoundException('No audio file attached to this message');
    }

    const url = await this.storage.getPresignedAudioUrl(message.audioKey);
    return { url };
  }

  @Get('logo/:projectId')
  async getLogoUrl(@Param('projectId') projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.logoKey) {
      throw new NotFoundException('No logo attached to this project');
    }

    const url = await this.storage.getPresignedLogoUrl(project.logoKey);
    return { url };
  }

  @Get('audio/:projectId/:messageId/stream')
  @Header('Content-Type', 'audio/mpeg')
  @Header('Accept-Ranges', 'bytes')
  async streamAudio(
    @Param('projectId') projectId: string,
    @Param('messageId') messageId: string,
    @Res() res: any,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.projectId !== projectId) {
      throw new NotFoundException('Message not found in this project');
    }

    if (!message.audioKey) {
      throw new NotFoundException('No audio file attached to this message');
    }

    const stream = await this.storage.getAudioStream(message.audioKey);
    
    // Set content disposition pour le téléchargement avec le bon nom de fichier
    res.setHeader('Content-Disposition', `inline; filename="${message.filename}"`);
    
    stream.pipe(res);
  }
}
