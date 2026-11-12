import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Env, validateEnv } from './config/env.validation';
import { HealthModule } from './health/health.module';

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
      }),
    }),
    // 300 requests per 15 minutes per IP, same as the Express API. ttl is in milliseconds
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 15 * 60 * 1000, limit: 300 }],
    }),

    HealthModule,
  ],
  providers: [
    // Registers the guard for every route in the app
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
