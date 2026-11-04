import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  let payload;
  try {
    // Pin the algorithm so a forged token cannot choose its own (e.g. "none")
    payload = jwt.verify(header.slice(7).trim(), JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Session expired, please log in again', 401);
    }
    throw new AppError('Invalid token', 401);
  }

  // Load the user on every request, so a disabled account or changed role takes effect immediately
  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new AppError('Authentication required', 401);
  }

  // Tokens issued before the last password change are no longer valid
  if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw new AppError('Password was changed, please log in again', 401);
  }

  req.user = user;
  next();
}
