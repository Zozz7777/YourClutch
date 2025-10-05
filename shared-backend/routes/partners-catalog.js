const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Product Categories
const PRODUCT_CATEGORIES = {
  PARTS: 'parts',
  ACCESSORIES: 'accessories',
  TOOLS: 'tools',
  EQUIPMENT: 'equipment',
  CONSUMABLES: 'consumables',
  SERVICES: 'services'
};

// Product Status
const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued'
};

// Get catalog products
router.get('/catalog/products', auth, async (req, res) => {
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
      category = '', 
      status = '',
      search = '',
      minPrice = '',
      maxPrice = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    if (category && Object.values(PRODUCT_CATEGORIES).includes(category)) {
      query.category = category;
    }
    
    if (status && Object.values(PRODUCT_STATUS).includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        query.price = { ...query.price, $gte: min };
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        query.price = { ...query.price, $lte: max };
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const catalogCollection = await getCollection('catalogProducts');
    
    const products = await catalogCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await catalogCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Catalog products retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching catalog products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/catalog/products/:id', auth, async (req, res) => {
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
    const catalogCollection = await getCollection('catalogProducts');
    
    const product = await catalogCollection.findOne({
      _id: id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Add product to inventory
router.post('/catalog/products/:id/add-to-inventory', [
  auth,
  body('quantity').isNumeric().withMessage('Quantity must be numeric'),
  body('costPrice').optional().isNumeric().withMessage('Cost price must be numeric'),
  body('sellingPrice').optional().isNumeric().withMessage('Selling price must be numeric'),
  body('location').optional().isString().withMessage('Location must be string'),
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
    const { quantity, costPrice, sellingPrice, location, notes } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const catalogCollection = await getCollection('catalogProducts');
    const inventoryCollection = await getCollection('partnerInventory');
    
    const product = await catalogCollection.findOne({
      _id: id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product already exists in partner's inventory
    const existingItem = await inventoryCollection.findOne({
      partnerId: partner.partnerId,
      catalogProductId: id
    });

    if (existingItem) {
      // Update existing inventory item
      await inventoryCollection.updateOne(
        { _id: existingItem._id },
        {
          $inc: { quantity: parseInt(quantity) },
          $set: {
            costPrice: costPrice || existingItem.costPrice,
            sellingPrice: sellingPrice || existingItem.sellingPrice,
            location: location || existingItem.location,
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Create new inventory item
      const inventoryItem = {
        partnerId: partner.partnerId,
        catalogProductId: id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        quantity: parseInt(quantity),
        costPrice: costPrice || product.price,
        sellingPrice: sellingPrice || product.price,
        location: location || 'Main Store',
        status: PRODUCT_STATUS.ACTIVE,
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await inventoryCollection.insertOne(inventoryItem);
    }

    res.json({
      success: true,
      message: 'Product added to inventory successfully'
    });
  } catch (error) {
    logger.error('Error adding product to inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to inventory',
      error: error.message
    });
  }
});

// Get product categories
router.get('/catalog/categories', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const catalogCollection = await getCollection('catalogProducts');
    
    const categories = await catalogCollection.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    const categoryData = categories.map(cat => ({
      category: cat._id,
      count: cat.count,
      averagePrice: Math.round(cat.averagePrice * 100) / 100
    }));

    res.json({
      success: true,
      data: categoryData,
      message: 'Product categories retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product categories',
      error: error.message
    });
  }
});

// Search products
router.get('/catalog/search', auth, async (req, res) => {
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
      category = '',
      limit = 10
    } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    };

    if (category && Object.values(PRODUCT_CATEGORIES).includes(category)) {
      query.category = category;
    }

    const { getCollection } = require('../config/database');
    const catalogCollection = await getCollection('catalogProducts');
    
    const products = await catalogCollection
      .find(query)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: products,
      message: 'Product search completed successfully'
    });
  } catch (error) {
    logger.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
});

// Get featured products
router.get('/catalog/featured', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      limit = 10,
      category = ''
    } = req.query;

    const query = { 
      isActive: true,
      featured: true
    };

    if (category && Object.values(PRODUCT_CATEGORIES).includes(category)) {
      query.category = category;
    }

    const { getCollection } = require('../config/database');
    const catalogCollection = await getCollection('catalogProducts');
    
    const products = await catalogCollection
      .find(query)
      .sort({ featuredAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: products,
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
});

// Get product recommendations
router.get('/catalog/recommendations', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      limit = 10,
      basedOn = 'popular' // popular, similar, trending
    } = req.query;

    const { getCollection } = require('../config/database');
    const catalogCollection = await getCollection('catalogProducts');
    
    let products = [];

    if (basedOn === 'popular') {
      // Get most popular products
      products = await catalogCollection
        .find({ isActive: true })
        .sort({ popularityScore: -1 })
        .limit(parseInt(limit))
        .toArray();
    } else if (basedOn === 'trending') {
      // Get trending products (high sales in recent period)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      products = await catalogCollection
        .find({ 
          isActive: true,
          trendingSince: { $gte: thirtyDaysAgo }
        })
        .sort({ trendingScore: -1 })
        .limit(parseInt(limit))
        .toArray();
    } else if (basedOn === 'similar') {
      // Get similar products based on partner's business type
      const businessTypeCategories = {
        'repair_center': [PRODUCT_CATEGORIES.PARTS, PRODUCT_CATEGORIES.TOOLS, PRODUCT_CATEGORIES.EQUIPMENT],
        'auto_parts': [PRODUCT_CATEGORIES.PARTS, PRODUCT_CATEGORIES.ACCESSORIES],
        'accessories': [PRODUCT_CATEGORIES.ACCESSORIES, PRODUCT_CATEGORIES.CONSUMABLES],
        'service_center': [PRODUCT_CATEGORIES.TOOLS, PRODUCT_CATEGORIES.EQUIPMENT, PRODUCT_CATEGORIES.CONSUMABLES]
      };

      const categories = businessTypeCategories[partner.businessType] || Object.values(PRODUCT_CATEGORIES);
      
      products = await catalogCollection
        .find({ 
          isActive: true,
          category: { $in: categories }
        })
        .sort({ popularityScore: -1 })
        .limit(parseInt(limit))
        .toArray();
    }

    res.json({
      success: true,
      data: products,
      message: 'Product recommendations retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching product recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product recommendations',
      error: error.message
    });
  }
});

