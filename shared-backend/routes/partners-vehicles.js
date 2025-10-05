const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Vehicle Status
const VEHICLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired'
};

// Service History Types
const SERVICE_TYPES = {
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
  INSPECTION: 'inspection',
  DIAGNOSTIC: 'diagnostic',
  INSTALLATION: 'installation',
  WARRANTY: 'warranty'
};

// Add customer vehicle
router.post('/vehicles', [
  auth,
  body('customerId').optional().isString().withMessage('Customer ID must be string'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('customerEmail').optional().isEmail().withMessage('Valid email is required'),
  body('make').notEmpty().withMessage('Vehicle make is required'),
  body('model').notEmpty().withMessage('Vehicle model is required'),
  body('year').optional().isNumeric().withMessage('Year must be numeric'),
  body('licensePlate').optional().isString().withMessage('License plate must be string'),
  body('vin').optional().isString().withMessage('VIN must be string'),
  body('color').optional().isString().withMessage('Color must be string'),
  body('mileage').optional().isNumeric().withMessage('Mileage must be numeric'),
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
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      make,
      model,
      year,
      licensePlate,
      vin,
      color,
      mileage,
      notes
    } = req.body;

    const vehicle = {
      partnerId: partner.partnerId,
      customerId,
      customerName,
      customerPhone,
      customerEmail: customerEmail?.toLowerCase(),
      vehicleInfo: {
        make,
        model,
        year,
        licensePlate,
        vin,
        color,
        mileage
      },
      status: VEHICLE_STATUS.ACTIVE,
      notes,
      serviceHistory: [],
      lastServiceDate: null,
      nextServiceDue: null,
      totalServices: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { getCollection } = require('../config/database');
    const vehiclesCollection = await getCollection('customerVehicles');
    const result = await vehiclesCollection.insertOne(vehicle);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...vehicle
      },
      message: 'Vehicle added successfully'
    });
  } catch (error) {
    logger.error('Error adding vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add vehicle',
      error: error.message
    });
  }
});

// Get vehicles
router.get('/vehicles', auth, async (req, res) => {
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
      make = '',
      model = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(VEHICLE_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (make) {
      query['vehicleInfo.make'] = { $regex: make, $options: 'i' };
    }
    
    if (model) {
      query['vehicleInfo.model'] = { $regex: model, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { 'vehicleInfo.licensePlate': { $regex: search, $options: 'i' } },
        { 'vehicleInfo.vin': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const vehiclesCollection = await getCollection('customerVehicles');
    
    const vehicles = await vehiclesCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await vehiclesCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Vehicles retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
});

// Get vehicle by ID
router.get('/vehicles/:id', auth, async (req, res) => {
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
    const vehiclesCollection = await getCollection('customerVehicles');
    
    const vehicle = await vehiclesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message
    });
  }
});

// Add service record
router.post('/vehicles/:id/services', [
  auth,
  body('serviceType').isIn(Object.values(SERVICE_TYPES)).withMessage('Invalid service type'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('date').isISO8601().withMessage('Service date must be valid ISO date'),
  body('cost').optional().isNumeric().withMessage('Cost must be numeric'),
  body('mileage').optional().isNumeric().withMessage('Mileage must be numeric'),
  body('technician').optional().isString().withMessage('Technician must be string'),
  body('partsUsed').optional().isArray().withMessage('Parts used must be array'),
  body('notes').optional().isString().withMessage('Notes must be string'),
  body('warranty').optional().isObject().withMessage('Warranty must be object')
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
    const {
      serviceType,
      description,
      date,
      cost,
      mileage,
      technician,
      partsUsed,
      notes,
      warranty
    } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const vehiclesCollection = await getCollection('customerVehicles');
    
    const vehicle = await vehiclesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const serviceRecord = {
      id: new Date().getTime().toString(),
      serviceType,
      description,
      date: new Date(date),
      cost: cost || 0,
      mileage: mileage || vehicle.vehicleInfo.mileage,
      technician,
      partsUsed: partsUsed || [],
      notes,
      warranty: warranty || null,
      createdAt: new Date(),
      createdBy: partner._id
    };

    const newTotalServices = vehicle.totalServices + 1;
    const newTotalSpent = vehicle.totalSpent + (cost || 0);
    const newLastServiceDate = new Date(date);

    await vehiclesCollection.updateOne(
      { _id: id },
      {
        $set: {
          totalServices: newTotalServices,
          totalSpent: newTotalSpent,
          lastServiceDate: newLastServiceDate,
          updatedAt: new Date()
        },
        $push: {
          serviceHistory: serviceRecord
        }
      }
    );

    res.json({
      success: true,
      data: serviceRecord,
      message: 'Service record added successfully'
    });
  } catch (error) {
    logger.error('Error adding service record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add service record',
      error: error.message
    });
  }
});

// Get service history
router.get('/vehicles/:id/services', auth, async (req, res) => {
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
      page = 1, 
      limit = 20, 
      serviceType = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const { getCollection } = require('../config/database');
    const vehiclesCollection = await getCollection('customerVehicles');
    
    const vehicle = await vehiclesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    let services = vehicle.serviceHistory || [];

    // Filter by service type
    if (serviceType && Object.values(SERVICE_TYPES).includes(serviceType)) {
      services = services.filter(service => service.serviceType === serviceType);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      services = services.filter(service => service.date >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      services = services.filter(service => service.date <= toDate);
    }

    // Sort services
    services.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedServices = services.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        services: paginatedServices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: services.length,
          pages: Math.ceil(services.length / parseInt(limit))
        }
      },
      message: 'Service history retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching service history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service history',
      error: error.message
    });
  }
});

