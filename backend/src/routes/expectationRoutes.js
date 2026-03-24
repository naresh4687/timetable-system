import express from 'express';
import {
  submitExpectation,
  getMyExpectation,
  getAllExpectations,
  deleteExpectation,
  getTakenExpectations,
} from '../controllers/expectationController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Staff routes
router.post('/', roleMiddleware('staff'), submitExpectation);
router.get('/me', roleMiddleware('staff'), getMyExpectation);
router.get('/taken', roleMiddleware('staff'), getTakenExpectations);

// Admin routes
router.get('/', roleMiddleware('admin'), getAllExpectations);
router.delete('/:id', roleMiddleware('admin'), deleteExpectation);

export default router;
