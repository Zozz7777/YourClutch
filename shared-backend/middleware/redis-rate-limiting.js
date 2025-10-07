/**
 * Redis-Backed Rate Limiting for Horizontal Scaling
 * Supports distributed rate limiting across multiple servers
 */

const { redisCache } = require('./redis-cache');
const { optimizedLogger } = require('../utils/optimized-logger');

class RedisRateLimiter {
  constructor() {
    this.isConnected = false;
    this.fallbackLimits = new Map(); // Fallback for when Redis is unavailable
  }

  async initialize() {
    this.isConnected = redisCache.isConnected;
    return this.isConnected;
  }

  /**
   * Redis-backed rate limiting using sliding window
   */
  async checkRateLimit(key, limit, windowMs) {
    if (!this.isConnected) {
      return this.fallbackRateLimit(key, limit, windowMs);
    }

    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      const redisKey = `rate_limit:${key}`;

      // Use Redis pipeline for atomic operations
      const pipeline = redisCache.client.pipeline();
      
      // Remove expired entries
      pipeline.zRemRangeByScore(redisKey, 0, windowStart);
      
      // Count current requests
      pipeline.zCard(redisKey);
      
      // Add current request
      pipeline.zAdd(redisKey, { score: now, value: `${now}-${Math.random()}` });
      
      // Set expiry
      pipeline.expire(redisKey, Math.ceil(windowMs / 1000));
      
      const results = await pipeline.exec();
      const currentCount = results[1][1]; // Count from zCard
      
      return {
        allowed: currentCount < limit,
        remaining: Math.max(0, limit - currentCount - 1),
        resetTime: now + windowMs,
        total: currentCount + 1
      };
    } catch (error) {
      optimizedLogger.error('Redis rate limit error:', error);
      return this.fallbackRateLimit(key, limit, windowMs);
    }
  }

  /**
   * Fallback rate limiting when Redis is unavailable
   */
  fallbackRateLimit(key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.fallbackLimits.has(key)) {
      this.fallbackLimits.set(key, []);
    }
    
    const requests = this.fallbackLimits.get(key);
    
    // Remove expired requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: validRequests[0] + windowMs,
        total: validRequests.length
      };
    }
    
    // Add current request
    validRequests.push(now);
    this.fallbackLimits.set(key, validRequests);
    
    return {
      allowed: true,
      remaining: limit - validRequests.length,
      resetTime: now + windowMs,
      total: validRequests.length
    };
  }

  /**
   * Token bucket rate limiting
   */
  async checkTokenBucket(key, capacity, refillRate, tokens = 1) {
    if (!this.isConnected) {
      return this.fallbackTokenBucket(key, capacity, refillRate, tokens);
    }

    try {
      const now = Date.now();
      const redisKey = `token_bucket:${key}`;
      
      const pipeline = redisCache.client.pipeline();
      
      // Get current bucket state
      pipeline.hGetAll(redisKey);
      
      // Set default values if bucket doesn't exist
      pipeline.hSetNX(redisKey, 'tokens', capacity);
      pipeline.hSetNX(redisKey, 'lastRefill', now);
      
      const results = await pipeline.exec();
      const bucket = results[0][1];
      
      let currentTokens = parseFloat(bucket.tokens || capacity);
      const lastRefill = parseInt(bucket.lastRefill || now);
      
      // Calculate tokens to add based on time passed
      const timePassed = now - lastRefill;
      const tokensToAdd = (timePassed / 1000) * refillRate;
      currentTokens = Math.min(capacity, currentTokens + tokensToAdd);
      
      if (currentTokens >= tokens) {
        // Consume tokens
        currentTokens -= tokens;
        
        await redisCache.client.hSet(redisKey, {
          tokens: currentTokens,
          lastRefill: now
        });
        
        await redisCache.client.expire(redisKey, 3600); // 1 hour expiry
        
        return {
          allowed: true,
          remaining: Math.floor(currentTokens),
          resetTime: now + ((capacity - currentTokens) / refillRate) * 1000
        };
      } else {
        return {
          allowed: false,
          remaining: Math.floor(currentTokens),
          resetTime: now + ((tokens - currentTokens) / refillRate) * 1000
        };
      }
    } catch (error) {
      optimizedLogger.error('Token bucket error:', error);
      return this.fallbackTokenBucket(key, capacity, refillRate, tokens);
    }
  }

  /**
   * Fallback token bucket
   */
  fallbackTokenBucket(key, capacity, refillRate, tokens) {
    const now = Date.now();
    const bucketKey = `fallback_bucket:${key}`;
    
    if (!this.fallbackLimits.has(bucketKey)) {
      this.fallbackLimits.set(bucketKey, {
        tokens: capacity,
        lastRefill: now
      });
    }
    
    const bucket = this.fallbackLimits.get(bucketKey);
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = (timePassed / 1000) * refillRate;
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime: now + ((capacity - bucket.tokens) / refillRate) * 1000
      };
    } else {
      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        resetTime: now + ((tokens - bucket.tokens) / refillRate) * 1000
      };
    }
  }

  /**
   * Clear rate limit for a key
   */
  async clearRateLimit(key) {
    if (this.isConnected) {
      try {
        await redisCache.client.del(`rate_limit:${key}`);
        await redisCache.client.del(`token_bucket:${key}`);
      } catch (error) {
        optimizedLogger.error('Clear rate limit error:', error);
      }
    }
    
    this.fallbackLimits.delete(key);
    this.fallbackLimits.delete(`fallback_bucket:${key}`);
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats() {
    if (!this.isConnected) {
      return {
        connected: false,
        fallbackEntries: this.fallbackLimits.size
      };
    }

    try {
      const keys = await redisCache.client.keys('rate_limit:*');
      const tokenBuckets = await redisCache.client.keys('token_bucket:*');
      
      return {
        connected: true,
        rateLimitKeys: keys.length,
        tokenBucketKeys: tokenBuckets.length,
        fallbackEntries: this.fallbackLimits.size
      };
    } catch (error) {
      optimizedLogger.error('Rate limit stats error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const redisRateLimiter = new RedisRateLimiter();

/**
 * Express middleware factory for Redis rate limiting
 */
const createRedisRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    keyGenerator = (req) => req.ip,
    skip = (req) => false,
    message = 'Too many requests, please try again later.',
    standardHeaders = true,
    legacyHeaders = false
  } = options;

  return async (req, res, next) => {
    try {
      // Skip if condition is met
      if (skip(req)) {
        return next();
      }

      const key = keyGenerator(req);
      const result = await redisRateLimiter.checkRateLimit(key, max, windowMs);

      // Set headers
      if (standardHeaders) {
        res.set('RateLimit-Limit', max.toString());
        res.set('RateLimit-Remaining', result.remaining.toString());
        res.set('RateLimit-Reset', new Date(result.resetTime).toISOString());
      }

      if (legacyHeaders) {
        res.set('X-RateLimit-Limit', max.toString());
        res.set('X-RateLimit-Remaining', result.remaining.toString());
        res.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      }

      if (!result.allowed) {
        optimizedLogger.warn('Rate limit exceeded', {
          key,
          limit: max,
          window: windowMs,
          ip: req.ip,
          user: req.user?.email || 'anonymous'
        });

        return res.status(429).json({
          success: false,
          message,
          error: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      optimizedLogger.error('Rate limit middleware error:', error);
      next(); // Continue on error to avoid blocking requests
    }
  };
};

/**
 * Token bucket rate limiting middleware
 */
const createTokenBucketLimit = (options = {}) => {
  const {
    capacity = 100,
    refillRate = 10, // tokens per second
    tokens = 1,
    keyGenerator = (req) => req.ip,
    skip = (req) => false,
    message = 'Rate limit exceeded, please try again later.'
  } = options;

  return async (req, res, next) => {
    try {
      if (skip(req)) {
        return next();
      }

      const key = keyGenerator(req);
      const result = await redisRateLimiter.checkTokenBucket(key, capacity, refillRate, tokens);

      if (!result.allowed) {
        optimizedLogger.warn('Token bucket limit exceeded', {
          key,
          capacity,
          refillRate,
          tokens,
          ip: req.ip
        });

        return res.status(429).json({
          success: false,
          message,
          error: 'TOKEN_BUCKET_LIMIT_EXCEEDED',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      optimizedLogger.error('Token bucket middleware error:', error);
      next();
    }
  };
};

module.exports = {
  RedisRateLimiter,
  redisRateLimiter,
  createRedisRateLimit,
  createTokenBucketLimit
};
