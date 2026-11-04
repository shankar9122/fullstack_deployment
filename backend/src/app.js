import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { authenticate } from './middleware/authenticate.js';
import { adminOnlyWrites } from './middleware/authorize.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import authRoutes from './routes/auth.routes.js';
import classRoutes from './routes/class.routes.js';
import reportRoutes from './routes/report.routes.js';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import userRoutes from './routes/user.routes.js';
import { AppError } from './utils/AppError.js';

const app = express();

// Render runs behind exactly one reverse proxy. Without this every request looks like it comes
// from the proxy's IP, and express-rate-limit throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// Secure default headers, and no "X-Powered-By: Express"
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3001').split(',').map((origin) => origin.trim());

// maxAge lets browsers cache the preflight result. It matters now because every request
// carries an Authorization header, which makes even GET requests trigger a preflight
app.use(cors({ origin: allowedOrigins, maxAge: 600 }));

app.use(express.json({ limit: '10kb' }));

// Public. Mounted before the rate limiter so host health checks are never throttled
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'School API is running' });
});

app.use('/api', apiLimiter);

// Public / admin routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Everything below needs a valid token. Writes (POST, PATCH, DELETE) also need the admin role
app.use('/api/teachers', authenticate, adminOnlyWrites, teacherRoutes);
app.use('/api/classes', authenticate, adminOnlyWrites, classRoutes);
app.use('/api/students', authenticate, adminOnlyWrites, studentRoutes);
app.use('/api/reports', authenticate, reportRoutes);

// No route matched
app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

// Global error handler (4 parameters are required)
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyPattern ?? {});
    const message =
      fields.length > 1 ? 'A record with this combination already exists' : `${fields[0] ?? 'field'} already exists`;
    return res.status(409).json({ message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }

  const status = err.statusCode || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
  });
});

export default app;
