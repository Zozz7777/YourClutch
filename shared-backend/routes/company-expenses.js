const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const CompanyExpense = require('../models/CompanyExpense');

// Rate limiting for company expense operations
const expenseRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many expense requests from this IP, please try again later.'
});

// GET /api/v1/company-expenses - List all company expenses
router.get('/', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('expenseType').optional().isIn(['rent', 'utilities', 'marketing', 'software', 'office_supplies', 'travel', 'entertainment', 'professional_fees', 'insurance', 'maintenance', 'equipment', 'training', 'legal', 'accounting', 'other']).withMessage('Invalid expense type'),
  query('department').optional().isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'other']).withMessage('Invalid department'),
  query('status').optional().isIn(['pending', 'approved', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { startDate, endDate, expenseType, department, status, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    if (expenseType) query.expenseType = expenseType;
    if (department) query.department = department;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [expenses, total] = await Promise.all([
      CompanyExpense.find(query)
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CompanyExpense.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching company expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch company expenses', error: error.message });
  }
});

// POST /api/v1/company-expenses - Create expense
router.post('/', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, [
  body('expenseType').isIn(['rent', 'utilities', 'marketing', 'software', 'office_supplies', 'travel', 'entertainment', 'professional_fees', 'insurance', 'maintenance', 'equipment', 'training', 'legal', 'accounting', 'other']).withMessage('Invalid expense type'),
  body('category').notEmpty().withMessage('Category is required'),
  body('vendor.vendorName').notEmpty().withMessage('Vendor name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('paymentMethod').isIn(['bank_transfer', 'cash', 'check', 'credit_card', 'digital_wallet']).withMessage('Invalid payment method'),
  body('paymentDate').isISO8601().withMessage('Invalid payment date format'),
  body('department').isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'other']).withMessage('Invalid department'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const expenseData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const newExpense = new CompanyExpense(expenseData);
    await newExpense.save();

    res.status(201).json({
      success: true,
      message: 'Company expense created successfully',
      data: newExpense
    });
  } catch (error) {
    logger.error('Error creating company expense:', error);
    res.status(500).json({ success: false, message: 'Failed to create company expense', error: error.message });
  }
});

// PUT /api/v1/company-expenses/:id - Update expense
router.put('/:id', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  body('expenseType').optional().isIn(['rent', 'utilities', 'marketing', 'software', 'office_supplies', 'travel', 'entertainment', 'professional_fees', 'insurance', 'maintenance', 'equipment', 'training', 'legal', 'accounting', 'other']).withMessage('Invalid expense type'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('status').optional().isIn(['pending', 'approved', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedExpense = await CompanyExpense.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ success: false, message: 'Company expense not found' });
    }

    res.json({
      success: true,
      message: 'Company expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    logger.error('Error updating company expense:', error);
    res.status(500).json({ success: false, message: 'Failed to update company expense', error: error.message });
  }
});

// DELETE /api/v1/company-expenses/:id - Delete expense
router.delete('/:id', authenticateToken, checkRole(['head_administrator', 'finance_officer']), expenseRateLimit, [
  param('id').isMongoId().withMessage('Invalid expense ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;

    const deletedExpense = await CompanyExpense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ success: false, message: 'Company expense not found' });
    }

    res.json({
      success: true,
      message: 'Company expense deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting company expense:', error);
    res.status(500).json({ success: false, message: 'Failed to delete company expense', error: error.message });
  }
});

// GET /api/v1/company-expenses/by-category - Expenses by category
router.get('/by-category', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, [
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
      query.paymentDate = dateFilter;
    }

    const expensesByCategory = await CompanyExpense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amountInEGP' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amountInEGP' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      success: true,
      data: expensesByCategory
    });
  } catch (error) {
    logger.error('Error fetching expenses by category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses by category', error: error.message });
  }
});

// GET /api/v1/company-expenses/by-department - Expenses by department
router.get('/by-department', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, [
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
      query.paymentDate = dateFilter;
    }

    const expensesByDepartment = await CompanyExpense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$department',
          totalAmount: { $sum: '$amountInEGP' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amountInEGP' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      success: true,
      data: expensesByDepartment
    });
  } catch (error) {
    logger.error('Error fetching expenses by department:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses by department', error: error.message });
  }
});

// GET /api/v1/company-expenses/recurring - Recurring expenses
router.get('/recurring', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, async (req, res) => {
  try {
    const recurringExpenses = await CompanyExpense.find({
      'recurringSchedule.isRecurring': true,
      isActive: true
    })
    .sort({ 'recurringSchedule.nextPaymentDate': 1 })
    .lean();

    res.json({
      success: true,
      data: recurringExpenses
    });
  } catch (error) {
    logger.error('Error fetching recurring expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recurring expenses', error: error.message });
  }
});

// GET /api/v1/company-expenses/upcoming - Upcoming expenses
router.get('/upcoming', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const upcomingExpenses = await CompanyExpense.find({
      $or: [
        { dueDate: { $lte: futureDate, $gte: new Date() } },
        { 'recurringSchedule.nextPaymentDate': { $lte: futureDate, $gte: new Date() } }
      ],
      status: { $in: ['pending', 'approved'] }
    })
    .sort({ dueDate: 1, 'recurringSchedule.nextPaymentDate': 1 })
    .lean();

    res.json({
      success: true,
      data: upcomingExpenses
    });
  } catch (error) {
    logger.error('Error fetching upcoming expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming expenses', error: error.message });
  }
});

// GET /api/v1/company-expenses/overdue - Overdue expenses
router.get('/overdue', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, async (req, res) => {
  try {
    const overdueExpenses = await CompanyExpense.find({
      dueDate: { $lt: new Date() },
      status: { $in: ['pending', 'approved'] }
    })
    .sort({ dueDate: 1 })
    .lean();

    res.json({
      success: true,
      data: overdueExpenses
    });
  } catch (error) {
    logger.error('Error fetching overdue expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overdue expenses', error: error.message });
  }
});

// GET /api/v1/company-expenses/analysis - Operating cost analysis
router.get('/analysis', authenticateToken, checkRole(['head_administrator', 'finance_officer', 'finance']), expenseRateLimit, [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('groupBy').optional().isIn(['month', 'quarter', 'year', 'category', 'department']).withMessage('Invalid group by option')
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
      query.paymentDate = dateFilter;
    }

    let groupField = {};
    if (groupBy === 'month') {
      groupField = { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } };
    } else if (groupBy === 'quarter') {
      groupField = { year: { $year: '$paymentDate' }, quarter: { $ceil: { $divide: [{ $month: '$paymentDate' }, 3] } } };
    } else if (groupBy === 'year') {
      groupField = { year: { $year: '$paymentDate' } };
    } else if (groupBy === 'category') {
      groupField = { category: '$category' };
    } else if (groupBy === 'department') {
      groupField = { department: '$department' };
    }

    const analysis = await CompanyExpense.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupField,
          totalAmount: { $sum: '$amountInEGP' },
          count: { $sum: 1 },
          averageAmount: { $avg: '$amountInEGP' },
          maxAmount: { $max: '$amountInEGP' },
          minAmount: { $min: '$amountInEGP' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Error fetching expense analysis:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense analysis', error: error.message });
  }
});

module.exports = router;
