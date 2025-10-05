const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');
const { toObjectId } = require('../utils/databaseUtils');

// Import models
const SpendAnalytics = require('../models/SpendAnalytics');
const ProcurementRequest = require('../models/ProcurementRequest');
const ProcurementSupplier = require('../models/ProcurementSupplier');
const ProcurementContract = require('../models/ProcurementContract');
const DepartmentBudget = require('../models/DepartmentBudget');
const ProjectBudget = require('../models/ProjectBudget');

// Rate limiting for analytics operations
const analyticsRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests from this IP, please try again later.'
});

// GET /api/v1/procurement/analytics/dashboard - Get procurement dashboard data
router.get('/analytics/dashboard', authenticateToken, requirePermission('read_procurement'), analyticsRateLimit, [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'annually']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { period = 'monthly', startDate, endDate } = req.query;
    
    // Set date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter.createdAt = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    }

    // Get procurement requests data
    const [totalRequests, approvedRequests, pendingRequests, totalSpend] = await Promise.all([
      ProcurementRequest.countDocuments(dateFilter),
      ProcurementRequest.countDocuments({ ...dateFilter, status: 'approved' }),
      ProcurementRequest.countDocuments({ ...dateFilter, status: 'pending_approval' }),
      ProcurementRequest.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // Get supplier data
    const [totalSuppliers, activeSuppliers, preferredSuppliers] = await Promise.all([
      ProcurementSupplier.countDocuments(),
      ProcurementSupplier.countDocuments({ 'status.isActive': true }),
      ProcurementSupplier.countDocuments({ 'status.isPreferred': true })
    ]);

    // Get contract data
    const [totalContracts, activeContracts, expiringContracts] = await Promise.all([
      ProcurementContract.countDocuments(),
      ProcurementContract.countDocuments({ status: 'active' }),
      ProcurementContract.countDocuments({
        status: { $in: ['active', 'expiring_soon'] },
        'terms.endDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Get budget data
    const [departmentBudgets, projectBudgets] = await Promise.all([
      DepartmentBudget.find({ 'period.isActive': true }),
      ProjectBudget.find({ status: 'active' })
    ]);

    const totalBudget = departmentBudgets.reduce((sum, budget) => sum + budget.totalBudget, 0) +
                       projectBudgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
    
    const spentBudget = departmentBudgets.reduce((sum, budget) => sum + budget.tracking.spentAmount, 0) +
                       projectBudgets.reduce((sum, budget) => sum + budget.tracking.spentAmount, 0);

    const dashboard = {
      overview: {
        totalRequests,
        approvedRequests,
        pendingRequests,
        totalSpend: totalSpend[0]?.total || 0,
        totalSuppliers,
        activeSuppliers,
        preferredSuppliers,
        totalContracts,
        activeContracts,
        expiringContracts,
        totalBudget,
        spentBudget,
        availableBudget: totalBudget - spentBudget,
        budgetUtilization: totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0
      },
      metrics: {
        approvalRate: totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0,
        averageRequestValue: totalRequests > 0 ? (totalSpend[0]?.total || 0) / totalRequests : 0,
        supplierUtilization: totalSuppliers > 0 ? (activeSuppliers / totalSuppliers) * 100 : 0,
        contractUtilization: totalContracts > 0 ? (activeContracts / totalContracts) * 100 : 0
      }
    };

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Error fetching procurement dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch procurement dashboard', error: error.message });
  }
});

// GET /api/v1/procurement/analytics/spend - Get spend analytics
router.get('/analytics/spend', authenticateToken, requirePermission('read_procurement'), analyticsRateLimit, [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'annually']).withMessage('Invalid period'),
  query('department').optional().isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']).withMessage('Invalid department'),
  query('category').optional().isIn(['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']).withMessage('Invalid category'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { period = 'monthly', department, category, startDate, endDate } = req.query;
    
    // Build aggregation pipeline
    const matchStage = { status: 'approved' };
    if (department) matchStage.department = department;
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const pipeline = [
      { $match: matchStage },
      { $unwind: '$items' },
      { $match: category ? { 'items.category': category } : {} },
      {
        $group: {
          _id: {
            period: period === 'daily' ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } :
                  period === 'weekly' ? { $dateToString: { format: '%Y-W%U', date: '$createdAt' } } :
                  period === 'monthly' ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } } :
                  period === 'quarterly' ? { $dateToString: { format: '%Y-Q%q', date: '$createdAt' } } :
                  { $dateToString: { format: '%Y', date: '$createdAt' } },
            department: '$department',
            category: '$items.category'
          },
          totalSpend: { $sum: '$items.totalPrice' },
          transactionCount: { $sum: 1 },
          averageValue: { $avg: '$items.totalPrice' }
        }
      },
      { $sort: { '_id.period': 1 } }
    ];

    const spendData = await ProcurementRequest.aggregate(pipeline);

    // Get spend by supplier
    const supplierSpend = await ProcurementRequest.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.supplierId',
          totalSpend: { $sum: '$items.totalPrice' },
          transactionCount: { $sum: 1 }
        }
      },
      { $lookup: { from: 'procurementsuppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
      { $unwind: '$supplier' },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        spendByPeriod: spendData,
        spendBySupplier: supplierSpend
      }
    });
  } catch (error) {
    logger.error('Error fetching spend analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch spend analytics', error: error.message });
  }
});

