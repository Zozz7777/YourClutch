const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// Rate limiting for payroll operations
const payrollRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many payroll requests from this IP, please try again later.'
});

// GET /api/v1/payroll - List all payrolls
router.get('/', authenticateToken, requirePermission('read_financial'), payrollRateLimit, [
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
  query('status').optional().isIn(['draft', 'approved', 'processing', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { year, month, status, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (year) query['payrollPeriod.year'] = parseInt(year);
    if (month) query['payrollPeriod.month'] = parseInt(month);
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [payrolls, total] = await Promise.all([
      Payroll.find(query)
        .sort({ 'payrollPeriod.year': -1, 'payrollPeriod.month': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Payroll.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: payrolls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching payrolls:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payrolls', error: error.message });
  }
});

// POST /api/v1/payroll/generate - Generate payroll for period
router.post('/generate', authenticateToken, requirePermission('read_financial'), payrollRateLimit, [
  body('startDate').isISO8601().withMessage('Invalid start date format'),
  body('endDate').isISO8601().withMessage('Invalid end date format'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Invalid year')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, month, year } = req.body;

    // Check if payroll already exists for this period
    const existingPayroll = await Payroll.findOne({
      'payrollPeriod.month': month,
      'payrollPeriod.year': year
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this period'
      });
    }

    // Get all active employees
    const employees = await Employee.find({ isActive: true }).lean();
    
    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees found'
      });
    }

    // Generate employee payments
    const employeePayments = employees.map(employee => {
      const basicSalary = employee.salary || 0;
      const allowances = employee.allowances || [];
      const bonuses = employee.bonuses || [];
      
      // Calculate allowances total
      const totalAllowances = allowances.reduce((sum, allowance) => sum + (allowance.amount || 0), 0);
      
      // Calculate bonuses total
      const totalBonuses = bonuses.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
      
      // Calculate overtime (this would need to be calculated from attendance records)
      const overtimePay = 0; // Placeholder
      
      const grossPay = basicSalary + totalAllowances + totalBonuses + overtimePay;
      
      // Calculate deductions (this would need to be calculated based on tax rules)
      const incomeTax = grossPay * 0.1; // Placeholder 10% tax
      const socialInsurance = grossPay * 0.14; // Placeholder 14% social insurance
      const healthInsurance = grossPay * 0.05; // Placeholder 5% health insurance
      
      const totalDeductions = incomeTax + socialInsurance + healthInsurance;
      const netPay = grossPay - totalDeductions;

      return {
        employeeId: employee.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        basicSalary,
        allowances,
        bonuses,
        overtimePay,
        grossPay,
        deductions: [
          { type: 'tax', name: 'Income Tax', amount: incomeTax },
          { type: 'insurance', name: 'Social Insurance', amount: socialInsurance },
          { type: 'insurance', name: 'Health Insurance', amount: healthInsurance }
        ],
        taxes: {
          incomeTax,
          socialInsurance,
          healthInsurance
        },
        netPay,
        bankDetails: employee.bankDetails || {},
        paymentStatus: 'pending'
      };
    });

    // Calculate totals
    const totals = employeePayments.reduce((acc, payment) => {
      acc.totalGrossPay += payment.grossPay;
      acc.totalDeductions += payment.deductions.reduce((sum, ded) => sum + ded.amount, 0);
      acc.totalNetPay += payment.netPay;
      acc.totalTaxes += payment.taxes.incomeTax + payment.taxes.socialInsurance + payment.taxes.healthInsurance;
      acc.totalAllowances += payment.allowances.reduce((sum, allow) => sum + allow.amount, 0);
      acc.totalBonuses += payment.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      return acc;
    }, {
      totalGrossPay: 0,
      totalDeductions: 0,
      totalNetPay: 0,
      totalTaxes: 0,
      totalAllowances: 0,
      totalBonuses: 0
    });

    // Create payroll
    const payroll = new Payroll({
      payrollPeriod: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        month,
        year
      },
      employeePayments,
      totals,
      status: 'draft',
      createdBy: req.user.userId
    });

    await payroll.save();

    res.status(201).json({
      success: true,
      message: 'Payroll generated successfully',
      data: payroll
    });
  } catch (error) {
    logger.error('Error generating payroll:', error);
    res.status(500).json({ success: false, message: 'Failed to generate payroll', error: error.message });
  }
});

// POST /api/v1/payroll/:id/approve - Approve payroll
router.post('/:id/approve', authenticateToken, requirePermission('read_financial'), payrollRateLimit, [
  param('id').isMongoId().withMessage('Invalid payroll ID'),
  body('approvalNotes').optional().isString().withMessage('Approval notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { approvalNotes } = req.body;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    if (payroll.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Payroll is not in draft status' });
    }

    payroll.status = 'approved';
    payroll.approval = {
      approvedBy: req.user.userId,
      approvedAt: new Date(),
      approvalNotes: approvalNotes || ''
    };
    payroll.updatedBy = req.user.userId;

    await payroll.save();

    res.json({
      success: true,
      message: 'Payroll approved successfully',
      data: payroll
    });
  } catch (error) {
    logger.error('Error approving payroll:', error);
    res.status(500).json({ success: false, message: 'Failed to approve payroll', error: error.message });
  }
});

