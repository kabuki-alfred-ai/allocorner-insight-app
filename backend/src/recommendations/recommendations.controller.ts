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
import { RecommendationsService } from './recommendations.service.js';
import { CreateRecommendationDto } from './dto/create-recommendation.dto.js';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto.js';

@Controller('projects/:pid/recommendations')
@UseGuards(JwtAuthGuard, RolesGuard, ProjectMemberGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  findAll(@Param('pid') pid: string) {
    return this.recommendationsService.findAll(pid);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  create(@Param('pid') pid: string, @Body() dto: CreateRecommendationDto) {
    return this.recommendationsService.create(pid, dto);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRecommendationDto) {
    return this.recommendationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.recommendationsService.remove(id);
  }
}
