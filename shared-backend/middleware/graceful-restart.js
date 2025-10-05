const cluster = require('cluster');
const os = require('os');

// ==================== GRACEFUL SERVER RESTART HANDLING ====================

class GracefulRestartManager {
  constructor() {
    this.isShuttingDown = false;
    this.activeConnections = new Set();
    this.restartQueue = [];
    this.healthCheckInterval = null;
    this.lastRestartTime = 0;
    this.setupSignalHandlers();
    this.setupHealthMonitoring();
  }

  // Setup signal handlers for graceful shutdown
  setupSignalHandlers() {
    // Handle SIGTERM (termination signal)
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Initiating graceful shutdown...');
      this.gracefulShutdown('SIGTERM');
    });

    // Handle SIGINT (interrupt signal)
    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received. Initiating graceful shutdown...');
      this.gracefulShutdown('SIGINT');
    });

    // Handle SIGHUP (hangup signal - for configuration reload)
    process.on('SIGHUP', () => {
      console.log('🔄 SIGHUP received. Initiating graceful restart...');
      this.gracefulRestart('SIGHUP');
    });

    // Handle SIGUSR2 (user-defined signal - for graceful restart)
    process.on('SIGUSR2', () => {
      console.log('🔄 SIGUSR2 received. Initiating graceful restart...');
      this.gracefulRestart('SIGUSR2');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      this.emergencyShutdown(error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      this.emergencyShutdown(reason);
    });
  }

    // Setup health monitoring for restart decisions
    setupHealthMonitoring() {
      this.healthCheckInterval = setInterval(() => {
        this.checkSystemHealth();
      }, 120000); // Check every 2 minutes to reduce overhead
    }

  // Check system health for restart decisions
  checkSystemHealth() {
    const memUsage = process.memoryUsage();
    const os = require('os');
    
    // Use system memory usage instead of Node.js heap usage
    const systemMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = systemMemory - freeMemory;
    const systemMemoryUsage = usedMemory / systemMemory;
    
    // Also check Node.js heap usage for reference
    const heapUsageRatio = memUsage.heapUsed / memUsage.heapTotal;
    
    const timeSinceLastRestart = Date.now() - (this.lastRestartTime || 0);
    const restartCooldown = 10 * 60 * 1000; // 10 minutes cooldown
    
    // Only restart based on SYSTEM memory usage, not Node.js heap usage
    if (systemMemoryUsage > 0.95 && timeSinceLastRestart > restartCooldown) {
      console.log('⚠️ Critical system memory usage detected. Queuing for restart...');
      this.queueRestart('critical_system_memory', { 
        systemMemoryUsage: (systemMemoryUsage * 100).toFixed(1),
        heapUsageRatio: (heapUsageRatio * 100).toFixed(1)
      });
    } else if (systemMemoryUsage > 0.85) {
      // Only log if SYSTEM memory is actually high
      console.log(`🧹 High system memory usage: ${(systemMemoryUsage * 100).toFixed(1)}% - monitoring...`);
    }
    
    // Log heap usage for debugging but don't trigger alerts
    if (heapUsageRatio > 0.90) {
      console.log(`📊 Node.js heap usage: ${(heapUsageRatio * 100).toFixed(1)}% (system: ${(systemMemoryUsage * 100).toFixed(1)}%)`);
    }

    // Check for too many active connections
    if (this.activeConnections.size > 1000) {
      console.log('⚠️ Too many active connections. Queuing for restart...');
      this.queueRestart('too_many_connections', { connectionCount: this.activeConnections.size });
    }
  }

  // Queue a restart request
  queueRestart(reason, metadata = {}) {
    const restartRequest = {
      reason,
      metadata,
      timestamp: new Date(),
      priority: this.getRestartPriority(reason)
    };

    this.restartQueue.push(restartRequest);
    console.log(`📋 Restart queued: ${reason}`, metadata);

    // Process restart queue if not already shutting down
    if (!this.isShuttingDown) {
      this.processRestartQueue();
    }
  }

  // Get restart priority based on reason
  getRestartPriority(reason) {
    const priorities = {
      'high_memory_usage': 'high',
      'too_many_connections': 'high',
      'configuration_reload': 'medium',
      'scheduled_restart': 'low',
      'manual_restart': 'medium'
    };
    return priorities[reason] || 'low';
  }

  // Process restart queue
  processRestartQueue() {
    if (this.restartQueue.length === 0 || this.isShuttingDown) {
      return;
    }

    // Sort by priority and timestamp
    this.restartQueue.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    const nextRestart = this.restartQueue.shift();
    console.log(`🔄 Processing restart: ${nextRestart.reason}`);
    
    // Delay restart for low priority requests
    if (nextRestart.priority === 'low') {
      setTimeout(() => {
        this.gracefulRestart(nextRestart.reason, nextRestart.metadata);
      }, 5000); // 5 second delay
    } else {
      this.gracefulRestart(nextRestart.reason, nextRestart.metadata);
    }
  }

  // Track active connections
  trackConnection(connection) {
    this.activeConnections.add(connection);
    
    // Set up connection cleanup
    connection.on('close', () => {
      this.activeConnections.delete(connection);
    });
  }

  // Graceful shutdown
  async gracefulShutdown(signal) {
    if (this.isShuttingDown) {
      console.log('⚠️ Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    console.log('🛑 Starting graceful shutdown...');

    try {
      // Stop accepting new connections
      console.log('🚫 Stopping new connections...');
      
      // Wait for active connections to close (with timeout)
      const maxWaitTime = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (this.activeConnections.size > 0 && (Date.now() - startTime) < maxWaitTime) {
        console.log(`⏳ Waiting for ${this.activeConnections.size} connections to close...`);
        await this.sleep(1000);
      }

      if (this.activeConnections.size > 0) {
        console.log(`⚠️ Force closing ${this.activeConnections.size} remaining connections...`);
        this.activeConnections.forEach(conn => {
          try {
            conn.destroy();
          } catch (error) {
            console.error('Error closing connection:', error);
          }
        });
      }

      // Close database connections
      console.log('🗄️ Closing database connections...');
      await this.closeDatabaseConnections();

      // Clear health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      console.log('✅ Graceful shutdown completed');
      process.exit(0);

    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  // Graceful restart
  async gracefulRestart(reason, metadata = {}) {
    console.log(`🔄 Starting graceful restart: ${reason}`, metadata);

    try {
      // Update last restart time
      this.lastRestartTime = Date.now();
      
      // Perform graceful shutdown first
      await this.gracefulShutdown(reason);

      // In a cluster environment, restart the worker
      if (cluster.isWorker) {
        console.log('🔄 Restarting worker process...');
        process.exit(0); // Let the master restart the worker
      } else {
        // In a single process environment, restart the entire process
        console.log('🔄 Restarting process...');
        process.exit(0);
      }

    } catch (error) {
      console.error('❌ Error during graceful restart:', error);
      process.exit(1);
    }
  }

  // Emergency shutdown
  emergencyShutdown(error) {
    console.error('🚨 Emergency shutdown initiated due to:', error);
    
    // Force close all connections
    this.activeConnections.forEach(conn => {
      try {
        conn.destroy();
      } catch (err) {
        console.error('Error force closing connection:', err);
      }
    });

    // Exit immediately
    process.exit(1);
  }

  // Close database connections gracefully
  async closeDatabaseConnections() {
    try {
      const { client } = require('../config/database');
      const dbClient = client();
      
      if (dbClient) {
        await dbClient.close();
        console.log('✅ Database connections closed');
      }
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get restart statistics
  getRestartStats() {
    return {
      isShuttingDown: this.isShuttingDown,
      activeConnections: this.activeConnections.size,
      restartQueueLength: this.restartQueue.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      pid: process.pid
    };
  }

  // Manual restart trigger
  triggerRestart(reason = 'manual_restart', metadata = {}) {
    console.log(`🔄 Manual restart triggered: ${reason}`, metadata);
    this.queueRestart(reason, metadata);
  }

  // Health check for restart readiness
  isReadyForRestart() {
    return !this.isShuttingDown && this.activeConnections.size < 10;
  }
}

// Create global instance
const gracefulRestartManager = new GracefulRestartManager();

// Export functions
module.exports = {
  gracefulRestartManager,
  trackConnection: (connection) => gracefulRestartManager.trackConnection(connection),
  triggerRestart: (reason, metadata) => gracefulRestartManager.triggerRestart(reason, metadata),
  getRestartStats: () => gracefulRestartManager.getRestartStats(),
  isReadyForRestart: () => gracefulRestartManager.isReadyForRestart()
};
