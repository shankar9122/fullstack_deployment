import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';

const firstNames = [
  'Aarav',
  'Vivaan',
  'Aditya',
  'Arjun',
  'Ishaan',
  'Kabir',
  'Rohan',
  'Yash',
  'Dev',
  'Kunal',
  'Ananya',
  'Diya',
  'Isha',
  'Kavya',
  'Meera',
  'Naina',
  'Riya',
  'Saanvi',
  'Tara',
  'Zoya',
];
const lastNames = ['Sharma', 'Verma', 'Singh', 'Gupta', 'Kumar', 'Yadav', 'Mishra', 'Joshi', 'Nair', 'Iyer'];
const femaleNames = new Set(firstNames.slice(10));

const STUDENTS_PER_CLASS = 5;

try {
  await mongoose.connect(process.env.MONGODB_URI);

  const classes = await Class.find().sort({ name: 1, section: 1 });
  if (classes.length === 0) throw new Error('No classes found (pehle seed:classes chalao)');

  const docs = [];
  let counter = 0;

  classes.forEach((cls, classIndex) => {
    // Class 6 ke bachche lagbhag 11-12 saal ke, class 10 ke 15-16 ke
    const birthYear = 2025 - (Number(cls.name) + 5);

    for (let roll = 1; roll <= STUDENTS_PER_CLASS; roll++) {
      counter += 1;
      const first = firstNames[(classIndex * STUDENTS_PER_CLASS + roll) % firstNames.length];
      const last = lastNames[(classIndex + roll) % lastNames.length];

      docs.push({
        name: `${first} ${last}`,
        rollNumber: roll,
        email: `${first}.${last}.${counter}@student.school.com`.toLowerCase(),
        dob: new Date(Date.UTC(birthYear, (roll * 2) % 12, 5 + roll)),
        gender: femaleNames.has(first) ? 'female' : 'male',
        guardianName: `Mr. ${last}`,
        guardianPhone: `98${String(10000000 + counter)}`,
        class: cls._id,
      });
    }
  });

  await Student.deleteMany({});
  const created = await Student.insertMany(docs);
  console.log(`Inserted ${created.length} students across ${classes.length} classes`);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
