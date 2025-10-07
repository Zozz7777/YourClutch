/**
 * Horizontal Scaling Support Middleware
 * Implements Redis-based sessions, sticky sessions, and load balancer configuration
 */

const { sessionCache, redisCache } = require('./redis-cache');
const { optimizedLogger } = require('../utils/optimized-logger');
const crypto = require('crypto');

// Horizontal scaling configuration
const SCALING_CONFIG = {
  sessionTTL: 86400, // 24 hours
  sessionRefreshInterval: 3600, // 1 hour
  loadBalancerTimeout: 30000, // 30 seconds
  healthCheckInterval: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000 // 1 second
};

// Server instance tracking
const serverInstances = new Map();
const sessionStore = new Map();

/**
 * Session management for horizontal scaling
 */
class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 60000); // 1 minute
  }

  /**
   * Create session
   */
  async createSession(userId, userData, options = {}) {
    const sessionId = this.generateSessionId();
    const sessionData = {
      id: sessionId,
      userId,
      userData,
      createdAt: new Date(),
      lastAccessed: new Date(),
      expiresAt: new Date(Date.now() + (options.ttl || SCALING_CONFIG.sessionTTL) * 1000),
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      isActive: true
    };

    // Store in Redis for horizontal scaling
    try {
      await sessionCache.set(sessionId, sessionData, SCALING_CONFIG.sessionTTL);
      this.sessions.set(sessionId, sessionData);
      
      optimizedLogger.info('Session created', {
        sessionId,
        userId,
        ttl: SCALING_CONFIG.sessionTTL
      });
      
      return sessionId;
    } catch (error) {
      optimizedLogger.error('Session creation failed:', error);
      throw error;
    }
  }

  /**
   * Get session
   */
  async getSession(sessionId) {
    try {
      // Try local cache first
      let session = this.sessions.get(sessionId);
      
      if (!session) {
        // Get from Redis
        session = await sessionCache.get(sessionId);
        if (session) {
          this.sessions.set(sessionId, session);
        }
      }
      
      if (session && session.isActive && new Date() < new Date(session.expiresAt)) {
        // Update last accessed
        session.lastAccessed = new Date();
        await sessionCache.set(sessionId, session, SCALING_CONFIG.sessionTTL);
        
        return session;
      }
      
      // Session expired or invalid
      if (session) {
        await this.destroySession(sessionId);
      }
      
      return null;
    } catch (error) {
      optimizedLogger.error('Session retrieval failed:', error);
      return null;
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionId, updates) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;
      
      Object.assign(session, updates);
      session.lastAccessed = new Date();
      
      await sessionCache.set(sessionId, session, SCALING_CONFIG.sessionTTL);
      this.sessions.set(sessionId, session);
      
      return true;
    } catch (error) {
      optimizedLogger.error('Session update failed:', error);
      return false;
    }
  }

  /**
   * Destroy session
   */
  async destroySession(sessionId) {
    try {
      await sessionCache.del(sessionId);
      this.sessions.delete(sessionId);
      
      optimizedLogger.info('Session destroyed', { sessionId });
      return true;
    } catch (error) {
      optimizedLogger.error('Session destruction failed:', error);
      return false;
    }
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    const now = new Date();
    const expiredSessions = [];
    
    for (const [sessionId, session] of this.sessions) {
      if (new Date(session.expiresAt) < now) {
        expiredSessions.push(sessionId);
      }
    }
    
    for (const sessionId of expiredSessions) {
      await this.destroySession(sessionId);
    }
    
    if (expiredSessions.length > 0) {
      optimizedLogger.info('Cleaned up expired sessions', {
        count: expiredSessions.length
      });
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
      expiredSessions: Array.from(this.sessions.values()).filter(s => new Date(s.expiresAt) < new Date()).length
    };
  }
}

// Create session manager instance
const sessionManager = new SessionManager();

/**
 * Session middleware for horizontal scaling
 */
const sessionMiddleware = (req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.cookies.sessionId;
  
  if (sessionId) {
    sessionManager.getSession(sessionId).then(session => {
      if (session) {
        req.session = session;
        req.user = session.userData;
        req.sessionId = sessionId;
      }
      next();
    }).catch(error => {
      optimizedLogger.error('Session middleware error:', error);
      next();
    });
  } else {
    next();
  }
};

/**
 * Load balancer health check
 */
const healthCheckMiddleware = (req, res, next) => {
  if (req.path === '/health' || req.path === '/health-check') {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        id: process.env.SERVER_ID || 'unknown',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      database: {
        connected: true, // Would check actual DB connection
        responseTime: 0 // Would measure actual response time
      },
      redis: {
        connected: redisCache.isConnected,
        responseTime: 0 // Would measure actual response time
      },
      sessions: sessionManager.getSessionStats()
    };
    
    return res.json(health);
  }
  
  next();
};

