const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const GoodsReceipt = require('../models/GoodsReceipt');
const ProcurementPurchaseOrder = require('../models/ProcurementPurchaseOrder');

// Rate limiting for goods receipt operations
const receiptRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many goods receipt requests from this IP, please try again later.'
});

// GET /api/v1/procurement/goods-receipts - List all goods receipts
router.get('/goods-receipts', authenticateToken, requirePermission('read_procurement'), receiptRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'received', 'inspected', 'accepted', 'rejected', 'partial', 'completed']).withMessage('Invalid status'),
  query('poId').optional().isMongoId().withMessage('Invalid purchase order ID'),
  query('supplierId').optional().isMongoId().withMessage('Invalid supplier ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, status, poId, supplierId, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (poId) query.poId = poId;
    if (supplierId) query.supplierId = supplierId;
    if (startDate || endDate) {
      query.receivedDate = {};
      if (startDate) query.receivedDate.$gte = new Date(startDate);
      if (endDate) query.receivedDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [receipts, total] = await Promise.all([
      GoodsReceipt.find(query)
        .populate('poId', 'poNumber supplierName')
        .sort({ receivedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      GoodsReceipt.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching goods receipts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch goods receipts', error: error.message });
  }
});

// POST /api/v1/procurement/goods-receipts - Create goods receipt
router.post('/goods-receipts', authenticateToken, requirePermission('create_goods_receipt'), receiptRateLimit, [
  body('poId').isMongoId().withMessage('Invalid purchase order ID'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.itemName').notEmpty().withMessage('Item name is required'),
  body('items.*.orderedQuantity').isFloat({ min: 0 }).withMessage('Ordered quantity must be a positive number'),
  body('items.*.receivedQuantity').isFloat({ min: 0 }).withMessage('Received quantity must be a positive number'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('items.*.category').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  body('receivedDate').isISO8601().withMessage('Invalid received date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { poId, items, receivedDate, delivery, quality, discrepancies } = req.body;

    // Get PO details
    const purchaseOrder = await ProcurementPurchaseOrder.findById(poId).select('poNumber supplierId supplierName');
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    // Calculate total received value
    const totalReceivedValue = items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0);

    const receiptData = {
      poId,
      poNumber: purchaseOrder.poNumber,
      supplierId: purchaseOrder.supplierId,
      supplierName: purchaseOrder.supplierName,
      receivedBy: req.user.userId,
      receivedDate: new Date(receivedDate),
      items,
      totalReceivedValue,
      quality: quality || { inspectionStatus: 'pending' },
      discrepancies: discrepancies || { hasDiscrepancy: false },
      delivery: delivery || {},
      status: 'draft',
      createdBy: req.user.userId
    };

    const newReceipt = new GoodsReceipt(receiptData);
    await newReceipt.save();

    res.status(201).json({
      success: true,
      message: 'Goods receipt created successfully',
      data: newReceipt
    });
  } catch (error) {
    logger.error('Error creating goods receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to create goods receipt', error: error.message });
  }
});

// GET /api/v1/procurement/goods-receipts/:id - Get goods receipt details
router.get('/goods-receipts/:id', authenticateToken, requirePermission('read_procurement'), receiptRateLimit, [
  param('id').isMongoId().withMessage('Invalid goods receipt ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const receipt = await GoodsReceipt.findById(req.params.id)
      .populate('poId', 'poNumber supplierName items')
      .populate('receivedBy', 'firstName lastName email');

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    logger.error('Error fetching goods receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch goods receipt', error: error.message });
  }
});

// PUT /api/v1/procurement/goods-receipts/:id - Update goods receipt
router.put('/goods-receipts/:id', authenticateToken, requirePermission('update_goods_receipt'), receiptRateLimit, [
  param('id').isMongoId().withMessage('Invalid goods receipt ID'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('quality.inspectionStatus').optional().isIn(['pending', 'in_progress', 'passed', 'failed', 'conditional']).withMessage('Invalid inspection status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const receipt = await GoodsReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }

    if (receipt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot update completed receipts' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedReceipt = await GoodsReceipt.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Goods receipt updated successfully',
      data: updatedReceipt
    });
  } catch (error) {
    logger.error('Error updating goods receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to update goods receipt', error: error.message });
  }
});

// POST /api/v1/procurement/goods-receipts/:id/inspect - Perform quality inspection
router.post('/goods-receipts/:id/inspect', authenticateToken, requirePermission('inspect_goods'), receiptRateLimit, [
  param('id').isMongoId().withMessage('Invalid goods receipt ID'),
  body('inspectionStatus').isIn(['passed', 'failed', 'conditional']).withMessage('Invalid inspection status'),
  body('inspectionNotes').optional().isString().withMessage('Inspection notes must be a string'),
  body('qualityScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Quality score must be between 0 and 100'),
  body('qualityIssues').optional().isArray().withMessage('Quality issues must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { inspectionStatus, inspectionNotes, qualityScore, qualityIssues } = req.body;
    const receipt = await GoodsReceipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }

    if (receipt.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot inspect completed receipts' });
    }

    // Update quality inspection
    receipt.quality.inspectionStatus = inspectionStatus;
    receipt.quality.inspectionNotes = inspectionNotes;
    receipt.quality.inspectedBy = req.user.userId;
    receipt.quality.inspectedAt = new Date();
    if (qualityScore !== undefined) receipt.quality.qualityScore = qualityScore;
    if (qualityIssues) receipt.quality.qualityIssues = qualityIssues;

    // Update status based on inspection
    if (inspectionStatus === 'passed' && !receipt.discrepancies.hasDiscrepancy) {
      receipt.status = 'accepted';
    } else if (inspectionStatus === 'failed' || receipt.discrepancies.hasDiscrepancy) {
      receipt.status = 'rejected';
    } else if (inspectionStatus === 'conditional') {
      receipt.status = 'inspected';
    }

    receipt.updatedBy = req.user.userId;
    await receipt.save();

    res.json({
      success: true,
      message: 'Quality inspection completed',
      data: receipt.quality
    });
  } catch (error) {
    logger.error('Error performing quality inspection:', error);
    res.status(500).json({ success: false, message: 'Failed to perform quality inspection', error: error.message });
  }
});

