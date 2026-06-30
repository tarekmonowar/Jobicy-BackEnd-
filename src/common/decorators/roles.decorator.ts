// Restricts a route to specific roles (used with RolesGuard in Phase 3+).
import { SetMetadata } from '@nestjs/common';
import { Role } from '@/generated/prisma';

export const ROLES_KEY = 'roles';

/** Attach required roles to a controller method or class. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
