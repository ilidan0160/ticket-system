const { validationResult } = require('express-validator');
const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role = 'usuario' } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Create user
    user = await User.create({
      username,
      email,
      password,
      role,
    });

    // Return jsonwebtoken
    const token = generateToken(user);
    
    // Don't send password in response
    user = user.get({ plain: true });
    delete user.password;

    res.status(201).json({ token, user });
  } catch (err) {
    logger.error('Error in user registration:', err);
    res.status(500).send('Server error');
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ errors: [{ msg: 'Account is disabled' }] });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return jsonwebtoken
    const token = generateToken(user);
    
    // Don't send password in response
    user = user.get({ plain: true });
    delete user.password;

    res.json({ token, user });
  } catch (err) {
    logger.error('Error in user login:', err);
    res.status(500).send('Server error');
  }
};

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    logger.error('Error getting user:', err);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/auth/seed
// @desc    Seed initial users (for development only)
// @access  Public
exports.seedUsers = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(401).json({ msg: 'Not authorized in production' });
  }

  try {
    // Create admin user
    const admin = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
      },
    });

    // Create technician user
    const tecnico = await User.findOrCreate({
      where: { email: 'tecnico@example.com' },
      defaults: {
        username: 'tecnico',
        email: 'tecnico@example.com',
        password: 'tecnico123',
        role: 'tecnico',
        isActive: true,
      },
    });

    // Create regular user
    const usuario = await User.findOrCreate({
      where: { email: 'usuario@example.com' },
      defaults: {
        username: 'usuario',
        email: 'usuario@example.com',
        password: 'usuario123',
        role: 'usuario',
        isActive: true,
      },
    });

    res.json({ message: 'Users seeded successfully' });
  } catch (err) {
    logger.error('Error seeding users:', err);
    res.status(500).send('Server error');
  }
};
