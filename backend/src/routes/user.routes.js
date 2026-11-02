import { Router } from 'express';
import { createUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// Everything under /api/users is admin only
router.use(authenticate, authorize('admin'));

router.post('/', createUser);

export default router;
