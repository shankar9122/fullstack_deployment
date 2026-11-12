import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { createValidationPipe } from './common/pipes/validation.pipe';
import type { Env } from './config/env.validation';

// Everything that is not business logic. Used by main.ts and, later, by the end-to-end tests,
// so the tests run against the same setup as production
export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // Render runs behind exactly one reverse proxy. Without this, every request appears to come from
  // the proxy's IP, and the rate limiter would count all users together as one
  app.set('trust proxy', 1);

  // Security headers, and no "X-Powered-By: Express"
  app.use(helmet());

  // Every route lives under /api, exactly like the Express API
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: config
      .get('CORS_ORIGIN', { infer: true })
      .split(',')
      .map((origin) => origin.trim()),
    maxAge: 600, // cache the preflight result for 10 minutes
  });

  // JSON bodies are capped at 10 kb (file uploads use multer, which has its own limit)
  app.useBodyParser('json', { limit: '10kb' });

  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
}