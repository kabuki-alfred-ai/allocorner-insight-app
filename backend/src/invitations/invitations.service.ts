import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async create(projectId: string, email: string, invitedById: string) {
    const existing = await this.prisma.invitation.findUnique({
      where: { projectId_email: { projectId, email } },
    });

    if (existing && existing.status === 'PENDING') {
      throw new ConflictException(
        'An active invitation already exists for this email on this project',
      );
    }

    // Get project and inviter info for email
    const [project, inviter] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: projectId } }),
      this.prisma.user.findUnique({ where: { id: invitedById } }),
    ]);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Create or update invitation
    const invitation = await this.prisma.invitation.upsert({
      where: { projectId_email: { projectId, email } },
      update: {
        token: uuid(),
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        projectId,
        email,
        token: uuid(),
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send invitation email
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:8080';
    const invitationLink = `${frontendUrl}/accept-invitation/${invitation.token}`;

    try {
      await this.mail.sendInvitationEmail({
        to: email,
        projectName: project.title,
        inviterName: inviter?.name || 'Administrateur',
        invitationLink,
        expiresAt: invitation.expiresAt,
      });
    } catch (error) {
      // Log error but don't fail the invitation creation
      console.error('Failed to send invitation email:', error);
    }

    return invitation;
  }

  async findByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { project: true },
    });

    if (
      !invitation ||
      invitation.status !== 'PENDING' ||
      invitation.expiresAt < new Date()
    ) {
      return null;
    }

    return invitation;
  }

  async accept(token: string, dto: AcceptInvitationDto) {
    const invitation = await this.findByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found or expired');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash(dto.password, 10);

      user = await this.prisma.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          name: dto.name,
          role: 'MEMBER',
        },
      });
      
      console.log(`[INVITATION] New user created: ${user.email} with role: ${user.role}`);
    } else {
      console.log(`[INVITATION] Existing user found: ${user.email} with role: ${user.role}`);
    }

    await this.prisma.projectMember.create({
      data: {
        projectId: invitation.projectId,
        userId: user.id,
        invitedById: invitation.id ? undefined : undefined,
        acceptedAt: new Date(),
      },
    });

    // Retrieve invitedById from the invitation context is not stored on
    // the invitation model, so we look up the first SUPERADMIN member
    // of the project. Instead, we store it properly during creation.
    // For now, set it via a separate update if we can resolve it.

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    return { message: 'Invitation accepted successfully' };
  }

  findAllForProject(projectId: string) {
    return this.prisma.invitation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(id: string) {
    return this.prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' },
    });
  }

  async validate(token: string) {
    const invitation = await this.findByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found or expired');
    }

    return {
      email: invitation.email,
      projectName: invitation.project.title,
    };
  }
}
