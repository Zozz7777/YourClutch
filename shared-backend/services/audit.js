const logger = require('../utils/logger');

class AuditService {
  constructor() {
    this.auditLogs = [];
    this.maxLogs = 10000; // Keep last 10k logs in memory
  }

  // Log an audit event
  logEvent(event) {
    const auditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      partnerId: event.partnerId,
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      details: event.details || {},
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      severity: event.severity || 'info',
      category: event.category || 'general'
    };

    // Add to in-memory logs
    this.auditLogs.push(auditEntry);
    
    // Trim logs if they exceed max
    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs = this.auditLogs.slice(-this.maxLogs);
    }

    // Log to console/file
    logger.info('Audit Event:', {
      id: auditEntry.id,
      partnerId: auditEntry.partnerId,
      action: auditEntry.action,
      resource: auditEntry.resource,
      severity: auditEntry.severity
    });

    return auditEntry;
  }

  // Log authentication events
  logAuth(event) {
    return this.logEvent({
      ...event,
      category: 'authentication',
      action: event.action || 'login_attempt'
    });
  }

  // Log financial events
  logFinancial(event) {
    return this.logEvent({
      ...event,
      category: 'financial',
      severity: 'high',
      action: event.action || 'transaction'
    });
  }

  // Log inventory events
  logInventory(event) {
    return this.logEvent({
      ...event,
      category: 'inventory',
      action: event.action || 'inventory_change'
    });
  }

  // Log order events
  logOrder(event) {
    return this.logEvent({
      ...event,
      category: 'orders',
      action: event.action || 'order_action'
    });
  }

  // Log system events
  logSystem(event) {
    return this.logEvent({
      ...event,
      category: 'system',
      severity: event.severity || 'medium',
      action: event.action || 'system_event'
    });
  }

  // Log security events
  logSecurity(event) {
    return this.logEvent({
      ...event,
      category: 'security',
      severity: 'high',
      action: event.action || 'security_event'
    });
  }

  // Get audit logs with filters
  getLogs(filters = {}) {
    let logs = [...this.auditLogs];

    // Apply filters
    if (filters.partnerId) {
      logs = logs.filter(log => log.partnerId === filters.partnerId);
    }

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters.category) {
      logs = logs.filter(log => log.category === filters.category);
    }

    if (filters.severity) {
      logs = logs.filter(log => log.severity === filters.severity);
    }

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
      logs = logs.filter(log => log.timestamp >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      logs = logs.filter(log => log.timestamp <= new Date(filters.endDate));
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      logs: logs.slice(startIndex, endIndex),
      total: logs.length,
      page,
      limit,
      totalPages: Math.ceil(logs.length / limit)
    };
  }

  // Get audit statistics
  getStats(filters = {}) {
    const logs = this.getLogs(filters).logs;

    const stats = {
      total: logs.length,
      byCategory: {},
      bySeverity: {},
      byAction: {},
      byPartner: {},
      recentActivity: logs.slice(0, 10)
    };

    logs.forEach(log => {
      // Count by category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      
      // Count by action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      
      // Count by partner
      if (log.partnerId) {
        stats.byPartner[log.partnerId] = (stats.byPartner[log.partnerId] || 0) + 1;
      }
    });

    return stats;
  }

  // Export audit logs
  exportLogs(filters = {}, format = 'json') {
    const logs = this.getLogs(filters).logs;

    if (format === 'csv') {
      return this.exportToCSV(logs);
    } else if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      throw new Error('Unsupported export format');
    }
  }

  // Export to CSV format
  exportToCSV(logs) {
    const headers = [
      'ID', 'Timestamp', 'Partner ID', 'User ID', 'Action', 'Resource', 
      'Resource ID', 'Severity', 'Category', 'IP Address', 'User Agent'
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.partnerId || '',
      log.userId || '',
      log.action,
      log.resource || '',
      log.resourceId || '',
      log.severity,
      log.category,
      log.ipAddress || '',
      log.userAgent || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Search audit logs
  searchLogs(query, filters = {}) {
    const logs = this.getLogs(filters).logs;
    
    if (!query) return logs;

    const searchTerm = query.toLowerCase();
    
    return logs.filter(log => 
      log.action.toLowerCase().includes(searchTerm) ||
      log.resource?.toLowerCase().includes(searchTerm) ||
      log.details?.description?.toLowerCase().includes(searchTerm) ||
      log.category.toLowerCase().includes(searchTerm)
    );
  }

  // Get audit trail for a specific resource
  getAuditTrail(resource, resourceId, partnerId = null) {
    const filters = {
      resource,
      resourceId,
      partnerId
    };

    return this.getLogs(filters);
  }

  // Check for suspicious activity
  detectSuspiciousActivity(partnerId, timeWindow = 3600000) { // 1 hour
    const now = new Date();
    const startTime = new Date(now.getTime() - timeWindow);
    
    const recentLogs = this.auditLogs.filter(log => 
      log.partnerId === partnerId && 
      log.timestamp >= startTime
    );

    const suspicious = [];

    // Check for multiple failed login attempts
    const failedLogins = recentLogs.filter(log => 
      log.category === 'authentication' && 
      log.action === 'login_failed'
    );
    
    if (failedLogins.length >= 5) {
      suspicious.push({
        type: 'multiple_failed_logins',
        count: failedLogins.length,
        severity: 'high',
        description: `${failedLogins.length} failed login attempts in the last hour`
      });
    }

    // Check for unusual financial activity
    const financialLogs = recentLogs.filter(log => 
      log.category === 'financial'
    );
    
    if (financialLogs.length >= 20) {
      suspicious.push({
        type: 'high_financial_activity',
        count: financialLogs.length,
        severity: 'medium',
        description: `${financialLogs.length} financial transactions in the last hour`
      });
    }

    // Check for inventory manipulation
    const inventoryLogs = recentLogs.filter(log => 
      log.category === 'inventory' && 
      log.action === 'stock_adjustment'
    );
    
    if (inventoryLogs.length >= 10) {
      suspicious.push({
        type: 'excessive_inventory_changes',
        count: inventoryLogs.length,
        severity: 'medium',
        description: `${inventoryLogs.length} inventory adjustments in the last hour`
      });
    }

    return suspicious;
  }

  // Generate unique ID
  generateId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear old logs (cleanup)
  clearOldLogs(olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
    
    const removedCount = initialCount - this.auditLogs.length;
    logger.info(`Cleaned up ${removedCount} old audit logs`);
    
    return removedCount;
  }
}

// Create singleton instance
const auditService = new AuditService();

module.exports = auditService;
