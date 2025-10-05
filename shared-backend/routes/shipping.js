const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { getCollection } = require('../config/database');
const ShippingZone = require('../models/ShippingZone');
const fs = require('fs');
const path = require('path');

// Rate limiting for shipping operations
const shippingRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many shipping requests from this IP, please try again later.'
});

// GET /api/v1/shipping/zones - List all shipping zones with search/filter
router.get('/zones', authenticateToken, checkRole(['head_administrator', 'operations_manager', 'system_admin']), shippingRateLimit, async (req, res) => {
  try {
    const {
      governorate = '',
      city = '',
      isActive = '',
      search = '',
      page = 1,
      limit = 20,
      sortBy = 'governorate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    
    if (governorate) query.governorate = { $regex: governorate, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (isActive !== '') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { governorate: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const zones = await ShippingZone.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ShippingZone.countDocuments(query);

    res.json({
      success: true,
      data: {
        zones,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Shipping zones retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping zones',
      message: error.message
    });
  }
});

// POST /api/v1/shipping/zones - Create shipping zone
router.post('/zones', authenticateToken, checkRole(['head_administrator', 'operations_manager']), shippingRateLimit, async (req, res) => {
  try {
    const {
      governorate,
      city,
      district,
      areas,
      cost,
      estimatedDays,
      isActive = true,
      freeShippingThreshold,
      weightLimits,
      deliveryOptions,
      restrictions,
      notes
    } = req.body;

    // Validate required fields
    if (!governorate || !city || !cost || !estimatedDays) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Governorate, city, cost, and estimated days are required'
      });
    }

    // Check if zone already exists
    const existingZone = await ShippingZone.findOne({
      governorate,
      city,
      district: district || null
    });

    if (existingZone) {
      return res.status(400).json({
        success: false,
        error: 'Zone already exists',
        message: 'A shipping zone for this location already exists'
      });
    }

    // Create shipping zone
    const zone = new ShippingZone({
      governorate,
      city,
      district,
      areas: areas || [],
      cost,
      estimatedDays,
      isActive,
      freeShippingThreshold,
      weightLimits,
      deliveryOptions,
      restrictions,
      notes
    });

    await zone.save();

    res.status(201).json({
      success: true,
      data: zone,
      message: 'Shipping zone created successfully'
    });
  } catch (error) {
    console.error('Error creating shipping zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create shipping zone',
      message: error.message
    });
  }
});

// PUT /api/v1/shipping/zones/:id - Update zone cost/details
router.put('/zones/:id', authenticateToken, checkRole(['head_administrator', 'operations_manager']), shippingRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const zone = await ShippingZone.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found',
        message: 'Shipping zone not found'
      });
    }

    res.json({
      success: true,
      data: zone,
      message: 'Shipping zone updated successfully'
    });
  } catch (error) {
    console.error('Error updating shipping zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shipping zone',
      message: error.message
    });
  }
});

// DELETE /api/v1/shipping/zones/:id - Remove zone
router.delete('/zones/:id', authenticateToken, checkRole(['head_administrator']), shippingRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await ShippingZone.findByIdAndDelete(id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found',
        message: 'Shipping zone not found'
      });
    }

    res.json({
      success: true,
      message: 'Shipping zone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shipping zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete shipping zone',
      message: error.message
    });
  }
});

