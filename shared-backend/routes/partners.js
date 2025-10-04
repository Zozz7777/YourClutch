const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Partner status enum
const PARTNER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended'
};

// Partner type enum
const PARTNER_TYPE = {
  PARTS_SHOP: 'parts_shop',
  SERVICE_CENTER: 'service_center',
  REPAIR_CENTER: 'repair_center',
  ACCESSORIES_SHOP: 'accessories_shop',
  IMPORTER_MANUFACTURER: 'importer_manufacturer'
};

// GET /api/v1/partners - Get all partners with pagination, search, and filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      type = '',
      status = '',
      minRating = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const partnersCollection = await getCollection('partners');
    
    // Build query
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partnerId: { $regex: search, $options: 'i' } },
        { 'primaryContact.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Type filter
    if (type && Object.values(PARTNER_TYPE).includes(type)) {
      query.type = type;
    }
    
    // Status filter
    if (status && Object.values(PARTNER_STATUS).includes(status)) {
      query.status = status;
    }
    
    // Rating filter
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      if (!isNaN(minRatingNum)) {
        query['rating.average'] = { $gte: minRatingNum };
      }
    }
    
    // Build sort
    const sort = {};
    if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const partners = await partnersCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await partnersCollection.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        partners,
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
    console.error('❌ Error fetching partners:', error);
    res.status(500).json({
      success: false,
      error: 'PARTNERS_FETCH_FAILED',
      message: 'Failed to fetch partners',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/partners/:id - Get partner details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const partnersCollection = await getCollection('partners');
    
    const partner = await partnersCollection.findOne({ 
      $or: [
        { _id: id },
        { partnerId: id }
      ]
    });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'PARTNER_NOT_FOUND',
        message: 'Partner not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      data: partner,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching partner:', error);
    res.status(500).json({
      success: false,
      error: 'PARTNER_FETCH_FAILED',
      message: 'Failed to fetch partner',
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/v1/partners/:id/status - Update partner status (suspend/unsuspend)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!status || !Object.values(PARTNER_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Invalid status value',
        timestamp: new Date().toISOString()
      });
    }
    
    const partnersCollection = await getCollection('partners');
    
    // Check if partner exists
    const existingPartner = await partnersCollection.findOne({ 
      $or: [
        { _id: id },
        { partnerId: id }
      ]
    });
    
    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        error: 'PARTNER_NOT_FOUND',
        message: 'Partner not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update status
    const result = await partnersCollection.updateOne(
      { 
        $or: [
          { _id: id },
          { partnerId: id }
        ]
      },
      {
        $set: {
          status,
          updatedAt: new Date().toISOString()
        },
        $push: {
          audit: {
            action: 'status_change',
            from: existingPartner.status,
            to: status,
            reason: reason || '',
            performedBy: req.user.userId,
            performedAt: new Date().toISOString()
          }
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'STATUS_UPDATE_FAILED',
        message: 'Failed to update partner status',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Partner ${status === PARTNER_STATUS.ACTIVE ? 'activated' : 'suspended'} successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating partner status:', error);
    res.status(500).json({
      success: false,
      error: 'STATUS_UPDATE_FAILED',
      message: 'Failed to update partner status',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/partners/:id/reset-access - Reset partner app access
router.post('/:id/reset-access', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const partnersCollection = await getCollection('partners');
    
    // Check if partner exists
    const existingPartner = await partnersCollection.findOne({ 
      $or: [
        { _id: id },
        { partnerId: id }
      ]
    });
    
    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        error: 'PARTNER_NOT_FOUND',
        message: 'Partner not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Reset access (rotate API key, invalidate tokens, etc.)
    const newApiKey = uuidv4();
    const now = new Date().toISOString();
    
    const result = await partnersCollection.updateOne(
      { 
        $or: [
          { _id: id },
          { partnerId: id }
        ]
      },
      {
        $set: {
          'apps.api.keyLastRotatedAt': now,
          'apps.api.currentKey': newApiKey,
          updatedAt: now
        },
        $push: {
          audit: {
            action: 'access_reset',
            reason: reason || '',
            performedBy: req.user.userId,
            performedAt: now
          }
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'ACCESS_RESET_FAILED',
        message: 'Failed to reset partner access',
        timestamp: new Date().toISOString()
      });
    }
    
    // TODO: Send password reset email to partner
    // TODO: Invalidate existing tokens
    
    res.status(200).json({
      success: true,
      message: 'Partner access reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error resetting partner access:', error);
    res.status(500).json({
      success: false,
      error: 'ACCESS_RESET_FAILED',
      message: 'Failed to reset partner access',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/partners/:id/rating/recalculate - Recalculate partner rating
router.post('/:id/rating/recalculate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const partnersCollection = await getCollection('partners');
    
    // Check if partner exists
    const existingPartner = await partnersCollection.findOne({ 
      $or: [
        { _id: id },
        { partnerId: id }
      ]
    });
    
    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        error: 'PARTNER_NOT_FOUND',
        message: 'Partner not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // TODO: Query orders/reviews collection to calculate rating
    // For now, return mock calculation
    const mockRating = {
      average: 4.2,
      count: 15,
      lastUpdatedAt: new Date().toISOString()
    };
    
    // Update rating
    const result = await partnersCollection.updateOne(
      { 
        $or: [
          { _id: id },
          { partnerId: id }
        ]
      },
      {
        $set: {
          rating: mockRating,
          updatedAt: new Date().toISOString()
        },
        $push: {
          audit: {
            action: 'rating_recalculated',
            performedBy: req.user.userId,
            performedAt: new Date().toISOString()
          }
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'RATING_RECALC_FAILED',
        message: 'Failed to recalculate partner rating',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      data: mockRating,
      message: 'Partner rating recalculated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error recalculating partner rating:', error);
    res.status(500).json({
      success: false,
      error: 'RATING_RECALC_FAILED',
      message: 'Failed to recalculate partner rating',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;