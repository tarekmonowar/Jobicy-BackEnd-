// Email delivery — stub logs links until SMTP templates are wired in Phase 6.
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /** Log the verification link (stub — replace with Nodemailer in Phase 6). */
  sendVerifyEmail(to: string, link: string): void {
    this.logger.log(`[verify-email] to=${to} link=${link}`);
  }

  /** Log the password-reset link (stub — replace with Nodemailer in Phase 6). */
  sendResetPassword(to: string, link: string): void {
    this.logger.log(`[reset-password] to=${to} link=${link}`);
  }
}
