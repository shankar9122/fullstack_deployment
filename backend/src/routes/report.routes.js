import { Router } from 'express';
import {
  genderDistribution,
  getAverageAge,
  getTeachersClasses,
  studentsPerClass,
} from '../controllers/report.controller.js';

const router = Router();

router.get('/students-per-class', studentsPerClass);
router.get('/gender-distribution', genderDistribution);
router.get('/teacher-classes', getTeachersClasses);
router.get('/average-age-per-class', getAverageAge);

export default router;
