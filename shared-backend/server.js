
// Optimized imports
const { applyOptimizedMiddleware, getMemoryStats } = require('./middleware/optimized-middleware');
const { redisCache } = require('./config/optimized-redis');
const OptimizedAIProviderManager = require('./services/optimizedAIProviderManager');
const { connectToDatabase: connectOptimizedDatabase } = require('./config/optimized-database');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const logger = require('./utils/logger');

// Environment variables are loaded via dotenv

// Define API prefix early to avoid initialization errors
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

// Import security middleware
const securityHeaders = require('./middleware/securityHeaders');
const { cacheMiddleware } = require('./middleware/cache');
const { validateInput } = require('./middleware/validation');
const { performanceMonitor } = require('./middleware/performanceMonitor');
const { addAlert, getAlerts } = require('./middleware/alerting');
const { responseMiddleware } = require('./utils/response-format');
const { authenticateToken } = require('./middleware/unified-auth');

// Import production optimizations
const { productionOptimizations, errorOptimization } = require('./middleware/production-optimizations');
const { productionLogging, errorLogger, systemHealthLogger } = require('./middleware/production-logging');

// Import unified performance monitoring
const {
  performanceMiddleware,
  errorTrackingMiddleware,
  getPerformanceMetrics,
  getHealthStatus
} = require('./middleware/unified-performance-monitor');

// Import graceful restart handling
const {
  gracefulRestartManager,
  trackConnection
} = require('./middleware/graceful-restart');

// Import performance tuning
const {
  performanceTuner,
  analyzeAndTune
} = require('./middleware/performance-tuning');

// Import WebSocket server
const webSocketServer = require('./services/websocket-server');
const PartnerWebSocketService = require('./services/partner-websocket');

// Import unified database connection
const { connectToDatabase } = require('./config/database-unified');
const { initializeEnvironment } = require('./config/environment');

// Import routes
// Import only existing routes
// All routes will be loaded dynamically - no imports needed

// All routes will be loaded dynamically - no imports needed

// All routes will be loaded dynamically - no imports needed
// All routes will be loaded dynamically - no imports needed
// All routes will be loaded dynamically - no imports needed
// All routes will be loaded dynamically - no imports needed

// All route imports cleaned up - only existing routes imported above

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Apply optimized middleware stack
applyOptimizedMiddleware(app);

// Add production optimizations
app.use(productionOptimizations);

// Add production logging
app.use(productionLogging);

// Add error tracking middleware
app.use(errorTrackingMiddleware);

// Add standardized response format middleware
app.use(responseMiddleware);

// Add compression middleware for 100k users/day
app.use(compression({
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if already compressed or if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Add intelligent rate limiting for 100k users/day
const { rateLimits, burstProtection } = require('./middleware/rate-limiting');
const { performanceMonitoring } = require('./middleware/performance-monitoring');

// Apply performance monitoring first
app.use(performanceMonitoring);

// Apply burst protection (most restrictive)
app.use(burstProtection);

// Apply specific rate limits to different route groups
app.use(`${apiPrefix}/auth`, rateLimits.auth);
app.use(`${apiPrefix}/auth/reset-password`, rateLimits.passwordReset);
app.use(`${apiPrefix}/cars`, rateLimits.cars);
app.use(`${apiPrefix}/admin`, rateLimits.admin);
app.use('/health', rateLimits.health);

// Apply general API rate limiting to all other routes
app.use(apiPrefix, rateLimits.api);

// Add performance analytics endpoint (admin only)
app.get(`${apiPrefix}/analytics/performance`, authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const { getPerformanceStats } = require('./middleware/performance-monitoring');
    const { date } = req.query;
    
    const stats = await getPerformanceStats(date);
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve performance statistics'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting performance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance statistics'
    });
  }
});

// Authentication middleware is imported at the top with other middleware

