import express from 'express';
import {
    saveCurriculum,
    getAllCurricula,
    getCurriculumBySemester,
    deleteCurriculum,
    generateBulkTimetables,
    parseUploadedCurriculum,
} from '../controllers/curriculumController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

// All routes require login
router.use(authMiddleware);

// ── Read routes: accessible to ALL logged-in users (staff, admin, manager) ──
router.get('/', getAllCurricula);
router.get('/:semester', getCurriculumBySemester);

// ── Write routes: restricted to admin and manager only ──
router.post('/', roleMiddleware('admin', 'manager'), saveCurriculum);
router.delete('/:semester', roleMiddleware('admin', 'manager'), deleteCurriculum);
router.post('/generate', roleMiddleware('admin', 'manager'), generateBulkTimetables);
router.post('/parse', roleMiddleware('admin', 'manager'), upload.single('file'), parseUploadedCurriculum);

export default router;
