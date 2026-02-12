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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { FeaturedVerbatimsService } from './featured-verbatims.service.js';
import { CreateFeaturedVerbatimDto } from './dto/create-featured-verbatim.dto.js';

@Controller('projects/:pid/featured-verbatims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeaturedVerbatimsController {
  constructor(private readonly service: FeaturedVerbatimsService) {}

  @Get()
  @UseGuards(ProjectMemberGuard)
  findAll(@Param('pid') projectId: string) {
    return this.service.findAll(projectId);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(
    @Param('pid') projectId: string,
    @Body() dto: CreateFeaturedVerbatimDto,
  ) {
    return this.service.create(projectId, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
