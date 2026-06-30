// Forgot-password body — always returns success (no user enumeration).
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}
