import { Router } from 'express';
import { createUser, getUser, getUsers, updateUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

// Everything under /api/users is admin only
router.use(authenticate, authorize('admin'));

router.route('/').get(getUsers).post(createUser);

router.route('/:id').get(validateObjectId(), getUser).patch(validateObjectId(), updateUser);

export default router;
