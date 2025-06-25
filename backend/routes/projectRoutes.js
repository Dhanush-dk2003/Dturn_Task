import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin, isManager } from '../middleware/roleMiddleware.js';
import { createProject } from '../controllers/projectController.js';

const router = express.Router();

router.post('/', protect, isAdmin, createProject,  (req, res) => {
  res.status(201).json({ message: 'Project created successfully' });
});

// Admin-only: Create a project
// router.post('/', protect, isAdmin, (req, res) => {
//   res.status(201).json({ message: 'Project created successfully' });
// });

// Admin-only: Delete a project
// router.delete('/:id', protect, isAdmin, (req, res) => {
//   res.json({ message: `Project ${req.params.id} deleted` });
// });

// Manager-only: View dashboard
// router.get('/manager-view', protect, isManager, (req, res) => {
//   res.json({ message: 'Manager dashboard view' });
// });

export default router;
