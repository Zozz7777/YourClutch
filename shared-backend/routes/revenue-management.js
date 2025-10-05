const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const OrderRevenue = require('../models/OrderRevenue');
const PaymentCollection = require('../models/PaymentCollection');
const WeeklyPayout = require('../models/WeeklyPayout');
const DeliveryPartner = require('../models/DeliveryPartner');

// Rate limiting for revenue operations
const revenueRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many revenue requests from this IP, please try again later.'
});

// GET /api/v1/revenue/orders - List all orders with revenue details
router.get('/orders', authenticateToken, requirePermission('read_financial'), revenueRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('partnerId').optional().isMongoId().withMessage('Invalid partner ID'),
  query('paymentMethod').optional().isIn(['online', 'installments', 'cod_delivery', 'cod_team', 'cash_to_partner']).withMessage('Invalid payment method'),
  query('status').optional().isIn(['pending', 'received', 'settled', 'paid_out', 'disputed']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, partnerId, paymentMethod, status, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (partnerId) query.partnerId = partnerId;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      OrderRevenue.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      OrderRevenue.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching order revenues:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order revenues', error: error.message });
  }
});

// GET /api/v1/revenue/collections - Payment collections dashboard
router.get('/collections', authenticateToken, requirePermission('read_financial'), revenueRateLimit, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.collectionDate = dateFilter;
    }

    // Get collections summary
    const [
      totalCollections,
      collectionsByMethod,
      pendingCollections,
      recentCollections
    ] = await Promise.all([
      // Total collections
      PaymentCollection.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      
      // Collections by method
      PaymentCollection.aggregate([
        { $match: query },
        { $group: { _id: '$collectionMethod', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      
      // Pending collections
      PaymentCollection.find({ ...query, status: 'pending' })
        .sort({ collectionDate: -1 })
        .limit(10)
        .lean(),
      
      // Recent collections
      PaymentCollection.find({ ...query, status: { $in: ['collected', 'deposited', 'reconciled'] } })
        .sort({ collectionDate: -1 })
        .limit(10)
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalAmount: totalCollections[0]?.total || 0,
          totalCount: totalCollections[0]?.count || 0
        },
        byMethod: collectionsByMethod,
        pending: pendingCollections,
        recent: recentCollections
      }
    });
  } catch (error) {
    logger.error('Error fetching collections dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collections dashboard', error: error.message });
  }
});

// POST /api/v1/revenue/collections - Record payment collection
router.post('/collections', authenticateToken, requirePermission('read_financial'), revenueRateLimit, [
  body('orderIds').isArray().withMessage('Order IDs must be an array'),
  body('orderIds.*').isString().withMessage('Each order ID must be a string'),
  body('collectionMethod').isIn(['payment_gateway', 'delivery_partner', 'delivery_team', 'installment_provider', 'cash_from_partner']).withMessage('Invalid collection method'),
  body('collectorId').notEmpty().withMessage('Collector ID is required'),
  body('collectorName').notEmpty().withMessage('Collector name is required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('collectionDate').isISO8601().withMessage('Invalid collection date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const collectionData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const newCollection = new PaymentCollection(collectionData);
    await newCollection.save();

    // Update related order revenues
    await OrderRevenue.updateMany(
      { orderId: { $in: req.body.orderIds } },
      { 
        $set: { 
          status: 'received',
          settledDate: new Date(),
          updatedBy: req.user.userId
        }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Payment collection recorded successfully',
      data: newCollection
    });
  } catch (error) {
    logger.error('Error recording payment collection:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment collection', error: error.message });
  }
});

// GET /api/v1/revenue/analytics - Revenue analytics by payment method
router.get('/analytics', authenticateToken, requirePermission('read_financial'), revenueRateLimit, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'paymentMethod' } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    let groupField = '$paymentMethod';
    if (groupBy === 'partner') groupField = '$partnerId';
    else if (groupBy === 'orderType') groupField = '$orderType';
    else if (groupBy === 'moneyReceivedFrom') groupField = '$moneyReceivedFrom';

    const analytics = await OrderRevenue.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupField,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderAmount' },
          totalClutchRevenue: { $sum: '$clutchRevenue' },
          totalPartnerCommission: { $sum: '$partnerCommission' },
          totalFees: { $sum: '$totalFees' },
          averageOrderValue: { $avg: '$orderAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching revenue analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue analytics', error: error.message });
  }
});

