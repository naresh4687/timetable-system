import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllStaff,
  bulkDeleteUsers,
  getStaffCount,
  getProfile,
  updateProfile,
  uploadProfileImage,
} from '../controllers/userController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

// Configure multer for local upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `profile-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });


const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Staff list - Admin and Manager can view
router.get('/staff', roleMiddleware('admin', 'manager'), getAllStaff);

// Staff count - Admin only
router.get('/staff-count', roleMiddleware('admin'), getStaffCount);

// Own profile - any authenticated user
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-image', upload.single('image'), uploadProfileImage);

// Admin-only routes
router.post('/', roleMiddleware('admin'), createUser);
router.get('/', roleMiddleware('admin'), getAllUsers);
router.post('/bulk-delete', roleMiddleware('admin'), bulkDeleteUsers);
router.get('/:id', roleMiddleware('admin'), getUserById);
router.put('/:id', roleMiddleware('admin'), updateUser);
router.delete('/:id', roleMiddleware('admin'), deleteUser);

export default router;
