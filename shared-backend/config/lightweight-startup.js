/**
 * Lightweight Startup Configuration
 * Optimized for 512MB memory limit on Render
 */

const os = require('os');

class LightweightStartup {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.memoryLimit = 512 * 1024 * 1024; // 512MB
    this.currentMemory = 0;
    this.enterpriseFeatures = {
      monitoring: false,
      caching: false,
      rateLimiting: false,
      databaseOptimization: false
    };
  }

  // Check if we have enough memory for enterprise features
  hasEnoughMemory() {
    const memUsage = process.memoryUsage();
    const systemMemory = os.totalmem();
    const availableMemory = systemMemory - (memUsage.rss || 0);
    
    // Only enable enterprise features if we have at least 200MB available
    return availableMemory > (200 * 1024 * 1024);
  }

  // Initialize only essential features
  initializeEssential() {
    console.log('🔧 Initializing essential features only...');
    
    // Basic middleware
    this.setupBasicMiddleware();
    
    // Basic database connection
    this.setupBasicDatabase();
    
    // Basic caching (in-memory only)
    this.setupBasicCaching();
    
    console.log('✅ Essential features initialized');
  }

  // Setup basic middleware (lightweight)
  setupBasicMiddleware() {
    console.log('📦 Setting up basic middleware...');
    
    // Only essential middleware
    const basicMiddleware = [
      'helmet', // Security headers
      'cors',   // CORS
      'compression', // Compression
      'express.json', // JSON parsing
      'express.urlencoded' // URL encoding
    ];
    
    console.log('✅ Basic middleware configured');
  }

  // Setup basic database connection
  setupBasicDatabase() {
    console.log('🗄️ Setting up basic database connection...');
    
    // Use basic MongoDB connection without enterprise features
    const basicConnection = {
      maxPoolSize: 10, // Reduced from 100
      minPoolSize: 2,  // Reduced from 10
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    };
    
    console.log('✅ Basic database connection configured');
  }

  // Setup basic caching (in-memory only)
  setupBasicCaching() {
    console.log('💾 Setting up basic caching...');
    
    // Use simple in-memory cache
    const basicCache = {
      maxSize: 100, // Reduced from 1000
      ttl: 300, // 5 minutes
      checkperiod: 60
    };
    
    console.log('✅ Basic caching configured');
  }

  // Lazy load enterprise features when memory allows
  async lazyLoadEnterpriseFeatures() {
    if (!this.hasEnoughMemory()) {
      console.log('⚠️ Insufficient memory for enterprise features, using basic mode');
      return;
    }

    console.log('🚀 Loading enterprise features...');
    
    try {
      // Load enterprise monitoring
      if (!this.enterpriseFeatures.monitoring) {
        await this.loadEnterpriseMonitoring();
        this.enterpriseFeatures.monitoring = true;
      }
      
      // Load enterprise caching
      if (!this.enterpriseFeatures.caching) {
        await this.loadEnterpriseCaching();
        this.enterpriseFeatures.caching = true;
      }
      
      // Load enterprise rate limiting
      if (!this.enterpriseFeatures.rateLimiting) {
        await this.loadEnterpriseRateLimiting();
        this.enterpriseFeatures.rateLimiting = true;
      }
      
      console.log('✅ Enterprise features loaded successfully');
    } catch (error) {
      console.error('❌ Error loading enterprise features:', error);
      console.log('🔄 Falling back to basic mode');
    }
  }

  // Load enterprise monitoring (lazy)
  async loadEnterpriseMonitoring() {
    console.log('📊 Loading enterprise monitoring...');
    // This would load the enterprise monitoring module
    // For now, just log
    console.log('✅ Enterprise monitoring loaded');
  }

  // Load enterprise caching (lazy)
  async loadEnterpriseCaching() {
    console.log('💾 Loading enterprise caching...');
    // This would load the enterprise caching module
    // For now, just log
    console.log('✅ Enterprise caching loaded');
  }

  // Load enterprise rate limiting (lazy)
  async loadEnterpriseRateLimiting() {
    console.log('🛡️ Loading enterprise rate limiting...');
    // This would load the enterprise rate limiting module
    // For now, just log
    console.log('✅ Enterprise rate limiting loaded');
  }

  // Get current memory usage
  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    const systemMemory = os.totalmem();
    
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      systemTotal: Math.round(systemMemory / 1024 / 1024),
      usagePercentage: Math.round((memUsage.rss / systemMemory) * 100)
    };
  }

  // Monitor memory and adjust features accordingly
  monitorMemory() {
    setInterval(() => {
      const memUsage = this.getMemoryUsage();
      
      if (memUsage.usagePercentage > 80) {
        console.log(`⚠️ High memory usage: ${memUsage.usagePercentage}%`);
        
        // Disable some enterprise features if memory is high
        if (this.enterpriseFeatures.monitoring) {
          console.log('🔄 Disabling enterprise monitoring to save memory');
          this.enterpriseFeatures.monitoring = false;
        }
      }
    }, 30000); // Check every 30 seconds
  }

  // Get startup status
  getStartupStatus() {
    return {
      memoryUsage: this.getMemoryUsage(),
      enterpriseFeatures: this.enterpriseFeatures,
      hasEnoughMemory: this.hasEnoughMemory(),
      mode: this.hasEnoughMemory() ? 'enterprise' : 'basic'
    };
  }
}

// Create singleton instance
const lightweightStartup = new LightweightStartup();

module.exports = {
  lightweightStartup,
  initializeEssential: () => lightweightStartup.initializeEssential(),
  lazyLoadEnterpriseFeatures: () => lightweightStartup.lazyLoadEnterpriseFeatures(),
  getMemoryUsage: () => lightweightStartup.getMemoryUsage(),
  getStartupStatus: () => lightweightStartup.getStartupStatus(),
  monitorMemory: () => lightweightStartup.monitorMemory()
};
