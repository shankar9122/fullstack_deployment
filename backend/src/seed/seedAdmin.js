import mongoose from 'mongoose';
import { User } from '../models/User.js';

const { ADMIN_NAME = 'Admin', ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;

try {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  await mongoose.connect(MONGODB_URI);

  // Unlike the other seeds, this never deletes anything
  const exists = await User.exists({ email: ADMIN_EMAIL.trim().toLowerCase() });

  if (exists) {
    console.log('Admin already exists, nothing to do');
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
