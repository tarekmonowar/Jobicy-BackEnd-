// JWT signing, refresh-token storage, rotation, and revocation.
import { createHash, randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/generated/prisma';
import { appError } from '@/common/constants/error-codes';
import { AppConfig } from '@/config/configuration';
import { PrismaService } from '@/prisma/prisma.service';
import { expiresAtFromTtl } from '@/auth/utils/ttl.util';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Access-token payload signed into the JWT. */
interface AccessTokenPayload {
  sub: string;
  role: User['role'];
  email: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Signs a short-lived access JWT for the given user. */
  signAccess(user: User): string {
    const payload: AccessTokenPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      secret: this.config.get('jwt.accessSecret', { infer: true }),
      expiresIn: this.config.get('jwt.accessTtl', { infer: true }),
    });
  }

  /**
   * Issues a new access + refresh pair and persists the hashed refresh token.
   * Returns both tokens to the caller (refresh goes into an httpOnly cookie).
   */
  async issuePair(user: User, userAgent?: string): Promise<TokenPair> {
    const accessToken = this.signAccess(user);
    const refreshToken = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    const refreshTtl = this.config.get('jwt.refreshTtl', { infer: true });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent: userAgent ?? null,
        expiresAt: expiresAtFromTtl(refreshTtl),
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Validates the raw refresh token, deletes the old row, and issues a rotated pair.
   * Throws UNAUTHORIZED when the token is missing, expired, or unknown.
   */
  async rotate(rawRefreshToken: string, userAgent?: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing || existing.expiresAt < new Date()) {
      throw appError('UNAUTHORIZED', 'Invalid or expired refresh token');
    }

    // Delete the consumed token before issuing a new one (rotation).
    await this.prisma.refreshToken.delete({ where: { id: existing.id } });

    return this.issuePair(existing.user, userAgent);
  }

  /** Revokes a single refresh token by deleting its DB row. */
  async revoke(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);

    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
  }

  /** Revokes every refresh token for a user (e.g. after password reset). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
