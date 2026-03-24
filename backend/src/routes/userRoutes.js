import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllStaff,
} from '../controllers/userController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Staff list - Admin and Manager can view
router.get('/staff', roleMiddleware('admin', 'manager'), getAllStaff);

// Admin-only routes
router.post('/', roleMiddleware('admin'), createUser);
router.get('/', roleMiddleware('admin'), getAllUsers);
router.get('/:id', roleMiddleware('admin'), getUserById);
router.put('/:id', roleMiddleware('admin'), updateUser);
router.delete('/:id', roleMiddleware('admin'), deleteUser);

export default router;
