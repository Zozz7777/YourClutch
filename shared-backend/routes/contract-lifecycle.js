const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const contractLifecycleService = require('../services/contractLifecycleService');
const ProcurementContract = require('../models/ProcurementContract');
const logger = require('../utils/logger');

// Rate limiting
const contractLifecycleRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many contract lifecycle requests, please try again later.'
});

// GET /api/v1/procurement/contract-lifecycle/dashboard - Get contract lifecycle dashboard
router.get('/dashboard', authenticateToken, requirePermission('read_procurement'), contractLifecycleRateLimit, async (req, res) => {
  try {
    const dashboardData = await contractLifecycleService.getDashboardData();

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error fetching contract lifecycle dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contract lifecycle dashboard', error: error.message });
  }
});

// GET /api/v1/procurement/contract-lifecycle/expiring - Get contracts expiring soon
router.get('/expiring', authenticateToken, requirePermission('read_procurement'), contractLifecycleRateLimit, [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 30;
    const expiringContracts = await contractLifecycleService.getExpiringContracts(days);

    res.json({
      success: true,
      data: expiringContracts
    });
  } catch (error) {
    logger.error('Error fetching expiring contracts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expiring contracts', error: error.message });
  }
});

// GET /api/v1/procurement/contract-lifecycle/:id/lifecycle - Get contract lifecycle
router.get('/:id/lifecycle', authenticateToken, requirePermission('read_procurement'), contractLifecycleRateLimit, async (req, res) => {
  try {
    const lifecycle = await contractLifecycleService.getContractLifecycle(req.params.id);

    res.json({
      success: true,
      data: lifecycle
    });
  } catch (error) {
    logger.error('Error fetching contract lifecycle:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contract lifecycle', error: error.message });
  }
});

// POST /api/v1/procurement/contract-lifecycle/:id/submit-review - Submit contract for review
router.post('/:id/submit-review', authenticateToken, requirePermission('write_procurement'), contractLifecycleRateLimit, async (req, res) => {
  try {
    const contract = await contractLifecycleService.submitForReview(req.params.id, req.user.id);

    res.json({
      success: true,
      data: contract,
      message: 'Contract submitted for review successfully'
    });
  } catch (error) {
    logger.error('Error submitting contract for review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contract for review', error: error.message });
  }
});

// POST /api/v1/procurement/contract-lifecycle/:id/review - Review contract
router.post('/:id/review', authenticateToken, requirePermission('write_procurement'), contractLifecycleRateLimit, [
  body('comments').optional().isString().withMessage('Comments must be a string'),
  body('reviewNotes').optional().isString().withMessage('Review notes must be a string'),
  body('requiredChanges').optional().isArray().withMessage('Required changes must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await contractLifecycleService.reviewContract(req.params.id, req.body, req.user.id);

    res.json({
      success: true,
      data: contract,
      message: 'Contract review completed successfully'
    });
  } catch (error) {
    logger.error('Error reviewing contract:', error);
    res.status(500).json({ success: false, message: 'Failed to review contract', error: error.message });
  }
});

// POST /api/v1/procurement/contract-lifecycle/:id/approve - Approve contract
router.post('/:id/approve', authenticateToken, requirePermission('approve_procurement'), contractLifecycleRateLimit, [
  body('comments').optional().isString().withMessage('Comments must be a string'),
  body('conditions').optional().isArray().withMessage('Conditions must be an array'),
  body('activationDate').optional().isISO8601().withMessage('Invalid activation date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await contractLifecycleService.approveContract(req.params.id, req.body, req.user.id);

    res.json({
      success: true,
      data: contract,
      message: 'Contract approved successfully'
    });
  } catch (error) {
    logger.error('Error approving contract:', error);
    res.status(500).json({ success: false, message: 'Failed to approve contract', error: error.message });
  }
});

// POST /api/v1/procurement/contract-lifecycle/:id/activate - Activate contract
router.post('/:id/activate', authenticateToken, requirePermission('write_procurement'), contractLifecycleRateLimit, async (req, res) => {
  try {
    const contract = await contractLifecycleService.activateContract(req.params.id, req.user.id);

    res.json({
      success: true,
      data: contract,
      message: 'Contract activated successfully'
    });
  } catch (error) {
    logger.error('Error activating contract:', error);
    res.status(500).json({ success: false, message: 'Failed to activate contract', error: error.message });
  }
});

