const logger = require('../config/logger');

// Procurement-specific permissions
const PROCUREMENT_PERMISSIONS = {
  // Request Management
  CREATE_PROCUREMENT_REQUEST: 'create_procurement_request',
  READ_PROCUREMENT_REQUEST: 'read_procurement_request',
  UPDATE_PROCUREMENT_REQUEST: 'update_procurement_request',
  DELETE_PROCUREMENT_REQUEST: 'delete_procurement_request',
  APPROVE_PROCUREMENT_REQUEST: 'approve_procurement_request',
  REJECT_PROCUREMENT_REQUEST: 'reject_procurement_request',
  
  // Supplier Management
  CREATE_SUPPLIER: 'create_supplier',
  READ_SUPPLIER: 'read_supplier',
  UPDATE_SUPPLIER: 'update_supplier',
  DELETE_SUPPLIER: 'delete_supplier',
  APPROVE_SUPPLIER: 'approve_supplier',
  SUSPEND_SUPPLIER: 'suspend_supplier',
  
  // RFQ Management
  CREATE_RFQ: 'create_rfq',
  READ_RFQ: 'read_rfq',
  UPDATE_RFQ: 'update_rfq',
  DELETE_RFQ: 'delete_rfq',
  SEND_RFQ: 'send_rfq',
  CLOSE_RFQ: 'close_rfq',
  
  // Purchase Order Management
  CREATE_PURCHASE_ORDER: 'create_purchase_order',
  READ_PURCHASE_ORDER: 'read_purchase_order',
  UPDATE_PURCHASE_ORDER: 'update_purchase_order',
  DELETE_PURCHASE_ORDER: 'delete_purchase_order',
  APPROVE_PURCHASE_ORDER: 'approve_purchase_order',
  SEND_PURCHASE_ORDER: 'send_purchase_order',
  
  // Contract Management
  CREATE_CONTRACT: 'create_contract',
  READ_CONTRACT: 'read_contract',
  UPDATE_CONTRACT: 'update_contract',
  DELETE_CONTRACT: 'delete_contract',
  APPROVE_CONTRACT: 'approve_contract',
  RENEW_CONTRACT: 'renew_contract',
  TERMINATE_CONTRACT: 'terminate_contract',
  
  // Budget Management
  CREATE_BUDGET: 'create_budget',
  READ_BUDGET: 'read_budget',
  UPDATE_BUDGET: 'update_budget',
  DELETE_BUDGET: 'delete_budget',
  APPROVE_BUDGET: 'approve_budget',
  ALLOCATE_BUDGET: 'allocate_budget',
  
  // Risk Management
  CREATE_RISK_ASSESSMENT: 'create_risk_assessment',
  READ_RISK_ASSESSMENT: 'read_risk_assessment',
  UPDATE_RISK_ASSESSMENT: 'update_risk_assessment',
  DELETE_RISK_ASSESSMENT: 'delete_risk_assessment',
  APPROVE_RISK_ASSESSMENT: 'approve_risk_assessment',
  
  // Analytics & Reporting
  READ_PROCUREMENT_ANALYTICS: 'read_procurement_analytics',
  EXPORT_PROCUREMENT_DATA: 'export_procurement_data',
  VIEW_PROCUREMENT_DASHBOARD: 'view_procurement_dashboard',
  
  // Email Notifications
  SEND_PROCUREMENT_EMAIL: 'send_procurement_email',
  MANAGE_EMAIL_TEMPLATES: 'manage_email_templates',
  
  // System Administration
  MANAGE_PROCUREMENT_SETTINGS: 'manage_procurement_settings',
  VIEW_PROCUREMENT_LOGS: 'view_procurement_logs',
  MANAGE_PROCUREMENT_WORKFLOWS: 'manage_procurement_workflows'
};