// POST /api/v1/procurement/goods-receipts/:id/report-discrepancy - Report discrepancy
router.post('/goods-receipts/:id/report-discrepancy', authenticateToken, requirePermission('report_discrepancy'), receiptRateLimit, [
  param('id').isMongoId().withMessage('Invalid goods receipt ID'),
  body('discrepancyType').isIn(['quantity_shortage', 'quantity_excess', 'wrong_item', 'damaged_goods', 'quality_issue', 'missing_documentation', 'other']).withMessage('Invalid discrepancy type'),
  body('discrepancyDescription').notEmpty().withMessage('Discrepancy description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { discrepancyType, discrepancyDescription, discrepancyNotes } = req.body;
    const receipt = await GoodsReceipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }

    // Update discrepancy information
    receipt.discrepancies.hasDiscrepancy = true;
    receipt.discrepancies.discrepancyType = discrepancyType;
    receipt.discrepancies.discrepancyDescription = discrepancyDescription;
    receipt.discrepancies.discrepancyNotes = discrepancyNotes || '';
    receipt.discrepancies.resolved = false;

    // Update status
    receipt.status = 'rejected';
    receipt.updatedBy = req.user.userId;

    await receipt.save();

    res.json({
      success: true,
      message: 'Discrepancy reported successfully',
      data: receipt.discrepancies
    });
  } catch (error) {
    logger.error('Error reporting discrepancy:', error);
    res.status(500).json({ success: false, message: 'Failed to report discrepancy', error: error.message });
  }
});

// POST /api/v1/procurement/goods-receipts/:id/resolve-discrepancy - Resolve discrepancy
router.post('/goods-receipts/:id/resolve-discrepancy', authenticateToken, requirePermission('resolve_discrepancy'), receiptRateLimit, [
  param('id').isMongoId().withMessage('Invalid goods receipt ID'),
  body('resolution').notEmpty().withMessage('Resolution is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { resolution } = req.body;
    const receipt = await GoodsReceipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }

    if (!receipt.discrepancies.hasDiscrepancy) {
      return res.status(400).json({ success: false, message: 'No discrepancy to resolve' });
    }

    // Update discrepancy resolution
    receipt.discrepancies.resolution = resolution;
    receipt.discrepancies.resolved = true;
    receipt.discrepancies.resolvedBy = req.user.userId;
    receipt.discrepancies.resolvedAt = new Date();

    // Update status
    receipt.status = 'accepted';
    receipt.updatedBy = req.user.userId;

    await receipt.save();

    res.json({
      success: true,
      message: 'Discrepancy resolved successfully',
      data: receipt.discrepancies
    });
  } catch (error) {
    logger.error('Error resolving discrepancy:', error);
    res.status(500).json({ success: false, message: 'Failed to resolve discrepancy', error: error.message });
  }
});

// POST /api/v1/procurement/goods-receipts/:id/complete - Complete goods receipt
router.post('/goods-receipts/:id/complete', authenticateToken, requirePermission('complete_goods_receipt'), receiptRateLimit, [
  param('id').isMongoId().withMessage('Invalid goods receipt ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const receipt = await GoodsReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }

    if (receipt.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted receipts can be completed' });
    }

    // Update status
    receipt.status = 'completed';
    receipt.updatedBy = req.user.userId;

    await receipt.save();

    // TODO: Update purchase order status
    // TODO: Update inventory if applicable
    // TODO: Create invoice in AP system

    res.json({
      success: true,
      message: 'Goods receipt completed successfully',
      data: receipt
    });
  } catch (error) {
    logger.error('Error completing goods receipt:', error);
    res.status(500).json({ success: false, message: 'Failed to complete goods receipt', error: error.message });
  }
});

// GET /api/v1/procurement/goods-receipts/:id/items - Get receipt items
router.get('/goods-receipts/:id/items', authenticateToken, requirePermission('read_procurement'), receiptRateLimit, [
  param('id').isMongoId().withMessage('Invalid goods receipt ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const receipt = await GoodsReceipt.findById(req.params.id).select('items');
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }

    res.json({
      success: true,
      data: receipt.items
    });
  } catch (error) {
    logger.error('Error fetching receipt items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch receipt items', error: error.message });
  }
});

// GET /api/v1/procurement/goods-receipts/pending-inspection - Get receipts pending inspection
router.get('/goods-receipts/pending-inspection', authenticateToken, requirePermission('read_procurement'), receiptRateLimit, async (req, res) => {
  try {
    const receipts = await GoodsReceipt.find({
      'quality.inspectionStatus': 'pending',
      status: { $in: ['received', 'inspected'] }
    })
    .populate('poId', 'poNumber supplierName')
    .populate('receivedBy', 'firstName lastName')
    .sort({ receivedDate: -1 })
    .lean();

    res.json({
      success: true,
      data: receipts
    });
  } catch (error) {
    logger.error('Error fetching receipts pending inspection:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch receipts pending inspection', error: error.message });
  }
});

module.exports = router;
