/**
 * Intelligent Feature Loader
 * Loads all features in stages to avoid memory crashes
 */

const os = require('os');

class IntelligentLoader {
  constructor() {
    this.loadedFeatures = new Set();
    this.loadingQueue = [];
    this.isLoading = false;
    this.memoryThreshold = 400 * 1024 * 1024; // 400MB threshold
    this.maxConcurrentLoads = 3;
  }

  // Check if we have enough memory for next feature
  hasEnoughMemory() {
    const memUsage = process.memoryUsage();
    const systemMemory = os.totalmem();
    const availableMemory = systemMemory - memUsage.rss;
    
    return availableMemory > this.memoryThreshold;
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
      available: Math.round((systemMemory - memUsage.rss) / 1024 / 1024),
      usagePercentage: Math.round((memUsage.rss / systemMemory) * 100)
    };
  }

  // Add feature to loading queue
  queueFeature(name, loader, priority = 0) {
    this.loadingQueue.push({
      name,
      loader,
      priority,
      timestamp: Date.now()
    });
    
    // Sort by priority (higher first)
    this.loadingQueue.sort((a, b) => b.priority - a.priority);
    
    console.log(`📋 Queued feature: ${name} (priority: ${priority})`);
  }

  // Load features in stages
  async loadFeaturesInStages() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log('🚀 Starting intelligent feature loading...');
    
    try {
      // Stage 1: Essential features (immediate)
      await this.loadStage1();
      
      // Wait a bit for memory to stabilize
      await this.wait(2000);
      
      // Stage 2: Core features (after 2 seconds)
      await this.loadStage2();
      
      // Wait for memory to stabilize
      await this.wait(3000);
      
      // Stage 3: Advanced features (after 5 seconds)
      await this.loadStage3();
      
      // Wait for memory to stabilize
      await this.wait(5000);
      
      // Stage 4: Enterprise features (after 10 seconds)
      await this.loadStage4();
      
      console.log('✅ All features loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading features:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Stage 1: Essential features (auth, basic routes)
  async loadStage1() {
    console.log('🔧 Stage 1: Loading essential features...');
    
    const essentialFeatures = [
      { name: 'auth-routes', loader: () => require('./routes/auth-production') },
      { name: 'basic-middleware', loader: () => require('./middleware/lightweight-middleware') },
      { name: 'database-connection', loader: () => require('./config/database-unified') }
    ];
    
    for (const feature of essentialFeatures) {
      if (this.hasEnoughMemory()) {
        await this.loadFeature(feature.name, feature.loader);
      } else {
        console.log(`⚠️ Skipping ${feature.name} - insufficient memory`);
      }
    }
  }

  // Stage 2: Core features (users, basic functionality)
  async loadStage2() {
    console.log('🔧 Stage 2: Loading core features...');
    
    const coreFeatures = [
      { name: 'users-routes', loader: () => require('./routes/users') },
      { name: 'roles-routes', loader: () => require('./routes/roles') },
      { name: 'cars-routes', loader: () => require('./routes/cars') },
      { name: 'maintenance-routes', loader: () => require('./routes/maintenance') },
      { name: 'notifications-routes', loader: () => require('./routes/notifications') }
    ];
    
    for (const feature of coreFeatures) {
      if (this.hasEnoughMemory()) {
        await this.loadFeature(feature.name, feature.loader);
      } else {
        console.log(`⚠️ Skipping ${feature.name} - insufficient memory`);
      }
    }
  }

  // Stage 3: Advanced features (analytics, admin, etc.)
  async loadStage3() {
    console.log('🔧 Stage 3: Loading advanced features...');
    
    const advancedFeatures = [
      { name: 'admin-routes', loader: () => require('./routes/admin') },
      { name: 'analytics-routes', loader: () => require('./routes/consolidated-analytics') },
      { name: 'fleet-routes', loader: () => require('./routes/fleet') },
      { name: 'payments-routes', loader: () => require('./routes/payments') },
      { name: 'communication-routes', loader: () => require('./routes/communication') }
    ];
    
    for (const feature of advancedFeatures) {
      if (this.hasEnoughMemory()) {
        await this.loadFeature(feature.name, feature.loader);
      } else {
        console.log(`⚠️ Skipping ${feature.name} - insufficient memory`);
      }
    }
  }

  // Stage 4: Enterprise features (monitoring, optimization, etc.)
  async loadStage4() {
    console.log('🔧 Stage 4: Loading enterprise features...');
    
    const enterpriseFeatures = [
      { name: 'enterprise-monitoring', loader: () => require('./monitoring/enterprise-monitoring') },
      { name: 'enterprise-caching', loader: () => require('./config/enterprise-cache') },
      { name: 'enterprise-rate-limiting', loader: () => require('./middleware/enterprise-rate-limit') },
      { name: 'enterprise-middleware', loader: () => require('./middleware/enterprise-middleware') },
      { name: 'auto-scaling', loader: () => require('./config/auto-scaling-optimized') }
    ];
    
    for (const feature of enterpriseFeatures) {
      if (this.hasEnoughMemory()) {
        await this.loadFeature(feature.name, feature.loader);
      } else {
        console.log(`⚠️ Skipping ${feature.name} - insufficient memory`);
      }
    }
  }

  // Load individual feature
  async loadFeature(name, loader) {
    try {
      console.log(`📦 Loading feature: ${name}`);
      const startTime = Date.now();
      
      const feature = await loader();
      this.loadedFeatures.add(name);
      
      const loadTime = Date.now() - startTime;
      const memUsage = this.getMemoryUsage();
      
      console.log(`✅ Loaded ${name} in ${loadTime}ms (Memory: ${memUsage.usagePercentage}%)`);
      
      return feature;
    } catch (error) {
      console.error(`❌ Failed to load ${name}:`, error.message);
      throw error;
    }
  }

  // Wait for specified time
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get loading status
  getStatus() {
    return {
      loadedFeatures: Array.from(this.loadedFeatures),
      queuedFeatures: this.loadingQueue.length,
      isLoading: this.isLoading,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Force garbage collection if available
  forceGC() {
    if (global.gc) {
      console.log('🧹 Forcing garbage collection...');
      global.gc();
    }
  }

  // Monitor memory and adjust loading strategy
  monitorMemory() {
    setInterval(() => {
      const memUsage = this.getMemoryUsage();
      
      if (memUsage.usagePercentage > 85) {
        console.log(`⚠️ High memory usage: ${memUsage.usagePercentage}%`);
        this.forceGC();
      }
    }, 10000); // Check every 10 seconds
  }
}

// Create singleton instance
const intelligentLoader = new IntelligentLoader();

module.exports = {
  intelligentLoader,
  loadFeaturesInStages: () => intelligentLoader.loadFeaturesInStages(),
  getStatus: () => intelligentLoader.getStatus(),
  monitorMemory: () => intelligentLoader.monitorMemory(),
  queueFeature: (name, loader, priority) => intelligentLoader.queueFeature(name, loader, priority)
};
