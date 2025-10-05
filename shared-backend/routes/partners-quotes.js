const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Quote Status
const QUOTE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// Quote Types
const QUOTE_TYPES = {
  SERVICE: 'service',
  REPAIR: 'repair',
  MAINTENANCE: 'maintenance',
  INSTALLATION: 'installation',
  CONSULTATION: 'consultation'
};

// Create quote
router.post('/quotes', [
  auth,
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('customerEmail').optional().isEmail().withMessage('Valid email is required'),
  body('vehicleInfo').isObject().withMessage('Vehicle info is required'),
  body('vehicleInfo.make').notEmpty().withMessage('Vehicle make is required'),
  body('vehicleInfo.model').notEmpty().withMessage('Vehicle model is required'),
  body('vehicleInfo.year').optional().isNumeric().withMessage('Vehicle year must be numeric'),
  body('vehicleInfo.licensePlate').optional().isString().withMessage('License plate must be string'),
  body('vehicleInfo.vin').optional().isString().withMessage('VIN must be string'),
  body('quoteType').isIn(Object.values(QUOTE_TYPES)).withMessage('Invalid quote type'),
  body('description').notEmpty().withMessage('Description is required'),
  body('items').isArray().withMessage('Items must be array'),
  body('items.*.name').notEmpty().withMessage('Item name is required'),
  body('items.*.description').optional().isString().withMessage('Item description must be string'),
  body('items.*.quantity').isNumeric().withMessage('Item quantity must be numeric'),
  body('items.*.unitPrice').isNumeric().withMessage('Item unit price must be numeric'),
  body('validUntil').isISO8601().withMessage('Valid until must be valid ISO date'),
  body('notes').optional().isString().withMessage('Notes must be string'),
  body('terms').optional().isString().withMessage('Terms must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
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
      customerName,
      customerPhone,
      customerEmail,
      vehicleInfo,
      quoteType,
      description,
      items,
      validUntil,
      notes,
      terms
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const total = item.quantity * item.unitPrice;
      subtotal += total;
      return {
        ...item,
        total
      };
    });

    const taxRate = 0.14; // 14% VAT
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const quote = {
      partnerId: partner.partnerId,
      quoteNumber: generateQuoteNumber(),
      customerName,
      customerPhone,
      customerEmail: customerEmail?.toLowerCase(),
      vehicleInfo,
      quoteType,
      description,
      items: processedItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      validUntil: new Date(validUntil),
      notes,
      terms,
      status: QUOTE_STATUS.DRAFT,
      sentAt: null,
      viewedAt: null,
      respondedAt: null,
      response: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { getCollection } = require('../config/database');
    const quotesCollection = await getCollection('partnerQuotes');
    const result = await quotesCollection.insertOne(quote);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...quote
      },
      message: 'Quote created successfully'
    });
  } catch (error) {
    logger.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quote',
      error: error.message
    });
  }
});

// Get quotes
router.get('/quotes', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      quoteType = '',
      dateFrom = '',
      dateTo = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(QUOTE_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (quoteType && Object.values(QUOTE_TYPES).includes(quoteType)) {
      query.quoteType = quoteType;
    }

    if (dateFrom) {
      query.createdAt = { ...query.createdAt, $gte: new Date(dateFrom) };
    }

    if (dateTo) {
      query.createdAt = { ...query.createdAt, $lte: new Date(dateTo) };
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { quoteNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const quotesCollection = await getCollection('partnerQuotes');
    
    const quotes = await quotesCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await quotesCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        quotes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Quotes retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotes',
      error: error.message
    });
  }
});

// Get quote by ID
router.get('/quotes/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const quotesCollection = await getCollection('partnerQuotes');
    
    const quote = await quotesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    res.json({
      success: true,
      data: quote,
      message: 'Quote retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote',
      error: error.message
    });
  }
});

// Send quote
router.post('/quotes/:id/send', [
  auth,
  body('method').isIn(['email', 'sms', 'whatsapp']).withMessage('Invalid send method'),
  body('message').optional().isString().withMessage('Message must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { method, message } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const quotesCollection = await getCollection('partnerQuotes');
    
    const quote = await quotesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (quote.status !== QUOTE_STATUS.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Quote has already been sent'
      });
    }

    // Update quote status
    await quotesCollection.updateOne(
      { _id: id },
      {
        $set: {
          status: QUOTE_STATUS.SENT,
          sentAt: new Date(),
          sentMethod: method,
          sentMessage: message,
          updatedAt: new Date()
        }
      }
    );

    // TODO: Implement actual sending logic
    // - Email: Send PDF quote via email
    // - SMS: Send quote link via SMS
    // - WhatsApp: Send quote link via WhatsApp

    res.json({
      success: true,
      data: {
        sentAt: new Date(),
        method,
        message
      },
      message: 'Quote sent successfully'
    });
  } catch (error) {
    logger.error('Error sending quote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send quote',
      error: error.message
    });
  }
});

