import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Teacher } from '../models/Teacher.js';

const classes = [
  { name: '6', section: 'A', academicYear: '2025-26', teacherEmail: 'anita@school.com' },
  { name: '6', section: 'B', academicYear: '2025-26', teacherEmail: 'rajesh@school.com' },
  { name: '7', section: 'A', academicYear: '2025-26', teacherEmail: 'sunita@school.com' },
  { name: '8', section: 'A', academicYear: '2025-26', teacherEmail: 'mohit@school.com' },
  { name: '9', section: 'B', academicYear: '2025-26', teacherEmail: 'deepak@school.com' },
  { name: '10', section: 'A', academicYear: '2025-26', teacherEmail: 'neha@school.com' },
  { name: '10', section: 'B', academicYear: '2025-26', teacherEmail: 'suresh@school.com' },
  { name: '11', section: 'A', academicYear: '2025-26', teacherEmail: 'pooja@school.com' },
  { name: '12', section: 'A', academicYear: '2025-26' }, // bina class teacher ke
];

try {
  await mongoose.connect(process.env.MONGODB_URI);

  const teachers = await Teacher.find({}, '_id email');
  const idByEmail = new Map(teachers.map((t) => [t.email, t._id]));

  const docs = classes.map(({ teacherEmail, ...rest }) => {
    if (teacherEmail && !idByEmail.has(teacherEmail)) {
      throw new Error(`Teacher not found: ${teacherEmail} (pehle seed:teachers chalao)`);
    }
    return { ...rest, classTeacher: teacherEmail ? idByEmail.get(teacherEmail) : undefined };
  });

  await Class.deleteMany({});
  const created = await Class.insertMany(docs);
  console.log(`Inserted ${created.length} classes`);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
