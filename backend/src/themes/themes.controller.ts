import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ThemesService } from './themes.service.js';
import { CreateThemeDto } from './dto/create-theme.dto.js';
import { UpdateThemeDto } from './dto/update-theme.dto.js';

class SetTotemMessageDto {
  @IsOptional()
  @IsString()
  messageId!: string | null;
}

@Controller('projects/:pid/themes')
@UseGuards(JwtAuthGuard, RolesGuard, ProjectMemberGuard)
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  findAll(@Param('pid') pid: string) {
    return this.themesService.findAll(pid);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Param('pid') pid: string,
  ) {
    return this.themesService.findOne(id, pid);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(@Param('pid') pid: string, @Body() dto: CreateThemeDto) {
    return this.themesService.create(pid, dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
    return this.themesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.themesService.remove(id);
  }

  /**
   * POST /projects/:pid/themes/:id/totem
   * Définit le verbatim totem pour un thème
   */
  @Post(':id/totem')
  @Roles(Role.SUPERADMIN)
  setTotemMessage(
    @Param('id') themeId: string,
    @Param('pid') projectId: string,
    @Body() dto: SetTotemMessageDto,
  ) {
    return this.themesService.setTotemMessage(themeId, dto.messageId, projectId);
  }
}
