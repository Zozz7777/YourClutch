const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Tax Types
const TAX_TYPES = {
  VAT: 'vat',
  INCOME_TAX: 'income_tax',
  BUSINESS_TAX: 'business_tax',
  WITHHOLDING_TAX: 'withholding_tax'
};

// Tax Status
const TAX_STATUS = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
  FILED: 'filed',
  PAID: 'paid',
  OVERDUE: 'overdue'
};

// Get tax summary
router.get('/taxes/summary', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d' // 7d, 30d, 90d, 1y
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    const taxesCollection = await getCollection('partnerTaxes');
    
    const summary = await taxesCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTaxes: { $sum: '$amount' },
          pendingTaxes: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.PENDING] }, '$amount', 0] }
          },
          calculatedTaxes: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.CALCULATED] }, '$amount', 0] }
          },
          paidTaxes: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.PAID] }, '$amount', 0] }
          },
          overdueTaxes: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.OVERDUE] }, '$amount', 0] }
          },
          totalCount: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.PENDING] }, 1, 0] }
          },
          calculatedCount: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.CALCULATED] }, 1, 0] }
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.PAID] }, 1, 0] }
          },
          overdueCount: {
            $sum: { $cond: [{ $eq: ['$status', TAX_STATUS.OVERDUE] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const taxSummary = summary[0] || {
      totalTaxes: 0,
      pendingTaxes: 0,
      calculatedTaxes: 0,
      paidTaxes: 0,
      overdueTaxes: 0,
      totalCount: 0,
      pendingCount: 0,
      calculatedCount: 0,
      paidCount: 0,
      overdueCount: 0
    };

    // Get tax breakdown by type
    const typeBreakdown = await taxesCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: {
        summary: taxSummary,
        typeBreakdown,
        period,
        startDate,
        endDate: now
      },
      message: 'Tax summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching tax summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax summary',
      error: error.message
    });
  }
});

// Get tax history
router.get('/taxes/history', auth, async (req, res) => {
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
      type = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(TAX_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (type && Object.values(TAX_TYPES).includes(type)) {
      query.type = type;
    }

    if (dateFrom) {
      query.createdAt = { ...query.createdAt, $gte: new Date(dateFrom) };
    }

    if (dateTo) {
      query.createdAt = { ...query.createdAt, $lte: new Date(dateTo) };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const taxesCollection = await getCollection('partnerTaxes');
    
    const taxes = await taxesCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await taxesCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        taxes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Tax history retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching tax history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax history',
      error: error.message
    });
  }
});

// Calculate VAT
router.post('/taxes/calculate-vat', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be numeric'),
  body('isInclusive').optional().isBoolean().withMessage('isInclusive must be boolean'),
  body('description').optional().isString().withMessage('Description must be string')
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

    const { amount, isInclusive = false, description } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const vatRate = 0.14; // 14% VAT rate for Egypt
    let vatAmount, netAmount, grossAmount;

    if (isInclusive) {
      // Amount includes VAT
      grossAmount = amount;
      vatAmount = amount * (vatRate / (1 + vatRate));
      netAmount = amount - vatAmount;
    } else {
      // Amount excludes VAT
      netAmount = amount;
      vatAmount = amount * vatRate;
      grossAmount = amount + vatAmount;
    }

    res.json({
      success: true,
      data: {
        netAmount: Math.round(netAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        grossAmount: Math.round(grossAmount * 100) / 100,
        vatRate,
        isInclusive,
        description
      },
      message: 'VAT calculated successfully'
    });
  } catch (error) {
    logger.error('Error calculating VAT:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate VAT',
      error: error.message
    });
  }
});

// Calculate income tax
router.post('/taxes/calculate-income', [
  auth,
  body('grossIncome').isNumeric().withMessage('Gross income must be numeric'),
  body('deductions').optional().isNumeric().withMessage('Deductions must be numeric'),
  body('taxYear').optional().isNumeric().withMessage('Tax year must be numeric')
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

    const { grossIncome, deductions = 0, taxYear = new Date().getFullYear() } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const taxableIncome = Math.max(0, grossIncome - deductions);
    
    // Egyptian income tax brackets (2024)
    const taxBrackets = [
      { min: 0, max: 15000, rate: 0.00 },
      { min: 15000, max: 30000, rate: 0.025 },
      { min: 30000, max: 45000, rate: 0.10 },
      { min: 45000, max: 60000, rate: 0.15 },
      { min: 60000, max: 200000, rate: 0.20 },
      { min: 200000, max: 400000, rate: 0.225 },
      { min: 400000, max: Infinity, rate: 0.25 }
    ];

    let totalTax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of taxBrackets) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      const taxInBracket = taxableInBracket * bracket.rate;
      
      totalTax += taxInBracket;
      remainingIncome -= taxableInBracket;
    }

    const netIncome = grossIncome - totalTax;
    const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

    res.json({
      success: true,
      data: {
        grossIncome,
        deductions,
        taxableIncome,
        totalTax: Math.round(totalTax * 100) / 100,
        netIncome: Math.round(netIncome * 100) / 100,
        effectiveRate: Math.round(effectiveRate * 100) / 100,
        taxYear
      },
      message: 'Income tax calculated successfully'
    });
  } catch (error) {
    logger.error('Error calculating income tax:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate income tax',
      error: error.message
    });
  }
});