// Update quote status
router.patch('/quotes/:id/status', [
  auth,
  body('status').isIn(Object.values(QUOTE_STATUS)).withMessage('Invalid status'),
  body('response').optional().isString().withMessage('Response must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, response } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const quotesCollection = await getCollection('partnerQuotes');
    
    const quote = await quotesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === QUOTE_STATUS.VIEWED && !quote.viewedAt) {
      updateData.viewedAt = new Date();
    }

    if (status === QUOTE_STATUS.ACCEPTED || status === QUOTE_STATUS.REJECTED) {
      updateData.respondedAt = new Date();
      updateData.response = response;
    }

    await quotesCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Quote status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating quote status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quote status',
      error: error.message
    });
  }
});

// Convert quote to order
router.post('/quotes/:id/convert', [
  auth,
  body('orderDate').optional().isISO8601().withMessage('Order date must be valid ISO date'),
  body('notes').optional().isString().withMessage('Notes must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { orderDate, notes } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const quotesCollection = await getCollection('partnerQuotes');
    const ordersCollection = await getCollection('partnerOrders');
    
    const quote = await quotesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (quote.status !== QUOTE_STATUS.ACCEPTED) {
      return res.status(400).json({
        success: false,
        message: 'Quote must be accepted before converting to order'
      });
    }

    // Create order from quote
    const order = {
      partnerId: partner.partnerId,
      orderNumber: generateOrderNumber(),
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerEmail: quote.customerEmail,
      vehicleInfo: quote.vehicleInfo,
      quoteId: quote._id,
      quoteNumber: quote.quoteNumber,
      items: quote.items,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      notes: notes || quote.notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderResult = await ordersCollection.insertOne(order);

    // Update quote status
    await quotesCollection.updateOne(
      { _id: id },
      {
        $set: {
          status: QUOTE_STATUS.ACCEPTED,
          convertedToOrder: orderResult.insertedId,
          convertedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      data: {
        orderId: orderResult.insertedId,
        orderNumber: order.orderNumber
      },
      message: 'Quote converted to order successfully'
    });
  } catch (error) {
    logger.error('Error converting quote to order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert quote to order',
      error: error.message
    });
  }
});

// Get quote statistics
router.get('/quotes/stats', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d' // 7d, 30d, 90d, 1y
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    const quotesCollection = await getCollection('partnerQuotes');
    
    const stats = await quotesCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalQuotes: { $sum: 1 },
          acceptedQuotes: {
            $sum: { $cond: [{ $eq: ['$status', QUOTE_STATUS.ACCEPTED] }, 1, 0] }
          },
          rejectedQuotes: {
            $sum: { $cond: [{ $eq: ['$status', QUOTE_STATUS.REJECTED] }, 1, 0] }
          },
          expiredQuotes: {
            $sum: { $cond: [{ $eq: ['$status', QUOTE_STATUS.EXPIRED] }, 1, 0] }
          },
          totalValue: { $sum: '$total' },
          averageValue: { $avg: '$total' }
        }
      }
    ]).toArray();

    const quoteStats = stats[0] || {
      totalQuotes: 0,
      acceptedQuotes: 0,
      rejectedQuotes: 0,
      expiredQuotes: 0,
      totalValue: 0,
      averageValue: 0
    };

    const acceptanceRate = quoteStats.totalQuotes > 0 
      ? (quoteStats.acceptedQuotes / quoteStats.totalQuotes) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalQuotes: quoteStats.totalQuotes,
        acceptedQuotes: quoteStats.acceptedQuotes,
        rejectedQuotes: quoteStats.rejectedQuotes,
        expiredQuotes: quoteStats.expiredQuotes,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        totalValue: quoteStats.totalValue,
        averageValue: Math.round(quoteStats.averageValue * 100) / 100,
        period,
        startDate,
        endDate: now
      },
      message: 'Quote statistics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching quote statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quote statistics',
      error: error.message
    });
  }
});

// Helper function to generate quote number
function generateQuoteNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Q-${timestamp.slice(-6)}-${random}`;
}

// Helper function to generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `O-${timestamp.slice(-6)}-${random}`;
}

module.exports = router;
