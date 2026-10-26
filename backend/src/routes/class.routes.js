import { Router } from 'express';
import { createClass, deleteClass, getClass, getClasses, updateClass } from '../controllers/class.controller.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.route('/').get(getClasses).post(createClass);

router
  .route('/:id')
  .get(validateObjectId(), getClass)
  .patch(validateObjectId(), updateClass)
  .delete(validateObjectId(), deleteClass);

export default router;
