const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Location Status
const LOCATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  CLOSED: 'closed'
};

// Location Types
const LOCATION_TYPES = {
  MAIN_BRANCH: 'main_branch',
  BRANCH: 'branch',
  WAREHOUSE: 'warehouse',
  SERVICE_CENTER: 'service_center',
  MOBILE_UNIT: 'mobile_unit'
};

// Add location
router.post('/locations', [
  auth,
  body('name').notEmpty().withMessage('Location name is required'),
  body('type').isIn(Object.values(LOCATION_TYPES)).withMessage('Invalid location type'),
  body('address').isObject().withMessage('Address is required'),
  body('address.street').notEmpty().withMessage('Street is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.postalCode').optional().isString().withMessage('Postal code must be string'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('coordinates').isObject().withMessage('Coordinates are required'),
  body('coordinates.latitude').isNumeric().withMessage('Latitude must be numeric'),
  body('coordinates.longitude').isNumeric().withMessage('Longitude must be numeric'),
  body('phone').optional().isString().withMessage('Phone must be string'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('managerName').optional().isString().withMessage('Manager name must be string'),
  body('managerPhone').optional().isString().withMessage('Manager phone must be string'),
  body('services').optional().isArray().withMessage('Services must be array'),
  body('operatingHours').optional().isObject().withMessage('Operating hours must be object'),
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
      address,
      coordinates,
      phone,
      email,
      managerName,
      managerPhone,
      services = [],
      operatingHours = {},
      notes
    } = req.body;

    const location = {
      partnerId: partner.partnerId,
      name,
      type,
      address,
      coordinates,
      phone,
      email: email?.toLowerCase(),
      manager: {
        name: managerName,
        phone: managerPhone
      },
      services,
      operatingHours,
      status: LOCATION_STATUS.ACTIVE,
      notes,
      isMain: false, // Will be set to true if this is the first location
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { getCollection } = require('../config/database');
    const locationsCollection = await getCollection('partnerLocations');
    
    // Check if this is the first location (make it main)
    const existingLocations = await locationsCollection.countDocuments({
      partnerId: partner.partnerId
    });
    
    if (existingLocations === 0) {
      location.isMain = true;
    }

    const result = await locationsCollection.insertOne(location);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...location
      },
      message: 'Location added successfully'
    });
  } catch (error) {
    logger.error('Error adding location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add location',
      error: error.message
    });
  }
});

// Get locations
router.get('/locations', auth, async (req, res) => {
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
    
    if (status && Object.values(LOCATION_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (type && Object.values(LOCATION_TYPES).includes(type)) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const locationsCollection = await getCollection('partnerLocations');
    
    const locations = await locationsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await locationsCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        locations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Locations retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message
    });
  }
});

// Get location by ID
router.get('/locations/:id', auth, async (req, res) => {
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
    const locationsCollection = await getCollection('partnerLocations');
    
    const location = await locationsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      data: location,
      message: 'Location retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location',
      error: error.message
    });
  }
});

