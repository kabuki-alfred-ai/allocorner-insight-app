import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateThemeDto } from './dto/create-theme.dto.js';
import { UpdateThemeDto } from './dto/update-theme.dto.js';

@Injectable()
export class ThemesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(projectId: string) {
    return this.prisma.theme.findMany({
      where: { projectId },
      orderBy: { count: 'desc' },
      include: {
        keywords: true,
        totemMessage: {
          select: {
            id: true,
            filename: true,
            transcriptTxt: true,
            duration: true,
            speaker: true,
          },
        },
      },
    });
  }

  findOne(id: string, projectId: string) {
    return this.prisma.theme.findFirst({
      where: { id, projectId },
      include: {
        keywords: true,
        totemMessage: {
          select: {
            id: true,
            filename: true,
            transcriptTxt: true,
            duration: true,
            speaker: true,
          },
        },
      },
    });
  }

  create(projectId: string, dto: CreateThemeDto) {
    return this.prisma.theme.create({
      data: { ...dto, projectId },
      include: {
        keywords: true,
        totemMessage: {
          select: {
            id: true,
            filename: true,
            transcriptTxt: true,
            duration: true,
            speaker: true,
          },
        },
      },
    });
  }

  update(id: string, dto: UpdateThemeDto) {
    return this.prisma.theme.update({
      where: { id },
      data: dto,
      include: {
        keywords: true,
        totemMessage: {
          select: {
            id: true,
            filename: true,
            transcriptTxt: true,
            duration: true,
            speaker: true,
          },
        },
      },
    });
  }

  remove(id: string) {
    return this.prisma.theme.delete({
      where: { id },
    });
  }

  /**
   * Définit le verbatim totem pour un thème
   */
  async setTotemMessage(themeId: string, messageId: string | null, projectId: string) {
    const theme = await this.prisma.theme.findFirst({
      where: { id: themeId, projectId },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with id "${themeId}" not found`);
    }

    // Si un messageId est fourni, vérifier qu'il existe et appartient au projet
    if (messageId) {
      const message = await this.prisma.message.findFirst({
        where: { id: messageId, projectId },
      });

      if (!message) {
        throw new NotFoundException(`Message with id "${messageId}" not found`);
      }

      // Vérifier que le message est associé au thème
      const isAssociated = await this.prisma.messageTheme.findFirst({
        where: { messageId, themeId },
      });

      if (!isAssociated) {
        throw new NotFoundException(`Message is not associated with this theme`);
      }
    }

    const updatedTheme = await this.prisma.theme.update({
      where: { id: themeId },
      data: { 
        totemMessageId: messageId,
        // Mettre à jour verbatimTotem avec la transcription du message
        verbatimTotem: messageId ? await this.getMessageTranscript(messageId) : '',
      },
      include: {
        totemMessage: {
          select: {
            id: true,
            filename: true,
            transcriptTxt: true,
            duration: true,
            speaker: true,
          },
        },
      },
    });

    return updatedTheme;
  }

  private async getMessageTranscript(messageId: string): Promise<string> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { transcriptTxt: true, filename: true },
    });

    if (!message) return '';
    
    // Utiliser la transcription ou un extrait du nom de fichier
    return message.transcriptTxt || `Message ${message.filename}`;
  }
}
