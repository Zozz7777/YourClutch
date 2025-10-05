const logger = require('../config/logger');

// Define roles and their permissions
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PARTNER_OWNER: 'partner_owner',
  PARTNER_MANAGER: 'partner_manager',
  PARTNER_EMPLOYEE: 'partner_employee',
  CUSTOMER: 'customer'
};

const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Partner Management
  CREATE_PARTNER: 'create_partner',
  READ_PARTNER: 'read_partner',
  UPDATE_PARTNER: 'update_partner',
  DELETE_PARTNER: 'delete_partner',
  
  // Order Management
  CREATE_ORDER: 'create_order',
  READ_ORDER: 'read_order',
  UPDATE_ORDER: 'update_order',
  DELETE_ORDER: 'delete_order',
  
  // Payment Management
  CREATE_PAYMENT: 'create_payment',
  READ_PAYMENT: 'read_payment',
  UPDATE_PAYMENT: 'update_payment',
  DELETE_PAYMENT: 'delete_payment',
  
  // Inventory Management
  CREATE_INVENTORY: 'create_inventory',
  READ_INVENTORY: 'read_inventory',
  UPDATE_INVENTORY: 'update_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  
  // Analytics & Reports
  READ_ANALYTICS: 'read_analytics',
  READ_REPORTS: 'read_reports',
  EXPORT_DATA: 'export_data',
  
  // Audit & Compliance
  READ_AUDIT_LOGS: 'read_audit_logs',
  CREATE_AUDIT_LOG: 'create_audit_log',
  
  // Support & Tickets
  CREATE_TICKET: 'create_ticket',
  READ_TICKET: 'read_ticket',
  UPDATE_TICKET: 'update_ticket',
  DELETE_TICKET: 'delete_ticket',
  
  // Warranty & Disputes
  CREATE_WARRANTY_CLAIM: 'create_warranty_claim',
  READ_WARRANTY_CLAIM: 'read_warranty_claim',
  UPDATE_WARRANTY_CLAIM: 'update_warranty_claim',
  CREATE_DISPUTE: 'create_dispute',
  READ_DISPUTE: 'read_dispute',
  UPDATE_DISPUTE: 'update_dispute',
  
  // Notifications
  SEND_NOTIFICATION: 'send_notification',
  READ_NOTIFICATION: 'read_notification',
  UPDATE_NOTIFICATION: 'update_notification',
  
  // Settings
  READ_SETTINGS: 'read_settings',
  UPDATE_SETTINGS: 'update_settings',
  
  // HR Management
  READ_HR: 'read_hr',
  MANAGE_HR: 'manage_hr',
  CREATE_EMPLOYEE: 'create_employee',
  UPDATE_EMPLOYEE: 'update_employee',
  DELETE_EMPLOYEE: 'delete_employee',
  READ_PAYROLL: 'read_payroll',
  MANAGE_PAYROLL: 'manage_payroll',
  READ_RECRUITMENT: 'read_recruitment',
  MANAGE_RECRUITMENT: 'manage_recruitment'
};

