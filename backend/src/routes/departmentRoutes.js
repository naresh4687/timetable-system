import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All department routes require authentication
router.use(authMiddleware);

// Any authenticated user can read (needed for dropdowns)
router.get('/', getAllDepartments);

// Admin-only write operations
router.post('/', roleMiddleware('admin'), createDepartment);
router.put('/:id', roleMiddleware('admin'), updateDepartment);
router.delete('/:id', roleMiddleware('admin'), deleteDepartment);

export default router;
