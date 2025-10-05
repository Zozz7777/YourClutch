const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Loyalty Tiers
const LOYALTY_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

// Point Sources
const POINT_SOURCES = {
  ORDER_COMPLETION: 'order_completion',
  FAST_RESPONSE: 'fast_response',
  HIGH_RATING: 'high_rating',
  MONTHLY_BONUS: 'monthly_bonus',
  REFERRAL: 'referral',
  TRAINING_COMPLETION: 'training_completion',
  MANUAL_ADJUSTMENT: 'manual_adjustment'
};

// Reward Types
const REWARD_TYPES = {
  CASHBACK: 'cashback',
  COMMISSION_REDUCTION: 'commission_reduction',
  PREMIUM_FEATURES: 'premium_features',
  TRAINING_ACCESS: 'training_access',
  FEATURED_LISTING: 'featured_listing',
  DEDICATED_SUPPORT: 'dedicated_support'
};

// Get partner loyalty status
router.get('/loyalty/status', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    let loyalty = await loyaltyCollection.findOne({
      partnerId: partner.partnerId
    });

    // Create loyalty record if doesn't exist
    if (!loyalty) {
      loyalty = {
        partnerId: partner.partnerId,
        points: 0,
        tier: LOYALTY_TIERS.BRONZE,
        totalEarned: 0,
        totalRedeemed: 0,
        pointsHistory: [],
        rewards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await loyaltyCollection.insertOne(loyalty);
      loyalty._id = result.insertedId;
    }

    // Calculate tier based on points
    const tierThresholds = {
      [LOYALTY_TIERS.BRONZE]: 0,
      [LOYALTY_TIERS.SILVER]: 1000,
      [LOYALTY_TIERS.GOLD]: 5000,
      [LOYALTY_TIERS.PLATINUM]: 15000
    };

    let currentTier = LOYALTY_TIERS.BRONZE;
    for (const [tier, threshold] of Object.entries(tierThresholds)) {
      if (loyalty.points >= threshold) {
        currentTier = tier;
      }
    }

    // Update tier if changed
    if (loyalty.tier !== currentTier) {
      await loyaltyCollection.updateOne(
        { _id: loyalty._id },
        { $set: { tier: currentTier, updatedAt: new Date() } }
      );
      loyalty.tier = currentTier;
    }

    // Get tier benefits
    const tierBenefits = {
      [LOYALTY_TIERS.BRONZE]: {
        commissionReduction: 0,
        features: ['standard_support'],
        description: 'Standard commission rate'
      },
      [LOYALTY_TIERS.SILVER]: {
        commissionReduction: 0.5,
        features: ['priority_support', 'monthly_bonus'],
        description: '0.5% commission reduction, priority support'
      },
      [LOYALTY_TIERS.GOLD]: {
        commissionReduction: 1.0,
        features: ['priority_support', 'featured_listing', 'free_training'],
        description: '1% commission reduction, featured listing, free training'
      },
      [LOYALTY_TIERS.PLATINUM]: {
        commissionReduction: 1.5,
        features: ['dedicated_manager', 'featured_listing', 'free_training', 'premium_features'],
        description: '1.5% commission reduction, dedicated account manager'
      }
    };

    const nextTier = currentTier === LOYALTY_TIERS.PLATINUM ? null : 
      Object.keys(tierThresholds).find(tier => tierThresholds[tier] > loyalty.points);
    
    const pointsToNextTier = nextTier ? 
      tierThresholds[nextTier] - loyalty.points : 0;

    res.json({
      success: true,
      data: {
        points: loyalty.points,
        tier: loyalty.tier,
        totalEarned: loyalty.totalEarned,
        totalRedeemed: loyalty.totalRedeemed,
        benefits: tierBenefits[loyalty.tier],
        nextTier,
        pointsToNextTier,
        recentActivity: loyalty.pointsHistory.slice(-10)
      },
      message: 'Loyalty status retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching loyalty status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty status',
      error: error.message
    });
  }
});

