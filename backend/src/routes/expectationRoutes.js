import express from 'express';
import {
  submitExpectation,
  getMyExpectation,
  getAllExpectations,
  deleteExpectation,
  getEfficiency,
  autoAssign,
} from '../controllers/expectationController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Staff routes
router.post('/', roleMiddleware('staff'), submitExpectation);
router.get('/me', roleMiddleware('staff'), getMyExpectation);

// Admin routes
router.get('/', roleMiddleware('admin'), getAllExpectations);
router.get('/efficiency', roleMiddleware('admin', 'manager'), getEfficiency);
router.post('/auto-assign', roleMiddleware('admin', 'manager'), autoAssign);
router.delete('/:id', roleMiddleware('admin'), deleteExpectation);

export default router;
