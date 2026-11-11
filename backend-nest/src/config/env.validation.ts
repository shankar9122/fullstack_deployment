export interface Env {
  PORT: number;
  MONGODB_URI: string;
  CORS_ORIGIN: string;
}

// Runs once at startup. The app refuses to boot with missing or wrong settings,
// instead of failing later in some random request
export function validateEnv(config: Record<string, unknown>): Env {
  const port = Number(config.PORT ?? 3002);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  const mongoUri = config.MONGODB_URI;
  if (typeof mongoUri !== 'string' || mongoUri.trim() === '') {
    throw new Error('MONGODB_URI is required');
  }

  const corsOrigin = config.CORS_ORIGIN;

  return {
    PORT: port,
    MONGODB_URI: mongoUri,
    CORS_ORIGIN: typeof corsOrigin === 'string' && corsOrigin !== '' ? corsOrigin : 'http://localhost:3001',
  };
}
