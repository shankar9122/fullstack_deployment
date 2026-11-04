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

const UPDATABLE_FIELDS = ['name', 'email', 'role', 'isActive', 'password'];

// Compare ids from the loaded document, never from the URL (hex case can differ there)
function assertNotSelf(target, actingUser, action) {
  if (target.id === actingUser.id) {
    throw new AppError(`You cannot ${action} your own account`, 409);
  }
}

// Deleting, disabling or demoting the last active admin would lock everyone out
async function assertAnotherActiveAdminExists(action) {
  const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });

  if (activeAdmins <= 1) {
    throw new AppError(`Cannot ${action} the last active admin`, 409);
  }
}

// GET /api/users/:id
export async function getUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);

  res.json({ user });
}

// PATCH /api/users/:id
export async function updateUser(req, res) {
  const updates = Object.fromEntries(Object.entries(req.body ?? {}).filter(([key]) => UPDATABLE_FIELDS.includes(key)));

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const { name, email, role, isActive, password } = updates;

  // Strict types: the guards below use ===, and Mongoose would silently cast "false" to false
  for (const [field, value] of Object.entries({ name, email, password })) {
    if (value !== undefined && typeof value !== 'string') {
      throw new AppError(`${field} must be a string`, 400);
    }
  }
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw new AppError('isActive must be true or false', 400);
  }
  if (role !== undefined && !ROLES.includes(role)) {
    throw new AppError(`role must be one of: ${ROLES.join(', ')}`, 400);
  }

  const target = await User.findById(req.params.id);
  if (!target) throw new AppError('User not found', 404);

  // A password reset would invalidate the admin's own token and log them out,
  // so own-password changes go through /auth/change-password instead
  if (password !== undefined && target.id === req.user.id) {
    throw new AppError('Use the change password option for your own account', 400);
  }

  const removesAdminAccess =
    target.role === 'admin' && target.isActive && (isActive === false || (role !== undefined && role !== 'admin'));

  if (removesAdminAccess) {
    const action = isActive === false ? 'disable' : 'demote';
    assertNotSelf(target, req.user, action);
    await assertAnotherActiveAdminExists(action);
  }

  if (name !== undefined) target.name = name;
  if (email !== undefined) target.email = email;
  if (role !== undefined) target.role = role;
  if (isActive !== undefined) target.isActive = isActive;
  if (password !== undefined) target.password = password;

  // save() runs the schema validators, and the pre-save hook hashes a changed password
  await target.save();

  res.json({ message: 'User updated successfully', user: target });
}
