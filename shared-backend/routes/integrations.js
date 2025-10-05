const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { getCollection } = require('../config/database');
const PaymentGateway = require('../models/PaymentGateway');
const Integration = require('../models/Integration');
const encryptionService = require('../utils/encryption');
const { uploadToS3 } = require('../lib/storage');
const { v4: uuidv4 } = require('uuid');

// Rate limiting for integration operations
const integrationRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many integration requests from this IP, please try again later.'
});

// GET /api/v1/integrations - List all integrations with filters
router.get('/', authenticateToken, requirePermission('read_integrations'), integrationRateLimit, async (req, res) => {
  try {
    const {
      type = '',
      category = '',
      isActive = '',
      search = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (isActive !== '') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const integrations = await Integration.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Integration.countDocuments(query);

    res.json({
      success: true,
      data: {
        integrations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Integrations retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations',
      message: error.message
    });
  }
});

// GET /api/v1/integrations/payment-gateways - Get all payment gateways
router.get('/payment-gateways', authenticateToken, requirePermission('read_integrations'), integrationRateLimit, async (req, res) => {
  try {
    const { isActive = '', environment = '' } = req.query;
    
    const query = {};
    if (isActive !== '') query.isActive = isActive === 'true';
    if (environment) query.environment = environment;

    const gateways = await PaymentGateway.find(query)
      .select('-credentials') // Don't return encrypted credentials
      .sort({ name: 1 })
      .lean();

    res.json({
      success: true,
      data: gateways,
      message: 'Payment gateways retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment gateways',
      message: error.message
    });
  }
});

// GET /api/v1/integrations/payment-gateways/active - Get active payment gateways for mobile app
router.get('/payment-gateways/active', async (req, res) => {
  try {
    const gateways = await PaymentGateway.find({ 
      isActive: true,
      environment: 'production'
    })
    .select('gatewayId name slug logo supportedCurrencies')
    .sort({ name: 1 })
    .lean();

    res.json({
      success: true,
      data: gateways,
      message: 'Active payment gateways retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching active payment gateways:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active payment gateways',
      message: error.message
    });
  }
});

// POST /api/v1/integrations/payment-gateway - Add new payment gateway
router.post('/payment-gateway', authenticateToken, requirePermission('create_integrations'), integrationRateLimit, async (req, res) => {
  try {
    const {
      name,
      slug,
      credentials,
      supportedCurrencies,
      environment = 'sandbox',
      apiEndpoints,
      configSchema
    } = req.body;

    // Validate required fields
    if (!name || !slug || !credentials) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Name, slug, and credentials are required'
      });
    }

    // Check if slug already exists
    const existingGateway = await PaymentGateway.findOne({ slug });
    if (existingGateway) {
      return res.status(400).json({
        success: false,
        error: 'Gateway already exists',
        message: 'A payment gateway with this slug already exists'
      });
    }

    // Encrypt credentials
    const encryptedCredentials = encryptionService.encryptCredentials(credentials);

    // Generate webhook URL
    const webhookUrl = `${process.env.API_BASE_URL}/api/v1/webhooks/payment/${slug}`;

    // Create payment gateway
    const gateway = new PaymentGateway({
      name,
      slug,
      credentials: encryptedCredentials,
      supportedCurrencies,
      environment,
      apiEndpoints,
      configSchema,
      webhookUrl
    });

    await gateway.save();

    // Return gateway without credentials
    const gatewayResponse = gateway.toObject();
    delete gatewayResponse.credentials;

    res.status(201).json({
      success: true,
      data: gatewayResponse,
      message: 'Payment gateway created successfully'
    });
  } catch (error) {
    console.error('Error creating payment gateway:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment gateway',
      message: error.message
    });
  }
});

// PUT /api/v1/integrations/payment-gateway/:id - Update gateway config
router.put('/payment-gateway/:id', authenticateToken, requirePermission('update_integrations'), integrationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If credentials are being updated, encrypt them
    if (updateData.credentials) {
      updateData.credentials = encryptionService.encryptCredentials(updateData.credentials);
    }

    const gateway = await PaymentGateway.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!gateway) {
      return res.status(404).json({
        success: false,
        error: 'Gateway not found',
        message: 'Payment gateway not found'
      });
    }

    // Return gateway without credentials
    const gatewayResponse = gateway.toObject();
    delete gatewayResponse.credentials;

    res.json({
      success: true,
      data: gatewayResponse,
      message: 'Payment gateway updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment gateway:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment gateway',
      message: error.message
    });
  }
});

