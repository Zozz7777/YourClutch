const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const logger = require('./utils/logger');

// Environment variables are loaded via dotenv

// Define API prefix early to avoid initialization errors
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

// Import basic middleware only
const { authenticateToken } = require('./middleware/auth');
const { connectToDatabase } = require('./config/database');

// Import ALL routes that the app needs
const authRoutes = require('./routes/auth-production');
const healthRoutes = require('./routes/health');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const carsRoutes = require('./routes/cars');
const maintenanceRoutes = require('./routes/maintenance');
const fleetRoutes = require('./routes/fleet');
const paymentsRoutes = require('./routes/payments');
const communicationRoutes = require('./routes/communication');
const bookingsRoutes = require('./routes/bookings');

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

// Mount routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use('/health', healthRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/cars`, carsRoutes);
app.use(`${apiPrefix}/maintenance`, maintenanceRoutes);
app.use(`${apiPrefix}/fleet`, fleetRoutes);
app.use(`${apiPrefix}/payments`, paymentsRoutes);
app.use(`${apiPrefix}/communication`, communicationRoutes);
app.use(`${apiPrefix}/bookings`, bookingsRoutes);

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API prefix: ${apiPrefix}`);
});

module.exports = app;