// GET /api/v1/revenue/weekly-payout-summary - Weekly payout calculation
router.get('/weekly-payout-summary', authenticateToken, requirePermission('read_financial'), revenueRateLimit, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get revenue data for the period
    const revenueData = await OrderRevenue.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['received', 'settled'] }
        }
      },
      {
        $group: {
          _id: '$partnerId',
          partnerName: { $first: '$partnerId' }, // This would need to be populated from Partner model
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderAmount' },
          totalClutchRevenue: { $sum: '$clutchRevenue' },
          totalPartnerCommission: { $sum: '$partnerCommission' },
          totalFees: { $sum: '$totalFees' },
          cashPaidToPartner: { $sum: '$cashPaidToPartner' },
          cashReceivedFromPartner: { $sum: '$cashReceivedFromPartner' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Calculate totals
    const totals = revenueData.reduce((acc, partner) => {
      acc.totalOrders += partner.totalOrders;
      acc.totalRevenue += partner.totalRevenue;
      acc.totalClutchRevenue += partner.totalClutchRevenue;
      acc.totalPartnerCommission += partner.totalPartnerCommission;
      acc.totalFees += partner.totalFees;
      acc.totalCashPaidToPartner += partner.cashPaidToPartner;
      acc.totalCashReceivedFromPartner += partner.cashReceivedFromPartner;
      return acc;
    }, {
      totalOrders: 0,
      totalRevenue: 0,
      totalClutchRevenue: 0,
      totalPartnerCommission: 0,
      totalFees: 0,
      totalCashPaidToPartner: 0,
      totalCashReceivedFromPartner: 0
    });

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        partners: revenueData,
        totals
      }
    });
  } catch (error) {
    logger.error('Error fetching weekly payout summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weekly payout summary', error: error.message });
  }
});

// POST /api/v1/revenue/generate-payouts - Generate weekly partner payouts
router.post('/generate-payouts', authenticateToken, requirePermission('read_financial'), revenueRateLimit, [
  body('startDate').isISO8601().withMessage('Invalid start date format'),
  body('endDate').isISO8601().withMessage('Invalid end date format'),
  body('payoutDate').isISO8601().withMessage('Invalid payout date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, payoutDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get revenue data for the period
    const revenueData = await OrderRevenue.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['received', 'settled'] }
    });

    // Group by partner
    const partnerGroups = {};
    revenueData.forEach(revenue => {
      if (!partnerGroups[revenue.partnerId]) {
        partnerGroups[revenue.partnerId] = {
          partnerId: revenue.partnerId,
          orderIds: [],
          revenueIds: [],
          totalOrders: 0,
          totalRevenue: 0,
          totalClutchRevenue: 0,
          totalPartnerCommission: 0,
          totalFees: 0,
          cashPaidToPartner: 0,
          cashReceivedFromPartner: 0
        };
      }
      
      const group = partnerGroups[revenue.partnerId];
      group.orderIds.push(revenue.orderId);
      group.revenueIds.push(revenue.revenueId);
      group.totalOrders += 1;
      group.totalRevenue += revenue.orderAmount;
      group.totalClutchRevenue += revenue.clutchRevenue;
      group.totalPartnerCommission += revenue.partnerCommission;
      group.totalFees += revenue.totalFees;
      group.cashPaidToPartner += revenue.cashPaidToPartner;
      group.cashReceivedFromPartner += revenue.cashReceivedFromPartner;
    });

    // Create payouts
    const payouts = [];
    for (const partnerId in partnerGroups) {
      const data = partnerGroups[partnerId];
      
      const payout = new WeeklyPayout({
        payoutPeriod: { startDate: start, endDate: end },
        partnerId: data.partnerId,
        partnerName: `Partner ${data.partnerId}`, // This would need to be populated from Partner model
        orderIds: data.orderIds,
        revenueIds: data.revenueIds,
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        commissionCalculation: {
          clutchPercentage: 10, // This would come from partner financial settings
          partnerPercentage: 90,
          grossCommission: data.totalPartnerCommission,
          clutchRevenue: data.totalClutchRevenue,
          partnerCommission: data.totalPartnerCommission
        },
        deductions: [],
        totalDeductions: 0,
        netPayout: data.totalPartnerCommission,
        payoutMethod: 'bank_transfer',
        status: 'pending',
        scheduledDate: new Date(payoutDate),
        createdBy: req.user.userId
      });

      await payout.save();
      payouts.push(payout);
    }

    res.status(201).json({
      success: true,
      message: 'Weekly payouts generated successfully',
      data: payouts
    });
  } catch (error) {
    logger.error('Error generating weekly payouts:', error);
    res.status(500).json({ success: false, message: 'Failed to generate weekly payouts', error: error.message });
  }
});

// GET /api/v1/revenue/cash-flow - Complete cash flow tracking
router.get('/cash-flow', authenticateToken, requirePermission('read_financial'), revenueRateLimit, async (req, res) => {
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

    // Get cash flow data
    const [
      revenueInflow,
      expenseOutflow,
      netCashFlow
    ] = await Promise.all([
      // Revenue inflow
      OrderRevenue.aggregate([
        { $match: { ...query, status: { $in: ['received', 'settled'] } } },
        { $group: { _id: null, total: { $sum: '$clutchRevenue' } } }
      ]),
      
      // Expense outflow (this would need to be calculated from other expense models)
      // For now, we'll use a placeholder
      Promise.resolve([{ _id: null, total: 0 }]),
      
      // Net cash flow
      OrderRevenue.aggregate([
        { $match: { ...query, status: { $in: ['received', 'settled'] } } },
        { $group: { _id: null, total: { $sum: '$clutchRevenue' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        revenueInflow: revenueInflow[0]?.total || 0,
        expenseOutflow: expenseOutflow[0]?.total || 0,
        netCashFlow: netCashFlow[0]?.total || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching cash flow:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cash flow', error: error.message });
  }
});

module.exports = router;