// Role-Permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.CREATE_PARTNER,
    PERMISSIONS.READ_PARTNER,
    PERMISSIONS.UPDATE_PARTNER,
    PERMISSIONS.READ_ORDER,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.READ_PAYMENT,
    PERMISSIONS.READ_INVENTORY,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.READ_AUDIT_LOGS,
    PERMISSIONS.READ_TICKET,
    PERMISSIONS.UPDATE_TICKET,
    PERMISSIONS.READ_WARRANTY_CLAIM,
    PERMISSIONS.UPDATE_WARRANTY_CLAIM,
    PERMISSIONS.READ_DISPUTE,
    PERMISSIONS.UPDATE_DISPUTE,
    PERMISSIONS.SEND_NOTIFICATION,
    PERMISSIONS.READ_NOTIFICATION,
    PERMISSIONS.READ_SETTINGS,
    PERMISSIONS.UPDATE_SETTINGS,
    PERMISSIONS.READ_HR,
    PERMISSIONS.MANAGE_HR,
    PERMISSIONS.CREATE_EMPLOYEE,
    PERMISSIONS.UPDATE_EMPLOYEE,
    PERMISSIONS.DELETE_EMPLOYEE,
    PERMISSIONS.READ_PAYROLL,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.READ_RECRUITMENT,
    PERMISSIONS.MANAGE_RECRUITMENT
  ],
  
  [ROLES.PARTNER_OWNER]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.READ_PARTNER,
    PERMISSIONS.UPDATE_PARTNER,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.READ_ORDER,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.CREATE_PAYMENT,
    PERMISSIONS.READ_PAYMENT,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.READ_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.DELETE_INVENTORY,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.READ_AUDIT_LOGS,
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.READ_TICKET,
    PERMISSIONS.UPDATE_TICKET,
    PERMISSIONS.CREATE_WARRANTY_CLAIM,
    PERMISSIONS.READ_WARRANTY_CLAIM,
    PERMISSIONS.UPDATE_WARRANTY_CLAIM,
    PERMISSIONS.CREATE_DISPUTE,
    PERMISSIONS.READ_DISPUTE,
    PERMISSIONS.UPDATE_DISPUTE,
    PERMISSIONS.READ_NOTIFICATION,
    PERMISSIONS.UPDATE_NOTIFICATION,
    PERMISSIONS.READ_SETTINGS,
    PERMISSIONS.UPDATE_SETTINGS
  ],
  
  [ROLES.PARTNER_MANAGER]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_PARTNER,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.READ_ORDER,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.READ_PAYMENT,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.READ_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.READ_REPORTS,
    PERMISSIONS.READ_AUDIT_LOGS,
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.READ_TICKET,
    PERMISSIONS.UPDATE_TICKET,
    PERMISSIONS.CREATE_WARRANTY_CLAIM,
    PERMISSIONS.READ_WARRANTY_CLAIM,
    PERMISSIONS.CREATE_DISPUTE,
    PERMISSIONS.READ_DISPUTE,
    PERMISSIONS.READ_NOTIFICATION,
    PERMISSIONS.UPDATE_NOTIFICATION,
    PERMISSIONS.READ_SETTINGS
  ],
  
  [ROLES.PARTNER_EMPLOYEE]: [
    PERMISSIONS.READ_ORDER,
    PERMISSIONS.UPDATE_ORDER,
    PERMISSIONS.READ_PAYMENT,
    PERMISSIONS.READ_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.READ_ANALYTICS,
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.READ_TICKET,
    PERMISSIONS.READ_WARRANTY_CLAIM,
    PERMISSIONS.READ_DISPUTE,
    PERMISSIONS.READ_NOTIFICATION,
    PERMISSIONS.UPDATE_NOTIFICATION
  ],
  
  [ROLES.CUSTOMER]: [
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.READ_ORDER,
    PERMISSIONS.READ_PAYMENT,
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.READ_TICKET,
    PERMISSIONS.CREATE_WARRANTY_CLAIM,
    PERMISSIONS.READ_WARRANTY_CLAIM,
    PERMISSIONS.CREATE_DISPUTE,
    PERMISSIONS.READ_DISPUTE,
    PERMISSIONS.READ_NOTIFICATION
  ]
};

/**
 * Check if user has specific permission
 */
function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
function hasAnyPermission(userRole, permissions) {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all of the specified permissions
 */
function hasAllPermissions(userRole, permissions) {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * RBAC middleware factory
 */
function requirePermission(permission) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      
      if (!hasPermission(userRole, permission)) {
        logger.warn('Access denied:', { 
          userId: req.user?.id, 
          role: userRole, 
          permission, 
          endpoint: req.path 
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          requiredPermission: permission,
          userRole: userRole
        });
      }
      
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
}

/**
 * RBAC middleware for multiple permissions (any)
 */
function requireAnyPermission(permissions) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      
      if (!hasAnyPermission(userRole, permissions)) {
        logger.warn('Access denied:', { 
          userId: req.user?.id, 
          role: userRole, 
          permissions, 
          endpoint: req.path 
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          requiredPermissions: permissions,
          userRole: userRole
        });
      }
      
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
}

/**
 * RBAC middleware for multiple permissions (all)
 */
function requireAllPermissions(permissions) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role || ROLES.CUSTOMER;
      
      if (!hasAllPermissions(userRole, permissions)) {
        logger.warn('Access denied:', { 
          userId: req.user?.id, 
          role: userRole, 
          permissions, 
          endpoint: req.path 
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          requiredPermissions: permissions,
          userRole: userRole
        });
      }
      
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
}

/**
 * Check if user can access partner data
 */
function canAccessPartnerData(req, res, next) {
  try {
    const userRole = req.user?.role;
    const requestedPartnerId = req.params.partnerId || req.body.partnerId;
    const userPartnerId = req.user?.partnerId;
    
    // Super admin and admin can access all partner data
    if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.ADMIN) {
      return next();
    }
    
    // Partner users can only access their own data
    if (userPartnerId && requestedPartnerId && userPartnerId !== requestedPartnerId) {
      logger.warn('Partner data access denied:', { 
        userId: req.user?.id, 
        userPartnerId, 
        requestedPartnerId 
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Cannot access other partner data.'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Partner data access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
}

/**
 * Audit log for RBAC actions
 */
function auditRBACAction(req, action, resource, success) {
  try {
    const { getCollection } = require('../config/database');
    const auditLogsCollection = getCollection('audit_logs');
    
    const auditLog = {
      userId: req.user?.id,
      partnerId: req.user?.partnerId,
      action: `RBAC_${action}`,
      description: `${action} access to ${resource}`,
      category: 'SECURITY',
      severity: success ? 'INFO' : 'WARNING',
      metadata: {
        userRole: req.user?.role,
        resource: resource,
        success: success,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      createdAt: new Date()
    };
    
    auditLogsCollection.insertOne(auditLog);
  } catch (error) {
    logger.error('RBAC audit log error:', error);
  }
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  canAccessPartnerData,
  auditRBACAction
};