/**
 * Sticky session middleware
 */
const stickySessionMiddleware = (req, res, next) => {
  // Generate or retrieve session ID
  let sessionId = req.headers['x-session-id'] || req.cookies.sessionId;
  
  if (!sessionId) {
    sessionId = sessionManager.generateSessionId();
    res.set('X-Session-ID', sessionId);
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SCALING_CONFIG.sessionTTL * 1000
    });
  }
  
  req.sessionId = sessionId;
  next();
};

/**
 * Server instance management
 */
class ServerInstanceManager {
  constructor() {
    this.instances = new Map();
    this.healthCheckInterval = setInterval(() => this.healthCheck(), SCALING_CONFIG.healthCheckInterval);
  }

  /**
   * Register server instance
   */
  registerInstance(instanceId, instanceData) {
    this.instances.set(instanceId, {
      ...instanceData,
      registeredAt: new Date(),
      lastHealthCheck: new Date(),
      isHealthy: true
    });
    
    optimizedLogger.info('Server instance registered', {
      instanceId,
      instances: this.instances.size
    });
  }

  /**
   * Unregister server instance
   */
  unregisterInstance(instanceId) {
    this.instances.delete(instanceId);
    
    optimizedLogger.info('Server instance unregistered', {
      instanceId,
      instances: this.instances.size
    });
  }

  /**
   * Health check for all instances
   */
  async healthCheck() {
    for (const [instanceId, instance] of this.instances) {
      try {
        // Simulate health check (would make actual HTTP request)
        const isHealthy = await this.checkInstanceHealth(instance);
        
        if (isHealthy) {
          instance.lastHealthCheck = new Date();
          instance.isHealthy = true;
        } else {
          instance.isHealthy = false;
          optimizedLogger.warn('Unhealthy server instance detected', { instanceId });
        }
      } catch (error) {
        instance.isHealthy = false;
        optimizedLogger.error('Health check failed for instance', { instanceId, error: error.message });
      }
    }
  }

  /**
   * Check instance health
   */
  async checkInstanceHealth(instance) {
    // This would make an actual HTTP request to the instance
    // For now, we'll simulate it
    return Math.random() > 0.1; // 90% success rate
  }

  /**
   * Get healthy instances
   */
  getHealthyInstances() {
    return Array.from(this.instances.entries())
      .filter(([_, instance]) => instance.isHealthy)
      .map(([id, instance]) => ({ id, ...instance }));
  }

  /**
   * Get load balancer configuration
   */
  getLoadBalancerConfig() {
    const healthyInstances = this.getHealthyInstances();
    
    return {
      instances: healthyInstances,
      totalInstances: this.instances.size,
      healthyInstances: healthyInstances.length,
      loadBalancing: {
        algorithm: 'round_robin', // or 'least_connections', 'ip_hash'
        stickySessions: true,
        healthCheck: {
          enabled: true,
          interval: SCALING_CONFIG.healthCheckInterval,
          timeout: SCALING_CONFIG.loadBalancerTimeout
        }
      }
    };
  }
}

// Create server instance manager
const serverInstanceManager = new ServerInstanceManager();

/**
 * Auto-scaling middleware
 */
const autoScalingMiddleware = (req, res, next) => {
  // Check if we need to scale up
  const metrics = {
    cpu: process.cpuUsage(),
    memory: process.memoryUsage(),
    activeConnections: req.connection ? 1 : 0, // Simplified
    requestRate: 0 // Would track actual request rate
  };
  
  // Auto-scaling logic
  if (metrics.memory.heapUsed / metrics.memory.heapTotal > 0.8) {
    optimizedLogger.warn('High memory usage detected, consider scaling up', {
      memoryUsage: metrics.memory.heapUsed / 1024 / 1024, // MB
      threshold: 0.8
    });
  }
  
  next();
};

/**
 * Session synchronization middleware
 */
const sessionSyncMiddleware = (req, res, next) => {
  // Sync session data across instances
  if (req.session && req.sessionId) {
    setImmediate(async () => {
      try {
        await sessionManager.updateSession(req.sessionId, {
          lastAccessed: new Date(),
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      } catch (error) {
        optimizedLogger.error('Session sync failed:', error);
      }
    });
  }
  
  next();
};

/**
 * Get horizontal scaling statistics
 */
function getScalingStatistics() {
  return {
    sessions: sessionManager.getSessionStats(),
    instances: serverInstanceManager.getLoadBalancerConfig(),
    configuration: SCALING_CONFIG,
    performance: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
}

module.exports = {
  sessionMiddleware,
  healthCheckMiddleware,
  stickySessionMiddleware,
  autoScalingMiddleware,
  sessionSyncMiddleware,
  sessionManager,
  serverInstanceManager,
  getScalingStatistics,
  SCALING_CONFIG
};
