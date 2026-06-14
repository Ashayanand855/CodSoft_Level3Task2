const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarColor: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate progress for each project
    const projectsWithStats = projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        totalTasks,
        completedTasks,
        progress,
      };
    });

    res.json(projectsWithStats);
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get a project by ID with its tasks and details
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarColor: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      ...project,
      totalTasks,
      completedTasks,
      progress,
    });
  } catch (error) {
    console.error('Error in getProjectById:', error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
};

// Create a project
const createProject = async (req, res) => {
  const { name, description, status, priority, startDate, endDate } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'PLANNING',
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update a project
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, priority, startDate, endDate } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.json(project);
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({
      where: { id },
    });
    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
