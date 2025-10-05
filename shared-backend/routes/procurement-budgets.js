const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const DepartmentBudget = require('../models/DepartmentBudget');
const ProjectBudget = require('../models/ProjectBudget');

// Rate limiting for budget operations
const budgetRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many budget requests from this IP, please try again later.'
});

// GET /api/v1/procurement/budgets/departments - List department budgets
router.get('/budgets/departments', authenticateToken, requirePermission('read_procurement'), budgetRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('department').optional().isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']).withMessage('Invalid department'),
  query('fiscalYear').optional().isString().withMessage('Fiscal year must be a string'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, department, fiscalYear, isActive } = req.query;
    
    // Build query
    const query = {};
    if (department) query.department = department;
    if (fiscalYear) query.fiscalYear = fiscalYear;
    if (isActive !== undefined) query['period.isActive'] = isActive === 'true';

    const skip = (page - 1) * limit;
    
    const [budgets, total] = await Promise.all([
      DepartmentBudget.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DepartmentBudget.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: budgets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching department budgets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch department budgets', error: error.message });
  }
});

// POST /api/v1/procurement/budgets/departments - Create department budget
router.post('/budgets/departments', authenticateToken, requirePermission('create_budget'), budgetRateLimit, [
  body('department').isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']).withMessage('Invalid department'),
  body('fiscalYear').notEmpty().withMessage('Fiscal year is required'),
  body('totalBudget').isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('period.startDate').isISO8601().withMessage('Invalid start date format'),
  body('period.endDate').isISO8601().withMessage('Invalid end date format'),
  body('categories').isArray().withMessage('Categories must be an array'),
  body('categories.*.category').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  body('categories.*.allocatedAmount').isFloat({ min: 0 }).withMessage('Allocated amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { department, fiscalYear, totalBudget, period, categories, alerts, approvals } = req.body;

    // Check if budget already exists for this department and fiscal year
    const existingBudget = await DepartmentBudget.findOne({ department, fiscalYear });
    if (existingBudget) {
      return res.status(400).json({ 
        success: false, 
        message: 'Budget already exists for this department and fiscal year' 
      });
    }

    const budgetData = {
      department,
      fiscalYear,
      totalBudget,
      categories,
      period,
      alerts: alerts || { thresholdWarning: 80, alertRecipients: [] },
      approvals: approvals || { requiresApproval: true, approvalThreshold: 1000, approvers: [] },
      createdBy: req.user.userId
    };

    const newBudget = new DepartmentBudget(budgetData);
    await newBudget.save();

    res.status(201).json({
      success: true,
      message: 'Department budget created successfully',
      data: newBudget
    });
  } catch (error) {
    logger.error('Error creating department budget:', error);
    res.status(500).json({ success: false, message: 'Failed to create department budget', error: error.message });
  }
});

// GET /api/v1/procurement/budgets/departments/:id - Get department budget details
router.get('/budgets/departments/:id', authenticateToken, requirePermission('read_procurement'), budgetRateLimit, [
  param('id').isMongoId().withMessage('Invalid budget ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const budget = await DepartmentBudget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Department budget not found' });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    logger.error('Error fetching department budget:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch department budget', error: error.message });
  }
});

// PUT /api/v1/procurement/budgets/departments/:id - Update department budget
router.put('/budgets/departments/:id', authenticateToken, requirePermission('update_budget'), budgetRateLimit, [
  param('id').isMongoId().withMessage('Invalid budget ID'),
  body('totalBudget').optional().isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('categories').optional().isArray().withMessage('Categories must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const budget = await DepartmentBudget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Department budget not found' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedBudget = await DepartmentBudget.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Department budget updated successfully',
      data: updatedBudget
    });
  } catch (error) {
    logger.error('Error updating department budget:', error);
    res.status(500).json({ success: false, message: 'Failed to update department budget', error: error.message });
  }
});

