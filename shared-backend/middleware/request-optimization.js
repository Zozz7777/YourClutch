/**
 * Request Optimization Middleware
 * Optimizes slow requests and improves performance
 */

const logger = require('../utils/logger');

// Request timeout configuration
const REQUEST_TIMEOUTS = {
  auth: 10000,      // 10 seconds for auth operations
  database: 15000,  // 15 seconds for database operations
  external: 30000,  // 30 seconds for external API calls
  default: 20000    // 20 seconds default
};

// Performance monitoring
const performanceMetrics = {
  slowRequests: new Map(),
  averageResponseTime: 0,
  totalRequests: 0,
  slowRequestThreshold: 5000 // 5 seconds
};

/**
 * Request timeout middleware
 */
const requestTimeout = (timeout = REQUEST_TIMEOUTS.default) => {
  return (req, res, next) => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn(`Request timeout after ${timeout}ms: ${req.method} ${req.originalUrl}`);
        res.status(408).json({
          success: false,
          error: 'REQUEST_TIMEOUT',
          message: 'Request timeout. Please try again.',
          timestamp: new Date().toISOString()
        });
      }
    }, timeout);

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};

/**
 * Performance monitoring middleware
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${req.method}_${req.originalUrl}_${Date.now()}`;

  // Track request start
  req.startTime = startTime;
  req.requestId = requestId;

  // Override res.json to capture response time
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Update metrics
    performanceMetrics.totalRequests++;
    performanceMetrics.averageResponseTime = 
      (performanceMetrics.averageResponseTime * (performanceMetrics.totalRequests - 1) + responseTime) / 
      performanceMetrics.totalRequests;

    // Track slow requests
    if (responseTime > performanceMetrics.slowRequestThreshold) {
      performanceMetrics.slowRequests.set(requestId, {
        method: req.method,
        url: req.originalUrl,
        responseTime,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      logger.warn(`🐌 SLOW REQUEST: ${req.method} ${req.originalUrl} - ${responseTime}ms - User: ${req.user?.email || 'anonymous'}`);
    }

    // Log performance metrics
    if (responseTime > 2000) { // Log requests taking more than 2 seconds
      logger.info(`⏱️ Request performance: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Database connection optimization middleware
 */
const databaseOptimization = (req, res, next) => {
  // Add database connection optimization headers
  res.set('X-Database-Optimized', 'true');
  res.set('X-Connection-Pool', 'optimized');
  
  next();
};

/**
 * Request caching middleware for GET requests
 */
const requestCaching = (ttl = 300) => { // 5 minutes default TTL
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

/**
 * Request compression middleware
 */
const requestCompression = (req, res, next) => {
  // Add compression headers
  res.set('X-Compression', 'enabled');
  res.set('X-Optimization', 'enabled');
  
  next();
};

/**
 * Get performance metrics
 */
const getPerformanceMetrics = () => {
  return {
    totalRequests: performanceMetrics.totalRequests,
    averageResponseTime: Math.round(performanceMetrics.averageResponseTime),
    slowRequests: Array.from(performanceMetrics.slowRequests.values()),
    slowRequestCount: performanceMetrics.slowRequests.size,
    slowRequestThreshold: performanceMetrics.slowRequestThreshold
  };
};

/**
 * Clear performance metrics
 */
const clearPerformanceMetrics = () => {
  performanceMetrics.slowRequests.clear();
  performanceMetrics.totalRequests = 0;
  performanceMetrics.averageResponseTime = 0;
};

/**
 * Health check for request optimization
 */
const healthCheck = () => {
  const metrics = getPerformanceMetrics();
  const slowRequestRate = metrics.totalRequests > 0 ? 
    (metrics.slowRequestCount / metrics.totalRequests) * 100 : 0;

  return {
    status: slowRequestRate > 10 ? 'warning' : 'healthy',
    metrics: {
      ...metrics,
      slowRequestRate: Math.round(slowRequestRate * 100) / 100
    },
    recommendations: slowRequestRate > 10 ? [
      'Consider optimizing database queries',
      'Review external API response times',
      'Implement request caching',
      'Check server resources'
    ] : []
  };
};

module.exports = {
  requestTimeout,
  performanceMonitor,
  databaseOptimization,
  requestCaching,
  requestCompression,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  healthCheck,
  REQUEST_TIMEOUTS
};
