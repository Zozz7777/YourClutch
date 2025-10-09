const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/v1/partners/orders - Get all orders for partner
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      payment_status = '',
      start_date = '',
      end_date = '',
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const ordersCollection = await getCollection('orders');
    
    // Build query
    const query = { partnerId };
    
    if (status) {
      query.status = status;
    }
    
    if (payment_status) {
      query.paymentStatus = payment_status;
    }
    
    if (start_date && end_date) {
      query.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }
    
    // Build sort
    const sort = {};
    sort[sort_by] = sort_order === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const orders = await ordersCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await ordersCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/v1/partners/orders/:id - Get specific order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { id } = req.params;
    
    const ordersCollection = await getCollection('orders');
    const order = await ordersCollection.findOne({ 
      _id: id, 
      partnerId 
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// PATCH /api/v1/partners/orders/:id/status - Update order status
router.patch('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const ordersCollection = await getCollection('orders');
    
    // Check if order exists
    const existingOrder = await ordersCollection.findOne({ 
      _id: id, 
      partnerId 
    });
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    // Add status history
    updateData.statusHistory = existingOrder.statusHistory || [];
    updateData.statusHistory.push({
      status,
      changedBy: req.user.userId,
      changedAt: new Date().toISOString(),
      notes
    });
    
    const result = await ordersCollection.updateOne(
      { _id: id, partnerId },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: id,
        status,
        updatedAt: updateData.updatedAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// POST /api/v1/partners/orders/:id/acknowledge - Acknowledge order
router.post('/:id/acknowledge', authenticateToken, [
  body('estimated_ready_time').optional().isISO8601().withMessage('Invalid estimated ready time'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { id } = req.params;
    const { estimated_ready_time, notes } = req.body;
    
    const ordersCollection = await getCollection('orders');
    
    // Check if order exists and is in pending status
    const existingOrder = await ordersCollection.findOne({ 
      _id: id, 
      partnerId,
      status: 'pending'
    });
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not in pending status'
      });
    }
    
    const updateData = {
      status: 'confirmed',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: req.user.userId,
      updatedAt: new Date().toISOString()
    };
    
    if (estimated_ready_time) {
      updateData.estimatedReadyTime = new Date(estimated_ready_time);
    }
    
    if (notes) {
      updateData.acknowledgmentNotes = notes;
    }
    
    const result = await ordersCollection.updateOne(
      { _id: id, partnerId },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to acknowledge order'
      });
    }
    
    res.json({
      success: true,
      message: 'Order acknowledged successfully',
      data: {
        orderId: id,
        status: 'confirmed',
        acknowledgedAt: updateData.acknowledgedAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Acknowledge order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge order'
    });
  }
});

// POST /api/v1/partners/orders/:id/ready - Mark order as ready
router.post('/:id/ready', authenticateToken, [
  body('ready_time').optional().isISO8601().withMessage('Invalid ready time'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { id } = req.params;
    const { ready_time, notes } = req.body;
    
    const ordersCollection = await getCollection('orders');
    
    // Check if order exists and is in preparing status
    const existingOrder = await ordersCollection.findOne({ 
      _id: id, 
      partnerId,
      status: 'preparing'
    });
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not in preparing status'
      });
    }
    
    const updateData = {
      status: 'ready',
      readyAt: ready_time ? new Date(ready_time) : new Date().toISOString(),
      readyBy: req.user.userId,
      updatedAt: new Date().toISOString()
    };
    
    if (notes) {
      updateData.readyNotes = notes;
    }
    
    const result = await ordersCollection.updateOne(
      { _id: id, partnerId },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to mark order as ready'
      });
    }
    
    res.json({
      success: true,
      message: 'Order marked as ready successfully',
      data: {
        orderId: id,
        status: 'ready',
        readyAt: updateData.readyAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mark order ready error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark order as ready'
    });
  }
});

// POST /api/v1/partners/orders/:id/picked-up - Mark order as picked up
router.post('/:id/picked-up', authenticateToken, [
  body('picked_up_time').optional().isISO8601().withMessage('Invalid picked up time'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { id } = req.params;
    const { picked_up_time, notes } = req.body;
    
    const ordersCollection = await getCollection('orders');
    
    // Check if order exists and is in ready status
    const existingOrder = await ordersCollection.findOne({ 
      _id: id, 
      partnerId,
      status: 'ready'
    });
    
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not in ready status'
      });
    }
    
    const updateData = {
      status: 'picked_up',
      pickedUpAt: picked_up_time ? new Date(picked_up_time) : new Date().toISOString(),
      pickedUpBy: req.user.userId,
      updatedAt: new Date().toISOString()
    };
    
    if (notes) {
      updateData.pickedUpNotes = notes;
    }
    
    const result = await ordersCollection.updateOne(
      { _id: id, partnerId },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to mark order as picked up'
      });
    }
    
    res.json({
      success: true,
      message: 'Order marked as picked up successfully',
      data: {
        orderId: id,
        status: 'picked_up',
        pickedUpAt: updateData.pickedUpAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mark order picked up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark order as picked up'
    });
  }
});

// GET /api/v1/partners/orders/stats - Get order statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      end_date = new Date().toISOString()
    } = req.query;
    
    const ordersCollection = await getCollection('orders');
    
    // Get orders in date range
    const orders = await ordersCollection.find({
      partnerId,
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).toArray();
    
    // Calculate statistics
    const stats = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      status_breakdown: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}),
      payment_status_breakdown: orders.reduce((acc, order) => {
        acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
        return acc;
      }, {}),
      average_order_value: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length : 0,
      daily_orders: orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
      top_products: orders.reduce((acc, order) => {
        order.items?.forEach(item => {
          const key = item.productName || item.productId;
          acc[key] = (acc[key] || 0) + item.quantity;
        });
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

module.exports = router;
