import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ResourcesService } from './resources.service.js';
import { ResourceGeneratorService } from './resource-generator.service.js';
import { CreateResourceDto, UpdateResourceDto } from './dto/create-resource.dto.js';

@Controller('projects/:pid/resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly resourceGeneratorService: ResourceGeneratorService,
  ) {}

  @Get()
  @UseGuards(ProjectMemberGuard)
  findAll(@Param('pid') projectId: string) {
    return this.resourcesService.findAll(projectId);
  }

  // Note: ProjectMemberGuard is NOT used here because it reads request.params.id
  // which conflicts with the resource :id param. Access is checked in the service.
  @Get(':id/download')
  async download(
    @Param('pid') projectId: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = (req as any).user;
    return this.resourceGeneratorService.generate(projectId, id, user, res);
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
