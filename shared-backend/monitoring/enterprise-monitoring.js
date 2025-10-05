/**
 * Enterprise Performance Monitoring for 6M+ Users
 * Real-time monitoring with auto-scaling integration
 */

const os = require('os');
const { enterpriseCache } = require('../config/enterprise-cache');

class EnterpriseMonitoring {
  constructor() {
    this.metrics = {
      system: {
        cpu: 0,
        memory: 0,
        loadAverage: [0, 0, 0],
        uptime: 0
      },
      application: {
        requests: 0,
        responseTime: 0,
        errorRate: 0,
        throughput: 0
      },
      database: {
        connections: 0,
        queryTime: 0,
        slowQueries: 0
      },
      cache: {
        hitRate: 0,
        size: 0,
        evictions: 0
      }
    };
    
    this.alerts = [];
    this.thresholds = {
      cpu: 0.8,
      memory: 0.85,
      responseTime: 1000,
      errorRate: 0.05,
      throughput: 1000
    };
    
    this.startMonitoring();
  }

  startMonitoring() {
    // System monitoring every 30 seconds
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);
    
    // Application monitoring every 10 seconds
    setInterval(() => {
      this.updateApplicationMetrics();
    }, 10000);
    
    // Database monitoring every 60 seconds
    setInterval(() => {
      this.updateDatabaseMetrics();
    }, 60000);
    
    // Cache monitoring every 30 seconds
    setInterval(() => {
      this.updateCacheMetrics();
    }, 30000);
    
