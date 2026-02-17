import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Res,
  Req,
  Header,
  Query,
} from '@nestjs/common';
// import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from './storage.service.js';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get('audio/:projectId/:messageId/url')
  @UseGuards(ProjectMemberGuard)
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

  @Get('logo/project/:projectId')
  @UseGuards(ProjectMemberGuard)
  async getLogoUrlByProjectId(@Param('projectId') projectId: string) {
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

  @Public()
  @Get('logo/*')
  @Header('Cache-Control', 'public, max-age=3600')
  async streamLogo(
    @Req() req: any,
    @Res() res: any,
  ) {
    // Extract logoKey from URL path (everything after /api/storage/logo/)
    const fullPath = req.path || req.url;
    const logoKey = fullPath.replace('/api/storage/logo/', '');

    if (!logoKey || logoKey === fullPath) {
      throw new NotFoundException('Logo key is required');
    }

    try {
      const stream = await this.storage.getLogoStream(logoKey);

      // Determine content type based on file extension
      const ext = logoKey.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' :
                          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                          ext === 'svg' ? 'image/svg+xml' :
                          'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      stream.pipe(res);
    } catch (error) {
      throw new NotFoundException('Logo not found');
    }
  }

  @Public()
  @Get('audio/:projectId/:messageId/stream')
  @Header('Content-Type', 'audio/mpeg')
  @Header('Accept-Ranges', 'bytes')
  @Header('Cache-Control', 'public, max-age=3600')
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
