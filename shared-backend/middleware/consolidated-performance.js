/**
 * Consolidated Performance Middleware
 * Replaces multiple duplicate middleware layers with single optimized solution
 */

const compression = require('compression');
const { redisCache, requestCaching, performanceCache } = require('./redis-cache');
const { optimizedLogger } = require('../utils/optimized-logger');

// Performance tracking
const performanceTracker = {
  requests: 0,
  slowRequests: 0,
  averageResponseTime: 0,
  totalResponseTime: 0
};

/**
 * Consolidated performance middleware
 * Combines: caching, compression, timing, monitoring, optimization
 */
const consolidatedPerformance = (options = {}) => {
  const {
    enableCaching = true,
    enableCompression = true,
    enableTiming = true,
    enableMonitoring = true,
    cacheTTL = 300,
    compressionLevel = 6,
    slowRequestThreshold = 2000
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();
    req.startTime = startTime;
    
    // Performance tracking
    performanceTracker.requests++;
    
    // Request timing
    if (enableTiming) {
      req.timing = {
        middleware: 0,
        database: 0,
        external: 0,
        total: 0
      };
    }

    // Request caching (only for GET requests)
    if (enableCaching && req.method === 'GET') {
      const cacheKey = `cache:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
      
      try {
        const cached = await redisCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTTL * 1000) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-TTL', Math.round((cacheTTL * 1000 - (Date.now() - cached.timestamp)) / 1000));
          return res.json(cached.data);
        }
      } catch (error) {
        optimizedLogger.error('Cache retrieval error:', error);
      }
    }

    // Override res.json to capture timing and cache responses
    const originalJson = res.json;
    res.json = function(data) {
      const totalTime = Date.now() - startTime;
      
      // Update performance metrics
      performanceTracker.totalResponseTime += totalTime;
      performanceTracker.averageResponseTime = performanceTracker.totalResponseTime / performanceTracker.requests;
      
      if (totalTime > slowRequestThreshold) {
        performanceTracker.slowRequests++;
        optimizedLogger.warn(`Slow request: ${req.method} ${req.originalUrl} - ${totalTime}ms`, {
          user: req.user?.email || 'anonymous',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      // Cache successful responses
      if (enableCaching && req.method === 'GET' && res.statusCode === 200 && data.success !== false) {
        const cacheKey = `cache:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
        setImmediate(async () => {
          try {
            await redisCache.set(cacheKey, {
              data,
              timestamp: Date.now()
            }, cacheTTL);
            res.set('X-Cache', 'MISS');
          } catch (error) {
            optimizedLogger.error('Cache storage error:', error);
          }
        });
      }

      // Set performance headers
      res.set('X-Response-Time', `${totalTime}ms`);
      res.set('X-Request-ID', req.id || 'unknown');
      
      return originalJson.call(this, data);
    };

    // Memory optimization
    if (global.gc && process.memoryUsage().heapUsed > 100 * 1024 * 1024) { // 100MB
      setImmediate(() => {
        global.gc();
        optimizedLogger.performance('Garbage collection triggered');
      });
    }

    next();
  };
};

/**
 * Optimized compression middleware
 */
const optimizedCompression = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    // Skip compression for already compressed content
    if (req.headers['x-no-compression']) return false;
    if (res.getHeader('Content-Encoding')) return false;
    return true;
  }
});

/**
 * Request timeout middleware
 */
const requestTimeout = (timeout = 20000) => {
  return (req, res, next) => {
    req.timeout = setTimeout(() => {
      if (!res.headersSent) {
        optimizedLogger.warn(`Request timeout: ${req.method} ${req.originalUrl}`, {
          timeout,
          user: req.user?.email || 'anonymous'
        });
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          timeout
        });
      }
    }, timeout);

    // Clear timeout on response
    const originalEnd = res.end;
    res.end = function(...args) {
      clearTimeout(req.timeout);
      return originalEnd.apply(this, args);
    };

    next();
  };
};

/**
 * Database optimization middleware
 */
const databaseOptimization = (req, res, next) => {
  // Add database timing
  req.dbTiming = {
    queries: [],
    totalTime: 0
  };

  // Override database operations to add timing
  const originalGetCollection = require('../config/optimized-database').getCollection;
  
  req.getCollection = async (collectionName) => {
    const queryStart = Date.now();
    const collection = await originalGetCollection(collectionName);
    
    // Wrap collection methods with timing
    const originalFind = collection.find;
    const originalFindOne = collection.findOne;
    
    collection.find = function(...args) {
      const queryStart = Date.now();
      const result = originalFind.apply(this, args);
      
      result.toArray = async function() {
        const data = await originalFind.apply(this, args).toArray();
        const queryTime = Date.now() - queryStart;
        
        req.dbTiming.queries.push({
          operation: 'find',
          collection: collectionName,
          time: queryTime,
          count: data.length
        });
        req.dbTiming.totalTime += queryTime;
        
        return data;
      };
      
      return result;
    };
    
    collection.findOne = async function(...args) {
      const queryStart = Date.now();
      const result = await originalFindOne.apply(this, args);
      const queryTime = Date.now() - queryStart;
      
      req.dbTiming.queries.push({
        operation: 'findOne',
        collection: collectionName,
        time: queryTime
      });
      req.dbTiming.totalTime += queryTime;
      
      return result;
    };
    
    return collection;
  };

  next();
};

/**
 * External service protection
 */
const externalServiceProtection = (req, res, next) => {
  req.externalTimeouts = {
    default: 5000,
    email: 10000,
    payment: 15000,
    ai: 20000
  };

  next();
};

/**
 * Get performance metrics
 */
const getPerformanceMetrics = () => {
  return {
    requests: performanceTracker.requests,
    slowRequests: performanceTracker.slowRequests,
    averageResponseTime: performanceTracker.averageResponseTime,
    slowRequestPercentage: (performanceTracker.slowRequests / performanceTracker.requests) * 100,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: {
      connected: redisCache.isConnected,
      stats: performanceCache.getStats ? performanceCache.getStats() : null
    }
  };
};

/**
 * Health check middleware
 */
const healthCheck = (req, res, next) => {
  if (req.path === '/health') {
    const metrics = getPerformanceMetrics();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      memory: metrics.memory,
      performance: {
        averageResponseTime: metrics.averageResponseTime,
        slowRequestPercentage: metrics.slowRequestPercentage
      }
    };
    
    return res.json(health);
  }
  
  next();
};

module.exports = {
  consolidatedPerformance,
  optimizedCompression,
  requestTimeout,
  databaseOptimization,
  externalServiceProtection,
  getPerformanceMetrics,
  healthCheck,
  performanceTracker
};
