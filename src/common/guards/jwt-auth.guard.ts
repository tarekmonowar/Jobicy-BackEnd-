// Global JWT guard — protects all routes unless marked @Public() (Phase 3 wires globally).
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@/common/constants/metadata-keys';
import { appError } from '@/common/constants/error-codes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /** Allow @Public() routes; otherwise delegate to passport-jwt. */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /** Map passport failures to our standard UNAUTHORIZED error. */
  handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    info: Error | undefined,
  ): TUser {
    if (err || !user) {
      const message = info?.message ?? '';
      if (message.toLowerCase().includes('expired')) {
        throw appError('TOKEN_EXPIRED');
      }
      throw appError('UNAUTHORIZED');
    }
    return user;
  }
}
