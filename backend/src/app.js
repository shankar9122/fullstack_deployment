import express from 'express';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'School API is running' });
});

// 404: koi route match nahi hua
app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

// Global error handler (4 parameters zaroori hain)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
  });
});
export default app;
