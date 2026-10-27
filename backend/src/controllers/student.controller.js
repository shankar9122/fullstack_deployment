import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { AppError } from '../utils/AppError.js';
import { buildPagination, parsePagination } from '../utils/pagination.js';

const ALLOWED_FIELDS = ['name', 'rollNumber', 'email', 'dob', 'gender', 'guardianName', 'guardianPhone', 'class'];
const GENDERS = ['male', 'female', 'other'];
const SORT_FIELDS = ['name', 'rollNumber', 'dob', 'createdAt'];
const SORT_ORDERS = ['asc', 'desc'];
const CLASS_FIELDS = 'name section academicYear';

function pickAllowed(body = {}) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)));
}

// special characters escape
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function assertClassExists(classId) {
  if (classId === undefined) return;

  if (typeof classId !== 'string' || !mongoose.isObjectIdOrHexString(classId)) {
    throw new AppError('Invalid class id', 400);
  }

  const exists = await Class.exists({ _id: classId });
  if (!exists) throw new AppError('Class not found', 404);
}

// POST /api/students
export async function createStudent(req, res) {
  const data = pickAllowed(req.body);
  await assertClassExists(data.class);

  const created = await Student.create(data);
  const student = await created.populate('class', CLASS_FIELDS);

  res.status(201).json({ student });
}

// GET /api/students?search=&class=&gender=&sortBy=&order=&page=&limit=
export async function getStudents(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, class: classId, gender, sortBy = 'name', order = 'asc' } = req.query;

  const filter = {};

  if (search !== undefined) {
    if (typeof search !== 'string') throw new AppError('Invalid search parameter', 400);

    const term = search.trim();
    if (term !== '') {
      const pattern = { $regex: escapeRegex(term), $options: 'i' };
      filter.$or = [{ name: pattern }, { email: pattern }];
    }
  }

  if (classId !== undefined) {
    if (typeof classId !== 'string' || !mongoose.isObjectIdOrHexString(classId)) {
      throw new AppError('Invalid class id', 400);
    }
    filter.class = classId;
  }

  if (gender !== undefined) {
    if (!GENDERS.includes(gender)) throw new AppError('Invalid gender', 400);
    filter.gender = gender;
  }

  // Sorting: field aur order dono whitelist se aane chahiye
  if (!SORT_FIELDS.includes(sortBy)) {
    throw new AppError(`sortBy must be one of: ${SORT_FIELDS.join(', ')}`, 400);
  }
  if (!SORT_ORDERS.includes(order)) {
    throw new AppError('order must be asc or desc', 400);
  }

  // _id tie-breaker: barabar values par bhi order fix rehta hai, pagination mein rows repeat nahi hoti
  const sort = { [sortBy]: order === 'desc' ? -1 : 1, _id: 1 };

  const [students, total] = await Promise.all([
    Student.find(filter).populate('class', CLASS_FIELDS).sort(sort).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  res.json({
    students,
    pagination: buildPagination({ page, limit, total }),
  });
}

// GET /api/students/:id
export async function getStudent(req, res) {
  const student = await Student.findById(req.params.id).populate('class', CLASS_FIELDS);

  if (!student) throw new AppError('Student not found', 404);

  res.json({ student });
}

// PATCH /api/students/:id
export async function updateStudent(req, res) {
  const updates = pickAllowed(req.body);

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  await assertClassExists(updates.class);

  const student = await Student.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('class', CLASS_FIELDS);

  if (!student) throw new AppError('Student not found', 404);

  res.json({ student });
}

// DELETE /api/students/:id
export async function deleteStudent(req, res) {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) throw new AppError('Student not found', 404);

  res.json({ message: 'Student deleted successfully', student });
}
