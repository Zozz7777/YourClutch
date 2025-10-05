const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Rating Sources
const RATING_SOURCES = {
  CUSTOMER_FEEDBACK: 'customer_feedback',
  CLUTCH_APP: 'clutch_app',
  ADMIN_REVIEW: 'admin_review',
  PEER_REVIEW: 'peer_review'
};

// Rating Categories
const RATING_CATEGORIES = {
  SERVICE_QUALITY: 'service_quality',
  RESPONSE_TIME: 'response_time',
  COMMUNICATION: 'communication',
  PRICING: 'pricing',
  RELIABILITY: 'reliability',
  OVERALL: 'overall'
};

// Get partner ratings
router.get('/ratings', auth, async (req, res) => {
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
      category = '',
      minRating = '',
      maxRating = '',
      source = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (category && Object.values(RATING_CATEGORIES).includes(category)) {
      query.category = category;
    }
    
    if (source && Object.values(RATING_SOURCES).includes(source)) {
      query.source = source;
    }

    if (minRating) {
      const min = parseFloat(minRating);
      if (!isNaN(min)) {
        query.rating = { $gte: min };
      }
    }

    if (maxRating) {
      const max = parseFloat(maxRating);
      if (!isNaN(max)) {
        query.rating = { ...query.rating, $lte: max };
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const ratingsCollection = await getCollection('partnerRatings');
    
    const ratings = await ratingsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await ratingsCollection.countDocuments(query);

    // Get rating summary
    const summary = await ratingsCollection.aggregate([
      { $match: { partnerId: partner.partnerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]).toArray();

    const ratingSummary = summary[0] || {
      averageRating: 0,
      totalRatings: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0
    };

    res.json({
      success: true,
      data: {
        ratings,
        summary: {
          averageRating: Math.round(ratingSummary.averageRating * 100) / 100,
          totalRatings: ratingSummary.totalRatings,
          distribution: {
            '5': ratingSummary.rating5,
            '4': ratingSummary.rating4,
            '3': ratingSummary.rating3,
            '2': ratingSummary.rating2,
            '1': ratingSummary.rating1
          }
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Ratings retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings',
      error: error.message
    });
  }
});

// Get rating by ID
router.get('/ratings/:id', auth, async (req, res) => {
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
    const ratingsCollection = await getCollection('partnerRatings');
    
    const rating = await ratingsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    res.json({
      success: true,
      data: rating,
      message: 'Rating retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
      error: error.message
    });
  }
});

// Respond to rating
router.post('/ratings/:id/respond', [
  auth,
  body('response').notEmpty().withMessage('Response is required'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean')
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
    const { response, isPublic = true } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const ratingsCollection = await getCollection('partnerRatings');
    
    const rating = await ratingsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    if (rating.response) {
      return res.status(400).json({
        success: false,
        message: 'Rating already has a response'
      });
    }

    await ratingsCollection.updateOne(
      { _id: id },
      {
        $set: {
          response: {
            text: response,
            isPublic,
            respondedAt: new Date(),
            respondedBy: partner._id
          },
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Response added successfully'
    });
  } catch (error) {
    logger.error('Error responding to rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to rating',
      error: error.message
    });
  }
});

// Flag inappropriate rating
router.post('/ratings/:id/flag', [
  auth,
  body('reason').notEmpty().withMessage('Flag reason is required'),
  body('description').optional().isString().withMessage('Description must be a string')
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
    const { reason, description } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const ratingsCollection = await getCollection('partnerRatings');
    
    const rating = await ratingsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    const flagEntry = {
      reason,
      description,
      flaggedBy: partner._id,
      flaggedAt: new Date()
    };

    await ratingsCollection.updateOne(
      { _id: id },
      {
        $set: {
          flagged: true,
          flag: flagEntry,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Rating flagged successfully'
    });
  } catch (error) {
    logger.error('Error flagging rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flag rating',
      error: error.message
    });
  }
});

// Get rating analytics
router.get('/ratings/analytics', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d', // 7d, 30d, 90d, 1y
      category = ''
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
    const ratingsCollection = await getCollection('partnerRatings');
    
    const matchQuery = {
      partnerId: partner.partnerId,
      createdAt: { $gte: startDate }
    };

    if (category && Object.values(RATING_CATEGORIES).includes(category)) {
      matchQuery.category = category;
    }

    // Get rating trends over time
    const trends = await ratingsCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]).toArray();

    // Get category breakdown
    const categoryBreakdown = await ratingsCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get source breakdown
    const sourceBreakdown = await ratingsCollection.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$source',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get recent ratings
    const recentRatings = await ratingsCollection
      .find(matchQuery)
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    res.json({
      success: true,
      data: {
        trends,
        categoryBreakdown,
        sourceBreakdown,
        recentRatings,
        period,
        startDate,
        endDate: now
      },
      message: 'Rating analytics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching rating analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating analytics',
      error: error.message
    });
  }
});

// Get partner rating summary for public display
router.get('/ratings/summary', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const ratingsCollection = await getCollection('partnerRatings');
    
    const summary = await ratingsCollection.aggregate([
      { $match: { partnerId: partner.partnerId, flagged: { $ne: true } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]).toArray();

    const ratingSummary = summary[0] || {
      averageRating: 0,
      totalRatings: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0
    };

    // Get recent public reviews
    const recentReviews = await ratingsCollection
      .find({ 
        partnerId: partner.partnerId, 
        flagged: { $ne: true },
        review: { $exists: true, $ne: null }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({
      success: true,
      data: {
        averageRating: Math.round(ratingSummary.averageRating * 100) / 100,
        totalRatings: ratingSummary.totalRatings,
        distribution: {
          '5': ratingSummary.rating5,
          '4': ratingSummary.rating4,
          '3': ratingSummary.rating3,
          '2': ratingSummary.rating2,
          '1': ratingSummary.rating1
        },
        recentReviews: recentReviews.map(review => ({
          rating: review.rating,
          review: review.review,
          customerName: review.customerName || 'Anonymous',
          createdAt: review.createdAt,
          response: review.response
        }))
      },
      message: 'Rating summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching rating summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating summary',
      error: error.message
    });
  }
});

module.exports = router;
