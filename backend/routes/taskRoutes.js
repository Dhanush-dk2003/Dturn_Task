import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';
import { createTask,getTasksByProject,deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.post('/', protect, isAdmin, createTask);
router.get('/', protect, getTasksByProject);
router.delete('/:id', protect, isAdmin, deleteTask);

export default router;
