const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const procurementEmailService = require('../services/procurementEmailService');
const EmailTemplate = require('../models/EmailTemplate');
const logger = require('../utils/logger');

// Rate limiting
const emailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many email requests, please try again later.'
});

// GET /api/v1/procurement/email/templates - Get all email templates
router.get('/templates', authenticateToken, requirePermission('read_procurement'), emailRateLimit, [
  query('category').optional().isString().withMessage('Category must be a string'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { category, isActive, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (category) filter['settings.category'] = category;
    if (isActive !== undefined) filter['settings.isActive'] = isActive === 'true';

    const templates = await EmailTemplate.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EmailTemplate.countDocuments(filter);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching email templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch email templates', error: error.message });
  }
});

// GET /api/v1/procurement/email/templates/:id - Get specific email template
router.get('/templates/:id', authenticateToken, requirePermission('read_procurement'), emailRateLimit, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Error fetching email template:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch email template', error: error.message });
  }
});

// POST /api/v1/procurement/email/templates - Create new email template
router.post('/templates', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('name').notEmpty().withMessage('Template name is required'),
  body('type').notEmpty().withMessage('Template type is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('htmlContent').notEmpty().withMessage('HTML content is required'),
  body('textContent').notEmpty().withMessage('Text content is required'),
  body('variables').optional().isArray().withMessage('Variables must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const template = new EmailTemplate({
      ...req.body,
      settings: {
        isActive: true,
        isDefault: false,
        category: 'procurement',
        priority: 'medium',
        ...req.body.settings
      }
    });

    await template.save();

    res.status(201).json({
      success: true,
      data: template,
      message: 'Email template created successfully'
    });
  } catch (error) {
    logger.error('Error creating email template:', error);
    res.status(500).json({ success: false, message: 'Failed to create email template', error: error.message });
  }
});

// PUT /api/v1/procurement/email/templates/:id - Update email template
router.put('/templates/:id', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('name').optional().notEmpty().withMessage('Template name cannot be empty'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('htmlContent').optional().notEmpty().withMessage('HTML content cannot be empty'),
  body('textContent').optional().notEmpty().withMessage('Text content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    // Update template
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        template[key] = req.body[key];
      }
    });

    // Increment version
    template.version = (template.version || 1) + 1;
    template.updatedAt = new Date();

    await template.save();

    res.json({
      success: true,
      data: template,
      message: 'Email template updated successfully'
    });
  } catch (error) {
    logger.error('Error updating email template:', error);
    res.status(500).json({ success: false, message: 'Failed to update email template', error: error.message });
  }
});

// DELETE /api/v1/procurement/email/templates/:id - Delete email template
router.delete('/templates/:id', authenticateToken, requirePermission('delete_procurement'), emailRateLimit, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    // Check if template is default
    if (template.settings.isDefault) {
      return res.status(400).json({ success: false, message: 'Cannot delete default template' });
    }

    await EmailTemplate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting email template:', error);
    res.status(500).json({ success: false, message: 'Failed to delete email template', error: error.message });
  }
});

// POST /api/v1/procurement/email/send - Send email notification
router.post('/send', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('templateType').notEmpty().withMessage('Template type is required'),
  body('data').isObject().withMessage('Data must be an object'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { recipients, templateType, data, options = {} } = req.body;

    const result = await procurementEmailService.sendNotification(
      recipients,
      templateType,
      data,
      options
    );

    res.json({
      success: true,
      data: result,
      message: 'Email sent successfully'
    });
  } catch (error) {
    logger.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// POST /api/v1/procurement/email/send-bulk - Send bulk email notifications
router.post('/send-bulk', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('templateType').notEmpty().withMessage('Template type is required'),
  body('data').isObject().withMessage('Data must be an object'),
  body('options').optional().isObject().withMessage('Options must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { recipients, templateType, data, options = {} } = req.body;

    const results = await procurementEmailService.sendBulkNotifications(
      recipients,
      templateType,
      data,
      options
    );

    res.json({
      success: true,
      data: results,
      message: `Bulk emails sent successfully to ${recipients.length} recipients`
    });
  } catch (error) {
    logger.error('Error sending bulk emails:', error);
    res.status(500).json({ success: false, message: 'Failed to send bulk emails', error: error.message });
  }
});

// POST /api/v1/procurement/email/send-request-created - Send request created notification
router.post('/send-request-created', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('requesterEmail').isEmail().withMessage('Valid email is required'),
  body('requestData').isObject().withMessage('Request data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { requesterEmail, requestData } = req.body;

    const result = await procurementEmailService.sendRequestCreatedNotification(
      requesterEmail,
      requestData
    );

    res.json({
      success: true,
      data: result,
      message: 'Request created notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending request created notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send request created notification', error: error.message });
  }
});