// Add points
router.post('/loyalty/points/add', [
  auth,
  body('points').isNumeric().withMessage('Points must be numeric'),
  body('source').isIn(Object.values(POINT_SOURCES)).withMessage('Invalid point source'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('orderId').optional().isString().withMessage('Order ID must be a string')
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

    const { points, source, description, orderId } = req.body;
    const pointsToAdd = parseInt(points);

    if (pointsToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be positive'
      });
    }

    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    const loyalty = await loyaltyCollection.findOne({
      partnerId: partner.partnerId
    });

    if (!loyalty) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty record not found'
      });
    }

    const pointEntry = {
      points: pointsToAdd,
      source,
      description,
      orderId,
      timestamp: new Date()
    };

    const newPoints = loyalty.points + pointsToAdd;
    const newTotalEarned = loyalty.totalEarned + pointsToAdd;

    await loyaltyCollection.updateOne(
      { _id: loyalty._id },
      {
        $set: {
          points: newPoints,
          totalEarned: newTotalEarned,
          updatedAt: new Date()
        },
        $push: {
          pointsHistory: pointEntry
        }
      }
    );

    res.json({
      success: true,
      data: {
        pointsAdded: pointsToAdd,
        newBalance: newPoints,
        source,
        description
      },
      message: 'Points added successfully'
    });
  } catch (error) {
    logger.error('Error adding points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add points',
      error: error.message
    });
  }
});

// Redeem points
router.post('/loyalty/points/redeem', [
  auth,
  body('points').isNumeric().withMessage('Points must be numeric'),
  body('rewardType').isIn(Object.values(REWARD_TYPES)).withMessage('Invalid reward type'),
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { points, rewardType, description } = req.body;
    const pointsToRedeem = parseInt(points);

    if (pointsToRedeem <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be positive'
      });
    }

    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    const loyalty = await loyaltyCollection.findOne({
      partnerId: partner.partnerId
    });

    if (!loyalty) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty record not found'
      });
    }

    if (loyalty.points < pointsToRedeem) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
    }

    const rewardEntry = {
      points: pointsToRedeem,
      rewardType,
      description,
      timestamp: new Date(),
      status: 'pending'
    };

    const newPoints = loyalty.points - pointsToRedeem;
    const newTotalRedeemed = loyalty.totalRedeemed + pointsToRedeem;

    await loyaltyCollection.updateOne(
      { _id: loyalty._id },
      {
        $set: {
          points: newPoints,
          totalRedeemed: newTotalRedeemed,
          updatedAt: new Date()
        },
        $push: {
          rewards: rewardEntry
        }
      }
    );

    res.json({
      success: true,
      data: {
        pointsRedeemed: pointsToRedeem,
        newBalance: newPoints,
        rewardType,
        description
      },
      message: 'Points redeemed successfully'
    });
  } catch (error) {
    logger.error('Error redeeming points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem points',
      error: error.message
    });
  }
});

// Get points history
router.get('/loyalty/history', auth, async (req, res) => {
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
      type = '', // 'earned' or 'redeemed'
      source = ''
    } = req.query;

    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    const loyalty = await loyaltyCollection.findOne({
      partnerId: partner.partnerId
    });

    if (!loyalty) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty record not found'
      });
    }

    let history = [...loyalty.pointsHistory];
    
    // Add redeemed points to history
    loyalty.rewards.forEach(reward => {
      history.push({
        points: -reward.points,
        source: 'redemption',
        description: reward.description,
        timestamp: reward.timestamp
      });
    });

    // Filter by type
    if (type === 'earned') {
      history = history.filter(item => item.points > 0);
    } else if (type === 'redeemed') {
      history = history.filter(item => item.points < 0);
    }

    // Filter by source
    if (source) {
      history = history.filter(item => item.source === source);
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = history.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length,
          pages: Math.ceil(history.length / parseInt(limit))
        }
      },
      message: 'Points history retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching points history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch points history',
      error: error.message
    });
  }
});

