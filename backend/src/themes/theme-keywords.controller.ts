import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ThemesService } from './themes.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('themes/:themeId/keywords')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThemeKeywordsController {
  constructor(
    private readonly themesService: ThemesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  async addKeyword(
    @Param('themeId') themeId: string,
    @Body('keyword') keyword: string,
  ) {
    return this.prisma.themeKeyword.create({
      data: {
        themeId,
        keyword: keyword.toLowerCase().trim(),
      },
    });
  }

  @Delete(':keywordId')
  @Roles(Role.SUPERADMIN)
  async removeKeyword(
    @Param('themeId') _themeId: string,
    @Param('keywordId') keywordId: string,
  ) {
    return this.prisma.themeKeyword.delete({
      where: { id: keywordId },
    });
  }
}
