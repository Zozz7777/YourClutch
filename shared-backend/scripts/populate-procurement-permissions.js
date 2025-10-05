const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Permission = require('../models/Permission');
const Role = require('../models/Role');

// Procurement permissions
const PROCUREMENT_PERMISSIONS = [
  // Request Management
  { name: 'create_procurement_request', description: 'Create procurement requests', category: 'procurement' },
  { name: 'read_procurement_request', description: 'View procurement requests', category: 'procurement' },
  { name: 'update_procurement_request', description: 'Update procurement requests', category: 'procurement' },
  { name: 'delete_procurement_request', description: 'Delete procurement requests', category: 'procurement' },
  { name: 'approve_procurement_request', description: 'Approve procurement requests', category: 'procurement' },
  { name: 'reject_procurement_request', description: 'Reject procurement requests', category: 'procurement' },
  
  // Supplier Management
  { name: 'create_supplier', description: 'Create suppliers', category: 'procurement' },
  { name: 'read_supplier', description: 'View suppliers', category: 'procurement' },
  { name: 'update_supplier', description: 'Update suppliers', category: 'procurement' },
  { name: 'delete_supplier', description: 'Delete suppliers', category: 'procurement' },
  { name: 'approve_supplier', description: 'Approve suppliers', category: 'procurement' },
  { name: 'suspend_supplier', description: 'Suspend suppliers', category: 'procurement' },
  
  // RFQ Management
  { name: 'create_rfq', description: 'Create RFQs', category: 'procurement' },
  { name: 'read_rfq', description: 'View RFQs', category: 'procurement' },
  { name: 'update_rfq', description: 'Update RFQs', category: 'procurement' },
  { name: 'delete_rfq', description: 'Delete RFQs', category: 'procurement' },
  { name: 'send_rfq', description: 'Send RFQs to suppliers', category: 'procurement' },
  { name: 'close_rfq', description: 'Close RFQs', category: 'procurement' },
  
  // Purchase Order Management
  { name: 'create_purchase_order', description: 'Create purchase orders', category: 'procurement' },
  { name: 'read_purchase_order', description: 'View purchase orders', category: 'procurement' },
  { name: 'update_purchase_order', description: 'Update purchase orders', category: 'procurement' },
  { name: 'delete_purchase_order', description: 'Delete purchase orders', category: 'procurement' },
  { name: 'approve_purchase_order', description: 'Approve purchase orders', category: 'procurement' },
  { name: 'send_purchase_order', description: 'Send purchase orders to suppliers', category: 'procurement' },
  
  // Contract Management
  { name: 'create_contract', description: 'Create contracts', category: 'procurement' },
  { name: 'read_contract', description: 'View contracts', category: 'procurement' },
  { name: 'update_contract', description: 'Update contracts', category: 'procurement' },
  { name: 'delete_contract', description: 'Delete contracts', category: 'procurement' },
  { name: 'approve_contract', description: 'Approve contracts', category: 'procurement' },
  { name: 'renew_contract', description: 'Renew contracts', category: 'procurement' },
  { name: 'terminate_contract', description: 'Terminate contracts', category: 'procurement' },
  
  // Budget Management
  { name: 'create_budget', description: 'Create budgets', category: 'procurement' },
  { name: 'read_budget', description: 'View budgets', category: 'procurement' },
  { name: 'update_budget', description: 'Update budgets', category: 'procurement' },
  { name: 'delete_budget', description: 'Delete budgets', category: 'procurement' },
  { name: 'approve_budget', description: 'Approve budgets', category: 'procurement' },
  { name: 'allocate_budget', description: 'Allocate budget funds', category: 'procurement' },
  
  // Risk Management
  { name: 'create_risk_assessment', description: 'Create risk assessments', category: 'procurement' },
  { name: 'read_risk_assessment', description: 'View risk assessments', category: 'procurement' },
  { name: 'update_risk_assessment', description: 'Update risk assessments', category: 'procurement' },
  { name: 'delete_risk_assessment', description: 'Delete risk assessments', category: 'procurement' },
  { name: 'approve_risk_assessment', description: 'Approve risk assessments', category: 'procurement' },
  
  // Analytics & Reporting
  { name: 'read_procurement_analytics', description: 'View procurement analytics', category: 'procurement' },
  { name: 'export_procurement_data', description: 'Export procurement data', category: 'procurement' },
  { name: 'view_procurement_dashboard', description: 'View procurement dashboard', category: 'procurement' },
  
  // Email Notifications
  { name: 'send_procurement_email', description: 'Send procurement emails', category: 'procurement' },
  { name: 'manage_email_templates', description: 'Manage email templates', category: 'procurement' },
  
  // System Administration
  { name: 'manage_procurement_settings', description: 'Manage procurement settings', category: 'procurement' },
  { name: 'view_procurement_logs', description: 'View procurement logs', category: 'procurement' },
  { name: 'manage_procurement_workflows', description: 'Manage procurement workflows', category: 'procurement' }
];

