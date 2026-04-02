import express from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  adminApprove,
  managerApprove,
  generateAssignmentPDF,
  rejectAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all assignment routes
router.use(authMiddleware);

router.route('/')
  .post(roleMiddleware('admin', 'manager'), createAssignment)
  .get(roleMiddleware('admin', 'manager'), getAssignments);

router.route('/:id')
  .get(roleMiddleware('admin', 'manager'), getAssignmentById)
  .delete(roleMiddleware('admin'), deleteAssignment);

router.route('/:id/pdf')
  .get(roleMiddleware('admin', 'manager'), generateAssignmentPDF);

router.route('/admin-approve/:id')
  .put(roleMiddleware('admin'), adminApprove);

router.route('/manager-approve/:id')
  .put(roleMiddleware('manager'), managerApprove);

router.route('/reject/:id')
  .put(roleMiddleware('admin', 'manager'), rejectAssignment);

export default router;
