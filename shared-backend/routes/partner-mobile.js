const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const PartnerOrder = require('../models/PartnerOrder');
const PartnerPayment = require('../models/PartnerPayment');
const PartnerRequest = require('../models/PartnerRequest');
const { authenticateToken: auth } = require('../middleware/auth');
const { logger } = require('../config/logger');

const router = express.Router();

// Helper functions
const sendAdminNotification = async (type, data) => {
  try {
    logger.info(`📧 Sending admin notification: ${type}`, data);
    
    // Send notification to Clutch admin sales team
    const notificationData = {
      type: 'new_partner_request',
      title: 'New Partner Request',
      message: `New partner request from ${data.businessName} (${data.ownerName})`,
      data: {
        requestId: data.requestId,
        businessName: data.businessName,
        ownerName: data.ownerName,
        partnerType: data.partnerType,
        email: data.email,
        phone: data.phone,
        timestamp: new Date().toISOString()
      },
      priority: 'high',
      recipients: ['sales@clutch.com', 'admin@clutch.com']
    };
    
    // Log the notification (in production, this would send to actual notification service)
    console.log('📧 Admin Notification:', JSON.stringify(notificationData, null, 2));
    
    // TODO: Integrate with actual notification service (email, SMS, push notifications)
    // await emailService.sendEmail(recipients, title, message);
    // await smsService.sendSMS(phone, message);
    // await pushService.sendPush(adminTokens, notification);
    
    return true;
  } catch (error) {
    logger.error('Error sending admin notification:', error);
    return false;
  }
};

const sendCustomerNotification = async (order, type, data) => {
  try {
    logger.info(`Sending customer notification: ${type}`, data);
    // In production, this would send actual notifications to customer
    return true;
  } catch (error) {
    logger.error('Error sending customer notification:', error);
    return false;
  }
};

// ============================================================================
// MOBILE PARTNERS APP ENDPOINTS
// ============================================================================

