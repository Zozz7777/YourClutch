const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const ProcurementPurchaseOrder = require('../models/ProcurementPurchaseOrder');
const ProcurementRequest = require('../models/ProcurementRequest');
const RFQ = require('../models/RFQ');
const ProcurementSupplier = require('../models/ProcurementSupplier');

// Rate limiting for PO operations
const poRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many PO requests from this IP, please try again later.'
});

// GET /api/v1/procurement/purchase-orders - List all purchase orders
router.get('/purchase-orders', authenticateToken, requirePermission('read_procurement'), poRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'issued', 'acknowledged', 'in_transit', 'partially_received', 'received', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('supplierId').optional().isMongoId().withMessage('Invalid supplier ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, status, supplierId, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [purchaseOrders, total] = await Promise.all([
      ProcurementPurchaseOrder.find(query)
        .populate('supplierId', 'supplierName contactInfo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProcurementPurchaseOrder.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: purchaseOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching purchase orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase orders', error: error.message });
  }
});

// POST /api/v1/procurement/purchase-orders - Create purchase order
router.post('/purchase-orders', authenticateToken, requirePermission('create_purchase_order'), poRateLimit, [
  body('procurementRequestId').optional().isMongoId().withMessage('Invalid procurement request ID'),
  body('rfqId').optional().isMongoId().withMessage('Invalid RFQ ID'),
  body('supplierId').isMongoId().withMessage('Invalid supplier ID'),
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.itemName').notEmpty().withMessage('Item name is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('items.*.category').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  body('delivery.expectedDeliveryDate').isISO8601().withMessage('Invalid expected delivery date format'),
  body('delivery.deliveryAddress').isObject().withMessage('Delivery address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { procurementRequestId, rfqId, supplierId, items, delivery, payment, terms } = req.body;

    // Generate PO number
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Get supplier details
    const supplier = await ProcurementSupplier.findById(supplierId).select('supplierName');
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const poData = {
      poNumber,
      procurementRequestId,
      rfqId,
      supplierId,
      supplierName: supplier.supplierName,
      items,
      totalAmount,
      delivery,
      payment: payment || { paymentTerms: 'net_30' },
      terms: terms || {},
      status: 'draft',
      timeline: {
        created: {
          date: new Date(),
          by: req.user.userId
        }
      },
      createdBy: req.user.userId
    };

    const newPO = new ProcurementPurchaseOrder(poData);
    await newPO.save();

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: newPO
    });
  } catch (error) {
    logger.error('Error creating purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to create purchase order', error: error.message });
  }
});

// GET /api/v1/procurement/purchase-orders/:id - Get purchase order details
router.get('/purchase-orders/:id', authenticateToken, requirePermission('read_procurement'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id)
      .populate('supplierId', 'supplierName contactInfo')
      .populate('procurementRequestId', 'requestNumber department')
      .populate('rfqId', 'rfqNumber');

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    logger.error('Error fetching purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase order', error: error.message });
  }
});

// PUT /api/v1/procurement/purchase-orders/:id - Update purchase order
router.put('/purchase-orders/:id', authenticateToken, requirePermission('update_purchase_order'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('delivery.expectedDeliveryDate').optional().isISO8601().withMessage('Invalid expected delivery date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft purchase orders can be updated' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedPO = await ProcurementPurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Purchase order updated successfully',
      data: updatedPO
    });
  } catch (error) {
    logger.error('Error updating purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to update purchase order', error: error.message });
  }
});

// POST /api/v1/procurement/purchase-orders/:id/issue - Issue purchase order
router.post('/purchase-orders/:id/issue', authenticateToken, requirePermission('issue_purchase_order'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft purchase orders can be issued' });
    }

    // Update status and timeline
    purchaseOrder.status = 'issued';
    purchaseOrder.timeline.issued = {
      date: new Date(),
      by: req.user.userId
    };
    purchaseOrder.updatedBy = req.user.userId;

    await purchaseOrder.save();

    // TODO: Generate PDF and send to supplier
    // TODO: Update procurement request status if linked

    res.json({
      success: true,
      message: 'Purchase order issued successfully',
      data: purchaseOrder
    });
  } catch (error) {
    logger.error('Error issuing purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to issue purchase order', error: error.message });
  }
});

// POST /api/v1/procurement/purchase-orders/:id/acknowledge - Acknowledge purchase order
router.post('/purchase-orders/:id/acknowledge', authenticateToken, requirePermission('acknowledge_purchase_order'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),
  body('supplierConfirmation').optional().isString().withMessage('Supplier confirmation must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { supplierConfirmation } = req.body;
    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Purchase order must be issued before acknowledgment' });
    }

    // Update status and timeline
    purchaseOrder.status = 'acknowledged';
    purchaseOrder.timeline.acknowledged = {
      date: new Date(),
      by: req.user.userId,
      supplierConfirmation
    };
    purchaseOrder.updatedBy = req.user.userId;

    await purchaseOrder.save();

    res.json({
      success: true,
      message: 'Purchase order acknowledged successfully',
      data: purchaseOrder
    });
  } catch (error) {
    logger.error('Error acknowledging purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge purchase order', error: error.message });
  }
});

