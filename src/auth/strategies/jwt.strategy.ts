// Passport JWT strategy — validates Bearer access tokens and attaches user to req.
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '@/config/configuration';
import { JwtPayload } from '@/common/types/authed-request.type';
import { Role } from '@/generated/prisma';

/** Decoded JWT payload before mapping to req.user. */
interface JwtStrategyPayload {
  sub: string;
  role: Role;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.accessSecret', { infer: true }),
    });
  }

  /** Maps the verified JWT payload to the shape used by guards and @CurrentUser(). */
  validate(payload: JwtStrategyPayload): JwtPayload {
    return {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
  }
}
