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

module.exports = router;
