const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const auth = (roles = []) => {
  // Convert roles to array if it's a string
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    // Authenticate user
    async (req, res, next) => {
      try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user.id);

        if (!user) {
          return res.status(401).json({ message: 'Token is not valid' });
        }

        // Check if user is active
        if (!user.isActive) {
          return res.status(401).json({ message: 'User account is disabled' });
        }

        // Check if user role is authorized
        if (roles.length && !roles.includes(user.role)) {
          return res.status(403).json({ message: 'Not authorized to access this route' });
        }

        // Add user from payload
        req.user = user;
        next();
      } catch (err) {
        logger.error('Auth middleware error:', err);
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Token is not valid' });
        }
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        }
        res.status(500).json({ message: 'Server Error' });
      }
    },
  ];
};

const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = {
  auth,
  generateToken,
};
