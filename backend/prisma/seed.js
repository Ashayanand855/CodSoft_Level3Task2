const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data (in order of dependencies)
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing database records.');

  const defaultPassword = await bcrypt.hash('password123', 10);
  const itPassword = await bcrypt.hash('password@123', 10);

  // Create Users
  const userIT = await prisma.user.create({
    data: {
      name: 'IT Department',
      email: 'IT@promanage.com',
      password: itPassword,
      role: 'ADMIN',
      avatarColor: '#3B82F6', // Blue
    },
  });

  const userBob = await prisma.user.create({
    data: {
      name: 'Bob Miller',
      email: 'bob@example.com',
      password: defaultPassword,
      role: 'DEPARTMENT',
      avatarColor: '#10B981', // Emerald
    },
  });

  const userCharlie = await prisma.user.create({
    data: {
      name: 'Charlie Smith',
      email: 'charlie@example.com',
      password: defaultPassword,
      role: 'EMPLOYEE',
      avatarColor: '#F59E0B', // Amber
    },
  });

  console.log('Created Users:', [userIT.name, userBob.name, userCharlie.name]);

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Alpha Redesign',
      description: 'Overhaul of the main product landing page and customer portal with glassmorphism UI.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Launch',
      description: 'Prepare documentation, store assets, and marketing campaign for iOS & Android app release.',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
  });

  console.log('Created Projects:', [project1.name, project2.name]);

  // Create Tasks for Project 1
  await prisma.task.create({
    data: {
      title: 'Design Hero Section',
      description: 'Draft modern layouts using custom gradients and modern typography.',
      status: 'DONE',
      priority: 'HIGH',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      projectId: project1.id,
      assigneeId: userIT.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Navigation Menu',
      description: 'Create a fully responsive glassmorphism navigation menu.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days now
      projectId: project1.id,
      assigneeId: userBob.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Connect Contact Forms',
      description: 'Set up Express API handlers to capture user submissions.',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      projectId: project1.id,
      assigneeId: userCharlie.id,
    },
  });

  // Create Tasks for Project 2
  await prisma.task.create({
    data: {
      title: 'Draft Store Listing Assets',
      description: 'Produce promotional text, high-res screenshots, and App Store badges.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      projectId: project2.id,
      assigneeId: userIT.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Marketing Email Setup',
      description: 'Configure campaign triggers and create launch templates.',
      status: 'TODO',
      priority: 'LOW',
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      projectId: project2.id,
      assigneeId: null, // Unassigned
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
