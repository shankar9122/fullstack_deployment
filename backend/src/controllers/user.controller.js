import { ROLES, User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildPagination, parsePagination } from '../utils/pagination.js';

const ALLOWED_FIELDS = ['name', 'email', 'password', 'role'];

function pickAllowed(body = {}) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));
}

// POST /api/users (admin only)
export async function createUser(req, res) {
  const user = await User.create(pickAllowed(req.body));
  res.status(201).json({ user });
}

// GET /api/users?search=&role=&isActive=&page=&limit=
export async function getUsers(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, role, isActive } = req.query;

  const filter = {};

  if (search !== undefined) {
    if (typeof search !== 'string') throw new AppError('Invalid search parameter', 400);

    const term = search.trim();
    if (term !== '') {
      const pattern = { $regex: escapeRegex(term), $options: 'i' };
      filter.$or = [{ name: pattern }, { email: pattern }];
    }
  }

  if (role !== undefined) {
    if (typeof role !== 'string' || !ROLES.includes(role)) {
      throw new AppError(`role must be one of: ${ROLES.join(', ')}`, 400);
    }
    filter.role = role;
  }

  // Query params are always strings, so accept only the literal words
  if (isActive !== undefined) {
    if (isActive !== 'true' && isActive !== 'false') {
      throw new AppError('isActive must be true or false', 400);
    }
    filter.isActive = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ name: 1, _id: 1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ users, pagination: buildPagination({ page, limit, total }) });
}

// PATCH /api/users/:id (only isActive and role can change)
export async function updateUser(req, res) {
  const { isActive, role } = req.body ?? {};

  if (isActive === undefined && role === undefined) {
    throw new AppError('Provide isActive and/or role', 400);
  }

  // Strict types: the guards below use === and Mongoose would silently cast "false" to false
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw new AppError('isActive must be true or false', 400);
  }
  if (role !== undefined && !ROLES.includes(role)) {
    throw new AppError(`role must be one of: ${ROLES.join(', ')}`, 400);
  }

  const target = await User.findById(req.params.id);
  if (!target) throw new AppError('User not found', 404);

  // True when this change would remove admin access from an active admin
  const removesAdminAccess =
    target.role === 'admin' && target.isActive && (isActive === false || (role !== undefined && role !== 'admin'));

  if (removesAdminAccess) {
    // Compare ids from the loaded document, not from the URL (hex case can differ)
    if (target.id === req.user.id) {
      throw new AppError('Admins cannot disable or demote themselves', 409);
    }

    // Extra safety net. In a single request this cannot fire (the caller is an active admin),
    // but it protects against inconsistent data
    const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    if (activeAdmins <= 1) {
      throw new AppError('Cannot disable or demote the last active admin', 409);
    }
  }

  if (isActive !== undefined) target.isActive = isActive;
  if (role !== undefined) target.role = role;

  await target.save();

  res.json({ message: 'User updated successfully', user: target });
}
