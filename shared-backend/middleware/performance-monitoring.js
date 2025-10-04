const { redisCache } = require('../config/optimized-redis');

// Performance monitoring middleware for 100k users/day
const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  // Track request metrics
  const requestMetrics = {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  };

  // Override res.end to capture response metrics
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    
    const responseTime = endTime - startTime;
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      console.log(`🐌 SLOW REQUEST: ${req.method} ${req.url} - ${responseTime}ms - User: ${requestMetrics.userId}`);
    }
    
    // Log high memory usage requests
    if (memoryDelta > 10 * 1024 * 1024) { // 10MB
      console.log(`🧠 HIGH MEMORY: ${req.method} ${req.url} - ${Math.round(memoryDelta / 1024 / 1024)}MB - User: ${requestMetrics.userId}`);
    }
    
    // Store metrics in Redis for analytics (async, don't block response)
    setImmediate(async () => {
      try {
        const metrics = {
          ...requestMetrics,
          responseTime,
          memoryDelta,
          statusCode: res.statusCode,
          contentLength: res.get('content-length') || 0
        };
        
        // Store in Redis with TTL (keep for 24 hours)
        const metricsKey = `metrics:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        await redisCache.set('analytics', metricsKey, metrics, 86400); // 24 hours
        
        // Update daily counters (simplified for now)
        const today = new Date().toISOString().split('T')[0];
        // Note: incr method not implemented in current Redis cache
        // Could be added later if needed for analytics
        
        // Update response time averages (simplified for now)
        // Note: lpush and ltrim methods not implemented in current Redis cache
        // Could be added later if needed for detailed analytics
        
      } catch (error) {
        console.log('Failed to store performance metrics:', error.message);
      }
    });
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Get performance statistics
const getPerformanceStats = async (date = null) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const [
      totalRequests,
      getRequests,
      postRequests,
      putRequests,
      deleteRequests,
      status200,
      status400,
      status500,
      responseTimes
    ] = await Promise.all([
      redisCache.get(`daily_requests:${targetDate}`) || 0,
      redisCache.get(`daily_requests:${targetDate}:GET`) || 0,
      redisCache.get(`daily_requests:${targetDate}:POST`) || 0,
      redisCache.get(`daily_requests:${targetDate}:PUT`) || 0,
      redisCache.get(`daily_requests:${targetDate}:DELETE`) || 0,
      redisCache.get(`daily_requests:${targetDate}:200`) || 0,
      redisCache.get(`daily_requests:${targetDate}:400`) || 0,
      redisCache.get(`daily_requests:${targetDate}:500`) || 0,
      redisCache.lrange(`response_times:${targetDate}`, 0, -1)
    ]);
    
    // Calculate average response time
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + parseInt(time), 0) / responseTimes.length 
      : 0;
    
    return {
      date: targetDate,
      totalRequests: parseInt(totalRequests),
      requestsByMethod: {
        GET: parseInt(getRequests),
        POST: parseInt(postRequests),
        PUT: parseInt(putRequests),
        DELETE: parseInt(deleteRequests)
      },
      requestsByStatus: {
        '200': parseInt(status200),
        '400': parseInt(status400),
        '500': parseInt(status500)
      },
      averageResponseTime: Math.round(avgResponseTime),
      successRate: totalRequests > 0 ? Math.round((status200 / totalRequests) * 100) : 0
    };
  } catch (error) {
    console.error('Failed to get performance stats:', error);
    return null;
  }
};

module.exports = {
  performanceMonitoring,
  getPerformanceStats
};
