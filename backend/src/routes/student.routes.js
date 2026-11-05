import { Router } from 'express';
import {
  createStudent,
  deleteStudent,
  getStudent,
  getStudents,
  updateStudent,
} from '../controllers/student.controller.js';
import { removeStudentPhoto, uploadStudentPhoto } from '../controllers/studentPhoto.controller.js';
import { uploadPhoto } from '../middleware/uploadPhoto.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.route('/').get(getStudents).post(createStudent);

router
  .route('/:id')
  .get(validateObjectId(), getStudent)
  .patch(validateObjectId(), updateStudent)
  .delete(validateObjectId(), deleteStudent);

router
  .route('/:id/photo')
  .put(validateObjectId(), uploadPhoto, uploadStudentPhoto)
  .delete(validateObjectId(), removeStudentPhoto);

export default router;
