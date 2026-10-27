import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Teacher } from '../models/Teacher.js';
import { AppError } from '../utils/AppError.js';

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

// GET /api/classes
export async function getClasses(req, res) {
  const classes = await Class.find()
    .populate('classTeacher', TEACHER_FIELDS)
    .sort({ academicYear: -1, name: 1, section: 1 });

  res.json({ count: classes.length, classes });
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
