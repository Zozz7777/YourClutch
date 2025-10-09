const logger = require('../utils/logger');

class SyncService {
  constructor() {
    this.syncQueues = new Map(); // partnerId -> queue of operations
    this.syncStatus = new Map(); // partnerId -> sync status
    this.conflictResolutions = new Map(); // conflictId -> resolution
    this.syncHistory = new Map(); // partnerId -> sync history
  }

  // Initialize sync for a partner
  initializePartnerSync(partnerId) {
    if (!this.syncQueues.has(partnerId)) {
      this.syncQueues.set(partnerId, []);
    }

    if (!this.syncStatus.has(partnerId)) {
      this.syncStatus.set(partnerId, {
        lastSync: null,
        status: 'idle',
        pendingOperations: 0,
        conflicts: 0,
        errors: 0
      });
    }

    if (!this.syncHistory.has(partnerId)) {
      this.syncHistory.set(partnerId, []);
    }

    logger.info(`Sync initialized for partner ${partnerId}`);
  }

  // Queue a sync operation
  queueOperation(partnerId, operation) {
    this.initializePartnerSync(partnerId);
    
    const syncOperation = {
      id: this.generateOperationId(),
      partnerId,
      type: operation.type,
      resource: operation.resource,
      resourceId: operation.resourceId,
      action: operation.action, // create, update, delete
      data: operation.data,
      timestamp: new Date(),
      priority: operation.priority || 'normal',
      retryCount: 0,
      maxRetries: 3,
      status: 'pending'
    };

    this.syncQueues.get(partnerId).push(syncOperation);
    this.updateSyncStatus(partnerId, 'pending');

    logger.info(`Queued sync operation for partner ${partnerId}: ${operation.type}`);
    return syncOperation;
  }

  // Process sync queue for a partner
  async processSyncQueue(partnerId, partnerData) {
    const queue = this.syncQueues.get(partnerId);
    if (!queue || queue.length === 0) {
      this.updateSyncStatus(partnerId, 'idle');
      return { success: true, processed: 0 };
    }

    this.updateSyncStatus(partnerId, 'syncing');
    let processed = 0;
    let errors = 0;

    for (const operation of queue) {
      try {
        await this.processOperation(operation, partnerData);
        processed++;
        operation.status = 'completed';
      } catch (error) {
        errors++;
        operation.retryCount++;
        operation.status = operation.retryCount >= operation.maxRetries ? 'failed' : 'retry';
        
        logger.error(`Sync operation failed for partner ${partnerId}:`, error);
      }
    }

    // Remove completed and failed operations
    this.syncQueues.set(partnerId, queue.filter(op => op.status === 'retry'));
    
    this.updateSyncStatus(partnerId, 'idle');
    this.recordSyncHistory(partnerId, { processed, errors, timestamp: new Date() });

    return { success: true, processed, errors };
  }

  // Process individual operation
  async processOperation(operation, partnerData) {
    switch (operation.type) {
      case 'inventory':
        await this.syncInventoryOperation(operation, partnerData);
        break;
      case 'order':
        await this.syncOrderOperation(operation, partnerData);
        break;
      case 'customer':
        await this.syncCustomerOperation(operation, partnerData);
        break;
      case 'product':
        await this.syncProductOperation(operation, partnerData);
        break;
      case 'sale':
        await this.syncSaleOperation(operation, partnerData);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Sync inventory operation
  async syncInventoryOperation(operation, partnerData) {
    // This would integrate with your inventory service
    logger.info(`Syncing inventory operation: ${operation.action} for ${operation.resourceId}`);
    
    // Simulate API call to update inventory
    await this.simulateApiCall(operation);
  }

  // Sync order operation
  async syncOrderOperation(operation, partnerData) {
    logger.info(`Syncing order operation: ${operation.action} for ${operation.resourceId}`);
    
    // Simulate API call to update order
    await this.simulateApiCall(operation);
  }

  // Sync customer operation
  async syncCustomerOperation(operation, partnerData) {
    logger.info(`Syncing customer operation: ${operation.action} for ${operation.resourceId}`);
    
    // Simulate API call to update customer
    await this.simulateApiCall(operation);
  }

  // Sync product operation
  async syncProductOperation(operation, partnerData) {
    logger.info(`Syncing product operation: ${operation.action} for ${operation.resourceId}`);
    
    // Simulate API call to update product
    await this.simulateApiCall(operation);
  }

  // Sync sale operation
  async syncSaleOperation(operation, partnerData) {
    logger.info(`Syncing sale operation: ${operation.action} for ${operation.resourceId}`);
    
    // Simulate API call to update sale
    await this.simulateApiCall(operation);
  }

  // Simulate API call (replace with actual API calls)
  async simulateApiCall(operation) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Simulated API failure');
    }
  }

