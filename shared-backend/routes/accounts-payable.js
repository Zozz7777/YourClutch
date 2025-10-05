const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const Vendor = require('../models/Vendor');
const Bill = require('../models/Bill');
const VendorPayment = require('../models/VendorPayment');

// Rate limiting for AP operations
const apRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many AP requests from this IP, please try again later.'
});

// GET /api/v1/ap/vendors - List all vendors
router.get('/vendors', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), apRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('industry').optional().isString().withMessage('Industry must be a string'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, search, industry, isActive } = req.query;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { vendorName: { $regex: search, $options: 'i' } },
        { 'contactInfo.primaryContact.email': { $regex: search, $options: 'i' } }
      ];
    }
    if (industry) query['businessInfo.industry'] = industry;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort({ vendorName: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Vendor.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching vendors:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendors', error: error.message });
  }
});

// POST /api/v1/ap/vendors - Create vendor
router.post('/vendors', authenticateToken, checkRole(['head_administrator', 'finance_officer']), apRateLimit, [
  body('vendorName').notEmpty().withMessage('Vendor name is required'),
  body('contactInfo.primaryContact.email').isEmail().withMessage('Valid email is required'),
  body('businessInfo.businessType').isIn(['individual', 'company', 'partnership', 'corporation']).withMessage('Invalid business type'),
  body('paymentTerms.defaultTerms').isIn(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom']).withMessage('Invalid payment terms')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const vendorData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const newVendor = new Vendor(vendorData);
    await newVendor.save();

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: newVendor
    });
  } catch (error) {
    logger.error('Error creating vendor:', error);
    res.status(500).json({ success: false, message: 'Failed to create vendor', error: error.message });
  }
});

// GET /api/v1/ap/vendors/:id/aging - Vendor aging report
router.get('/vendors/:id/aging', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), apRateLimit, [
  param('id').isMongoId().withMessage('Invalid vendor ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;

    // Get vendor
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Get aging data
    const agingData = await Bill.aggregate([
      { $match: { vendorId: id, status: { $in: ['sent', 'partial', 'overdue'] } } },
      {
        $group: {
          _id: null,
          current: {
            $sum: {
              $cond: [
                { $lte: [{ $subtract: [new Date(), '$dueDate'] }, 0] },
                '$amountDue',
                0
              ]
            }
          },
          days30: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $subtract: [new Date(), '$dueDate'] }, 0] },
                    { $lte: [{ $subtract: [new Date(), '$dueDate'] }, 30] }
                  ]
                },
                '$amountDue',
                0
              ]
            }
          },
          days60: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $subtract: [new Date(), '$dueDate'] }, 30] },
                    { $lte: [{ $subtract: [new Date(), '$dueDate'] }, 60] }
                  ]
                },
                '$amountDue',
                0
              ]
            }
          },
          days90: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: [{ $subtract: [new Date(), '$dueDate'] }, 60] },
                    { $lte: [{ $subtract: [new Date(), '$dueDate'] }, 90] }
                  ]
                },
                '$amountDue',
                0
              ]
            }
          },
          over90: {
            $sum: {
              $cond: [
                { $gt: [{ $subtract: [new Date(), '$dueDate'] }, 90] },
                '$amountDue',
                0
              ]
            }
          },
          total: { $sum: '$amountDue' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        vendor: {
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
          outstandingBalance: vendor.financials.outstandingBalance
        },
        aging: agingData[0] || {
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          over90: 0,
          total: 0
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching vendor aging:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor aging', error: error.message });
  }
});

