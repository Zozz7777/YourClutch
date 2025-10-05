/**
 * Enterprise Middleware Stack for 6M+ Users
 * Optimized for auto-scaling and high performance
 */

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const { enterpriseCache } = require('../config/enterprise-cache');
const { enterpriseRateLimit } = require('./enterprise-rate-limit');
const logger = require('../utils/logger');

class EnterpriseMiddleware {
  constructor() {
    this.middlewareStack = [];
    this.performanceMetrics = {
      requests: 0,
      averageResponseTime: 0,
      errorCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.setupMiddleware();
  }

  setupMiddleware() {
    // 1. Security Headers (optimized for performance)
    this.middlewareStack.push(this.createSecurityHeaders());
    
    // 2. CORS (optimized for 6M users)
    this.middlewareStack.push(this.createCORS());
    
    // 3. Compression (aggressive for bandwidth savings)
    this.middlewareStack.push(this.createCompression());
    
    // 4. Request logging (minimal for performance)
    this.middlewareStack.push(this.createRequestLogger());
    
    // 5. Rate limiting (tiered for different user types)
    this.middlewareStack.push(enterpriseRateLimit.getTieredRateLimit());
    
    // 6. Performance monitoring (lightweight)
    this.middlewareStack.push(this.createPerformanceMonitor());
    
    // 7. Caching middleware (intelligent)
    this.middlewareStack.push(this.createCachingMiddleware());
    
    // 8. Error handling (comprehensive)
    this.middlewareStack.push(this.createErrorHandler());
  }

  createSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: false, // Disable for performance
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  createCORS() {
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'https://clutch.com',
          'https://www.clutch.com',
          'https://app.clutch.com',
          'https://admin.clutch.com',
          'https://partners.clutch.com'
        ];
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400 // 24 hours
    });
  }

  createCompression() {
    return compression({
      level: 6, // Balanced compression
      threshold: 1024, // Compress responses > 1KB
      filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    });
  }

  createRequestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Only log in development or for errors
      if (process.env.NODE_ENV === 'development') {
        logger.info(`${req.method} ${req.path}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
      }
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        // Log slow requests
        if (duration > 1000) {
          logger.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
        }
        
        // Log errors
        if (res.statusCode >= 400) {
          logger.error(`Error ${res.statusCode}: ${req.method} ${req.path}`, {
            statusCode: res.statusCode,
            duration,
            ip: req.ip
          });
        }
      });
      
      next();
    };
  }

  createPerformanceMonitor() {
    return (req, res, next) => {
      const startTime = process.hrtime.bigint();
      
      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        // Update metrics
        this.performanceMetrics.requests++;
        this.performanceMetrics.averageResponseTime = 
          (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.requests - 1) + duration) / 
          this.performanceMetrics.requests;
        
        if (res.statusCode >= 400) {
          this.performanceMetrics.errorCount++;
        }
        
        // Add performance headers
        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
        res.setHeader('X-Request-ID', req.requestId || 'unknown');
      });
      
      next();
    };
  }

  createCachingMiddleware() {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }
      
      // Skip caching for authenticated user data
      if (req.user && (req.path.includes('/users/') || req.path.includes('/profile'))) {
        return next();
      }
      
      const cacheKey = `cache:${req.method}:${req.originalUrl}`;
      
      try {
        // Try to get from cache
        const cached = await enterpriseCache.get(cacheKey);
        if (cached) {
          this.performanceMetrics.cacheHits++;
          return res.json({
            ...cached,
            cached: true,
            cacheTimestamp: new Date().toISOString()
          });
        }
        
        // Cache miss - intercept response
        const originalSend = res.send;
        res.send = function(data) {
          try {
            const responseData = JSON.parse(data);
            
            // Only cache successful responses
            if (responseData.success !== false) {
              // Set cache with appropriate TTL based on endpoint
              const ttl = getCacheTTL(req.path);
              enterpriseCache.set(cacheKey, responseData, ttl);
            }
          } catch (error) {
            // Ignore JSON parse errors
          }
          
          originalSend.call(this, data);
        };
        
        this.performanceMetrics.cacheMisses++;
        next();
      } catch (error) {
        logger.error('Caching middleware error:', error);
        next();
      }
    };
  }

  createErrorHandler() {
    return (err, req, res, next) => {
      logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      // Don't leak error details in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      res.status(err.status || 500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: isDevelopment ? err.message : 'An internal error occurred',
        ...(isDevelopment && { stack: err.stack }),
        timestamp: new Date().toISOString()
      });
    };
  }

  // Get cache TTL based on endpoint
  getCacheTTL(path) {
    if (path.includes('/inventory')) return 300; // 5 minutes
    if (path.includes('/orders')) return 60; // 1 minute
    if (path.includes('/analytics')) return 600; // 10 minutes
    if (path.includes('/knowledge-base')) return 1800; // 30 minutes
    return 300; // Default 5 minutes
  }

  // Apply all middleware to app
  applyMiddleware(app) {
    this.middlewareStack.forEach(middleware => {
      app.use(middleware);
    });
    
    console.log('✅ Enterprise middleware stack applied');
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRate: this.performanceMetrics.cacheHits / 
        (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) || 0,
      errorRate: this.performanceMetrics.errorCount / this.performanceMetrics.requests || 0,
      timestamp: new Date()
    };
  }

  // Health check endpoint
  createHealthCheck() {
    return (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        performance: this.getPerformanceMetrics()
      };
      
      res.json(health);
    };
  }
}

// Create singleton instance
const enterpriseMiddleware = new EnterpriseMiddleware();

module.exports = {
  enterpriseMiddleware,
  applyMiddleware: (app) => enterpriseMiddleware.applyMiddleware(app),
  getPerformanceMetrics: () => enterpriseMiddleware.getPerformanceMetrics(),
  createHealthCheck: () => enterpriseMiddleware.createHealthCheck()
};

// Helper function for cache TTL
function getCacheTTL(path) {
  if (path.includes('/inventory')) return 300; // 5 minutes
  if (path.includes('/orders')) return 60; // 1 minute
  if (path.includes('/analytics')) return 600; // 10 minutes
  if (path.includes('/knowledge-base')) return 1800; // 30 minutes
  return 300; // Default 5 minutes
}
