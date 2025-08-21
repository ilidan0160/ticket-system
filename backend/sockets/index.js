const logger = require('../utils/logger');
const { User } = require('../models');

// Store active connections
const activeConnections = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);
    
    // Handle authentication
    socket.on('authenticate', async (token, callback) => {
      try {
        const user = await authenticateSocket(token);
        if (!user) {
          return callback({ error: 'Authentication failed' });
        }
        
        // Store user's socket ID
        socket.userId = user.id;
        
        // Join user to their personal room
        socket.join(`user_${user.id}`);
        
        // Track active connections
        if (!activeConnections.has(user.id)) {
          activeConnections.set(user.id, new Set());
        }
        activeConnections.get(user.id).add(socket.id);
        
        logger.info(`User ${user.id} authenticated with socket ${socket.id}`);
        callback({ success: true, user: { id: user.id, username: user.username, role: user.role } });
      } catch (error) {
        logger.error('Socket authentication error:', error);
        callback({ error: 'Authentication error' });
      }
    });
    
    // Handle joining a ticket room
    socket.on('join_ticket', (ticketId) => {
      if (!socket.userId) return;
      
      socket.join(`ticket_${ticketId}`);
      logger.info(`User ${socket.userId} joined ticket ${ticketId}`);
    });
    
    // Handle leaving a ticket room
    socket.on('leave_ticket', (ticketId) => {
      socket.leave(`ticket_${ticketId}`);
      logger.info(`User ${socket.userId} left ticket ${ticketId}`);
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      if (!socket.userId || !data.ticketId) return;
      
      socket.to(`ticket_${data.ticketId}`).emit('user_typing', {
        userId: socket.userId,
        ticketId: data.ticketId,
        isTyping: data.isTyping !== false
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId && activeConnections.has(socket.userId)) {
        const userSockets = activeConnections.get(socket.userId);
        userSockets.delete(socket.id);
        
        if (userSockets.size === 0) {
          activeConnections.delete(socket.userId);
          logger.info(`User ${socket.userId} disconnected`);
        }
      }
      
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
  
  // Make io available globally
  global.io = io;
};

// Helper function to authenticate socket connection
const authenticateSocket = async (token) => {
  try {
    if (!token) return null;
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.user || !decoded.user.id) {
      return null;
    }
    
    const user = await User.findByPk(decoded.user.id, {
      attributes: ['id', 'username', 'email', 'role', 'isActive']
    });
    
    if (!user || !user.isActive) {
      return null;
    }
    
    return user;
  } catch (error) {
    logger.error('Socket authentication error:', error);
    return null;
  }
};

// Function to get active connections for a user
const getUserConnections = (userId) => {
  return activeConnections.get(userId) || new Set();
};

// Function to emit event to a specific user
const emitToUser = (userId, event, data) => {
  if (!global.io) return;
  
  const userSockets = activeConnections.get(userId);
  if (userSockets) {
    userSockets.forEach(socketId => {
      global.io.to(socketId).emit(event, data);
    });
  }
};

module.exports = {
  setupSocket,
  getUserConnections,
  emitToUser,
};