// Update location
router.patch('/locations/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('type').optional().isIn(Object.values(LOCATION_TYPES)).withMessage('Invalid location type'),
  body('address').optional().isObject().withMessage('Address must be object'),
  body('coordinates').optional().isObject().withMessage('Coordinates must be object'),
  body('phone').optional().isString().withMessage('Phone must be string'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('managerName').optional().isString().withMessage('Manager name must be string'),
  body('managerPhone').optional().isString().withMessage('Manager phone must be string'),
  body('services').optional().isArray().withMessage('Services must be array'),
  body('operatingHours').optional().isObject().withMessage('Operating hours must be object'),
  body('status').optional().isIn(Object.values(LOCATION_STATUS)).withMessage('Invalid status'),
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
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.email) updateData.email = req.body.email.toLowerCase();
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.notes) updateData.notes = req.body.notes;

    // Update address
    if (req.body.address) {
      updateData.address = req.body.address;
    }

    // Update coordinates
    if (req.body.coordinates) {
      updateData.coordinates = req.body.coordinates;
    }

    // Update manager info
    if (req.body.managerName || req.body.managerPhone) {
      updateData.manager = {};
      if (req.body.managerName) updateData.manager.name = req.body.managerName;
      if (req.body.managerPhone) updateData.manager.phone = req.body.managerPhone;
    }

    // Update services
    if (req.body.services) {
      updateData.services = req.body.services;
    }

    // Update operating hours
    if (req.body.operatingHours) {
      updateData.operatingHours = req.body.operatingHours;
    }

    const { getCollection } = require('../config/database');
    const locationsCollection = await getCollection('partnerLocations');
    
    const result = await locationsCollection.updateOne(
      { _id: id, partnerId: partner.partnerId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    logger.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// Set main location
router.patch('/locations/:id/set-main', auth, async (req, res) => {
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
    const locationsCollection = await getCollection('partnerLocations');
    
    // Check if location exists and belongs to partner
    const location = await locationsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Remove main status from all other locations
    await locationsCollection.updateMany(
      { partnerId: partner.partnerId },
      { $set: { isMain: false, updatedAt: new Date() } }
    );

    // Set this location as main
    await locationsCollection.updateOne(
      { _id: id },
      { $set: { isMain: true, updatedAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'Main location updated successfully'
    });
  } catch (error) {
    logger.error('Error setting main location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set main location',
      error: error.message
    });
  }
});

// Delete location
router.delete('/locations/:id', auth, async (req, res) => {
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
    const locationsCollection = await getCollection('partnerLocations');
    
    const location = await locationsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    if (location.isMain) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete main location'
      });
    }

    const result = await locationsCollection.deleteOne({
      _id: id,
      partnerId: partner.partnerId
    });

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete location',
      error: error.message
    });
  }
});

// Get nearby locations
router.get('/locations/nearby', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      latitude,
      longitude,
      radius = 10, // km
      limit = 10
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const { getCollection } = require('../config/database');
    const locationsCollection = await getCollection('partnerLocations');
    
    // Use MongoDB geospatial query to find nearby locations
    const nearbyLocations = await locationsCollection.find({
      partnerId: partner.partnerId,
      status: LOCATION_STATUS.ACTIVE,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .limit(parseInt(limit))
    .toArray();

    res.json({
      success: true,
      data: nearbyLocations,
      message: 'Nearby locations retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching nearby locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby locations',
      error: error.message
    });
  }
});

// Get location statistics
router.get('/locations/stats', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const locationsCollection = await getCollection('partnerLocations');
    
    const stats = await locationsCollection.aggregate([
      {
        $match: { partnerId: partner.partnerId }
      },
      {
        $group: {
          _id: null,
          totalLocations: { $sum: 1 },
          activeLocations: {
            $sum: { $cond: [{ $eq: ['$status', LOCATION_STATUS.ACTIVE] }, 1, 0] }
          },
          inactiveLocations: {
            $sum: { $cond: [{ $eq: ['$status', LOCATION_STATUS.INACTIVE] }, 1, 0] }
          },
          maintenanceLocations: {
            $sum: { $cond: [{ $eq: ['$status', LOCATION_STATUS.MAINTENANCE] }, 1, 0] }
          },
          closedLocations: {
            $sum: { $cond: [{ $eq: ['$status', LOCATION_STATUS.CLOSED] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const locationStats = stats[0] || {
      totalLocations: 0,
      activeLocations: 0,
      inactiveLocations: 0,
      maintenanceLocations: 0,
      closedLocations: 0
    };

    // Get type breakdown
    const typeBreakdown = await locationsCollection.aggregate([
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
        ...locationStats,
        typeBreakdown
      },
      message: 'Location statistics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching location statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location statistics',
      error: error.message
    });
  }
});

module.exports = router;
