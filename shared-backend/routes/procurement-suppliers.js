const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const ProcurementSupplier = require('../models/ProcurementSupplier');
const SupplierCatalog = require('../models/SupplierCatalog');

// Rate limiting for supplier operations
const supplierRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many supplier requests from this IP, please try again later.'
});

// GET /api/v1/procurement/suppliers - List all suppliers
router.get('/suppliers', authenticateToken, requirePermission('read_procurement'), supplierRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('category').optional().isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
  query('diversity').optional().isIn(['minority_owned', 'women_owned', 'veteran_owned', 'lgbtq_owned', 'small_business', 'none']).withMessage('Invalid diversity classification'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('isPreferred').optional().isBoolean().withMessage('isPreferred must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      riskLevel, 
      diversity, 
      isActive, 
      isPreferred 
    } = req.query;
    
    // Build query
    const query = {};
    if (isActive !== undefined) query['status.isActive'] = isActive === 'true';
    if (isPreferred !== undefined) query['status.isPreferred'] = isPreferred === 'true';
    if (riskLevel) query['risk.riskLevel'] = riskLevel;
    if (diversity) query['diversity.diversityClassification'] = diversity;
    if (category) query.productCategories = category;
    if (search) {
      query.$or = [
        { supplierName: { $regex: search, $options: 'i' } },
        { 'contactInfo.primaryContact.name': { $regex: search, $options: 'i' } },
        { 'contactInfo.primaryContact.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [suppliers, total] = await Promise.all([
      ProcurementSupplier.find(query)
        .sort({ 'performance.overallSPI': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProcurementSupplier.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers', error: error.message });
  }
});

// POST /api/v1/procurement/suppliers - Create supplier
router.post('/suppliers', authenticateToken, requirePermission('create_supplier'), supplierRateLimit, [
  body('supplierName').notEmpty().withMessage('Supplier name is required'),
  body('contactInfo.primaryContact.name').notEmpty().withMessage('Primary contact name is required'),
  body('contactInfo.primaryContact.email').isEmail().withMessage('Valid email is required'),
  body('contactInfo.primaryContact.phone').notEmpty().withMessage('Phone number is required'),
  body('productCategories').isArray().withMessage('Product categories must be an array'),
  body('productCategories.*').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid product category'),
  body('businessInfo.businessType').isIn(['individual', 'company', 'partnership', 'corporation']).withMessage('Invalid business type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const supplierData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const newSupplier = new ProcurementSupplier(supplierData);
    await newSupplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: newSupplier
    });
  } catch (error) {
    logger.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: 'Failed to create supplier', error: error.message });
  }
});

// GET /api/v1/procurement/suppliers/:id - Get supplier details
router.get('/suppliers/:id', authenticateToken, requirePermission('read_procurement'), supplierRateLimit, [
  param('id').isMongoId().withMessage('Invalid supplier ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const supplier = await ProcurementSupplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    logger.error('Error fetching supplier:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier', error: error.message });
  }
});

// PUT /api/v1/procurement/suppliers/:id - Update supplier
router.put('/suppliers/:id', authenticateToken, requirePermission('update_supplier'), supplierRateLimit, [
  param('id').isMongoId().withMessage('Invalid supplier ID'),
  body('supplierName').optional().notEmpty().withMessage('Supplier name cannot be empty'),
  body('contactInfo.primaryContact.email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const supplier = await ProcurementSupplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedSupplier = await ProcurementSupplier.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier
    });
  } catch (error) {
    logger.error('Error updating supplier:', error);
    res.status(500).json({ success: false, message: 'Failed to update supplier', error: error.message });
  }
});

// DELETE /api/v1/procurement/suppliers/:id - Delete supplier
router.delete('/suppliers/:id', authenticateToken, requirePermission('delete_supplier'), supplierRateLimit, [
  param('id').isMongoId().withMessage('Invalid supplier ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const supplier = await ProcurementSupplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Soft delete by setting isActive to false
    supplier.status.isActive = false;
    supplier.updatedBy = req.user.userId;
    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier deactivated successfully'
    });
  } catch (error) {
    logger.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, message: 'Failed to delete supplier', error: error.message });
  }
});

