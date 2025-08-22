require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const chatRoutes = require('./routes/chat');
const { setupSocket } = require('./sockets');
const { setupTelegramBot } = require('./services/telegram');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
      <h1>Bienvenido al Sistema de Tickets</h1>
      <p>El servidor está en funcionamiento correctamente.</p>
      <p>Endpoints disponibles:</p>
      <ul style="list-style: none; padding: 0;">
        <li><strong>API:</strong> <a href="/api">/api</a></li>
        <li><strong>Auth:</strong> <a href="/api/auth">/api/auth</a></li>
        <li><strong>Tickets:</strong> <a href="/api/tickets">/api/tickets</a></li>
        <li><strong>Health Check:</strong> <a href="/health">/health</a></li>
      </ul>
    </div>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    // Sync database
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    // Setup WebSocket
    setupSocket(io);
    
    // Setup Telegram bot
    if (process.env.TELEGRAM_BOT_TOKEN) {
      setupTelegramBot();
    }

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
