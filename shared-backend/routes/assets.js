const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole, checkPermission } = require('../middleware/unified-auth');
const { getCollection } = require('../config/optimized-database');
const rateLimit = require('express-rate-limit');

// Rate limiting
const assetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many asset requests from this IP, please try again later.'
});

// Apply rate limiting and authentication to all routes
router.use(assetLimiter);
router.use(authenticateToken);

// ===== ASSETS MANAGEMENT =====

// GET /api/v1/assets/test - Simple test endpoint
router.get('/test', (req, res) => {
  console.log('Assets test endpoint hit');
  res.json({
    success: true,
    message: 'Assets endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/assets/maintenance-test - Simple maintenance test endpoint
router.get('/maintenance-test', (req, res) => {
  console.log('Maintenance test endpoint hit');
  res.json({
    success: true,
    message: 'Maintenance endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/assets/assignments-test - Simple assignments test endpoint
router.get('/assignments-test', (req, res) => {
  console.log('Assignments test endpoint hit');
  res.json({
    success: true,
    message: 'Assignments endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/assets - Get all assets
router.get('/', async (req, res) => {
  console.log('Assets endpoint hit - no auth required');
  try {
    const assetsCollection = await getCollection('assets');
    const { page = 1, limit = 10, type, status, location, assignedTo } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (location) filter.location = location;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const assets = await assetsCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await assetsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/assets - Create new asset
router.post('/', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const assetsCollection = await getCollection('assets');
    const { 
      name, 
      type, 
      description, 
      serialNumber, 
      model, 
      manufacturer, 
      purchaseDate, 
      purchasePrice, 
      location, 
      status, 
      assignedTo,
      tags 
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name and type are required'
      });
    }
    
    const asset = {
      name,
      type,
      description: description || '',
      serialNumber: serialNumber || '',
      model: model || '',
      manufacturer: manufacturer || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice || 0,
      location: location || '',
      status: status || 'available',
      assignedTo: assignedTo || null,
      tags: tags || [],
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      maintenanceRecords: [],
      assignments: []
    };
    
    const result = await assetsCollection.insertOne(asset);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...asset
      },
      message: 'Asset created successfully'
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



// ===== MAINTENANCE RECORDS =====

// GET /api/v1/maintenance-records - Get all maintenance records
router.get('/maintenance-records', async (req, res) => {
  try {
    const maintenanceCollection = await getCollection('maintenance_records');
    const { page = 1, limit = 10, assetId, type, status } = req.query;
    
    const filter = {};
    if (assetId) filter.assetId = assetId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const records = await maintenanceCollection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await maintenanceCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/maintenance-records - Create maintenance record
router.post('/maintenance-records', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const maintenanceCollection = await getCollection('maintenance_records');
    const { 
      assetId, 
      type, 
      description, 
      scheduledDate, 
      completedDate, 
      cost, 
      technician, 
      status, 
      notes 
    } = req.body;
    
    if (!assetId || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID, type, and description are required'
      });
    }
    
    const record = {
      assetId,
      type,
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      completedDate: completedDate ? new Date(completedDate) : null,
      cost: cost || 0,
      technician: technician || req.user.userId,
      status: status || 'scheduled',
      notes: notes || '',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await maintenanceCollection.insertOne(record);
    
    // Update asset with maintenance record
    const assetsCollection = await getCollection('assets');
    await assetsCollection.updateOne(
      { _id: assetId },
      { 
        $push: { maintenanceRecords: result.insertedId },
        $set: { updatedAt: new Date() }
      }
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...record
      },
      message: 'Maintenance record created successfully'
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/maintenance-records/:id - Update maintenance record
router.put('/maintenance-records/:id', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const maintenanceCollection = await getCollection('maintenance_records');
    const { 
      type, 
      description, 
      scheduledDate, 
      completedDate, 
      cost, 
      technician, 
      status, 
      notes 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (type) updateData.type = type;
    if (description) updateData.description = description;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (completedDate) updateData.completedDate = new Date(completedDate);
    if (cost !== undefined) updateData.cost = cost;
    if (technician) updateData.technician = technician;
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    
    const result = await maintenanceCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Maintenance record updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== ASSET ASSIGNMENTS =====
// (Duplicate removed - see below for the actual implementation)

// POST /api/v1/asset-assignments - Create asset assignment
router.post('/asset-assignments', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const assignmentsCollection = await getCollection('asset_assignments');
    const { assetId, userId, assignedDate, returnDate, purpose, notes } = req.body;
    
    if (!assetId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID and User ID are required'
      });
    }
    
    const assignment = {
      assetId,
      userId,
      assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
      returnDate: returnDate ? new Date(returnDate) : null,
      purpose: purpose || '',
      notes: notes || '',
      status: 'active',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await assignmentsCollection.insertOne(assignment);
    
    // Update asset assignment status
    const assetsCollection = await getCollection('assets');
    await assetsCollection.updateOne(
      { _id: assetId },
      { 
        $set: { 
          assignedTo: userId,
          status: 'assigned',
          updatedAt: new Date()
        }
      }
    );
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...assignment
      },
      message: 'Asset assignment created successfully'
    });
  } catch (error) {
    console.error('Error creating asset assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/asset-assignments/:id - Update asset assignment
router.put('/asset-assignments/:id', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const assignmentsCollection = await getCollection('asset_assignments');
    const { returnDate, purpose, notes, status } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (returnDate) updateData.returnDate = new Date(returnDate);
    if (purpose) updateData.purpose = purpose;
    if (notes) updateData.notes = notes;
    if (status) updateData.status = status;
    
    const result = await assignmentsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset assignment not found'
      });
    }
    
    // If assignment is returned, update asset status
    if (status === 'returned') {
      const assignment = await assignmentsCollection.findOne({ _id: req.params.id });
      if (assignment) {
        const assetsCollection = await getCollection('assets');
        await assetsCollection.updateOne(
          { _id: assignment.assetId },
          { 
            $set: { 
              assignedTo: null,
              status: 'available',
              updatedAt: new Date()
            }
          }
        );
      }
    }
    
    res.json({
      success: true,
      message: 'Asset assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating asset assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/assets/analytics - Get assets analytics
router.get('/analytics/overview', async (req, res) => {
  try {
    const assetsCollection = await getCollection('assets');
    const maintenanceCollection = await getCollection('maintenance_records');
    const assignmentsCollection = await getCollection('asset_assignments');
    
    const totalAssets = await assetsCollection.countDocuments();
    const availableAssets = await assetsCollection.countDocuments({ status: 'available' });
    const assignedAssets = await assetsCollection.countDocuments({ status: 'assigned' });
    const maintenanceAssets = await assetsCollection.countDocuments({ status: 'maintenance' });
    
    // Get assets by type
    const typeStats = await assetsCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get assets by status
    const statusStats = await assetsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get maintenance stats
    const totalMaintenance = await maintenanceCollection.countDocuments();
    const pendingMaintenance = await maintenanceCollection.countDocuments({ status: 'scheduled' });
    const completedMaintenance = await maintenanceCollection.countDocuments({ status: 'completed' });
    
    // Get assignment stats
    const totalAssignments = await assignmentsCollection.countDocuments();
    const activeAssignments = await assignmentsCollection.countDocuments({ status: 'active' });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalAssets,
          availableAssets,
          assignedAssets,
          maintenanceAssets
        },
        typeStats,
        statusStats,
        maintenance: {
          totalMaintenance,
          pendingMaintenance,
          completedMaintenance
        },
        assignments: {
          totalAssignments,
          activeAssignments
        }
      }
    });
  } catch (error) {
    console.error('Error fetching assets analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== ASSET MAINTENANCE =====

// GET /api/v1/assets/maintenance - Get asset maintenance records
router.get('/asset-maintenance', async (req, res) => {
  console.log('Maintenance endpoint hit');
  try {
    const maintenanceCollection = await getCollection('maintenance_records');
    const { page = 1, limit = 10, assetId, status, type } = req.query;
    
    const filter = {};
    if (assetId) filter.assetId = assetId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const maintenanceRecords = await maintenanceCollection
      .find(filter)
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await maintenanceCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        maintenanceRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching asset maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset maintenance records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/assets/maintenance - Create asset maintenance record
router.post('/maintenance', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const maintenanceCollection = await getCollection('maintenance_records');
    const { 
      assetId, 
      type, 
      description, 
      scheduledDate, 
      estimatedCost,
      assignedTo 
    } = req.body;
    
    // Validate required fields
    if (!assetId || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID, type, and description are required'
      });
    }
    
    const maintenanceData = {
      assetId,
      type,
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
      assignedTo,
      status: 'scheduled',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await maintenanceCollection.insertOne(maintenanceData);
    
    res.json({
      success: true,
      data: {
        maintenanceRecord: {
          ...maintenanceData,
          _id: result.insertedId
        }
      },
      message: 'Maintenance record created successfully'
    });
    
  } catch (error) {
    console.error('Error creating asset maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== ASSET ASSIGNMENTS =====

// GET /api/v1/assets/assignments - Get asset assignments
router.get('/asset-assignments', async (req, res) => {
  console.log('Assignments endpoint hit');
  try {
    const assignmentsCollection = await getCollection('asset_assignments');
    const { page = 1, limit = 10, assetId, userId, status } = req.query;
    
    const filter = {};
    if (assetId) filter.assetId = assetId;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const assignments = await assignmentsCollection
      .find(filter)
      .sort({ assignedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await assignmentsCollection.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching asset assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset assignments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/v1/assets/assignments - Create asset assignment
router.post('/assignments', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const assignmentsCollection = await getCollection('asset_assignments');
    const { 
      assetId, 
      userId, 
      assignedDate, 
      returnDate,
      notes 
    } = req.body;
    
    // Validate required fields
    if (!assetId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID and User ID are required'
      });
    }
    
    const assignmentData = {
      assetId,
      userId,
      assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
      returnDate: returnDate ? new Date(returnDate) : null,
      notes: notes || '',
      status: 'active',
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await assignmentsCollection.insertOne(assignmentData);
    
    res.json({
      success: true,
      data: {
        assignment: {
          ...assignmentData,
          _id: result.insertedId
        }
      },
      message: 'Asset assignment created successfully'
    });
    
  } catch (error) {
    console.error('Error creating asset assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== PARAMETERIZED ROUTES (MUST BE LAST) =====

// GET /api/v1/assets/:id - Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const assetsCollection = await getCollection('assets');
    const asset = await assetsCollection.findOne({ _id: req.params.id });
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/v1/assets/:id - Update asset
router.put('/:id', checkRole(['head_administrator', 'asset_manager', 'operations_manager']), async (req, res) => {
  try {
    const assetsCollection = await getCollection('assets');
    const { 
      name, 
      type, 
      description, 
      serialNumber, 
      model, 
      manufacturer, 
      purchaseDate, 
      purchasePrice, 
      location, 
      status, 
      assignedTo,
      tags 
    } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (description) updateData.description = description;
    if (serialNumber) updateData.serialNumber = serialNumber;
    if (model) updateData.model = model;
    if (manufacturer) updateData.manufacturer = manufacturer;
    if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);
    if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice;
    if (location) updateData.location = location;
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;
    
    const result = await assetsCollection.updateOne(
      { _id: req.params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Asset updated successfully'
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/v1/assets/:id - Delete asset
router.delete('/:id', checkRole(['head_administrator']), async (req, res) => {
  try {
    const assetsCollection = await getCollection('assets');
    const result = await assetsCollection.deleteOne({ _id: req.params.id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/assets/maintenance-costs - Get maintenance costs data
router.get('/maintenance-costs', async (req, res) => {
  try {
    // Mock maintenance costs data for business intelligence
    const maintenanceCosts = {
      totalCost: 12500,
      monthlyCost: 2100,
      averageCostPerAsset: 125,
      costByType: {
        preventive: 8500,
        corrective: 3200,
        emergency: 800
      },
      costByMonth: [
        { month: '2024-01', cost: 1800 },
        { month: '2024-02', cost: 2200 },
        { month: '2024-03', cost: 1900 },
        { month: '2024-04', cost: 2400 },
        { month: '2024-05', cost: 2100 },
        { month: '2024-06', cost: 2300 }
      ],
      topExpensiveAssets: [
        { assetId: 'A001', name: 'Fleet Vehicle #1', cost: 850 },
        { assetId: 'A002', name: 'Fleet Vehicle #2', cost: 720 },
        { assetId: 'A003', name: 'Fleet Vehicle #3', cost: 680 }
      ]
    };

    res.json({
      success: true,
      data: maintenanceCosts,
      message: 'Maintenance costs retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting maintenance costs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance costs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/assets/operational-costs - Get operational costs data
router.get('/operational-costs', async (req, res) => {
  try {
    // Mock operational costs data for business intelligence
    const operationalCosts = {
      totalCost: 18500,
      monthlyCost: 3200,
      costByCategory: {
        fuel: 8500,
        insurance: 4200,
        licensing: 1800,
        repairs: 2400,
        other: 1600
      },
      costByMonth: [
        { month: '2024-01', cost: 2800 },
        { month: '2024-02', cost: 3100 },
        { month: '2024-03', cost: 2900 },
        { month: '2024-04', cost: 3400 },
        { month: '2024-05', cost: 3200 },
        { month: '2024-06', cost: 3300 }
      ],
      costPerVehicle: 185,
      fuelEfficiency: {
        averageMPG: 22.5,
        totalGallons: 1200,
        costPerGallon: 3.25
      }
    };

    res.json({
      success: true,
      data: operationalCosts,
      message: 'Operational costs retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting operational costs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get operational costs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;