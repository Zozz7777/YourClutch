/**
 * Cost Optimization Middleware
 * Implements aggressive cost reduction strategies
 */

const { optimizedLogger } = require('../utils/optimized-logger');
const costConfig = require('../config/cost-optimization');

// Cost tracking
const costTracker = {
  totalRequests: 0,
  totalCost: 0,
  averageCostPerRequest: 0,
  costByEndpoint: new Map(),
  resourceUsage: {
    cpu: 0,
    memory: 0,
    database: 0,
    bandwidth: 0
  }
};

/**
 * Cost optimization middleware
 */
const costOptimization = (req, res, next) => {
  const startTime = Date.now();
  req.costStart = startTime;
  
  // Initialize cost tracking
  req.costMetrics = {
    startTime,
    queries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsed: 0,
    bandwidthUsed: 0
  };

  // Override res.json to track costs
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const requestTime = endTime - startTime;
    
    // Calculate request cost
    const requestCost = calculateRequestCost(req, res, requestTime, data);
    
    // Update cost tracking
    updateCostTracking(req, requestCost);
    
    // Set cost headers
    res.set('X-Request-Cost', requestCost.total.toFixed(4));
    res.set('X-Request-Time', `${requestTime}ms`);
    res.set('X-Cache-Hits', req.costMetrics.cacheHits);
    res.set('X-Database-Queries', req.costMetrics.queries);
    
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Calculate request cost
 */
function calculateRequestCost(req, res, requestTime, data) {
  const costPerMs = 0.000001; // $0.000001 per millisecond
  const costPerQuery = 0.001; // $0.001 per database query
  const costPerCacheHit = 0.0001; // $0.0001 per cache hit
  const costPerCacheMiss = 0.001; // $0.001 per cache miss
  const costPerMB = 0.01; // $0.01 per MB bandwidth
  
  const timeCost = requestTime * costPerMs;
  const queryCost = req.costMetrics.queries * costPerQuery;
  const cacheCost = (req.costMetrics.cacheHits * costPerCacheHit) + 
                   (req.costMetrics.cacheMisses * costPerCacheMiss);
  const bandwidthCost = (req.costMetrics.bandwidthUsed / 1024 / 1024) * costPerMB;
  
  return {
    time: timeCost,
    queries: queryCost,
    cache: cacheCost,
    bandwidth: bandwidthCost,
    total: timeCost + queryCost + cacheCost + bandwidthCost
  };
}

/**
 * Update cost tracking
 */
function updateCostTracking(req, requestCost) {
  costTracker.totalRequests++;
  costTracker.totalCost += requestCost.total;
  costTracker.averageCostPerRequest = costTracker.totalCost / costTracker.totalRequests;
  
  // Track cost by endpoint
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  if (!costTracker.costByEndpoint.has(endpoint)) {
    costTracker.costByEndpoint.set(endpoint, { requests: 0, totalCost: 0 });
  }
  
  const endpointStats = costTracker.costByEndpoint.get(endpoint);
  endpointStats.requests++;
  endpointStats.totalCost += requestCost.total;
  
  // Log expensive requests
  if (requestCost.total > 0.01) { // $0.01 threshold
    optimizedLogger.warn('Expensive request detected', {
      endpoint: `${req.method} ${req.path}`,
      cost: requestCost.total,
      time: Date.now() - req.costStart,
      queries: req.costMetrics.queries,
      cacheHits: req.costMetrics.cacheHits
    });
  }
}

/**
 * Memory optimization middleware
 */
const memoryOptimization = (req, res, next) => {
  // Check memory usage
  const memUsage = process.memoryUsage();
  const heapUsed = memUsage.heapUsed / 1024 / 1024; // MB
  const heapTotal = memUsage.heapTotal / 1024 / 1024; // MB
  const heapPercentage = (heapUsed / heapTotal) * 100;
  
  req.costMetrics.memoryUsed = heapUsed;
  
  // Trigger garbage collection if memory usage is high
  if (heapPercentage > costConfig.memory.heapLimit * 100 && global.gc) {
    setImmediate(() => {
      global.gc();
      optimizedLogger.performance('Garbage collection triggered due to high memory usage', {
        heapUsed: heapUsed.toFixed(2) + 'MB',
        heapPercentage: heapPercentage.toFixed(2) + '%'
      });
    });
  }
  
  // Limit cache size if memory is high
  if (heapPercentage > 80) {
    req.cacheLimit = costConfig.caching.maxCacheSize / 2; // Reduce cache size
  }
  
  next();
};

/**
 * Database cost optimization middleware
 */
const databaseCostOptimization = (req, res, next) => {
  // Limit query complexity
  req.maxQueryTime = costConfig.database.queryTimeout;
  req.maxResults = costConfig.queryOptimization.maxResults;
  req.cacheResults = costConfig.database.cacheQueries;
  
  // Track database queries
  const originalQuery = req.dbQuery;
  req.dbQuery = function(...args) {
    req.costMetrics.queries++;
    return originalQuery ? originalQuery.apply(this, args) : null;
  };
  
  next();
};

/**
 * Bandwidth optimization middleware
 */
const bandwidthOptimization = (req, res, next) => {
  // Enable compression for all responses
  if (!res.getHeader('Content-Encoding')) {
    res.set('Content-Encoding', 'gzip');
  }
  
  // Limit response size
  const originalJson = res.json;
  res.json = function(data) {
    const responseSize = JSON.stringify(data).length;
    req.costMetrics.bandwidthUsed = responseSize;
    
    // Compress large responses
    if (responseSize > costConfig.bandwidthOptimization.maxResponseSize) {
      optimizedLogger.warn('Large response detected', {
        size: responseSize,
        endpoint: `${req.method} ${req.path}`,
        user: req.user?.email || 'anonymous'
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Cache optimization middleware
 */
const cacheOptimization = (req, res, next) => {
  // Implement aggressive caching
  if (req.method === 'GET') {
    const cacheKey = `cost_opt:${req.method}:${req.originalUrl}`;
    
    // Check cache first
    req.cacheCheck = async () => {
      try {
        const cached = await require('./redis-cache').redisCache.get(cacheKey);
        if (cached) {
          req.costMetrics.cacheHits++;
          return cached;
        }
        req.costMetrics.cacheMisses++;
        return null;
      } catch (error) {
        optimizedLogger.error('Cache check error:', error);
        return null;
      }
    };
    
    // Cache response
    req.cacheResponse = async (data) => {
      try {
        const ttl = getCacheTTL(req.path);
        await require('./redis-cache').redisCache.set(cacheKey, data, ttl);
      } catch (error) {
        optimizedLogger.error('Cache set error:', error);
      }
    };
  }
  
  next();
};

/**
 * Get cache TTL based on endpoint
 */
function getCacheTTL(path) {
  if (path.includes('/user/')) return costConfig.caching.userData;
  if (path.includes('/product/')) return costConfig.caching.productData;
  if (path.includes('/static/')) return costConfig.caching.staticData;
  if (path.includes('/session/')) return costConfig.caching.sessionData;
  return 300; // 5 minutes default
}

/**
 * Get cost statistics
 */
function getCostStatistics() {
  return {
    totalRequests: costTracker.totalRequests,
    totalCost: costTracker.totalCost,
    averageCostPerRequest: costTracker.averageCostPerRequest,
    costByEndpoint: Object.fromEntries(costTracker.costByEndpoint),
    resourceUsage: costTracker.resourceUsage,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
}

/**
 * Cost alerting
 */
function checkCostAlerts() {
  const dailyCost = costTracker.totalCost;
  const alertThreshold = costConfig.costMonitoring.costAlertThreshold;
  
  if (dailyCost > alertThreshold) {
    optimizedLogger.warn('Cost alert triggered', {
      dailyCost,
      threshold: alertThreshold,
      averageCostPerRequest: costTracker.averageCostPerRequest
    });
  }
}

// Run cost alerts every hour
setInterval(checkCostAlerts, 3600000);

module.exports = {
  costOptimization,
  memoryOptimization,
  databaseCostOptimization,
  bandwidthOptimization,
  cacheOptimization,
  getCostStatistics,
  costTracker
};
