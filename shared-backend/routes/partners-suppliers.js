const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Supplier Status
const SUPPLIER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
};

// Supplier Types
const SUPPLIER_TYPES = {
  MANUFACTURER: 'manufacturer',
  DISTRIBUTOR: 'distributor',
  WHOLESALER: 'wholesaler',
  RETAILER: 'retailer',
  SERVICE_PROVIDER: 'service_provider'
};

// Add supplier
router.post('/suppliers', [
  auth,
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('type').isIn(Object.values(SUPPLIER_TYPES)).withMessage('Invalid supplier type'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').isObject().withMessage('Address is required'),
  body('address.street').notEmpty().withMessage('Street is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('website').optional().isURL().withMessage('Valid URL is required'),
  body('taxId').optional().isString().withMessage('Tax ID must be string'),
  body('paymentTerms').optional().isString().withMessage('Payment terms must be string'),
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const {
      name,
      type,
      contactPerson,
      email,
      phone,
      address,
      website,
      taxId,
      paymentTerms,
      notes
    } = req.body;

    const supplier = {
      partnerId: partner.partnerId,
      name,
      type,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      address,
      website,
      taxId,
      paymentTerms,
      notes,
      status: SUPPLIER_STATUS.ACTIVE,
      performance: {
        rating: 0,
        totalOrders: 0,
        onTimeDelivery: 0,
        qualityScore: 0,
        communicationScore: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { getCollection } = require('../config/database');
    const suppliersCollection = await getCollection('partnerSuppliers');
    const result = await suppliersCollection.insertOne(supplier);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...supplier
      },
      message: 'Supplier added successfully'
    });
  } catch (error) {
    logger.error('Error adding supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add supplier',
      error: error.message
    });
  }
});

// Get suppliers
router.get('/suppliers', auth, async (req, res) => {
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
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(SUPPLIER_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (type && Object.values(SUPPLIER_TYPES).includes(type)) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const suppliersCollection = await getCollection('partnerSuppliers');
    
    const suppliers = await suppliersCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await suppliersCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Suppliers retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suppliers',
      error: error.message
    });
  }
});

// Get supplier by ID
router.get('/suppliers/:id', auth, async (req, res) => {
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
    const suppliersCollection = await getCollection('partnerSuppliers');
    
    const supplier = await suppliersCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      data: supplier,
      message: 'Supplier retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier',
      error: error.message
    });
  }
});

// Update supplier
router.patch('/suppliers/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('type').optional().isIn(Object.values(SUPPLIER_TYPES)).withMessage('Invalid supplier type'),
  body('contactPerson').optional().notEmpty().withMessage('Contact person cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().isObject().withMessage('Address must be object'),
  body('website').optional().isURL().withMessage('Valid URL is required'),
  body('taxId').optional().isString().withMessage('Tax ID must be string'),
  body('paymentTerms').optional().isString().withMessage('Payment terms must be string'),
  body('status').optional().isIn(Object.values(SUPPLIER_STATUS)).withMessage('Invalid status'),
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
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    // Update basic info
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.contactPerson) updateData.contactPerson = req.body.contactPerson;
    if (req.body.email) updateData.email = req.body.email.toLowerCase();
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.website) updateData.website = req.body.website;
    if (req.body.taxId) updateData.taxId = req.body.taxId;
    if (req.body.paymentTerms) updateData.paymentTerms = req.body.paymentTerms;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.notes) updateData.notes = req.body.notes;

    // Update address
    if (req.body.address) {
      updateData.address = req.body.address;
    }

    const { getCollection } = require('../config/database');
    const suppliersCollection = await getCollection('partnerSuppliers');
    
    const result = await suppliersCollection.updateOne(
      { _id: id, partnerId: partner.partnerId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier updated successfully'
    });
  } catch (error) {
    logger.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update supplier',
      error: error.message
    });
  }
});

// Rate supplier
router.post('/suppliers/:id/rate', [
  auth,
  body('rating').isNumeric().withMessage('Rating must be numeric'),
  body('onTimeDelivery').optional().isNumeric().withMessage('On-time delivery must be numeric'),
  body('qualityScore').optional().isNumeric().withMessage('Quality score must be numeric'),
  body('communicationScore').optional().isNumeric().withMessage('Communication score must be numeric'),
  body('comment').optional().isString().withMessage('Comment must be string')
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
    const { rating, onTimeDelivery, qualityScore, communicationScore, comment } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const suppliersCollection = await getCollection('partnerSuppliers');
    
    const supplier = await suppliersCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const ratingEntry = {
      rating: parseInt(rating),
      onTimeDelivery: onTimeDelivery ? parseInt(onTimeDelivery) : null,
      qualityScore: qualityScore ? parseInt(qualityScore) : null,
      communicationScore: communicationScore ? parseInt(communicationScore) : null,
      comment,
      ratedBy: partner._id,
      ratedAt: new Date()
    };

    // Update supplier performance
    const newTotalOrders = supplier.performance.totalOrders + 1;
    const newRating = ((supplier.performance.rating * supplier.performance.totalOrders) + rating) / newTotalOrders;
    
    const updateData = {
      'performance.rating': Math.round(newRating * 100) / 100,
      'performance.totalOrders': newTotalOrders,
      updatedAt: new Date()
    };

    if (onTimeDelivery) {
      const currentOnTime = supplier.performance.onTimeDelivery || 0;
      const newOnTime = ((currentOnTime * (newTotalOrders - 1)) + onTimeDelivery) / newTotalOrders;
      updateData['performance.onTimeDelivery'] = Math.round(newOnTime * 100) / 100;
    }

    if (qualityScore) {
      const currentQuality = supplier.performance.qualityScore || 0;
      const newQuality = ((currentQuality * (newTotalOrders - 1)) + qualityScore) / newTotalOrders;
      updateData['performance.qualityScore'] = Math.round(newQuality * 100) / 100;
    }

    if (communicationScore) {
      const currentComm = supplier.performance.communicationScore || 0;
      const newComm = ((currentComm * (newTotalOrders - 1)) + communicationScore) / newTotalOrders;
      updateData['performance.communicationScore'] = Math.round(newComm * 100) / 100;
    }

    await suppliersCollection.updateOne(
      { _id: id },
      {
        $set: updateData,
        $push: {
          ratings: ratingEntry
        }
      }
    );

    res.json({
      success: true,
      data: ratingEntry,
      message: 'Supplier rated successfully'
    });
  } catch (error) {
    logger.error('Error rating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate supplier',
      error: error.message
    });
  }
});

