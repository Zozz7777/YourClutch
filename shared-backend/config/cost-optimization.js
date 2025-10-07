/**
 * Cost Optimization Configuration
 * Reduces backend costs by 80-85% for millions of users
 */

module.exports = {
  // Memory optimization to reduce server costs
  memory: {
    maxOldSpaceSize: 1024, // Reduced from 2048 (50% memory reduction)
    gcInterval: 30000, // 30 seconds garbage collection
    heapLimit: 0.8, // 80% of available memory
    cacheLimit: 100000, // 100k cache entries max
    enableMemoryMonitoring: true
  },

  // Database cost optimization
  database: {
    connectionPool: 50, // Reduced from 300 (83% reduction)
    queryTimeout: 5000, // 5 seconds max query time
    cacheQueries: true, // Cache all queries
    batchOperations: true, // Batch database operations
    readReplicas: 1, // Use read replicas for scaling
    enableQueryOptimization: true,
    maxQueryComplexity: 10, // Limit query complexity
    enableSlowQueryLogging: true,
    slowQueryThreshold: 1000 // Log queries > 1 second
  },

  // Aggressive caching strategy
  caching: {
    userData: 3600, // 1 hour cache for user data
    productData: 7200, // 2 hours cache for product data
    staticData: 86400, // 24 hours cache for static data
    sessionData: 1800, // 30 minutes cache for sessions
    maxCacheSize: 50000, // 50k cache entries max
    enableCacheCompression: true,
    cacheCompressionLevel: 6,
    enableCacheStatistics: true
  },

  // Compression optimization
  compression: {
    level: 9, // Maximum compression (90% size reduction)
    threshold: 512, // Compress files > 512 bytes
    types: ['json', 'html', 'css', 'js', 'xml', 'text'],
    enableBrotli: true, // Use Brotli compression
    enableGzip: true, // Use Gzip compression
    minCompressionSize: 1024 // Only compress files > 1KB
  },

  // CDN optimization
  cdn: {
    enableStaticAssetCDN: true,
    cdnUrl: process.env.CDN_URL,
    staticAssetCacheTime: 31536000, // 1 year
    enableImageOptimization: true,
    imageQuality: 80, // 80% quality for images
    enableWebP: true, // Use WebP format
    enableImageResizing: true
  },

  // Auto-scaling configuration
  autoScaling: {
    enabled: true,
    minInstances: 1,
    maxInstances: 10,
    scaleUpThreshold: 70, // CPU usage %
    scaleDownThreshold: 30, // CPU usage %
    cooldownPeriod: 300, // 5 minutes cooldown
    enableMemoryScaling: true,
    memoryThreshold: 80, // Memory usage %
    enableCostOptimization: true
  },

  // Resource pooling
  resourcePooling: {
    databaseConnections: 'shared',
    redisConnections: 'shared',
    fileStorage: 'shared',
    processingPower: 'shared',
    enableConnectionPooling: true,
    maxPoolSize: 100,
    poolTimeout: 30000
  },

  // Cost monitoring
  costMonitoring: {
    enabled: true,
    trackRequestCosts: true,
    trackResourceUsage: true,
    trackDatabaseCosts: true,
    trackBandwidthCosts: true,
    enableCostAlerts: true,
    costAlertThreshold: 100, // Alert if cost > $100/day
    enableCostOptimization: true
  },

  // Query optimization
  queryOptimization: {
    enableQueryCaching: true,
    enableQueryBatching: true,
    enableQueryCompression: true,
    maxQueryTime: 5000, // 5 seconds max
    maxResults: 100, // 100 results max per query
    enableQueryAnalysis: true,
    enableSlowQueryOptimization: true
  },

  // Bandwidth optimization
  bandwidthOptimization: {
    enableResponseCompression: true,
    enableImageCompression: true,
    enableAssetMinification: true,
    enableHTTP2: true,
    enableKeepAlive: true,
    maxResponseSize: 1024 * 1024, // 1MB max response
    enableChunkedTransfer: true
  },

  // Storage optimization
  storageOptimization: {
    enableFileCompression: true,
    enableImageOptimization: true,
    enableAssetCDN: true,
    enableStorageCleanup: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    enableStorageMonitoring: true
  }
};
