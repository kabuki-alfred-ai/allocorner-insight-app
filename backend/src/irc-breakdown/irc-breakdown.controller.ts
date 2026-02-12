import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ProjectMemberGuard } from '../common/guards/project-member.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { IrcBreakdownService } from './irc-breakdown.service.js';
import { CreateIrcBreakdownDto } from './dto/create-irc-breakdown.dto.js';

@Controller('projects/:pid/irc-breakdown')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IrcBreakdownController {
  constructor(private readonly ircBreakdownService: IrcBreakdownService) {}

  @Get()
  @UseGuards(ProjectMemberGuard)
  findOne(@Param('pid') projectId: string) {
    return this.ircBreakdownService.findOne(projectId);
  }

  @Post()
  @Roles(Role.SUPERADMIN)
  upsert(
    @Param('pid') projectId: string,
    @Body() dto: CreateIrcBreakdownDto,
  ) {
    return this.ircBreakdownService.upsert(projectId, dto);
  }
}
