/**
 * Enterprise Caching System for 100k+ Users
 * Multi-layer caching with Redis and in-memory fallback
 */

const Redis = require('redis');
const NodeCache = require('node-cache');

class EnterpriseCache {
  constructor() {
    this.redisClient = null;
    this.memoryCache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every minute
      useClones: false, // Don't clone objects for better performance
      maxKeys: 10000 // Limit memory cache size
    });
    
    this.cacheStats = {
      hits: 0,
      misses: 0,
      redisHits: 0,
      memoryHits: 0,
      errors: 0
    };
    
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = Redis.createClient({
          url: process.env.REDIS_URL,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.log('Redis connection refused, using memory cache only');
              return undefined;
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        this.redisClient.on('error', (err) => {
          console.error('Redis client error:', err);
          this.redisClient = null;
        });

        this.redisClient.on('connect', () => {
          console.log('✅ Redis connected for enterprise caching');
        });

        await this.redisClient.connect();
      }
    } catch (error) {
      console.log('Redis not available, using memory cache only:', error.message);
      this.redisClient = null;
    }
  }

  // Multi-layer cache get
  async get(key) {
    try {
      // Try Redis first (if available)
      if (this.redisClient) {
        try {
          const value = await this.redisClient.get(key);
          if (value !== null) {
            this.cacheStats.hits++;
            this.cacheStats.redisHits++;
            return JSON.parse(value);
          }
        } catch (redisError) {
          console.warn('Redis get error, falling back to memory cache:', redisError.message);
        }
      }

      // Fall back to memory cache
      const value = this.memoryCache.get(key);
      if (value !== undefined) {
        this.cacheStats.hits++;
        this.cacheStats.memoryHits++;
        return value;
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      this.cacheStats.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Multi-layer cache set
  async set(key, value, ttl = 300) {
    try {
      const serializedValue = JSON.stringify(value);

      // Set in Redis (if available)
      if (this.redisClient) {
        try {
          await this.redisClient.setEx(key, ttl, serializedValue);
        } catch (redisError) {
          console.warn('Redis set error, using memory cache only:', redisError.message);
        }
      }

      // Always set in memory cache as fallback
      this.memoryCache.set(key, value, ttl);
      
      return true;
    } catch (error) {
      this.cacheStats.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Cache with automatic key generation
  async cache(keyGenerator, dataFetcher, ttl = 300) {
    const key = typeof keyGenerator === 'function' ? keyGenerator() : keyGenerator;
    
    // Try to get from cache first
    let cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await dataFetcher();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Cache data fetcher error:', error);
      throw error;
    }
  }

  // Batch cache operations for performance
  async mget(keys) {
    const results = {};
    
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    
    return results;
  }

  async mset(keyValuePairs, ttl = 300) {
    const promises = [];
    
    for (const [key, value] of Object.entries(keyValuePairs)) {
      promises.push(this.set(key, value, ttl));
    }
    
    await Promise.all(promises);
    return true;
  }

  // Cache invalidation patterns
  async invalidate(pattern) {
    try {
      // Invalidate Redis keys matching pattern
      if (this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }

      // Invalidate memory cache keys matching pattern
      const memoryKeys = this.memoryCache.keys();
      const matchingKeys = memoryKeys.filter(key => key.match(pattern));
      this.memoryCache.del(matchingKeys);
      
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  // Cache warming for frequently accessed data
  async warmCache(warmingFunctions) {
    const promises = [];
    
    for (const { key, fetcher, ttl = 300 } of warmingFunctions) {
      promises.push(
        this.cache(key, fetcher, ttl).catch(error => {
          console.error(`Cache warming failed for ${key}:`, error);
        })
      );
    }
    
    await Promise.all(promises);
    console.log(`✅ Cache warmed with ${warmingFunctions.length} entries`);
  }

  // Cache statistics
  getStats() {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = totalRequests > 0 ? (this.cacheStats.hits / totalRequests) * 100 : 0;
    
    return {
      ...this.cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      redisConnected: this.redisClient !== null,
      memoryCacheSize: this.memoryCache.keys().length,
      memoryCacheStats: this.memoryCache.getStats()
    };
  }

  // Cache health check
  async healthCheck() {
    try {
      const testKey = 'health_check_' + Date.now();
      const testValue = { timestamp: new Date(), test: true };
      
      await this.set(testKey, testValue, 10);
      const retrieved = await this.get(testKey);
      
      if (retrieved && retrieved.test) {
        return { status: 'healthy', timestamp: new Date() };
      } else {
        return { status: 'unhealthy', error: 'Cache test failed', timestamp: new Date() };
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }

  // Clear all caches
  async clear() {
    try {
      // Clear Redis
      if (this.redisClient) {
        await this.redisClient.flushAll();
      }

      // Clear memory cache
      this.memoryCache.flushAll();
      
      // Reset stats
      this.cacheStats = {
        hits: 0,
        misses: 0,
        redisHits: 0,
        memoryHits: 0,
        errors: 0
      };
      
      console.log('✅ All caches cleared');
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Close connections
  async close() {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      console.log('✅ Enterprise cache connections closed');
    } catch (error) {
      console.error('Error closing cache connections:', error);
    }
  }
}

// Create singleton instance
const enterpriseCache = new EnterpriseCache();

module.exports = {
  enterpriseCache,
  get: (key) => enterpriseCache.get(key),
  set: (key, value, ttl) => enterpriseCache.set(key, value, ttl),
  cache: (keyGenerator, dataFetcher, ttl) => enterpriseCache.cache(keyGenerator, dataFetcher, ttl),
  mget: (keys) => enterpriseCache.mget(keys),
  mset: (keyValuePairs, ttl) => enterpriseCache.mset(keyValuePairs, ttl),
  invalidate: (pattern) => enterpriseCache.invalidate(pattern),
  warmCache: (warmingFunctions) => enterpriseCache.warmCache(warmingFunctions),
  getStats: () => enterpriseCache.getStats(),
  healthCheck: () => enterpriseCache.healthCheck(),
  clear: () => enterpriseCache.clear(),
  close: () => enterpriseCache.close()
};