// Get leaderboard
router.get('/loyalty/leaderboard', auth, async (req, res) => {
  try {
    const { 
      limit = 50,
      region = '',
      tier = ''
    } = req.query;

    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    const pipeline = [
      {
        $lookup: {
          from: 'partnerUsers',
          localField: 'partnerId',
          foreignField: 'partnerId',
          as: 'partner'
        }
      },
      {
        $unwind: '$partner'
      }
    ];

    // Filter by region if provided
    if (region) {
      pipeline.push({
        $match: {
          'partner.businessAddress.state': region
        }
      });
    }

    // Filter by tier if provided
    if (tier && Object.values(LOYALTY_TIERS).includes(tier)) {
      pipeline.push({
        $match: { tier }
      });
    }

    pipeline.push(
      {
        $project: {
          partnerId: 1,
          points: 1,
          tier: 1,
          totalEarned: 1,
          'partner.businessName': 1,
          'partner.businessAddress.city': 1,
          'partner.businessAddress.state': 1
        }
      },
      {
        $sort: { points: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    );

    const leaderboard = await loyaltyCollection.aggregate(pipeline).toArray();

    // Add rank to each entry
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json({
      success: true,
      data: leaderboard,
      message: 'Leaderboard retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

// Get available rewards
router.get('/loyalty/rewards', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const loyaltyCollection = await getCollection('partnerLoyalty');
    
    const loyalty = await loyaltyCollection.findOne({
      partnerId: partner.partnerId
    });

    if (!loyalty) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty record not found'
      });
    }

    // Define available rewards based on tier
    const availableRewards = {
      [LOYALTY_TIERS.BRONZE]: [
        { type: REWARD_TYPES.CASHBACK, points: 100, value: 10, description: '10 EGP Cashback' },
        { type: REWARD_TYPES.TRAINING_ACCESS, points: 500, value: 1, description: '1 Training Course' }
      ],
      [LOYALTY_TIERS.SILVER]: [
        { type: REWARD_TYPES.CASHBACK, points: 100, value: 15, description: '15 EGP Cashback' },
        { type: REWARD_TIERS.TRAINING_ACCESS, points: 400, value: 1, description: '1 Training Course' },
        { type: REWARD_TIERS.PREMIUM_FEATURES, points: 1000, value: 1, description: 'Premium Features Access' }
      ],
      [LOYALTY_TIERS.GOLD]: [
        { type: REWARD_TYPES.CASHBACK, points: 100, value: 20, description: '20 EGP Cashback' },
        { type: REWARD_TIERS.TRAINING_ACCESS, points: 300, value: 1, description: '1 Training Course' },
        { type: REWARD_TIERS.PREMIUM_FEATURES, points: 800, value: 1, description: 'Premium Features Access' },
        { type: REWARD_TYPES.FEATURED_LISTING, points: 2000, value: 1, description: 'Featured Listing (1 Month)' }
      ],
      [LOYALTY_TIERS.PLATINUM]: [
        { type: REWARD_TYPES.CASHBACK, points: 100, value: 25, description: '25 EGP Cashback' },
        { type: REWARD_TIERS.TRAINING_ACCESS, points: 200, value: 1, description: '1 Training Course' },
        { type: REWARD_TIERS.PREMIUM_FEATURES, points: 600, value: 1, description: 'Premium Features Access' },
        { type: REWARD_TIERS.FEATURED_LISTING, points: 1500, value: 1, description: 'Featured Listing (1 Month)' },
        { type: REWARD_TIERS.DEDICATED_SUPPORT, points: 5000, value: 1, description: 'Dedicated Support (1 Month)' }
      ]
    };

    const rewards = availableRewards[loyalty.tier] || availableRewards[LOYALTY_TIERS.BRONZE];

    res.json({
      success: true,
      data: {
        rewards,
        currentPoints: loyalty.points,
        tier: loyalty.tier
      },
      message: 'Available rewards retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards',
      error: error.message
    });
  }
});

module.exports = router;
