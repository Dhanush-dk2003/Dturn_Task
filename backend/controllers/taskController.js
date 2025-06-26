import prisma from '../prisma/client.js';
import logger from '../config/logger.js';

// Create and assign task
export const createTask = async (req, res) => {
  try {
    const { title, status, projectName, userEmail } = req.body;

    const project = await prisma.project.findUnique({ where: { name: projectName } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const task = await prisma.task.create({
      data: {
        title,
        status,
        project: { connect: { id: project.id } },
        user: { connect: { id: user.id } }
      }
    });

    res.status(201).json({ message: 'Task created and assigned', task });
  } catch (err) {
    logger.error('Task creation failed:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get tasks by project ID
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'Missing projectId' });

    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(projectId) },
      include: { user: true }
    });

    res.status(200).json(tasks);
  } catch (err) {
    logger.error('Failed to fetch tasks by project:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await prisma.task.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete task:', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// Get tasks assigned to the current user
export const getUserTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      include: { project: true }
    });
    res.status(200).json(tasks);
  } catch (err) {
    logger.error('Error fetching user tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.userId !== req.user.id) {
      logger.warn(`Unauthorized task update by ${req.user.email}`);
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.status(200).json(updated);
  } catch (err) {
    logger.error('Task update error:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};
