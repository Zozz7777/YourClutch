/**
 * Lightweight Middleware Stack
 * Optimized for 512MB memory limit
 */

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

class LightweightMiddleware {
  constructor() {
    this.middlewareStack = [];
    this.setupBasicMiddleware();
  }

  setupBasicMiddleware() {
    // 1. Security Headers (minimal)
    this.middlewareStack.push(helmet({
      contentSecurityPolicy: false, // Disable for performance
      crossOriginEmbedderPolicy: false,
      hsts: false // Disable for performance
    }));
    
    // 2. CORS (basic)
    this.middlewareStack.push(cors({
      origin: true, // Allow all origins for now
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }));
    
    // 3. Compression (basic)
    this.middlewareStack.push(compression({
      level: 1, // Minimal compression for performance
      threshold: 2048, // Only compress responses > 2KB
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));
    
    // 4. Basic request logging (minimal)
    this.middlewareStack.push(this.createBasicLogger());
    
    // 5. Basic error handling
    this.middlewareStack.push(this.createBasicErrorHandler());
  }

  createBasicLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Only log errors and slow requests
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        // Log only errors and very slow requests
        if (res.statusCode >= 400 || duration > 2000) {
          console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        }
      });
      
      next();
    };
  }

  createBasicErrorHandler() {
    return (err, req, res, next) => {
      console.error('Error:', err.message);
      
      res.status(err.status || 500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
        timestamp: new Date().toISOString()
      });
    };
  }

  // Apply middleware to app
  applyMiddleware(app) {
    this.middlewareStack.forEach(middleware => {
      app.use(middleware);
    });
    
    console.log('✅ Lightweight middleware stack applied');
  }

  // Get memory usage
  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    };
  }

  // Health check endpoint
  createHealthCheck() {
    return (req, res) => {
      const memUsage = this.getMemoryUsage();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: memUsage,
        mode: 'lightweight'
      };
      
      res.json(health);
    };
  }
}

// Create singleton instance
const lightweightMiddleware = new LightweightMiddleware();

module.exports = {
  lightweightMiddleware,
  applyMiddleware: (app) => lightweightMiddleware.applyMiddleware(app),
  getMemoryUsage: () => lightweightMiddleware.getMemoryUsage(),
  createHealthCheck: () => lightweightMiddleware.createHealthCheck()
};
