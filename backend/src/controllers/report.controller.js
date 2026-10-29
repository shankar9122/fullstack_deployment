import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { AppError } from '../utils/AppError.js';

const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{2}$/;

// GET /api/reports/students-per-class?academicYear=2025-26
export async function studentsPerClass(req, res) {
  const { academicYear } = req.query;

  if (academicYear !== undefined) {
    if (typeof academicYear !== 'string' || !ACADEMIC_YEAR_PATTERN.test(academicYear)) {
      throw new AppError('academicYear must look like 2025-26', 400);
    }
  }

  const pipeline = [];

  if (academicYear !== undefined) {
    pipeline.push({ $match: { academicYear } });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'class',
        as: 'studentInfo',
      },
    },
    {
      $lookup: {
        from: 'teachers',
        localField: 'classTeacher',
        foreignField: '_id',
        as: 'teacher',
      },
    },
    { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        classId: '$_id',
        name: 1,
        section: 1,
        academicYear: 1,
        classTeacher: '$teacher.name',
        totalStudents: { $size: '$studentInfo' },
        male: {
          $size: {
            $filter: {
              input: '$studentInfo',
              as: 's',
              cond: {
                $eq: ['$$s.gender', 'male'],
              },
            },
          },
        },
        female: {
          $size: {
            $filter: {
              input: '$studentInfo',
              as: 's',
              cond: {
                $eq: ['$$s.gender', 'female'],
              },
            },
          },
        },
        other: {
          $size: {
            $filter: {
              input: '$studentInfo',
              as: 's',
              cond: {
                $eq: ['$$s.gender', 'other'],
              },
            },
          },
        },
      },
    },
    // 6. Sort
    { $sort: { academicYear: -1, name: 1, section: 1 } },
  );

  const report = await Class.aggregate(pipeline).collation({
    locale: 'en',
    numericOrdering: true, // "10" ko "2" ke baad rakhne ke liye
  });

  res.json({ count: report.length, report });
}

// GET /api/reports/gender-distribution?class=<id>
export async function genderDistribution(req, res) {
  const { class: classId } = req.query;

  const pipeline = [];

  if (classId !== undefined) {
    if (typeof classId !== 'string' || !mongoose.isObjectIdOrHexString(classId)) {
      throw new AppError('Invalid class id', 400);
    }
    // aggregate mein string apne aap ObjectId nahi banti
    pipeline.push({ $match: { class: new mongoose.Types.ObjectId(classId) } });
  }

  pipeline.push(
    {
      $group: {
        _id: { $ifNull: ['$gender', 'unspecified'] }, // gender na ho toh "unspecified"
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, gender: '$_id', count: 1 } },
  );

  const distribution = await Student.aggregate(pipeline);
  const total = distribution.reduce((sum, row) => sum + row.count, 0);

  res.json({ total, distribution });
}

// /api/reports/teacher-classe
export async function getTeachersClasses(req, res) {
  const teachers = await Teacher.aggregate([
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: 'classTeacher',
        as: 'classInfo',
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        subject: 1,
        totalClasses: { $size: '$classInfo' },
        classList: {
          $map: {
            input: '$classInfo',
            as: 'cls',
            in: {
              classId: '$$cls._id',
              className: '$$cls.name',
              section: '$$cls.section',
              academicYear: '$$cls.academicYear',
            },
          },
        },
      },
    },
    { $sort: { name: 1, _id: 1 } },
  ]).collation({ locale: 'en', numericOrdering: true });

  res.json({ count: teachers.length, teachers });
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

// GET /api/reports/average-age-per-class?academicYear=2025-26
export async function getAverageAge(req, res) {
  const { academicYear } = req.query;

  if (academicYear !== undefined) {
    if (typeof academicYear !== 'string' || !ACADEMIC_YEAR_PATTERN.test(academicYear)) {
      throw new AppError('academicYear must look like 2025-26', 400);
    }
  }

  const pipeline = [];

  if (academicYear !== undefined) {
    pipeline.push({ $match: { academicYear } });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'class',
        pipeline: [{ $project: { _id: 0, dob: 1 } }],
        as: 'studentsInfo',
      },
    },

    // (LEFT JOIN )
    { $unwind: { path: '$studentsInfo', preserveNullAndEmptyArrays: true } },

    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        section: { $first: '$section' },
        academicYear: { $first: '$academicYear' },
        totalStudents: { $sum: { $cond: [{ $ifNull: ['$studentsInfo', false] }, 1, 0] } },
        averageAge: {
          $avg: {
            $divide: [{ $subtract: ['$$NOW', '$studentsInfo.dob'] }, MS_PER_YEAR],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        classId: '$_id',
        name: 1,
        section: 1,
        academicYear: 1,
        totalStudents: 1,
        averageAge: { $round: ['$averageAge', 1] }, // null par null hi rehta hai
      },
    },

    { $sort: { academicYear: -1, name: 1, section: 1 } },
  );

  const report = await Class.aggregate(pipeline).collation({
    locale: 'en',
    numericOrdering: true,
  });

  res.json({ count: report.length, report });
}