// @route   POST /partners/auth/request-to-join
// @desc    Request to join as partner
// @access  Public
router.post('/auth/request-to-join', [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('ownerName').notEmpty().withMessage('Owner name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required').custom((value) => {
    // Egyptian phone number validation (11 digits starting with 01)
    const egyptianPhoneRegex = /^01[0-9]{9}$/;
    if (!egyptianPhoneRegex.test(value)) {
      throw new Error('Please enter a valid Egyptian phone number (11 digits starting with 01)');
    }
    return true;
  }),
  body('email').isEmail().withMessage('Valid email is required').custom((value) => {
    // Check for proper email format with domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      throw new Error('Please enter a valid email address with proper domain');
    }
    return true;
  }),
  body('address').notEmpty().withMessage('Address is required'),
  body('partnerType').isIn(['repair_center', 'auto_parts_shop', 'accessories_shop', 'importer_manufacturer', 'service_center']).withMessage('Valid partner type is required')
], async (req, res) => {
  try {
    // Request to join received - debug logging removed for performance
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Validation errors logged via proper logger
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      businessName,
      ownerName,
      phone,
      email,
      address,
      partnerType,
      businessDescription,
      yearsInBusiness,
      website,
      socialMedia
    } = req.body;
    
    console.log('📝 BACKEND: Processing request to join for:', businessName, 'by', ownerName);

    // Check if request already exists - optimized query
    console.log('📝 BACKEND: Checking for existing request...');
    const startTime = Date.now();
    
    // Check by email first (faster with index)
    const existingByEmail = await PartnerRequest.findOne({ email: email.toLowerCase() });
    console.log(`📝 BACKEND: Email check took: ${Date.now() - startTime}ms`);
    
    let existingRequest = existingByEmail;
    
    // Only check by phone if email not found
    if (!existingRequest) {
      const phoneCheckStart = Date.now();
      const existingByPhone = await PartnerRequest.findOne({ phone });
      console.log(`📝 BACKEND: Phone check took: ${Date.now() - phoneCheckStart}ms`);
      existingRequest = existingByPhone;
    }
    
    console.log(`📝 BACKEND: Total duplicate check took: ${Date.now() - startTime}ms`);
    console.log('📝 BACKEND: Existing request found:', existingRequest ? 'YES' : 'NO');

    if (existingRequest) {
      console.log('ℹ️ BACKEND: Request already exists for:', email, 'or', phone);
      return res.status(200).json({
        success: true,
        message: 'Your request is already being processed. Our sales team will contact you shortly.',
        data: {
          requestId: existingRequest._id,
          status: existingRequest.status,
          submittedAt: existingRequest.submittedAt,
          estimatedResponseTime: '24-48 hours'
        }
      });
    }

    // Create partner request
    const requestData = {
      businessName,
      ownerName,
      phone,
      email: email.toLowerCase(),
      address,
      partnerType,
      businessDescription,
      yearsInBusiness,
      website,
      socialMedia,
      status: 'pending',
      submittedAt: new Date()
    };

    console.log('📝 BACKEND: Creating new partner request...');
    const saveStartTime = Date.now();
    const partnerRequest = new PartnerRequest(requestData);
    await partnerRequest.save();
    console.log(`📝 BACKEND: Partner request saved in ${Date.now() - saveStartTime}ms with ID:`, partnerRequest._id);

    // Notify admin team
    console.log('📝 BACKEND: Sending admin notification...');
    const notificationStartTime = Date.now();
    await sendAdminNotification('new_partner_request', {
      requestId: partnerRequest._id,
      businessName,
      ownerName,
      partnerType,
      email,
      phone
    });
    console.log(`📝 BACKEND: Admin notification sent in ${Date.now() - notificationStartTime}ms`);

    console.log('✅ BACKEND: Request to join completed successfully');
    res.status(201).json({
      success: true,
      message: 'Request submitted successfully. Our sales team will review your application and contact you within 24-48 hours.',
      data: {
        requestId: partnerRequest._id,
        status: partnerRequest.status,
        estimatedResponseTime: '24-48 hours'
      }
    });

  } catch (error) {
    console.log('❌ BACKEND: Request to join error:', error.message);
    console.log('❌ BACKEND: Error stack:', error.stack);
    logger.error('Request to join error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/orders
// @desc    Get partner orders for mobile app
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, page = 1, limit = 20, date } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.status = status;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Get orders with pagination
    const orders = await PartnerOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name phone email')
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    // Format orders for mobile display
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderId: order.orderId,
      customer: {
        name: order.customerName || order.customerId?.name,
        phone: order.customerPhone || order.customerId?.phone,
        email: order.customerEmail || order.customerId?.email
      },
      service: order.serviceName,
      description: order.description,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      scheduledDate: order.scheduledDate,
      estimatedTime: order.estimatedTime,
      createdAt: order.createdAt,
      isUrgent: order.priority === 'high'
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/orders/:id/status
// @desc    Update order status
// @access  Private
router.patch('/orders/:id/status', auth, [
  body('status').isIn(['acknowledged', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled']).withMessage('Valid status is required')
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

    const { id: orderId } = req.params;
    const { status, notes, estimatedTime } = req.body;
    const partnerId = req.user.partnerId;

    const order = await PartnerOrder.findOne({ _id: orderId, partnerId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    if (notes) order.notes = notes;
    if (estimatedTime) order.estimatedTime = estimatedTime;
    
    // Set timestamps based on status
    switch (status) {
      case 'acknowledged':
        order.acknowledgedAt = new Date();
        break;
      case 'preparing':
        order.preparingAt = new Date();
        break;
      case 'ready':
        order.readyAt = new Date();
        break;
      case 'picked_up':
        order.pickedUpAt = new Date();
        break;
      case 'delivered':
        order.deliveredAt = new Date();
        break;
    }

    await order.save();

    // Send notification to customer
    await sendCustomerNotification(order, 'order_status_update', {
      orderId: order.orderId,
      status,
      partnerName: order.partnerName,
      estimatedTime
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        id: order._id,
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/invoices
// @desc    Get partner invoices
// @access  Private
router.get('/invoices', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, page = 1, limit = 20, date } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.paymentStatus = status;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Get invoices (orders with payment info)
    const invoices = await PartnerOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name phone email')
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    // Format invoices for mobile display
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice._id,
      invoiceId: invoice.orderId,
      customer: {
        name: invoice.customerName || invoice.customerId?.name,
        phone: invoice.customerPhone || invoice.customerId?.phone
      },
      service: invoice.serviceName,
      total: invoice.total,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod,
      createdAt: invoice.createdAt,
      paidAt: invoice.paidAt,
      isPaid: invoice.paymentStatus === 'paid',
      isPending: invoice.paymentStatus === 'pending',
      isRejected: invoice.paymentStatus === 'rejected'
    }));

    res.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/invoices/:id/status
// @desc    Update invoice status
// @access  Private
router.patch('/invoices/:id/status', auth, [
  body('paymentStatus').isIn(['pending', 'paid', 'rejected', 'refunded']).withMessage('Valid payment status is required')
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

    const { id: invoiceId } = req.params;
    const { paymentStatus, notes } = req.body;
    const partnerId = req.user.partnerId;

    const invoice = await PartnerOrder.findOne({ _id: invoiceId, partnerId });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Update payment status
    invoice.paymentStatus = paymentStatus;
    if (notes) invoice.notes = notes;
    
    if (paymentStatus === 'paid') {
      invoice.paidAt = new Date();
      invoice.status = 'paid';
    } else if (paymentStatus === 'rejected') {
      invoice.rejectedAt = new Date();
      invoice.status = 'payment_rejected';
    }

    await invoice.save();

    // Send notification to customer
    await sendCustomerNotification(invoice, 'payment_status_update', {
      invoiceId: invoice.orderId,
      paymentStatus,
      total: invoice.total
    });

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: {
        id: invoice._id,
        invoiceId: invoice.orderId,
        paymentStatus: invoice.paymentStatus,
        updatedAt: invoice.updatedAt
      }
    });

  } catch (error) {
    logger.error('Update invoice status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/payments/weekly
// @desc    Get weekly payment summary
// @access  Private
router.get('/payments/weekly', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { week } = req.query;

    // Calculate week date range
    let weekStart, weekEnd;
    if (week) {
      weekStart = new Date(week);
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
    } else {
      // Current week
      const now = new Date();
      weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
    }

    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);

    // Get weekly payments
    const payments = await PartnerPayment.find({
      partnerId,
      paymentStatus: 'paid',
      processedAt: { $gte: weekStart, $lte: weekEnd }
    }).lean();

    // Calculate totals
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOrders = payments.length;
    
    const dailyBreakdown = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyBreakdown[dateStr] = {
        date: dateStr,
        earnings: 0,
        orders: 0
      };
    }

    payments.forEach(payment => {
      const dateStr = payment.processedAt.toISOString().split('T')[0];
      if (dailyBreakdown[dateStr]) {
        dailyBreakdown[dateStr].earnings += payment.amount;
        dailyBreakdown[dateStr].orders += 1;
      }
    });

    // Calculate next payout
    const nextPayoutDate = new Date(weekEnd);
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 1);
    const daysUntilPayout = Math.ceil((nextPayoutDate - new Date()) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      data: {
        week: {
          start: weekStart.toISOString().split('T')[0],
          end: weekEnd.toISOString().split('T')[0]
        },
        summary: {
          totalEarnings,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? (totalEarnings / totalOrders).toFixed(2) : 0
        },
        dailyBreakdown: Object.values(dailyBreakdown),
        nextPayout: {
          date: nextPayoutDate.toISOString().split('T')[0],
          daysUntil: Math.max(0, daysUntilPayout),
          amount: totalEarnings
        }
      }
    });

  } catch (error) {
    logger.error('Get weekly payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/payments/history
// @desc    Get payment history
// @access  Private
router.get('/payments/history', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { page = 1, limit = 20, status } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.paymentStatus = status;
    }

    // Get payment history
    const payments = await PartnerPayment.find(query)
      .sort({ processedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('orderId', 'orderId serviceName customerName')
      .lean();

    const total = await PartnerPayment.countDocuments(query);

    // Format payments for mobile display
    const formattedPayments = payments.map(payment => ({
      id: payment._id,
      paymentId: payment.paymentId,
      orderId: payment.orderId?.orderId,
      service: payment.orderId?.serviceName,
      customer: payment.orderId?.customerName,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      processedAt: payment.processedAt,
      isPaid: payment.paymentStatus === 'paid',
      isPending: payment.paymentStatus === 'pending',
      isRejected: payment.paymentStatus === 'rejected'
    }));

    res.json({
      success: true,
      data: {
        payments: formattedPayments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/settings
// @desc    Get partner settings
// @access  Private
router.get('/settings', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: {
        businessName: partner.businessName,
        ownerName: partner.ownerName,
        email: partner.email,
        phone: partner.phone,
        partnerType: partner.partnerType,
        businessAddress: partner.businessAddress,
        workingHours: partner.workingHours,
        businessSettings: partner.businessSettings,
        notificationPreferences: partner.notificationPreferences,
        isVerified: partner.isVerified,
        status: partner.status
      }
    });

  } catch (error) {
    logger.error('Get partner settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/settings
// @desc    Update partner settings
// @access  Private
router.patch('/settings', auth, [
  body('businessName').optional().notEmpty().withMessage('Business name cannot be empty'),
  body('ownerName').optional().notEmpty().withMessage('Owner name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required')
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

    const partnerId = req.user.partnerId;
    const updateData = req.body;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'businessName', 'ownerName', 'phone', 'email',
      'businessAddress', 'workingHours', 'businessSettings',
      'notificationPreferences'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        partner[field] = updateData[field];
      }
    });

    await partner.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        businessName: partner.businessName,
        ownerName: partner.ownerName,
        email: partner.email,
        phone: partner.phone,
        businessAddress: partner.businessAddress,
        workingHours: partner.workingHours,
        businessSettings: partner.businessSettings,
        notificationPreferences: partner.notificationPreferences
      }
    });

  } catch (error) {
    logger.error('Update partner settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/dashboard/revenue
// @desc    Get revenue dashboard data
// @access  Private
router.get('/dashboard/revenue', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get revenue data
    const payments = await PartnerPayment.find({
      partnerId,
      paymentStatus: 'paid',
      processedAt: { $gte: startDate, $lte: endDate }
    }).lean();

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOrders = payments.length;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // Daily breakdown
    const dailyRevenue = {};
    payments.forEach(payment => {
      const date = payment.processedAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount;
    });

    // Payment method breakdown
    const paymentMethodBreakdown = {};
    payments.forEach(payment => {
      paymentMethodBreakdown[payment.paymentMethod] = 
        (paymentMethodBreakdown[payment.paymentMethod] || 0) + payment.amount;
    });

    res.json({
      success: true,
      data: {
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
        },
        dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
          date,
          revenue
        })),
        paymentMethodBreakdown
      }
    });

  } catch (error) {
    logger.error('Get revenue dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================================================
// APPOINTMENTS ENDPOINTS
// ============================================================================

// @route   GET /partners/appointments
// @desc    Get partner appointments
// @access  Private
router.get('/appointments', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, date, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { partnerId };
    if (status) {
      query.status = status;
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Get appointments with pagination
    const appointments = await PartnerOrder.find(query)
      .sort({ scheduledDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name phone email')
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    // Format appointments for mobile display
    const formattedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      appointmentId: appointment.orderId,
      customer: {
        name: appointment.customerName || appointment.customerId?.name,
        phone: appointment.customerPhone || appointment.customerId?.phone,
        email: appointment.customerEmail || appointment.customerId?.email
      },
      vehicle: {
        make: appointment.vehicleMake,
        model: appointment.vehicleModel,
        year: appointment.vehicleYear,
        plate: appointment.vehiclePlate
      },
      service: appointment.serviceName,
      description: appointment.description,
      scheduledDate: appointment.scheduledDate,
      estimatedTime: appointment.estimatedTime,
      status: appointment.status,
      priority: appointment.priority,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      isUrgent: appointment.priority === 'high'
    }));

    res.json({
      success: true,
      data: {
        appointments: formattedAppointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/appointments/:id
// @desc    Get appointment details
// @access  Private
router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.user.partnerId;

    const appointment = await PartnerOrder.findOne({ _id: id, partnerId })
      .populate('customerId', 'name phone email')
      .lean();

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: appointment._id,
        appointmentId: appointment.orderId,
        customer: {
          name: appointment.customerName || appointment.customerId?.name,
          phone: appointment.customerPhone || appointment.customerId?.phone,
          email: appointment.customerEmail || appointment.customerId?.email
        },
        vehicle: {
          make: appointment.vehicleMake,
          model: appointment.vehicleModel,
          year: appointment.vehicleYear,
          plate: appointment.vehiclePlate
        },
        service: appointment.serviceName,
        description: appointment.description,
        scheduledDate: appointment.scheduledDate,
        estimatedTime: appointment.estimatedTime,
        status: appointment.status,
        priority: appointment.priority,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      }
    });

  } catch (error) {
    logger.error('Get appointment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/appointments
// @desc    Create appointment (for walk-ins)
// @access  Private
router.post('/appointments', auth, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').isMobilePhone().withMessage('Valid phone number is required'),
  body('serviceName').notEmpty().withMessage('Service name is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
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

    const partnerId = req.user.partnerId;
    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      description,
      scheduledDate,
      estimatedTime,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehiclePlate,
      priority = 'normal'
    } = req.body;

    // Create appointment
    const appointment = new PartnerOrder({
      partnerId,
      orderId: `APT-${Date.now()}`,
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      description,
      scheduledDate: new Date(scheduledDate),
      estimatedTime,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehiclePlate,
      priority,
      status: 'scheduled',
      paymentStatus: 'pending',
      total: 0 // Will be updated when invoice is created
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        id: appointment._id,
        appointmentId: appointment.orderId,
        customer: {
          name: appointment.customerName,
          phone: appointment.customerPhone,
          email: appointment.customerEmail
        },
        service: appointment.serviceName,
        scheduledDate: appointment.scheduledDate,
        status: appointment.status
      }
    });

  } catch (error) {
    logger.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.patch('/appointments/:id/status', auth, [
  body('status').isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Valid status is required')
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

    const { id } = req.params;
    const { status, notes, estimatedTime } = req.body;
    const partnerId = req.user.partnerId;

    const appointment = await PartnerOrder.findOne({ _id: id, partnerId });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment status
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (estimatedTime) appointment.estimatedTime = estimatedTime;
    
    // Set timestamps based on status
    switch (status) {
      case 'confirmed':
        appointment.confirmedAt = new Date();
        break;
      case 'in_progress':
        appointment.startedAt = new Date();
        break;
      case 'completed':
        appointment.completedAt = new Date();
        break;
      case 'cancelled':
        appointment.cancelledAt = new Date();
        break;
    }

    await appointment.save();

    // Send notification to customer
    await sendCustomerNotification(appointment, 'appointment_status_update', {
      appointmentId: appointment.orderId,
      status,
      partnerName: appointment.partnerName,
      scheduledDate: appointment.scheduledDate
    });

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: {
        id: appointment._id,
        appointmentId: appointment.orderId,
        status: appointment.status,
        updatedAt: appointment.updatedAt
      }
    });

  } catch (error) {
    logger.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================================================
// QUOTATIONS ENDPOINTS
// ============================================================================

// @route   GET /partners/quotations
// @desc    Get partner quotations
// @access  Private
router.get('/quotations', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { partnerId, type: 'quotation' };
    if (status) {
      query.status = status;
    }

    // Get quotations with pagination
    const quotations = await PartnerOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name phone email')
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    // Format quotations for mobile display
    const formattedQuotations = quotations.map(quotation => ({
      id: quotation._id,
      quotationId: quotation.orderId,
      customer: {
        name: quotation.customerName || quotation.customerId?.name,
        phone: quotation.customerPhone || quotation.customerId?.phone,
        email: quotation.customerEmail || quotation.customerId?.email
      },
      service: quotation.serviceName,
      description: quotation.description,
      total: quotation.total,
      status: quotation.status,
      validUntil: quotation.validUntil,
      createdAt: quotation.createdAt,
      isExpired: quotation.validUntil && new Date(quotation.validUntil) < new Date()
    }));

    res.json({
      success: true,
      data: {
        quotations: formattedQuotations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/quotations
// @desc    Create quotation
// @access  Private
router.post('/quotations', auth, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').isMobilePhone().withMessage('Valid phone number is required'),
  body('serviceName').notEmpty().withMessage('Service name is required'),
  body('total').isNumeric().withMessage('Valid total amount is required')
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

    const partnerId = req.user.partnerId;
    const {
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      description,
      total,
      validUntil,
      items = []
    } = req.body;

    // Create quotation
    const quotation = new PartnerOrder({
      partnerId,
      orderId: `QUO-${Date.now()}`,
      type: 'quotation',
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      description,
      total: parseFloat(total),
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
      items,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await quotation.save();

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: {
        id: quotation._id,
        quotationId: quotation.orderId,
        customer: {
          name: quotation.customerName,
          phone: quotation.customerPhone,
          email: quotation.customerEmail
        },
        service: quotation.serviceName,
        total: quotation.total,
        validUntil: quotation.validUntil,
        status: quotation.status
      }
    });

  } catch (error) {
    logger.error('Create quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================================================
// INVENTORY ENDPOINTS
// ============================================================================

// @route   GET /partners/inventory
// @desc    Get partner inventory
// @access  Private
router.get('/inventory', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { category, status, page = 1, limit = 20, search } = req.query;

    // Build query
    const query = { partnerId };
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get inventory with pagination
    const inventory = await PartnerOrder.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await PartnerOrder.countDocuments(query);

    // Format inventory for mobile display
    const formattedInventory = inventory.map(item => ({
      id: item._id,
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      cost: item.cost,
      stock: item.stock,
      minStock: item.minStock,
      maxStock: item.maxStock,
      status: item.status,
      isLowStock: item.stock <= item.minStock,
      isOutOfStock: item.stock === 0,
      lastUpdated: item.updatedAt,
      image: item.image
    }));

    res.json({
      success: true,
      data: {
        inventory: formattedInventory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get partner inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/inventory
// @desc    Add inventory item
// @access  Private
router.post('/inventory', auth, [
  body('name').notEmpty().withMessage('Item name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
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

    const partnerId = req.user.partnerId;
    const {
      name,
      sku,
      description,
      category,
      price,
      cost,
      stock,
      minStock = 5,
      maxStock,
      image
    } = req.body;

    // Generate SKU if not provided
    const itemSku = sku || `SKU-${Date.now()}`;

    // Create inventory item
    const item = new PartnerOrder({
      partnerId,
      sku: itemSku,
      name,
      description,
      category,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : 0,
      stock: parseInt(stock),
      minStock: parseInt(minStock),
      maxStock: maxStock ? parseInt(maxStock) : null,
      image,
      status: 'active',
      type: 'inventory'
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: {
        id: item._id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        price: item.price,
        stock: item.stock,
        status: item.status
      }
    });

  } catch (error) {
    logger.error('Add inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/inventory/:id
// @desc    Update inventory item
// @access  Private
router.patch('/inventory/:id', auth, [
  body('price').optional().isNumeric().withMessage('Valid price is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock quantity is required')
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

    const { id } = req.params;
    const partnerId = req.user.partnerId;
    const updateData = req.body;

    const item = await PartnerOrder.findOne({ _id: id, partnerId, type: 'inventory' });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Update allowed fields
    const allowedFields = ['name', 'description', 'category', 'price', 'cost', 'stock', 'minStock', 'maxStock', 'status', 'image'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        item[field] = updateData[field];
      }
    });

    await item.save();

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        id: item._id,
        sku: item.sku,
        name: item.name,
        price: item.price,
        stock: item.stock,
        status: item.status
      }
    });

  } catch (error) {
    logger.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================================================
// ENHANCED PROFILE & WORKING HOURS ENDPOINTS
// ============================================================================

// @route   GET /partners/profile
// @desc    Get partner profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: {
        businessName: partner.businessName,
        ownerName: partner.ownerName,
        email: partner.email,
        phone: partner.phone,
        partnerType: partner.partnerType,
        businessAddress: partner.businessAddress,
        workingHours: partner.workingHours,
        businessSettings: partner.businessSettings,
        services: partner.services || [],
        isConnectedToPOS: partner.isConnectedToPOS || false,
        isVerified: partner.isVerified,
        status: partner.status,
        createdAt: partner.createdAt
      }
    });

  } catch (error) {
    logger.error('Get partner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/profile
// @desc    Update partner profile
// @access  Private
router.patch('/profile', auth, [
  body('businessName').optional().notEmpty().withMessage('Business name cannot be empty'),
  body('ownerName').optional().notEmpty().withMessage('Owner name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required')
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

    const partnerId = req.user.partnerId;
    const updateData = req.body;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'businessName', 'ownerName', 'phone', 'email',
      'businessAddress', 'workingHours', 'businessSettings',
      'services', 'isConnectedToPOS'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        partner[field] = updateData[field];
      }
    });

    await partner.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        businessName: partner.businessName,
        ownerName: partner.ownerName,
        email: partner.email,
        phone: partner.phone,
        businessAddress: partner.businessAddress,
        workingHours: partner.workingHours,
        businessSettings: partner.businessSettings,
        services: partner.services,
        isConnectedToPOS: partner.isConnectedToPOS
      }
    });

  } catch (error) {
    logger.error('Update partner profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/working-hours
// @desc    Update working hours
// @access  Private
router.patch('/working-hours', auth, [
  body('workingHours').isObject().withMessage('Working hours object is required')
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

    const partnerId = req.user.partnerId;
    const { workingHours } = req.body;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    partner.workingHours = workingHours;
    await partner.save();

    res.json({
      success: true,
      message: 'Working hours updated successfully',
      data: {
        workingHours: partner.workingHours
      }
    });

  } catch (error) {
    logger.error('Update working hours error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/services
// @desc    Update services offered
// @access  Private
router.patch('/services', auth, [
  body('services').isArray().withMessage('Services array is required')
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

    const partnerId = req.user.partnerId;
    const { services } = req.body;

    const partner = await PartnerUser.findOne({ partnerId });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    partner.services = services;
    await partner.save();

    res.json({
      success: true,
      message: 'Services updated successfully',
      data: {
        services: partner.services
      }
    });

  } catch (error) {
    logger.error('Update services error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================================================
// APPOINTMENTS ENDPOINTS
// ============================================================================

const PartnerAppointment = require('../models/PartnerAppointment');
const PartnerQuote = require('../models/PartnerQuote');
const PartnerInventory = require('../models/PartnerInventory');

// @route   GET /partners/appointments
// @desc    Get partner appointments with filters
// @access  Private
router.get('/appointments', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, date, serviceType, page = 1, limit = 20 } = req.query;

    const query = { partnerId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }
    
    if (serviceType) {
      query.serviceType = serviceType;
    }

    const appointments = await PartnerAppointment.find(query)
      .sort({ scheduledDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PartnerAppointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    logger.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/appointments/:id
// @desc    Get appointment details
// @access  Private
router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const appointmentId = req.params.id;

    const appointment = await PartnerAppointment.findOne({
      _id: appointmentId,
      partnerId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    logger.error('Get appointment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/appointments
// @desc    Create new appointment
// @access  Private
router.post('/appointments', auth, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('vehicleInfo.make').notEmpty().withMessage('Vehicle make is required'),
  body('vehicleInfo.model').notEmpty().withMessage('Vehicle model is required'),
  body('serviceType').isIn(['maintenance', 'repair', 'inspection', 'diagnostic', 'installation', 'consultation']).withMessage('Valid service type is required'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
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

    const partnerId = req.user.partnerId;
    const appointmentData = {
      ...req.body,
      partnerId
    };

    const appointment = new PartnerAppointment(appointmentData);
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });

  } catch (error) {
    logger.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/appointments/:id/status
// @desc    Update appointment status
// @access  Private
router.patch('/appointments/:id/status', auth, [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).withMessage('Valid status is required')
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

    const partnerId = req.user.partnerId;
    const appointmentId = req.params.id;
    const { status } = req.body;

    const appointment = await PartnerAppointment.findOne({
      _id: appointmentId,
      partnerId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    
    // Update completion data if status is completed
    if (status === 'completed') {
      appointment.completion.completed = true;
      appointment.completion.completedAt = new Date();
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });

  } catch (error) {
    logger.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================================================
// QUOTATIONS ENDPOINTS
// ============================================================================

// @route   GET /partners/quotations
// @desc    Get partner quotations
// @access  Private
router.get('/quotations', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status, quoteType, page = 1, limit = 20 } = req.query;

    const query = { partnerId };
    
    if (status) {
      query.status = status;
    }
    
    if (quoteType) {
      query.quoteType = quoteType;
    }

    const quotations = await PartnerQuote.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PartnerQuote.countDocuments(query);

    res.json({
      success: true,
      data: {
        quotations,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    logger.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/quotations/:id
// @desc    Get quotation details
// @access  Private
router.get('/quotations/:id', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const quotationId = req.params.id;

    const quotation = await PartnerQuote.findOne({
      _id: quotationId,
      partnerId
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      data: quotation
    });

  } catch (error) {
    logger.error('Get quotation details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/quotations
// @desc    Create new quotation
// @access  Private
router.post('/quotations', auth, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('vehicleInfo.make').notEmpty().withMessage('Vehicle make is required'),
  body('vehicleInfo.model').notEmpty().withMessage('Vehicle model is required'),
  body('quoteType').isIn(['service', 'repair', 'maintenance', 'installation', 'consultation']).withMessage('Valid quote type is required'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('items').isArray().withMessage('Items array is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required')
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

    const partnerId = req.user.partnerId;
    
    // Generate quote number
    const quoteNumber = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const quotationData = {
      ...req.body,
      partnerId,
      quoteNumber
    };

    // Calculate totals
    const subtotal = quotationData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * quotationData.taxRate;
    const total = subtotal + taxAmount;

    quotationData.subtotal = subtotal;
    quotationData.taxAmount = taxAmount;
    quotationData.total = total;

    const quotation = new PartnerQuote(quotationData);
    await quotation.save();

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: quotation
    });

  } catch (error) {
    logger.error('Create quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/quotations/:id
// @desc    Update quotation
// @access  Private
router.patch('/quotations/:id', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const quotationId = req.params.id;
    const updateData = req.body;

    const quotation = await PartnerQuote.findOne({
      _id: quotationId,
      partnerId
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Only allow updates if status is draft
    if (quotation.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update quotation that is not in draft status'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (quotation.schema.paths[key]) {
        quotation[key] = updateData[key];
      }
    });

    // Recalculate totals if items changed
    if (updateData.items) {
      const subtotal = quotation.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * quotation.taxRate;
      const total = subtotal + taxAmount;

      quotation.subtotal = subtotal;
      quotation.taxAmount = taxAmount;
      quotation.total = total;
    }

    await quotation.save();

    res.json({
      success: true,
      message: 'Quotation updated successfully',
      data: quotation
    });

  } catch (error) {
    logger.error('Update quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/quotations/:id/send
// @desc    Send quotation to customer
// @access  Private
router.post('/quotations/:id/send', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const quotationId = req.params.id;

    const quotation = await PartnerQuote.findOne({
      _id: quotationId,
      partnerId
    });

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    if (quotation.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Quotation has already been sent'
      });
    }

    quotation.status = 'sent';
    quotation.sentAt = new Date();
    await quotation.save();

    // TODO: Send email/SMS to customer with quotation details

    res.json({
      success: true,
      message: 'Quotation sent successfully',
      data: quotation
    });

  } catch (error) {
    logger.error('Send quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================================================
// INVENTORY ENDPOINTS
// ============================================================================

// @route   GET /partners/inventory
// @desc    Get partner inventory
// @access  Private
router.get('/inventory', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { category, status, search, page = 1, limit = 20 } = req.query;

    const query = { partnerId };
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    const inventory = await PartnerInventory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PartnerInventory.countDocuments(query);

    res.json({
      success: true,
      data: {
        inventory,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/inventory/:id
// @desc    Get inventory item details
// @access  Private
router.get('/inventory/:id', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const itemId = req.params.id;

    const item = await PartnerInventory.findOne({
      _id: itemId,
      partnerId
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    logger.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/inventory
// @desc    Add new inventory item
// @access  Private
router.post('/inventory', auth, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('costPrice').isNumeric().withMessage('Cost price must be a number'),
  body('salePrice').isNumeric().withMessage('Sale price must be a number'),
  body('quantity').isNumeric().withMessage('Quantity must be a number')
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

    const partnerId = req.user.partnerId;
    const itemData = {
      ...req.body,
      partnerId
    };

    const item = new PartnerInventory(itemData);
    await item.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: item
    });

  } catch (error) {
    logger.error('Add inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/inventory/:id
// @desc    Update inventory item
// @access  Private
router.patch('/inventory/:id', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const itemId = req.params.id;
    const updateData = req.body;

    const item = await PartnerInventory.findOne({
      _id: itemId,
      partnerId
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (item.schema.paths[key]) {
        item[key] = updateData[key];
      }
    });

    await item.save();

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });

  } catch (error) {
    logger.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /partners/inventory/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/inventory/:id', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const itemId = req.params.id;

    const item = await PartnerInventory.findOne({
      _id: itemId,
      partnerId
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await PartnerInventory.findByIdAndDelete(itemId);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    logger.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/inventory/stats
// @desc    Get inventory statistics
// @access  Private
router.get('/inventory/stats', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    const stats = await PartnerInventory.getInventoryStats(partnerId);

    res.json({
      success: true,
      data: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        publishedCount: 0,
        averagePrice: 0,
        totalQuantity: 0
      }
    });

  } catch (error) {
    logger.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// LOYALTY & REWARDS SYSTEM
// ========================================

// Get loyalty program status
// @route   GET /api/v1/partners/loyalty/status
// @desc    Get partner's loyalty program status
// @access  Private
router.get('/loyalty/status', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    // Get loyalty status from partner profile
    const partner = await PartnerUser.findById(partnerId);
    
    res.json({
      success: true,
      data: {
        isEnrolled: partner.loyaltyEnrolled || false,
        tier: partner.loyaltyTier || 'BRONZE',
        points: partner.loyaltyPoints || 0,
        nextTierPoints: partner.loyaltyTier === 'BRONZE' ? 1000 : 
                       partner.loyaltyTier === 'SILVER' ? 2500 : 0,
        benefits: partner.loyaltyBenefits || []
      }
    });

  } catch (error) {
    logger.error('Get loyalty status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Enroll in loyalty program
// @route   POST /api/v1/partners/loyalty/enroll
// @desc    Enroll partner in loyalty program
// @access  Private
router.post('/loyalty/enroll', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    await PartnerUser.findByIdAndUpdate(partnerId, {
      loyaltyEnrolled: true,
      loyaltyTier: 'BRONZE',
      loyaltyPoints: 0,
      loyaltyEnrolledAt: new Date()
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in loyalty program'
    });

  } catch (error) {
    logger.error('Loyalty enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// RATINGS & REVIEWS SYSTEM
// ========================================

// Get partner ratings
// @route   GET /api/v1/partners/ratings
// @desc    Get partner's ratings and reviews
// @access  Private
router.get('/ratings', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { page = 1, limit = 10 } = req.query;

    // This would typically query a ratings collection
    // For now, return mock data
    const ratings = {
      averageRating: 4.5,
      totalReviews: 127,
      ratingBreakdown: {
        5: 89,
        4: 23,
        3: 10,
        2: 3,
        1: 2
      },
      recentReviews: [
        {
          id: '1',
          customerName: 'Ahmed M.',
          rating: 5,
          comment: 'Excellent service and fast delivery!',
          date: new Date(),
          orderId: 'ORD-001'
        }
      ]
    };

    res.json({
      success: true,
      data: ratings
    });

  } catch (error) {
    logger.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// VEHICLE MANAGEMENT SYSTEM
// ========================================

// Get customer vehicles
// @route   GET /api/v1/partners/vehicles
// @desc    Get vehicles associated with partner
// @access  Private
router.get('/vehicles', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { customerId, page = 1, limit = 10 } = req.query;

    // This would typically query a vehicles collection
    // For now, return mock data
    const vehicles = [
      {
        id: '1',
        customerId: customerId || 'CUST-001',
        customerName: 'Ahmed Hassan',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        plateNumber: 'ABC-123',
        vin: '1HGBH41JXMN109186',
        lastServiceDate: new Date(),
        nextServiceDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        serviceHistory: []
      }
    ];

    res.json({
      success: true,
      data: vehicles
    });

  } catch (error) {
    logger.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add vehicle
// @route   POST /api/v1/partners/vehicles
// @desc    Add customer vehicle
// @access  Private
router.post('/vehicles', [
  auth,
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('make').notEmpty().withMessage('Make is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isNumeric().withMessage('Year must be numeric'),
  body('plateNumber').notEmpty().withMessage('Plate number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const partnerId = req.user.partnerId;
    const { customerId, make, model, year, plateNumber, vin } = req.body;

    // This would typically save to a vehicles collection
    const vehicle = {
      id: Date.now().toString(),
      partnerId,
      customerId,
      make,
      model,
      year,
      plateNumber,
      vin,
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: 'Vehicle added successfully',
      data: vehicle
    });

  } catch (error) {
    logger.error('Add vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// PROMOTIONS & OFFERS SYSTEM
// ========================================

// Get promotions
// @route   GET /api/v1/partners/promotions
// @desc    Get available promotions
// @access  Private
router.get('/promotions', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { status = 'active' } = req.query;

    // This would typically query a promotions collection
    const promotions = [
      {
        id: '1',
        title: 'New Partner Bonus',
        description: 'Get 500 points for your first 10 orders',
        type: 'POINTS',
        value: 500,
        conditions: 'First 10 orders',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ];

    res.json({
      success: true,
      data: promotions
    });

  } catch (error) {
    logger.error('Get promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// TRAINING & CERTIFICATIONS SYSTEM
// ========================================

// Get training materials
// @route   GET /api/v1/partners/training
// @desc    Get training materials and certifications
// @access  Private
router.get('/training', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;

    const training = {
      availableCourses: [
        {
          id: '1',
          title: 'Clutch Platform Basics',
          description: 'Learn the fundamentals of using Clutch platform',
          duration: '30 minutes',
          type: 'VIDEO',
          isCompleted: false,
          progress: 0
        },
        {
          id: '2',
          title: 'Inventory Management',
          description: 'Best practices for inventory management',
          duration: '45 minutes',
          type: 'VIDEO',
          isCompleted: true,
          progress: 100
        }
      ],
      certifications: [
        {
          id: '1',
          name: 'Certified Partner',
          description: 'Basic partner certification',
          earnedAt: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      ]
    };

    res.json({
      success: true,
      data: training
    });

  } catch (error) {
    logger.error('Get training error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// PERFORMANCE & KPIs SYSTEM
// ========================================

// Get performance metrics
// @route   GET /api/v1/partners/performance
// @desc    Get partner performance metrics and KPIs
// @access  Private
router.get('/performance', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { period = 'month' } = req.query;

    const performance = {
      sales: {
        current: 45000,
        previous: 38000,
        growth: 18.4
      },
      orders: {
        current: 127,
        previous: 98,
        growth: 29.6
      },
      rating: {
        current: 4.5,
        previous: 4.2,
        growth: 7.1
      },
      customerSatisfaction: 92,
      responseTime: '2.3 hours',
      completionRate: 96.5,
      benchmarks: {
        sales: { target: 50000, current: 45000, percentage: 90 },
        orders: { target: 150, current: 127, percentage: 84.7 },
        rating: { target: 4.5, current: 4.5, percentage: 100 }
      }
    };

    res.json({
      success: true,
      data: performance
    });

  } catch (error) {
    logger.error('Get performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ========================================
// COMMISSION TRACKING SYSTEM
// ========================================

// Get commission breakdown
// @route   GET /api/v1/partners/commission
// @desc    Get commission breakdown and history
// @access  Private
router.get('/commission', auth, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    const { period = 'month' } = req.query;

    const commission = {
      totalEarnings: 2250.50,
      commissionRate: 5.0,
      breakdown: {
        orders: 1800.00,
        bonuses: 300.00,
        loyalty: 150.50
      },
      history: [
        {
          date: new Date(),
          orderId: 'ORD-001',
          amount: 45.00,
          commission: 2.25,
          status: 'PAID'
        }
      ],
      nextPayout: {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        amount: 450.00
      }
    };

    res.json({
      success: true,
      data: commission
    });

  } catch (error) {
    logger.error('Get commission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===== APPOINTMENTS ROUTES =====

// Get all appointments for a partner
router.get('/appointments', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, date } = req.query;
    const partnerId = req.user.partnerId;
    
    // Mock appointments data
    const appointments = [
      {
        id: 'apt-001',
        customerId: 'cust-001',
        customerName: 'Ahmed Hassan',
        customerPhone: '+201234567890',
        vehicleId: 'veh-001',
        vehicleInfo: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          plateNumber: 'ABC-123'
        },
        serviceType: 'Oil Change',
        description: 'Regular oil change service',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60, // minutes
        status: 'scheduled',
        priority: 'normal',
        estimatedCost: 150,
        notes: 'Customer prefers morning appointment',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'apt-002',
        customerId: 'cust-002',
        customerName: 'Sarah Johnson',
        customerPhone: '+201234567891',
        vehicleId: 'veh-002',
        vehicleInfo: {
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          plateNumber: 'XYZ-789'
        },
        serviceType: 'Brake Inspection',
        description: 'Full brake system inspection and repair',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        duration: 120,
        status: 'confirmed',
        priority: 'high',
        estimatedCost: 300,
        notes: 'Customer reported squeaking sounds',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    res.json({
      success: true,
      data: {
        appointments: appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: appointments.length,
          totalPages: Math.ceil(appointments.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get appointment details
router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock appointment details
    const appointment = {
      id: id,
      customerId: 'cust-001',
      customerName: 'Ahmed Hassan',
      customerPhone: '+201234567890',
      customerEmail: 'ahmed@example.com',
      vehicleId: 'veh-001',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        plateNumber: 'ABC-123',
        vin: '1HGBH41JXMN109186',
        mileage: 45000
      },
      serviceType: 'Oil Change',
      description: 'Regular oil change service',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: 60,
      status: 'scheduled',
      priority: 'normal',
      estimatedCost: 150,
      actualCost: null,
      notes: 'Customer prefers morning appointment',
      serviceHistory: [
        {
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          service: 'Oil Change',
          cost: 120,
          notes: 'Previous service'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    logger.error('Error fetching appointment details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new appointment
router.post('/appointments', auth, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('serviceType').notEmpty().withMessage('Service type is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const {
      customerName,
      customerPhone,
      customerEmail,
      vehicleInfo,
      serviceType,
      description,
      scheduledDate,
      duration,
      priority,
      estimatedCost,
      notes
    } = req.body;
    
    // Mock appointment creation
    const newAppointment = {
      id: `apt-${Date.now()}`,
      customerId: `cust-${Date.now()}`,
      customerName,
      customerPhone,
      customerEmail,
      vehicleId: vehicleInfo ? `veh-${Date.now()}` : null,
      vehicleInfo,
      serviceType,
      description,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      status: 'scheduled',
      priority: priority || 'normal',
      estimatedCost,
      actualCost: null,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      data: newAppointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update appointment status
router.patch('/appointments/:id/status', auth, [
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Mock status update
    const updatedAppointment = {
      id,
      status,
      notes,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: updatedAppointment,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Reschedule appointment
router.patch('/appointments/:id/reschedule', auth, [
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, notes } = req.body;
    
    // Mock reschedule
    const rescheduledAppointment = {
      id,
      scheduledDate: new Date(scheduledDate),
      notes,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: rescheduledAppointment,
      message: 'Appointment rescheduled successfully'
    });
  } catch (error) {
    logger.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Cancel appointment
router.delete('/appointments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Mock cancellation
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        id,
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
