/**
 * Fast Optimized Middleware Stack
 * Minimal middleware for maximum performance
 */

const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

/**
 * Fast middleware stack - only essential middleware
 */
function applyFastMiddleware(app) {
  // 1. Compression (essential for performance)
  app.use(compression({
    level: 6, // Balanced compression
    threshold: 1024, // Only compress files > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // 2. Security headers (minimal set)
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for performance
    crossOriginEmbedderPolicy: false, // Disabled for performance
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // 3. CORS (optimized)
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://admin.yourclutch.com',
          'https://yourclutch.com',
          'https://clutch-main-nk7x.onrender.com'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://admin.yourclutch.com',
          'https://yourclutch.com'
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // 24 hours cache
  }));

  // 4. Rate limiting (optimized)
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Reduced limits
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/v1/health';
    }
  }));

  // 5. Body parsing (optimized)
  app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
      // Store raw body for webhook verification if needed
      req.rawBody = buf;
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));

  console.log('✅ Fast middleware stack applied');
}

/**
 * Memory monitoring (lightweight)
 */
let memoryStats = {
  initialMemory: process.memoryUsage(),
  peakMemory: process.memoryUsage(),
  requestCount: 0
};

const lightMemoryMonitor = (req, res, next) => {
  const startMemory = process.memoryUsage();
  memoryStats.requestCount++;
  
  // Update peak memory
  if (startMemory.heapUsed > memoryStats.peakMemory.heapUsed) {
    memoryStats.peakMemory = startMemory;
  }
  
  // Only add memory info in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Memory-Usage', `${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`);
  }
  
  next();
};

/**
 * Get memory stats
 */
function getMemoryStats() {
  return {
    current: process.memoryUsage(),
    peak: memoryStats.peakMemory,
    requestCount: memoryStats.requestCount
  };
}

module.exports = {
  applyFastMiddleware,
  lightMemoryMonitor,
  getMemoryStats
};
