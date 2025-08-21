require('dotenv').config();
const { sequelize } = require('../models');
const { User, Ticket, ChatMessage } = require('../models');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    // Create default admin user
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
      },
    });

    // Create default technician user
    const [technician] = await User.findOrCreate({
      where: { email: 'tecnico@example.com' },
      defaults: {
        username: 'tecnico',
        email: 'tecnico@example.com',
        password: 'tecnico123',
        role: 'tecnico',
        isActive: true,
      },
    });

    // Create default regular user
    const [user] = await User.findOrCreate({
      where: { email: 'usuario@example.com' },
      defaults: {
        username: 'usuario',
        email: 'usuario@example.com',
        password: 'usuario123',
        role: 'usuario',
        isActive: true,
      },
    });

    logger.info('Database seeded successfully');
    return { admin, technician, user };
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

const migrate = async () => {
  try {
    // Test the database connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ force: process.env.NODE_ENV !== 'production' });
    logger.info('Database synchronized');

    // Seed the database with initial data
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }

    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrate();