// GET /api/v1/procurement/analytics/suppliers - Get supplier analytics
router.get('/analytics/suppliers', authenticateToken, requirePermission('read_procurement'), analyticsRateLimit, [
  query('performance').optional().isIn(['delivery', 'quality', 'compliance', 'overall']).withMessage('Invalid performance metric'),
  query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
  query('diversity').optional().isIn(['minority_owned', 'women_owned', 'veteran_owned', 'lgbtq_owned', 'small_business', 'none']).withMessage('Invalid diversity classification')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { performance = 'overall', riskLevel, diversity } = req.query;
    
    // Build query
    const query = { 'status.isActive': true };
    if (riskLevel) query['risk.riskLevel'] = riskLevel;
    if (diversity) query['diversity.diversityClassification'] = diversity;

    const suppliers = await ProcurementSupplier.find(query)
      .select('supplierName performance risk diversity status productCategories')
      .sort({ [`performance.${performance}Score`]: -1 })
      .lean();

    // Calculate performance statistics
    const performanceStats = {
      averageDeliveryScore: suppliers.reduce((sum, s) => sum + s.performance.deliveryScore, 0) / suppliers.length,
      averageQualityScore: suppliers.reduce((sum, s) => sum + s.performance.qualityScore, 0) / suppliers.length,
      averageComplianceScore: suppliers.reduce((sum, s) => sum + s.performance.complianceScore, 0) / suppliers.length,
      averageOverallSPI: suppliers.reduce((sum, s) => sum + s.performance.overallSPI, 0) / suppliers.length
    };

    // Risk distribution
    const riskDistribution = suppliers.reduce((acc, supplier) => {
      const risk = supplier.risk.riskLevel;
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    // Diversity distribution
    const diversityDistribution = suppliers.reduce((acc, supplier) => {
      const diversity = supplier.diversity.diversityClassification;
      acc[diversity] = (acc[diversity] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        suppliers,
        performanceStats,
        riskDistribution,
        diversityDistribution,
        totalSuppliers: suppliers.length
      }
    });
  } catch (error) {
    logger.error('Error fetching supplier analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier analytics', error: error.message });
  }
});

// GET /api/v1/procurement/analytics/budgets - Get budget analytics
router.get('/analytics/budgets', authenticateToken, requirePermission('read_procurement'), analyticsRateLimit, [
  query('budgetType').optional().isIn(['department', 'project', 'all']).withMessage('Invalid budget type'),
  query('department').optional().isIn(['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']).withMessage('Invalid department')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { budgetType = 'all', department } = req.query;
    
    let departmentBudgets = [];
    let projectBudgets = [];

    if (budgetType === 'all' || budgetType === 'department') {
      const deptQuery = { 'period.isActive': true };
      if (department) deptQuery.department = department;
      departmentBudgets = await DepartmentBudget.find(deptQuery);
    }

    if (budgetType === 'all' || budgetType === 'project') {
      projectBudgets = await ProjectBudget.find({ status: 'active' });
    }

    // Calculate budget utilization
    const budgetUtilization = [
      ...departmentBudgets.map(budget => ({
        type: 'department',
        name: budget.department,
        totalBudget: budget.totalBudget,
        spentAmount: budget.tracking.spentAmount,
        committedAmount: budget.tracking.committedAmount,
        availableAmount: budget.tracking.availableAmount,
        utilizationPercentage: budget.tracking.utilizationPercentage
      })),
      ...projectBudgets.map(budget => ({
        type: 'project',
        name: budget.projectName,
        totalBudget: budget.totalBudget,
        spentAmount: budget.tracking.spentAmount,
        committedAmount: budget.tracking.committedAmount,
        availableAmount: budget.tracking.availableAmount,
        utilizationPercentage: budget.tracking.utilizationPercentage
      }))
    ];

    // Calculate overall statistics
    const totalBudget = budgetUtilization.reduce((sum, budget) => sum + budget.totalBudget, 0);
    const totalSpent = budgetUtilization.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const totalCommitted = budgetUtilization.reduce((sum, budget) => sum + budget.committedAmount, 0);
    const totalAvailable = budgetUtilization.reduce((sum, budget) => sum + budget.availableAmount, 0);

    const overallStats = {
      totalBudget,
      totalSpent,
      totalCommitted,
      totalAvailable,
      overallUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      budgetHealth: totalAvailable > 0 ? 'healthy' : totalCommitted > 0 ? 'at_risk' : 'over_budget'
    };

    res.json({
      success: true,
      data: {
        budgetUtilization,
        overallStats,
        alerts: budgetUtilization.filter(budget => budget.utilizationPercentage >= 80)
      }
    });
  } catch (error) {
    logger.error('Error fetching budget analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budget analytics', error: error.message });
  }
});

