import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination, parsePagination } from '../utils/pagination.js';

const ALLOWED_FIELDS = ['name', 'section', 'academicYear', 'classTeacher'];
const TEACHER_FIELDS = 'name email subject';

function pickAllowed(body = {}) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));
}

// classTeacher diya hai toh check karo ki valid id hai aur teacher exist karta hai
// null ka matlab "teacher hata do", wo allowed hai
async function assertTeacherExists(teacherId) {
  if (teacherId === undefined || teacherId === null) return;

  if (!mongoose.isValidObjectId(teacherId)) {
    throw new AppError('Invalid classTeacher id', 400);
  }

  const exists = await Teacher.exists({ _id: teacherId });
  if (!exists) throw new AppError('Teacher not found', 404);
}

// POST /api/classes
export async function createClass(req, res) {
  const data = pickAllowed(req.body);
  await assertTeacherExists(data.classTeacher);

  const created = await Class.create(data);
  const classDoc = await created.populate('classTeacher', TEACHER_FIELDS);

  res.status(201).json({ class: classDoc });
}

const CLASS_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{2}$/;

// GET /api/classes?name=&academicYear=&page=&limit=
export async function getClasses(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const { name, academicYear } = req.query;

  const filter = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !CLASS_NAMES.includes(name)) {
      throw new AppError('name must be between 1 and 12', 400);
    }
    filter.name = name;
  }

  if (academicYear !== undefined) {
    if (typeof academicYear !== 'string' || !ACADEMIC_YEAR_PATTERN.test(academicYear)) {
      throw new AppError('academicYear must look like 2025-26', 400);
    }
    filter.academicYear = academicYear;
  }

  const [classes, total] = await Promise.all([
    Class.find(filter)
      .populate('classTeacher', TEACHER_FIELDS)
      .sort({ academicYear: -1, name: 1, section: 1, _id: 1 })
      .collation({ locale: 'en', numericOrdering: true })
      .skip(skip)
      .limit(limit),
    Class.countDocuments(filter),
  ]);

  res.json({
    classes,
    pagination: buildPagination({ page, limit, total }),
  });
}

// GET /api/classes/:id
export async function getClass(req, res) {
  const classDoc = await Class.findById(req.params.id).populate('classTeacher', TEACHER_FIELDS);

  if (!classDoc) throw new AppError('Class not found', 404);

  res.json({ class: classDoc });
}

// PATCH /api/classes/:id
export async function updateClass(req, res) {
  const updates = pickAllowed(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  await assertTeacherExists(updates.classTeacher);

  const classDoc = await Class.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('classTeacher', TEACHER_FIELDS);

  if (!classDoc) throw new AppError('Class not found', 404);

  res.json({ class: classDoc });
}

// DELETE /api/classes/:id
export async function deleteClass(req, res) {
  const studentCount = await Student.countDocuments({ class: req.params.id });

  if (studentCount > 0) {
    throw new AppError(`Cannot delete class: ${studentCount} student(s) are still enrolled`, 409);
  }

  const classDoc = await Class.findByIdAndDelete(req.params.id);

  if (!classDoc) throw new AppError('Class not found', 404);

  res.json({ message: 'Class deleted successfully', class: classDoc });
}
