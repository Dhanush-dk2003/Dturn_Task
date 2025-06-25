import prisma from '../prisma/client.js';

export const createTask = async (req, res) => {
  try {
    const { title, status, projectName, userEmail } = req.body;

    // Get project ID by name
    const project = await prisma.project.findUnique({
      where: { name: projectName }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create and assign task
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
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'Missing projectId' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(projectId) },
      include: { user: true } // So you can get user.email
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};