import express from 'express';
import {
  getAcademicYears,
  getSemesters,
  getSubjectsByFilter,
  getMasterSubjects,
  createMasterSubject,
} from '../controllers/subjectController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/subjects/master
router.get('/master', getMasterSubjects);

// POST /api/subjects/master
router.post('/master', createMasterSubject);

// GET /api/subjects/academic-years
router.get('/academic-years', getAcademicYears);

// GET /api/subjects/semesters?semesterType=odd|even
router.get('/semesters', getSemesters);

// GET /api/subjects?year=&semesterType=&semester=
router.get('/', getSubjectsByFilter);

export default router;
