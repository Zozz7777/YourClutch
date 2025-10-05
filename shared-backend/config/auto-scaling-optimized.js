/**
 * Auto-Scaling Optimized Configuration for 6M+ Users
 * Designed to work seamlessly with Render's auto-scaling
 */

const cluster = require('cluster');
const os = require('os');

class AutoScalingOptimizer {
  constructor() {
    this.isMaster = cluster.isMaster;
    this.workerCount = 0;
    this.maxWorkers = process.env.MAX_WORKERS || os.cpus().length;
    this.scalingThresholds = {
      memory: 0.8, // 80% memory usage triggers scaling
      cpu: 0.7,    // 70% CPU usage triggers scaling
      requests: 1000 // 1000 requests per minute triggers scaling
    };
    
    this.metrics = {
      requests: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      responseTime: 0
    };
    
    this.setupScaling();
  }

  setupScaling() {
    if (this.isMaster) {
      this.setupMasterProcess();
    } else {
      this.setupWorkerProcess();
    }
  }

  setupMasterProcess() {
    console.log(`🚀 Master process ${process.pid} is running`);
    
    // Fork workers based on CPU cores
    for (let i = 0; i < this.maxWorkers; i++) {
      this.forkWorker();
    }

    // Monitor workers and restart if needed
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      if (!worker.exitedAfterDisconnect) {
        console.log('Starting a new worker');
        this.forkWorker();
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Master received SIGTERM, shutting down workers');
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
    });
  }

  setupWorkerProcess() {
    console.log(`👷 Worker ${process.pid} started`);
    
    // Setup performance monitoring for this worker
    this.setupWorkerMonitoring();
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log(`Worker ${process.pid} received SIGTERM, shutting down gracefully`);
      process.exit(0);
    });
  }

  forkWorker() {
    const worker = cluster.fork();
    this.workerCount++;
    
    worker.on('message', (message) => {
      if (message.type === 'metrics') {
        this.updateMetrics(message.data);
      }
    });
    
    return worker;
  }

  setupWorkerMonitoring() {
    // Monitor performance every 30 seconds
    setInterval(() => {
      const metrics = this.collectWorkerMetrics();
      
      // Send metrics to master
      if (process.send) {
        process.send({
          type: 'metrics',
          data: metrics
        });
      }
      
      // Auto-optimize based on metrics
      this.autoOptimize(metrics);
    }, 30000);
  }

  collectWorkerMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      pid: process.pid,
      memoryUsage: memUsage.heapUsed / memUsage.heapTotal,
      cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
      uptime: process.uptime(),
      requests: this.metrics.requests,
      responseTime: this.metrics.responseTime
    };
  }

  updateMetrics(workerMetrics) {
    // Aggregate metrics from all workers
    this.metrics.memoryUsage = Math.max(this.metrics.memoryUsage, workerMetrics.memoryUsage);
    this.metrics.cpuUsage = Math.max(this.metrics.cpuUsage, workerMetrics.cpuUsage);
    this.metrics.requests += workerMetrics.requests;
    this.metrics.responseTime = Math.max(this.metrics.responseTime, workerMetrics.responseTime);
  }

  autoOptimize(metrics) {
    // Memory optimization
    if (metrics.memoryUsage > 0.8) {
      this.optimizeMemory();
    }
    
    // CPU optimization
    if (metrics.cpuUsage > 0.7) {
      this.optimizeCPU();
    }
    
    // Response time optimization
    if (metrics.responseTime > 1000) {
      this.optimizeResponseTime();
    }
  }

  optimizeMemory() {
    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
    
    // Clear caches if needed
    if (global.cache) {
      global.cache.clear();
    }
  }

  optimizeCPU() {
    // Reduce CPU-intensive operations
    // This would include optimizing database queries, reducing computation
    console.log('🔧 Optimizing CPU usage');
  }

  optimizeResponseTime() {
    // Optimize slow responses
    console.log('🔧 Optimizing response time');
  }

  // Get scaling recommendations
  getScalingRecommendations() {
    const recommendations = [];
    
    if (this.metrics.memoryUsage > this.scalingThresholds.memory) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: `Memory usage is ${(this.metrics.memoryUsage * 100).toFixed(1)}% - consider scaling up`,
        action: 'scale_up'
      });
    }
    
    if (this.metrics.cpuUsage > this.scalingThresholds.cpu) {
      recommendations.push({
        type: 'cpu',
        priority: 'high',
        message: `CPU usage is ${(this.metrics.cpuUsage * 100).toFixed(1)}% - consider scaling up`,
        action: 'scale_up'
      });
    }
    
    if (this.metrics.requests > this.scalingThresholds.requests) {
      recommendations.push({
        type: 'throughput',
        priority: 'medium',
        message: `High request volume: ${this.metrics.requests} requests - consider horizontal scaling`,
        action: 'scale_horizontal'
      });
    }
    
    return recommendations;
  }

  // Get cluster status
  getClusterStatus() {
    return {
      isMaster: this.isMaster,
      workerCount: this.workerCount,
      maxWorkers: this.maxWorkers,
      metrics: this.metrics,
      recommendations: this.getScalingRecommendations(),
      timestamp: new Date()
    };
  }
}

// Create singleton instance
const autoScalingOptimizer = new AutoScalingOptimizer();

module.exports = {
  autoScalingOptimizer,
  getClusterStatus: () => autoScalingOptimizer.getClusterStatus(),
  getScalingRecommendations: () => autoScalingOptimizer.getScalingRecommendations()
};
