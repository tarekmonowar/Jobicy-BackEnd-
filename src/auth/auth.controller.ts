// Auth HTTP routes — register, login, refresh, logout, password reset, verify email.
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from '@/auth/auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { AuthedRequest, JwtPayload } from '@/common/types/authed-request.type';
import { AppConfig } from '@/config/configuration';
import { RegisterDto } from '@/auth/dto/register.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { parseTtlToMs } from '@/auth/utils/ttl.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /** Create a new account and send a verification email (stub logs the link). */
  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** Authenticate with email/password; sets httpOnly refresh cookie on success. */
  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.login(dto, userAgent);

    this.setRefreshCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  /** Exchange the refresh cookie for a new access token (rotates refresh). */
  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieName = this.config.get('cookie.name', { infer: true });
    const rawRefresh = req.cookies?.[cookieName] as string | undefined;
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.refresh(rawRefresh ?? '', userAgent);

    this.setRefreshCookie(res, result.refreshToken);

    return { accessToken: result.accessToken };
  }

  /** Revoke refresh token and clear the cookie. */
  @Post('logout')
  async logout(
    @Req() req: AuthedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieName = this.config.get('cookie.name', { infer: true });
    const rawRefresh = req.cookies?.[cookieName] as string | undefined;

    const result = await this.authService.logout(rawRefresh);
    this.clearRefreshCookie(res);

    return result;
  }

  /** Request a password-reset link (always returns success). */
  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /** Set a new password using a reset token from email. */
  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  /** Activate account via verification token (from email link). */
  @Public()
  @Get('verify-email/:token')
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  /** Return the currently authenticated user. */
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.id);
  }

  /** Write the refresh token as an httpOnly cookie per claude.md §2.6. */
  private setRefreshCookie(res: Response, refreshToken: string): void {
    const cookie = this.config.get('cookie', { infer: true });
    const refreshTtl = this.config.get('jwt.refreshTtl', { infer: true });

    res.cookie(cookie.name, refreshToken, {
      httpOnly: true,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      domain: cookie.domain,
      maxAge: parseTtlToMs(refreshTtl),
    });
  }

  /** Clear the refresh cookie on logout. */
  private clearRefreshCookie(res: Response): void {
    const cookie = this.config.get('cookie', { infer: true });

    res.clearCookie(cookie.name, {
      httpOnly: true,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      domain: cookie.domain,
    });
  }
}
