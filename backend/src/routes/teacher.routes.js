import { Router } from 'express';
import {
  createTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacher.controller.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.route('/').get(getTeachers).post(createTeacher);

router
  .route('/:id')
  .get(validateObjectId(), getTeacher)
  .patch(validateObjectId(), updateTeacher)
  .delete(validateObjectId(), deleteTeacher);

export default router;