// GET /api/v1/shipping/zones/calculate - Calculate shipping for address
router.get('/zones/calculate', async (req, res) => {
  try {
    const { governorate, city, district, orderValue = 0 } = req.query;

    if (!governorate || !city) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Governorate and city are required'
      });
    }

    // Find matching zone
    const zone = await ShippingZone.findOne({
      governorate: { $regex: governorate, $options: 'i' },
      city: { $regex: city, $options: 'i' },
      district: district ? { $regex: district, $options: 'i' } : { $exists: false },
      isActive: true
    });

    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found',
        message: 'No shipping zone found for this location'
      });
    }

    // Check if order qualifies for free shipping
    let shippingCost = zone.cost;
    let isFreeShipping = false;

    if (zone.freeShippingThreshold && orderValue >= zone.freeShippingThreshold) {
      shippingCost = 0;
      isFreeShipping = true;
    }

    // Get delivery options
    const deliveryOptions = [];
    if (zone.deliveryOptions) {
      if (zone.deliveryOptions.standard?.enabled) {
        deliveryOptions.push({
          type: 'standard',
          cost: shippingCost,
          days: zone.estimatedDays,
          label: 'Standard Delivery'
        });
      }
      if (zone.deliveryOptions.express?.enabled) {
        deliveryOptions.push({
          type: 'express',
          cost: zone.deliveryOptions.express.cost,
          days: zone.deliveryOptions.express.days,
          label: 'Express Delivery'
        });
      }
      if (zone.deliveryOptions.overnight?.enabled) {
        deliveryOptions.push({
          type: 'overnight',
          cost: zone.deliveryOptions.overnight.cost,
          days: zone.deliveryOptions.overnight.days,
          label: 'Overnight Delivery'
        });
      }
    }

    res.json({
      success: true,
      data: {
        zone: {
          governorate: zone.governorate,
          city: zone.city,
          district: zone.district
        },
        shippingCost,
        isFreeShipping,
        estimatedDays: zone.estimatedDays,
        deliveryOptions,
        restrictions: zone.restrictions
      },
      message: 'Shipping cost calculated successfully'
    });
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate shipping cost',
      message: error.message
    });
  }
});

// GET /api/v1/shipping/locations - Get governorates/cities/districts hierarchy
router.get('/locations', async (req, res) => {
  try {
    const locationsPath = path.join(__dirname, '../data/egypt-locations.json');
    const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

    res.json({
      success: true,
      data: locationsData,
      message: 'Locations hierarchy retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations',
      message: error.message
    });
  }
});

// POST /api/v1/shipping/bulk-update - Bulk update costs by governorate
router.post('/bulk-update', authenticateToken, checkRole(['head_administrator', 'operations_manager']), shippingRateLimit, async (req, res) => {
  try {
    const { governorate, updates } = req.body;

    if (!governorate || !updates) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Governorate and updates are required'
      });
    }

    const { cost, estimatedDays, isActive } = updates;

    // Update all zones in the governorate
    const result = await ShippingZone.updateMany(
      { governorate: { $regex: governorate, $options: 'i' } },
      {
        $set: {
          ...(cost !== undefined && { cost }),
          ...(estimatedDays !== undefined && { estimatedDays }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      message: 'Bulk update completed successfully'
    });
  } catch (error) {
    console.error('Error performing bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk update',
      message: error.message
    });
  }
});

// POST /api/v1/shipping/seed-zones - Seed initial shipping zones from Egypt locations
router.post('/seed-zones', authenticateToken, checkRole(['head_administrator']), shippingRateLimit, async (req, res) => {
  try {
    const locationsPath = path.join(__dirname, '../data/egypt-locations.json');
    const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

    const seededZones = [];

    for (const governorate of locationsData.governorates) {
      for (const city of governorate.cities) {
        for (const district of city.districts) {
          const defaultCost = locationsData.defaultShippingCosts[governorate.name] || 50;
          const estimatedDays = locationsData.estimatedDeliveryDays[governorate.name] || 3;

          const zone = new ShippingZone({
            governorate: governorate.name,
            city: city.name,
            district,
            cost: defaultCost,
            estimatedDays,
            isActive: true,
            freeShippingThreshold: defaultCost > 50 ? 500 : 300, // Higher threshold for remote areas
            metadata: {
              distanceFromCairo: governorate.name === 'Cairo' ? 0 : Math.floor(Math.random() * 500) + 50,
              economicTier: defaultCost > 100 ? 'low' : defaultCost > 50 ? 'medium' : 'high'
            }
          });

          await zone.save();
          seededZones.push(zone);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        seededCount: seededZones.length,
        zones: seededZones.slice(0, 10) // Return first 10 as sample
      },
      message: 'Shipping zones seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding shipping zones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed shipping zones',
      message: error.message
    });
  }
});

module.exports = router;
