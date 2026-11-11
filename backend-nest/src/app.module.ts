import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Env, validateEnv } from './config/env.validation';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // isGlobal: ConfigService can be injected anywhere without importing ConfigModule again
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    // "forRootAsync" because the connection string comes from ConfigService, which is only ready at runtime
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        uri: config.get('MONGODB_URI', { infer: true }),
      }),
    }),

    HealthModule,
  ],
})
export class AppModule {}
