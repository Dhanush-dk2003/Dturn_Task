import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import { createTask } from '../controllers/taskController.js';

const router = express.Router();

router.post('/', protect, isAdmin, createTask);

export default router;