// GET /api/v1/ap/bills - List all bills
router.get('/bills', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), apRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('vendorId').optional().isMongoId().withMessage('Invalid vendor ID'),
  query('status').optional().isIn(['draft', 'sent', 'received', 'partial', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, vendorId, status, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (startDate || endDate) {
      query.billDate = {};
      if (startDate) query.billDate.$gte = new Date(startDate);
      if (endDate) query.billDate.$lte = new Date(endDate);
    }
    if (vendorId) query.vendorId = vendorId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [bills, total] = await Promise.all([
      Bill.find(query)
        .sort({ billDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Bill.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching bills:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bills', error: error.message });
  }
});

// POST /api/v1/ap/bills - Create bill
router.post('/bills', authenticateToken, checkRole(['head_administrator', 'finance_officer']), apRateLimit, [
  body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
  body('billDate').isISO8601().withMessage('Valid bill date is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Get vendor info
    const vendor = await Vendor.findById(req.body.vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const billData = {
      ...req.body,
      vendorName: vendor.vendorName,
      createdBy: req.user.userId
    };

    const newBill = new Bill(billData);
    await newBill.save();

    // Update vendor financials
    await Vendor.findByIdAndUpdate(req.body.vendorId, {
      $inc: {
        'financials.outstandingBalance': newBill.total,
        'financials.totalPurchases': newBill.total
      },
      $set: {
        'financials.lastPurchaseDate': new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: newBill
    });
  } catch (error) {
    logger.error('Error creating bill:', error);
    res.status(500).json({ success: false, message: 'Failed to create bill', error: error.message });
  }
});

// GET /api/v1/ap/bills/overdue - Get overdue bills
router.get('/bills/overdue', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), apRateLimit, async (req, res) => {
  try {
    const overdueBills = await Bill.find({
      status: { $in: ['sent', 'partial'] },
      dueDate: { $lt: new Date() }
    })
    .sort({ dueDate: 1 })
    .lean();

    const totalOverdue = overdueBills.reduce((sum, bill) => sum + bill.amountDue, 0);

    res.json({
      success: true,
      data: {
        bills: overdueBills,
        totalOverdue,
        count: overdueBills.length
      }
    });
  } catch (error) {
    logger.error('Error fetching overdue bills:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overdue bills', error: error.message });
  }
});

// POST /api/v1/ap/payments - Record vendor payment
router.post('/payments', authenticateToken, checkRole(['head_administrator', 'finance_officer']), apRateLimit, [
  body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
  body('billIds').isArray().withMessage('Bill IDs must be an array'),
  body('billIds.*').isMongoId().withMessage('Each bill ID must be a valid Mongo ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentDate').isISO8601().withMessage('Valid payment date is required'),
  body('paymentMethod').isIn(['bank_transfer', 'check', 'cash', 'credit_card', 'digital_wallet', 'other']).withMessage('Invalid payment method'),
  body('referenceNumber').notEmpty().withMessage('Reference number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { vendorId, billIds, amount, paymentDate, paymentMethod, referenceNumber } = req.body;

    // Get vendor info
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Create payment
    const paymentData = {
      vendorId,
      vendorName: vendor.vendorName,
      billIds,
      paymentDate: new Date(paymentDate),
      amount,
      paymentMethod,
      referenceNumber,
      status: 'completed',
      createdBy: req.user.userId
    };

    const newPayment = new VendorPayment(paymentData);
    await newPayment.save();

    // Update bills
    await Bill.updateMany(
      { _id: { $in: billIds } },
      { 
        $inc: { amountPaid: amount },
        $push: { payments: { paymentId: newPayment.paymentId, amount, paymentDate: new Date(paymentDate), paymentMethod, reference: referenceNumber } }
      }
    );

    // Update vendor financials
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: {
        'financials.outstandingBalance': -amount,
        'financials.creditUsed': -amount
      },
      $set: {
        'financials.lastPaymentDate': new Date()
      },
      $push: {
        paymentHistory: {
          paymentId: newPayment.paymentId,
          amount,
          paymentDate: new Date(paymentDate),
          paymentMethod,
          reference: referenceNumber
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vendor payment recorded successfully',
      data: newPayment
    });
  } catch (error) {
    logger.error('Error recording vendor payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record vendor payment', error: error.message });
  }
});

module.exports = router;
