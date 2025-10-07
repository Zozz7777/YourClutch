/**
 * Query Optimization Middleware
 * Implements query timeouts, slow query logging, and result caching
 */

const { optimizedLogger } = require('../utils/optimized-logger');
const { redisCache } = require('./redis-cache');

// Query optimization configuration
const QUERY_CONFIG = {
  maxQueryTime: 5000, // 5 seconds max query time
  slowQueryThreshold: 1000, // 1 second slow query threshold
  maxResults: 100, // 100 results max per query
  cacheTTL: 300, // 5 minutes cache TTL
  enableQueryCaching: true,
  enableSlowQueryLogging: true,
  enableQueryAnalysis: true
};

// Query performance tracking
const queryStats = {
  totalQueries: 0,
  slowQueries: 0,
  cachedQueries: 0,
  averageQueryTime: 0,
  totalQueryTime: 0,
  queryTypes: new Map()
};

/**
 * Query optimization middleware
 */
const queryOptimization = (req, res, next) => {
  // Initialize query tracking
  req.queryMetrics = {
    queries: [],
    totalTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    slowQueries: []
  };

  // Override database operations
  overrideDatabaseOperations(req);

  // Track query performance
  trackQueryPerformance(req, res);

  next();
};

/**
 * Override database operations with optimization
 */
