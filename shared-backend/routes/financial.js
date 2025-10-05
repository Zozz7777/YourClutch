const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { getCollection } = require('../config/database');
const PartnerFinancial = require('../models/PartnerFinancial');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const { v4: uuidv4 } = require('uuid');

// Rate limiting for financial operations
const financialRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many financial requests from this IP, please try again later.'
});

// GET /api/v1/financial/overview - Dashboard stats
router.get('/overview', authenticateToken, requirePermission('read_financial'), financialRateLimit, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // Get financial overview
    const [
      totalRevenue,
      totalCommissions,
      unpaidCommissions,
      totalPayouts,
      recentCommissions,
      revenueByPaymentMethod,
      commissionTrends
    ] = await Promise.all([
      // Total revenue from all partners
      PartnerFinancial.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$financials.totalRevenue' } } }
      ]),
      
      // Total commissions
      Commission.aggregate([
        { $match: { ...query, status: { $in: ['pending', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
      
      // Unpaid commissions
      Commission.aggregate([
        { $match: { ...query, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]),
      
      // Total payouts
      Payout.aggregate([
        { $match: { ...query, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Recent commissions
      Commission.find({ ...query, status: 'pending' })
        .populate('partnerId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Revenue by payment method
      Commission.aggregate([
        { $match: { ...query, status: 'paid' } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$orderAmount' } } },
        { $sort: { total: -1 } }
      ]),
      
      // Commission trends (last 12 months)
      Commission.aggregate([
        { $match: { ...query, status: 'paid' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$commissionAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    const overview = {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCommissions: totalCommissions[0]?.total || 0,
      unpaidCommissions: unpaidCommissions[0]?.total || 0,
      totalPayouts: totalPayouts[0]?.total || 0,
      recentCommissions,
      revenueByPaymentMethod,
      commissionTrends
    };

    res.json({
      success: true,
      data: overview,
      message: 'Financial overview retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch financial overview',
      message: error.message
    });
  }
});

// GET /api/v1/financial/partners - All partners with revenue/commission summary
router.get('/partners', authenticateToken, requirePermission('read_financial'), financialRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'financials.totalRevenue', sortOrder = 'desc' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { partnerId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const partners = await PartnerFinancial.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await PartnerFinancial.countDocuments(query);

    res.json({
      success: true,
      data: {
        partners,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Partners financial data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching partners financial data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch partners financial data',
      message: error.message
    });
  }
});

// GET /api/v1/financial/partners/:id - Detailed partner financial breakdown
router.get('/partners/:id', authenticateToken, requirePermission('read_financial'), financialRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Get partner financial data
    const partnerFinancial = await PartnerFinancial.findOne({ partnerId: id });
    if (!partnerFinancial) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found',
        message: 'Partner financial data not found'
      });
    }

    // Build date filter for commissions
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { partnerId: id };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // Get detailed commission data
    const [
      commissions,
      commissionStats,
      revenueByCategory,
      recentOrders
    ] = await Promise.all([
      // All commissions for this partner
      Commission.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      
      // Commission statistics
      Commission.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$commissionAmount' }
          }
        }
      ]),
      
      // Revenue by category
      Commission.aggregate([
        { $match: { ...query, status: 'paid' } },
        { $group: { _id: '$category', total: { $sum: '$orderAmount' } } },
        { $sort: { total: -1 } }
      ]),
      
      // Recent orders (last 10)
      Commission.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderId orderAmount commissionAmount status createdAt category')
        .lean()
    ]);

    const partnerData = {
      ...partnerFinancial,
      commissions,
      commissionStats,
      revenueByCategory,
      recentOrders
    };

    res.json({
      success: true,
      data: partnerData,
      message: 'Partner financial details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching partner financial details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch partner financial details',
      message: error.message
    });
  }
});

// PUT /api/v1/financial/partners/:id/commission - Update commission structure
router.put('/partners/:id/commission', authenticateToken, requirePermission('update_financial'), financialRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionStructure, vatApplicable, vatRate, clutchMarkupStrategy, markupPercentage } = req.body;

    const partnerFinancial = await PartnerFinancial.findOneAndUpdate(
      { partnerId: id },
      {
        commissionStructure,
        vatApplicable,
        vatRate,
        clutchMarkupStrategy,
        markupPercentage,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!partnerFinancial) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found',
        message: 'Partner financial data not found'
      });
    }

    res.json({
      success: true,
      data: partnerFinancial,
      message: 'Commission structure updated successfully'
    });
  } catch (error) {
    console.error('Error updating commission structure:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update commission structure',
      message: error.message
    });
  }
});

// GET /api/v1/financial/commissions - List all commissions with filters
router.get('/commissions', authenticateToken, requirePermission('read_financial'), financialRateLimit, async (req, res) => {
  try {
    const {
      partnerId = '',
      status = '',
      category = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (partnerId) query.partnerId = partnerId;
    if (status) query.status = status;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const commissions = await Commission.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Commission.countDocuments(query);

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
      message: 'Commissions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commissions',
      message: error.message
    });
  }
});

