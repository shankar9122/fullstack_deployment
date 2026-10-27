import express from 'express';
import classRoutes from './routes/class.routes.js';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'School API is running' });
});

app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);

app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

// Global error handler (4 parameters zaroori hain)
app.use((err, req, res, next) => {
  // 1. Mongoose validation error (required, minlength, match...)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // 2. Duplicate key (unique index)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern ?? {});
    const message =
      fields.length > 1 ? 'A record with this combination already exists' : `${fields[0] ?? 'field'} already exists`;

    return res.status(409).json({ message });
  }

  // 3. Galat ObjectId type
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  // 4. Kharab JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  // 5. Apni AppError ya unknown error
  const status = err.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
  });
});
export default app;
