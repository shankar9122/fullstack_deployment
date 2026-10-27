import { Router } from 'express';
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudents,
  updateStudent,
} from '../controllers/student.controller.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.route('/').get(getStudents).post(createStudent);

router
  .route('/:id')
  .get(validateObjectId(), getStudent)
  .patch(validateObjectId(), updateStudent)
  .delete(validateObjectId(), deleteStudent);

export default router;
