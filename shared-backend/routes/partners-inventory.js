const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const PartnerProduct = require('../models/PartnerProduct');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../config/logger');
const ExcelJS = require('exceljs');

const router = express.Router();

// @route   GET /partners/inventory
// @desc    Get partner inventory
// @access  Private
router.get('/inventory', auth, async (req, res) => {
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
      category, 
      search, 
      lowStock = false,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { partnerId: partner.partnerId, isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$minStockLevel'] };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await PartnerProduct.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await PartnerProduct.countDocuments(query);

    // Get inventory summary
    const summary = await PartnerProduct.aggregate([
      { $match: { partnerId: partner.partnerId, isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$stockQuantity', '$minStockLevel'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$stockQuantity', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        summary: summary[0] || {
          totalProducts: 0,
          totalValue: 0,
          lowStockItems: 0,
          outOfStockItems: 0
        }
      }
    });

  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/inventory
// @desc    Add new product to inventory
// @access  Private
router.post('/inventory', auth, [
  body('sku').notEmpty().withMessage('SKU is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stockQuantity').isNumeric().withMessage('Stock quantity is required'),
  body('minStockLevel').optional().isNumeric(),
  body('barcode').optional().isString(),
  body('description').optional().isString(),
  body('imageUrl').optional().isString()
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const {
      sku,
      name,
      price,
      category,
      stockQuantity,
      minStockLevel = 0,
      barcode,
      description,
      imageUrl
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await PartnerProduct.findOne({
      sku,
      partnerId: partner.partnerId
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Create product
    const product = new PartnerProduct({
      sku,
      name,
      price,
      category,
      stockQuantity,
      minStockLevel,
      barcode,
      description,
      imageUrl,
      partnerId: partner.partnerId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });

  } catch (error) {
    logger.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /partners/inventory/:sku
// @desc    Update product in inventory
// @access  Private
router.patch('/inventory/:sku', auth, [
  body('name').optional().isString(),
  body('price').optional().isNumeric(),
  body('category').optional().isString(),
  body('stockQuantity').optional().isNumeric(),
  body('minStockLevel').optional().isNumeric(),
  body('barcode').optional().isString(),
  body('description').optional().isString(),
  body('imageUrl').optional().isString(),
  body('isActive').optional().isBoolean()
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { sku } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    const product = await PartnerProduct.findOneAndUpdate(
      { sku, partnerId: partner.partnerId },
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/inventory/import
// @desc    Import inventory from Excel/CSV
// @access  Private
router.post('/inventory/import', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Products must be an array'
      });
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: []
    };

    for (let i = 0; i < products.length; i++) {
      try {
        const productData = products[i];
        
        // Validate required fields
        if (!productData.sku || !productData.name || !productData.price) {
          results.errors.push({
            row: i + 1,
            sku: productData.sku || 'N/A',
            error: 'Missing required fields (sku, name, price)'
          });
          continue;
        }

        // Check if product exists
        const existingProduct = await PartnerProduct.findOne({
          sku: productData.sku,
          partnerId: partner.partnerId
        });

        if (existingProduct) {
          // Update existing product
          Object.assign(existingProduct, {
            ...productData,
            partnerId: partner.partnerId,
            updatedAt: new Date()
          });
          await existingProduct.save();
          results.updated++;
        } else {
          // Create new product
          const product = new PartnerProduct({
            ...productData,
            partnerId: partner.partnerId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          await product.save();
          results.imported++;
        }
      } catch (error) {
        results.errors.push({
          row: i + 1,
          sku: products[i].sku || 'N/A',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Import completed',
      data: results
    });

  } catch (error) {
    logger.error('Import inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/inventory/stocktake
// @desc    Perform stock take/adjustment
// @access  Private
router.post('/inventory/stocktake', auth, [
  body('items').isArray().withMessage('Items array is required'),
  body('items.*.sku').notEmpty().withMessage('SKU is required'),
  body('items.*.actualQuantity').isNumeric().withMessage('Actual quantity is required'),
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { items, reason } = req.body;
    const adjustments = [];

    for (const item of items) {
      const product = await PartnerProduct.findOne({
        sku: item.sku,
        partnerId: partner.partnerId
      });

      if (!product) {
        continue; // Skip if product not found
      }

      const variance = item.actualQuantity - product.stockQuantity;
      
      if (variance !== 0) {
        // Update stock quantity
        product.stockQuantity = item.actualQuantity;
        product.updatedAt = new Date();
        await product.save();

        // Record adjustment
        adjustments.push({
          sku: item.sku,
          name: product.name,
          previousQuantity: product.stockQuantity - variance,
          actualQuantity: item.actualQuantity,
          variance,
          reason
        });
      }
    }

    // Create stock take record
    const stockTake = new (require('../models/StockTake'))({
      partnerId: partner.partnerId,
      items: adjustments,
      reason,
      performedBy: req.user.userId,
      performedAt: new Date()
    });

    await stockTake.save();

    res.json({
      success: true,
      message: 'Stock take completed',
      data: {
        adjustments,
        stockTake
      }
    });

  } catch (error) {
    logger.error('Stock take error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /partners/inventory/transfer
// @desc    Transfer inventory between locations
// @access  Private
router.post('/inventory/transfer', auth, [
  body('fromLocation').notEmpty().withMessage('From location is required'),
  body('toLocation').notEmpty().withMessage('To location is required'),
  body('items').isArray().withMessage('Items array is required'),
  body('items.*.sku').notEmpty().withMessage('SKU is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity is required')
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

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { fromLocation, toLocation, items } = req.body;

    // Validate and process transfer
    const transferItems = [];
    
    for (const item of items) {
      const product = await PartnerProduct.findOne({
        sku: item.sku,
        partnerId: partner.partnerId
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with SKU ${item.sku} not found`
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      transferItems.push({
        sku: item.sku,
        name: product.name,
        quantity: item.quantity
      });
    }

    // Create transfer record
    const transfer = new (require('../models/InventoryTransfer'))({
      partnerId: partner.partnerId,
      fromLocation,
      toLocation,
      items: transferItems,
      status: 'pending',
      createdBy: req.user.userId,
      createdAt: new Date()
    });

    await transfer.save();

    res.json({
      success: true,
      message: 'Transfer created successfully',
      data: transfer
    });

  } catch (error) {
    logger.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /partners/inventory/export
// @desc    Export inventory to Excel
// @access  Private
router.get('/inventory/export', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { format = 'excel' } = req.query;

    // Get all products
    const products = await PartnerProduct.find({
      partnerId: partner.partnerId,
      isActive: true
    }).lean();

    if (format === 'excel') {
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Inventory');

      // Add headers
      worksheet.columns = [
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Price', key: 'price', width: 12 },
        { header: 'Stock Quantity', key: 'stockQuantity', width: 15 },
        { header: 'Min Stock Level', key: 'minStockLevel', width: 15 },
        { header: 'Barcode', key: 'barcode', width: 20 },
        { header: 'Description', key: 'description', width: 40 }
      ];

      // Add data
      products.forEach(product => {
        worksheet.addRow({
          sku: product.sku,
          name: product.name,
          category: product.category,
          price: product.price,
          stockQuantity: product.stockQuantity,
          minStockLevel: product.minStockLevel,
          barcode: product.barcode,
          description: product.description
        });
      });

      // Style the worksheet
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=inventory-${Date.now()}.xlsx`);

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // Return JSON
      res.json({
        success: true,
        data: products
      });
    }

  } catch (error) {
    logger.error('Export inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
