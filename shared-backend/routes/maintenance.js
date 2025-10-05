const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { getCollection } = require('../config/database-unified');
const { ObjectId } = require('mongodb');

// Get maintenance types
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const maintenanceTypes = [
      { id: '1', name: 'Oil Change', description: 'Regular oil and filter change' },
      { id: '2', name: 'Brake Service', description: 'Brake pad and rotor inspection/replacement' },
      { id: '3', name: 'Tire Rotation', description: 'Rotate tires for even wear' },
      { id: '4', name: 'Engine Tune-up', description: 'Spark plugs, air filter, and engine inspection' },
      { id: '5', name: 'Transmission Service', description: 'Transmission fluid change and inspection' },
      { id: '6', name: 'Coolant Service', description: 'Coolant flush and replacement' },
      { id: '7', name: 'Battery Check', description: 'Battery and charging system inspection' },
      { id: '8', name: 'AC Service', description: 'Air conditioning system service' },
      { id: '9', name: 'Alignment', description: 'Wheel alignment and balancing' },
      { id: '10', name: 'General Inspection', description: 'Comprehensive vehicle inspection' }
    ];

    res.json({
      success: true,
      data: maintenanceTypes,
      message: 'Maintenance types retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance types'
    });
  }
});

// Submit maintenance record
router.post('/records', authenticateToken, async (req, res) => {
  try {
    const { date, maintenanceType, kilometers, description } = req.body;
    const userId = req.user.userId || req.user.id;

    // Validate required fields
    if (!date || !maintenanceType || kilometers === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Date, maintenance type, and kilometers are required'
      });
    }

    // Create maintenance record
    const maintenanceRecord = {
      userId: userId,
      date: new Date(date),
      maintenanceType: maintenanceType,
      kilometers: parseInt(kilometers),
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database
    const maintenanceCollection = await getCollection('maintenance_records');
    const result = await maintenanceCollection.insertOne(maintenanceRecord);

    // Get the created record
    const createdRecord = await maintenanceCollection.findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      data: createdRecord,
      message: 'Maintenance record created successfully'
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance record'
    });
  }
});

// Get maintenance history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { carId, limit = 10, offset = 0 } = req.query;

    const query = { userId: userId };
    if (carId) {
      query.carId = carId;
    }

    const maintenanceCollection = await getCollection('maintenance_records');
    const records = await maintenanceCollection
      .find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();

    res.json({
      success: true,
      data: records,
      message: 'Maintenance history retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance history'
    });
  }
});

// Get maintenance reminders
router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Get user's cars
    const carsCollection = await getCollection('cars');
    const userCars = await carsCollection.find({ 
      userId: userId, 
      isActive: true 
    }).toArray();

    const reminders = [];

    for (const car of userCars) {
      // Calculate next maintenance based on mileage and time
      const lastMaintenanceKm = car.lastMaintenanceKilometers || 0;
      const currentKm = car.currentMileage || 0;
      const kmSinceLastMaintenance = currentKm - lastMaintenanceKm;
      
      const lastMaintenanceDate = car.lastMaintenanceDate || new Date();
      const daysSinceLastMaintenance = Math.floor((new Date() - lastMaintenanceDate) / (1000 * 60 * 60 * 24));

      // Generate reminders based on common maintenance intervals
      if (kmSinceLastMaintenance >= 10000 || daysSinceLastMaintenance >= 365) {
        reminders.push({
          carId: car._id,
          carName: `${car.brandName} ${car.modelName}`,
          type: 'Oil Change',
          priority: 'high',
          message: 'Oil change due based on mileage or time',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
      }

      if (kmSinceLastMaintenance >= 20000) {
        reminders.push({
          carId: car._id,
          carName: `${car.brandName} ${car.modelName}`,
          type: 'Brake Service',
          priority: 'medium',
          message: 'Brake service recommended',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        });
      }
    }

    res.json({
      success: true,
      data: reminders,
      message: 'Maintenance reminders retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance reminders'
    });
  }
});

module.exports = router;
