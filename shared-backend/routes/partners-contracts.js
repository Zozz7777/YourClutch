const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Contract Status
const CONTRACT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  TERMINATED: 'terminated'
};

// Contract Types
const CONTRACT_TYPES = {
  SERVICE_AGREEMENT: 'service_agreement',
  SUPPLY_AGREEMENT: 'supply_agreement',
  PARTNERSHIP: 'partnership',
  DISTRIBUTION: 'distribution',
  MAINTENANCE: 'maintenance',
  WARRANTY: 'warranty'
};

// Configure multer for contract uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/contracts');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `contract-${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

// Upload contract
router.post('/contracts/upload', [
  auth,
  upload.single('contractFile'),
  body('title').notEmpty().withMessage('Contract title is required'),
  body('type').isIn(Object.values(CONTRACT_TYPES)).withMessage('Invalid contract type'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('startDate').isISO8601().withMessage('Start date must be valid ISO date'),
  body('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  body('terms').optional().isString().withMessage('Terms must be a string'),
  body('value').optional().isNumeric().withMessage('Value must be numeric')
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Contract file is required'
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
      title,
      type,
      description,
      startDate,
      endDate,
      terms,
      value
    } = req.body;

    const contract = {
      partnerId: partner.partnerId,
      title,
      type,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      terms,
      value: value ? parseFloat(value) : null,
      status: CONTRACT_STATUS.PENDING,
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // E-signature fields
      signature: {
        required: false,
        signed: false,
        signedAt: null,
        signatureData: null
      },
      // Review fields
      review: {
        reviewedBy: null,
        reviewedAt: null,
        comments: null,
        rejectionReason: null
      }
    };

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    const result = await contractsCollection.insertOne(contract);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...contract
      },
      message: 'Contract uploaded successfully'
    });
  } catch (error) {
    logger.error('Error uploading contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload contract',
      error: error.message
    });
  }
});

// Get contracts
router.get('/contracts', auth, async (req, res) => {
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
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(CONTRACT_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (type && Object.values(CONTRACT_TYPES).includes(type)) {
      query.type = type;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    
    const contracts = await contractsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await contractsCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        contracts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Contracts retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contracts',
      error: error.message
    });
  }
});

// Get contract by ID
router.get('/contracts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    
    const contract = await contractsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    res.json({
      success: true,
      data: contract,
      message: 'Contract retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contract',
      error: error.message
    });
  }
});

// Download contract file
router.get('/contracts/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    
    const contract = await contractsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(contract.filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Contract file not found'
      });
    }

    res.download(contract.filePath, contract.fileName);
  } catch (error) {
    logger.error('Error downloading contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download contract',
      error: error.message
    });
  }
});

// E-signature for contract
router.post('/contracts/:id/sign', [
  auth,
  body('signatureData').notEmpty().withMessage('Signature data is required'),
  body('signatureType').isIn(['draw', 'upload']).withMessage('Invalid signature type')
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

    const { id } = req.params;
    const { signatureData, signatureType } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    
    const contract = await contractsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    if (contract.status !== CONTRACT_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'Contract must be approved before signing'
      });
    }

    if (contract.signature.signed) {
      return res.status(400).json({
        success: false,
        message: 'Contract already signed'
      });
    }

    const updateData = {
      'signature.signed': true,
      'signature.signedAt': new Date(),
      'signature.signatureData': signatureData,
      'signature.signatureType': signatureType,
      updatedAt: new Date()
    };

    await contractsCollection.updateOne(
      { _id: id, partnerId: partner.partnerId },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Contract signed successfully'
    });
  } catch (error) {
    logger.error('Error signing contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign contract',
      error: error.message
    });
  }
});

// Update contract
router.patch('/contracts/:id', [
  auth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('terms').optional().isString().withMessage('Terms must be a string'),
  body('value').optional().isNumeric().withMessage('Value must be numeric')
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

    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    
    const result = await contractsCollection.updateOne(
      { _id: id, partnerId: partner.partnerId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    res.json({
      success: true,
      message: 'Contract updated successfully'
    });
  } catch (error) {
    logger.error('Error updating contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contract',
      error: error.message
    });
  }
});

// Delete contract
router.delete('/contracts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    
    const contract = await contractsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(contract.filePath);
    } catch (error) {
      logger.warn('Could not delete contract file:', error.message);
    }

    const result = await contractsCollection.deleteOne({
      _id: id,
      partnerId: partner.partnerId
    });

    res.json({
      success: true,
      message: 'Contract deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting contract:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contract',
      error: error.message
    });
  }
});

// Get contract status summary
router.get('/contracts/status/summary', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const contractsCollection = await getCollection('partnerContracts');
    
    const summary = await contractsCollection.aggregate([
      {
        $match: { partnerId: partner.partnerId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const statusSummary = {};
    Object.values(CONTRACT_STATUS).forEach(status => {
      statusSummary[status] = 0;
    });

    summary.forEach(item => {
      statusSummary[item._id] = item.count;
    });

    res.json({
      success: true,
      data: statusSummary,
      message: 'Contract status summary retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching contract status summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contract status summary',
      error: error.message
    });
  }
});

module.exports = router;