// POST /api/v1/procurement/email/send-request-approved - Send request approved notification
router.post('/send-request-approved', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('requesterEmail').isEmail().withMessage('Valid email is required'),
  body('requestData').isObject().withMessage('Request data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { requesterEmail, requestData } = req.body;

    const result = await procurementEmailService.sendRequestApprovedNotification(
      requesterEmail,
      requestData
    );

    res.json({
      success: true,
      data: result,
      message: 'Request approved notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending request approved notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send request approved notification', error: error.message });
  }
});

// POST /api/v1/procurement/email/send-contract-expiring - Send contract expiring notification
router.post('/send-contract-expiring', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('recipientEmail').isEmail().withMessage('Valid email is required'),
  body('contractData').isObject().withMessage('Contract data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { recipientEmail, contractData } = req.body;

    const result = await procurementEmailService.sendContractExpiringNotification(
      recipientEmail,
      contractData
    );

    res.json({
      success: true,
      data: result,
      message: 'Contract expiring notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending contract expiring notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send contract expiring notification', error: error.message });
  }
});

// POST /api/v1/procurement/email/send-budget-exceeded - Send budget exceeded notification
router.post('/send-budget-exceeded', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('recipientEmail').isEmail().withMessage('Valid email is required'),
  body('budgetData').isObject().withMessage('Budget data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { recipientEmail, budgetData } = req.body;

    const result = await procurementEmailService.sendBudgetExceededNotification(
      recipientEmail,
      budgetData
    );

    res.json({
      success: true,
      data: result,
      message: 'Budget exceeded notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending budget exceeded notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send budget exceeded notification', error: error.message });
  }
});

// POST /api/v1/procurement/email/send-high-risk-alert - Send high risk supplier alert
router.post('/send-high-risk-alert', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('recipientEmail').isEmail().withMessage('Valid email is required'),
  body('supplierData').isObject().withMessage('Supplier data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { recipientEmail, supplierData } = req.body;

    const result = await procurementEmailService.sendHighRiskAlert(
      recipientEmail,
      supplierData
    );

    res.json({
      success: true,
      data: result,
      message: 'High risk alert sent successfully'
    });
  } catch (error) {
    logger.error('Error sending high risk alert:', error);
    res.status(500).json({ success: false, message: 'Failed to send high risk alert', error: error.message });
  }
});

// GET /api/v1/procurement/email/analytics - Get email analytics
router.get('/analytics', authenticateToken, requirePermission('read_procurement'), emailRateLimit, [
  query('templateId').optional().isMongoId().withMessage('Invalid template ID'),
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { templateId, period = 'monthly' } = req.query;

    let filter = {};
    if (templateId) {
      filter._id = templateId;
    }

    const templates = await EmailTemplate.find(filter).select('name type analytics');

    const analytics = {
      totalTemplates: templates.length,
      totalEmailsSent: templates.reduce((sum, template) => sum + (template.analytics.usageCount || 0), 0),
      averageSuccessRate: templates.reduce((sum, template) => sum + (template.analytics.successRate || 0), 0) / templates.length,
      templateStats: templates.map(template => ({
        name: template.name,
        type: template.type,
        usageCount: template.analytics.usageCount || 0,
        successRate: template.analytics.successRate || 0,
        lastUsed: template.analytics.lastUsed
      }))
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching email analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch email analytics', error: error.message });
  }
});

// POST /api/v1/procurement/email/test - Test email template
router.post('/test', authenticateToken, requirePermission('write_procurement'), emailRateLimit, [
  body('templateId').isMongoId().withMessage('Valid template ID is required'),
  body('testEmail').isEmail().withMessage('Valid test email is required'),
  body('testData').isObject().withMessage('Test data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { templateId, testEmail, testData } = req.body;

    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Email template not found' });
    }

    const result = await procurementEmailService.sendNotification(
      testEmail,
      template.type,
      testData,
      { from: 'test@clutch.com' }
    );

    res.json({
      success: true,
      data: result,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    logger.error('Error sending test email:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: error.message });
  }
});

module.exports = router;
