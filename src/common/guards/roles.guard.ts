// Enforces @Roles() metadata against the authenticated user's role.
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { appError } from '@/common/constants/error-codes';
import { AuthedRequest } from '@/common/types/authed-request.type';
import { Role } from '@/generated/prisma';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles decorator — allow any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw appError('FORBIDDEN');
    }

    return true;
  }
}
