const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Feedback Types
const FEEDBACK_TYPES = {
  CUSTOMER_RATING: 'customer_rating',
  SERVICE_FEEDBACK: 'service_feedback',
  PRODUCT_FEEDBACK: 'product_feedback',
  GENERAL_FEEDBACK: 'general_feedback',
  COMPLAINT: 'complaint',
  SUGGESTION: 'suggestion'
};

// Feedback Status
const FEEDBACK_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESPONDED: 'responded',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Get feedback
router.get('/feedback', auth, async (req, res) => {
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
      type = '',
      rating = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(FEEDBACK_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (type && Object.values(FEEDBACK_TYPES).includes(type)) {
      query.type = type;
    }

    if (rating) {
      const ratingNum = parseInt(rating);
      if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
        query.rating = ratingNum;
      }
    }

    if (dateFrom) {
      query.createdAt = { ...query.createdAt, $gte: new Date(dateFrom) };
    }

    if (dateTo) {
      query.createdAt = { ...query.createdAt, $lte: new Date(dateTo) };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const feedbackCollection = await getCollection('partnerFeedback');
    
    const feedback = await feedbackCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await feedbackCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Feedback retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// Get feedback by ID
router.get('/feedback/:id', auth, async (req, res) => {
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
    const feedbackCollection = await getCollection('partnerFeedback');
    
    const feedback = await feedbackCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: feedback,
      message: 'Feedback retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// Respond to feedback
router.post('/feedback/:id/respond', [
  auth,
  body('response').notEmpty().withMessage('Response is required'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('status').optional().isIn(Object.values(FEEDBACK_STATUS)).withMessage('Invalid status')
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
    const { response, isPublic = true, status } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const feedbackCollection = await getCollection('partnerFeedback');
    
    const feedback = await feedbackCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    if (feedback.response) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already has a response'
      });
    }

    const responseData = {
      text: response,
      isPublic,
      respondedAt: new Date(),
      respondedBy: partner._id,
      respondedByName: partner.businessName
    };

    const updateData = {
      response: responseData,
      status: status || FEEDBACK_STATUS.RESPONDED,
      updatedAt: new Date()
    };

    await feedbackCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    res.json({
      success: true,
      data: responseData,
      message: 'Response added successfully'
    });
  } catch (error) {
    logger.error('Error responding to feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to feedback',
      error: error.message
    });
  }
});

// Update feedback status
router.patch('/feedback/:id/status', [
  auth,
  body('status').isIn(Object.values(FEEDBACK_STATUS)).withMessage('Invalid status'),
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
    const { status, notes } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const feedbackCollection = await getCollection('partnerFeedback');
    
    const feedback = await feedbackCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (notes) {
      updateData.statusNotes = notes;
    }

    await feedbackCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Feedback status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: error.message
    });
  }
});

// Get feedback statistics
router.get('/feedback/stats', auth, async (req, res) => {
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
    const feedbackCollection = await getCollection('partnerFeedback');
    
    const stats = await feedbackCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          pendingFeedback: {
            $sum: { $cond: [{ $eq: ['$status', FEEDBACK_STATUS.PENDING] }, 1, 0] }
          },
          respondedFeedback: {
            $sum: { $cond: [{ $eq: ['$status', FEEDBACK_STATUS.RESPONDED] }, 1, 0] }
          },
          resolvedFeedback: {
            $sum: { $cond: [{ $eq: ['$status', FEEDBACK_STATUS.RESOLVED] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const feedbackStats = stats[0] || {
      totalFeedback: 0,
      averageRating: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0,
      pendingFeedback: 0,
      respondedFeedback: 0,
      resolvedFeedback: 0
    };

    const responseRate = feedbackStats.totalFeedback > 0 
      ? (feedbackStats.respondedFeedback / feedbackStats.totalFeedback) * 100 
      : 0;

    const resolutionRate = feedbackStats.totalFeedback > 0 
      ? (feedbackStats.resolvedFeedback / feedbackStats.totalFeedback) * 100 
      : 0;

    // Get feedback by type
    const typeBreakdown = await feedbackCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        totalFeedback: feedbackStats.totalFeedback,
        averageRating: Math.round(feedbackStats.averageRating * 100) / 100,
        ratingDistribution: {
          '5': feedbackStats.rating5,
          '4': feedbackStats.rating4,
          '3': feedbackStats.rating3,
          '2': feedbackStats.rating2,
          '1': feedbackStats.rating1
        },
        pendingFeedback: feedbackStats.pendingFeedback,
        respondedFeedback: feedbackStats.respondedFeedback,
        resolvedFeedback: feedbackStats.resolvedFeedback,
        responseRate: Math.round(responseRate * 100) / 100,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        typeBreakdown,
        period,
        startDate,
        endDate: now
      },
      message: 'Feedback statistics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching feedback statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: error.message
    });
  }
});

// Get feedback trends
router.get('/feedback/trends', auth, async (req, res) => {
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
    const feedbackCollection = await getCollection('partnerFeedback');
    
    // Get daily feedback trends
    const dailyTrends = await feedbackCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]).toArray();

    // Get rating trends over time
    const ratingTrends = await feedbackCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]).toArray();

    res.json({
      success: true,
      data: {
        dailyTrends,
        ratingTrends,
        period,
        startDate,
        endDate: now
      },
      message: 'Feedback trends retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching feedback trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback trends',
      error: error.message
    });
  }
});

// Export feedback
router.post('/feedback/export', [
  auth,
  body('startDate').isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').isISO8601().withMessage('End date must be valid ISO date'),
  body('format').optional().isIn(['csv', 'excel', 'pdf']).withMessage('Invalid format'),
  body('includeResponses').optional().isBoolean().withMessage('includeResponses must be boolean')
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

    const { startDate, endDate, format = 'csv', includeResponses = true } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const { getCollection } = require('../config/database');
    const feedbackCollection = await getCollection('partnerFeedback');
    
    const feedback = await feedbackCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: start, $lte: end }
    }).toArray();

    // Prepare export data
    const exportData = feedback.map(item => ({
      id: item._id,
      type: item.type,
      rating: item.rating,
      comment: item.comment,
      customerName: item.customerName,
      customerPhone: item.customerPhone,
      createdAt: item.createdAt,
      status: item.status,
      response: includeResponses ? item.response?.text : null,
      respondedAt: includeResponses ? item.response?.respondedAt : null
    }));

    // TODO: Generate actual export file (CSV/Excel/PDF)
    // For now, return the export data
    res.json({
      success: true,
      data: {
        exportId: `FEEDBACK-${Date.now()}`,
        recordCount: exportData.length,
        format,
        downloadUrl: `/api/feedback/export/${exportData.exportId}.${format}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      message: 'Feedback export generated successfully'
    });
  } catch (error) {
    logger.error('Error exporting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export feedback',
      error: error.message
    });
  }
});

module.exports = router;
