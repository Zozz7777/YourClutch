const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Promotion Types
const PROMOTION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  BUY_ONE_GET_ONE: 'buy_one_get_one',
  FREE_SHIPPING: 'free_shipping',
  GIFT_WITH_PURCHASE: 'gift_with_purchase'
};

// Promotion Status
const PROMOTION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Create promotion
router.post('/promotions', [
  auth,
  body('name').notEmpty().withMessage('Promotion name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(Object.values(PROMOTION_TYPES)).withMessage('Invalid promotion type'),
  body('value').isNumeric().withMessage('Value must be numeric'),
  body('startDate').isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').isISO8601().withMessage('End date must be valid ISO date'),
  body('minOrderAmount').optional().isNumeric().withMessage('Minimum order amount must be numeric'),
  body('maxUses').optional().isNumeric().withMessage('Maximum uses must be numeric'),
  body('maxUsesPerCustomer').optional().isNumeric().withMessage('Max uses per customer must be numeric'),
  body('applicableServices').optional().isArray().withMessage('Applicable services must be array'),
  body('terms').optional().isString().withMessage('Terms must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const {
      name,
      description,
      type,
      value,
      startDate,
      endDate,
      minOrderAmount,
      maxUses,
      maxUsesPerCustomer = 1,
      applicableServices = [],
      terms
    } = req.body;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Generate unique promo code
    const promoCode = generatePromoCode(name);

    const promotion = {
      partnerId: partner.partnerId,
      name,
      description,
      type,
      value: parseFloat(value),
      promoCode,
      startDate: start,
      endDate: end,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      maxUsesPerCustomer: parseInt(maxUsesPerCustomer),
      applicableServices,
      terms,
      status: PROMOTION_STATUS.DRAFT,
      usage: {
        totalUses: 0,
        uniqueCustomers: 0,
        totalDiscount: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { getCollection } = require('../config/database');
    const promotionsCollection = await getCollection('partnerPromotions');
    const result = await promotionsCollection.insertOne(promotion);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...promotion
      },
      message: 'Promotion created successfully'
    });
  } catch (error) {
    logger.error('Error creating promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotion',
      error: error.message
    });
  }
});

// Get promotions
router.get('/promotions', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      type = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(PROMOTION_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (type && Object.values(PROMOTION_TYPES).includes(type)) {
      query.type = type;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const promotionsCollection = await getCollection('partnerPromotions');
    
    const promotions = await promotionsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await promotionsCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        promotions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Promotions retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching promotions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotions',
      error: error.message
    });
  }
});

// Get promotion by ID
router.get('/promotions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const promotionsCollection = await getCollection('partnerPromotions');
    
    const promotion = await promotionsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      data: promotion,
      message: 'Promotion retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching promotion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion',
      error: error.message
    });
  }
});

// Update promotion status
router.patch('/promotions/:id/status', [
  auth,
  body('status').isIn(Object.values(PROMOTION_STATUS)).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const promotionsCollection = await getCollection('partnerPromotions');
    
    const promotion = await promotionsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      [PROMOTION_STATUS.DRAFT]: [PROMOTION_STATUS.ACTIVE, PROMOTION_STATUS.CANCELLED],
      [PROMOTION_STATUS.ACTIVE]: [PROMOTION_STATUS.PAUSED, PROMOTION_STATUS.EXPIRED],
      [PROMOTION_STATUS.PAUSED]: [PROMOTION_STATUS.ACTIVE, PROMOTION_STATUS.CANCELLED],
      [PROMOTION_STATUS.EXPIRED]: [],
      [PROMOTION_STATUS.CANCELLED]: []
    };

    if (!validTransitions[promotion.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${promotion.status} to ${status}`
      });
    }

    await promotionsCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        } 
      }
    );

    res.json({
      success: true,
      message: 'Promotion status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating promotion status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotion status',
      error: error.message
    });
  }
});

// Validate promo code
router.post('/promotions/validate', [
  auth,
  body('promoCode').notEmpty().withMessage('Promo code is required'),
  body('orderAmount').isNumeric().withMessage('Order amount must be numeric'),
  body('customerId').optional().isString().withMessage('Customer ID must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { promoCode, orderAmount, customerId } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const promotionsCollection = await getCollection('partnerPromotions');
    
    const promotion = await promotionsCollection.findOne({
      partnerId: partner.partnerId,
      promoCode: promoCode.toUpperCase(),
      status: PROMOTION_STATUS.ACTIVE,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check minimum order amount
    if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ${promotion.minOrderAmount} EGP required`
      });
    }

    // Check maximum uses
    if (promotion.maxUses && promotion.usage.totalUses >= promotion.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'Promotion has reached maximum usage limit'
      });
    }

    // Check customer usage limit
    if (customerId && promotion.maxUsesPerCustomer > 0) {
      const customerUsage = await promotionsCollection.countDocuments({
        _id: promotion._id,
        'usage.customerUses': { $elemMatch: { customerId, count: { $gte: promotion.maxUsesPerCustomer } } }
      });

      if (customerUsage > 0) {
        return res.status(400).json({
          success: false,
          message: 'Customer has reached maximum usage limit for this promotion'
        });
      }
    }

    // Calculate discount
    let discount = 0;
    switch (promotion.type) {
      case PROMOTION_TYPES.PERCENTAGE:
        discount = (orderAmount * promotion.value) / 100;
        break;
      case PROMOTION_TYPES.FIXED_AMOUNT:
        discount = Math.min(promotion.value, orderAmount);
        break;
      case PROMOTION_TYPES.FREE_SHIPPING:
        discount = 0; // Free shipping handled separately
        break;
      default:
        discount = 0;
    }

    res.json({
      success: true,
      data: {
        promotion: {
          id: promotion._id,
          name: promotion.name,
          type: promotion.type,
          value: promotion.value,
          discount
        },
        discount,
        finalAmount: Math.max(0, orderAmount - discount)
      },
      message: 'Promo code validated successfully'
    });
  } catch (error) {
    logger.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  }
});

