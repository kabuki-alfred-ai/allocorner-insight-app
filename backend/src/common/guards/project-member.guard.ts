import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied: no authenticated user');
    }

    // SUPERADMIN always has access
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    const projectId =
      request.params.id || request.params.projectId || request.params.pid;

    if (!projectId) {
      throw new ForbiddenException(
        'Access denied: no project identifier found in request',
      );
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'Access denied: you are not a member of this project',
      );
    }

    return true;
  }
}