// CRITICAL: Health endpoints first
app.get('/health/ping', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Mount routes


// All routes will be loaded dynamically - no mountings needed
// All routes will be loaded dynamically - no mountings needed

// All routes will be loaded dynamically - no mountings needed

// Mount newly created routes
// app.use(`${apiPrefix}/support`, supportRoutes); // Not defined

// Fallback routes (without v1 prefix for frontend compatibility)
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
// app.use('/api/notifications', notificationsRoutes); // Not defined
// app.use('/api/export', exportRoutes); // Not defined
// app.use('/api/settings', settingsRoutes); // Not defined
// app.use('/api/integrations', integrationsRoutes); // Not defined
// app.use('/api/audit-trail', auditTrailRoutes); // Not defined
// app.use('/api/reports', reportsRoutes); // Not defined
// app.use('/api/rbac', rbacRoutes); // Not defined

// API v1 routes (for frontend compatibility) - Fleet and CRM routes already mounted above
// app.use('/api/v1/fleet', fleetRoutes); // Removed duplicate - already mounted with apiPrefix
// app.use('/api/v1/crm', crmRoutes); // Removed duplicate - already mounted with apiPrefix
// app.use('/api/v1/notifications', notificationsRoutes); // Not defined
// app.use('/api/v1/users', usersRoutes); // Not defined
// app.use('/api/v1/export', exportRoutes); // Not defined
// app.use('/api/v1/settings', settingsRoutes); // Not defined
// app.use('/api/v1/integrations', integrationsRoutes); // Not defined
// app.use('/api/v1/audit-trail', auditTrailRoutes); // Not defined
// app.use('/api/v1/reports', reportsRoutes); // Not defined
// app.use('/api/v1/rbac', rbacRoutes); // Not defined
// app.use('/api/v1/analytics', analyticsRoutes); // Not defined
// app.use('/api/v1/business-intelligence', businessIntelligenceRoutes); // Not defined
// app.use('/api/v1/ai', aiRoutes); // Not defined
// app.use('/api/v1/system-health', systemHealthRoutes); // Not defined
// app.use('/api/v1/feature-flags', featureFlagsRoutes); // Not defined
// app.use('/api/v1/audit', auditRoutes); // Not defined
// app.use('/api/v1/assets', assetsRoutes); // Removed duplicate - already mounted with apiPrefix
// app.use('/api/v1/projects', projectsRoutes); // Not defined
// app.use('/api/v1/vendors', vendorsRoutes); // Not defined
// app.use('/api/v1/performance', performanceRoutes); // Not defined
// app.use('/api/v1/system/performance', performanceRoutes); // Not defined
// app.use('/api/v1/ai-ml', aiRoutes); // Not defined
// app.use('/api/v1/monitoring', monitoringRoutes); // Not defined
// app.use('/api/v1/files', filesRoutes); // Not defined
// app.use('/api/v1/upload', filesRoutes); // Not defined
// app.use('/api/v1/docs', apiDocsRoutes); // Not defined
// app.use('/api/v1/pending-emails', pendingEmailsRoutes); // Not defined
// app.use('/api/v1/mobile-apps', mobileAppsRoutes); // Not defined
// app.use('/api/v1/operations', operationsRoutes); // Not defined
// app.use('/api/v1/security', securityRoutes); // Not defined
// app.use('/api/v1/debug', debugRoutes); // Not defined
// app.use('/api/v1/alerts', alertsRoutes); // Not defined
// app.use('/api/v1/logs', logsRoutes); // Not defined
// app.use('/api/v1/health-checks', healthRoutes); // Not defined
// app.use('/api/v1/communication', communicationRoutes); // Not defined
// app.use('/api/v1/mobile-cms', mobileCmsRoutes); // Not defined
// app.use('/api/v1/ops', opsRoutes); // Not defined
// app.use('/api/v1/careers', careersRoutes); // Not defined
app.use('/api/v1/testing', testingRoutes);

// Enhanced routes
app.use('/api/v1/business-intelligence', businessIntelligenceEnhancedRoutes);
app.use('/api/v1/fleet', fleetEnhancedRoutes);
app.use('/api/v1/finance', financeEnhancedRoutes);
app.use('/api/v1/system-health', systemHealthEnhancedRoutes);

// Partners routes - Auth routes first (more specific)
app.use('/api/v1/partners', partnerAuthRoutes);
app.use('/api/v1/partners/notifications', partnerNotificationsRoutes);
app.use('/api/v1/partners/rbac', partnerRbacRoutes);
app.use('/api/v1/partners/kyc', partnerKycRoutes);
app.use('/api/v1/partners/notifications-enhanced', partnerNotificationsEnhancedRoutes);
app.use('/api/v1/partners/support', partnerSupportRoutes);
app.use('/api/v1/partners/warranty-disputes', partnerWarrantyDisputesRoutes);
app.use('/api/v1/partners/data-export', partnerDataExportRoutes);
app.use('/api/v1/partners/advanced-reports', partnerAdvancedReportsRoutes);
app.use('/api/v1/partners/purchase-orders', partnerPurchaseOrdersRoutes);
app.use('/api/v1/partners/staff', partnerStaffManagementRoutes);
// General partners routes last (less specific)
app.use('/api/v1/partners', partnersRoutes);
app.use('/api/v1/partners', partnerInventoryRoutes);
app.use('/api/v1/partners', partnerSyncRoutes);
app.use('/api/v1/partners', require('./routes/partner-mobile'));
app.use('/api/v1/auth', partnerLoginRoutes);

// Community and Loyalty routes
app.use('/api/v1/community', require('./routes/community'));
app.use('/api/v1/loyalty', require('./routes/loyalty'));

// Sales routes
app.use('/api/v1/sales', require('./routes/sales'));

// Partners routes
app.use('/api/v1/partners', require('./routes/partners'));

// Contract templates routes
app.use('/api/v1/contract-templates', require('./routes/contract-templates'));

// Contracts routes
app.use('/api/v1/contracts', require('./routes/contracts'));

// Notifications routes
app.use('/api/v1/notifications', require('./routes/notifications').router);

// Updates routes
app.use('/api/v1/updates', require('./routes/updates'));

// Careers routes
app.use('/api/v1/careers', require('./routes/careers'));

// Employee invitations routes
app.use('/api/v1/employees', require('./routes/employee-invitations'));

app.use('/api/v1', clutchAppRoutes);
app.use('/api/v1/admin/onboarding', onboardingRoutes);
app.use('/api/v1/admin/roles', rolesRoutes);
app.use('/api/v1', carsRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/operations', operationsRoutes);
app.use('/api/v1/security', securityRoutes);
app.use('/api/v1/partners/refunds', partnersRefundsRoutes);

// Note: Authentication is handled by individual routes using authenticateToken middleware
// No global authentication middleware needed as each route handles its own auth

// Test endpoints
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Basic routing works', 
    timestamp: new Date().toISOString()
  });
});