// POST /api/v1/procurement/contract-lifecycle/:id/terminate - Terminate contract
router.post('/:id/terminate', authenticateToken, requirePermission('write_procurement'), contractLifecycleRateLimit, [
  body('reason').notEmpty().withMessage('Termination reason is required'),
  body('effectiveDate').optional().isISO8601().withMessage('Invalid effective date format'),
  body('noticePeriod').optional().isString().withMessage('Notice period must be a string'),
  body('terminationClause').optional().isString().withMessage('Termination clause must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const contract = await contractLifecycleService.terminateContract(req.params.id, req.body, req.user.id);

    res.json({
      success: true,
      data: contract,
      message: 'Contract terminated successfully'
    });
  } catch (error) {
    logger.error('Error terminating contract:', error);
    res.status(500).json({ success: false, message: 'Failed to terminate contract', error: error.message });
  }
});

// POST /api/v1/procurement/contract-lifecycle/:id/renew - Renew contract
router.post('/:id/renew', authenticateToken, requirePermission('write_procurement'), contractLifecycleRateLimit, [
  body('newStartDate').isISO8601().withMessage('New start date is required and must be valid'),
  body('newEndDate').isISO8601().withMessage('New end date is required and must be valid'),
  body('newValue').optional().isNumeric().withMessage('New value must be a number'),
  body('reason').optional().isString().withMessage('Renewal reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await contractLifecycleService.renewContract(req.params.id, req.body, req.user.id);

    res.json({
      success: true,
      data: result,
      message: 'Contract renewed successfully'
    });
  } catch (error) {
    logger.error('Error renewing contract:', error);
    res.status(500).json({ success: false, message: 'Failed to renew contract', error: error.message });
  }
});

// GET /api/v1/procurement/contract-lifecycle/reminders/process - Process renewal reminders
router.get('/reminders/process', authenticateToken, requirePermission('read_procurement'), contractLifecycleRateLimit, async (req, res) => {
  try {
    const processedCount = await contractLifecycleService.processRenewalReminders();

    res.json({
      success: true,
      data: { processedCount },
      message: `Processed ${processedCount} renewal reminders`
    });
  } catch (error) {
    logger.error('Error processing renewal reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to process renewal reminders', error: error.message });
  }
});

// GET /api/v1/procurement/contract-lifecycle/status/:status - Get contracts by status
router.get('/status/:status', authenticateToken, requirePermission('read_procurement'), contractLifecycleRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const contracts = await ProcurementContract.find({ status })
      .populate('supplierId', 'companyName contactEmail')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ProcurementContract.countDocuments({ status });

    res.json({
      success: true,
      data: {
        contracts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching contracts by status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contracts by status', error: error.message });
  }
});

// GET /api/v1/procurement/contract-lifecycle/analytics/trends - Get contract trends
router.get('/analytics/trends', authenticateToken, requirePermission('read_procurement'), contractLifecycleRateLimit, [
  query('period').optional().isIn(['monthly', 'quarterly', 'annually']).withMessage('Invalid period'),
  query('months').optional().isInt({ min: 1, max: 24 }).withMessage('Months must be between 1 and 24')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { period = 'monthly', months = 12 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const trends = await ProcurementContract.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            period: period === 'monthly' ? { $month: '$createdAt' } :
                   period === 'quarterly' ? { $quarter: '$createdAt' } :
                   { $year: '$createdAt' },
            year: { $year: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$terms.value' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.period': 1 }
      }
    ]);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    logger.error('Error fetching contract trends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contract trends', error: error.message });
  }
});

// GET /api/v1/procurement/contract-lifecycle/analytics/renewals - Get renewal analytics
router.get('/analytics/renewals', authenticateToken, requirePermission('read_procurement'), contractLifecycleRateLimit, async (req, res) => {
  try {
    const renewalStats = await contractLifecycleService.getRenewalStats();

    res.json({
      success: true,
      data: renewalStats
    });
  } catch (error) {
    logger.error('Error fetching renewal analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch renewal analytics', error: error.message });
  }
});

module.exports = router;
