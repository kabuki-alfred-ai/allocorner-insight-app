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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post(':id/logo')
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No logo file provided');
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PNG, JPG, and WEBP are supported.',
      );
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 2MB limit');
    }

    return this.projectsService.uploadLogo(id, file);
  }
}
