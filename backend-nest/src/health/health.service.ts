import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  // Nest injects the Mongoose connection that MongooseModule created
  constructor(@InjectConnection() private readonly connection: Connection) {}

  check() {
    return {
      status: 'ok',
      message: 'School API (Nest) is running',
      // readyState 1 means "connected"
      database: this.connection.readyState === 1 ? 'connected' : 'disconnected',
    };
  }
}