// Apply promo code
router.post('/promotions/apply', [
  auth,
  body('promoCode').notEmpty().withMessage('Promo code is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('orderAmount').isNumeric().withMessage('Order amount must be numeric'),
  body('customerId').optional().isString().withMessage('Customer ID must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { promoCode, orderId, orderAmount, customerId } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const promotionsCollection = await getCollection('partnerPromotions');
    
    const promotion = await promotionsCollection.findOne({
      partnerId: partner.partnerId,
      promoCode: promoCode.toUpperCase(),
      status: PROMOTION_STATUS.ACTIVE,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check if already applied to this order
    const existingApplication = await promotionsCollection.findOne({
      'usage.applications': { $elemMatch: { orderId } }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already applied to this order'
      });
    }

    // Calculate discount
    let discount = 0;
    switch (promotion.type) {
      case PROMOTION_TYPES.PERCENTAGE:
        discount = (orderAmount * promotion.value) / 100;
        break;
      case PROMOTION_TYPES.FIXED_AMOUNT:
        discount = Math.min(promotion.value, orderAmount);
        break;
      case PROMOTION_TYPES.FREE_SHIPPING:
        discount = 0; // Free shipping handled separately
        break;
      default:
        discount = 0;
    }

    // Update promotion usage
    const application = {
      orderId,
      customerId,
      discount,
      appliedAt: new Date()
    };

    await promotionsCollection.updateOne(
      { _id: promotion._id },
      {
        $inc: {
          'usage.totalUses': 1,
          'usage.totalDiscount': discount
        },
        $push: {
          'usage.applications': application
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      data: {
        promotion: {
          id: promotion._id,
          name: promotion.name,
          type: promotion.type,
          value: promotion.value
        },
        discount,
        finalAmount: Math.max(0, orderAmount - discount)
      },
      message: 'Promo code applied successfully'
    });
  } catch (error) {
    logger.error('Error applying promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply promo code',
      error: error.message
    });
  }
});

// Get promotion analytics
router.get('/promotions/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d' // 7d, 30d, 90d, 1y
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    const promotionsCollection = await getCollection('partnerPromotions');
    
    const promotion = await promotionsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Filter applications by period
    const recentApplications = promotion.usage.applications.filter(app => 
      new Date(app.appliedAt) >= startDate
    );

    // Calculate analytics
    const totalUses = recentApplications.length;
    const totalDiscount = recentApplications.reduce((sum, app) => sum + app.discount, 0);
    const averageDiscount = totalUses > 0 ? totalDiscount / totalUses : 0;
    const uniqueCustomers = new Set(recentApplications.map(app => app.customerId)).size;

    // Daily usage trends
    const dailyUsage = {};
    recentApplications.forEach(app => {
      const date = app.appliedAt.toISOString().split('T')[0];
      dailyUsage[date] = (dailyUsage[date] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalUses,
        totalDiscount,
        averageDiscount: Math.round(averageDiscount * 100) / 100,
        uniqueCustomers,
        dailyUsage,
        period,
        startDate,
        endDate: now
      },
      message: 'Promotion analytics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching promotion analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promotion analytics',
      error: error.message
    });
  }
});

// Helper function to generate promo code
function generatePromoCode(name) {
  const prefix = name.replace(/[^A-Z0-9]/gi, '').substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
}

module.exports = router;
