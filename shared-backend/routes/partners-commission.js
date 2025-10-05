const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Commission Types
const COMMISSION_TYPES = {
  ORDER_COMPLETION: 'order_completion',
  SERVICE_PROVISION: 'service_provision',
  REFERRAL: 'referral',
  PERFORMANCE_BONUS: 'performance_bonus',
  LOYALTY_BONUS: 'loyalty_bonus',
  MONTHLY_BONUS: 'monthly_bonus'
};

// Commission Status
const COMMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

// Get commission summary
router.get('/commission/summary', auth, async (req, res) => {
  try {
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
    const commissionsCollection = await getCollection('partnerCommissions');
    
    const summary = await commissionsCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: '$amount' },
          pendingCommissions: {
            $sum: { $cond: [{ $eq: ['$status', COMMISSION_STATUS.PENDING] }, '$amount', 0] }
          },
          approvedCommissions: {
            $sum: { $cond: [{ $eq: ['$status', COMMISSION_STATUS.APPROVED] }, '$amount', 0] }
          },
          paidCommissions: {
            $sum: { $cond: [{ $eq: ['$status', COMMISSION_STATUS.PAID] }, '$amount', 0] }
          },
          totalCount: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', COMMISSION_STATUS.PENDING] }, 1, 0] }
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', COMMISSION_STATUS.APPROVED] }, 1, 0] }
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', COMMISSION_STATUS.PAID] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const commissionSummary = summary[0] || {
      totalCommissions: 0,
      pendingCommissions: 0,
      approvedCommissions: 0,
      paidCommissions: 0,
      totalCount: 0,
      pendingCount: 0,
      approvedCount: 0,
      paidCount: 0
    };

    // Get commission breakdown by type
    const typeBreakdown = await commissionsCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        summary: commissionSummary,
        typeBreakdown,
        period,
        startDate,
        endDate: now
      },
      message: 'Commission summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching commission summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission summary',
      error: error.message
    });
  }
});

// Get commission history
router.get('/commission/history', auth, async (req, res) => {
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
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(COMMISSION_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (type && Object.values(COMMISSION_TYPES).includes(type)) {
      query.type = type;
    }

    if (dateFrom) {
      query.createdAt = { ...query.createdAt, $gte: new Date(dateFrom) };
    }

    if (dateTo) {
      query.createdAt = { ...query.createdAt, $lte: new Date(dateTo) };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const commissionsCollection = await getCollection('partnerCommissions');
    
    const commissions = await commissionsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await commissionsCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        commissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Commission history retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching commission history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission history',
      error: error.message
    });
  }
});

// Get commission by ID
router.get('/commission/:id', auth, async (req, res) => {
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
    const commissionsCollection = await getCollection('partnerCommissions');
    
    const commission = await commissionsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    res.json({
      success: true,
      data: commission,
      message: 'Commission retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching commission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission',
      error: error.message
    });
  }
});

// Get commission breakdown
router.get('/commission/breakdown', auth, async (req, res) => {
  try {
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
    const commissionsCollection = await getCollection('partnerCommissions');
    
    // Get daily commission trends
    const dailyTrends = await commissionsCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate },
          status: COMMISSION_STATUS.PAID
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]).toArray();

    // Get commission by type
    const typeBreakdown = await commissionsCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]).toArray();

    // Get commission by status
    const statusBreakdown = await commissionsCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        dailyTrends,
        typeBreakdown,
        statusBreakdown,
        period,
        startDate,
        endDate: now
      },
      message: 'Commission breakdown retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching commission breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission breakdown',
      error: error.message
    });
  }
});

