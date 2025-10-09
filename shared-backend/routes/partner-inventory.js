const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/v1/partners/inventory - Get all products for partner
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      category = '', 
      brand = '', 
      min_stock = '', 
      max_stock = '',
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;

    const productsCollection = await getCollection('products');
    
    // Build query
    const query = { partnerId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    if (min_stock !== '') {
      query.stockQuantity = { ...query.stockQuantity, $gte: parseInt(min_stock) };
    }
    
    if (max_stock !== '') {
      query.stockQuantity = { ...query.stockQuantity, $lte: parseInt(max_stock) };
    }
    
    // Build sort
    const sort = {};
    sort[sort_by] = sort_order === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const products = await productsCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await productsCollection.countDocuments(query);
    
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
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// GET /api/v1/partners/inventory/:id - Get specific product
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { id } = req.params;
    
    const productsCollection = await getCollection('products');
    const product = await productsCollection.findOne({ 
      _id: id, 
      partnerId 
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
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// POST /api/v1/partners/inventory - Create new product
router.post('/', authenticateToken, [
  body('sku').notEmpty().withMessage('SKU is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be numeric'),
  body('stockQuantity').isInt().withMessage('Stock quantity must be integer'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const productData = {
      ...req.body,
      partnerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const productsCollection = await getCollection('products');
    
    // Check if SKU already exists for this partner
    const existingProduct = await productsCollection.findOne({ 
      sku: productData.sku, 
      partnerId 
    });
    
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
    
    const result = await productsCollection.insertOne(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: result.insertedId,
        ...productData
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// PUT /api/v1/partners/inventory/:id - Update product
router.put('/:id', authenticateToken, [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be numeric'),
  body('stockQuantity').optional().isInt().withMessage('Stock quantity must be integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { id } = req.params;
    
    const productsCollection = await getCollection('products');
    
    // Check if product exists
    const existingProduct = await productsCollection.findOne({ 
      _id: id, 
      partnerId 
    });
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const result = await productsCollection.updateOne(
      { _id: id, partnerId },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update product'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// DELETE /api/v1/partners/inventory/:id - Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { id } = req.params;
    
    const productsCollection = await getCollection('products');
    
    const result = await productsCollection.deleteOne({ 
      _id: id, 
      partnerId 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// POST /api/v1/partners/inventory/import - Bulk import products
router.post('/import', authenticateToken, [
  body('products').isArray().withMessage('Products array is required'),
  body('products.*.sku').notEmpty().withMessage('SKU is required'),
  body('products.*.name').notEmpty().withMessage('Product name is required'),
  body('products.*.price').isNumeric().withMessage('Price must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { products } = req.body;
    
    const productsCollection = await getCollection('products');
    
    // Prepare products for insertion
    const productsToInsert = products.map(product => ({
      ...product,
      partnerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    const result = await productsCollection.insertMany(productsToInsert);
    
    res.json({
      success: true,
      message: `${result.insertedCount} products imported successfully`,
      data: {
        imported: result.insertedCount,
        failed: products.length - result.insertedCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Import products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import products'
    });
  }
});

// GET /api/v1/partners/inventory/export - Export products
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { format = 'csv' } = req.query;
    
    const productsCollection = await getCollection('products');
    const products = await productsCollection.find({ partnerId }).toArray();
    
    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'SKU,Name,Description,Price,Stock,Category,Brand,Barcode\n';
      const csvData = products.map(product => 
        `${product.sku},${product.name},${product.description || ''},${product.price},${product.stockQuantity},${product.category},${product.brand || ''},${product.barcode || ''}`
      ).join('\n');
      
      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: products,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Export products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export products'
    });
  }
});

// GET /api/v1/partners/inventory/low-stock - Get low stock products
router.get('/low-stock', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { threshold = 10 } = req.query;
    
    const productsCollection = await getCollection('products');
    const products = await productsCollection.find({
      partnerId,
      stockQuantity: { $lte: parseInt(threshold) }
    }).toArray();
    
    res.json({
      success: true,
      data: products,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products'
    });
  }
});

// POST /api/v1/partners/inventory/stock-adjustment - Adjust stock
router.post('/stock-adjustment', authenticateToken, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('adjustment').isNumeric().withMessage('Adjustment must be numeric'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { productId, adjustment, reason } = req.body;
    
    const productsCollection = await getCollection('products');
    
    // Get current product
    const product = await productsCollection.findOne({ 
      _id: productId, 
      partnerId 
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const newStock = product.stockQuantity + adjustment;
    
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for this adjustment'
      });
    }
    
    // Update stock
    const result = await productsCollection.updateOne(
      { _id: productId, partnerId },
      { 
        $set: { 
          stockQuantity: newStock,
          updatedAt: new Date().toISOString()
        },
        $push: {
          stockAdjustments: {
            adjustment,
            reason,
            adjustedBy: req.user.userId,
            adjustedAt: new Date().toISOString()
          }
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to adjust stock'
      });
    }
    
    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        productId,
        oldStock: product.stockQuantity,
        newStock,
        adjustment
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Stock adjustment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust stock'
    });
  }
});

module.exports = router;