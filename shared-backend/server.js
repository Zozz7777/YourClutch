const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const logger = require('./utils/logger');

// Environment variables are loaded via dotenv

// Define API prefix early to avoid initialization errors
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

// Import essential middleware
const { authenticateToken } = require('./middleware/auth');
const { connectToDatabase: connectOptimizedDatabase } = require('./config/optimized-database');

// Import ALL routes that the app needs
const authRoutes = require('./routes/auth-production');
const healthRoutes = require('./routes/health');
const healthEnhancedRoutes = require('./routes/health-enhanced');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/consolidated-analytics');
const usersRoutes = require('./routes/users');
const otherRoutes = require('./routes/other');
const errorsRoutes = require('./routes/errors');
const clutchAppRoutes = require('./routes/clutch-app');
const onboardingRoutes = require('./routes/onboarding');
const rolesRoutes = require('./routes/roles');
const carsRoutes = require('./routes/cars');
const maintenanceRoutes = require('./routes/maintenance');
const knowledgeBaseRoutes = require('./routes/knowledge-base');
const operationsRoutes = require('./routes/operations');
const securityRoutes = require('./routes/security');
const incidentsRoutes = require('./routes/incidents');
const alertsRoutes = require('./routes/alerts');
const logsRoutes = require('./routes/logs');
const realtimeRoutes = require('./routes/realtime');
const shopsRoutes = require('./routes/shops');
const bookingsRoutes = require('./routes/bookings');
const enterpriseRoutes = require('./routes/enterprise');
const enterpriseAuthRoutes = require('./routes/enterpriseAuth');
const aiRoutes = require('./routes/ai');
const hrRoutes = require('./routes/hr');
const careersRoutes = require('./routes/careers');
const legalRoutes = require('./routes/legal');
const projectsRoutes = require('./routes/projects');
const featureFlagsRoutes = require('./routes/feature-flags');
const cmsRoutes = require('./routes/cms');
const marketingRoutes = require('./routes/marketing');
const assetsRoutes = require('./routes/assets');
const vendorsRoutes = require('./routes/vendors');
const auditRoutes = require('./routes/audit');
const systemHealthRoutes = require('./routes/system-health');
const systemRoutes = require('./routes/system');
const systemPerformanceRoutes = require('./routes/system-performance');
const sessionsRoutes = require('./routes/sessions');
const revenueRoutes = require('./routes/revenue');
const testingRoutes = require('./routes/testing');
const complianceRoutes = require('./routes/compliance');
const customersRoutes = require('./routes/customers');
const adminCeoRoutes = require('./routes/admin-ceo');
const emergencyAuthRoutes = require('./routes/emergency-auth');
const fleetRoutes = require('./routes/fleet');
const paymentsRoutes = require('./routes/payments');
const communicationRoutes = require('./routes/communication');
const mobileCmsRoutes = require('./routes/mobile-cms');
const opsRoutes = require('./routes/ops');
const performanceRoutes = require('./routes/performance');
const dashboardRoutes = require('./routes/dashboard-enhanced');
const notificationsRoutes = require('./routes/notifications');
const partnersRoutes = require('./routes/partners');
const partnerAuthRoutes = require('./routes/partner-auth');
const partnerMobileRoutes = require('./routes/partner-mobile');
const partnerApprovalsRoutes = require('./routes/partner-approvals');
const rbacRoutes = require('./routes/rbac');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Apply basic middleware only
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply basic rate limiting
const basicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(apiPrefix, basicRateLimit);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Basic ping endpoint
app.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Pong',
    timestamp: new Date().toISOString()
  });
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const { getCollection } = require('./config/optimized-database');
    const testCollection = await getCollection('users');
    
    if (testCollection) {
      res.json({
        success: true,
        message: 'Database connection working',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mount routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use('/health', healthRoutes);
app.use(`${apiPrefix}/health-enhanced`, healthEnhancedRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/other`, otherRoutes);
app.use('/errors', errorsRoutes);
app.use(`${apiPrefix}/clutch-app`, clutchAppRoutes);
app.use(`${apiPrefix}/onboarding`, onboardingRoutes);
app.use(`${apiPrefix}/roles`, rolesRoutes);
app.use(`${apiPrefix}/cars`, carsRoutes);
app.use(`${apiPrefix}/maintenance`, maintenanceRoutes);
app.use(`${apiPrefix}/knowledge-base`, knowledgeBaseRoutes);
app.use(`${apiPrefix}/operations`, operationsRoutes);
app.use(`${apiPrefix}/security`, securityRoutes);
app.use(`${apiPrefix}/incidents`, incidentsRoutes);
app.use(`${apiPrefix}/alerts`, alertsRoutes);
app.use(`${apiPrefix}/logs`, logsRoutes);
app.use(`${apiPrefix}/realtime`, realtimeRoutes);
app.use(`${apiPrefix}/shops`, shopsRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);
app.use(`${apiPrefix}/enterprise`, enterpriseRoutes);
app.use(`${apiPrefix}/enterprise-auth`, enterpriseAuthRoutes);
app.use(`${apiPrefix}/ai`, aiRoutes);
app.use(`${apiPrefix}/hr`, hrRoutes);
app.use(`${apiPrefix}/careers`, careersRoutes);
app.use(`${apiPrefix}/legal`, legalRoutes);
app.use(`${apiPrefix}/projects`, projectsRoutes);
app.use(`${apiPrefix}/feature-flags`, featureFlagsRoutes);
app.use(`${apiPrefix}/cms`, cmsRoutes);
app.use(`${apiPrefix}/marketing`, marketingRoutes);
app.use(`${apiPrefix}/assets`, assetsRoutes);
app.use(`${apiPrefix}/vendors`, vendorsRoutes);
app.use(`${apiPrefix}/audit`, auditRoutes);
app.use(`${apiPrefix}/system-health`, systemHealthRoutes);
app.use(`${apiPrefix}/system`, systemRoutes);
app.use(`${apiPrefix}/system/performance`, systemPerformanceRoutes);
app.use(`${apiPrefix}/sessions`, sessionsRoutes);
app.use(`${apiPrefix}/revenue`, revenueRoutes);
app.use(`${apiPrefix}/testing`, testingRoutes);
app.use(`${apiPrefix}/compliance`, complianceRoutes);
app.use(`${apiPrefix}/customers`, customersRoutes);
app.use(`${apiPrefix}/admin-ceo`, adminCeoRoutes);
app.use(`${apiPrefix}/emergency-auth`, emergencyAuthRoutes);
app.use(`${apiPrefix}/fleet`, fleetRoutes);
app.use(`${apiPrefix}/payments`, paymentsRoutes);
app.use(`${apiPrefix}/communication`, communicationRoutes);
app.use(`${apiPrefix}/mobile-cms`, mobileCmsRoutes);
app.use(`${apiPrefix}/ops`, opsRoutes);
app.use(`${apiPrefix}/performance`, performanceRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/notifications`, notificationsRoutes.router);
app.use(`${apiPrefix}/partners`, partnersRoutes);
app.use(`${apiPrefix}/partner-auth`, partnerAuthRoutes);
app.use(`${apiPrefix}/partners`, partnerMobileRoutes);
app.use(`${apiPrefix}/partner-approvals`, partnerApprovalsRoutes);
app.use(`${apiPrefix}/rbac`, rbacRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `Can't find ${req.originalUrl} on this server!`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An error occurred',
    timestamp: new Date().toISOString()
  });
});

// Database connection
async function initializeDatabase() {
  try {
    await connectOptimizedDatabase();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️ Continuing without database connection - some features may be limited');
  }
}

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Clutch Backend Server...');
    
    // Connect to database
    await initializeDatabase();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API prefix: ${apiPrefix}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
