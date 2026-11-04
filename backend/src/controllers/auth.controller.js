import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/auth.js';
import { BCRYPT_ROUNDS, User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// Compared against when the email does not exist, so "unknown email" and "wrong password"
// take about the same time and cannot be told apart by timing
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

function signToken(user) {
  // Only the user id goes in the token. The role is read from the database on every request
  return jwt.sign({ sub: user.id }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body ?? {};

  // Type checks block NoSQL injection such as {"email": {"$gt": ""}}
  if (typeof email !== 'string' || typeof password !== 'string' || email.trim() === '' || password === '') {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

  // Same message for both cases, so attackers cannot discover which emails exist
  if (!user || !passwordMatches) throw new AppError('Invalid email or password', 401);

  if (!user.isActive) throw new AppError('This account has been disabled', 403);

  res.json({ token: signToken(user), user });
}

// GET /api/auth/me
export function getMe(req, res) {
  res.json({ user: req.user });
}

// POST /api/auth/change-password
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body ?? {};

  if (
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    currentPassword === '' ||
    newPassword === ''
  ) {
    throw new AppError('Current and new password are required', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    // 400, not 401: the frontend logs the user out on 401
    throw new AppError('Current password is incorrect', 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from the current password', 400);
  }

  user.password = newPassword;
  await user.save(); // validators check the plain password, then the pre-save hook hashes it

  // Older tokens are now invalid, so return a fresh one to keep this session alive
  res.json({ message: 'Password updated', token: signToken(user), user });
}
