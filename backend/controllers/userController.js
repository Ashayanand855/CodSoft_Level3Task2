const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AVATAR_COLORS = [
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Compute task counts for each user
    const usersWithStats = users.map((user) => {
      const totalTasks = user.tasks.length;
      const completedTasks = user.tasks.filter((t) => t.status === 'DONE').length;
      const pendingTasks = totalTasks - completedTasks;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        createdAt: user.createdAt,
        totalTasks,
        completedTasks,
        pendingTasks,
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const bcrypt = require('bcryptjs');

// Create a new user
const createUser = async (req, res) => {
  const { name, email, password, role, avatarColor } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, Email, Password, and Role are required' });
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Pick a random color if not specified
    const color = avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        avatarColor: color,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
};
