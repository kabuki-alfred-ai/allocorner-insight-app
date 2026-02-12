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
import { ObjectivesService } from './objectives.service.js';
import { CreateObjectiveDto, UpdateObjectiveDto } from './dto/create-objective.dto.js';

@Controller('projects/:pid/objectives')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Get()
  @UseGuards(ProjectMemberGuard)
  findAll(@Param('pid') projectId: string) {
    return this.objectivesService.findAll(projectId);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(
    @Param('pid') projectId: string,
    @Body() dto: CreateObjectiveDto,
  ) {
    return this.objectivesService.create(projectId, dto);
  }

  @Post('reorder')
  @Roles(Role.SUPERADMIN)
  reorder(
    @Param('pid') projectId: string,
    @Body('ids') ids: string[],
  ) {
    return this.objectivesService.reorder(projectId, ids);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateObjectiveDto,
  ) {
    return this.objectivesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.objectivesService.remove(id);
  }
}
