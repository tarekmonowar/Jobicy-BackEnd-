// Safe user shape returned by auth endpoints — never includes password.
import { Role, User } from '@/generated/prisma';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

/** Map a Prisma User row to the public API shape. */
export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}
