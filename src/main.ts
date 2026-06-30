// Application entry — global middleware, pipes, filters, interceptors, and listen.
import 'dotenv/config';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from '@/config/configuration';
import {
  createMorganMiddleware,
  createWinstonLogger,
} from '@/logger/winston.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const winstonLogger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  const apiPrefix = configService.get('apiPrefix', { infer: true });
  const frontendOrigin = configService.get('frontendOrigin', { infer: true });
  const port = configService.get('port', { infer: true });

  app.setGlobalPrefix(apiPrefix);

  app.use(helmet());
  app.use(cookieParser());
  app.use(createMorganMiddleware(createWinstonLogger(configService)));

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(port);
  winstonLogger.log(`Server running on http://localhost:${port}/${apiPrefix}`);
}

void bootstrap();