// GET /api/v1/procurement/analytics/contracts - Get contract analytics
router.get('/analytics/contracts', authenticateToken, requirePermission('read_procurement'), analyticsRateLimit, async (req, res) => {
  try {
    // Get contract statistics
    const [totalContracts, activeContracts, expiringContracts, expiredContracts] = await Promise.all([
      ProcurementContract.countDocuments(),
      ProcurementContract.countDocuments({ status: 'active' }),
      ProcurementContract.countDocuments({
        status: { $in: ['active', 'expiring_soon'] },
        'terms.endDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }),
      ProcurementContract.countDocuments({ status: 'expired' })
    ]);

    // Get contract utilization
    const contractUtilization = await ProcurementContract.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          averageUtilization: { $avg: '$usage.utilization' },
          totalValue: { $sum: '$terms.value' },
          totalSpent: { $sum: '$usage.totalSpent' }
        }
      }
    ]);

    // Get contracts by type
    const contractsByType = await ProcurementContract.aggregate([
      { $group: { _id: '$contractType', count: { $sum: 1 } } }
    ]);

    // Get expiring contracts details
    const expiringContractsDetails = await ProcurementContract.find({
      status: { $in: ['active', 'expiring_soon'] },
      'terms.endDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    })
    .populate('supplierId', 'supplierName')
    .select('contractNumber supplierName terms.endDate renewal')
    .sort({ 'terms.endDate': 1 })
    .lean();

    res.json({
      success: true,
      data: {
        statistics: {
          totalContracts,
          activeContracts,
          expiringContracts,
          expiredContracts
        },
        utilization: contractUtilization[0] || { averageUtilization: 0, totalValue: 0, totalSpent: 0 },
        contractsByType,
        expiringContracts: expiringContractsDetails
      }
    });
  } catch (error) {
    logger.error('Error fetching contract analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contract analytics', error: error.message });
  }
});

// GET /api/v1/procurement/analytics/trends - Get procurement trends
router.get('/analytics/trends', authenticateToken, requirePermission('read_procurement'), analyticsRateLimit, [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'annually']).withMessage('Invalid period'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { period = 'monthly', startDate, endDate } = req.query;
    
    // Set date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      dateFilter.createdAt = { $gte: twelveMonthsAgo };
    }

    // Get request trends
    const requestTrends = await ProcurementRequest.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            period: period === 'daily' ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } :
                  period === 'weekly' ? { $dateToString: { format: '%Y-W%U', date: '$createdAt' } } :
                  period === 'monthly' ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } } :
                  period === 'quarterly' ? { $dateToString: { format: '%Y-Q%q', date: '$createdAt' } } :
                  { $dateToString: { format: '%Y', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.period': 1 } }
    ]);

    // Get spend trends by category
    const spendTrends = await ProcurementRequest.aggregate([
      { $match: { ...dateFilter, status: 'approved' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            period: period === 'daily' ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } :
                  period === 'weekly' ? { $dateToString: { format: '%Y-W%U', date: '$createdAt' } } :
                  period === 'monthly' ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } } :
                  period === 'quarterly' ? { $dateToString: { format: '%Y-Q%q', date: '$createdAt' } } :
                  { $dateToString: { format: '%Y', date: '$createdAt' } },
            category: '$items.category'
          },
          spend: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { '_id.period': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        requestTrends,
        spendTrends
      }
    });
  } catch (error) {
    logger.error('Error fetching procurement trends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch procurement trends', error: error.message });
  }
});

module.exports = router;
