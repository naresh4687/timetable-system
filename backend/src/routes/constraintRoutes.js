import express from 'express';
import {
  createConstraint,
  getAllConstraints,
  getConstraintsByStaffId,
  updateConstraint,
  deleteConstraint,
} from '../controllers/constraintController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(authMiddleware, roleMiddleware('admin'), createConstraint)
  .get(authMiddleware, roleMiddleware('admin', 'manager'), getAllConstraints);

router.route('/staff/:staffId')
  .get(authMiddleware, roleMiddleware('admin', 'manager'), getConstraintsByStaffId);

router.route('/:id')
  .put(authMiddleware, roleMiddleware('admin'), updateConstraint)
  .delete(authMiddleware, roleMiddleware('admin'), deleteConstraint);

export default router;
