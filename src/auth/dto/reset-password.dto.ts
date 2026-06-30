// Reset-password body — token from email link + new password.
import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(1)
  token!: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'password must contain at least one uppercase letter and one number',
  })
  password!: string;
}