// POST /api/v1/payroll/:id/process - Process payments
router.post('/:id/process', authenticateToken, requirePermission('read_financial'), payrollRateLimit, [
  param('id').isMongoId().withMessage('Invalid payroll ID'),
  body('paymentMethod').isIn(['bank_transfer', 'cash', 'check']).withMessage('Invalid payment method'),
  body('bankAccount').optional().isObject().withMessage('Bank account must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { paymentMethod, bankAccount } = req.body;

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }

    if (payroll.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Payroll must be approved before processing' });
    }

    payroll.status = 'processing';
    payroll.processing = {
      processedBy: req.user.userId,
      processedAt: new Date(),
      processingNotes: 'Payments being processed'
    };
    payroll.payment = {
      paymentMethod,
      bankAccount: bankAccount || {}
    };
    payroll.updatedBy = req.user.userId;

    await payroll.save();

    // Update employee payment statuses
    payroll.employeePayments.forEach(payment => {
      payment.paymentStatus = 'paid';
      payment.paidDate = new Date();
      payment.transactionReference = `PAY-${Date.now()}-${payment.employeeId}`;
    });

    payroll.status = 'completed';
    payroll.payment.paymentDate = new Date();
    payroll.payment.paymentReference = `PAYROLL-${payroll.payrollId}`;

    await payroll.save();

    res.json({
      success: true,
      message: 'Payroll processed successfully',
      data: payroll
    });
  } catch (error) {
    logger.error('Error processing payroll:', error);
    res.status(500).json({ success: false, message: 'Failed to process payroll', error: error.message });
  }
});

// GET /api/v1/payroll/cost-analysis - Payroll cost analysis
router.get('/cost-analysis', authenticateToken, requirePermission('read_financial'), payrollRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('groupBy').optional().isIn(['month', 'year', 'department']).withMessage('Invalid group by option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query['payrollPeriod.startDate'] = dateFilter;
    }

    let groupField = {};
    if (groupBy === 'month') {
      groupField = { year: '$payrollPeriod.year', month: '$payrollPeriod.month' };
    } else if (groupBy === 'year') {
      groupField = { year: '$payrollPeriod.year' };
    } else if (groupBy === 'department') {
      groupField = { department: '$department' };
    }

    const analysis = await Payroll.aggregate([
      { $match: { ...query, status: 'completed' } },
      {
        $group: {
          _id: groupField,
          totalPayrolls: { $sum: 1 },
          totalGrossPay: { $sum: '$totals.totalGrossPay' },
          totalDeductions: { $sum: '$totals.totalDeductions' },
          totalNetPay: { $sum: '$totals.totalNetPay' },
          totalTaxes: { $sum: '$totals.totalTaxes' },
          averageGrossPay: { $avg: '$totals.totalGrossPay' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Error fetching payroll cost analysis:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payroll cost analysis', error: error.message });
  }
});

// GET /api/v1/payroll/tax-summary - Tax deductions summary
router.get('/tax-summary', authenticateToken, requirePermission('read_financial'), payrollRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const query = {};
    if (Object.keys(dateFilter).length > 0) {
      query['payrollPeriod.startDate'] = dateFilter;
    }

    const taxSummary = await Payroll.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $unwind: '$employeePayments' },
      {
        $group: {
          _id: null,
          totalIncomeTax: { $sum: '$employeePayments.taxes.incomeTax' },
          totalSocialInsurance: { $sum: '$employeePayments.taxes.socialInsurance' },
          totalHealthInsurance: { $sum: '$employeePayments.taxes.healthInsurance' },
          totalTaxes: { $sum: { $add: ['$employeePayments.taxes.incomeTax', '$employeePayments.taxes.socialInsurance', '$employeePayments.taxes.healthInsurance'] } },
          employeeCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: taxSummary[0] || {
        totalIncomeTax: 0,
        totalSocialInsurance: 0,
        totalHealthInsurance: 0,
        totalTaxes: 0,
        employeeCount: 0
      }
    });
  } catch (error) {
    logger.error('Error fetching tax summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tax summary', error: error.message });
  }
});

module.exports = router;
