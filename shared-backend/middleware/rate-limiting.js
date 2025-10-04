const rateLimit = require('express-rate-limit');
const { redisCache } = require('../config/optimized-redis');

// Enhanced rate limiting for 100k users/day
const createRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    skip = (req) => false,
  } = options;

  // Create rate limiter configuration
  const rateLimitConfig = {
    windowMs,
    max,
    message: {
      success: false,
      message,
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    skip,
  };

  // Only use Redis store if Redis is available and connected
  if (redisCache && redisCache.isConnected && redisCache.client) {
    try {
      // Use in-memory store instead of Redis for now to avoid compatibility issues
      // Redis store can be added later when we have a compatible Redis client
      console.log('✅ Rate limiting using in-memory store');
    } catch (error) {
      console.warn('⚠️ Redis store not available, using in-memory store:', error.message);
    }
  } else {
    console.log('ℹ️ Redis not available, using in-memory rate limiting');
  }

  return rateLimit(rateLimitConfig);
};

// Different rate limits for different endpoints
const rateLimits = {
  // Authentication endpoints - stricter limits
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    keyGenerator: (req) => `auth:${req.ip}:${req.body?.email || req.body?.phone || 'unknown'}`,
  }),

  // Password reset - very strict
  passwordReset: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: 'Too many password reset attempts, please try again later.',
    keyGenerator: (req) => `password_reset:${req.ip}:${req.body?.email || 'unknown'}`,
  }),

  // API endpoints - moderate limits
  api: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes (for 100k users/day)
    message: 'Too many API requests, please try again later.',
    keyGenerator: (req) => `api:${req.ip}:${req.user?.id || 'anonymous'}`,
  }),

  // Car operations - moderate limits
  cars: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 car operations per 15 minutes
    message: 'Too many car operations, please try again later.',
    keyGenerator: (req) => `cars:${req.user?.id || req.ip}`,
  }),

  // File uploads - strict limits
  uploads: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: 'Too many file uploads, please try again later.',
    keyGenerator: (req) => `uploads:${req.user?.id || req.ip}`,
  }),

  // Health checks - very lenient
  health: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 health checks per minute
    message: 'Too many health check requests.',
    keyGenerator: (req) => `health:${req.ip}`,
    skip: (req) => req.path === '/health' && req.method === 'GET'
  }),

  // Admin operations - strict limits
  admin: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 admin operations per 15 minutes
    message: 'Too many admin operations, please try again later.',
    keyGenerator: (req) => `admin:${req.user?.id || req.ip}`,
  })
};

// Dynamic rate limiting based on user tier
const dynamicRateLimit = (req, res, next) => {
  const userTier = req.user?.tier || 'free';
  const baseLimit = {
    free: 100,      // 100 requests per 15 minutes
    premium: 500,   // 500 requests per 15 minutes
    enterprise: 2000 // 2000 requests per 15 minutes
  };

  const limit = baseLimit[userTier] || baseLimit.free;
  
  const dynamicLimiter = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: limit,
    keyGenerator: (req) => `dynamic:${req.user?.id || req.ip}:${userTier}`,
    message: `Rate limit exceeded for ${userTier} tier. Upgrade for higher limits.`,
  });

  dynamicLimiter(req, res, next);
};

// Burst protection for high-traffic scenarios
const burstProtection = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute (burst protection)
  message: 'Burst rate limit exceeded, please slow down your requests.',
  keyGenerator: (req) => `burst:${req.ip}`,
});

module.exports = {
  rateLimits,
  dynamicRateLimit,
  burstProtection,
  createRateLimit
};
