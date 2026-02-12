import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { UpsertMetricsDto } from './dto/upsert-metrics.dto.js';
import { UpsertPlutchikDto } from './dto/upsert-plutchik.dto.js';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string; role: string }) {
    return this.projectsService.findAll(user as any);
  }

  @Get(':id')
  @UseGuards(ProjectMemberGuard)
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Put(':id/metrics')
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  upsertMetrics(
    @Param('id') id: string,
    @Body() dto: UpsertMetricsDto,
  ) {
    return this.projectsService.upsertMetrics(id, dto);
  }

  @Put(':id/plutchik')
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  upsertPlutchik(
    @Param('id') id: string,
    @Body() dto: UpsertPlutchikDto,
  ) {
    return this.projectsService.upsertPlutchik(id, dto);
  }
}
