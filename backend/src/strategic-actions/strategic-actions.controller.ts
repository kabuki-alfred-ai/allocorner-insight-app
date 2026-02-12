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
import { StrategicActionsService } from './strategic-actions.service.js';
import { CreateStrategicActionDto, UpdateStrategicActionDto } from './dto/create-strategic-action.dto.js';

@Controller('projects/:pid/strategic-actions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StrategicActionsController {
  constructor(private readonly strategicActionsService: StrategicActionsService) {}

  @Get()
  @UseGuards(ProjectMemberGuard)
  findAll(@Param('pid') projectId: string) {
    return this.strategicActionsService.findAll(projectId);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(
    @Param('pid') projectId: string,
    @Body() dto: CreateStrategicActionDto,
  ) {
    return this.strategicActionsService.create(projectId, dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStrategicActionDto,
  ) {
    return this.strategicActionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.strategicActionsService.remove(id);
  }
}
