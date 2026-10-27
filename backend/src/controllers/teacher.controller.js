import { Class } from '../models/Class.js';
import { Teacher } from '../models/Teacher.js';
import { AppError } from '../utils/AppError.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { buildPagination, parsePagination } from '../utils/pagination.js';

const ALLOWED_FIELDS = ['name', 'email', 'phone', 'subject'];

function pickAllowed(body = {}) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));
}

// POST /api/teachers
export async function createTeacher(req, res) {
  const teacher = await Teacher.create(pickAllowed(req.body));
  res.status(201).json({ teacher });
}
// GET /api/teachers?search=&page=&limit=
export async function getTeachers(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const { search } = req.query;

  const filter = {};

  if (search !== undefined) {
    if (typeof search !== 'string') throw new AppError('Invalid search parameter', 400);

    const term = search.trim();
    if (term !== '') {
      const pattern = { $regex: escapeRegex(term), $options: 'i' };
      filter.$or = [{ name: pattern }, { subject: pattern }];
    }
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(filter).sort({ name: 1, _id: 1 }).skip(skip).limit(limit),
    Teacher.countDocuments(filter),
  ]);

  res.json({
    teachers,
    pagination: buildPagination({ page, limit, total }),
  });
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
  const assignedClasses = await Class.find({ classTeacher: req.params.id }, 'name section academicYear');

  if (assignedClasses.length > 0) {
    const labels = assignedClasses.map((c) => `${c.name}-${c.section}`).join(', ');
    throw new AppError(`Cannot delete teacher: class teacher of ${labels}`, 409);
  }

  const teacher = await Teacher.findByIdAndDelete(req.params.id);

  if (!teacher) throw new AppError('Teacher not found', 404);

  res.json({ message: 'Teacher deleted successfully', teacher });
}
