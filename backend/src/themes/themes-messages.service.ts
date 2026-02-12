import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ThemesMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère tous les messages associés à un thème
   */
  async findMessagesByTheme(themeId: string, projectId: string) {
    const theme = await this.prisma.theme.findFirst({
      where: { id: themeId, projectId },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with id "${themeId}" not found`);
    }

    const messageThemes = await this.prisma.messageTheme.findMany({
      where: { themeId },
      include: {
        message: {
          include: {
            messageThemes: { include: { theme: true } },
            messageEmotions: true,
          },
        },
      },
    });

    return messageThemes.map((mt) => mt.message);
  }

  /**
   * Récupère tous les messages disponibles pour association (avec indicateur d'association)
   */
  async findAvailableMessages(themeId: string, projectId: string) {
    const theme = await this.prisma.theme.findFirst({
      where: { id: themeId, projectId },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with id "${themeId}" not found`);
    }

    const messages = await this.prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        messageThemes: { where: { themeId } },
        messageEmotions: true,
      },
    });

    return messages.map((message) => ({
      ...message,
      isAssociated: message.messageThemes.length > 0,
      messageThemes: undefined, // Supprimer pour alléger la réponse
    }));
  }

  /**
   * Associe un message à un thème
   */
  async associateMessage(themeId: string, messageId: string, projectId: string) {
    const theme = await this.prisma.theme.findFirst({
      where: { id: themeId, projectId },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with id "${themeId}" not found`);
    }

    const message = await this.prisma.message.findFirst({
      where: { id: messageId, projectId },
    });

    if (!message) {
      throw new NotFoundException(`Message with id "${messageId}" not found`);
    }

    await this.prisma.messageTheme.upsert({
      where: {
        messageId_themeId: {
          messageId,
          themeId,
        },
      },
      update: {},
      create: {
        messageId,
        themeId,
      },
    });

    // Mettre à jour le compteur du thème
    await this.updateThemeCount(themeId);

    return { associated: true };
  }

  /**
   * Dissocie un message d'un thème
   */
  async dissociateMessage(themeId: string, messageId: string, projectId: string) {
    const theme = await this.prisma.theme.findFirst({
      where: { id: themeId, projectId },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with id "${themeId}" not found`);
    }

    await this.prisma.messageTheme.deleteMany({
      where: {
        messageId,
        themeId,
      },
    });

    // Mettre à jour le compteur du thème
    await this.updateThemeCount(themeId);

    return { dissociated: true };
  }

  /**
   * Associe plusieurs messages à un thème en batch
   */
  async associateMessagesBatch(
    themeId: string,
    messageIds: string[],
    projectId: string,
  ) {
    const theme = await this.prisma.theme.findFirst({
      where: { id: themeId, projectId },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with id "${themeId}" not found`);
    }

    // Vérifier que tous les messages existent
    const messages = await this.prisma.message.findMany({
      where: {
        id: { in: messageIds },
        projectId,
      },
    });

    if (messages.length !== messageIds.length) {
      throw new NotFoundException('Some messages were not found');
    }

    // Créer les associations
    await this.prisma.$transaction(
      messageIds.map((messageId) =>
        this.prisma.messageTheme.upsert({
          where: {
            messageId_themeId: {
              messageId,
              themeId,
            },
          },
          update: {},
          create: {
            messageId,
            themeId,
          },
        }),
      ),
    );

    // Mettre à jour le compteur du thème
    await this.updateThemeCount(themeId);

    return { associated: messageIds.length };
  }

  /**
   * Met à jour le compteur de messages d'un thème
   */
  private async updateThemeCount(themeId: string) {
    const count = await this.prisma.messageTheme.count({
      where: { themeId },
    });

    await this.prisma.theme.update({
      where: { id: themeId },
      data: { count },
    });

    return count;
  }
}
