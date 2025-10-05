const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const ProcurementContract = require('../models/ProcurementContract');
const ProcurementSupplier = require('../models/ProcurementSupplier');

// Rate limiting for contract operations
const contractRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many contract requests from this IP, please try again later.'
});

// GET /api/v1/procurement/contracts - List all contracts
router.get('/contracts', authenticateToken, requirePermission('read_procurement'), contractRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'active', 'expiring_soon', 'expired', 'renewed', 'cancelled', 'suspended']).withMessage('Invalid status'),
  query('supplierId').optional().isMongoId().withMessage('Invalid supplier ID'),
  query('contractType').optional().isIn(['blanket', 'fixed_price', 'cost_plus', 'time_materials', 'retainer', 'other']).withMessage('Invalid contract type'),
  query('expiringSoon').optional().isBoolean().withMessage('expiringSoon must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 20, status, supplierId, contractType, expiringSoon } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;
    if (contractType) query.contractType = contractType;
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query['terms.endDate'] = { $lte: thirtyDaysFromNow };
      query.status = { $in: ['active', 'expiring_soon'] };
    }

    const skip = (page - 1) * limit;
    
    const [contracts, total] = await Promise.all([
      ProcurementContract.find(query)
        .populate('supplierId', 'supplierName contactInfo')
        .sort({ 'terms.endDate': 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ProcurementContract.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: contracts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching contracts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contracts', error: error.message });
  }
});

// POST /api/v1/procurement/contracts - Create contract
router.post('/contracts', authenticateToken, requirePermission('create_contract'), contractRateLimit, [
  body('supplierId').isMongoId().withMessage('Invalid supplier ID'),
  body('contractType').isIn(['blanket', 'fixed_price', 'cost_plus', 'time_materials', 'retainer', 'other']).withMessage('Invalid contract type'),
  body('terms.startDate').isISO8601().withMessage('Invalid start date format'),
  body('terms.endDate').isISO8601().withMessage('Invalid end date format'),
  body('terms.value').isFloat({ min: 0 }).withMessage('Contract value must be a positive number'),
  body('coveredItems').isArray().withMessage('Covered items must be an array'),
  body('coveredItems.*.itemName').notEmpty().withMessage('Item name is required'),
  body('coveredItems.*.category').isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { supplierId, contractType, terms, coveredItems, pricingTerms, deliveryTerms, compliance, sla } = req.body;

    // Get supplier details
    const supplier = await ProcurementSupplier.findById(supplierId).select('supplierName');
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Generate contract number
    const contractNumber = `CON-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const contractData = {
      contractNumber,
      supplierId,
      supplierName: supplier.supplierName,
      contractType,
      terms,
      coveredItems,
      pricingTerms: pricingTerms || {},
      deliveryTerms: deliveryTerms || {},
      compliance: compliance || { complianceRequirements: [], certifications: [], qualityStandards: [] },
      sla: sla || [],
      status: 'draft',
      createdBy: req.user.userId
    };

    const newContract = new ProcurementContract(contractData);
    await newContract.save();

    res.status(201).json({
      success: true,
      message: 'Contract created successfully',
      data: newContract
    });
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ success: false, message: 'Failed to create contract', error: error.message });
  }
});

// GET /api/v1/procurement/contracts/:id - Get contract details
router.get('/contracts/:id', authenticateToken, requirePermission('read_procurement'), contractRateLimit, [
  param('id').isMongoId().withMessage('Invalid contract ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await ProcurementContract.findById(req.params.id)
      .populate('supplierId', 'supplierName contactInfo performance');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    logger.error('Error fetching contract:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contract', error: error.message });
  }
});

// PUT /api/v1/procurement/contracts/:id - Update contract
router.put('/contracts/:id', authenticateToken, requirePermission('update_contract'), contractRateLimit, [
  param('id').isMongoId().withMessage('Invalid contract ID'),
  body('terms.value').optional().isFloat({ min: 0 }).withMessage('Contract value must be a positive number'),
  body('coveredItems').optional().isArray().withMessage('Covered items must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await ProcurementContract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (contract.status === 'expired' || contract.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot update expired or cancelled contracts' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.userId
    };

    const updatedContract = await ProcurementContract.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Contract updated successfully',
      data: updatedContract
    });
  } catch (error) {
    logger.error('Error updating contract:', error);
    res.status(500).json({ success: false, message: 'Failed to update contract', error: error.message });
  }
});

// POST /api/v1/procurement/contracts/:id/activate - Activate contract
router.post('/contracts/:id/activate', authenticateToken, requirePermission('activate_contract'), contractRateLimit, [
  param('id').isMongoId().withMessage('Invalid contract ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await ProcurementContract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (contract.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft contracts can be activated' });
    }

    // Check if start date is valid
    if (new Date() < new Date(contract.terms.startDate)) {
      return res.status(400).json({ success: false, message: 'Contract start date is in the future' });
    }

    contract.status = 'active';
    contract.updatedBy = req.user.userId;
    await contract.save();

    res.json({
      success: true,
      message: 'Contract activated successfully',
      data: contract
    });
  } catch (error) {
    logger.error('Error activating contract:', error);
    res.status(500).json({ success: false, message: 'Failed to activate contract', error: error.message });
  }
});

// POST /api/v1/procurement/contracts/:id/renew - Renew contract
router.post('/contracts/:id/renew', authenticateToken, requirePermission('renew_contract'), contractRateLimit, [
  param('id').isMongoId().withMessage('Invalid contract ID'),
  body('newEndDate').isISO8601().withMessage('Invalid new end date format'),
  body('renewalValue').optional().isFloat({ min: 0 }).withMessage('Renewal value must be a positive number'),
  body('renewalTerms').optional().isString().withMessage('Renewal terms must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { newEndDate, renewalValue, renewalTerms } = req.body;
    const contract = await ProcurementContract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (!['active', 'expiring_soon'].includes(contract.status)) {
      return res.status(400).json({ success: false, message: 'Only active or expiring contracts can be renewed' });
    }

    // Update contract
    contract.terms.endDate = new Date(newEndDate);
    if (renewalValue) contract.terms.value = renewalValue;
    contract.renewal = {
      isRenewable: true,
      renewalTerms: renewalTerms || contract.renewal.renewalTerms,
      renewalValue: renewalValue || contract.terms.value,
      renewalDate: new Date(),
      renewalStatus: 'renewed',
      renewalNotes: `Contract renewed by ${req.user.firstName} ${req.user.lastName}`
    };
    contract.status = 'active';
    contract.updatedBy = req.user.userId;

    await contract.save();

    res.json({
      success: true,
      message: 'Contract renewed successfully',
      data: contract
    });
  } catch (error) {
    logger.error('Error renewing contract:', error);
    res.status(500).json({ success: false, message: 'Failed to renew contract', error: error.message });
  }
});

// POST /api/v1/procurement/contracts/:id/cancel - Cancel contract
router.post('/contracts/:id/cancel', authenticateToken, requirePermission('cancel_contract'), contractRateLimit, [
  param('id').isMongoId().withMessage('Invalid contract ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { reason } = req.body;
    const contract = await ProcurementContract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (contract.status === 'cancelled' || contract.status === 'expired') {
      return res.status(400).json({ success: false, message: 'Contract is already cancelled or expired' });
    }

    contract.status = 'cancelled';
    contract.notes.push({
      note: `Contract cancelled: ${reason}`,
      addedBy: req.user.userId,
      addedAt: new Date()
    });
    contract.updatedBy = req.user.userId;

    await contract.save();

    res.json({
      success: true,
      message: 'Contract cancelled successfully',
      data: contract
    });
  } catch (error) {
    logger.error('Error cancelling contract:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel contract', error: error.message });
  }
});

// GET /api/v1/procurement/contracts/:id/usage - Get contract usage
router.get('/contracts/:id/usage', authenticateToken, requirePermission('read_procurement'), contractRateLimit, [
  param('id').isMongoId().withMessage('Invalid contract ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await ProcurementContract.findById(req.params.id).select('usage terms');
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const usage = {
      utilization: contract.usage.utilization,
      totalSpent: contract.usage.totalSpent,
      totalTransactions: contract.usage.totalTransactions,
      lastUsed: contract.usage.lastUsed,
      spending: contract.usage.spending,
      remainingValue: contract.terms.value - contract.usage.totalSpent,
      utilizationPercentage: contract.usage.utilization
    };

    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    logger.error('Error fetching contract usage:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contract usage', error: error.message });
  }
});

// GET /api/v1/procurement/contracts/expiring - Get expiring contracts
router.get('/contracts/expiring', authenticateToken, requirePermission('read_procurement'), contractRateLimit, [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiringContracts = await ProcurementContract.find({
      'terms.endDate': { $lte: futureDate },
      status: { $in: ['active', 'expiring_soon'] }
    })
    .populate('supplierId', 'supplierName contactInfo')
    .sort({ 'terms.endDate': 1 })
    .lean();

    res.json({
      success: true,
      data: expiringContracts
    });
  } catch (error) {
    logger.error('Error fetching expiring contracts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expiring contracts', error: error.message });
  }
});

// GET /api/v1/procurement/contracts/:id/compliance - Get contract compliance status
router.get('/contracts/:id/compliance', authenticateToken, requirePermission('read_procurement'), contractRateLimit, [
  param('id').isMongoId().withMessage('Invalid contract ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await ProcurementContract.findById(req.params.id).select('compliance sla');
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const compliance = {
      requirements: contract.compliance.complianceRequirements,
      certifications: contract.compliance.certifications,
      qualityStandards: contract.compliance.qualityStandards,
      environmentalRequirements: contract.compliance.environmentalRequirements,
      safetyRequirements: contract.compliance.safetyRequirements,
      sla: contract.sla
    };

    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    logger.error('Error fetching contract compliance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contract compliance', error: error.message });
  }
});

module.exports = router;
