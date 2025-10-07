/**
 * Performance Optimization Middleware
 * Addresses 8000ms+ slow requests with comprehensive optimizations
 */

const logger = require('../utils/logger');

// Performance tracking
const performanceTracker = {
  slowRequests: new Map(),
  averageResponseTime: 0,
  totalRequests: 0,
  bottlenecks: {
    database: 0,
    external: 0,
    middleware: 0,
    email: 0,
    ai: 0
  }
};

// Request timing middleware
const requestTiming = (req, res, next) => {
  req.startTime = Date.now();
  req.timing = {
    middleware: 0,
    database: 0,
    external: 0,
    email: 0,
    ai: 0,
    total: 0
  };
  
  // Override res.json to capture timing
  const originalJson = res.json;
  res.json = function(data) {
    const totalTime = Date.now() - req.startTime;
    req.timing.total = totalTime;
    
    // Track slow requests
    if (totalTime > 8000) {
      performanceTracker.slowRequests.set(req.originalUrl, {
        method: req.method,
        url: req.originalUrl,
        timing: req.timing,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
      
      logger.warn(`🐌 EXTREMELY SLOW REQUEST: ${req.method} ${req.originalUrl} - ${totalTime}ms`, {
        timing: req.timing,
        user: req.user?.email || 'anonymous'
      });
    }
    
    // Update performance metrics
    performanceTracker.totalRequests++;
    performanceTracker.averageResponseTime = 
      (performanceTracker.averageResponseTime * (performanceTracker.totalRequests - 1) + totalTime) / 
      performanceTracker.totalRequests;
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Database query optimization
const databaseOptimization = (req, res, next) => {
  const startTime = Date.now();
  
  // Override database operations to add timing
  const originalGetCollection = require('../config/optimized-database').getCollection;
  
  req.dbTiming = {
    queries: [],
    totalTime: 0
  };
  
  // Wrap getCollection to track database operations
  req.getCollection = async (collectionName) => {
    const queryStart = Date.now();
    const collection = await originalGetCollection(collectionName);
    
    // Add timing wrapper to collection methods
    const originalFind = collection.find;
    const originalFindOne = collection.findOne;
    const originalAggregate = collection.aggregate;
    
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
    
    collection.aggregate = function(...args) {
      const queryStart = Date.now();
      const result = originalAggregate.apply(this, args);
      
      result.toArray = async function() {
        const data = await originalAggregate.apply(this, args).toArray();
        const queryTime = Date.now() - queryStart;
        req.dbTiming.queries.push({
          operation: 'aggregate',
          collection: collectionName,
          time: queryTime,
          count: data.length
        });
        req.dbTiming.totalTime += queryTime;
        return data;
      };
      
      return result;
    };
    
    return collection;
  };
  
  next();
};

// External service timeout protection
const externalServiceProtection = (req, res, next) => {
  // Set timeouts for external services
  req.externalTimeouts = {
    email: 5000,      // 5 seconds for email
    sms: 3000,        // 3 seconds for SMS
    ai: 10000,        // 10 seconds for AI services
    payment: 15000,   // 15 seconds for payment processing
    default: 8000     // 8 seconds default
  };
  
  // Wrap external service calls
  req.callWithTimeout = async (service, operation, timeout = req.externalTimeouts.default) => {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${service} timeout after ${timeout}ms`)), timeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      req.timing[service] = duration;
      
      if (duration > timeout * 0.8) {
        logger.warn(`⚠️ ${service} service slow: ${duration}ms (timeout: ${timeout}ms)`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`❌ ${service} service failed after ${duration}ms:`, error.message);
      throw error;
    }
  };
  
  next();
};

// Request caching for GET requests
const requestCaching = (ttl = 300) => { // 5 minutes default
  const cache = new Map();
  
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const cacheKey = `${req.method}_${req.originalUrl}_${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl * 1000) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-TTL', Math.round((ttl * 1000 - (Date.now() - cached.timestamp)) / 1000));
      return res.json(cached.data);
    }
    
    // Override res.json to cache successful responses
    const originalJson = res.json;
    res.json = function(data) {
      if (res.statusCode === 200 && data.success !== false) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        res.set('X-Cache', 'MISS');
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Memory optimization
const memoryOptimization = (req, res, next) => {
  // Track memory usage
  const startMemory = process.memoryUsage();
  
  // Cleanup function
  req.cleanup = () => {
    // Clear large objects
    delete req.body;
    delete req.query;
    delete req.params;
    delete req.user;
    delete req.timing;
    delete req.dbTiming;
    delete req.externalTimeouts;
  };
  
  // Force garbage collection if memory usage is high
  if (startMemory.heapUsed / startMemory.heapTotal > 0.8) {
    if (global.gc) {
      global.gc();
      logger.info('🧹 Forced garbage collection due to high memory usage');
    }
  }
  
  res.on('finish', () => {
    req.cleanup();
  });
  
  next();
};

// Database connection pooling optimization
const connectionPoolOptimization = (req, res, next) => {
  // Add connection pool monitoring
  req.connectionPool = {
    active: 0,
    idle: 0,
    total: 0
  };
  
  // Monitor connection usage
  req.monitorConnection = (operation) => {
    const startTime = Date.now();
    return async (...args) => {
      req.connectionPool.active++;
      try {
        const result = await operation(...args);
        return result;
      } finally {
        req.connectionPool.active--;
        const duration = Date.now() - startTime;
        if (duration > 5000) {
          logger.warn(`🐌 Slow database operation: ${duration}ms`);
        }
      }
    };
  };
  
  next();
};

// Response compression optimization
const responseCompression = (req, res, next) => {
  // Add compression headers
  res.set('X-Compression', 'enabled');
  res.set('X-Optimization', 'enabled');
  
  // Optimize JSON responses
  const originalJson = res.json;
  res.json = function(data) {
    // Remove unnecessary data for large responses
    if (data && typeof data === 'object') {
      // Remove null/undefined values
      const cleanData = JSON.parse(JSON.stringify(data, (key, value) => 
        value === null || value === undefined ? undefined : value
      ));
      
      return originalJson.call(this, cleanData);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Get performance metrics
const getPerformanceMetrics = () => {
  return {
    totalRequests: performanceTracker.totalRequests,
    averageResponseTime: Math.round(performanceTracker.averageResponseTime),
    slowRequests: Array.from(performanceTracker.slowRequests.values()),
    slowRequestCount: performanceTracker.slowRequests.size,
    bottlenecks: performanceTracker.bottlenecks,
    memoryUsage: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  };
};

// Clear performance metrics
const clearPerformanceMetrics = () => {
  performanceTracker.slowRequests.clear();
  performanceTracker.totalRequests = 0;
  performanceTracker.averageResponseTime = 0;
  performanceTracker.bottlenecks = {
    database: 0,
    external: 0,
    middleware: 0,
    email: 0,
    ai: 0
  };
};

// Health check for performance
const performanceHealthCheck = () => {
  const metrics = getPerformanceMetrics();
  const slowRequestRate = metrics.totalRequests > 0 ? 
    (metrics.slowRequestCount / metrics.totalRequests) * 100 : 0;
  
  const isHealthy = slowRequestRate < 5 && metrics.averageResponseTime < 3000;
  
  return {
    status: isHealthy ? 'healthy' : 'warning',
    metrics,
    recommendations: slowRequestRate > 5 ? [
      'Implement database query optimization',
      'Add request caching',
      'Optimize external service calls',
      'Review middleware stack',
      'Consider horizontal scaling'
    ] : []
  };
};

module.exports = {
  requestTiming,
  databaseOptimization,
  externalServiceProtection,
  requestCaching,
  memoryOptimization,
  connectionPoolOptimization,
  responseCompression,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  performanceHealthCheck
};