// Role-based permission mapping
const PROCUREMENT_ROLE_PERMISSIONS = {
  // Procurement Manager - Full access to all procurement functions
  PROCUREMENT_MANAGER: Object.values(PROCUREMENT_PERMISSIONS),
  
  // Procurement Officer - Can manage requests, suppliers, and basic operations
  PROCUREMENT_OFFICER: [
    PROCUREMENT_PERMISSIONS.CREATE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.UPDATE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.CREATE_SUPPLIER,
    PROCUREMENT_PERMISSIONS.READ_SUPPLIER,
    PROCUREMENT_PERMISSIONS.UPDATE_SUPPLIER,
    PROCUREMENT_PERMISSIONS.CREATE_RFQ,
    PROCUREMENT_PERMISSIONS.READ_RFQ,
    PROCUREMENT_PERMISSIONS.UPDATE_RFQ,
    PROCUREMENT_PERMISSIONS.SEND_RFQ,
    PROCUREMENT_PERMISSIONS.CREATE_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.READ_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.UPDATE_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.SEND_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.CREATE_CONTRACT,
    PROCUREMENT_PERMISSIONS.READ_CONTRACT,
    PROCUREMENT_PERMISSIONS.UPDATE_CONTRACT,
    PROCUREMENT_PERMISSIONS.READ_BUDGET,
    PROCUREMENT_PERMISSIONS.CREATE_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.READ_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.UPDATE_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_ANALYTICS,
    PROCUREMENT_PERMISSIONS.VIEW_PROCUREMENT_DASHBOARD,
    PROCUREMENT_PERMISSIONS.SEND_PROCUREMENT_EMAIL
  ],
  
  // Procurement Analyst - Read-only access with analytics
  PROCUREMENT_ANALYST: [
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_SUPPLIER,
    PROCUREMENT_PERMISSIONS.READ_RFQ,
    PROCUREMENT_PERMISSIONS.READ_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.READ_CONTRACT,
    PROCUREMENT_PERMISSIONS.READ_BUDGET,
    PROCUREMENT_PERMISSIONS.READ_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_ANALYTICS,
    PROCUREMENT_PERMISSIONS.EXPORT_PROCUREMENT_DATA,
    PROCUREMENT_PERMISSIONS.VIEW_PROCUREMENT_DASHBOARD
  ],
  
  // Department Head - Can approve requests and manage department budgets
  DEPARTMENT_HEAD: [
    PROCUREMENT_PERMISSIONS.CREATE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.UPDATE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.APPROVE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.REJECT_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_SUPPLIER,
    PROCUREMENT_PERMISSIONS.READ_RFQ,
    PROCUREMENT_PERMISSIONS.READ_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.READ_CONTRACT,
    PROCUREMENT_PERMISSIONS.CREATE_BUDGET,
    PROCUREMENT_PERMISSIONS.READ_BUDGET,
    PROCUREMENT_PERMISSIONS.UPDATE_BUDGET,
    PROCUREMENT_PERMISSIONS.APPROVE_BUDGET,
    PROCUREMENT_PERMISSIONS.ALLOCATE_BUDGET,
    PROCUREMENT_PERMISSIONS.READ_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_ANALYTICS,
    PROCUREMENT_PERMISSIONS.VIEW_PROCUREMENT_DASHBOARD
  ],
  
  // Finance Manager - Can approve high-value requests and manage budgets
  FINANCE_MANAGER: [
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.APPROVE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.REJECT_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_SUPPLIER,
    PROCUREMENT_PERMISSIONS.READ_RFQ,
    PROCUREMENT_PERMISSIONS.READ_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.APPROVE_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.READ_CONTRACT,
    PROCUREMENT_PERMISSIONS.APPROVE_CONTRACT,
    PROCUREMENT_PERMISSIONS.CREATE_BUDGET,
    PROCUREMENT_PERMISSIONS.READ_BUDGET,
    PROCUREMENT_PERMISSIONS.UPDATE_BUDGET,
    PROCUREMENT_PERMISSIONS.APPROVE_BUDGET,
    PROCUREMENT_PERMISSIONS.ALLOCATE_BUDGET,
    PROCUREMENT_PERMISSIONS.READ_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.APPROVE_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_ANALYTICS,
    PROCUREMENT_PERMISSIONS.EXPORT_PROCUREMENT_DATA,
    PROCUREMENT_PERMISSIONS.VIEW_PROCUREMENT_DASHBOARD
  ],
  
  // Legal Manager - Can manage contracts and legal aspects
  LEGAL_MANAGER: [
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_SUPPLIER,
    PROCUREMENT_PERMISSIONS.READ_RFQ,
    PROCUREMENT_PERMISSIONS.READ_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.CREATE_CONTRACT,
    PROCUREMENT_PERMISSIONS.READ_CONTRACT,
    PROCUREMENT_PERMISSIONS.UPDATE_CONTRACT,
    PROCUREMENT_PERMISSIONS.APPROVE_CONTRACT,
    PROCUREMENT_PERMISSIONS.RENEW_CONTRACT,
    PROCUREMENT_PERMISSIONS.TERMINATE_CONTRACT,
    PROCUREMENT_PERMISSIONS.READ_BUDGET,
    PROCUREMENT_PERMISSIONS.READ_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.APPROVE_RISK_ASSESSMENT,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_ANALYTICS,
    PROCUREMENT_PERMISSIONS.VIEW_PROCUREMENT_DASHBOARD
  ],
  
  // Requestor - Can create and manage their own requests
  REQUESTOR: [
    PROCUREMENT_PERMISSIONS.CREATE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.UPDATE_PROCUREMENT_REQUEST,
    PROCUREMENT_PERMISSIONS.READ_SUPPLIER,
    PROCUREMENT_PERMISSIONS.READ_RFQ,
    PROCUREMENT_PERMISSIONS.READ_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.READ_CONTRACT,
    PROCUREMENT_PERMISSIONS.READ_BUDGET,
    PROCUREMENT_PERMISSIONS.VIEW_PROCUREMENT_DASHBOARD
  ],
  
  // Supplier - Limited access to their own data
  SUPPLIER: [
    PROCUREMENT_PERMISSIONS.READ_RFQ,
    PROCUREMENT_PERMISSIONS.READ_PURCHASE_ORDER,
    PROCUREMENT_PERMISSIONS.READ_CONTRACT
  ]
};

