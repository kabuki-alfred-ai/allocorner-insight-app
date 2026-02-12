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
import { TransversalService } from './transversal.service.js';
import { CreateTransversalDto } from './dto/create-transversal.dto.js';
import { UpdateTransversalDto } from './dto/update-transversal.dto.js';

@Controller('projects/:pid/transversal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransversalController {
  constructor(private readonly service: TransversalService) {}

  @Get()
  @UseGuards(ProjectMemberGuard)
  findAll(@Param('pid') projectId: string) {
    return this.service.findAll(projectId);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(
    @Param('pid') projectId: string,
    @Body() dto: CreateTransversalDto,
  ) {
    return this.service.create(projectId, dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTransversalDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
