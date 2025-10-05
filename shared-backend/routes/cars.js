const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { getCollection } = require('../config/optimized-database');
const { redisCache } = require('../config/optimized-redis');

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  CAR_BRANDS: 3600,      // 1 hour - rarely changes
  CAR_MODELS: 1800,      // 30 minutes - changes occasionally
  CAR_TRIMS: 1800,       // 30 minutes - changes occasionally
  USER_CARS: 300,        // 5 minutes - user-specific data
  MAINTENANCE_SERVICES: 3600 // 1 hour - rarely changes
};

// Get all car brands with Redis caching
router.get('/brands', async (req, res) => {
  try {
    const { search } = req.query;
    const cacheKey = `car_brands:${search || 'all'}`;
    
    // Try to get from cache first
    try {
      const cachedData = await redisCache.get('api', 'car_brands', search ? `:${search}` : '');
      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true
        });
      }
    } catch (cacheError) {
      console.log('Cache miss or error:', cacheError.message);
    }
    
    // Build optimized query
    let query = { isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const brandsCollection = await getCollection('carbrands');
    const brands = await brandsCollection.find(query, {
      projection: { _id: 1, name: 1, logo: 1 } // Only essential fields
    })
    .sort({ name: 1 })
    .limit(100) // Limit results for performance
    .maxTimeMS(2000)
    .toArray();
    
    // Cache the result
    try {
      await redisCache.set('api', 'car_brands', brands, CACHE_TTL.CAR_BRANDS, search ? `:${search}` : '');
    } catch (cacheError) {
      console.log('Failed to cache brands:', cacheError.message);
    }

    res.json({
      success: true,
      data: brands,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching car brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car brands'
    });
  }
});

// Get models by brand
router.get('/models/:brandName', async (req, res) => {
  try {
    const { brandName } = req.params;
    const { search } = req.query;
    
    let query = { 
      brandName: new RegExp(brandName, 'i'),
      isActive: true 
    };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const modelsCollection = await getCollection('carmodels');
    const models = await modelsCollection.find(query).sort({ name: 1 }).toArray();
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Error fetching car models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car models'
    });
  }
});

// Get trims by model
router.get('/trims/:brandName/:modelName', async (req, res) => {
  try {
    const { brandName, modelName } = req.params;
    const { search } = req.query;
    
    let query = { 
      brandName: new RegExp(brandName, 'i'),
      modelName: new RegExp(modelName, 'i'),
      isActive: true 
    };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const trimsCollection = await getCollection('cartrims');
    const trims = await trimsCollection.find(query).sort({ name: 1 }).toArray();
    res.json({
      success: true,
      data: trims
    });
  } catch (error) {
    console.error('Error fetching car trims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car trims'
    });
  }
});

