// Fail-fast env validation on boot — missing/invalid keys prevent startup.
import { plainToInstance, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  API_PREFIX!: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_ORIGIN!: string;

  @IsIn(['debug', 'info', 'warn', 'error'])
  LOG_LEVEL!: string;

  @IsString()
  SWAGGER_ENABLED!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsString()
  REDIS_HOST!: string;

  @Type(() => Number)
  @IsInt()
  REDIS_PORT!: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsString()
  REDIS_TLS!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TTL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TTL!: string;

  @Type(() => Number)
  @IsInt()
  @Min(4)
  BCRYPT_SALT_ROUNDS!: number;

  @IsString()
  @IsNotEmpty()
  REFRESH_COOKIE_NAME!: string;

  @IsString()
  COOKIE_SECURE!: string;

  @IsIn(['lax', 'strict', 'none'])
  COOKIE_SAMESITE!: string;

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN?: string;

  @IsString()
  @IsNotEmpty()
  JSEARCH_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  JSEARCH_API_HOST!: string;

  @IsString()
  @IsNotEmpty()
  JSEARCH_QUERY!: string;

  @IsString()
  @IsNotEmpty()
  JSEARCH_COUNTRY!: string;

  @IsString()
  @IsNotEmpty()
  JSEARCH_DATE_POSTED!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  JSEARCH_PAGES!: number;

  @IsString()
  @IsNotEmpty()
  INGESTION_TIMEZONE!: string;

  @IsString()
  @IsNotEmpty()
  SMTP_HOST!: string;

  @Type(() => Number)
  @IsInt()
  SMTP_PORT!: number;

  @IsString()
  SMTP_SECURE!: string;

  @IsString()
  @IsNotEmpty()
  SMTP_USER!: string;

  @IsString()
  @IsNotEmpty()
  SMTP_PASS!: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  RATE_LIMIT_TTL!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  RATE_LIMIT_MAX!: number;

  @IsString()
  @IsNotEmpty()
  SEED_ADMIN_NAME!: string;

  @IsString()
  @IsNotEmpty()
  SEED_ADMIN_EMAIL!: string;

  @IsString()
  @IsNotEmpty()
  SEED_ADMIN_PASSWORD!: string;
}

/**
 * Validates process.env against the schema above.
 * Called by ConfigModule on boot — throws if any required key is missing/invalid.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((err) => Object.values(err.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }

  return config;
}
