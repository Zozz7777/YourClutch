const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const ProcurementRequest = require('../models/ProcurementRequest');
const DepartmentBudget = require('../models/DepartmentBudget');
const ProjectBudget = require('../models/ProjectBudget');

// Rate limiting for procurement operations
const procurementRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many procurement requests from this IP, please try again later.'
});

// GET /api/v1/procurement/requests - List all procurement requests
router.get('/requests', authenticateToken, requirePermission('read_procurement'), procurementRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'cancelled']).withMessage('Invalid status'),
  query('department').optional().isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']).withMessage('Invalid department'),
  query('requestedBy').optional().isMongoId().withMessage('Invalid requester ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('Minimum amount must be a positive number'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Maximum amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, status, department, requestedBy, startDate, endDate, minAmount, maxAmount } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (requestedBy) query.requestedBy = requestedBy;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }

    const skip = (page - 1) * limit;
    
    const [requests, total] = await Promise.all([
      ProcurementRequest.find(query)
        .populate('requestedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProcurementRequest.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching procurement requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch procurement requests', error: error.message });
  }
});

// POST /api/v1/procurement/requests - Create procurement request
router.post('/requests', authenticateToken, requirePermission('create_procurement_request'), procurementRateLimit, [
  body('department').isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']).withMessage('Invalid department'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.itemName').notEmpty().withMessage('Item name is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('items.*.category').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  body('justification').notEmpty().withMessage('Justification is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { department, project, items, justification, tags = [] } = req.body;

    // Generate request number
    const requestNumber = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Create approval chain based on amount
    const approvalChain = [];
    if (totalAmount < 1000) {
      // Department manager approval only
      approvalChain.push({
        approverRole: 'department_manager',
        required: true,
        status: 'pending'
      });
    } else if (totalAmount < 10000) {
      // Department manager + Finance approval
      approvalChain.push(
        { approverRole: 'department_manager', required: true, status: 'pending' },
        { approverRole: 'finance_officer', required: true, status: 'pending' }
      );
    } else {
      // Department manager + Finance + Executive approval
      approvalChain.push(
        { approverRole: 'department_manager', required: true, status: 'pending' },
        { approverRole: 'finance_officer', required: true, status: 'pending' },
        { approverRole: 'head_administrator', required: true, status: 'pending' }
      );
    }

    const requestData = {
      requestNumber,
      requestedBy: req.user.userId,
      department,
      project,
      items,
      totalAmount,
      justification,
      tags,
      approvalWorkflow: {
        approvalChain,
        currentApprovalStep: 0
      },
      createdBy: req.user.userId
    };

    const newRequest = new ProcurementRequest(requestData);
    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Procurement request created successfully',
      data: newRequest
    });
  } catch (error) {
    logger.error('Error creating procurement request:', error);
    res.status(500).json({ success: false, message: 'Failed to create procurement request', error: error.message });
  }
});

// GET /api/v1/procurement/requests/:id - Get request details
router.get('/requests/:id', authenticateToken, requirePermission('read_procurement'), procurementRateLimit, [
  param('id').isMongoId().withMessage('Invalid request ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const request = await ProcurementRequest.findById(req.params.id)
      .populate('requestedBy', 'firstName lastName email')
      .populate('approvalWorkflow.approvalChain.approverId', 'firstName lastName email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Procurement request not found' });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    logger.error('Error fetching procurement request:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch procurement request', error: error.message });
  }
});

// PUT /api/v1/procurement/requests/:id - Update request
router.put('/requests/:id', authenticateToken, requirePermission('create_procurement_request'), procurementRateLimit, [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('justification').optional().notEmpty().withMessage('Justification cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const request = await ProcurementRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Procurement request not found' });
    }

    if (request.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft requests can be updated' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    // Recalculate total amount if items are updated
    if (req.body.items) {
      updateData.totalAmount = req.body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const updatedRequest = await ProcurementRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Procurement request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    logger.error('Error updating procurement request:', error);
    res.status(500).json({ success: false, message: 'Failed to update procurement request', error: error.message });
  }
});

// POST /api/v1/procurement/requests/:id/submit - Submit request for approval
router.post('/requests/:id/submit', authenticateToken, requirePermission('create_procurement_request'), procurementRateLimit, [
  param('id').isMongoId().withMessage('Invalid request ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const request = await ProcurementRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Procurement request not found' });
    }

    if (request.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft requests can be submitted' });
    }

    // Check budget availability
    const budgetCheck = await checkBudgetAvailability(request);
    if (!budgetCheck.available) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient budget available',
        details: budgetCheck
      });
    }

    // Update status to pending approval
    request.status = 'pending_approval';
    request.budgetTracking.budgetCheckStatus = budgetCheck.available ? 'passed' : 'failed';
    request.budgetTracking.budgetCheckResult = budgetCheck;
    request.updatedBy = req.user.userId;

    await request.save();

    // TODO: Send notification to first approver

    res.json({
      success: true,
      message: 'Procurement request submitted for approval',
      data: request
    });
  } catch (error) {
    logger.error('Error submitting procurement request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit procurement request', error: error.message });
  }
});

