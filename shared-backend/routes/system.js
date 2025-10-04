/**
 * System Routes
 * System information and version endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/unified-auth');
const packageJson = require('../package.json');

// ==================== SYSTEM INFORMATION ====================

// GET /api/v1/system/version - Get system version information
router.get('/version', (req, res) => {
  try {
    const systemInfo = {
      name: packageJson.name || 'Clutch Backend',
      version: packageJson.version || '1.0.0',
      description: packageJson.description || 'Clutch Shared Backend API',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: systemInfo,
      message: 'System version information retrieved successfully'
    });
  } catch (error) {
    console.error('Get system version error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_VERSION_FAILED',
      message: 'Failed to retrieve system version information'
    });
  }
});

// GET /api/v1/system/info - Get detailed system information
router.get('/info', authenticateToken, (req, res) => {
  try {
    const systemInfo = {
      application: {
        name: packageJson.name || 'Clutch Backend',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'Clutch Shared Backend API',
        author: packageJson.author || 'Clutch Team',
        license: packageJson.license || 'MIT'
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        database: process.env.MONGODB_URI ? 'Connected' : 'Not configured',
        redis: process.env.REDIS_URL ? 'Connected' : 'Not configured'
      },
      features: {
        ai: true,
        realtime: true,
        analytics: true,
        monitoring: true,
        caching: true,
        authentication: true,
        authorization: true
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: systemInfo,
      message: 'System information retrieved successfully'
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_INFO_FAILED',
      message: 'Failed to retrieve system information'
    });
  }
});

// GET /api/v1/system/status - Get system status
router.get('/status', (req, res) => {
  try {
    const status = {
      status: 'operational',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status,
      message: 'System status retrieved successfully'
    });
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_STATUS_FAILED',
      message: 'Failed to retrieve system status'
    });
  }
});

// GET /api/v1/system/health - Comprehensive system health check (v2)
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get system uptime
    const uptime = process.uptime();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    // Check database connectivity
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    try {
      const dbStartTime = Date.now();
      const { getCollection } = require('../config/database');
      const testCollection = await getCollection('users');
      await testCollection.findOne({}, { limit: 1 });
      dbResponseTime = Date.now() - dbStartTime;
      dbStatus = 'healthy';
    } catch (error) {
      dbStatus = 'down';
      console.error('Database health check failed:', error.message);
    }
    
    // Check Redis connectivity (if configured)
    let redisStatus = 'unknown';
    let redisResponseTime = 0;
    try {
      if (process.env.REDIS_URL) {
        const redis = require('redis');
        const client = redis.createClient({ url: process.env.REDIS_URL });
        await client.connect();
        const redisStartTime = Date.now();
        await client.ping();
        redisResponseTime = Date.now() - redisStartTime;
        await client.disconnect();
        redisStatus = 'healthy';
      } else {
        redisStatus = 'not_configured';
      }
    } catch (error) {
      redisStatus = 'down';
      console.error('Redis health check failed:', error.message);
    }
    
    // Define services to monitor
    const services = [
      {
        name: 'API Server',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        dependencies: []
      },
      {
        name: 'Database',
        status: dbStatus,
        responseTime: dbResponseTime,
        lastCheck: new Date().toISOString(),
        dependencies: []
      },
      {
        name: 'Redis Cache',
        status: redisStatus,
        responseTime: redisResponseTime,
        lastCheck: new Date().toISOString(),
        dependencies: []
      },
      {
        name: 'Email Service',
        status: process.env.SENDGRID_API_KEY ? 'healthy' : 'not_configured',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
        dependencies: []
      }
    ];
    
    // Calculate overall health
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.filter(s => s.status !== 'not_configured').length;
    const overallStatus = healthyServices === totalServices ? 'healthy' : 
                         healthyServices > totalServices / 2 ? 'degraded' : 'down';
    
    const overallHealth = {
      status: overallStatus,
      uptime: Math.round(uptime),
      servicesUp: healthyServices,
      servicesDown: totalServices - healthyServices,
      lastIncident: overallStatus === 'healthy' ? '' : 'Service degradation detected'
    };
    
    res.json({
      success: true,
      data: {
        services,
        overall: overallHealth,
        system: {
          uptime: Math.round(uptime),
          memory: {
            used: memoryUsedMB,
            total: memoryTotalMB,
            percentage: memoryPercentage
          },
          nodeVersion: process.version,
          platform: process.platform,
          environment: process.env.NODE_ENV || 'development'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({
      success: false,
      error: 'HEALTH_CHECK_FAILED',
      message: 'Failed to perform system health check',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/system/ping - Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/system-alerts - Get system alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    // Mock system alerts data - in production this would come from a monitoring system
    const alerts = [
      {
        id: 'alert-001',
        type: 'warning',
        severity: 'medium',
        title: 'High Memory Usage',
        description: 'Memory usage is above 80%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'active',
        service: 'API Server'
      },
      {
        id: 'alert-002',
        type: 'info',
        severity: 'low',
        title: 'Scheduled Maintenance',
        description: 'Database maintenance scheduled for tonight',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        status: 'acknowledged',
        service: 'Database'
      }
    ];

    res.json({
      success: true,
      data: alerts,
      message: 'System alerts retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system alerts error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_ALERTS_FAILED',
      message: 'Failed to retrieve system alerts'
    });
  }
});

// GET /api/v1/system-logs - Get system logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const { level = 'all', limit = 100, offset = 0 } = req.query;
    
    // Mock system logs data - in production this would come from a logging system
    const logs = [
      {
        id: 'log-001',
        level: 'error',
        message: 'Database connection timeout',
        service: 'Database',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        details: {
          error: 'Connection timeout after 5000ms',
          query: 'SELECT * FROM users LIMIT 1'
        }
      },
      {
        id: 'log-002',
        level: 'warning',
        message: 'High response time detected',
        service: 'API Server',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        details: {
          endpoint: '/api/v1/users',
          responseTime: 2500,
          threshold: 2000
        }
      },
      {
        id: 'log-003',
        level: 'info',
        message: 'User login successful',
        service: 'Authentication',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        details: {
          userId: 'user-123',
          ip: '192.168.1.100'
        }
      }
    ];

    // Filter by level if specified
    const filteredLogs = level === 'all' ? logs : logs.filter(log => log.level === level);
    
    // Apply pagination
    const paginatedLogs = filteredLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: filteredLogs.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < filteredLogs.length
      },
      message: 'System logs retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_SYSTEM_LOGS_FAILED',
      message: 'Failed to retrieve system logs'
    });
  }
});

module.exports = router;
