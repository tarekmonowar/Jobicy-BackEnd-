// Root module — wires global config, logging, Prisma, and Redis.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { ALIAS_CHECK } from '@/alias-check';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import configuration from '@/config/configuration';
import { validateEnv } from '@/config/env.validation';
import { winstonModuleOptions } from '@/logger/winston.config';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/redis/redis.module';
import { AppController } from './app.controller';

void ALIAS_CHECK;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    WinstonModule.forRootAsync(winstonModuleOptions),
    PrismaModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