// Root endpoint handler
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Clutch API Server is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      ping: '/ping',
      auth: '/api/v1/auth/*',
      admin: '/api/v1/admin/*',
      performance: '/api/v1/performance/*'
    }
  });
});

// Handle HEAD requests for root
app.head('/', (req, res) => {
  res.status(200).end();
});

app.get('/auth-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth test works', 
    timestamp: new Date().toISOString()
  });
});

// Enhanced CORS configuration for admin.yourclutch.com
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://admin.yourclutch.com',
      'https://clutch-main-nk7x.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://yourclutch.com',
      'https://www.yourclutch.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'x-session-token', 
    'X-API-Version', 
    'X-Correlation-ID', 
    'Accept', 
    'Origin',
    'Cache-Control',
    'X-Requested-With'
  ],
  exposedHeaders: ['Authorization', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// OPTIONS handler - Express v5 compatible (handled by CORS middleware)

// Enhanced error handling middleware with production logging
app.use(errorLogger);
app.use(errorOptimization);

// Logo route (for frontend compatibility)
app.get('/Logored.png', (req, res) => {
  res.redirect('https://drive.google.com/uc?export=view&id=1UyOznOrD4lNpeS93t3TBWBhfNMdbykVQ');
});

// 404 handler - Express v5 compatible
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `Can't find ${req.originalUrl} on this server!`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/health',
      '/ping',
      '/test',
      '/auth-test',
      '/api/v1/auth/*',
      '/api/v1/admin/*',
      '/api/v1/shops/*',
      '/api/v1/parts/*',
      '/api/v1/users/*',
      '/api/v1/vehicles/*',
      '/api/v1/bookings/*',
      '/api/v1/payments/*',
      '/api/v1/inventory/*',
      '/api/v1/reports/*',
      '/api/v1/orders/*',
      '/api/v1/customers/*',
      '/api/v1/analytics/*',
      '/api/v1/cars/*',
      '/api/v1/chat/*',
      '/api/v1/clients/*',
      '/api/v1/communities/*',
      '/api/v1/crm/*',
      '/api/v1/dashboard/*',
      '/api/v1/diagnostics/*',
      '/api/v1/discounts/*',
      '/api/v1/disputes/*',
      '/api/v1/driver/*',
      '/api/v1/earnings/*',
      '/api/v1/ecommerce/*',
      '/api/v1/employees/*',
      '/api/v1/enterprise/*',
      '/api/v1/feedback/*',
      '/api/v1/finance/*',
      '/api/v1/fleet/*',
      '/api/v1/fleet-vehicle/*',
      '/api/v1/gps-device/*',
          '/api/v1/hr/*',
          '/api/v1/legal/*',
          '/api/v1/projects/*',
          '/api/v1/feature-flags/*',
          '/api/v1/cms/*',
          '/api/v1/marketing/*',
          '/api/v1/assets/*',
          '/api/v1/vendors/*',
          '/api/v1/audit/*',
          '/api/v1/system-health/*',
          '/api/v1/system/*',
          '/api/v1/admin-ceo/*',
      '/api/v1/insurance/*',
      '/api/v1/invoices/*',
      '/api/v1/jobs/*',
      '/api/v1/learning-system/*',
      '/api/v1/localization/*',
      '/api/v1/location/*',
      '/api/v1/loyalty/*',
      '/api/v1/maintenance/*',
      '/api/v1/market/*',
      '/api/v1/marketing/*',
      '/api/v1/mechanics/*',
      '/api/v1/mfa-setup/*',
      '/api/v1/mobile/*',
      '/api/v1/monitoring/*',
      '/api/v1/notifications/*',
      '/api/v1/obd/*',
      '/api/v1/obd2-device/*',
      '/api/v1/operations/*',
      '/api/v1/partners/*',
      '/api/v1/payment/*',
      '/api/v1/payouts/*',
      '/api/v1/permission/*',
      '/api/v1/products/*',
      '/api/v1/projects/*',
      '/api/v1/reviews/*',
      '/api/v1/roadside-assistance/*',
      '/api/v1/role/*',
      '/api/v1/sales/*',
      '/api/v1/security/*',
      '/api/v1/services/*',
      '/api/v1/session/*',
      '/api/v1/settings/*',
      '/api/v1/subscriptions/*',
      '/api/v1/suppliers/*',
      '/api/v1/support/*',
      '/api/v1/system/*',
      '/api/v1/telematics-data/*',
      '/api/v1/tracking/*',
      '/api/v1/trade-in/*',
      '/api/v1/transactions/*',
      '/api/v1/two-factor-auth/*',
      '/api/v1/upload/*',
      '/api/v1/verification/*',
      '/api/v1/advanced-features/*',
      '/api/v1/ai-agent/*',
      '/api/v1/ai-services/*',
      '/api/v1/ai/*',
      '/api/v1/app-configuration/*',
      '/api/v1/audit-log/*',
      '/api/v1/autonomous-dashboard/*',
      '/api/v1/autonomous-system/*',
      '/api/v1/b2b/*',
      '/api/v1/business-intelligence/*',
      '/api/v1/car-health/*',
      '/api/v1/car-parts/*',
      '/api/v1/clutch-email/*',
      '/api/v1/clutch-mobile/*',
      '/api/v1/communication/*',
      '/api/v1/corporate-account/*',
      '/api/v1/dashboard-new/*',
      '/api/v1/device-token/*',
      '/api/v1/digital-wallet/*',
      '/api/v1/email-marketing/*',
      '/api/v1/email-service/*',
      '/api/v1/enhanced-auth/*',
      '/api/v1/enhanced-features/*',
      '/api/v1/enterprise-auth/*',
      '/api/v1/errors/*',
      '/api/v1/feature-flags/*',
      '/api/v1/health-enhanced/*',
      '/api/v1/health-enhanced-autonomous/*',
      '/api/v1/partners-mobile/*',
      '/api/v1/next-level-features/*',
      '/api/v1/analytics-backup/*',
      '/api/v1/communication-backup/*',
      '/api/v1/user-analytics-backup/*',
      '/api/v1/performance/*',
      '/api/v1/ai-ml/*',
      '/api/v1/media-management/*',
      '/api/v1/feedback-system/*',
      '/api/v1/revenue-analytics/*',
      '/api/v1/legal/*',
      '/auth/*',
      '/admin/*'
    ]
  });
});

