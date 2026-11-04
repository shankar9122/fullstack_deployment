import { Router } from 'express';
import { changePassword, getMe, login } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginLimiter, passwordChangeLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, passwordChangeLimiter, changePassword);

export default router;
