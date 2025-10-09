const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

class SecurityService {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.jwtSecret = process.env.JWT_SECRET || 'clutch_secret_key';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    
    // Rate limiting configurations
    this.rateLimits = {
      login: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: 'Too many login attempts, please try again later',
        standardHeaders: true,
        legacyHeaders: false
      }),
      api: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: 'Too many API requests, please try again later',
        standardHeaders: true,
        legacyHeaders: false
      }),
      passwordReset: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 attempts per hour
        message: 'Too many password reset attempts, please try again later',
        standardHeaders: true,
        legacyHeaders: false
      })
    };
  }

  // Generate encryption key
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Encrypt sensitive data
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedText) {
    try {
      const textParts = encryptedText.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedData = textParts.join(':');
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  // Hash password
  async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Password hashing error:', error);
      throw new Error('Password hashing failed');
    }
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Password verification error:', error);
      return false;
    }
  }

  // Generate JWT token
  generateToken(payload, expiresIn = null) {
    try {
      const options = {
        expiresIn: expiresIn || this.jwtExpiry,
        issuer: 'clutch-partners',
        audience: 'clutch-partners-api'
      };

      return jwt.sign(payload, this.jwtSecret, options);
    } catch (error) {
      logger.error('Token generation error:', error);
      throw new Error('Token generation failed');
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'clutch-partners',
        audience: 'clutch-partners-api'
      });
    } catch (error) {
      logger.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  // Generate refresh token
  generateRefreshToken(userId, partnerId) {
    const payload = {
      userId,
      partnerId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    return this.generateToken(payload, this.refreshTokenExpiry);
  }

  // Generate access token
  generateAccessToken(userId, partnerId, role, permissions = []) {
    const payload = {
      userId,
      partnerId,
      role,
      permissions,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    };

    return this.generateToken(payload, this.jwtExpiry);
  }

  // Generate device token
  generateDeviceToken(deviceId, partnerId) {
    const payload = {
      deviceId,
      partnerId,
      type: 'device',
      iat: Math.floor(Date.now() / 1000)
    };

    return this.generateToken(payload, '30d'); // Device tokens last 30 days
  }

  // Generate API key
  generateApiKey(partnerId, permissions = []) {
    const payload = {
      partnerId,
      permissions,
      type: 'api',
      iat: Math.floor(Date.now() / 1000)
    };

    return this.generateToken(payload, '365d'); // API keys last 1 year
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Sanitize input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .substring(0, 1000); // Limit length
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone format
  validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate OTP
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  // Hash OTP for storage
  hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  // Verify OTP
  verifyOTP(otp, hashedOTP) {
    const hashedInput = this.hashOTP(otp);
    return hashedInput === hashedOTP;
  }

  // Check if IP is allowed
  isIPAllowed(ip, allowedIPs = []) {
    if (allowedIPs.length === 0) return true;
    return allowedIPs.includes(ip);
  }

  // Check if user agent is suspicious
  isSuspiciousUserAgent(userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /php/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Get rate limit configuration
  getRateLimit(type) {
    return this.rateLimits[type] || this.rateLimits.api;
  }

  // Create security headers middleware
  createSecurityHeaders() {
    return (req, res, next) => {
      // Prevent clickjacking
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Prevent MIME type sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Enable XSS protection
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Strict Transport Security
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      
      // Content Security Policy
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
      
      // Referrer Policy
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      next();
    };
  }

  // Create authentication middleware
  createAuthMiddleware() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication token required'
          });
        }

        const token = authHeader.substring(7);
        const decoded = this.verifyToken(token);

        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        });
      }
    };
  }

  // Create partner authentication middleware
  createPartnerAuthMiddleware() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'Partner authentication token required'
          });
        }

        const token = authHeader.substring(7);
        const decoded = this.verifyToken(token);

        if (decoded.type !== 'partner') {
          return res.status(403).json({
            success: false,
            error: 'INVALID_TOKEN_TYPE',
            message: 'Invalid token type for partner access'
          });
        }

        req.partner = decoded;
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid or expired partner token'
        });
      }
    };
  }

  // Create permission middleware
  createPermissionMiddleware(requiredPermission) {
    return (req, res, next) => {
      try {
        const user = req.user || req.partner;
        
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          });
        }

        if (user.role === 'owner') {
          return next(); // Owner has all permissions
        }

        if (!user.permissions || !user.permissions.includes(requiredPermission)) {
          return res.status(403).json({
            success: false,
            error: 'INSUFFICIENT_PERMISSIONS',
            message: `Permission '${requiredPermission}' required`
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'PERMISSION_CHECK_FAILED',
          message: 'Permission check failed'
        });
      }
    };
  }

  // Log security event
  logSecurityEvent(event, req) {
    logger.warn('Security Event:', {
      event,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  // Get security statistics
  getSecurityStats() {
    return {
      encryptionEnabled: !!this.encryptionKey,
      jwtConfigured: !!this.jwtSecret,
      rateLimits: Object.keys(this.rateLimits),
      securityFeatures: [
        'password_hashing',
        'jwt_tokens',
        'rate_limiting',
        'input_sanitization',
        'security_headers',
        'encryption'
      ]
    };
  }
}

// Create singleton instance
const securityService = new SecurityService();

module.exports = securityService;
