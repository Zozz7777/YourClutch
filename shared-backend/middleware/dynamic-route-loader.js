/**
 * Dynamic Route Loader
 * Loads routes on-demand to avoid memory crashes
 */

const express = require('express');

class DynamicRouteLoader {
  constructor() {
    this.loadedRoutes = new Map();
    this.loadingPromises = new Map();
    this.routeCache = new Map();
  }

  // Load route dynamically
  async loadRoute(routeName, routePath, priority = 0) {
    // Check if already loaded
    if (this.loadedRoutes.has(routeName)) {
      return this.loadedRoutes.get(routeName);
    }

    // Check if currently loading
    if (this.loadingPromises.has(routeName)) {
      return this.loadingPromises.get(routeName);
    }

    // Start loading
    const loadingPromise = this._loadRouteInternal(routeName, routePath, priority);
    this.loadingPromises.set(routeName, loadingPromise);

    try {
      const route = await loadingPromise;
      this.loadedRoutes.set(routeName, route);
      this.loadingPromises.delete(routeName);
      return route;
    } catch (error) {
      this.loadingPromises.delete(routeName);
      throw error;
    }
  }

  // Internal route loading
  async _loadRouteInternal(routeName, routePath, priority) {
    console.log(`📦 Loading route: ${routeName} (priority: ${priority})`);
    const startTime = Date.now();

    try {
      // Load the route module
      const route = require(routePath);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ Loaded ${routeName} in ${loadTime}ms`);
      
      return route;
    } catch (error) {
      console.error(`❌ Failed to load ${routeName}:`, error.message);
      throw error;
    }
  }

  // Load multiple routes with priority
  async loadRoutes(routes, app, apiPrefix = '/api/v1') {
    // Sort by priority
    const sortedRoutes = routes.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    for (const routeConfig of sortedRoutes) {
      try {
        const route = await this.loadRoute(routeConfig.name, routeConfig.path, routeConfig.priority);
        
        // Mount the route
        if (routeConfig.mountPath) {
          app.use(routeConfig.mountPath, route);
          console.log(`🔗 Mounted ${routeConfig.name} at ${routeConfig.mountPath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load route ${routeConfig.name}:`, error.message);
        // Continue loading other routes
      }
    }
  }

  // Get loading status
  getStatus() {
    return {
      loadedRoutes: Array.from(this.loadedRoutes.keys()),
      loadingRoutes: Array.from(this.loadingPromises.keys()),
      totalLoaded: this.loadedRoutes.size
    };
  }

  // Preload essential routes
  async preloadEssentialRoutes(app) {
    console.log('🔧 Preloading essential routes...');
    
    const essentialRoutes = [
      { name: 'auth', path: './routes/auth-production', mountPath: '/api/v1/auth', priority: 10 },
      { name: 'health', path: './routes/health', mountPath: '/health', priority: 10 },
      { name: 'ping', path: './routes/ping', mountPath: '/ping', priority: 10 }
    ];
    
    await this.loadRoutes(essentialRoutes, app);
  }

  // Load core routes
  async loadCoreRoutes(app) {
    console.log('🔧 Loading core routes...');
    
    const coreRoutes = [
      { name: 'users', path: './routes/users', mountPath: '/api/v1/users', priority: 8 },
      { name: 'roles', path: './routes/roles', mountPath: '/api/v1/roles', priority: 8 },
      { name: 'cars', path: './routes/cars', mountPath: '/api/v1/cars', priority: 8 },
      { name: 'maintenance', path: './routes/maintenance', mountPath: '/api/v1/maintenance', priority: 8 },
      { name: 'notifications', path: './routes/notifications', mountPath: '/api/v1/notifications', priority: 8 }
    ];
    
    await this.loadRoutes(coreRoutes, app);
  }

  // Load advanced routes
  async loadAdvancedRoutes(app) {
    console.log('🔧 Loading advanced routes...');
    
    const advancedRoutes = [
      { name: 'admin', path: './routes/admin', mountPath: '/api/v1/admin', priority: 6 },
      { name: 'analytics', path: './routes/consolidated-analytics', mountPath: '/api/v1/analytics', priority: 6 },
      { name: 'fleet', path: './routes/fleet', mountPath: '/api/v1/fleet', priority: 6 },
      { name: 'payments', path: './routes/payments', mountPath: '/api/v1/payments', priority: 6 },
      { name: 'communication', path: './routes/communication', mountPath: '/api/v1/communication', priority: 6 }
    ];
    
    await this.loadRoutes(advancedRoutes, app);
  }

  // Load enterprise routes
  async loadEnterpriseRoutes(app) {
    console.log('🔧 Loading enterprise routes...');
    
    const enterpriseRoutes = [
      { name: 'enterprise', path: './routes/enterprise', mountPath: '/api/v1/enterprise', priority: 4 },
      { name: 'enterprise-auth', path: './routes/enterpriseAuth', mountPath: '/api/v1/enterprise-auth', priority: 4 },
      { name: 'ai', path: './routes/ai', mountPath: '/api/v1/ai', priority: 4 },
      { name: 'hr', path: './routes/hr', mountPath: '/api/v1/hr', priority: 4 },
      { name: 'legal', path: './routes/legal', mountPath: '/api/v1/legal', priority: 4 }
    ];
    
    await this.loadRoutes(enterpriseRoutes, app);
  }

  // Load all routes in stages
  async loadAllRoutesInStages(app) {
    console.log('🚀 Starting dynamic route loading...');
    
    try {
      // Stage 1: Essential routes
      await this.preloadEssentialRoutes(app);
      await this.wait(2000); // Wait 2 seconds
      
      // Stage 2: Core routes
      await this.loadCoreRoutes(app);
      await this.wait(3000); // Wait 3 seconds
      
      // Stage 3: Advanced routes
      await this.loadAdvancedRoutes(app);
      await this.wait(5000); // Wait 5 seconds
      
      // Stage 4: Enterprise routes
      await this.loadEnterpriseRoutes(app);
      
      console.log('✅ All routes loaded successfully');
    } catch (error) {
      console.error('❌ Error loading routes:', error);
    }
  }

  // Wait for specified time
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
const dynamicRouteLoader = new DynamicRouteLoader();

module.exports = {
  dynamicRouteLoader,
  loadAllRoutesInStages: (app) => dynamicRouteLoader.loadAllRoutesInStages(app),
  getStatus: () => dynamicRouteLoader.getStatus()
};
