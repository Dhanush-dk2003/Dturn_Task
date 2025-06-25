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
