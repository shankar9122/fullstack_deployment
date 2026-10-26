import { Teacher } from '../models/Teacher.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_FIELDS = ['name', 'email', 'phone', 'subject'];

function pickAllowed(body = {}) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));
}

// POST /api/teachers
export async function createTeacher(req, res) {
  const teacher = await Teacher.create(pickAllowed(req.body));
  res.status(201).json({ teacher });
}

// GET /api/teachers
export async function getTeachers(req, res) {
  const teachers = await Teacher.find().sort({ name: 1 });
  res.json({ count: teachers.length, teachers });
}

// GET /api/teachers/:id
export async function getTeacher(req, res) {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) throw new AppError('Teacher not found', 404);

  res.json({ teacher });
}

// PATCH /api/teachers/:id
export async function updateTeacher(req, res) {
  const updates = pickAllowed(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!teacher) throw new AppError('Teacher not found', 404);

  res.json({ teacher });
}

// DELETE /api/teachers/:id
export async function deleteTeacher(req, res) {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);

  if (!teacher) throw new AppError('Teacher not found', 404);

  res.json({ message: 'Teacher deleted successfully', teacher });
}
