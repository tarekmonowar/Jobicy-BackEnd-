// Express request extended with JWT user payload attached by JwtStrategy.
import { Request } from 'express';
import { Role } from '@/generated/prisma';

/** Payload attached to req.user after JWT validation. */
export interface JwtPayload {
  id: string;
  role: Role;
  email: string;
}

export type AuthedRequest = Request & {
  user: JwtPayload;
};