// Update vehicle
router.patch('/vehicles/:id', [
  auth,
  body('customerName').optional().notEmpty().withMessage('Customer name cannot be empty'),
  body('customerPhone').optional().notEmpty().withMessage('Customer phone cannot be empty'),
  body('customerEmail').optional().isEmail().withMessage('Valid email is required'),
  body('make').optional().notEmpty().withMessage('Make cannot be empty'),
  body('model').optional().notEmpty().withMessage('Model cannot be empty'),
  body('year').optional().isNumeric().withMessage('Year must be numeric'),
  body('licensePlate').optional().isString().withMessage('License plate must be string'),
  body('vin').optional().isString().withMessage('VIN must be string'),
  body('color').optional().isString().withMessage('Color must be string'),
  body('mileage').optional().isNumeric().withMessage('Mileage must be numeric'),
  body('status').optional().isIn(Object.values(VEHICLE_STATUS)).withMessage('Invalid status'),
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

    // Update customer info
    if (req.body.customerName) updateData.customerName = req.body.customerName;
    if (req.body.customerPhone) updateData.customerPhone = req.body.customerPhone;
    if (req.body.customerEmail) updateData.customerEmail = req.body.customerEmail.toLowerCase();
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.notes) updateData.notes = req.body.notes;

    // Update vehicle info
    if (req.body.make || req.body.model || req.body.year || req.body.licensePlate || 
        req.body.vin || req.body.color || req.body.mileage) {
      updateData.vehicleInfo = {};
      if (req.body.make) updateData.vehicleInfo.make = req.body.make;
      if (req.body.model) updateData.vehicleInfo.model = req.body.model;
      if (req.body.year) updateData.vehicleInfo.year = req.body.year;
      if (req.body.licensePlate) updateData.vehicleInfo.licensePlate = req.body.licensePlate;
      if (req.body.vin) updateData.vehicleInfo.vin = req.body.vin;
      if (req.body.color) updateData.vehicleInfo.color = req.body.color;
      if (req.body.mileage) updateData.vehicleInfo.mileage = req.body.mileage;
    }

    const { getCollection } = require('../config/database');
    const vehiclesCollection = await getCollection('customerVehicles');
    
    const result = await vehiclesCollection.updateOne(
      { _id: id, partnerId: partner.partnerId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    logger.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
});

// Get vehicle statistics
router.get('/vehicles/:id/stats', auth, async (req, res) => {
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
    const vehiclesCollection = await getCollection('customerVehicles');
    
    const vehicle = await vehiclesCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const services = vehicle.serviceHistory || [];
    
    // Calculate statistics
    const totalServices = services.length;
    const totalSpent = services.reduce((sum, service) => sum + (service.cost || 0), 0);
    const averageServiceCost = totalServices > 0 ? totalSpent / totalServices : 0;
    
    // Service type breakdown
    const serviceTypeBreakdown = {};
    services.forEach(service => {
      serviceTypeBreakdown[service.serviceType] = (serviceTypeBreakdown[service.serviceType] || 0) + 1;
    });

    // Monthly service frequency
    const monthlyServices = {};
    services.forEach(service => {
      const month = service.date.toISOString().substring(0, 7); // YYYY-MM
      monthlyServices[month] = (monthlyServices[month] || 0) + 1;
    });

    // Recent services (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentServices = services.filter(service => service.date >= sixMonthsAgo);

    res.json({
      success: true,
      data: {
        totalServices,
        totalSpent,
        averageServiceCost: Math.round(averageServiceCost * 100) / 100,
        serviceTypeBreakdown,
        monthlyServices,
        recentServices: recentServices.length,
        lastServiceDate: vehicle.lastServiceDate,
        nextServiceDue: vehicle.nextServiceDue
      },
      message: 'Vehicle statistics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching vehicle statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle statistics',
      error: error.message
    });
  }
});

// Search vehicles
router.get('/vehicles/search', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      q = '',
      limit = 10
    } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const { getCollection } = require('../config/database');
    const vehiclesCollection = await getCollection('customerVehicles');
    
    const vehicles = await vehiclesCollection
      .find({
        partnerId: partner.partnerId,
        $or: [
          { customerName: { $regex: q, $options: 'i' } },
          { customerPhone: { $regex: q, $options: 'i' } },
          { 'vehicleInfo.licensePlate': { $regex: q, $options: 'i' } },
          { 'vehicleInfo.vin': { $regex: q, $options: 'i' } },
          { 'vehicleInfo.make': { $regex: q, $options: 'i' } },
          { 'vehicleInfo.model': { $regex: q, $options: 'i' } }
        ]
      })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: vehicles.map(vehicle => ({
        id: vehicle._id,
        customerName: vehicle.customerName,
        customerPhone: vehicle.customerPhone,
        vehicleInfo: vehicle.vehicleInfo,
        totalServices: vehicle.totalServices,
        lastServiceDate: vehicle.lastServiceDate
      })),
      message: 'Vehicle search completed successfully'
    });
  } catch (error) {
    logger.error('Error searching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search vehicles',
      error: error.message
    });
  }
});

module.exports = router;