// POST /api/v1/procurement/purchase-orders/:id/ship - Mark as shipped
router.post('/purchase-orders/:id/ship', authenticateToken, requirePermission('update_purchase_order'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),
  body('trackingNumber').optional().isString().withMessage('Tracking number must be a string'),
  body('carrier').optional().isString().withMessage('Carrier must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { trackingNumber, carrier } = req.body;
    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'acknowledged') {
      return res.status(400).json({ success: false, message: 'Purchase order must be acknowledged before shipping' });
    }

    // Update status and timeline
    purchaseOrder.status = 'in_transit';
    purchaseOrder.delivery.trackingNumber = trackingNumber;
    purchaseOrder.delivery.carrier = carrier;
    purchaseOrder.timeline.shipped = {
      date: new Date(),
      trackingNumber,
      carrier
    };
    purchaseOrder.updatedBy = req.user.userId;

    await purchaseOrder.save();

    res.json({
      success: true,
      message: 'Purchase order marked as shipped',
      data: purchaseOrder
    });
  } catch (error) {
    logger.error('Error marking purchase order as shipped:', error);
    res.status(500).json({ success: false, message: 'Failed to mark purchase order as shipped', error: error.message });
  }
});

// POST /api/v1/procurement/purchase-orders/:id/receive - Mark as received
router.post('/purchase-orders/:id/receive', authenticateToken, requirePermission('receive_goods'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),
  body('receiptId').isMongoId().withMessage('Invalid receipt ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { receiptId } = req.body;
    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (!['in_transit', 'partially_received'].includes(purchaseOrder.status)) {
      return res.status(400).json({ success: false, message: 'Purchase order must be in transit or partially received' });
    }

    // Update status and timeline
    purchaseOrder.status = 'received';
    purchaseOrder.timeline.received = {
      date: new Date(),
      by: req.user.userId,
      receiptId
    };
    purchaseOrder.updatedBy = req.user.userId;

    await purchaseOrder.save();

    res.json({
      success: true,
      message: 'Purchase order marked as received',
      data: purchaseOrder
    });
  } catch (error) {
    logger.error('Error marking purchase order as received:', error);
    res.status(500).json({ success: false, message: 'Failed to mark purchase order as received', error: error.message });
  }
});

// POST /api/v1/procurement/purchase-orders/:id/complete - Complete purchase order
router.post('/purchase-orders/:id/complete', authenticateToken, requirePermission('complete_purchase_order'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (purchaseOrder.status !== 'received') {
      return res.status(400).json({ success: false, message: 'Purchase order must be received before completion' });
    }

    // Update status
    purchaseOrder.status = 'completed';
    purchaseOrder.updatedBy = req.user.userId;

    await purchaseOrder.save();

    // TODO: Update procurement request status if linked
    // TODO: Create invoice in AP system

    res.json({
      success: true,
      message: 'Purchase order completed successfully',
      data: purchaseOrder
    });
  } catch (error) {
    logger.error('Error completing purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to complete purchase order', error: error.message });
  }
});

// POST /api/v1/procurement/purchase-orders/:id/cancel - Cancel purchase order
router.post('/purchase-orders/:id/cancel', authenticateToken, requirePermission('cancel_purchase_order'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { reason } = req.body;
    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (['completed', 'cancelled'].includes(purchaseOrder.status)) {
      return res.status(400).json({ success: false, message: 'Purchase order cannot be cancelled' });
    }

    // Update status
    purchaseOrder.status = 'cancelled';
    purchaseOrder.comments.push({
      comment: `Cancelled: ${reason}`,
      commentedBy: req.user.userId,
      commentedAt: new Date()
    });
    purchaseOrder.updatedBy = req.user.userId;

    await purchaseOrder.save();

    res.json({
      success: true,
      message: 'Purchase order cancelled successfully',
      data: purchaseOrder
    });
  } catch (error) {
    logger.error('Error cancelling purchase order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel purchase order', error: error.message });
  }
});

// GET /api/v1/procurement/purchase-orders/:id/timeline - Get purchase order timeline
router.get('/purchase-orders/:id/timeline', authenticateToken, requirePermission('read_procurement'), poRateLimit, [
  param('id').isMongoId().withMessage('Invalid purchase order ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const purchaseOrder = await ProcurementPurchaseOrder.findById(req.params.id).select('timeline status');
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.json({
      success: true,
      data: {
        timeline: purchaseOrder.timeline,
        status: purchaseOrder.status
      }
    });
  } catch (error) {
    logger.error('Error fetching purchase order timeline:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchase order timeline', error: error.message });
  }
});

module.exports = router;
