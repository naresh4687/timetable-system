import express from 'express';
import {
  createTimetable,
  getAllTimetables,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
  downloadTimetablePDF,
  updateTimetableStatus,
} from '../controllers/timetableController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// All authenticated users can view and download
router.get('/', getAllTimetables);
router.get('/:id', getTimetableById);
router.get('/:id/pdf', downloadTimetablePDF);

// Admin can create/update the content
router.post('/', roleMiddleware('admin'), createTimetable);
router.put('/:id', roleMiddleware('admin'), updateTimetable);

// Admin and Manager can update the status (approve/reject workflow)
router.patch('/:id/status', roleMiddleware('admin', 'manager'), updateTimetableStatus);

// Only Admin can delete
router.delete('/:id', roleMiddleware('admin'), deleteTimetable);

export default router;