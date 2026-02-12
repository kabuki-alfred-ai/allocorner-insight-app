import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { TrendsService } from './trends.service.js';
import { UpsertTrendsDto } from './dto/upsert-trends.dto.js';

@Controller('projects/:pid/trends')
@UseGuards(JwtAuthGuard, RolesGuard, ProjectMemberGuard)
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  @Get()
  findOne(@Param('pid') pid: string) {
    return this.trendsService.findOne(pid);
  }

  @Put()
  @Roles(Role.SUPERADMIN)
  upsert(@Param('pid') pid: string, @Body() dto: UpsertTrendsDto) {
    return this.trendsService.upsert(pid, dto);
  }
}