// POST /api/v1/financial/commissions/:id/pay - Mark commission as paid
router.post('/commissions/:id/pay', authenticateToken, requirePermission('update_financial'), financialRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { payoutId } = req.body;

    const commission = await Commission.findByIdAndUpdate(
      id,
      {
        status: 'paid',
        paidAt: new Date(),
        payoutId,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!commission) {
      return res.status(404).json({
        success: false,
        error: 'Commission not found',
        message: 'Commission not found'
      });
    }

    // Update partner financial totals
    await PartnerFinancial.findOneAndUpdate(
      { partnerId: commission.partnerId },
      {
        $inc: {
          'financials.unpaidCommission': -commission.commissionAmount,
          'financials.totalCommission': commission.commissionAmount
        },
        $set: { lastPayoutDate: new Date() }
      }
    );

    res.json({
      success: true,
      data: commission,
      message: 'Commission marked as paid successfully'
    });
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark commission as paid',
      message: error.message
    });
  }
});

// POST /api/v1/financial/payouts - Create bulk payout
router.post('/payouts', authenticateToken, requirePermission('create_financial'), financialRateLimit, async (req, res) => {
  try {
    const { partnerIds, method, scheduledDate, notes } = req.body;

    if (!partnerIds || !Array.isArray(partnerIds) || partnerIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid partner IDs',
        message: 'Please provide valid partner IDs'
      });
    }

    const payouts = [];

    for (const partnerId of partnerIds) {
      // Get unpaid commissions for this partner
      const unpaidCommissions = await Commission.find({
        partnerId,
        status: 'pending'
      });

      if (unpaidCommissions.length === 0) continue;

      const totalAmount = unpaidCommissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
      const commissionIds = unpaidCommissions.map(comm => comm.commissionId);

      // Create payout
      const payout = new Payout({
        partnerId,
        amount: totalAmount,
        commissionIds,
        method,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        status: 'pending',
        notes: notes || []
      });

      await payout.save();
      payouts.push(payout);
    }

    res.status(201).json({
      success: true,
      data: payouts,
      message: 'Payouts created successfully'
    });
  } catch (error) {
    console.error('Error creating payouts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payouts',
      message: error.message
    });
  }
});

// GET /api/v1/financial/revenue-by-payment-method - Revenue breakdown
router.get('/revenue-by-payment-method', authenticateToken, requirePermission('read_financial'), financialRateLimit, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = { status: 'paid' };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    const revenueByPaymentMethod = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          totalRevenue: { $sum: '$orderAmount' },
          totalCommissions: { $sum: '$commissionAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      data: revenueByPaymentMethod,
      message: 'Revenue by payment method retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching revenue by payment method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue by payment method',
      message: error.message
    });
  }
});

// GET /api/v1/financial/costs/referrals - Referral costs
router.get('/costs/referrals', authenticateToken, requirePermission('read_financial'), financialRateLimit, async (req, res) => {
  try {
    // This would integrate with referral tracking system
    // For now, return mock data structure
    const referralCosts = {
      totalReferralCosts: 0,
      totalReferrals: 0,
      averageCostPerReferral: 0,
      referralBreakdown: []
    };

    res.json({
      success: true,
      data: referralCosts,
      message: 'Referral costs retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching referral costs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch referral costs',
      message: error.message
    });
  }
});

// GET /api/v1/financial/costs/promocodes - Promo code costs
router.get('/costs/promocodes', authenticateToken, requirePermission('read_financial'), financialRateLimit, async (req, res) => {
  try {
    // This would integrate with promo code system
    // For now, return mock data structure
    const promocodeCosts = {
      totalPromocodeCosts: 0,
      totalPromocodesUsed: 0,
      averageDiscountPerCode: 0,
      promocodeBreakdown: []
    };

    res.json({
      success: true,
      data: promocodeCosts,
      message: 'Promo code costs retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching promo code costs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch promo code costs',
      message: error.message
    });
  }
});

module.exports = router;