// Get user's cars with enterprise-level caching and optimization
router.get('/user-cars', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request',
        error: 'INVALID_USER'
      });
    }

    // Add pagination for better performance
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 items per page
    const skip = (page - 1) * limit;
    const cacheKey = `user_cars:${userId}:${page}:${limit}`;

    // Try to get from cache first
    try {
      const cachedData = await redisCache.get('api', `user_cars:${userId}`, `:${page}:${limit}`);
      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData.cars,
          pagination: cachedData.pagination,
          cached: true
        });
      }
    } catch (cacheError) {
      console.log('Cache miss for user cars:', cacheError.message);
    }

    // Use native MongoDB client with highly optimized query
    const carsCollection = await getCollection('cars');
    
    // Parallel execution for better performance
    const [cars, totalCount] = await Promise.all([
      // Get cars with optimized projection
      carsCollection.find({ 
        userId: userId, 
        isActive: true 
      }, {
        projection: {
          _id: 1,
          year: 1,
          brand: 1,
          model: 1,
          trim: 1,
          color: 1,
          licensePlate: 1,
          currentMileage: 1,
          createdAt: 1
          // Exclude heavy fields like maintenance history, documents, etc.
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(2000) // Aggressive timeout for 100k users
      .toArray(),
      
      // Get count in parallel
      carsCollection.countDocuments({ 
        userId: userId, 
        isActive: true 
      })
    ]);

    const responseData = {
      cars,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };

    // Cache the result
    try {
      await redisCache.set('api', `user_cars:${userId}`, responseData, CACHE_TTL.USER_CARS, `:${page}:${limit}`);
    } catch (cacheError) {
      console.log('Failed to cache user cars:', cacheError.message);
    }

    res.json({
      success: true,
      data: cars,
      pagination: responseData.pagination,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching user cars:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError' && error.message.includes('timeout')) {
      return res.status(503).json({
        success: false,
        message: 'Database operation timed out. Please try again.',
        error: 'DATABASE_TIMEOUT'
      });
    }
    
    if (error.name === 'MongoError' && error.message.includes('connection')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user cars',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Register a new car
router.post('/register', authenticateToken, async (req, res) => {
  try {
    
    const {
      year,
      brand,
      model,
      trim,
      kilometers,
      color,
      licensePlate
    } = req.body;

    // Validate required fields
    if (!year || !brand || !model || !trim || !kilometers || !color || !licensePlate) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Use native MongoDB client
    const carsCollection = await getCollection('cars');
    
    // Check if license plate already exists
    const existingCar = await carsCollection.findOne({ 
      licensePlate: licensePlate.toUpperCase(),
      isActive: true 
    });
    
    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: 'License plate already registered'
      });
    }

    // Create new car document
    const car = {
      userId: req.user.userId || req.user.id,
      year: parseInt(year),
      brand: brand.trim(),
      model: model.trim(),
      trim: trim.trim(),
      kilometers: parseInt(kilometers),
      color: color.trim(),
      licensePlate: licensePlate.toUpperCase().trim(),
      currentMileage: parseInt(kilometers),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await carsCollection.insertOne(car);
    car._id = result.insertedId;

    // Invalidate user cars cache after registration
    try {
      const userId = req.user.userId || req.user.id;
      const cachePattern = `api:user_cars:${userId}:*`;
      await redisCache.deletePattern(cachePattern);
    } catch (cacheError) {
      console.log('Failed to invalidate cache after car registration:', cacheError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Car registered successfully',
      data: car
    });
  } catch (error) {
    console.error('Error registering car:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register car'
    });
  }
});

// Update car maintenance
router.put('/:carId/maintenance', authenticateToken, async (req, res) => {
  try {
    const { carId } = req.params;
    const {
      maintenanceDate,
      services,
      kilometers
    } = req.body;

    // Validate required fields
    if (!maintenanceDate || !services || !kilometers) {
      return res.status(400).json({
        success: false,
        message: 'Maintenance date, services, and kilometers are required'
      });
    }

    // Find the car using native MongoDB
    const carsCollection = await getCollection('cars');
    const car = await carsCollection.findOne({ 
      _id: new ObjectId(carId), 
      userId: req.user.userId || req.user.id, 
      isActive: true 
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Update car maintenance info
    const updateData = {
      lastMaintenanceDate: new Date(maintenanceDate),
      lastMaintenanceKilometers: parseInt(kilometers),
      // Don't update currentMileage - it should remain as the car's current mileage
      // currentMileage should only be updated when the user manually updates it
      lastMaintenanceServices: services.map(service => ({
        serviceGroup: service.serviceGroup,
        serviceName: service.serviceName,
        date: new Date(maintenanceDate)
      })),
      updatedAt: new Date()
    };

    const updateResult = await carsCollection.updateOne(
      { _id: new ObjectId(carId) },
      { $set: updateData }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update car maintenance'
      });
    }

    // Get the updated car
    const updatedCar = await carsCollection.findOne({ _id: new ObjectId(carId) });

    // Create maintenance record in maintenance_records collection
    try {
      const maintenanceRecordsCollection = await getCollection('maintenance_records');
      const maintenanceRecord = {
        userId: req.user.userId || req.user.id,
        carId: carId,
        date: new Date(maintenanceDate),
        maintenanceType: services.map(s => s.serviceName).join(', '),
        kilometers: parseInt(kilometers),
        description: `Maintenance performed: ${services.map(s => s.serviceName).join(', ')}`,
        services: services,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const recordResult = await maintenanceRecordsCollection.insertOne(maintenanceRecord);
      console.log('✅ Maintenance record created:', recordResult.insertedId);
    } catch (recordError) {
      console.error('⚠️ Failed to create maintenance record:', recordError);
      // Don't fail the entire request if record creation fails
    }

    res.json({
      success: true,
      message: 'Maintenance updated successfully',
      data: updatedCar
    });
  } catch (error) {
    console.error('Error updating car maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car maintenance'
    });
  }
});

// Get user's maintenance records
router.get('/maintenance-records', authenticateToken, async (req, res) => {
  try {
    const { carId, limit = 10, offset = 0 } = req.query;
    const userId = req.user.userId || req.user.id;

    const query = { userId: userId };
    if (carId) {
      query.carId = carId;
    }

    const maintenanceRecordsCollection = await getCollection('maintenance_records');
    const records = await maintenanceRecordsCollection
      .find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();

    res.json({
      success: true,
      data: records,
      message: 'Maintenance records retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance records'
    });
  }
});

// Get maintenance services
router.get('/maintenance-services', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { serviceGroup: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const servicesCollection = await getCollection('maintenance_services');
    const services = await servicesCollection.find(query).sort({ 
      serviceGroup: 1, 
      serviceName: 1 
    }).toArray();
    
    // Group services by service group
    const groupedServices = services.reduce((acc, service) => {
      if (!acc[service.serviceGroup]) {
        acc[service.serviceGroup] = [];
      }
      acc[service.serviceGroup].push(service);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: groupedServices
    });
  } catch (error) {
    console.error('Error fetching maintenance services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance services'
    });
  }
});

module.exports = router;