// GET /api/v1/procurement/suppliers/:id/performance - Get supplier performance
router.get('/suppliers/:id/performance', authenticateToken, requirePermission('read_procurement'), supplierRateLimit, [
  param('id').isMongoId().withMessage('Invalid supplier ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const supplier = await ProcurementSupplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const performance = {
      overallSPI: supplier.performance.overallSPI,
      deliveryScore: supplier.performance.deliveryScore,
      qualityScore: supplier.performance.qualityScore,
      complianceScore: supplier.performance.complianceScore,
      totalOrders: supplier.performance.totalOrders,
      onTimeDeliveryRate: supplier.performance.onTimeDeliveryRate,
      qualityIssueRate: supplier.performance.qualityIssueRate,
      lastUpdated: supplier.performance.lastUpdated
    };

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error fetching supplier performance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier performance', error: error.message });
  }
});

// PUT /api/v1/procurement/suppliers/:id/performance - Update supplier performance
router.put('/suppliers/:id/performance', authenticateToken, requirePermission('update_supplier'), supplierRateLimit, [
  param('id').isMongoId().withMessage('Invalid supplier ID'),
  body('deliveryScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Delivery score must be between 0 and 100'),
  body('qualityScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Quality score must be between 0 and 100'),
  body('complianceScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Compliance score must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const supplier = await ProcurementSupplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const { deliveryScore, qualityScore, complianceScore } = req.body;

    if (deliveryScore !== undefined) supplier.performance.deliveryScore = deliveryScore;
    if (qualityScore !== undefined) supplier.performance.qualityScore = qualityScore;
    if (complianceScore !== undefined) supplier.performance.complianceScore = complianceScore;

    supplier.performance.lastUpdated = new Date();
    supplier.updatedBy = req.user.userId;

    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier performance updated successfully',
      data: supplier.performance
    });
  } catch (error) {
    logger.error('Error updating supplier performance:', error);
    res.status(500).json({ success: false, message: 'Failed to update supplier performance', error: error.message });
  }
});

// GET /api/v1/procurement/suppliers/:id/catalog - Get supplier catalog
router.get('/suppliers/:id/catalog', authenticateToken, requirePermission('read_procurement'), supplierRateLimit, [
  param('id').isMongoId().withMessage('Invalid supplier ID'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('category').optional().isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { search, category } = req.query;
    
    const query = { supplierId: req.params.id, isActive: true };
    if (search) {
      query.$or = [
        { 'items.itemName': { $regex: search, $options: 'i' } },
        { 'items.description': { $regex: search, $options: 'i' } },
        { 'items.itemCode': { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query['items.category'] = category;
    }

    const catalogs = await SupplierCatalog.find(query)
      .select('items catalogName version')
      .lean();

    res.json({
      success: true,
      data: catalogs
    });
  } catch (error) {
    logger.error('Error fetching supplier catalog:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier catalog', error: error.message });
  }
});

// GET /api/v1/procurement/suppliers/compare - Compare suppliers
router.get('/suppliers/compare', authenticateToken, requirePermission('read_procurement'), supplierRateLimit, [
  query('supplierIds').isArray().withMessage('Supplier IDs must be an array'),
  query('supplierIds.*').isMongoId().withMessage('Invalid supplier ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { supplierIds } = req.query;
    
    if (supplierIds.length < 2 || supplierIds.length > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select 2-5 suppliers for comparison' 
      });
    }

    const suppliers = await ProcurementSupplier.find({
      _id: { $in: supplierIds }
    }).select('supplierName performance financial risk diversity status productCategories').lean();

    const comparison = suppliers.map(supplier => ({
      supplierId: supplier._id,
      supplierName: supplier.supplierName,
      performance: supplier.performance,
      financial: supplier.financial,
      risk: supplier.risk,
      diversity: supplier.diversity,
      status: supplier.status,
      productCategories: supplier.productCategories
    }));

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    logger.error('Error comparing suppliers:', error);
    res.status(500).json({ success: false, message: 'Failed to compare suppliers', error: error.message });
  }
});

module.exports = router;