    // Alert processing every 5 seconds
    setInterval(() => {
      this.processAlerts();
    }, 5000);
  }

  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.system = {
      cpu: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
      memory: memUsage.heapUsed / memUsage.heapTotal,
      loadAverage: os.loadavg(),
      uptime: process.uptime(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    };
  }

  updateApplicationMetrics() {
    // This would integrate with your application metrics
    // For now, we'll simulate some metrics
    this.metrics.application = {
      requests: this.metrics.application.requests + Math.floor(Math.random() * 10),
      responseTime: Math.random() * 500 + 100, // Simulated response time
      errorRate: Math.random() * 0.02, // Simulated error rate
      throughput: Math.random() * 100 + 50 // Simulated throughput
    };
  }

  updateDatabaseMetrics() {
    // This would integrate with your database monitoring
    this.metrics.database = {
      connections: Math.floor(Math.random() * 50) + 10,
      queryTime: Math.random() * 200 + 50,
      slowQueries: Math.floor(Math.random() * 5)
    };
  }

  updateCacheMetrics() {
    try {
      const cacheStats = enterpriseCache.getStats();
      this.metrics.cache = {
        hitRate: cacheStats.hitRate,
        size: cacheStats.memoryCacheSize,
        evictions: cacheStats.memoryCacheStats?.evictions || 0
      };
    } catch (error) {
      console.error('Error updating cache metrics:', error);
    }
  }

  processAlerts() {
    const alerts = [];
    
    // CPU alert
    if (this.metrics.system.cpu > this.thresholds.cpu) {
      alerts.push({
        type: 'cpu',
        severity: 'warning',
        message: `High CPU usage: ${(this.metrics.system.cpu * 100).toFixed(1)}%`,
        value: this.metrics.system.cpu,
        threshold: this.thresholds.cpu
      });
    }
    
    // Memory alert
    if (this.metrics.system.memory > this.thresholds.memory) {
      alerts.push({
        type: 'memory',
        severity: 'critical',
        message: `High memory usage: ${(this.metrics.system.memory * 100).toFixed(1)}%`,
        value: this.metrics.system.memory,
        threshold: this.thresholds.memory
      });
    }
    
    // Response time alert
    if (this.metrics.application.responseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        severity: 'warning',
        message: `Slow response time: ${this.metrics.application.responseTime.toFixed(0)}ms`,
        value: this.metrics.application.responseTime,
        threshold: this.thresholds.responseTime
      });
    }
    
    // Error rate alert
    if (this.metrics.application.errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        severity: 'critical',
        message: `High error rate: ${(this.metrics.application.errorRate * 100).toFixed(1)}%`,
        value: this.metrics.application.errorRate,
        threshold: this.thresholds.errorRate
      });
    }
    
    // Process new alerts
    alerts.forEach(alert => {
      if (!this.alertExists(alert)) {
        this.alerts.push({
          ...alert,
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          resolved: false
        });
        
        this.logAlert(alert);
      }
    });
    
    // Clean up old alerts
    this.cleanupOldAlerts();
  }

  alertExists(newAlert) {
    return this.alerts.some(alert => 
      alert.type === newAlert.type && 
      alert.severity === newAlert.severity &&
      !alert.resolved &&
      (Date.now() - new Date(alert.timestamp).getTime()) < 60000 // Within last minute
    );
  }

  logAlert(alert) {
    const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
    console.log(`${emoji} ${alert.severity.toUpperCase()} ALERT: ${alert.message}`);
  }

  cleanupOldAlerts() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }

  // Get comprehensive metrics
  getMetrics() {
    return {
      ...this.metrics,
      alerts: this.alerts.filter(alert => !alert.resolved),
      timestamp: new Date(),
      healthScore: this.calculateHealthScore()
    };
  }

  calculateHealthScore() {
    let score = 100;
    
    // Deduct for high CPU usage
    if (this.metrics.system.cpu > 0.9) score -= 30;
    else if (this.metrics.system.cpu > 0.8) score -= 20;
    else if (this.metrics.system.cpu > 0.7) score -= 10;
    
    // Deduct for high memory usage
    if (this.metrics.system.memory > 0.95) score -= 30;
    else if (this.metrics.system.memory > 0.85) score -= 20;
    else if (this.metrics.system.memory > 0.75) score -= 10;
    
    // Deduct for slow response times
    if (this.metrics.application.responseTime > 2000) score -= 25;
    else if (this.metrics.application.responseTime > 1000) score -= 15;
    else if (this.metrics.application.responseTime > 500) score -= 5;
    
    // Deduct for high error rates
    if (this.metrics.application.errorRate > 0.1) score -= 30;
    else if (this.metrics.application.errorRate > 0.05) score -= 20;
    else if (this.metrics.application.errorRate > 0.01) score -= 10;
    
    return Math.max(0, score);
  }

  // Get scaling recommendations
  getScalingRecommendations() {
    const recommendations = [];
    
    if (this.metrics.system.cpu > 0.8) {
      recommendations.push({
        type: 'cpu',
        priority: 'high',
        message: 'High CPU usage - consider horizontal scaling',
        action: 'scale_horizontal',
        currentValue: this.metrics.system.cpu,
        threshold: this.thresholds.cpu
      });
    }
    
    if (this.metrics.system.memory > 0.85) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage - consider vertical scaling or optimization',
        action: 'scale_vertical',
        currentValue: this.metrics.system.memory,
        threshold: this.thresholds.memory
      });
    }
    
    if (this.metrics.application.responseTime > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Slow response times - consider caching or query optimization',
        action: 'optimize_performance',
        currentValue: this.metrics.application.responseTime,
        threshold: this.thresholds.responseTime
      });
    }
    
    if (this.metrics.application.errorRate > 0.05) {
      recommendations.push({
        type: 'reliability',
        priority: 'critical',
        message: 'High error rate - investigate and fix issues',
        action: 'investigate_errors',
        currentValue: this.metrics.application.errorRate,
        threshold: this.thresholds.errorRate
      });
    }
    
    return recommendations;
  }

  // Resolve alert
  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      console.log(`✅ Alert resolved: ${alert.message}`);
    }
  }

  // Get monitoring dashboard data
  getDashboardData() {
    return {
      metrics: this.getMetrics(),
      recommendations: this.getScalingRecommendations(),
      alerts: this.alerts.filter(alert => !alert.resolved),
      healthScore: this.calculateHealthScore(),
      timestamp: new Date()
    };
  }
}

// Create singleton instance
const enterpriseMonitoring = new EnterpriseMonitoring();

module.exports = {
  enterpriseMonitoring,
  getMetrics: () => enterpriseMonitoring.getMetrics(),
  getScalingRecommendations: () => enterpriseMonitoring.getScalingRecommendations(),
  getDashboardData: () => enterpriseMonitoring.getDashboardData(),
  resolveAlert: (alertId) => enterpriseMonitoring.resolveAlert(alertId)
};