// Get tax rates
router.get('/taxes/rates', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const taxRates = {
      vat: {
        rate: 0.14,
        description: 'Value Added Tax',
        applicableTo: ['goods', 'services'],
        exemptions: ['basic_food_items', 'medical_supplies']
      },
      incomeTax: {
        brackets: [
          { min: 0, max: 15000, rate: 0.00, description: 'First 15,000 EGP' },
          { min: 15000, max: 30000, rate: 0.025, description: '15,001 - 30,000 EGP' },
          { min: 30000, max: 45000, rate: 0.10, description: '30,001 - 45,000 EGP' },
          { min: 45000, max: 60000, rate: 0.15, description: '45,001 - 60,000 EGP' },
          { min: 60000, max: 200000, rate: 0.20, description: '60,001 - 200,000 EGP' },
          { min: 200000, max: 400000, rate: 0.225, description: '200,001 - 400,000 EGP' },
          { min: 400000, max: Infinity, rate: 0.25, description: 'Above 400,000 EGP' }
        ],
        description: 'Personal Income Tax',
        applicableTo: ['individual_income']
      },
      businessTax: {
        rate: 0.225,
        description: 'Corporate Tax',
        applicableTo: ['business_profits'],
        exemptions: ['small_businesses']
      },
      withholdingTax: {
        rate: 0.05,
        description: 'Withholding Tax',
        applicableTo: ['contractor_payments'],
        exemptions: ['registered_contractors']
      }
    };

    res.json({
      success: true,
      data: taxRates,
      message: 'Tax rates retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching tax rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax rates',
      error: error.message
    });
  }
});

// Generate tax report
router.post('/taxes/generate-report', [
  auth,
  body('startDate').isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').isISO8601().withMessage('End date must be valid ISO date'),
  body('reportType').isIn(['vat', 'income', 'comprehensive']).withMessage('Invalid report type'),
  body('format').optional().isIn(['pdf', 'excel', 'csv']).withMessage('Invalid format')
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

    const { startDate, endDate, reportType, format = 'pdf' } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const { getCollection } = require('../config/database');
    const taxesCollection = await getCollection('partnerTaxes');
    
    // Get tax data for the period
    const taxes = await taxesCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: start, $lte: end }
    }).toArray();

    // Calculate report data
    const reportData = {
      partnerId: partner.partnerId,
      partnerName: partner.businessName,
      startDate: start,
      endDate: end,
      reportType,
      generatedAt: new Date(),
      summary: {
        totalVAT: taxes.filter(t => t.type === TAX_TYPES.VAT).reduce((sum, t) => sum + t.amount, 0),
        totalIncomeTax: taxes.filter(t => t.type === TAX_TYPES.INCOME_TAX).reduce((sum, t) => sum + t.amount, 0),
        totalBusinessTax: taxes.filter(t => t.type === TAX_TYPES.BUSINESS_TAX).reduce((sum, t) => sum + t.amount, 0),
        totalWithholdingTax: taxes.filter(t => t.type === TAX_TYPES.WITHHOLDING_TAX).reduce((sum, t) => sum + t.amount, 0),
        grandTotal: taxes.reduce((sum, t) => sum + t.amount, 0)
      },
      details: taxes
    };

    // TODO: Generate actual report file (PDF/Excel/CSV)
    // For now, return the report data
    res.json({
      success: true,
      data: {
        reportId: `TAX-${Date.now()}`,
        reportData,
        downloadUrl: `/api/taxes/reports/${reportData.reportId}.${format}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      message: 'Tax report generated successfully'
    });
  } catch (error) {
    logger.error('Error generating tax report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tax report',
      error: error.message
    });
  }
});

// Get tax deadlines
router.get('/taxes/deadlines', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Egyptian tax deadlines
    const deadlines = [
      {
        type: 'VAT',
        description: 'Monthly VAT Return',
        dueDate: new Date(currentYear, currentMonth, 15), // 15th of next month
        frequency: 'monthly',
        status: new Date() > new Date(currentYear, currentMonth, 15) ? 'overdue' : 'pending'
      },
      {
        type: 'Income Tax',
        description: 'Annual Income Tax Return',
        dueDate: new Date(currentYear + 1, 3, 31), // April 30th of next year
        frequency: 'annual',
        status: new Date() > new Date(currentYear + 1, 3, 31) ? 'overdue' : 'pending'
      },
      {
        type: 'Business Tax',
        description: 'Corporate Tax Return',
        dueDate: new Date(currentYear + 1, 3, 31), // April 30th of next year
        frequency: 'annual',
        status: new Date() > new Date(currentYear + 1, 3, 31) ? 'overdue' : 'pending'
      }
    ];

    res.json({
      success: true,
      data: deadlines,
      message: 'Tax deadlines retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching tax deadlines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax deadlines',
      error: error.message
    });
  }
});

module.exports = router;
