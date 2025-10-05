/**
 * Consolidated Authentication Routes
 * Merged: auth.js + auth-advanced.js + enhanced-auth.js + enterprise-auth.js
 * Reduced from 4 files to 1 for better maintainability
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { getCollection } = require('../config/optimized-database');
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { hashPassword, comparePassword } = require('../utils/password-utils');
const { rateLimit: createRateLimit } = require('../middleware/rateLimit');
const logger = require('../utils/logger');

// Role permissions mapping (matching frontend constants)
const ROLE_PERMISSIONS = {
  // Level 1: Executive Leadership - Full access
  'super_admin': ['*'], // All permissions
  'head_administrator': ['*'], // All permissions
  'executive': ['*'], // All permissions
  'platform_admin': ['*'], // All permissions
  'admin': ['*'], // All permissions
  
  // Level 2: Department Heads
  'hr_manager': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_users', 'create_users', 'edit_users', 'delete_users', 'view_employees', 'manage_employees',
    'view_hr', 'manage_hr', 'view_onboarding', 'manage_onboarding', 'view_profiles', 'manage_profiles',
    'view_chat', 'send_messages', 'view_communication', 'manage_communication', 'view_support', 'manage_support',
    'view_feedback', 'manage_feedback', 'view_announcements', 'manage_announcements',
    'view_reports', 'generate_reports'
  ],
  
  'finance_officer': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_finance', 'manage_finance', 'process_payments', 'view_billing', 'manage_billing',
    'view_reports', 'generate_reports'
  ],
  
  'operations_manager': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_fleet', 'manage_fleet', 'view_gps_tracking', 'view_assets', 'manage_assets', 'view_vendors', 'manage_vendors', 'view_operations',
    'view_employees', 'manage_employees', 'view_hr', 'manage_hr',
    'view_reports', 'generate_reports'
  ],
  
  'marketing_manager': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_marketing', 'manage_marketing', 'view_crm', 'manage_crm'
  ],
  
  'legal_team': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_legal', 'manage_legal', 'view_contracts', 'manage_contracts',
    'view_reports', 'generate_reports'
  ],
  
  'security_manager': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_audit_trail', 'view_security_settings', 'view_users', 'create_users', 'edit_users', 'delete_users'
  ],
  
  // Level 3: Specialized Managers
  'business_analyst': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_reports', 'generate_reports'
  ],
  
  'project_manager': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_projects', 'manage_projects', 'view_users', 'create_users', 'edit_users'
  ],
  
  'asset_manager': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_fleet', 'manage_fleet', 'view_gps_tracking', 'view_assets', 'manage_assets', 'view_vendors', 'manage_vendors', 'view_operations',
    'view_reports', 'generate_reports'
  ],
  
  'crm_manager': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_crm', 'manage_crm', 'view_chat', 'send_messages', 'view_communication', 'manage_communication',
    'view_support', 'manage_support', 'view_feedback', 'manage_feedback', 'view_announcements', 'manage_announcements'
  ],
  
  'system_admin': [
    'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
    'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
    'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
    'view_ai_dashboard', 'manage_ai_models', 'view_mobile_apps', 'manage_mobile_apps', 'view_cms', 'manage_cms',
    'view_integrations', 'manage_integrations', 'view_api_docs', 'view_feature_flags', 'manage_feature_flags',
    'view_scheduled_jobs', 'manage_scheduled_jobs', 'view_development_tools', 'manage_development_tools',
    'view_technical_documentation', 'view_settings', 'manage_settings', 'view_system_config', 'manage_system_config'
  ],
  
  // Level 4: Functional Specialists
  'hr': [
    'view_dashboard', 'view_hr', 'view_employees', 'view_users', 'view_chat', 'view_communication'
  ],
  
  'finance': [
    'view_dashboard', 'view_finance', 'view_analytics', 'view_reports'
  ],
  
  'customer_support': [
    'view_dashboard', 'view_crm', 'manage_crm', 'view_chat', 'send_messages', 'view_communication', 'manage_communication'
  ],
  
  'developer': [
    'view_dashboard', 'view_ai_dashboard', 'view_mobile_apps', 'view_system_health', 'view_chat', 'view_support'
  ],
  
  // Level 5: Operational Staff
  'employee': [
    'view_dashboard', 'view_profiles', 'manage_profiles', 'view_chat', 'send_messages', 'view_communication', 'view_support'
  ],
  
  'support_agent': [
    'view_dashboard', 'view_support', 'manage_support', 'view_chat', 'send_messages', 'view_communication'
  ],
  
  // Level 6: External Users
  'enterprise_client': [
    'view_dashboard', 'view_fleet', 'manage_fleet', 'view_gps_tracking', 'view_crm', 'view_chat', 'view_analytics', 'view_reports'
  ],
  
  'service_provider': [
    'view_dashboard', 'view_chat', 'send_messages', 'view_crm'
  ]
};

// Helper function to get permissions for a role
function getRolePermissions(role) {
  if (!role) return [];
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];
  
  // If role has '*' permission, return all possible permissions
  if (permissions.includes('*')) {
    // Return all possible permissions from frontend constants
    return [
      // Core System & Dashboard
      'view_dashboard', 'view_analytics', 'export_analytics', 'view_system_health',
      'view_kpi_metrics', 'manage_kpi_metrics', 'view_business_intelligence', 'manage_business_intelligence',
      'view_dashboard_config', 'manage_dashboard_config', 'view_system_monitoring', 'manage_system_monitoring',
      
      // User & Organization
      'view_users', 'create_users', 'edit_users', 'delete_users', 'view_employees', 'manage_employees',
      'view_hr', 'manage_hr', 'view_onboarding', 'manage_onboarding', 'view_profiles', 'manage_profiles',
      
      // Fleet & Operations
      'view_fleet', 'manage_fleet', 'view_gps_tracking', 'view_assets', 'manage_assets',
      'view_vendors', 'manage_vendors', 'view_operations',
      
      // Business & Customer
      'view_crm', 'manage_crm', 'view_enterprise', 'manage_enterprise', 'view_finance', 'manage_finance',
      'process_payments', 'view_billing', 'manage_billing', 'view_legal', 'manage_legal',
      'view_contracts', 'manage_contracts', 'view_partners', 'manage_partners', 'view_customer_data',
      
      // Technology & Development
      'view_ai_dashboard', 'manage_ai_models', 'view_mobile_apps', 'manage_mobile_apps',
      'view_cms', 'manage_cms', 'view_integrations', 'manage_integrations', 'view_api_docs',
      'view_feature_flags', 'manage_feature_flags', 'view_scheduled_jobs', 'manage_scheduled_jobs',
      'view_development_tools', 'manage_development_tools', 'view_technical_documentation',
      
      // Communication & Support
      'view_chat', 'send_messages', 'view_communication', 'manage_communication',
      'view_support', 'manage_support', 'view_feedback', 'manage_feedback',
      'view_announcements', 'manage_announcements',
      
      // Administration & Config
      'view_settings', 'manage_settings', 'view_reports', 'generate_reports',
      'view_audit_trail', 'view_marketing', 'manage_marketing', 'view_projects', 'manage_projects',
      'view_localization', 'manage_localization', 'view_accessibility', 'manage_accessibility',
      'view_system_config', 'manage_system_config', 'view_security_settings'
    ];
  }
  
  return permissions;
}

// Apply rate limiting
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 50 }); // 50 attempts per 15 minutes
const loginRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 10 }); // 10 login attempts per 15 minutes

// ==================== BASIC AUTHENTICATION ====================

// POST /api/v1/auth/create-ceo - Create CEO employee (one-time setup)
router.post('/create-ceo', async (req, res) => {
  try {
    const CEO_EMAIL = 'ziad@yourclutch.com';
    const CEO_PASSWORD = '4955698*Z*z';
    
    console.log('👤 Creating/updating CEO employee...');
    
    const usersCollection = await getCollection('users');
    
    // Check if CEO already exists
    const existingCEO = await usersCollection.findOne({ 
      email: CEO_EMAIL.toLowerCase() 
    });
    
    if (existingCEO) {
      console.log('✅ CEO employee already exists, updating...');
      
      // Update password
      const hashedPassword = await hashPassword(CEO_PASSWORD);
      
      await usersCollection.updateOne(
        { _id: existingCEO._id },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            isEmployee: true,
            permissions: ['all'],
            name: 'Ziad - CEO',
            department: 'Executive',
            position: 'Chief Executive Officer',
            isActive: true,
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ CEO employee updated successfully');
      
    } else {
      console.log('👤 Creating new CEO employee...');
      
      // Hash password
      const hashedPassword = await hashPassword(CEO_PASSWORD);
      
      // Create CEO employee
      const ceoEmployee = {
        email: CEO_EMAIL.toLowerCase(),
        password: hashedPassword,
        name: 'Ziad - CEO',
        role: 'admin',
        department: 'Executive',
        position: 'Chief Executive Officer',
        permissions: ['all'],
        isActive: true,
        isEmployee: true,
        createdAt: new Date(),
        lastLogin: null,
        profile: {
          avatar: null,
          bio: 'Chief Executive Officer of Clutch Platform',
          skills: ['Leadership', 'Strategy', 'Management'],
          emergencyContact: null
        }
      };
      
      await usersCollection.insertOne(ceoEmployee);
      console.log('✅ CEO employee created successfully');
    }
    
    res.json({
      success: true,
      message: 'CEO employee created/updated successfully',
      data: {
        email: CEO_EMAIL,
        name: 'Ziad - CEO',
        role: 'admin',
        isEmployee: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Error creating CEO employee:', error);
    res.status(500).json({
      success: false,
      error: 'CEO_CREATION_FAILED',
      message: 'Failed to create CEO employee',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/login - User login with fallback authentication
router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email/phone and password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Detect if input is email or phone number
    const isEmail = email.includes('@');
    const isPhone = /^[0-9+\-\s()]+$/.test(email.replace(/\s/g, ''));
    
    console.log('🔐 Login attempt for:', email, '| Type:', isEmail ? 'email' : (isPhone ? 'phone' : 'unknown'));
    
    // Use the input as-is for database lookup (no automatic conversion)
    let lookupEmail = email.toLowerCase();
    let lookupPhone = null;
    
    if (isPhone && !isEmail) {
      // For phone numbers, we'll search by phone field
      lookupPhone = email.replace(/\D/g, ''); // Clean phone number
      lookupEmail = null; // Don't use email lookup for phone numbers
      console.log('📱 Phone number detected, searching by phone field:', lookupPhone);
    }
    
    // Public app - all authentication through database only
    
    // Try database authentication - check users collection first
    let user = null;
    let isEmployee = false;
    try {
      // Get users collection
      const usersCollection = await getCollection('users');
      let employee;
      
      // First try to get employees collection (if it exists)
      let employeesCollection;
      try {
        employeesCollection = await getCollection('employees');
      } catch (error) {
        console.log('⚠️ Employees collection not available, using users collection only');
        employeesCollection = null;
      }
      
      if (employeesCollection && lookupPhone) {
        // Search employee by phone number
        employee = await employeesCollection.findOne({ 
          $or: [
            { 'basicInfo.phoneNumber': lookupPhone },
            { 'basicInfo.phone': lookupPhone },
            { 'basicInfo.mobile': lookupPhone }
          ]
        });
      } else if (employeesCollection) {
        // Search employee by email
        employee = await employeesCollection.findOne({ 
        'basicInfo.email': email.toLowerCase()
      });
      }
      
      if (employee) {
        // Convert employee record to user format for authentication
        user = {
          _id: employee._id,
          email: employee.basicInfo.email,
          password: employee.password,
          role: employee.role,
          isEmployee: true,
          isActive: employee.isActive,
          firstName: employee.basicInfo.firstName,
          lastName: employee.basicInfo.lastName,
          department: employee.employment?.department,
          position: employee.employment?.position,
          permissions: employee.permissions || []
        };
        isEmployee = true;
      } else {
        // If not found in employees, check users collection
        const usersCollection = await getCollection('users');
        
        // Search by email or phone number based on input type
        if (lookupPhone) {
          // Search by phone number with multiple formats
          console.log('🔍 Searching for phone number:', lookupPhone);
          
          // Try different phone number formats
          const phoneVariations = [
            lookupPhone,                    // 01009561143
            `+2${lookupPhone}`,            // +201009561143
            `+20${lookupPhone}`,           // +2001009561143
            `0${lookupPhone}`,             // 001009561143
            lookupPhone.replace(/^0/, ''), // 1009561143
            lookupPhone.replace(/^0/, '20') // 201009561143
          ];
          
          console.log('📱 Phone variations to search:', phoneVariations);
          
          user = await usersCollection.findOne({ 
            $or: [
              { phoneNumber: { $in: phoneVariations } },
              { phone: { $in: phoneVariations } },
              { mobile: { $in: phoneVariations } }
            ]
          });
          
          if (!user) {
            // If not found, let's also try a broader search without isActive filter to debug
            const debugUser = await usersCollection.findOne({ 
              $or: [
                { phoneNumber: { $in: phoneVariations } },
                { phone: { $in: phoneVariations } },
                { mobile: { $in: phoneVariations } }
              ]
            });
            
            if (debugUser) {
              console.log('🔍 Found user but inactive:', { 
                email: debugUser.email, 
                phoneNumber: debugUser.phoneNumber, 
                phone: debugUser.phone, 
                isActive: debugUser.isActive 
              });
            } else {
              console.log('🔍 No user found with any phone variation');
            }
          }
        } else {
          // Search by email
        user = await usersCollection.findOne({ 
          email: lookupEmail
        });
        }
      }
      
      console.log('🔍 Database lookup result:', {
        found: !!user,
        isEmployee: isEmployee,
        role: user?.role,
        email: user?.email
      });
      
    } catch (dbError) {
      logger.error('Database connection error:', dbError);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify password
    let isValidPassword = false;
    try {
      isValidPassword = await comparePassword(password, user.password);
    } catch (passwordError) {
      logger.error('Password comparison error:', passwordError);
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'ACCOUNT_DISABLED',
        message: 'Account is disabled. Please contact support.',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Update last login (with fallback)
    try {
      const usersCollection = await getCollection('users');
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );
    } catch (dbError) {
      console.log('Could not update last login (database unavailable)');
    }
    
    // Create session (with fallback)
    let sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      const sessionsCollection = await getCollection('sessions');
      await sessionsCollection.insertOne({
        userId: user._id,
        sessionToken,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    } catch (dbError) {
      console.log('Could not create session (database unavailable)');
      // Use a simple session token
      sessionToken = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    console.log('✅ Database authentication successful for:', email);
    
    // Create refresh token (longer expiration)
    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        sessionToken,
        user: {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions && user.permissions.length > 0 ? user.permissions : getRolePermissions(user.role),
          isActive: user.isActive,
          isEmployee: user.isEmployee,
          createdAt: user.createdAt,
          lastLogin: new Date().toISOString()
        }
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Login failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/auth/employee-me - Get current employee
router.get('/employee-me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Mock employee data
    const employee = {
      id: userId,
      email: req.user.email,
      name: 'Current Employee',
      role: req.user.role,
      department: 'IT',
      isActive: true,
      lastLogin: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: { employee },
      message: 'Employee data retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Get employee error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_EMPLOYEE_FAILED',
      message: 'Failed to get employee data',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/register - User registration
router.post('/register', authRateLimit, async (req, res) => {
  try {
    console.log('🔐 Registration attempt:', { email: req.body.email, hasName: !!req.body.name, hasFirstName: !!req.body.firstName });
    
    const { email, password, name, firstName, lastName, phone, phoneNumber, confirmPassword, agreeToTerms } = req.body;
    
    // Handle both name formats (name or firstName/lastName)
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : null);
    
    console.log('📝 Registration data processed:', { email, hasPassword: !!password, fullName });
    
    if (!email || !password || !fullName) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, fullName: !!fullName });
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, password, and name (or firstName/lastName) are required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate password confirmation
    if (confirmPassword && password !== confirmPassword) {
      console.log('❌ Password mismatch');
      return res.status(400).json({
        success: false,
        error: 'PASSWORD_MISMATCH',
        message: 'Password and confirm password do not match',
        timestamp: new Date().toISOString()
      });
    }

    // Validate terms agreement
    if (agreeToTerms !== undefined && !agreeToTerms) {
      console.log('❌ Terms not agreed');
      return res.status(400).json({
        success: false,
        error: 'TERMS_NOT_AGREED',
        message: 'You must agree to the terms and conditions',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Please provide a valid email address',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    console.log('📧 Email to check:', email.toLowerCase());
    const usersCollection = await getCollection('users');
    console.log('✅ Database collection accessed');
    
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    console.log('🔍 User lookup result:', { 
      found: !!existingUser,
      email: email.toLowerCase(),
      existingUserEmail: existingUser?.email,
      existingUserId: existingUser?._id
    });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('✅ Password hashed successfully');
    
    // Create user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: fullName,
      phoneNumber: phone || phoneNumber || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique phoneNumber if not provided
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique userId
      role: 'user',
      permissions: ['read', 'write'],
      isActive: true,
      firebaseId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique firebaseId
      createdAt: new Date(),
      lastLogin: null
    };
    
    console.log('💾 Creating user in database...');
    console.log('📝 User data to insert:', {
      email: newUser.email,
      hasPassword: !!newUser.password,
      name: newUser.name,
      phoneNumber: newUser.phoneNumber,
      userId: newUser.userId,
      firebaseId: newUser.firebaseId,
      role: newUser.role
    });
    const result = await usersCollection.insertOne(newUser);
    console.log('✅ User created successfully:', { userId: result.insertedId });
    
    // Generate JWT token
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ JWT token generated');
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: result.insertedId,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Registration completed successfully');
    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: result.insertedId.toString(),
          email: newUser.email,
          phone: newUser.phoneNumber,
          firstName: firstName || newUser.name.split(' ')[0] || 'User',
          lastName: lastName || newUser.name.split(' ').slice(1).join(' ') || '',
          dateOfBirth: null,
          gender: null,
          profileImage: null,
          isEmailVerified: false,
          isPhoneVerified: false,
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: { push: true, email: true, sms: false },
            receiveOffers: true,
            subscribeNewsletter: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: token,
        refreshToken: refreshToken,
        expiresIn: '24h'
      },
      message: 'Registration successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Registration error:', error);
    logger.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      logger.error('Duplicate key error detected:', {
        duplicateField: error.keyPattern,
        duplicateValue: error.keyValue
      });
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'User with this information already exists',
        field: Object.keys(error.keyPattern)[0],
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENHANCED AUTHENTICATION ====================

// POST /api/v1/auth/refresh - Refresh token (no auth required since token is expired)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    console.log('🔄 Token refresh attempt:', {
      hasRefreshToken: !!refreshToken,
      refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'none',
      timestamp: new Date().toISOString()
    });
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      console.log('🔄 Refresh token decoded successfully:', {
        userId: decoded.userId,
        email: decoded.email,
        type: decoded.type,
        exp: decoded.exp,
        iat: decoded.iat
      });
    } catch (jwtError) {
      logger.error('JWT verification failed:', {
        error: jwtError.message,
        name: jwtError.name,
        refreshTokenPreview: refreshToken.substring(0, 20) + '...'
      });
      return res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
        details: process.env.NODE_ENV === 'development' ? jwtError.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle fallback users (no database lookup needed)
    if (decoded.userId === 'fallback_ziad_ceo' || decoded.userId === 'admin-001') {
      console.log('🔄 Refreshing token for fallback user:', decoded.userId);
      console.log('🔍 Current token role:', decoded.role);
      console.log('🔍 Will assign role:', (decoded.userId === 'fallback_ziad_ceo' || decoded.userId === 'admin-001') ? 'head_administrator' : 'admin');
      
      // Generate new access token
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: (decoded.userId === 'fallback_ziad_ceo' || decoded.userId === 'admin-001') ? 'head_administrator' : 'admin',
          permissions: ['all']
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          type: 'refresh'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('🔄 Token refresh successful for fallback user');
      
      return res.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get user from database for regular users
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: decoded.userId });
    
    console.log('🔄 Database user lookup:', {
      found: !!user,
      userId: decoded.userId,
      userActive: user?.isActive,
      userEmail: user?.email
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate new access token
    const newToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: 'refresh'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🔄 Token refresh successful for database user');
    
    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid or expired refresh token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/logout - User logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { sessionToken } = req.body;
    
    if (sessionToken) {
      // Deactivate session
      const sessionsCollection = await getCollection('sessions');
      await sessionsCollection.updateOne(
        { sessionToken },
        { $set: { isActive: false, loggedOutAt: new Date() } }
      );
    }
    
    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== ENTERPRISE AUTHENTICATION ====================

// POST /api/v1/auth/enterprise-login - Enterprise user login
router.post('/enterprise-login', loginRateLimit, async (req, res) => {
  try {
    const { email, password, organizationId } = req.body;
    
    if (!email || !password || !organizationId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_ENTERPRISE_CREDENTIALS',
        message: 'Email, password, and organization ID are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get enterprise user from database
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase(),
      organizationId,
      role: { $in: ['admin', 'enterprise_user', 'manager', 'executive', 'head_administrator', 'platform_admin'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_ENTERPRISE_CREDENTIALS',
        message: 'Invalid enterprise credentials',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_ENTERPRISE_CREDENTIALS',
        message: 'Invalid enterprise credentials',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate enterprise JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Shorter expiry for enterprise
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          permissions: user.permissions || []
        }
      },
      message: 'Enterprise login successful',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Enterprise login error:', error);
    res.status(500).json({
      success: false,
      error: 'ENTERPRISE_LOGIN_FAILED',
      message: 'Enterprise login failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== PASSWORD MANAGEMENT ====================

// POST /api/v1/auth/forgot-password - Forgot password
router.post('/forgot-password', authRateLimit, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_REQUIRED',
        message: 'Email is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user exists
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Store reset token (in real implementation, send email)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'FORGOT_PASSWORD_FAILED',
      message: 'Password reset request failed',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/auth/reset-password - Reset password
router.post('/reset-password', authRateLimit, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'TOKEN_AND_PASSWORD_REQUIRED',
        message: 'Reset token and new password are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_RESET_TOKEN',
        message: 'Invalid reset token',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update user password
    const usersCollection = await getCollection('users');
    await usersCollection.updateOne(
      { _id: decoded.userId },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    
    res.json({
      success: true,
      message: 'Password reset successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'RESET_PASSWORD_FAILED',
      message: 'Password reset failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== USER PROFILE ====================

// GET /api/v1/auth/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne(
      { _id: req.user.userId },
      { projection: { password: 0 } } // Exclude password
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_PROFILE_FAILED',
      message: 'Failed to retrieve profile',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    updateData.updatedAt = new Date();
    
    const usersCollection = await getCollection('users');
    const result = await usersCollection.updateOne(
      { _id: req.user.userId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_PROFILE_FAILED',
      message: 'Failed to update profile',
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== GENERIC HANDLERS ====================

// GET /api/v1/auth - Get auth overview
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Consolidated Authentication API is running',
    endpoints: {
      login: '/api/v1/auth/login',
      register: '/api/v1/auth/register',
      refresh: '/api/v1/auth/refresh',
      logout: '/api/v1/auth/logout',
      enterpriseLogin: '/api/v1/auth/enterprise-login',
      forgotPassword: '/api/v1/auth/forgot-password',
      resetPassword: '/api/v1/auth/reset-password',
      profile: '/api/v1/auth/profile'
    },
    timestamp: new Date().toISOString()
  });
});

// Handle OPTIONS requests for CORS preflight
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.status(200).end();
});

module.exports = router;