function overrideDatabaseOperations(req) {
  const originalGetCollection = require('../config/optimized-database').getCollection;
  
  req.getCollection = async (collectionName) => {
    const queryStart = Date.now();
    const collection = await originalGetCollection(collectionName);
    
    // Wrap collection methods with optimization
    const originalFind = collection.find;
    const originalFindOne = collection.findOne;
    const originalAggregate = collection.aggregate;
    const originalCountDocuments = collection.countDocuments;
    
    // Optimized find method
    collection.find = function(query = {}, options = {}) {
      const queryId = generateQueryId();
      const startTime = Date.now();
      
      // Add query timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Query timeout after ${QUERY_CONFIG.maxQueryTime}ms`)), QUERY_CONFIG.maxQueryTime);
      });
      
      // Execute query with timeout
      const queryPromise = originalFind.call(this, query, {
        ...options,
        maxTimeMS: QUERY_CONFIG.maxQueryTime,
        limit: Math.min(options.limit || QUERY_CONFIG.maxResults, QUERY_CONFIG.maxResults)
      });
      
      const result = Promise.race([queryPromise, timeoutPromise]);
      
      // Track query performance
      result.then(() => {
        const queryTime = Date.now() - startTime;
        trackQuery(req, 'find', collectionName, query, queryTime, queryId);
      }).catch(error => {
        const queryTime = Date.now() - startTime;
        trackQueryError(req, 'find', collectionName, query, queryTime, error, queryId);
      });
      
      return result;
    };
    
    // Optimized findOne method
    collection.findOne = async function(query = {}, options = {}) {
      const queryId = generateQueryId();
      const startTime = Date.now();
      
      try {
        const result = await Promise.race([
          originalFindOne.call(this, query, {
            ...options,
            maxTimeMS: QUERY_CONFIG.maxQueryTime
          }),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Query timeout after ${QUERY_CONFIG.maxQueryTime}ms`)), QUERY_CONFIG.maxQueryTime);
          })
        ]);
        
        const queryTime = Date.now() - startTime;
        trackQuery(req, 'findOne', collectionName, query, queryTime, queryId);
        
        return result;
      } catch (error) {
        const queryTime = Date.now() - startTime;
        trackQueryError(req, 'findOne', collectionName, query, queryTime, error, queryId);
        throw error;
      }
    };
    
    // Optimized aggregate method
    collection.aggregate = function(pipeline = [], options = {}) {
      const queryId = generateQueryId();
      const startTime = Date.now();
      
      // Add $limit to pipeline if not present
      if (!pipeline.some(stage => stage.$limit)) {
        pipeline.push({ $limit: QUERY_CONFIG.maxResults });
      }
      
      const result = Promise.race([
        originalAggregate.call(this, pipeline, {
          ...options,
          maxTimeMS: QUERY_CONFIG.maxQueryTime,
          allowDiskUse: true
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Query timeout after ${QUERY_CONFIG.maxQueryTime}ms`)), QUERY_CONFIG.maxQueryTime);
        })
      ]);
      
      result.then(() => {
        const queryTime = Date.now() - startTime;
        trackQuery(req, 'aggregate', collectionName, pipeline, queryTime, queryId);
      }).catch(error => {
        const queryTime = Date.now() - startTime;
        trackQueryError(req, 'aggregate', collectionName, pipeline, queryTime, error, queryId);
      });
      
      return result;
    };
    
    // Optimized countDocuments method
    collection.countDocuments = async function(query = {}, options = {}) {
      const queryId = generateQueryId();
      const startTime = Date.now();
      
      try {
        const result = await Promise.race([
          originalCountDocuments.call(this, query, {
            ...options,
            maxTimeMS: QUERY_CONFIG.maxQueryTime
          }),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Query timeout after ${QUERY_CONFIG.maxQueryTime}ms`)), QUERY_CONFIG.maxQueryTime);
          })
        ]);
        
        const queryTime = Date.now() - startTime;
        trackQuery(req, 'countDocuments', collectionName, query, queryTime, queryId);
        
        return result;
      } catch (error) {
        const queryTime = Date.now() - startTime;
        trackQueryError(req, 'countDocuments', collectionName, query, queryTime, error, queryId);
        throw error;
      }
    };
    
    return collection;
  };
}

/**
 * Track query performance
 */
function trackQuery(req, operation, collection, query, queryTime, queryId) {
  req.queryMetrics.queries.push({
    id: queryId,
    operation,
    collection,
    query: JSON.stringify(query).substring(0, 200), // Truncate for logging
    time: queryTime,
    timestamp: new Date().toISOString()
  });
  
  req.queryMetrics.totalTime += queryTime;
  
  // Update global stats
  queryStats.totalQueries++;
  queryStats.totalQueryTime += queryTime;
  queryStats.averageQueryTime = queryStats.totalQueryTime / queryStats.totalQueries;
  
  // Track by operation type
  const operationKey = `${operation}_${collection}`;
  if (!queryStats.queryTypes.has(operationKey)) {
    queryStats.queryTypes.set(operationKey, { count: 0, totalTime: 0 });
  }
  
  const operationStats = queryStats.queryTypes.get(operationKey);
  operationStats.count++;
  operationStats.totalTime += queryTime;
  
  // Check for slow queries
  if (queryTime > QUERY_CONFIG.slowQueryThreshold) {
    queryStats.slowQueries++;
    req.queryMetrics.slowQueries.push({
      id: queryId,
      operation,
      collection,
      query: JSON.stringify(query).substring(0, 200),
      time: queryTime,
      timestamp: new Date().toISOString()
    });
    
    if (QUERY_CONFIG.enableSlowQueryLogging) {
      optimizedLogger.warn('🐌 Slow query detected', {
        queryId,
        operation,
        collection,
        query: JSON.stringify(query).substring(0, 200),
        time: queryTime,
        threshold: QUERY_CONFIG.slowQueryThreshold,
        user: req.user?.email || 'anonymous',
        endpoint: `${req.method} ${req.path}`
      });
    }
  }
  
  // Log query performance
  if (QUERY_CONFIG.enableQueryAnalysis) {
    optimizedLogger.performance(`Query executed: ${operation} on ${collection}`, {
      queryId,
      time: queryTime,
      operation,
      collection
    });
  }
}

/**
 * Track query errors
 */
function trackQueryError(req, operation, collection, query, queryTime, error, queryId) {
  optimizedLogger.error('❌ Query error', {
    queryId,
    operation,
    collection,
    query: JSON.stringify(query).substring(0, 200),
    time: queryTime,
    error: error.message,
    user: req.user?.email || 'anonymous',
    endpoint: `${req.method} ${req.path}`
  });
}

/**
 * Track query performance in response
 */
function trackQueryPerformance(req, res) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Add query performance headers
    res.set('X-Query-Count', req.queryMetrics.queries.length);
    res.set('X-Query-Time', req.queryMetrics.totalTime);
    res.set('X-Slow-Queries', req.queryMetrics.slowQueries.length);
    res.set('X-Cache-Hits', req.queryMetrics.cacheHits);
    res.set('X-Cache-Misses', req.queryMetrics.cacheMisses);
    
    // Log request performance summary
    if (req.queryMetrics.queries.length > 0) {
      optimizedLogger.performance('Request query summary', {
        totalQueries: req.queryMetrics.queries.length,
        totalTime: req.queryMetrics.totalTime,
        averageTime: req.queryMetrics.totalTime / req.queryMetrics.queries.length,
        slowQueries: req.queryMetrics.slowQueries.length,
        cacheHits: req.queryMetrics.cacheHits,
        cacheMisses: req.queryMetrics.cacheMisses,
        endpoint: `${req.method} ${req.path}`,
        user: req.user?.email || 'anonymous'
      });
    }
    
    return originalJson.call(this, data);
  };
}

/**
 * Generate unique query ID
 */
function generateQueryId() {
  return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Query caching middleware
 */
const queryCaching = (req, res, next) => {
  if (req.method !== 'GET' || !QUERY_CONFIG.enableQueryCaching) {
    return next();
  }
  
  // Generate cache key based on query parameters
  const cacheKey = `query:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
  
  // Check cache first
  redisCache.get(cacheKey).then(cached => {
    if (cached) {
      req.queryMetrics.cacheHits++;
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', cacheKey);
      return res.json(cached);
    }
    
    req.queryMetrics.cacheMisses++;
    req.cacheKey = cacheKey;
    next();
  }).catch(error => {
    optimizedLogger.error('Cache retrieval error:', error);
    next();
  });
};

/**
 * Cache query results
 */
const cacheQueryResults = (req, res, next) => {
  if (!req.cacheKey) return next();
  
  const originalJson = res.json;
  
  res.json = function(data) {
    if (res.statusCode === 200 && data.success !== false) {
      // Cache successful responses
      setImmediate(async () => {
        try {
          await redisCache.set(req.cacheKey, data, QUERY_CONFIG.cacheTTL);
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-TTL', QUERY_CONFIG.cacheTTL);
        } catch (error) {
          optimizedLogger.error('Cache storage error:', error);
        }
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Get query statistics
 */
function getQueryStatistics() {
  return {
    totalQueries: queryStats.totalQueries,
    slowQueries: queryStats.slowQueries,
    cachedQueries: queryStats.cachedQueries,
    averageQueryTime: queryStats.averageQueryTime,
    totalQueryTime: queryStats.totalQueryTime,
    slowQueryPercentage: queryStats.totalQueries > 0 ? (queryStats.slowQueries / queryStats.totalQueries) * 100 : 0,
    queryTypes: Object.fromEntries(queryStats.queryTypes),
    performance: {
      targetQueryTime: QUERY_CONFIG.maxQueryTime,
      slowQueryThreshold: QUERY_CONFIG.slowQueryThreshold,
      maxResults: QUERY_CONFIG.maxResults,
      cacheEnabled: QUERY_CONFIG.enableQueryCaching
    }
  };
}

/**
 * Clear query statistics
 */
function clearQueryStatistics() {
  queryStats.totalQueries = 0;
  queryStats.slowQueries = 0;
  queryStats.cachedQueries = 0;
  queryStats.averageQueryTime = 0;
  queryStats.totalQueryTime = 0;
  queryStats.queryTypes.clear();
}

module.exports = {
  queryOptimization,
  queryCaching,
  cacheQueryResults,
  getQueryStatistics,
  clearQueryStatistics,
  queryStats,
  QUERY_CONFIG
};
