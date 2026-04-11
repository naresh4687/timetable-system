import express from 'express';
import {
    createBatch,
    getAllBatches,
    updateBatch,
    deleteBatch
} from '../controllers/batchController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Publicly accessible for now (readonly), but admin only for mutations
router.route('/')
    .get(authMiddleware, getAllBatches)
    .post(authMiddleware, roleMiddleware('admin'), createBatch);

router.route('/:id')
    .put(authMiddleware, roleMiddleware('admin'), updateBatch)
    .delete(authMiddleware, roleMiddleware('admin'), deleteBatch);

export default router;
