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
  SUSPENDED: 'suspended'
};

// Payment Terms
const PAYMENT_TERMS = {
  NET_15: 'net_15',
  NET_30: 'net_30',
  NET_45: 'net_45',
  NET_60: 'net_60',
  CASH_ON_DELIVERY: 'cod',
  PREPAID: 'prepaid'
};

// Add supplier
router.post('/suppliers', [
  auth,
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').isObject().withMessage('Address is required'),
  body('address.street').notEmpty().withMessage('Street is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('paymentTerms').optional().isIn(Object.values(PAYMENT_TERMS)).withMessage('Invalid payment terms'),
  body('leadTime').optional().isNumeric().withMessage('Lead time must be numeric'),
  body('notes').optional().isString().withMessage('Notes must be a string')
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
      contactPerson,
      email,
      phone,
      address,
      paymentTerms = PAYMENT_TERMS.NET_30,
      leadTime = 7,
      notes
    } = req.body;

    const supplier = {
      partnerId: partner.partnerId,
      name,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      address,
      paymentTerms,
      leadTime,
      notes,
      status: SUPPLIER_STATUS.ACTIVE,
      performance: {
        onTimeDeliveryRate: 100,
        qualityIssues: 0,
        totalOrders: 0,
        averageRating: 5.0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database (using existing pattern)
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
      search = '', 
      status = '', 
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && Object.values(SUPPLIER_STATUS).includes(status)) {
      query.status = status;
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
  body('contactPerson').optional().notEmpty().withMessage('Contact person cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('paymentTerms').optional().isIn(Object.values(PAYMENT_TERMS)).withMessage('Invalid payment terms'),
  body('leadTime').optional().isNumeric().withMessage('Lead time must be numeric'),
  body('status').optional().isIn(Object.values(SUPPLIER_STATUS)).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
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
      ...req.body,
      updatedAt: new Date()
    };

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
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

    // Get performance metrics from purchase orders
    const purchaseOrdersCollection = await getCollection('partnerPurchaseOrders');
    const performanceData = await purchaseOrdersCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          supplierId: id
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          onTimeDeliveries: {
            $sum: {
              $cond: [
                { $lte: ['$deliveryDate', '$expectedDeliveryDate'] },
                1,
                0
              ]
            }
          },
          totalValue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]).toArray();

    const performance = performanceData[0] || {
      totalOrders: 0,
      onTimeDeliveries: 0,
      totalValue: 0,
      averageOrderValue: 0
    };

    const onTimeDeliveryRate = performance.totalOrders > 0 
      ? (performance.onTimeDeliveries / performance.totalOrders) * 100 
      : 100;

    res.json({
      success: true,
      data: {
        supplierId: id,
        totalOrders: performance.totalOrders,
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 100) / 100,
        totalValue: performance.totalValue,
        averageOrderValue: performance.averageOrderValue,
        lastOrderDate: supplier.lastOrderDate || null
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

module.exports = router;
