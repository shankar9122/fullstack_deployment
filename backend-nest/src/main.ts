import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Env } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // Every route lives under /api, exactly like the Express version
  app.setGlobalPrefix('api');

  // Browsers may only call this API from the listed origins
  app.enableCors({
    origin: config
      .get('CORS_ORIGIN', { infer: true })
      .split(',')
      .map((origin) => origin.trim()),
    maxAge: 600, // cache the preflight result for 10 minutes
  });

  await app.listen(config.get('PORT', { infer: true }));
}

void bootstrap();