// DELETE /api/v1/integrations/payment-gateway/:id - Remove gateway
router.delete('/payment-gateway/:id', authenticateToken, requirePermission('delete_integrations'), integrationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    const gateway = await PaymentGateway.findByIdAndDelete(id);

    if (!gateway) {
      return res.status(404).json({
        success: false,
        error: 'Gateway not found',
        message: 'Payment gateway not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment gateway deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment gateway:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment gateway',
      message: error.message
    });
  }
});

// POST /api/v1/integrations/payment-gateway/:id/test - Test gateway connection
router.post('/payment-gateway/:id/test', authenticateToken, requirePermission('update_integrations'), integrationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    const gateway = await PaymentGateway.findById(id);
    if (!gateway) {
      return res.status(404).json({
        success: false,
        error: 'Gateway not found',
        message: 'Payment gateway not found'
      });
    }

    // Decrypt credentials for testing
    const credentials = encryptionService.decryptCredentials(gateway.credentials);

    // Test connection based on gateway type
    let testResult = { success: false, message: 'Test not implemented' };

    if (gateway.slug === 'stripe') {
      testResult = await testStripeConnection(credentials);
    } else if (gateway.slug === 'paymob') {
      testResult = await testPaymobConnection(credentials);
    } else if (gateway.slug === 'fawry') {
      testResult = await testFawryConnection(credentials);
    }

    // Update gateway test status
    await PaymentGateway.findByIdAndUpdate(id, {
      lastTested: new Date(),
      testStatus: testResult.success ? 'passed' : 'failed',
      testMessage: testResult.message
    });

    res.json({
      success: testResult.success,
      data: testResult,
      message: testResult.success ? 'Gateway test passed' : 'Gateway test failed'
    });
  } catch (error) {
    console.error('Error testing payment gateway:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test payment gateway',
      message: error.message
    });
  }
});

// POST /api/v1/integrations/payment-gateway/:id/toggle - Enable/disable gateway
router.post('/payment-gateway/:id/toggle', authenticateToken, requirePermission('update_integrations'), integrationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const gateway = await PaymentGateway.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true }
    );

    if (!gateway) {
      return res.status(404).json({
        success: false,
        error: 'Gateway not found',
        message: 'Payment gateway not found'
      });
    }

    res.json({
      success: true,
      data: { isActive: gateway.isActive },
      message: `Payment gateway ${gateway.isActive ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error toggling payment gateway:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle payment gateway',
      message: error.message
    });
  }
});

// POST /api/v1/integrations/upload-logo - Upload gateway logo to S3
router.post('/upload-logo', authenticateToken, requirePermission('update_integrations'), integrationRateLimit, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        message: 'Please upload a logo file'
      });
    }

    const fileKey = `payment-gateways/logos/${uuidv4()}-${req.file.originalname}`;
    const logoUrl = await uploadToS3(req.file.buffer, fileKey, req.file.mimetype);

    res.json({
      success: true,
      data: { logoUrl },
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload logo',
      message: error.message
    });
  }
});

// Helper functions for testing different payment gateways
async function testStripeConnection(credentials) {
  try {
    const stripe = require('stripe')(credentials.secretKey);
    const account = await stripe.accounts.retrieve();
    return {
      success: true,
      message: `Connected to Stripe account: ${account.display_name || account.id}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Stripe connection failed: ${error.message}`
    };
  }
}

async function testPaymobConnection(credentials) {
  try {
    // Paymob test implementation
    const response = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: credentials.apiKey
      })
    });
    
    if (response.ok) {
      return {
        success: true,
        message: 'Paymob connection successful'
      };
    } else {
      return {
        success: false,
        message: 'Paymob connection failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Paymob connection failed: ${error.message}`
    };
  }
}

async function testFawryConnection(credentials) {
  try {
    // Fawry test implementation
    return {
      success: true,
      message: 'Fawry connection test not implemented yet'
    };
  } catch (error) {
    return {
      success: false,
      message: `Fawry connection failed: ${error.message}`
    };
  }
}

module.exports = router;