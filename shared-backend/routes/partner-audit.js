const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// @route   GET /api/v1/partners/audit-logs
// @desc    Get partner audit logs
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      category, 
      severity, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 
    } = req.query;
    
    console.log('🔍 Audit logs request:', { partnerId, category, severity });
    
    const { getCollection } = require('../config/database');
    const auditLogsCollection = await getCollection('audit_logs');
    
    let query = { partnerId };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    const auditLogs = await auditLogsCollection.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();
    
    const totalCount = await auditLogsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        auditLogs,
        totalCount,
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });
    
  } catch (error) {
    logger.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/audit-logs
// @desc    Create audit log entry
// @access  Private
router.post('/', [
  body('action').notEmpty().withMessage('Action is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('severity').notEmpty().withMessage('Severity is required')
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
    
    const { partnerId, userId } = req.user;
    const { action, description, category, severity, metadata } = req.body;
    
    console.log('📝 Create audit log:', { partnerId, action, category, severity });
    
    const { getCollection } = require('../config/database');
    const auditLogsCollection = await getCollection('audit_logs');
    
    const auditLog = {
      partnerId,
      userId,
      action,
      description,
      category,
      severity,
      metadata: metadata || {},
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      createdAt: new Date()
    };
    
    const result = await auditLogsCollection.insertOne(auditLog);
    
    res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: {
        auditLogId: result.insertedId
      }
    });
    
  } catch (error) {
    logger.error('Create audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/audit-logs/export
// @desc    Export audit logs
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      category, 
      severity, 
      startDate, 
      endDate,
      format = 'csv'
    } = req.query;
    
    console.log('📤 Export audit logs:', { partnerId, format });
    
    const { getCollection } = require('../config/database');
    const auditLogsCollection = await getCollection('audit_logs');
    
    let query = { partnerId };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    const auditLogs = await auditLogsCollection.find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    if (format === 'csv') {
      const csv = generateCSV(auditLogs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      res.send(csv);
    } else if (format === 'json') {
      res.json({
        success: true,
        data: auditLogs
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported format'
      });
    }
    
  } catch (error) {
    logger.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

function generateCSV(auditLogs) {
  const headers = [
    'ID',
    'Action',
    'Description',
    'Category',
    'Severity',
    'User ID',
    'IP Address',
    'User Agent',
    'Created At'
  ];
  
  const rows = auditLogs.map(log => [
    log._id,
    log.action,
    log.description,
    log.category,
    log.severity,
    log.userId,
    log.ipAddress,
    log.userAgent,
    log.createdAt.toISOString()
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
}

module.exports = router;
