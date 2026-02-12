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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ResourcesService } from './resources.service.js';
import { CreateResourceDto, UpdateResourceDto } from './dto/create-resource.dto.js';

@Controller('projects/:pid/resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @UseGuards(ProjectMemberGuard)
  findAll(@Param('pid') projectId: string) {
    return this.resourcesService.findAll(projectId);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(
    @Param('pid') projectId: string,
    @Body() dto: CreateResourceDto,
  ) {
    return this.resourcesService.create(projectId, dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
