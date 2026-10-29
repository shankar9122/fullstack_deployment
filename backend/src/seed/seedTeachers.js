import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher.js';

const teachers = [
  { name: 'Anita Sharma', email: 'anita@school.com', phone: '9876543210', subject: 'Maths' },
  { name: 'Rajesh Verma', email: 'rajesh@school.com', phone: '9812345678', subject: 'Science' },
  { name: 'Sunita Gupta', email: 'sunita@school.com', phone: '9988776655', subject: 'English' },
  { name: 'Mohit Singh', email: 'mohit@school.com', phone: '8877665544', subject: 'Social Science' },
  { name: 'Kavita Joshi', email: 'kavita@school.com', phone: '7766554433', subject: 'Computer Science' },
  { name: 'Deepak Yadav', email: 'deepak@school.com', phone: '9123456780', subject: 'Physics' },
  { name: 'Neha Kapoor', email: 'neha@school.com', phone: '9234567891', subject: 'Chemistry' },
  { name: 'Suresh Iyer', email: 'suresh@school.com', phone: '9345678912', subject: 'Biology' },
  { name: 'Pooja Nair', email: 'pooja@school.com', phone: '9456789123', subject: 'Physical Education' },
  { name: 'Arvind Mishra', email: 'arvind@school.com', subject: 'Sanskrit' },
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Teacher.deleteMany({}); // purana data saaf
  const created = await Teacher.insertMany(teachers);
  console.log(`Inserted ${created.length} teachers`);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
