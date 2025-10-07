/**
 * Optimized Authentication Utilities
 * Reduces bcrypt overhead and implements authentication caching
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { performanceCache } = require('../middleware/redis-cache');
const { optimizedLogger } = require('./optimized-logger');

// Optimized bcrypt configuration
const BCRYPT_CONFIG = {
  saltRounds: 10, // Reduced from 12 to 10 for better performance (still secure)
  maxConcurrent: 5, // Limit concurrent bcrypt operations
  cacheTimeout: 300 // 5 minutes cache for successful authentications
};

// Authentication cache to reduce repeated bcrypt operations
const authCache = new Map();
const maxCacheSize = 1000;

class OptimizedAuth {
  constructor() {
    this.concurrentOperations = 0;
    this.maxConcurrent = BCRYPT_CONFIG.maxConcurrent;
  }

  /**
   * Optimized password hashing with concurrency control
   */
  async hashPassword(password) {
    // Wait if too many concurrent operations
    while (this.concurrentOperations >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.concurrentOperations++;
    const startTime = Date.now();

    try {
      const hash = await bcrypt.hash(password, BCRYPT_CONFIG.saltRounds);
      const hashTime = Date.now() - startTime;
      
      optimizedLogger.performance(`Password hashed in ${hashTime}ms`);
      return hash;
    } finally {
      this.concurrentOperations--;
    }
  }

  /**
   * Optimized password comparison with caching
   */
  async comparePassword(password, hash, userId = null) {
    const startTime = Date.now();
    
    // Check cache first for successful authentications
    if (userId) {
      const cacheKey = `auth:${userId}:${hash.substring(0, 20)}`;
      const cached = await performanceCache.get(cacheKey);
      
      if (cached && cached.password === password) {
        optimizedLogger.performance(`Password verified from cache in ${Date.now() - startTime}ms`);
        return true;
      }
    }

    // Wait if too many concurrent operations
    while (this.concurrentOperations >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.concurrentOperations++;
    
    try {
      const isValid = await bcrypt.compare(password, hash);
      const compareTime = Date.now() - startTime;
      
      // Cache successful authentications
      if (isValid && userId) {
        const cacheKey = `auth:${userId}:${hash.substring(0, 20)}`;
        await performanceCache.set(cacheKey, { password }, BCRYPT_CONFIG.cacheTimeout);
      }
      
      optimizedLogger.performance(`Password compared in ${compareTime}ms`);
      return isValid;
    } finally {
      this.concurrentOperations--;
    }
  }

  /**
   * Generate JWT token with optimized payload
   */
  generateToken(payload, expiresIn = '24h') {
    const startTime = Date.now();
    
    // Optimize payload size
    const optimizedPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(optimizedPayload, process.env.JWT_SECRET, { expiresIn });
    const tokenTime = Date.now() - startTime;
    
    optimizedLogger.performance(`Token generated in ${tokenTime}ms`);
    return token;
  }

  /**
   * Verify JWT token with caching
   */
  async verifyToken(token) {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = `token:${token.substring(0, 20)}`;
      const cached = await performanceCache.get(cacheKey);
      
      if (cached) {
        optimizedLogger.performance(`Token verified from cache in ${Date.now() - startTime}ms`);
        return cached;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const verifyTime = Date.now() - startTime;
      
      // Cache successful verification
      await performanceCache.set(cacheKey, decoded, 300); // 5 minutes
      
      optimizedLogger.performance(`Token verified in ${verifyTime}ms`);
      return decoded;
    } catch (error) {
      optimizedLogger.error('Token verification failed:', error);
      throw error;
    }
  }

  /**
   * Batch password verification for multiple users
   */
  async batchVerifyPasswords(credentials) {
    const startTime = Date.now();
    const results = [];
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < credentials.length; i += batchSize) {
      const batch = credentials.slice(i, i + batchSize);
      const batchPromises = batch.map(async ({ password, hash, userId }) => ({
        userId,
        isValid: await this.comparePassword(password, hash, userId)
      }));
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    const batchTime = Date.now() - startTime;
    optimizedLogger.performance(`Batch verification completed in ${batchTime}ms`, {
      count: credentials.length,
      avgTime: batchTime / credentials.length
    });
    
    return results;
  }

  /**
   * Clear authentication cache
   */
  async clearAuthCache(userId = null) {
    if (userId) {
      // Clear specific user cache
      const keys = Array.from(authCache.keys()).filter(key => key.includes(userId));
      keys.forEach(key => authCache.delete(key));
    } else {
      // Clear all cache
      authCache.clear();
    }
    
    optimizedLogger.info('Authentication cache cleared', { userId });
  }

  /**
   * Get authentication statistics
   */
  getAuthStats() {
    return {
      cacheSize: authCache.size,
      concurrentOperations: this.concurrentOperations,
      maxConcurrent: this.maxConcurrent,
      saltRounds: BCRYPT_CONFIG.saltRounds
    };
  }
}

// Create singleton instance
const optimizedAuth = new OptimizedAuth();

// Legacy compatibility functions
const hashPassword = (password) => optimizedAuth.hashPassword(password);
const comparePassword = (password, hash, userId) => optimizedAuth.comparePassword(password, hash, userId);
const generateToken = (payload, expiresIn) => optimizedAuth.generateToken(payload, expiresIn);
const verifyToken = (token) => optimizedAuth.verifyToken(token);

module.exports = {
  OptimizedAuth,
  optimizedAuth,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  BCRYPT_CONFIG
};
