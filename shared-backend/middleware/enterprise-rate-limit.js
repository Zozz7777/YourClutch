/**
 * Enterprise Rate Limiting for 100k+ Users
 * Advanced rate limiting with Redis backend and intelligent throttling
 */

const rateLimit = require('express-rate-limit');
const Redis = require('redis');

class EnterpriseRateLimit {
  constructor() {
    this.redisClient = null;
    this.rateLimitStore = new Map();
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = Redis.createClient({
          url: process.env.REDIS_URL,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        this.redisClient.on('error', (err) => {
          console.error('Redis rate limit error:', err);
          this.redisClient = null;
        });

        await this.redisClient.connect();
      }
    } catch (error) {
      console.log('Redis not available for rate limiting, using memory store');
      this.redisClient = null;
    }
  }

  // Create rate limiter with Redis backend
  createRateLimiter(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // limit each IP to 100 requests per windowMs
      message = 'Too many requests from this IP, please try again later',
      standardHeaders = true,
      legacyHeaders = false,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      keyGenerator = (req) => req.ip,
      skip = (req) => false
    } = options;

    return rateLimit({
      windowMs,
      max,
      message: {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders,
      legacyHeaders,
      skipSuccessfulRequests,
      skipFailedRequests,
      keyGenerator,
      skip,
      store: this.redisClient ? this.createRedisStore() : undefined,
      handler: (req, res) => {
        console.warn(`Rate limit exceeded for ${keyGenerator(req)} on ${req.path}`);
        res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: Math.ceil(windowMs / 1000),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Create Redis store for rate limiting
  createRedisStore() {
    return {
      async increment(key, windowMs) {
        const now = Date.now();
        const window = Math.floor(now / windowMs);
        const redisKey = `rate_limit:${key}:${window}`;
        
        try {
          const current = await this.redisClient.incr(redisKey);
          if (current === 1) {
            await this.redisClient.expire(redisKey, Math.ceil(windowMs / 1000));
          }
          return {
            totalHits: current,
            resetTime: new Date((window + 1) * windowMs)
          };
        } catch (error) {
          console.error('Redis rate limit store error:', error);
          return { totalHits: 1, resetTime: new Date(now + windowMs) };
        }
      },

      async decrement(key, windowMs) {
        const now = Date.now();
        const window = Math.floor(now / windowMs);
        const redisKey = `rate_limit:${key}:${window}`;
        
        try {
          await this.redisClient.decr(redisKey);
        } catch (error) {
          console.error('Redis rate limit decrement error:', error);
        }
      },

      async resetKey(key) {
        const pattern = `rate_limit:${key}:*`;
        try {
          const keys = await this.redisClient.keys(pattern);
          if (keys.length > 0) {
            await this.redisClient.del(keys);
          }
        } catch (error) {
          console.error('Redis rate limit reset error:', error);
        }
      }
    };
  }

  // Tiered rate limiting based on user type
  getTieredRateLimit() {
    return (req, res, next) => {
      const userRole = req.user?.role;
      const isAuthenticated = !!req.user;
      
      // Define rate limits based on user tier
      const rateLimits = {
        'super_admin': { windowMs: 15 * 60 * 1000, max: 1000 },
        'admin': { windowMs: 15 * 60 * 1000, max: 500 },
        'partner_owner': { windowMs: 15 * 60 * 1000, max: 200 },
        'partner_manager': { windowMs: 15 * 60 * 1000, max: 100 },
        'partner_employee': { windowMs: 15 * 60 * 1000, max: 50 },
        'customer': { windowMs: 15 * 60 * 1000, max: 20 },
        'anonymous': { windowMs: 15 * 60 * 1000, max: 10 }
      };

      const userTier = isAuthenticated ? userRole : 'anonymous';
      const limits = rateLimits[userTier] || rateLimits['anonymous'];
      
      // Apply the appropriate rate limit
      const limiter = this.createRateLimiter({
        windowMs: limits.windowMs,
        max: limits.max,
        keyGenerator: (req) => {
          return isAuthenticated ? `user:${req.user.id}` : req.ip;
        },
        message: `Rate limit exceeded for ${userTier} tier`
      });

      limiter(req, res, next);
    };
  }

  // API endpoint specific rate limits
  getEndpointRateLimits() {
    return {
      // Authentication endpoints - very strict
      auth: this.createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per 15 minutes
        message: 'Too many authentication attempts, please try again later',
        keyGenerator: (req) => `auth:${req.ip}`,
        skipSuccessfulRequests: true
      }),

      // File upload endpoints - moderate
      upload: this.createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 uploads per hour
        message: 'Too many file uploads, please try again later',
        keyGenerator: (req) => `upload:${req.user?.id || req.ip}`
      }),

      // Search endpoints - generous
      search: this.createRateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 20, // 20 searches per minute
        message: 'Too many search requests, please slow down',
        keyGenerator: (req) => `search:${req.user?.id || req.ip}`
      }),

