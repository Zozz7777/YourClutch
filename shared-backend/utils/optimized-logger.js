/**
 * Optimized Logger for High-Traffic Production
 * Designed for millions of users with minimal performance impact
 */

const winston = require('winston');
const path = require('path');

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'warn' : 'info');

// Create optimized logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    // Use simple format instead of JSON for better performance
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}${stack ? `\n${stack}` : ''}`;
    })
  ),
  defaultMeta: { service: 'clutch-backend' },
  transports: []
});

// Production logging - optimized for performance
if (isProduction) {
  // Only log errors and warnings in production
  logger.add(new winston.transports.Console({
    level: 'warn',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
  
  // File logging with rotation
  logger.add(new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    tailable: true
  }));
  
  logger.add(new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3,
    tailable: true
  }));
} else {
  // Development logging - more verbose
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Performance-optimized logging methods
const optimizedLogger = {
  // Error logging - always enabled
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },
  
  // Warning logging - enabled in production
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  
  // Info logging - only in development
  info: (message, meta = {}) => {
    if (isDevelopment || logLevel === 'debug') {
      logger.info(message, meta);
    }
  },
  
  // Debug logging - only in development
  debug: (message, meta = {}) => {
    if (isDevelopment) {
      logger.debug(message, meta);
    }
  },
  
  // Performance logging - lightweight
  performance: (message, meta = {}) => {
    if (isDevelopment || logLevel === 'debug') {
      logger.info(`[PERF] ${message}`, meta);
    }
  },
  
  // Security logging - always enabled
  security: (message, meta = {}) => {
    logger.warn(`[SECURITY] ${message}`, meta);
  },
  
  // Database logging - only in development
  database: (message, meta = {}) => {
    if (isDevelopment) {
      logger.debug(`[DB] ${message}`, meta);
    }
  }
};

// Conditional logging helper
const conditionalLog = (condition, level, message, meta = {}) => {
  if (condition) {
    optimizedLogger[level](message, meta);
  }
};

// Performance monitoring
let logCount = 0;
const maxLogsPerSecond = 100; // Rate limit logging

const rateLimitedLog = (level, message, meta = {}) => {
  logCount++;
  if (logCount > maxLogsPerSecond) {
    return; // Skip logging if rate limited
  }
  
  optimizedLogger[level](message, meta);
  
  // Reset counter every second
  if (logCount === 1) {
    setTimeout(() => {
      logCount = 0;
    }, 1000);
  }
};

module.exports = {
  logger: optimizedLogger,
  conditionalLog,
  rateLimitedLog,
  // Export original logger for compatibility
  winston: logger
};
