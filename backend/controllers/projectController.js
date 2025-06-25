import prisma from '../prisma/client.js';

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await prisma.project.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'Project with this name already exists' });
    }

    const project = await prisma.project.create({
      data: { name }
    });

    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
