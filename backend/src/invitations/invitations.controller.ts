import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { InvitationsService } from './invitations.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';

@Controller()
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}

  // ─── Project-scoped endpoints (authenticated, SUPERADMIN) ──

  @Post('projects/:pid/invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  create(
    @Param('pid') projectId: string,
    @Body() dto: CreateInvitationDto,
    @CurrentUser('id') invitedById: string,
  ) {
    return this.service.create(projectId, dto.email, invitedById);
  }

  @Get('projects/:pid/invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  findAllForProject(@Param('pid') projectId: string) {
    return this.service.findAllForProject(projectId);
  }

  @Delete('projects/:pid/invitations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  revoke(@Param('id') id: string) {
    return this.service.revoke(id);
  }

  // ─── Public endpoints (no auth) ───────────────────────────

  @Get('invitations/:token')
  validate(@Param('token') token: string) {
    return this.service.validate(token);
  }

  @Post('invitations/:token/accept')
  accept(
    @Param('token') token: string,
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.service.accept(token, dto);
  }
}