// Middleware to check procurement permissions
const requireProcurementPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has the required permission
      const hasPermission = await checkUserPermission(user, permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for procurement operation',
          required: permission,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      logger.error('Procurement permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Check if user has specific permission
const checkUserPermission = async (user, permission) => {
  try {
    // Get user roles
    const userRoles = user.roles || [user.role];
    
    // Check each role for permission
    for (const role of userRoles) {
      const rolePermissions = PROCUREMENT_ROLE_PERMISSIONS[role] || [];
      if (rolePermissions.includes(permission)) {
        return true;
      }
    }
    
    // Check direct permissions if user has them
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('Error checking user permission:', error);
    return false;
  }
};

// Get user's procurement permissions
const getUserProcurementPermissions = async (user) => {
  try {
    const userRoles = user.roles || [user.role];
    const permissions = new Set();
    
    // Add permissions from roles
    for (const role of userRoles) {
      const rolePermissions = PROCUREMENT_ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    }
    
    // Add direct permissions
    if (user.permissions) {
      user.permissions.forEach(permission => permissions.add(permission));
    }
    
    return Array.from(permissions);
  } catch (error) {
    logger.error('Error getting user procurement permissions:', error);
    return [];
  }
};

// Check if user can access procurement module
const canAccessProcurement = async (user) => {
  try {
    const permissions = await getUserProcurementPermissions(user);
    return permissions.length > 0;
  } catch (error) {
    logger.error('Error checking procurement access:', error);
    return false;
  }
};

// Get procurement role hierarchy
const getProcurementRoleHierarchy = () => {
  return {
    PROCUREMENT_MANAGER: {
      level: 1,
      canManage: ['PROCUREMENT_OFFICER', 'PROCUREMENT_ANALYST', 'DEPARTMENT_HEAD', 'FINANCE_MANAGER', 'LEGAL_MANAGER', 'REQUESTOR', 'SUPPLIER']
    },
    FINANCE_MANAGER: {
      level: 2,
      canManage: ['DEPARTMENT_HEAD', 'REQUESTOR']
    },
    LEGAL_MANAGER: {
      level: 2,
      canManage: ['DEPARTMENT_HEAD', 'REQUESTOR']
    },
    DEPARTMENT_HEAD: {
      level: 3,
      canManage: ['REQUESTOR']
    },
    PROCUREMENT_OFFICER: {
      level: 3,
      canManage: []
    },
    PROCUREMENT_ANALYST: {
      level: 4,
      canManage: []
    },
    REQUESTOR: {
      level: 5,
      canManage: []
    },
    SUPPLIER: {
      level: 6,
      canManage: []
    }
  };
};

// Check if user can manage another user
const canManageUser = async (manager, targetUser) => {
  try {
    const hierarchy = getProcurementRoleHierarchy();
    const managerRole = manager.role;
    const targetRole = targetUser.role;
    
    if (!hierarchy[managerRole] || !hierarchy[targetRole]) {
      return false;
    }
    
    const managerLevel = hierarchy[managerRole].level;
    const targetLevel = hierarchy[targetRole].level;
    
    return managerLevel < targetLevel || hierarchy[managerRole].canManage.includes(targetRole);
  } catch (error) {
    logger.error('Error checking user management permission:', error);
    return false;
  }
};

module.exports = {
  PROCUREMENT_PERMISSIONS,
  PROCUREMENT_ROLE_PERMISSIONS,
  requireProcurementPermission,
  checkUserPermission,
  getUserProcurementPermissions,
  canAccessProcurement,
  getProcurementRoleHierarchy,
  canManageUser
};
