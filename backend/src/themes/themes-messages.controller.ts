import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsArray, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ThemesMessagesService } from './themes-messages.service.js';

class BatchAssociateDto {
  @IsArray()
  @IsString({ each: true })
  messageIds!: string[];
}

@Controller('projects/:pid/themes/:themeId/messages')
@UseGuards(JwtAuthGuard, RolesGuard, ProjectMemberGuard)
export class ThemesMessagesController {
  constructor(private readonly themesMessagesService: ThemesMessagesService) {}

  /**
   * GET /projects/:pid/themes/:themeId/messages
   * Récupère tous les messages associés à un thème
   */
  @Get()
  findMessagesByTheme(
    @Param('themeId') themeId: string,
    @Param('pid') projectId: string,
  ) {
    return this.themesMessagesService.findMessagesByTheme(themeId, projectId);
  }

  /**
   * GET /projects/:pid/themes/:themeId/messages/available
   * Récupère tous les messages du projet avec indicateur d'association
   */
  @Get('available')
  findAvailableMessages(
    @Param('themeId') themeId: string,
    @Param('pid') projectId: string,
  ) {
    return this.themesMessagesService.findAvailableMessages(themeId, projectId);
  }

  /**
   * POST /projects/:pid/themes/:themeId/messages/batch
   * Associe plusieurs messages en batch
   * NOTE: Cette route doit être définie AVANT :messageId pour éviter les conflits
   */
  @Post('batch')
  @Roles(Role.SUPERADMIN)
  associateBatch(
    @Param('themeId') themeId: string,
    @Param('pid') projectId: string,
    @Body() dto: BatchAssociateDto,
  ) {
    return this.themesMessagesService.associateMessagesBatch(
      themeId,
      dto.messageIds,
      projectId,
    );
  }

  /**
   * POST /projects/:pid/themes/:themeId/messages/:messageId
   * Associe un message à un thème
   */
  @Post(':messageId')
  @Roles(Role.SUPERADMIN)
  associateMessage(
    @Param('themeId') themeId: string,
    @Param('messageId') messageId: string,
    @Param('pid') projectId: string,
  ) {
    return this.themesMessagesService.associateMessage(
      themeId,
      messageId,
      projectId,
    );
  }

  /**
   * DELETE /projects/:pid/themes/:themeId/messages/:messageId
   * Dissocie un message d'un thème
   */
  @Delete(':messageId')
  @Roles(Role.SUPERADMIN)
  dissociateMessage(
    @Param('themeId') themeId: string,
    @Param('messageId') messageId: string,
    @Param('pid') projectId: string,
  ) {
    return this.themesMessagesService.dissociateMessage(
      themeId,
      messageId,
      projectId,
    );
  }
}
