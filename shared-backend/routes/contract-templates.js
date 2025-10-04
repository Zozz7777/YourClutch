const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { uploadFile, getSignedUrl, generateTemplateKey, listFiles } = require('../lib/storage');
const { extractPlaceholders, getPreviewData } = require('../lib/docx');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only DOCX files are allowed'), false);
    }
  }
});

// Contract type enum
const CONTRACT_TYPE = {
  PERSON: 'person',
  COMPANY: 'company'
};

// Partner type enum
const PARTNER_TYPE = {
  PARTS_SHOP: 'parts_shop',
  SERVICE_CENTER: 'service_center',
  REPAIR_CENTER: 'repair_center',
  ACCESSORIES_SHOP: 'accessories_shop',
  IMPORTER_MANUFACTURER: 'importer_manufacturer'
};

// POST /api/v1/contract-templates - Upload new template
router.post('/', authenticateToken, upload.single('template'), async (req, res) => {
  try {
    const {
      name,
      partnerType,
      contractType,
      locale = 'en',
      description = ''
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FILE',
        message: 'Template file is required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate required fields
    if (!name || !partnerType || !contractType) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Name, partner type, and contract type are required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate partner type
    if (!Object.values(PARTNER_TYPE).includes(partnerType)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PARTNER_TYPE',
        message: 'Invalid partner type',
        timestamp: new Date().toISOString()
      });
    }

    // Validate contract type
    if (!Object.values(CONTRACT_TYPE).includes(contractType)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CONTRACT_TYPE',
        message: 'Invalid contract type',
        timestamp: new Date().toISOString()
      });
    }

    const templatesCollection = await getCollection('contract_templates');
    
    // Generate template key and version
    const templateKey = `${partnerType}-${contractType}-${locale}`;
    const version = 1;
    
    // Check if template already exists
    const existingTemplate = await templatesCollection.findOne({ 
      key: templateKey, active: true 
    });
    
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        error: 'TEMPLATE_EXISTS',
        message: 'Template with this key already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Extract placeholders from DOCX
    const placeholders = extractPlaceholders(req.file.buffer);
    
    // Generate S3 key
    const s3Key = generateTemplateKey(partnerType, contractType, locale, version);
    
    // Upload to S3
    const s3Url = await uploadFile(
      req.file.buffer,
      s3Key,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      {
        templateKey,
        version: version.toString(),
        uploadedBy: req.user.userId
      }
    );

    // Create template record
    const templateId = uuidv4();
    const now = new Date().toISOString();
    
    const newTemplate = {
      _id: templateId,
      key: templateKey,
      name,
      partnerType,
      contractType,
      locale,
      version,
      description,
      placeholders,
      s3KeyDocx: s3Key,
      s3UrlDocx: s3Url,
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: req.user.userId,
      updatedBy: req.user.userId
    };

    await templatesCollection.insertOne(newTemplate);

    res.status(201).json({
      success: true,
      message: 'Template uploaded successfully',
      data: {
        id: templateId,
        key: templateKey,
        placeholders,
        s3Url
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error uploading template:', error);
    res.status(500).json({
      success: false,
      error: 'TEMPLATE_UPLOAD_FAILED',
      message: 'Failed to upload template',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/contract-templates - List templates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      partnerType = '',
      contractType = '',
      locale = '',
      active = ''
    } = req.query;

    const templatesCollection = await getCollection('contract_templates');
    
    // Build query
    const query = {};
    
    if (partnerType && Object.values(PARTNER_TYPE).includes(partnerType)) {
      query.partnerType = partnerType;
    }
    
    if (contractType && Object.values(CONTRACT_TYPE).includes(contractType)) {
      query.contractType = contractType;
    }
    
    if (locale) {
      query.locale = locale;
    }
    
    if (active !== '') {
      query.active = active === 'true';
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const templates = await templatesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await templatesCollection.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        templates,
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
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'TEMPLATES_FETCH_FAILED',
      message: 'Failed to fetch templates',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/contract-templates/:id - Get template details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const templatesCollection = await getCollection('contract_templates');
    
    const template = await templatesCollection.findOne({ _id: id });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      data: template,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'TEMPLATE_FETCH_FAILED',
      message: 'Failed to fetch template',
      timestamp: new Date().toISOString()
    });
  }
});

// PATCH /api/v1/contract-templates/:id - Update template
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;
    
    const templatesCollection = await getCollection('contract_templates');
    
    // Check if template exists
    const existingTemplate = await templatesCollection.findOne({ _id: id });
    
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.userId
    };
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    
    // Update template
    const result = await templatesCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'TEMPLATE_UPDATE_FAILED',
        message: 'Failed to update template',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating template:', error);
    res.status(500).json({
      success: false,
      error: 'TEMPLATE_UPDATE_FAILED',
      message: 'Failed to update template',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/contract-templates/:id/preview - Generate preview
router.post('/:id/preview', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { sampleData } = req.body;
    
    const templatesCollection = await getCollection('contract_templates');
    
    // Get template
    const template = await templatesCollection.findOne({ _id: id });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Use sample data or generate preview data
    const previewData = sampleData || getPreviewData(template.placeholders);
    
    // Generate preview file name
    const previewKey = `contracts/previews/${id}-${Date.now()}.docx`;
    
    // For now, return the template URL with preview data
    // In a full implementation, you would generate a preview file
    const previewUrl = await getSignedUrl(template.s3KeyDocx, 3600);
    
    res.status(200).json({
      success: true,
      data: {
        previewUrl,
        previewData,
        placeholders: template.placeholders
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating preview:', error);
    res.status(500).json({
      success: false,
      error: 'PREVIEW_GENERATION_FAILED',
      message: 'Failed to generate preview',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/contract-templates/:id - Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const templatesCollection = await getCollection('contract_templates');
    
    // Check if template exists
    const existingTemplate = await templatesCollection.findOne({ _id: id });
    
    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Soft delete - set active to false
    const result = await templatesCollection.updateOne(
      { _id: id },
      { 
        $set: { 
          active: false,
          updatedAt: new Date().toISOString(),
          updatedBy: req.user.userId
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'TEMPLATE_DELETE_FAILED',
        message: 'Failed to delete template',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    res.status(500).json({
      success: false,
      error: 'TEMPLATE_DELETE_FAILED',
      message: 'Failed to delete template',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
