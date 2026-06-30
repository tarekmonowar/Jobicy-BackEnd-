// Registration body — validated before creating a User + Profile.
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsEmail()
  email!: string;

  /** Min 8 chars, at least one uppercase letter and one digit. */
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'password must contain at least one uppercase letter and one number',
  })
  password!: string;
}