// Get commission rates
router.get('/commission/rates', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get partner's tier for commission rates
    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    const loyalty = await loyaltyCollection.findOne({
      partnerId: partner.partnerId
    });

    const tier = loyalty?.tier || 'bronze';

    // Define commission rates by tier
    const commissionRates = {
      bronze: {
        orderCompletion: 0.05, // 5%
        serviceProvision: 0.08, // 8%
        referral: 0.10, // 10%
        performanceBonus: 0.02, // 2%
        loyaltyBonus: 0.01, // 1%
        monthlyBonus: 0.03 // 3%
      },
      silver: {
        orderCompletion: 0.06, // 6%
        serviceProvision: 0.09, // 9%
        referral: 0.12, // 12%
        performanceBonus: 0.03, // 3%
        loyaltyBonus: 0.02, // 2%
        monthlyBonus: 0.04 // 4%
      },
      gold: {
        orderCompletion: 0.07, // 7%
        serviceProvision: 0.10, // 10%
        referral: 0.15, // 15%
        performanceBonus: 0.04, // 4%
        loyaltyBonus: 0.03, // 3%
        monthlyBonus: 0.05 // 5%
      },
      platinum: {
        orderCompletion: 0.08, // 8%
        serviceProvision: 0.12, // 12%
        referral: 0.18, // 18%
        performanceBonus: 0.05, // 5%
        loyaltyBonus: 0.04, // 4%
        monthlyBonus: 0.06 // 6%
      }
    };

    const rates = commissionRates[tier] || commissionRates.bronze;

    res.json({
      success: true,
      data: {
        tier,
        rates,
        nextTier: getNextTier(tier),
        requirements: getTierRequirements(tier)
      },
      message: 'Commission rates retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching commission rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission rates',
      error: error.message
    });
  }
});

// Calculate commission
router.post('/commission/calculate', [
  auth,
  body('type').isIn(Object.values(COMMISSION_TYPES)).withMessage('Invalid commission type'),
  body('baseAmount').isNumeric().withMessage('Base amount must be numeric'),
  body('orderId').optional().isString().withMessage('Order ID must be string'),
  body('serviceId').optional().isString().withMessage('Service ID must be string'),
  body('description').optional().isString().withMessage('Description must be string')
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

    const { type, baseAmount, orderId, serviceId, description } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get partner's commission rates
    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    const loyalty = await loyaltyCollection.findOne({
      partnerId: partner.partnerId
    });

    const tier = loyalty?.tier || 'bronze';
    const commissionRates = getCommissionRates(tier);
    const rate = commissionRates[type] || 0;

    const commissionAmount = baseAmount * rate;
    const netAmount = commissionAmount; // Could apply additional deductions here

    res.json({
      success: true,
      data: {
        type,
        baseAmount,
        rate,
        commissionAmount,
        netAmount,
        tier,
        description
      },
      message: 'Commission calculated successfully'
    });
  } catch (error) {
    logger.error('Error calculating commission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate commission',
      error: error.message
    });
  }
});

// Helper functions
function getCommissionRates(tier) {
  const rates = {
    bronze: {
      orderCompletion: 0.05,
      serviceProvision: 0.08,
      referral: 0.10,
      performanceBonus: 0.02,
      loyaltyBonus: 0.01,
      monthlyBonus: 0.03
    },
    silver: {
      orderCompletion: 0.06,
      serviceProvision: 0.09,
      referral: 0.12,
      performanceBonus: 0.03,
      loyaltyBonus: 0.02,
      monthlyBonus: 0.04
    },
    gold: {
      orderCompletion: 0.07,
      serviceProvision: 0.10,
      referral: 0.15,
      performanceBonus: 0.04,
      loyaltyBonus: 0.03,
      monthlyBonus: 0.05
    },
    platinum: {
      orderCompletion: 0.08,
      serviceProvision: 0.12,
      referral: 0.18,
      performanceBonus: 0.05,
      loyaltyBonus: 0.04,
      monthlyBonus: 0.06
    }
  };
  return rates[tier] || rates.bronze;
}

function getNextTier(currentTier) {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

function getTierRequirements(tier) {
  const requirements = {
    bronze: {
      points: 0,
      orders: 0,
      rating: 0
    },
    silver: {
      points: 1000,
      orders: 50,
      rating: 4.0
    },
    gold: {
      points: 5000,
      orders: 200,
      rating: 4.5
    },
    platinum: {
      points: 15000,
      orders: 500,
      rating: 4.8
    }
  };
  return requirements[tier] || requirements.bronze;
}

module.exports = router;
