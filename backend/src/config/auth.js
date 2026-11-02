const secret = process.env.JWT_SECRET;

// Fail fast: a missing or weak secret would make every token forgeable
if (!secret || secret.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

export const JWT_SECRET = secret;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
