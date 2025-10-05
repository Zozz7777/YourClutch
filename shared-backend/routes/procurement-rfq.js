const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const RFQ = require('../models/RFQ');
const ProcurementRequest = require('../models/ProcurementRequest');
const ProcurementSupplier = require('../models/ProcurementSupplier');

// Rate limiting for RFQ operations
const rfqRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many RFQ requests from this IP, please try again later.'
});

// GET /api/v1/procurement/rfq - List all RFQs
router.get('/rfq', authenticateToken, requirePermission('read_procurement'), rfqRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'issued', 'bidding_open', 'bidding_closed', 'evaluated', 'awarded', 'cancelled']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query['timeline.issueDate'] = {};
      if (startDate) query['timeline.issueDate'].$gte = new Date(startDate);
      if (endDate) query['timeline.issueDate'].$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [rfqs, total] = await Promise.all([
      RFQ.find(query)
        .populate('procurementRequestId', 'requestNumber department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      RFQ.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: rfqs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching RFQs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch RFQs', error: error.message });
  }
});

// POST /api/v1/procurement/rfq - Create RFQ
router.post('/rfq', authenticateToken, requirePermission('create_rfq'), rfqRateLimit, [
  body('procurementRequestId').optional().isMongoId().withMessage('Invalid procurement request ID'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.itemName').notEmpty().withMessage('Item name is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('items.*.category').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  body('timeline.issueDate').isISO8601().withMessage('Invalid issue date format'),
  body('timeline.dueDate').isISO8601().withMessage('Invalid due date format'),
  body('suppliers').isArray().withMessage('Suppliers must be an array'),
  body('suppliers.*.supplierId').isMongoId().withMessage('Invalid supplier ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { procurementRequestId, items, timeline, suppliers, requirements } = req.body;

    // Generate RFQ number
    const rfqNumber = `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Get supplier names
    const supplierIds = suppliers.map(s => s.supplierId);
    const supplierDetails = await ProcurementSupplier.find({ _id: { $in: supplierIds } })
      .select('supplierName')
      .lean();

    const suppliersWithNames = suppliers.map(supplier => {
      const supplierDetail = supplierDetails.find(s => s._id.toString() === supplier.supplierId);
      return {
        ...supplier,
        supplierName: supplierDetail ? supplierDetail.supplierName : 'Unknown Supplier'
      };
    });

    const rfqData = {
      rfqNumber,
      procurementRequestId,
      items,
      suppliers: suppliersWithNames,
      timeline,
      requirements: requirements || {},
      status: 'draft',
      createdBy: req.user.userId
    };

    const newRFQ = new RFQ(rfqData);
    await newRFQ.save();

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: newRFQ
    });
  } catch (error) {
    logger.error('Error creating RFQ:', error);
    res.status(500).json({ success: false, message: 'Failed to create RFQ', error: error.message });
  }
});

// GET /api/v1/procurement/rfq/:id - Get RFQ details
router.get('/rfq/:id', authenticateToken, requirePermission('read_procurement'), rfqRateLimit, [
  param('id').isMongoId().withMessage('Invalid RFQ ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const rfq = await RFQ.findById(req.params.id)
      .populate('procurementRequestId', 'requestNumber department')
      .populate('suppliers.supplierId', 'supplierName contactInfo');

    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    res.json({
      success: true,
      data: rfq
    });
  } catch (error) {
    logger.error('Error fetching RFQ:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch RFQ', error: error.message });
  }
});

// PUT /api/v1/procurement/rfq/:id - Update RFQ
router.put('/rfq/:id', authenticateToken, requirePermission('update_rfq'), rfqRateLimit, [
  param('id').isMongoId().withMessage('Invalid RFQ ID'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('timeline.dueDate').optional().isISO8601().withMessage('Invalid due date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    if (rfq.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft RFQs can be updated' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedRFQ = await RFQ.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'RFQ updated successfully',
      data: updatedRFQ
    });
  } catch (error) {
    logger.error('Error updating RFQ:', error);
    res.status(500).json({ success: false, message: 'Failed to update RFQ', error: error.message });
  }
});

// POST /api/v1/procurement/rfq/:id/issue - Issue RFQ to suppliers
router.post('/rfq/:id/issue', authenticateToken, requirePermission('issue_rfq'), rfqRateLimit, [
  param('id').isMongoId().withMessage('Invalid RFQ ID'),
  body('emailTemplate').optional().isString().withMessage('Email template must be a string'),
  body('subject').optional().isString().withMessage('Subject must be a string'),
  body('message').optional().isString().withMessage('Message must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { emailTemplate, subject, message } = req.body;
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    if (rfq.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft RFQs can be issued' });
    }

    // Update RFQ status
    rfq.status = 'issued';
    rfq.timeline.issueDate = new Date();
    rfq.communication = {
      emailTemplate: emailTemplate || 'default',
      subject: subject || `RFQ ${rfq.rfqNumber}`,
      message: message || 'Please find attached RFQ for your consideration.',
      sentEmails: [],
      reminders: []
    };
    rfq.updatedBy = req.user.userId;

    await rfq.save();

    // TODO: Send emails to suppliers
    // TODO: Update supplier status to 'invited'

    res.json({
      success: true,
      message: 'RFQ issued successfully',
      data: rfq
    });
  } catch (error) {
    logger.error('Error issuing RFQ:', error);
    res.status(500).json({ success: false, message: 'Failed to issue RFQ', error: error.message });
  }
});

// POST /api/v1/procurement/rfq/:id/quote - Submit quote
router.post('/rfq/:id/quote', authenticateToken, requirePermission('submit_quote'), rfqRateLimit, [
  param('id').isMongoId().withMessage('Invalid RFQ ID'),
  body('supplierId').isMongoId().withMessage('Invalid supplier ID'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.itemName').notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('totalQuote').isFloat({ min: 0 }).withMessage('Total quote must be a positive number'),
  body('deliveryTime').isInt({ min: 0 }).withMessage('Delivery time must be a positive integer'),
  body('paymentTerms').isIn(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom']).withMessage('Invalid payment terms')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { supplierId, items, totalQuote, deliveryTime, paymentTerms, customTerms, notes } = req.body;
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    if (rfq.status !== 'issued' && rfq.status !== 'bidding_open') {
      return res.status(400).json({ success: false, message: 'RFQ is not accepting quotes' });
    }

    // Check if supplier is invited
    const supplier = rfq.suppliers.find(s => s.supplierId === supplierId);
    if (!supplier) {
      return res.status(400).json({ success: false, message: 'Supplier not invited to this RFQ' });
    }

    // Create quote
    const quote = {
      supplierId,
      supplierName: supplier.supplierName,
      items,
      totalQuote,
      deliveryTime,
      paymentTerms,
      customTerms,
      submittedAt: new Date(),
      submittedBy: req.user.userId,
      notes
    };

    // Add quote to RFQ
    rfq.quotes.push(quote);
    rfq.status = 'bidding_open';
    rfq.updatedBy = req.user.userId;

    // Update supplier status
    supplier.status = 'quoted';
    supplier.responseDate = new Date();

    await rfq.save();

    res.json({
      success: true,
      message: 'Quote submitted successfully',
      data: quote
    });
  } catch (error) {
    logger.error('Error submitting quote:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quote', error: error.message });
  }
});

// POST /api/v1/procurement/rfq/:id/evaluate - Evaluate quotes
router.post('/rfq/:id/evaluate', authenticateToken, requirePermission('evaluate_rfq'), rfqRateLimit, [
  param('id').isMongoId().withMessage('Invalid RFQ ID'),
  body('criteria').isArray().withMessage('Evaluation criteria must be an array'),
  body('criteria.*.name').notEmpty().withMessage('Criteria name is required'),
  body('criteria.*.weight').isFloat({ min: 0, max: 100 }).withMessage('Weight must be between 0 and 100'),
  body('scoringMatrix').isArray().withMessage('Scoring matrix must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { criteria, scoringMatrix } = req.body;
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    if (rfq.status !== 'bidding_open' && rfq.status !== 'bidding_closed') {
      return res.status(400).json({ success: false, message: 'RFQ is not in evaluation phase' });
    }

    // Update evaluation
    rfq.evaluation = {
      criteria,
      scoringMatrix,
      evaluatedBy: req.user.userId,
      evaluatedAt: new Date()
    };
    rfq.status = 'evaluated';
    rfq.updatedBy = req.user.userId;

    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ evaluation completed',
      data: rfq.evaluation
    });
  } catch (error) {
    logger.error('Error evaluating RFQ:', error);
    res.status(500).json({ success: false, message: 'Failed to evaluate RFQ', error: error.message });
  }
});

// POST /api/v1/procurement/rfq/:id/award - Award RFQ to supplier
router.post('/rfq/:id/award', authenticateToken, requirePermission('award_rfq'), rfqRateLimit, [
  param('id').isMongoId().withMessage('Invalid RFQ ID'),
  body('selectedSupplierId').isMongoId().withMessage('Invalid selected supplier ID'),
  body('selectionReason').notEmpty().withMessage('Selection reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { selectedSupplierId, selectionReason } = req.body;
    const rfq = await RFQ.findById(req.params.id);
    
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    if (rfq.status !== 'evaluated') {
      return res.status(400).json({ success: false, message: 'RFQ must be evaluated before awarding' });
    }

    // Check if supplier has a quote
    const selectedQuote = rfq.quotes.find(q => q.supplierId === selectedSupplierId);
    if (!selectedQuote) {
      return res.status(400).json({ success: false, message: 'Selected supplier has no quote' });
    }

    // Update evaluation with selection
    rfq.evaluation.selectedSupplierId = selectedSupplierId;
    rfq.evaluation.selectedSupplierName = selectedQuote.supplierName;
    rfq.evaluation.selectionReason = selectionReason;
    rfq.status = 'awarded';
    rfq.updatedBy = req.user.userId;

    // Mark selected quote
    selectedQuote.isSelected = true;

    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ awarded successfully',
      data: {
        selectedSupplierId,
        selectedSupplierName: selectedQuote.supplierName,
        selectionReason
      }
    });
  } catch (error) {
    logger.error('Error awarding RFQ:', error);
    res.status(500).json({ success: false, message: 'Failed to award RFQ', error: error.message });
  }
});

// GET /api/v1/procurement/rfq/:id/quotes - Get all quotes for RFQ
router.get('/rfq/:id/quotes', authenticateToken, requirePermission('read_procurement'), rfqRateLimit, [
  param('id').isMongoId().withMessage('Invalid RFQ ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const rfq = await RFQ.findById(req.params.id).select('quotes');
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found' });
    }

    res.json({
      success: true,
      data: rfq.quotes
    });
  } catch (error) {
    logger.error('Error fetching RFQ quotes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch RFQ quotes', error: error.message });
  }
});

module.exports = router;
