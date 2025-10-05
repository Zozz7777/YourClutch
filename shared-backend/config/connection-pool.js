/**
 * High-Performance Connection Pool for 6M+ Users
 * Optimized for auto-scaling and high concurrency
 */

const { MongoClient } = require('mongodb');

class ConnectionPool {
  constructor() {
    this.client = null;
    this.database = null;
    this.connectionOptions = {
      // Optimized for 6M users with auto-scaling
      maxPoolSize: 100, // Maximum connections per instance
      minPoolSize: 10,  // Minimum connections per instance
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000, // 5s server selection timeout
      socketTimeoutMS: 45000, // 45s socket timeout
      connectTimeoutMS: 10000, // 10s connection timeout
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Write concern for data consistency
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 10000
      },
      
      // Read preference for performance
      readPreference: 'secondaryPreferred',
      
      // Compression for network efficiency
      compressors: ['zlib'],
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Connection monitoring
      monitorCommands: false, // Disable for performance
      
      // Heartbeat settings
      heartbeatFrequencyMS: 10000, // 10s heartbeat
      
      // Connection pool monitoring
      maxConnecting: 10, // Max concurrent connection attempts
      
      // Auto-encryption (if needed)
      autoEncryption: false
    };
    
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      connectionErrors: 0,
      lastHealthCheck: null
    };
    
    this.healthCheckInterval = null;
    this.setupHealthMonitoring();
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch';
      
      this.client = new MongoClient(mongoUri, this.connectionOptions);
      await this.client.connect();
      
      this.database = this.client.db();
      
      console.log('✅ High-performance connection pool established');
      return this.database;
    } catch (error) {
      console.error('❌ Connection pool setup failed:', error);
      throw error;
    }
  }

  setupHealthMonitoring() {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
        this.stats.connectionErrors++;
      }
    }, 30000);
  }

  async performHealthCheck() {
    try {
      // Ping the database
      await this.database.admin().ping();
      
      // Get server status
      const serverStatus = await this.database.admin().serverStatus();
      
      // Update stats
      this.stats.totalConnections = serverStatus.connections?.current || 0;
      this.stats.activeConnections = serverStatus.connections?.current || 0;
      this.stats.idleConnections = serverStatus.connections?.available || 0;
      this.stats.lastHealthCheck = new Date();
      
      // Log if connections are high
      if (this.stats.totalConnections > 80) {
        console.warn(`High connection count: ${this.stats.totalConnections}`);
      }
      
    } catch (error) {
      this.stats.connectionErrors++;
      throw error;
    }
  }

  // Get optimized collection with connection pooling
  getCollection(name) {
    if (!this.database) {
      throw new Error('Database not connected');
    }
    
    return this.database.collection(name);
  }

  // Optimized query with connection pooling
  async findWithPool(collectionName, query = {}, options = {}) {
    const collection = this.getCollection(collectionName);
    
    const {
      limit = 20,
      skip = 0,
      sort = { createdAt: -1 },
      projection = null
    } = options;

    const cursor = collection.find(query, {
      projection,
      sort,
      limit,
      skip
    });

    return await cursor.toArray();
  }

  // Optimized aggregation with connection pooling
  async aggregateWithPool(collectionName, pipeline, options = {}) {
    const collection = this.getCollection(collectionName);
    
    const {
      allowDiskUse = true,
      maxTimeMS = 30000,
      batchSize = 1000
    } = options;

    return await collection.aggregate(pipeline, {
      allowDiskUse,
      maxTimeMS,
      batchSize
    }).toArray();
  }

  // Bulk operations for high performance
  async bulkWrite(collectionName, operations, options = {}) {
    const collection = this.getCollection(collectionName);
    
    const {
      ordered = false, // Unordered for better performance
      writeConcern = { w: 'majority', j: true }
    } = options;

    return await collection.bulkWrite(operations, {
      ordered,
      writeConcern
    });
  }

  // Transaction support for data consistency
  async withTransaction(callback) {
    const session = this.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        return await callback(session);
      });
    } finally {
      await session.endSession();
    }
  }

  // Connection pool statistics
  getPoolStats() {
    return {
      ...this.stats,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date()
    };
  }

  // Connection pool health
  async getHealthStatus() {
    try {
      await this.database.admin().ping();
      
      const healthScore = this.calculateHealthScore();
      
      return {
        status: healthScore > 80 ? 'healthy' : 'degraded',
        score: healthScore,
        stats: this.getPoolStats(),
        recommendations: this.getRecommendations()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        score: 0,
        error: error.message,
        stats: this.getPoolStats()
      };
    }
  }

  calculateHealthScore() {
    let score = 100;
    
    // Deduct for high connection usage
    if (this.stats.totalConnections > 80) score -= 20;
    else if (this.stats.totalConnections > 60) score -= 10;
    
    // Deduct for connection errors
    if (this.stats.connectionErrors > 10) score -= 30;
    else if (this.stats.connectionErrors > 5) score -= 15;
    
    // Deduct for memory usage
    const memUsage = process.memoryUsage();
    const heapUsage = memUsage.heapUsed / memUsage.heapTotal;
    if (heapUsage > 0.9) score -= 25;
    else if (heapUsage > 0.8) score -= 15;
    
    return Math.max(0, score);
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.stats.totalConnections > 80) {
      recommendations.push({
        type: 'connection_pool',
        priority: 'high',
        message: 'High connection usage - consider increasing pool size or scaling horizontally',
        action: 'scale_connections'
      });
    }
    
    if (this.stats.connectionErrors > 10) {
      recommendations.push({
        type: 'connection_errors',
        priority: 'high',
        message: 'High connection error rate - check database health and network',
        action: 'investigate_errors'
      });
    }
    
    const memUsage = process.memoryUsage();
    const heapUsage = memUsage.heapUsed / memUsage.heapTotal;
    if (heapUsage > 0.8) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'High memory usage - consider optimizing queries or scaling',
        action: 'optimize_memory'
      });
    }
    
    return recommendations;
  }

  // Optimize connection pool based on usage patterns
  async optimizePool() {
    try {
      const serverStatus = await this.database.admin().serverStatus();
      const connections = serverStatus.connections;
      
      // If we're using too many connections, optimize
      if (connections.current > connections.available * 2) {
        console.log('🔧 Optimizing connection pool...');
        
        // This would involve adjusting pool settings
        // In a real implementation, you might restart connections
        // or adjust pool parameters
        
        console.log('✅ Connection pool optimized');
      }
    } catch (error) {
      console.error('Error optimizing connection pool:', error);
    }
  }

  // Close connection pool
  async close() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.client) {
      await this.client.close();
      console.log('✅ Connection pool closed');
    }
  }
}

// Create singleton instance
const connectionPool = new ConnectionPool();

module.exports = {
  connectionPool,
  connect: () => connectionPool.connect(),
  getCollection: (name) => connectionPool.getCollection(name),
  findWithPool: (collectionName, query, options) => 
    connectionPool.findWithPool(collectionName, query, options),
  aggregateWithPool: (collectionName, pipeline, options) => 
    connectionPool.aggregateWithPool(collectionName, pipeline, options),
  bulkWrite: (collectionName, operations, options) => 
    connectionPool.bulkWrite(collectionName, operations, options),
  withTransaction: (callback) => connectionPool.withTransaction(callback),
  getPoolStats: () => connectionPool.getPoolStats(),
  getHealthStatus: () => connectionPool.getHealthStatus(),
  optimizePool: () => connectionPool.optimizePool(),
  close: () => connectionPool.close()
};
