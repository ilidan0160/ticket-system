const winston = require('winston');
const path = require('path');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const msg = stack || message;
  return `${timestamp} [${level}]: ${msg}`;
});

// Development logger with colors
const developmentLogger = () => {
  return createLogger({
    level: 'debug', // Log everything in development
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      logFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
      }),
      new transports.File({ filename: path.join(logDir, 'combined.log') }),
    ],
  });
};

// Production logger (JSON format)
const productionLogger = () => {
  return createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      format.errors({ stack: true }),
      json()
    ),
    defaultMeta: { service: 'ticket-system' },
    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
      }),
      new transports.File({ filename: path.join(logDir, 'combined.log') }),
    ],
  });
};

// Select logger based on environment
const logger = process.env.NODE_ENV === 'production' 
  ? productionLogger() 
  : developmentLogger();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = logger;