      // API endpoints - standard
      api: this.createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per 15 minutes
        message: 'Too many API requests, please try again later',
        keyGenerator: (req) => `api:${req.user?.id || req.ip}`
      }),

      // Admin endpoints - higher limits
      admin: this.createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 200, // 200 requests per 15 minutes
        message: 'Too many admin requests, please try again later',
        keyGenerator: (req) => `admin:${req.user?.id || req.ip}`
      })
    };
  }

  // Burst protection for DDoS mitigation
  getBurstProtection() {
    return this.createRateLimiter({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // 30 requests per minute
      message: 'Burst rate limit exceeded, please slow down',
      keyGenerator: (req) => `burst:${req.ip}`,
      skip: (req) => {
        // Skip burst protection for authenticated users with good reputation
        return req.user && ['super_admin', 'admin'].includes(req.user.role);
      }
    });
  }

  // Geographic rate limiting (if needed)
  getGeographicRateLimit() {
    return (req, res, next) => {
      // This would integrate with a geo-IP service
      // For now, we'll use a simple implementation
      const country = req.headers['cf-ipcountry'] || 'unknown';
      
      // Different limits for different regions
      const regionalLimits = {
        'US': { windowMs: 15 * 60 * 1000, max: 100 },
        'EU': { windowMs: 15 * 60 * 1000, max: 100 },
        'AS': { windowMs: 15 * 60 * 1000, max: 50 },
        'unknown': { windowMs: 15 * 60 * 1000, max: 20 }
      };

      const limits = regionalLimits[country] || regionalLimits['unknown'];
      
      const limiter = this.createRateLimiter({
        windowMs: limits.windowMs,
        max: limits.max,
        keyGenerator: (req) => `geo:${country}:${req.ip}`,
        message: `Rate limit exceeded for region ${country}`
      });

      limiter(req, res, next);
    };
  }

  // Rate limit analytics
  async getRateLimitStats() {
    try {
      if (this.redisClient) {
        const keys = await this.redisClient.keys('rate_limit:*');
        const stats = {
          totalKeys: keys.length,
          activeRateLimits: keys.length,
          timestamp: new Date()
        };
        return stats;
      }
      return { totalKeys: 0, activeRateLimits: 0, timestamp: new Date() };
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return { totalKeys: 0, activeRateLimits: 0, error: error.message, timestamp: new Date() };
    }
  }

  // Clear rate limits for a specific key
  async clearRateLimit(key) {
    try {
      if (this.redisClient) {
        const pattern = `rate_limit:${key}:*`;
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }
      return true;
    } catch (error) {
      console.error('Error clearing rate limit:', error);
      return false;
    }
  }
}

// Create singleton instance
const enterpriseRateLimit = new EnterpriseRateLimit();

module.exports = {
  enterpriseRateLimit,
  createRateLimiter: (options) => enterpriseRateLimit.createRateLimiter(options),
  getTieredRateLimit: () => enterpriseRateLimit.getTieredRateLimit(),
  getEndpointRateLimits: () => enterpriseRateLimit.getEndpointRateLimits(),
  getBurstProtection: () => enterpriseRateLimit.getBurstProtection(),
  getGeographicRateLimit: () => enterpriseRateLimit.getGeographicRateLimit(),
  getRateLimitStats: () => enterpriseRateLimit.getRateLimitStats(),
  clearRateLimit: (key) => enterpriseRateLimit.clearRateLimit(key)
};
