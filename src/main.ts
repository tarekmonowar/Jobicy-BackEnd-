import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalFilter } from './common/filter/global.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // URL prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  const allowedOrigins =
    process.env.FRONTEND_URL?.split(',').map((url) => url.trim()) ?? [];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  //global error handler

  app.useGlobalFilters(new GlobalFilter());

  // graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`Server is running on http://localhost:${port}`);
}
void bootstrap();