// Request new product
router.post('/catalog/request-product', [
  auth,
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(Object.values(PRODUCT_CATEGORIES)).withMessage('Invalid category'),
  body('brand').optional().isString().withMessage('Brand must be string'),
  body('expectedPrice').optional().isNumeric().withMessage('Expected price must be numeric'),
  body('urgency').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid urgency level'),
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
      description,
      category,
      brand,
      expectedPrice,
      urgency = 'medium',
      notes
    } = req.body;

    const productRequest = {
      partnerId: partner.partnerId,
      partnerName: partner.businessName,
      name,
      description,
      category,
      brand,
      expectedPrice,
      urgency,
      notes,
      status: 'pending',
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const { getCollection } = require('../config/database');
    const requestsCollection = await getCollection('productRequests');
    const result = await requestsCollection.insertOne(productRequest);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...productRequest
      },
      message: 'Product request submitted successfully'
    });
  } catch (error) {
    logger.error('Error requesting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request product',
      error: error.message
    });
  }
});

// Get product requests
router.get('/catalog/requests', auth, async (req, res) => {
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
      sortBy = 'requestedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status) {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const requestsCollection = await getCollection('productRequests');
    
    const requests = await requestsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await requestsCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Product requests retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching product requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product requests',
      error: error.message
    });
  }
});

module.exports = router;
