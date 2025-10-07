/**
 * Redis Cache Middleware for High-Traffic Production
 * Replaces in-memory Map() caches with proper Redis implementation
 */

const redis = require('redis');
const { optimizedLogger } = require('../utils/optimized-logger');

class RedisCacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async initialize() {
    try {
      // Redis configuration for production
      const redisConfig = {
        url: process.env.REDIS_URL || process.env.REDIS_HOST,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetries) {
              optimizedLogger.warn('Redis connection failed after max retries');
              return false;
            }
            return Math.min(retries * 100, 3000);
          }
        },
        retry: {
          retries: this.maxRetries,
          delay: (attempt) => Math.min(attempt * 100, 3000)
        }
      };

      this.client = redis.createClient(redisConfig);
      
      // Event handlers
      this.client.on('connect', () => {
        optimizedLogger.info('Redis client connected');
        this.isConnected = true;
        this.retryCount = 0;
      });

      this.client.on('error', (error) => {
        optimizedLogger.error('Redis client error:', error);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        optimizedLogger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      optimizedLogger.error('Redis initialization failed:', error);
      return false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      optimizedLogger.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    if (!this.isConnected) return false;
    
    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      optimizedLogger.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      optimizedLogger.error('Redis del error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      optimizedLogger.error('Redis exists error:', error);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected) return false;
    
    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      optimizedLogger.error('Redis flush error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Create singleton instance
const redisCache = new RedisCacheManager();

// Request caching middleware with Redis
const requestCaching = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated admin routes
    if (req.path.includes('/admin/') && req.user) {
      return next();
    }

    const cacheKey = `cache:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    try {
      // Try to get from cache
      const cached = await redisCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < ttl * 1000) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-TTL', Math.round((ttl * 1000 - (Date.now() - cached.timestamp)) / 1000));
        return res.json(cached.data);
      }

      // Override res.json to cache successful responses
      const originalJson = res.json;
      res.json = function(data) {
        if (res.statusCode === 200 && data.success !== false) {
          // Cache asynchronously to avoid blocking response
          setImmediate(async () => {
            await redisCache.set(cacheKey, {
              data,
              timestamp: Date.now()
            }, ttl);
          });
          res.set('X-Cache', 'MISS');
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      optimizedLogger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Performance monitoring cache
const performanceCache = {
  async get(key) {
    return await redisCache.get(`perf:${key}`);
  },

  async set(key, value, ttl = 60) {
    return await redisCache.set(`perf:${key}`, value, ttl);
  },

  async increment(key, ttl = 60) {
    if (!redisCache.isConnected) return 0;
    
    try {
      const current = await redisCache.client.incr(`perf:${key}`);
      if (current === 1) {
        await redisCache.client.expire(`perf:${key}`, ttl);
      }
      return current;
    } catch (error) {
      optimizedLogger.error('Performance cache increment error:', error);
      return 0;
    }
  }
};

// Session cache for horizontal scaling
const sessionCache = {
  async get(sessionId) {
    return await redisCache.get(`session:${sessionId}`);
  },

  async set(sessionId, data, ttl = 86400) { // 24 hours
    return await redisCache.set(`session:${sessionId}`, data, ttl);
  },

  async del(sessionId) {
    return await redisCache.del(`session:${sessionId}`);
  }
};

module.exports = {
  redisCache,
  requestCaching,
  performanceCache,
  sessionCache,
  RedisCacheManager
};
