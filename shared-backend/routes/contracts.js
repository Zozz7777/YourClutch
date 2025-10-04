const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { uploadFile, getSignedUrl, generateContractKey, generateSignedContractKey, downloadFile } = require('../lib/storage');
const { mergeTemplate, validateContractFields, prepareTemplateData, convertToPDF } = require('../lib/docx');
const { notifyLegalTeamSignedContract, notifySalesPersonContractDecision, notifyNewPartnerCreated } = require('../lib/notifications');
const { createContractSignedNotification, createContractDecisionNotification, createPartnerCreatedNotification } = require('./notifications');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Contract status enum
const CONTRACT_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  SIGNED: 'signed',
  APPROVED: 'approved',
  DECLINED: 'declined'
};

// POST /api/v1/contracts/generate - Generate contract from template
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { leadId, templateId } = req.body;
    
    if (!leadId || !templateId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Lead ID and template ID are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const leadsCollection = await getCollection('leads');
    const templatesCollection = await getCollection('contract_templates');
    const contractsCollection = await getCollection('contracts');
    
    // Get lead data
    const lead = await leadsCollection.findOne({ id: leadId });
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get template
    const template = await templatesCollection.findOne({ _id: templateId, active: true });
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found or inactive',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate contract fields
    const validation = validateContractFields(lead, template.contractType);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CONTRACT_DATA',
        message: 'Contract data validation failed',
        details: validation.errors,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if contract already exists
    const existingContract = await contractsCollection.findOne({ leadId });
    if (existingContract) {
      return res.status(400).json({
        success: false,
        error: 'CONTRACT_EXISTS',
        message: 'Contract already exists for this lead',
        timestamp: new Date().toISOString()
      });
    }
    
    // Download template from S3
    const templateBuffer = await downloadFile(template.s3KeyDocx);
    
    // Prepare data for template
    const templateData = prepareTemplateData(lead, template.contractType);
    
    // Merge template with data
    const mergedBuffer = mergeTemplate(templateBuffer, templateData);
    
    // Generate contract ID
    const contractId = uuidv4();
    const now = new Date().toISOString();
    
    // Upload generated DOCX to S3
    const docxKey = generateContractKey(contractId, 'docx');
    const docxUrl = await uploadFile(
      mergedBuffer,
      docxKey,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      {
        contractId,
        leadId,
        templateId,
        generatedBy: req.user.userId
      }
    );
    
    // Optional: Convert to PDF
    let pdfUrl = null;
    try {
      const pdfBuffer = await convertToPDF(mergedBuffer);
      const pdfKey = generateContractKey(contractId, 'pdf');
      pdfUrl = await uploadFile(
        pdfBuffer,
        pdfKey,
        'application/pdf',
        {
          contractId,
          leadId,
          templateId,
          generatedBy: req.user.userId
        }
      );
    } catch (pdfError) {
      console.warn('⚠️ PDF conversion failed:', pdfError.message);
    }
    
    // Create contract record
    const newContract = {
      _id: contractId,
      leadId,
      partnerId: null,
      partnerType: lead.partnerType,
      contractType: template.contractType,
      status: CONTRACT_STATUS.GENERATED,
      templateId,
      templateKey: template.key,
      generatedDocxUrl: docxUrl,
      generatedPdfUrl: pdfUrl,
      signedPdfUrl: null,
      notes: [],
      audit: [{
        action: 'generated',
        performedBy: req.user.userId,
        performedAt: now,
        details: {
          templateId,
          templateKey: template.key
        }
      }],
      createdAt: now,
      updatedAt: now
    };
    
    await contractsCollection.insertOne(newContract);
    
    res.status(201).json({
      success: true,
      message: 'Contract generated successfully',
      data: {
        contractId,
        docxUrl,
        pdfUrl,
        status: CONTRACT_STATUS.GENERATED
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating contract:', error);
    res.status(500).json({
      success: false,
      error: 'CONTRACT_GENERATION_FAILED',
      message: 'Failed to generate contract',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/contracts/:id/upload-signed - Upload signed contract
router.post('/:id/upload-signed', authenticateToken, upload.single('signedContract'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FILE',
        message: 'Signed contract file is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const contractsCollection = await getCollection('contracts');
    
    // Get contract
    const contract = await contractsCollection.findOne({ _id: id });
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found',
        timestamp: new Date().toISOString()
      });
    }
    
    if (contract.status !== CONTRACT_STATUS.GENERATED) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CONTRACT_STATUS',
        message: 'Contract must be in generated status to upload signed version',
        timestamp: new Date().toISOString()
      });
    }
    
    // Upload signed PDF to S3
    const signedKey = generateSignedContractKey(id);
    const signedUrl = await uploadFile(
      req.file.buffer,
      signedKey,
      'application/pdf',
      {
        contractId: id,
        uploadedBy: req.user.userId,
        uploadedAt: new Date().toISOString()
      }
    );
    
    // Update contract
    const now = new Date().toISOString();
    const result = await contractsCollection.updateOne(
      { _id: id },
      {
        $set: {
          status: CONTRACT_STATUS.SIGNED,
          signedPdfUrl: signedUrl,
          updatedAt: now
        },
        $push: {
          audit: {
            action: 'signed_uploaded',
            performedBy: req.user.userId,
            performedAt: now,
            details: {
              notes: notes || '',
              fileSize: req.file.size
            }
          }
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'CONTRACT_UPDATE_FAILED',
        message: 'Failed to update contract',
        timestamp: new Date().toISOString()
      });
    }
    
    // Send email notification to legal/executive team
    try {
      await notifyLegalTeamSignedContract(contract, req.user.email || 'sales@yourclutch.com');
      console.log(`📧 Email notification sent: Contract ${id} signed and ready for review`);
    } catch (notificationError) {
      console.error('❌ Failed to send email notification:', notificationError);
      // Don't fail the contract update if notification fails
    }

    // Create in-app notification for legal team
    try {
      await createContractSignedNotification(contract, req.user.userId);
      console.log(`🔔 In-app notification created: Contract ${id} signed`);
    } catch (notificationError) {
      console.error('❌ Failed to create in-app notification:', notificationError);
      // Don't fail the contract update if notification fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Signed contract uploaded successfully',
      data: {
        contractId: id,
        signedUrl,
        status: CONTRACT_STATUS.SIGNED
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error uploading signed contract:', error);
    res.status(500).json({
      success: false,
      error: 'SIGNED_UPLOAD_FAILED',
      message: 'Failed to upload signed contract',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/contracts/:id/approve - Approve contract
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const contractsCollection = await getCollection('contracts');
    const leadsCollection = await getCollection('leads');
    const partnersCollection = await getCollection('partners');
    
    // Get contract
    const contract = await contractsCollection.findOne({ _id: id });
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found',
        timestamp: new Date().toISOString()
      });
    }
    
    if (contract.status !== CONTRACT_STATUS.SIGNED) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CONTRACT_STATUS',
        message: 'Contract must be signed to approve',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get lead
    const lead = await leadsCollection.findOne({ id: contract.leadId });
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Associated lead not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Create partner if not exists
    let partnerId = contract.partnerId;
    if (!partnerId) {
      const newPartnerId = `PARTNER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const newPartner = {
        partnerId: newPartnerId,
        name: lead.companyName,
        type: lead.partnerType,
        status: 'active',
        primaryContact: {
          name: lead.contactPerson,
          email: lead.email,
          phone: lead.phone
        },
        addresses: [{
          line1: lead.address,
          city: lead.city,
          country: 'Egypt'
        }],
        apps: {
          mobile: {
            active: true,
            lastLoginAt: null
          }
        },
        rating: {
          average: 0,
          count: 0,
          lastUpdatedAt: now
        },
        notes: [],
        audit: [{
          action: 'created_from_contract',
          contractId: id,
          performedBy: req.user.userId,
          performedAt: now
        }],
        createdAt: now,
        updatedAt: now
      };
      
      await partnersCollection.insertOne(newPartner);
      partnerId = newPartnerId;
    }
    
    // Update contract
    const now = new Date().toISOString();
    const result = await contractsCollection.updateOne(
      { _id: id },
      {
        $set: {
          status: CONTRACT_STATUS.APPROVED,
          partnerId,
          updatedAt: now
        },
        $push: {
          audit: {
            action: 'approved',
            performedBy: req.user.userId,
            performedAt: now,
            details: {
              notes: notes || '',
              partnerId
            }
          }
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'CONTRACT_UPDATE_FAILED',
        message: 'Failed to approve contract',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update lead status
    await leadsCollection.updateOne(
      { id: contract.leadId },
      { 
        $set: { 
          status: 'approved',
          partnerId,
          updatedAt: now
        } 
      }
    );
    
    // Send email notifications
    try {
      await notifySalesPersonContractDecision(contract, 'approved');
      await notifyNewPartnerCreated(newPartner, req.user.email || 'sales@yourclutch.com');
      console.log(`📧 Email notifications sent: Contract ${id} approved, partner ${partnerId} created`);
    } catch (notificationError) {
      console.error('❌ Failed to send email notifications:', notificationError);
      // Don't fail the contract approval if notifications fail
    }

    // Create in-app notifications
    try {
      await createContractDecisionNotification(contract, 'approved', contract.createdBy);
      await createPartnerCreatedNotification(newPartner, contract.createdBy);
      console.log(`🔔 In-app notifications created: Contract ${id} approved, partner ${partnerId} created`);
    } catch (notificationError) {
      console.error('❌ Failed to create in-app notifications:', notificationError);
      // Don't fail the contract approval if notifications fail
    }
    
    res.status(200).json({
      success: true,
      message: 'Contract approved successfully',
      data: {
        contractId: id,
        partnerId,
        status: CONTRACT_STATUS.APPROVED
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error approving contract:', error);
    res.status(500).json({
      success: false,
      error: 'CONTRACT_APPROVAL_FAILED',
      message: 'Failed to approve contract',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/contracts/:id/decline - Decline contract
router.post('/:id/decline', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REASON',
        message: 'Decline reason is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const contractsCollection = await getCollection('contracts');
    
    // Get contract
    const contract = await contractsCollection.findOne({ _id: id });
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found',
        timestamp: new Date().toISOString()
      });
    }
    
    if (contract.status !== CONTRACT_STATUS.SIGNED) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CONTRACT_STATUS',
        message: 'Contract must be signed to decline',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update contract
    const now = new Date().toISOString();
    const result = await contractsCollection.updateOne(
      { _id: id },
      {
        $set: {
          status: CONTRACT_STATUS.DECLINED,
          updatedAt: now
        },
        $push: {
          audit: {
            action: 'declined',
            performedBy: req.user.userId,
            performedAt: now,
            details: {
              reason,
              notes: notes || ''
            }
          }
        }
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'CONTRACT_UPDATE_FAILED',
        message: 'Failed to decline contract',
        timestamp: new Date().toISOString()
      });
    }
    
    // Send email notification to sales person
    try {
      await notifySalesPersonContractDecision(contract, 'declined', reason);
      console.log(`📧 Email notification sent: Contract ${id} declined: ${reason}`);
    } catch (notificationError) {
      console.error('❌ Failed to send email notification:', notificationError);
      // Don't fail the contract decline if notification fails
    }

    // Create in-app notification
    try {
      await createContractDecisionNotification(contract, 'declined', contract.createdBy, reason);
      console.log(`🔔 In-app notification created: Contract ${id} declined`);
    } catch (notificationError) {
      console.error('❌ Failed to create in-app notification:', notificationError);
      // Don't fail the contract decline if notification fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Contract declined successfully',
      data: {
        contractId: id,
        status: CONTRACT_STATUS.DECLINED,
        reason
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error declining contract:', error);
    res.status(500).json({
      success: false,
      error: 'CONTRACT_DECLINE_FAILED',
      message: 'Failed to decline contract',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/contracts - List contracts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      partnerType = '',
      contractType = '',
      search = ''
    } = req.query;
    
    const contractsCollection = await getCollection('contracts');
    
    // Build query
    const query = {};
    
    if (status && Object.values(CONTRACT_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (partnerType) {
      query.partnerType = partnerType;
    }
    
    if (contractType) {
      query.contractType = contractType;
    }
    
    if (search) {
      query.$or = [
        { leadId: { $regex: search, $options: 'i' } },
        { partnerId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const contracts = await contractsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await contractsCollection.countDocuments(query);
    
    res.status(200).json({
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
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching contracts:', error);
    res.status(500).json({
      success: false,
      error: 'CONTRACTS_FETCH_FAILED',
      message: 'Failed to fetch contracts',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/contracts/:id - Get contract details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const contractsCollection = await getCollection('contracts');
    
    const contract = await contractsCollection.findOne({ _id: id });
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'CONTRACT_NOT_FOUND',
        message: 'Contract not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Generate signed URLs for file access
    const signedUrls = {};
    if (contract.generatedDocxUrl) {
      signedUrls.generatedDocx = await getSignedUrl(contract.generatedDocxUrl, 3600);
    }
    if (contract.generatedPdfUrl) {
      signedUrls.generatedPdf = await getSignedUrl(contract.generatedPdfUrl, 3600);
    }
    if (contract.signedPdfUrl) {
      signedUrls.signedPdf = await getSignedUrl(contract.signedPdfUrl, 3600);
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...contract,
        signedUrls
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching contract:', error);
    res.status(500).json({
      success: false,
      error: 'CONTRACT_FETCH_FAILED',
      message: 'Failed to fetch contract',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
