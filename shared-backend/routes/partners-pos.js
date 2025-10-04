const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const PartnerOrder = require('../models/PartnerOrder');
const PartnerPayment = require('../models/PartnerPayment');
const PartnerProduct = require('../models/PartnerProduct');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// @route   POST /partners/pos/sales
// @desc    Create new POS sale
// @access  Private
router.post('/pos/sales', auth, [
  body('items').isArray().withMessage('Items array is required'),
  body('items.*.sku').notEmpty().withMessage('Product SKU is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be numeric'),
  body('items.*.price').isNumeric().withMessage('Price must be numeric'),
  body('customerName').optional().isString(),
  body('customerPhone').optional().isString(),
  body('customerEmail').optional().isEmail(),
  body('paymentMethod').isIn(['cash', 'card', 'digital_wallet', 'bank_transfer']).withMessage('Valid payment method is required'),
  body('discount').optional().isNumeric(),
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      discount = 0,
      notes
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await PartnerProduct.findOne({ 
        sku: item.sku, 
        partnerId: partner.partnerId 
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with SKU ${item.sku} not found`
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        sku: item.sku,
        name: product.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: itemTotal
      });
    }

    // Calculate tax (assuming 14% VAT for Egypt)
    taxAmount = subtotal * 0.14;
    const totalAmount = subtotal + taxAmount - discount;

    // Generate order ID
    const orderId = `POS_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Create order
    const order = new PartnerOrder({
      orderId,
      partnerId: partner.partnerId,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      status: 'completed',
      paymentStatus: 'paid',
      items: processedItems,
      subtotal,
      taxAmount,
      discountAmount: discount,
      totalAmount,
      paymentMethod,
      notes,
      createdAt: new Date(),
      completedAt: new Date()
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await PartnerProduct.findOneAndUpdate(
        { sku: item.sku, partnerId: partner.partnerId },
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    // Create payment record
    const payment = new PartnerPayment({
      orderId: order._id,
      partnerId: partner.partnerId,
      amount: totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      transactionId: `TXN_${Date.now()}`,
      processedAt: new Date()
    });

    await payment.save();

    // Update partner earnings
    const partnerEarnings = totalAmount * 0.95; // 5% platform fee
    await PartnerUser.findByIdAndUpdate(partner._id, {
      $inc: { 
        'financial.weeklyIncome': partnerEarnings,
        'financial.totalEarnings': partnerEarnings 
      }
    });

    res.json({
      success: true,
      message: 'Sale completed successfully',
      data: {
        order,
        payment,
        receipt: {
          orderId: order.orderId,
          date: order.createdAt,
          items: processedItems,
          subtotal,
          taxAmount,
          discountAmount: discount,
          totalAmount,
          paymentMethod
        }
      }
    });

  } catch (error) {
    logger.error('Create POS sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/pos/refund
// @desc    Process refund for POS sale
// @access  Private
router.post('/pos/refund', auth, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('refundAmount').isNumeric().withMessage('Refund amount is required'),
  body('reason').notEmpty().withMessage('Refund reason is required'),
  body('items').optional().isArray()
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { orderId, refundAmount, reason, items = [] } = req.body;

    // Find order
    const order = await PartnerOrder.findOne({
      orderId,
      partnerId: partner.partnerId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed orders can be refunded'
      });
    }

    // Create refund record
    const refund = new PartnerPayment({
      orderId: order._id,
      partnerId: partner.partnerId,
      amount: -refundAmount, // Negative amount for refund
      paymentMethod: 'refund',
      paymentStatus: 'processed',
      transactionId: `REF_${Date.now()}`,
      notes: reason,
      processedAt: new Date()
    });

    await refund.save();

    // Update order status
    order.status = 'refunded';
    order.refundAmount = refundAmount;
    order.refundReason = reason;
    await order.save();

    // Restore stock if items specified
    for (const item of items) {
      await PartnerProduct.findOneAndUpdate(
        { sku: item.sku, partnerId: partner.partnerId },
        { $inc: { stockQuantity: item.quantity } }
      );
    }

    // Update partner earnings
    await PartnerUser.findByIdAndUpdate(partner._id, {
      $inc: { 
        'financial.weeklyIncome': -refundAmount,
        'financial.totalEarnings': -refundAmount 
      }
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund,
        order
      }
    });

  } catch (error) {
    logger.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/pos/close-shift
// @desc    Close POS shift and generate Z-report
// @access  Private
router.post('/pos/close-shift', auth, [
  body('shiftStart').notEmpty().withMessage('Shift start time is required'),
  body('cashDrawerAmount').isNumeric().withMessage('Cash drawer amount is required'),
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { shiftStart, cashDrawerAmount, notes } = req.body;
    const shiftEnd = new Date();

    // Get shift orders
    const orders = await PartnerOrder.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: new Date(shiftStart), $lte: shiftEnd },
      status: 'completed'
    });

    // Calculate shift totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const paymentMethods = orders.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.totalAmount;
      return acc;
    }, {});

    // Generate Z-report
    const zReport = {
      partnerId: partner.partnerId,
      businessName: partner.businessName,
      shiftStart: new Date(shiftStart),
      shiftEnd,
      totalOrders,
      totalRevenue,
      paymentMethods,
      cashDrawerAmount,
      expectedCashAmount: paymentMethods.cash || 0,
      variance: (paymentMethods.cash || 0) - cashDrawerAmount,
      orders: orders.map(order => ({
        orderId: order.orderId,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      })),
      generatedAt: new Date(),
      notes
    };

    // Store Z-report in database
    const zReportRecord = new (require('../models/ZReport'))(zReport);
    await zReportRecord.save();

    res.json({
      success: true,
      message: 'Shift closed successfully',
      data: zReport
    });

  } catch (error) {
    logger.error('Close shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/pos/shift-summary
// @desc    Get current shift summary
// @access  Private
router.get('/pos/shift-summary', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await PartnerOrder.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const summary = {
      date: today.toISOString().split('T')[0],
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      paymentMethods: orders.reduce((acc, order) => {
        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.totalAmount;
        return acc;
      }, {}),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      topProducts: await getTopProducts(orders),
      recentOrders: orders.slice(-10).map(order => ({
        orderId: order.orderId,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }))
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    logger.error('Get shift summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to get top products
async function getTopProducts(orders) {
  const productCounts = {};
  
  for (const order of orders) {
    for (const item of order.items) {
      const key = `${item.sku}_${item.name}`;
      productCounts[key] = (productCounts[key] || 0) + item.quantity;
    }
  }

  return Object.entries(productCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([key, quantity]) => {
      const [sku, name] = key.split('_');
      return { sku, name, quantity };
    });
}

module.exports = router;
