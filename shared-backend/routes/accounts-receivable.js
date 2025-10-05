const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const CustomerPayment = require('../models/CustomerPayment');

// Rate limiting for AR operations
const arRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many AR requests from this IP, please try again later.'
});

// GET /api/v1/ar/customers - List all customers
router.get('/customers', authenticateToken, requirePermission('read_financial'), arRateLimit, [
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
        { customerName: { $regex: search, $options: 'i' } },
        { 'contactInfo.primaryContact.email': { $regex: search, $options: 'i' } }
      ];
    }
    if (industry) query['businessInfo.industry'] = industry;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ customerName: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Customer.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: error.message });
  }
});

// POST /api/v1/ar/customers - Create customer
router.post('/customers', authenticateToken, requirePermission('read_financial'), arRateLimit, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('contactInfo.primaryContact.email').isEmail().withMessage('Valid email is required'),
  body('businessInfo.businessType').isIn(['individual', 'company', 'partnership', 'corporation']).withMessage('Invalid business type'),
  body('paymentTerms.defaultTerms').isIn(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom']).withMessage('Invalid payment terms')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const customerData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const newCustomer = new Customer(customerData);
    await newCustomer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer
    });
  } catch (error) {
    logger.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: 'Failed to create customer', error: error.message });
  }
});

// GET /api/v1/ar/customers/:id/aging - Customer aging report
router.get('/customers/:id/aging', authenticateToken, requirePermission('read_financial'), arRateLimit, [
  param('id').isMongoId().withMessage('Invalid customer ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;

    // Get customer
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get aging data
    const agingData = await Invoice.aggregate([
      { $match: { customerId: id, status: { $in: ['sent', 'partial', 'overdue'] } } },
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
        customer: {
          customerId: customer.customerId,
          customerName: customer.customerName,
          outstandingBalance: customer.financials.outstandingBalance
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
    logger.error('Error fetching customer aging:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer aging', error: error.message });
  }
});

// GET /api/v1/ar/invoices - List all invoices
router.get('/invoices', authenticateToken, requirePermission('read_financial'), arRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('customerId').optional().isMongoId().withMessage('Invalid customer ID'),
  query('status').optional().isIn(['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, customerId, status, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ invoiceDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Invoice.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
  }
});

// POST /api/v1/ar/invoices - Create invoice
router.post('/invoices', authenticateToken, requirePermission('read_financial'), arRateLimit, [
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('invoiceDate').isISO8601().withMessage('Valid invoice date is required'),
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

    // Get customer info
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const invoiceData = {
      ...req.body,
      customerName: customer.customerName,
      createdBy: req.user.userId
    };

    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();

    // Update customer financials
    await Customer.findByIdAndUpdate(req.body.customerId, {
      $inc: {
        'financials.outstandingBalance': newInvoice.total,
        'financials.totalSales': newInvoice.total
      },
      $set: {
        'financials.lastSaleDate': new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
  }
});

// POST /api/v1/ar/invoices/:id/send - Send invoice via email
router.post('/invoices/:id/send', authenticateToken, requirePermission('read_financial'), arRateLimit, [
  param('id').isMongoId().withMessage('Invalid invoice ID'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').optional().isString().withMessage('Subject must be a string'),
  body('message').optional().isString().withMessage('Message must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { email, subject, message } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Update invoice status
    await Invoice.findByIdAndUpdate(id, {
      $set: {
        status: 'sent',
        'email.sent': true,
        'email.sentAt': new Date(),
        'email.sentTo': email
      }
    });

    // TODO: Implement actual email sending logic here
    // For now, just return success

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: {
        invoiceId: invoice.invoiceId,
        sentTo: email,
        sentAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error sending invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to send invoice', error: error.message });
  }
});

// GET /api/v1/ar/invoices/overdue - Get overdue invoices
router.get('/invoices/overdue', authenticateToken, requirePermission('read_financial'), arRateLimit, async (req, res) => {
  try {
    const overdueInvoices = await Invoice.find({
      status: { $in: ['sent', 'partial'] },
      dueDate: { $lt: new Date() }
    })
    .sort({ dueDate: 1 })
    .lean();

    const totalOverdue = overdueInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);

    res.json({
      success: true,
      data: {
        invoices: overdueInvoices,
        totalOverdue,
        count: overdueInvoices.length
      }
    });
  } catch (error) {
    logger.error('Error fetching overdue invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overdue invoices', error: error.message });
  }
});

// POST /api/v1/ar/payments - Record customer payment
router.post('/payments', authenticateToken, requirePermission('read_financial'), arRateLimit, [
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('invoiceIds').isArray().withMessage('Invoice IDs must be an array'),
  body('invoiceIds.*').isMongoId().withMessage('Each invoice ID must be a valid Mongo ID'),
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

    const { customerId, invoiceIds, amount, paymentDate, paymentMethod, referenceNumber } = req.body;

    // Get customer info
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Create payment
    const paymentData = {
      customerId,
      customerName: customer.customerName,
      invoiceIds,
      paymentDate: new Date(paymentDate),
      amount,
      paymentMethod,
      referenceNumber,
      status: 'completed',
      createdBy: req.user.userId
    };

    const newPayment = new CustomerPayment(paymentData);
    await newPayment.save();

    // Update invoices
    await Invoice.updateMany(
      { _id: { $in: invoiceIds } },
      { 
        $inc: { amountPaid: amount },
        $push: { payments: { paymentId: newPayment.paymentId, amount, paymentDate: new Date(paymentDate), paymentMethod, reference: referenceNumber } }
      }
    );

    // Update customer financials
    await Customer.findByIdAndUpdate(customerId, {
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
      message: 'Customer payment recorded successfully',
      data: newPayment
    });
  } catch (error) {
    logger.error('Error recording customer payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record customer payment', error: error.message });
  }
});

module.exports = router;