// POST /api/v1/procurement/requests/:id/approve - Approve request
router.post('/requests/:id/approve', authenticateToken, requirePermission('approve_procurement'), procurementRateLimit, [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('comments').optional().isString().withMessage('Comments must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { comments = '' } = req.body;
    const request = await ProcurementRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Procurement request not found' });
    }

    if (request.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Request is not pending approval' });
    }

    // Update approval workflow
    const currentStep = request.approvalWorkflow.currentApprovalStep;
    const approvalChain = request.approvalWorkflow.approvalChain;
    
    // Mark current step as approved
    approvalChain[currentStep].status = 'approved';
    approvalChain[currentStep].approvedAt = new Date();
    approvalChain[currentStep].comments = comments;

    // Add to approval history
    request.approvalWorkflow.approvalHistory.push({
      step: currentStep,
      approverId: req.user.userId,
      approverName: req.user.firstName + ' ' + req.user.lastName,
      action: 'approved',
      comments,
      timestamp: new Date()
    });

    // Check if all required approvals are complete
    const requiredApprovals = approvalChain.filter(approval => approval.required);
    const completedApprovals = approvalChain.filter(approval => approval.required && approval.status === 'approved');
    
    if (completedApprovals.length === requiredApprovals.length) {
      // All approvals complete
      request.status = 'approved';
      request.approvalWorkflow.currentApprovalStep = approvalChain.length;
    } else {
      // Move to next approval step
      request.approvalWorkflow.currentApprovalStep = currentStep + 1;
    }

    request.updatedBy = req.user.userId;
    await request.save();

    res.json({
      success: true,
      message: 'Procurement request approved',
      data: request
    });
  } catch (error) {
    logger.error('Error approving procurement request:', error);
    res.status(500).json({ success: false, message: 'Failed to approve procurement request', error: error.message });
  }
});

// POST /api/v1/procurement/requests/:id/reject - Reject request
router.post('/requests/:id/reject', authenticateToken, requirePermission('approve_procurement'), procurementRateLimit, [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('reason').notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { reason } = req.body;
    const request = await ProcurementRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Procurement request not found' });
    }

    if (request.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Request is not pending approval' });
    }

    // Update approval workflow
    const currentStep = request.approvalWorkflow.currentApprovalStep;
    const approvalChain = request.approvalWorkflow.approvalChain;
    
    // Mark current step as rejected
    approvalChain[currentStep].status = 'rejected';
    approvalChain[currentStep].approvedAt = new Date();
    approvalChain[currentStep].comments = reason;

    // Add to approval history
    request.approvalWorkflow.approvalHistory.push({
      step: currentStep,
      approverId: req.user.userId,
      approverName: req.user.firstName + ' ' + req.user.lastName,
      action: 'rejected',
      comments: reason,
      timestamp: new Date()
    });

    // Reject the request
    request.status = 'rejected';
    request.updatedBy = req.user.userId;
    await request.save();

    res.json({
      success: true,
      message: 'Procurement request rejected',
      data: request
    });
  } catch (error) {
    logger.error('Error rejecting procurement request:', error);
    res.status(500).json({ success: false, message: 'Failed to reject procurement request', error: error.message });
  }
});

// GET /api/v1/procurement/requests/:id/budget-check - Check budget availability
router.get('/requests/:id/budget-check', authenticateToken, requirePermission('read_procurement'), procurementRateLimit, [
  param('id').isMongoId().withMessage('Invalid request ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const request = await ProcurementRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Procurement request not found' });
    }

    const budgetCheck = await checkBudgetAvailability(request);

    res.json({
      success: true,
      data: budgetCheck
    });
  } catch (error) {
    logger.error('Error checking budget availability:', error);
    res.status(500).json({ success: false, message: 'Failed to check budget availability', error: error.message });
  }
});

// Helper function to check budget availability
async function checkBudgetAvailability(request) {
  try {
    let budget = null;
    let availableAmount = 0;
    let requiredAmount = request.totalAmount;

    if (request.budgetTracking.departmentBudgetId) {
      budget = await DepartmentBudget.findById(request.budgetTracking.departmentBudgetId);
      if (budget) {
        availableAmount = budget.tracking.availableAmount;
      }
    } else if (request.budgetTracking.projectBudgetId) {
      budget = await ProjectBudget.findById(request.budgetTracking.projectBudgetId);
      if (budget) {
        availableAmount = budget.tracking.availableAmount;
      }
    }

    const isWithinBudget = availableAmount >= requiredAmount;
    const warningMessage = isWithinBudget ? null : 'Insufficient budget available';

    return {
      available: isWithinBudget,
      availableAmount,
      requiredAmount,
      isWithinBudget,
      warningMessage,
      budgetType: request.budgetTracking.departmentBudgetId ? 'department' : 'project',
      budgetId: request.budgetTracking.departmentBudgetId || request.budgetTracking.projectBudgetId
    };
  } catch (error) {
    logger.error('Error in budget check:', error);
    return {
      available: false,
      availableAmount: 0,
      requiredAmount: request.totalAmount,
      isWithinBudget: false,
      warningMessage: 'Error checking budget availability',
      budgetType: 'unknown',
      budgetId: null
    };
  }
}

module.exports = router;