// Environment validation
function validateEnvironment() {
  const requiredVars = ['MONGODB_URI'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    logger.error('Missing required environment variables:', missing);
    return { isValid: false, missing };
  }
  
  return { isValid: true };
}

// Start server

// Initialize optimized systems
const optimizedAI = new OptimizedAIProviderManager();
let redisInitialized = false;

// Initialize Redis cache - Render compatible
async function initializeRedis() {
  try {
    // Check if Redis is configured
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      console.log('⚠️ Redis not configured, skipping Redis initialization');
      redisInitialized = false;
      return;
    }

    console.log('🔄 Initializing Redis cache...');
    redisInitialized = await redisCache.initialize();
    if (redisInitialized) {
      console.log('✅ Redis cache initialized successfully');
    } else {
      console.log('⚠️ Redis cache initialization failed, continuing without Redis');
    }
  } catch (error) {
    console.error('❌ Redis initialization error:', error.message);
    logger.error('Redis initialization error:', error);
    redisInitialized = false;
  }
}
async function startServer() {
  try {
    console.log('🚀 Starting Clutch Backend Server...');
    
    // Initialize and validate environment
    console.log('🔧 Initializing environment configuration...');
    const envConfig = initializeEnvironment();
    console.log('✅ Environment configuration validated successfully');

    // Connect to database with timeout
    console.log('📊 Connecting to database...');
    try {
      const dbConnectionPromise = connectOptimizedDatabase();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout after 30 seconds')), 30000)
      );
      
      await Promise.race([dbConnectionPromise, timeoutPromise]);
      console.log('✅ Database connection established');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      console.log('⚠️ Continuing without database connection - some features may be limited');
      // Don't exit, continue with limited functionality
    }
    
    // Initialize Redis cache
    console.log('📦 Initializing Redis cache...');
    await initializeRedis();
    console.log('✅ Redis cache initialized');

    // Start HTTP server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      
      // Initialize WebSocket server
      webSocketServer.initialize(server);
      
      // Initialize Partner WebSocket service
      const partnerWebSocketService = new PartnerWebSocketService(server);
      
      // Start system health logging
      systemHealthLogger();
      
      // Run endpoint testing in production to generate logs
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          require('./scripts/test-endpoints-on-render.js');
        }, 5000); // Wait 5 seconds after server start
      }
    });

    // Track server connections for graceful restart
    server.on('connection', (socket) => {
      trackConnection(socket);
    });

    // Setup performance monitoring and tuning
    setInterval(async () => {
      try {
        const memUsage = process.memoryUsage();
        const metrics = {
          memoryUsage: memUsage.heapUsed / memUsage.heapTotal,
          avgResponseTime: 0, // Would be calculated from performance monitor
          errorRate: 0, // Would be calculated from error tracking
          throughput: 0, // Would be calculated from request tracking
          dbQueryTime: 0 // Would be calculated from database monitor
        };
        
        await analyzeAndTune(metrics);
      } catch (error) {
        logger.error('Error in performance tuning:', error);
      }
    }, 600000); // Run every 10 minutes to reduce memory pressure

    // Enhanced graceful shutdown (handled by graceful restart manager)

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