// GET /api/v1/procurement/budgets/projects - List project budgets
router.get('/budgets/projects', authenticateToken, requirePermission('read_procurement'), budgetRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('projectManager').optional().isMongoId().withMessage('Invalid project manager ID'),
  query('status').optional().isIn(['planning', 'active', 'on_hold', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, projectManager, status, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    if (projectManager) query.projectManager = projectManager;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [budgets, total] = await Promise.all([
      ProjectBudget.find(query)
        .populate('projectManager', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProjectBudget.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: budgets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching project budgets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project budgets', error: error.message });
  }
});

// POST /api/v1/procurement/budgets/projects - Create project budget
router.post('/budgets/projects', authenticateToken, requirePermission('create_budget'), budgetRateLimit, [
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('projectName').notEmpty().withMessage('Project name is required'),
  body('projectManager').isMongoId().withMessage('Invalid project manager ID'),
  body('totalBudget').isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('startDate').isISO8601().withMessage('Invalid start date format'),
  body('endDate').isISO8601().withMessage('Invalid end date format'),
  body('budgetBreakdown').isArray().withMessage('Budget breakdown must be an array'),
  body('budgetBreakdown.*.category').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  body('budgetBreakdown.*.allocatedAmount').isFloat({ min: 0 }).withMessage('Allocated amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { projectId, projectName, projectManager, totalBudget, startDate, endDate, budgetBreakdown, alerts, approvals } = req.body;

    // Check if budget already exists for this project
    const existingBudget = await ProjectBudget.findOne({ projectId });
    if (existingBudget) {
      return res.status(400).json({ 
        success: false, 
        message: 'Budget already exists for this project' 
      });
    }

    const budgetData = {
      projectId,
      projectName,
      projectManager,
      totalBudget,
      startDate,
      endDate,
      budgetBreakdown,
      alerts: alerts || { thresholdWarning: 80, alertRecipients: [] },
      approvals: approvals || { requiresApproval: true, approvalThreshold: 1000, approvers: [] },
      createdBy: req.user.userId
    };

    const newBudget = new ProjectBudget(budgetData);
    await newBudget.save();

    res.status(201).json({
      success: true,
      message: 'Project budget created successfully',
      data: newBudget
    });
  } catch (error) {
    logger.error('Error creating project budget:', error);
    res.status(500).json({ success: false, message: 'Failed to create project budget', error: error.message });
  }
});

// GET /api/v1/procurement/budgets/projects/:id - Get project budget details
router.get('/budgets/projects/:id', authenticateToken, requirePermission('read_procurement'), budgetRateLimit, [
  param('id').isMongoId().withMessage('Invalid budget ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const budget = await ProjectBudget.findById(req.params.id)
      .populate('projectManager', 'firstName lastName email');

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Project budget not found' });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    logger.error('Error fetching project budget:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project budget', error: error.message });
  }
});

// PUT /api/v1/procurement/budgets/projects/:id - Update project budget
router.put('/budgets/projects/:id', authenticateToken, requirePermission('update_budget'), budgetRateLimit, [
  param('id').isMongoId().withMessage('Invalid budget ID'),
  body('totalBudget').optional().isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('budgetBreakdown').optional().isArray().withMessage('Budget breakdown must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const budget = await ProjectBudget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Project budget not found' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedBudget = await ProjectBudget.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Project budget updated successfully',
      data: updatedBudget
    });
  } catch (error) {
    logger.error('Error updating project budget:', error);
    res.status(500).json({ success: false, message: 'Failed to update project budget', error: error.message });
  }
});

// GET /api/v1/procurement/budgets/check-availability - Check budget availability
router.get('/budgets/check-availability', authenticateToken, requirePermission('read_procurement'), budgetRateLimit, [
  query('budgetId').isMongoId().withMessage('Invalid budget ID'),
  query('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  query('budgetType').isIn(['department', 'project']).withMessage('Budget type must be department or project')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { budgetId, amount, budgetType } = req.query;
    
    let budget = null;
    if (budgetType === 'department') {
      budget = await DepartmentBudget.findById(budgetId);
    } else {
      budget = await ProjectBudget.findById(budgetId);
    }

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const availableAmount = budget.tracking.availableAmount;
    const isAvailable = availableAmount >= parseFloat(amount);

    res.json({
      success: true,
      data: {
        available: isAvailable,
        availableAmount,
        requiredAmount: parseFloat(amount),
        isWithinBudget: isAvailable,
        warningMessage: isAvailable ? null : 'Insufficient budget available',
        budgetType,
        budgetId
      }
    });
  } catch (error) {
    logger.error('Error checking budget availability:', error);
    res.status(500).json({ success: false, message: 'Failed to check budget availability', error: error.message });
  }
});

// GET /api/v1/procurement/budgets/alerts - Get budget alerts
router.get('/budgets/alerts', authenticateToken, requirePermission('read_procurement'), budgetRateLimit, async (req, res) => {
  try {
    const alerts = [];

    // Check department budgets
    const departmentBudgets = await DepartmentBudget.find({ 'period.isActive': true });
    for (const budget of departmentBudgets) {
      const utilization = budget.tracking.utilizationPercentage;
      if (utilization >= budget.alerts.thresholdWarning) {
        alerts.push({
          type: 'department_budget',
          budgetId: budget._id,
          budgetName: `${budget.department} Budget`,
          utilization,
          threshold: budget.alerts.thresholdWarning,
          severity: utilization >= 100 ? 'critical' : utilization >= 90 ? 'high' : 'medium'
        });
      }
    }

    // Check project budgets
    const projectBudgets = await ProjectBudget.find({ status: 'active' });
    for (const budget of projectBudgets) {
      const utilization = budget.tracking.utilizationPercentage;
      if (utilization >= budget.alerts.thresholdWarning) {
        alerts.push({
          type: 'project_budget',
          budgetId: budget._id,
          budgetName: budget.projectName,
          utilization,
          threshold: budget.alerts.thresholdWarning,
          severity: utilization >= 100 ? 'critical' : utilization >= 90 ? 'high' : 'medium'
        });
      }
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error fetching budget alerts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget alerts', error: error.message });
  }
});

module.exports = router;