// Procurement roles
const PROCUREMENT_ROLES = [
  {
    name: 'Procurement Manager',
    description: 'Full access to all procurement functions',
    permissions: [
      'create_procurement_request', 'read_procurement_request', 'update_procurement_request', 'delete_procurement_request',
      'approve_procurement_request', 'reject_procurement_request',
      'create_supplier', 'read_supplier', 'update_supplier', 'delete_supplier', 'approve_supplier', 'suspend_supplier',
      'create_rfq', 'read_rfq', 'update_rfq', 'delete_rfq', 'send_rfq', 'close_rfq',
      'create_purchase_order', 'read_purchase_order', 'update_purchase_order', 'delete_purchase_order',
      'approve_purchase_order', 'send_purchase_order',
      'create_contract', 'read_contract', 'update_contract', 'delete_contract', 'approve_contract',
      'renew_contract', 'terminate_contract',
      'create_budget', 'read_budget', 'update_budget', 'delete_budget', 'approve_budget', 'allocate_budget',
      'create_risk_assessment', 'read_risk_assessment', 'update_risk_assessment', 'delete_risk_assessment',
      'approve_risk_assessment',
      'read_procurement_analytics', 'export_procurement_data', 'view_procurement_dashboard',
      'send_procurement_email', 'manage_email_templates',
      'manage_procurement_settings', 'view_procurement_logs', 'manage_procurement_workflows'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'Procurement Officer',
    description: 'Can manage requests, suppliers, and basic operations',
    permissions: [
      'create_procurement_request', 'read_procurement_request', 'update_procurement_request',
      'create_supplier', 'read_supplier', 'update_supplier',
      'create_rfq', 'read_rfq', 'update_rfq', 'send_rfq',
      'create_purchase_order', 'read_purchase_order', 'update_purchase_order', 'send_purchase_order',
      'create_contract', 'read_contract', 'update_contract',
      'read_budget',
      'create_risk_assessment', 'read_risk_assessment', 'update_risk_assessment',
      'read_procurement_analytics', 'view_procurement_dashboard',
      'send_procurement_email'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'Procurement Analyst',
    description: 'Read-only access with analytics',
    permissions: [
      'read_procurement_request', 'read_supplier', 'read_rfq', 'read_purchase_order',
      'read_contract', 'read_budget', 'read_risk_assessment',
      'read_procurement_analytics', 'export_procurement_data', 'view_procurement_dashboard'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'Department Head',
    description: 'Can approve requests and manage department budgets',
    permissions: [
      'create_procurement_request', 'read_procurement_request', 'update_procurement_request',
      'approve_procurement_request', 'reject_procurement_request',
      'read_supplier', 'read_rfq', 'read_purchase_order', 'read_contract',
      'create_budget', 'read_budget', 'update_budget', 'approve_budget', 'allocate_budget',
      'read_risk_assessment', 'read_procurement_analytics', 'view_procurement_dashboard'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'Finance Manager',
    description: 'Can approve high-value requests and manage budgets',
    permissions: [
      'read_procurement_request', 'approve_procurement_request', 'reject_procurement_request',
      'read_supplier', 'read_rfq', 'read_purchase_order', 'approve_purchase_order',
      'read_contract', 'approve_contract',
      'create_budget', 'read_budget', 'update_budget', 'approve_budget', 'allocate_budget',
      'read_risk_assessment', 'approve_risk_assessment',
      'read_procurement_analytics', 'export_procurement_data', 'view_procurement_dashboard'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'Legal Manager',
    description: 'Can manage contracts and legal aspects',
    permissions: [
      'read_procurement_request', 'read_supplier', 'read_rfq', 'read_purchase_order',
      'create_contract', 'read_contract', 'update_contract', 'approve_contract',
      'renew_contract', 'terminate_contract',
      'read_budget', 'read_risk_assessment', 'approve_risk_assessment',
      'read_procurement_analytics', 'view_procurement_dashboard'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'Requestor',
    description: 'Can create and manage their own requests',
    permissions: [
      'create_procurement_request', 'read_procurement_request', 'update_procurement_request',
      'read_supplier', 'read_rfq', 'read_purchase_order', 'read_contract', 'read_budget',
      'view_procurement_dashboard'
    ],
    isActive: true,
    isSystem: true
  },
  {
    name: 'Supplier',
    description: 'Limited access to their own data',
    permissions: [
      'read_rfq', 'read_purchase_order', 'read_contract'
    ],
    isActive: true,
    isSystem: true
  }
];

async function populateProcurementPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
    console.log('Connected to database');

    // Create permissions
    console.log('Creating procurement permissions...');
    for (const permissionData of PROCUREMENT_PERMISSIONS) {
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      if (!existingPermission) {
        const permission = new Permission({
          ...permissionData,
          isActive: true,
          isSystem: true
        });
        await permission.save();
        console.log(`Created permission: ${permissionData.name}`);
      } else {
        console.log(`Permission already exists: ${permissionData.name}`);
      }
    }

    // Create roles
    console.log('Creating procurement roles...');
    for (const roleData of PROCUREMENT_ROLES) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        // Get permission IDs
        const permissionIds = [];
        for (const permissionName of roleData.permissions) {
          const permission = await Permission.findOne({ name: permissionName });
          if (permission) {
            permissionIds.push(permission._id);
          }
        }

        const role = new Role({
          name: roleData.name,
          description: roleData.description,
          permissions: permissionIds,
          isActive: roleData.isActive,
          isSystem: roleData.isSystem
        });
        await role.save();
        console.log(`Created role: ${roleData.name} with ${permissionIds.length} permissions`);
      } else {
        console.log(`Role already exists: ${roleData.name}`);
      }
    }

    console.log('Procurement permissions and roles populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating procurement permissions:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateProcurementPermissions();
}

module.exports = { populateProcurementPermissions };