  // Detect conflicts
  detectConflicts(partnerId, localData, serverData) {
    const conflicts = [];

    for (const [key, localValue] of Object.entries(localData)) {
      const serverValue = serverData[key];
      
      if (localValue !== serverValue && 
          localValue !== null && 
          serverValue !== null) {
        conflicts.push({
          id: this.generateConflictId(),
          partnerId,
          field: key,
          localValue,
          serverValue,
          timestamp: new Date(),
          status: 'pending'
        });
      }
    }

    return conflicts;
  }

  // Resolve conflict
  resolveConflict(conflictId, resolution) {
    const conflict = this.findConflict(conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    conflict.resolution = resolution;
    conflict.resolvedAt = new Date();
    conflict.status = 'resolved';

    this.conflictResolutions.set(conflictId, conflict);
    
    logger.info(`Conflict ${conflictId} resolved with strategy: ${resolution.strategy}`);
    return conflict;
  }

  // Find conflict by ID
  findConflict(conflictId) {
    for (const [partnerId, conflicts] of this.conflictResolutions) {
      const conflict = conflicts.find(c => c.id === conflictId);
      if (conflict) return conflict;
    }
    return null;
  }

  // Get sync status for partner
  getSyncStatus(partnerId) {
    return this.syncStatus.get(partnerId) || {
      lastSync: null,
      status: 'idle',
      pendingOperations: 0,
      conflicts: 0,
      errors: 0
    };
  }

  // Get sync queue for partner
  getSyncQueue(partnerId) {
    return this.syncQueues.get(partnerId) || [];
  }

  // Get sync history for partner
  getSyncHistory(partnerId, limit = 50) {
    const history = this.syncHistory.get(partnerId) || [];
    return history.slice(-limit);
  }

  // Update sync status
  updateSyncStatus(partnerId, status) {
    if (!this.syncStatus.has(partnerId)) {
      this.initializePartnerSync(partnerId);
    }

    const currentStatus = this.syncStatus.get(partnerId);
    currentStatus.status = status;
    currentStatus.lastUpdate = new Date();
    
    if (status === 'syncing') {
      currentStatus.pendingOperations = this.syncQueues.get(partnerId)?.length || 0;
    }

    this.syncStatus.set(partnerId, currentStatus);
  }

  // Record sync history
  recordSyncHistory(partnerId, record) {
    if (!this.syncHistory.has(partnerId)) {
      this.syncHistory.set(partnerId, []);
    }

    const history = this.syncHistory.get(partnerId);
    history.push(record);

    // Keep only last 100 records
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.syncHistory.set(partnerId, history);
  }

  // Clear completed operations
  clearCompletedOperations(partnerId) {
    if (!this.syncQueues.has(partnerId)) return;

    const queue = this.syncQueues.get(partnerId);
    const remaining = queue.filter(op => op.status === 'retry');
    this.syncQueues.set(partnerId, remaining);
  }

  // Get sync statistics
  getSyncStats() {
    const stats = {
      totalPartners: this.syncQueues.size,
      totalOperations: 0,
      totalConflicts: 0,
      partnersByStatus: {}
    };

    for (const [partnerId, queue] of this.syncQueues) {
      stats.totalOperations += queue.length;
      
      const status = this.syncStatus.get(partnerId);
      if (status) {
        stats.partnersByStatus[status.status] = (stats.partnersByStatus[status.status] || 0) + 1;
      }
    }

    return stats;
  }

  // Force sync for partner
  async forceSync(partnerId, partnerData) {
    logger.info(`Force sync requested for partner ${partnerId}`);
    
    this.updateSyncStatus(partnerId, 'forced_sync');
    
    try {
      const result = await this.processSyncQueue(partnerId, partnerData);
      logger.info(`Force sync completed for partner ${partnerId}:`, result);
      return result;
    } catch (error) {
      logger.error(`Force sync failed for partner ${partnerId}:`, error);
      throw error;
    }
  }

  // Reset sync for partner
  resetSync(partnerId) {
    this.syncQueues.set(partnerId, []);
    this.syncStatus.set(partnerId, {
      lastSync: null,
      status: 'idle',
      pendingOperations: 0,
      conflicts: 0,
      errors: 0
    });
    
    logger.info(`Sync reset for partner ${partnerId}`);
  }

  // Generate operation ID
  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate conflict ID
  generateConflictId() {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup old data
  cleanup() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    // Clean up old sync history
    for (const [partnerId, history] of this.syncHistory) {
      const recentHistory = history.filter(record => 
        record.timestamp >= cutoffDate
      );
      this.syncHistory.set(partnerId, recentHistory);
    }

    logger.info('Sync service cleanup completed');
  }
}

// Create singleton instance
const syncService = new SyncService();

module.exports = syncService;
