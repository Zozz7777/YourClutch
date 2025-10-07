const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const PartnerDevice = require('../models/PartnerDevice');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Partner auth routes are working',
    timestamp: new Date().toISOString()
  });
});

// Simple validate-id test endpoint
router.post('/validate-id-test', (req, res) => {
  try {
    const { partnerId } = req.body;
    res.json({
      success: true,
      message: 'Test validation successful',
      partnerId: partnerId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Validation middleware
const validatePartnerId = [
  body('partnerId').notEmpty().withMessage('Partner ID is required')
];

const validateDeviceRegistration = [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('deviceName').notEmpty().withMessage('Device name is required'),
  body('deviceType').isIn(['windows_desktop', 'android_tablet', 'ios_tablet', 'pos_terminal', 'kiosk']).withMessage('Valid device type is required'),
  body('platform').isIn(['windows', 'android', 'ios', 'linux']).withMessage('Valid platform is required'),
  body('version').notEmpty().withMessage('Version is required')
];

const validatePartnerLogin = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateOTP = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

const validatePartnerSignup = [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('email').optional().isEmail().withMessage('Valid email is required if provided'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone is required if provided'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['partner_owner', 'partner_manager', 'partner_employee']).withMessage('Invalid role'),
  // Custom validation to ensure either email or phone is provided
  body().custom((value) => {
    const hasEmail = value.email && value.email !== 'undefined' && value.email !== 'null';
    const hasPhone = value.phone && value.phone !== 'undefined' && value.phone !== 'null';
    
    if (!hasEmail && !hasPhone) {
      throw new Error('Either email or phone is required');
    }
    return true;
  })
];

// Helper function to generate JWT token
const generateToken = (partnerId, deviceId = null) => {
  return jwt.sign(
    { partnerId, deviceId, type: 'partner' },
    process.env.JWT_SECRET || 'clutch_secret_key',
    { expiresIn: '7d' }
  );
};

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/v1/partners/validate-id
// @desc    Validate partner ID and return partner metadata
// @access  Public
router.post('/validate-id', validatePartnerId, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.body;

    // First check if partner exists in PartnerUser collection
    let partner = await PartnerUser.findByPartnerId(partnerId);
    
    // If not found in PartnerUser, check main partners collection
    if (!partner) {
      const { getCollection } = require('../config/database');
      const partnersCollection = await getCollection('partners');
      
      const mainPartner = await partnersCollection.findOne({ partnerId });
      if (!mainPartner) {
        return res.status(404).json({
          success: false,
          message: 'Partner ID not found'
        });
      }

      // Return basic partner info from main collection
      const partnerData = {
        partnerId: mainPartner.partnerId,
        businessName: mainPartner.name,
        partnerType: mainPartner.type,
        businessAddress: {
          street: mainPartner.addresses?.[0]?.line1 || '',
          city: mainPartner.addresses?.[0]?.city || '',
          state: mainPartner.addresses?.[0]?.state || '',
          zipCode: mainPartner.addresses?.[0]?.postalCode || '',
          country: mainPartner.addresses?.[0]?.country || 'Egypt'
        },
        workingHours: {},
        businessSettings: {},
        status: mainPartner.status || 'active',
        isVerified: false,
        appPreferences: {
          language: 'ar',
          theme: 'light',
          notifications: {
            orders: true,
            payments: true,
            updates: true
          }
        }
      };

      return res.json({
        success: true,
        message: 'Partner ID validated successfully',
        data: { partner: partnerData },
        needsSignup: true // Indicate that partner needs to create user account
      });
    }

    // If partner exists in PartnerUser collection, check status
    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Partner account is not active',
        status: partner.status
      });
    }

    // Return partner metadata without sensitive information
    const partnerData = {
      partnerId: partner.partnerId,
      businessName: partner.businessName,
      partnerType: partner.partnerType,
      businessAddress: partner.businessAddress,
      workingHours: partner.workingHours,
      businessSettings: partner.businessSettings,
      status: partner.status,
      isVerified: partner.isVerified,
      appPreferences: partner.appPreferences
    };

    res.json({
      success: true,
      message: 'Partner ID validated successfully',
      data: { partner: partnerData }
    });

  } catch (error) {
    logger.error('Partner ID validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/auth/signup
// @desc    Partner signup/registration for existing partners
// @access  Public
router.post('/auth/signup', validatePartnerSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      partnerId,
      email,
      phone,
      password,
      role = 'partner_owner' // Default to owner for first user
    } = req.body;

    // Clean up undefined values
    const cleanEmail = email && email !== 'undefined' && email !== 'null' ? email : null;
    const cleanPhone = phone && phone !== 'undefined' && phone !== 'null' ? phone : null;
    
    // Ensure we have either email or phone
    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: 'Either email or phone number is required for registration'
      });
    }

    console.log('🔐 Partner signup attempt:', { partnerId, email: cleanEmail, phone: cleanPhone });

    // First, verify that the partner exists in the main partners collection
    const { getCollection } = require('../config/database');
    const partnersCollection = await getCollection('partners');
    
    console.log('🔍 Looking up partner:', partnerId);
    const startTime = Date.now();
    const existingPartnerRecord = await partnersCollection.findOne({
      partnerId: partnerId
    });
    console.log(`⏱️ Partner lookup took: ${Date.now() - startTime}ms`);

    if (!existingPartnerRecord) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found. Please contact the sales team to set up your partner account first.'
      });
    }

    // Check if this specific email or phone already exists (allow multiple users per partner)
    console.log('🔍 Checking for existing user...');
    const userCheckStart = Date.now();
    const existingPartnerUser = await PartnerUser.findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail.toLowerCase() }] : []),
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });
    console.log(`⏱️ User check took: ${Date.now() - userCheckStart}ms`);

    if (existingPartnerUser) {
      return res.status(409).json({
        success: false,
        message: 'User account with this email or phone already exists. Please use the sign in option.'
      });
    }

    // Check if there are existing users for this partner
    const existingUsers = await PartnerUser.find({ partnerId });
    const hasOwner = existingUsers.some(user => user.role === 'partner_owner');

    // If there are existing users and we have an owner, create approval request
    if (existingUsers.length > 0 && hasOwner) {
      const PartnerUserApproval = require('../models/PartnerUserApproval');
      
      // Create approval request
      const approvalRequest = new PartnerUserApproval({
        partnerId,
        requesterEmail: cleanEmail?.toLowerCase() || '',
        requesterPhone: cleanPhone || '',
        requesterName: cleanEmail || cleanPhone, // Use email or phone as identifier
        requestedRole: role,
        requestedPermissions: [], // Will be set based on role
        businessJustification: `New team member request for ${existingPartnerRecord.name}`,
        status: 'pending'
      });

      await approvalRequest.save();

      // Send notification to partner owner
      await approvalRequest.sendOwnerNotification();

      return res.status(202).json({
        success: true,
        message: 'Registration request submitted for approval. The partner owner will review your request.',
        data: {
          approvalId: approvalRequest._id,
          status: 'pending_approval',
          estimatedResponseTime: '24-48 hours'
        }
      });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    // Create partner user account using data from partners collection
    console.log('👤 Creating new partner user...');
    const newPartnerUser = new PartnerUser({
      partnerId,
      email: cleanEmail?.toLowerCase() || '',
      phone: cleanPhone || '',
      password: hashedPassword,
      businessName: existingPartnerRecord.name,
      ownerName: existingPartnerRecord.primaryContact?.name || 'Partner User',
      partnerType: existingPartnerRecord.type,
      role: role, // Include the role field
      businessAddress: {
        street: existingPartnerRecord.addresses?.[0]?.line1 || '',
        city: existingPartnerRecord.addresses?.[0]?.city || '',
        state: existingPartnerRecord.addresses?.[0]?.state || '',
        zipCode: existingPartnerRecord.addresses?.[0]?.zipCode || ''
      },
      workingHours: existingPartnerRecord.workingHours || {},
      businessSettings: existingPartnerRecord.settings || {},
      status: 'active',
      isVerified: false,
      isLocked: false,
      loginAttempts: 0,
      lastLogin: null,
      appPreferences: {
        language: 'ar',
        theme: 'light',
        notifications: {
          orders: true,
          payments: true,
          updates: true
        }
      }
    });

    console.log('💾 Saving new partner user to database...');
    await newPartnerUser.save();
    console.log('✅ Partner user account created successfully:', partnerId);

    // Generate token
    const token = generateToken(partnerId);

    // Remove password from response
    const partnerData = newPartnerUser.toObject();
    delete partnerData.password;
    delete partnerData.verificationCode;

    res.status(201).json({
      success: true,
      message: 'Partner account created successfully',
      data: {
        partner: partnerData,
        token,
        signupMethod: cleanEmail ? 'email' : 'phone'
      }
    });

  } catch (error) {
    console.error('❌ Partner signup error:', error);
    console.error('❌ Error stack:', error.stack);
    logger.error('Partner signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/v1/partners/:partnerId/register-device
// @desc    Register device with partner account
// @access  Public
router.post('/:partnerId/register-device', validateDeviceRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.params;
    const {
      deviceId,
      deviceName,
      deviceType,
      platform,
      version,
      hardware,
      software,
      network,
      location,
      configuration,
      capabilities,
      settings
    } = req.body;

    // Verify partner exists and is active
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Partner account is not active'
      });
    }

    // Check if device already exists
    let device = await PartnerDevice.findByDeviceId(deviceId);
    if (device) {
      if (device.partnerId !== partnerId) {
        return res.status(409).json({
          success: false,
          message: 'Device is already registered with another partner'
        });
      }
      
      // Update existing device
      device.deviceName = deviceName;
      device.deviceType = deviceType;
      device.platform = platform;
      device.version = version;
      device.hardware = hardware || device.hardware;
      device.software = software || device.software;
      device.network = network || device.network;
      device.location = location || device.location;
      device.configuration = configuration || device.configuration;
      device.capabilities = capabilities || device.capabilities;
      device.settings = settings || device.settings;
      device.status = 'active';
      
      await device.save();
    } else {
      // Create new device
      device = new PartnerDevice({
        deviceId,
        partnerId,
        deviceName,
        deviceType,
        platform,
        version,
        hardware: hardware || {},
        software: software || {},
        network: network || {},
        location: location || {},
        configuration: configuration || {},
        capabilities: capabilities || {},
        settings: settings || {},
        status: 'active'
      });
      
      await device.save();
    }

    // Register the device
    await device.register(partner._id);

    // Generate device token
    const deviceToken = generateToken(partnerId, deviceId);

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: {
        device: {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          deviceType: device.deviceType,
          platform: device.platform,
          status: device.status,
          isRegistered: device.isRegistered,
          configuration: device.configuration
        },
        deviceToken
      }
    });

  } catch (error) {
    logger.error('Device registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/auth/partner-login
// @desc    Partner user login
// @access  Public
router.post('/auth/partner-login', validatePartnerLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { emailOrPhone, password, deviceId } = req.body;

    // Find partner by email or phone
    let partner;
    if (emailOrPhone.includes('@')) {
      partner = await PartnerUser.findByEmail(emailOrPhone);
    } else {
      partner = await PartnerUser.findByPhone(emailOrPhone);
    }

    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (partner.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      await partner.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if partner is active
    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Reset login attempts and update last login
    await partner.resetLoginAttempts();
    partner.lastLogin = new Date();
    await partner.save();

    // Generate token
    const token = generateToken(partner.partnerId, deviceId);

    // Remove password from response
    const partnerData = partner.toObject();
    delete partnerData.password;
    delete partnerData.verificationCode;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        partner: partnerData,
        token
      }
    });

  } catch (error) {
    logger.error('Partner login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/auth/partner-otp
// @desc    Partner OTP login/verification
// @access  Public
router.post('/auth/partner-otp', validateOTP, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { emailOrPhone, otp, deviceId } = req.body;

    // Find partner by email or phone
    let partner;
    if (emailOrPhone.includes('@')) {
      partner = await PartnerUser.findByEmail(emailOrPhone);
    } else {
      partner = await PartnerUser.findByPhone(emailOrPhone);
    }

    if (!partner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if partner is active
    if (partner.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // For now, accept any 6-digit OTP (in production, implement proper OTP verification)
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Update last login
    partner.lastLogin = new Date();
    await partner.save();

    // Generate token
    const token = generateToken(partner.partnerId, deviceId);

    // Remove password from response
    const partnerData = partner.toObject();
    delete partnerData.password;
    delete partnerData.verificationCode;

    res.json({
      success: true,
      message: 'OTP verification successful',
      data: {
        partner: partnerData,
        token
      }
    });

  } catch (error) {
    logger.error('Partner OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/auth/refresh-token
// @desc    Refresh partner token
// @access  Private
router.post('/auth/refresh-token', authenticateToken, async (req, res) => {
  try {
    const { partnerId, deviceId } = req.user;

    // Verify partner still exists and is active
    const partner = await PartnerUser.findByPartnerId(partnerId);
    if (!partner || partner.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Partner not found or inactive'
      });
    }

    // Generate new token
    const token = generateToken(partnerId, deviceId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/auth/logout
// @desc    Partner logout
// @access  Private
router.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    // In a production system, you would invalidate the token
    // For now, just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
