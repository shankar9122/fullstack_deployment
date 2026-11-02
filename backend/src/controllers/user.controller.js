import { User } from '../models/User.js';

const ALLOWED_FIELDS = ['name', 'email', 'password', 'role'];

function pickAllowed(body = {}) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));
}

// POST /api/users (admin only)
export async function createUser(req, res) {
  const user = await User.create(pickAllowed(req.body));
  res.status(201).json({ user });
}