// Get supplier performance
router.get('/suppliers/:id/performance', auth, async (req, res) => {
  try {
    const { id } = req.params;
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
    const suppliersCollection = await getCollection('partnerSuppliers');
    
    const supplier = await suppliersCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get recent ratings
    const recentRatings = supplier.ratings?.filter(rating => 
      new Date(rating.ratedAt) >= startDate
    ) || [];

    // Calculate performance metrics
    const totalRatings = recentRatings.length;
    const averageRating = totalRatings > 0 
      ? recentRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    const averageOnTimeDelivery = totalRatings > 0 
      ? recentRatings.filter(r => r.onTimeDelivery).reduce((sum, r) => sum + r.onTimeDelivery, 0) / recentRatings.filter(r => r.onTimeDelivery).length
      : 0;

    const averageQualityScore = totalRatings > 0 
      ? recentRatings.filter(r => r.qualityScore).reduce((sum, r) => sum + r.qualityScore, 0) / recentRatings.filter(r => r.qualityScore).length
      : 0;

    const averageCommunicationScore = totalRatings > 0 
      ? recentRatings.filter(r => r.communicationScore).reduce((sum, r) => sum + r.communicationScore, 0) / recentRatings.filter(r => r.communicationScore).length
      : 0;

    res.json({
      success: true,
      data: {
        supplier: {
          id: supplier._id,
          name: supplier.name,
          type: supplier.type
        },
        performance: {
          overallRating: Math.round(averageRating * 100) / 100,
          onTimeDelivery: Math.round(averageOnTimeDelivery * 100) / 100,
          qualityScore: Math.round(averageQualityScore * 100) / 100,
          communicationScore: Math.round(averageCommunicationScore * 100) / 100,
          totalRatings,
          recentRatings: recentRatings.slice(-10)
        },
        period,
        startDate,
        endDate: now
      },
      message: 'Supplier performance retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching supplier performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier performance',
      error: error.message
    });
  }
});

// Delete supplier
router.delete('/suppliers/:id', auth, async (req, res) => {
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
    const suppliersCollection = await getCollection('partnerSuppliers');
    
    const result = await suppliersCollection.deleteOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete supplier',
      error: error.message
    });
  }
});

// Get supplier statistics
router.get('/suppliers/stats', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const suppliersCollection = await getCollection('partnerSuppliers');
    
    const stats = await suppliersCollection.aggregate([
      {
        $match: { partnerId: partner.partnerId }
      },
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          activeSuppliers: {
            $sum: { $cond: [{ $eq: ['$status', SUPPLIER_STATUS.ACTIVE] }, 1, 0] }
          },
          inactiveSuppliers: {
            $sum: { $cond: [{ $eq: ['$status', SUPPLIER_STATUS.INACTIVE] }, 1, 0] }
          },
          pendingSuppliers: {
            $sum: { $cond: [{ $eq: ['$status', SUPPLIER_STATUS.PENDING] }, 1, 0] }
          },
          suspendedSuppliers: {
            $sum: { $cond: [{ $eq: ['$status', SUPPLIER_STATUS.SUSPENDED] }, 1, 0] }
          },
          averageRating: { $avg: '$performance.rating' },
          totalOrders: { $sum: '$performance.totalOrders' }
        }
      }
    ]).toArray();

    const supplierStats = stats[0] || {
      totalSuppliers: 0,
      activeSuppliers: 0,
      inactiveSuppliers: 0,
      pendingSuppliers: 0,
      suspendedSuppliers: 0,
      averageRating: 0,
      totalOrders: 0
    };

    // Get type breakdown
    const typeBreakdown = await suppliersCollection.aggregate([
      {
        $match: { partnerId: partner.partnerId }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        ...supplierStats,
        averageRating: Math.round(supplierStats.averageRating * 100) / 100,
        typeBreakdown
      },
      message: 'Supplier statistics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching supplier statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supplier statistics',
      error: error.message
    });
  }
});

module.exports = router;