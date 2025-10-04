const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/contracts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `contract-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Lead status enum
const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL_SENT: 'proposal_sent',
  CONTRACT_GENERATED: 'contract_generated',
  CONTRACT_SIGNED: 'contract_signed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

// Partner type enum
const PARTNER_TYPE = {
  PARTS_SHOP: 'parts_shop',
  SERVICE_CENTER: 'service_center',
  REPAIR_CENTER: 'repair_center',
  ACCESSORIES_SHOP: 'accessories_shop',
  IMPORTER_MANUFACTURER: 'importer_manufacturer'
};

// GET /api/v1/sales/leads - Get all leads
router.get('/leads', authenticateToken, async (req, res) => {
  try {
    const leadsCollection = await getCollection('leads');
    const leads = await leadsCollection.find({}).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      data: leads,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'LEADS_FETCH_FAILED',
      message: 'Failed to fetch leads',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/sales/leads - Create new lead
router.post('/leads', authenticateToken, async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      city,
      partnerType,
      notes,
      status = LEAD_STATUS.NEW,
      contractType = 'person',
      // Person contract fields
      personName,
      nationalId,
      personAddress,
      // Company contract fields
      companyRegistrationId,
      companyTaxId,
      companyOwnerName
    } = req.body;

    // Validate required fields
    if (!companyName || !contactPerson || !email || !phone || !partnerType) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Company name, contact person, email, phone, and partner type are required',
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

    const leadId = uuidv4();
    const now = new Date().toISOString();

    const newLead = {
      id: leadId,
      companyName,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      address: address || '',
      city: city || '',
      partnerType,
      status,
      notes: notes || '',
      createdAt: now,
      updatedAt: now,
      createdBy: req.user.userId,
      contractGenerated: false,
      contractSigned: false,
      contractApproved: false,
      // Contract type and related fields
      contractType: contractType || 'person',
      // Person contract fields
      personName: personName || '',
      nationalId: nationalId || '',
      personAddress: personAddress || '',
      // Company contract fields
      companyRegistrationId: companyRegistrationId || '',
      companyTaxId: companyTaxId || '',
      companyOwnerName: companyOwnerName || '',
      partnerId: null
    };

    const leadsCollection = await getCollection('leads');
    await leadsCollection.insertOne(newLead);

    // Send notification to sales person
    await sendNotification(req.user.userId, 'LEAD_CREATED', {
      leadId,
      companyName,
      contactPerson
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error creating lead:', error);
    res.status(500).json({
      success: false,
      error: 'LEAD_CREATION_FAILED',
      message: 'Failed to create lead',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/v1/sales/leads/:id/status - Update lead status
router.put('/leads/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(LEAD_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Invalid lead status',
        timestamp: new Date().toISOString()
      });
    }

    const leadsCollection = await getCollection('leads');
    const lead = await leadsCollection.findOne({ id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found',
        timestamp: new Date().toISOString()
      });
    }

    const updatedLead = await leadsCollection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          status, 
          updatedAt: new Date().toISOString() 
        } 
      },
      { returnDocument: 'after' }
    );

    // Convert lead to partner when approved
    if (status === LEAD_STATUS.APPROVED) {
      try {
        const partnersCollection = await getCollection('partners');
        
        // Check if partner already exists
        const existingPartner = await partnersCollection.findOne({ 
          $or: [
            { partnerId: lead.id },
            { 'primaryContact.email': lead.email }
          ]
        });
        
        if (!existingPartner) {
          // Create new partner
          const partnerId = `PARTNER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const now = new Date().toISOString();
          
          const newPartner = {
            partnerId,
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
              country: 'Egypt' // Default, can be made configurable
            }],
            apps: {
              mobile: {
                active: true,
                lastLoginAt: null
              },
              api: {
                keyLastRotatedAt: null
              }
            },
            rating: {
              average: 0,
              count: 0,
              lastUpdatedAt: now
            },
            notes: [],
            audit: [{
              action: 'created_from_lead',
              leadId: lead.id,
              performedBy: req.user.userId,
              performedAt: now
            }],
            createdAt: now,
            updatedAt: now
          };
          
          await partnersCollection.insertOne(newPartner);
          
          // Update lead with partnerId
          await leadsCollection.updateOne(
            { id },
            { $set: { partnerId } }
          );
          
          console.log(`✅ Partner created from lead ${id}: ${partnerId}`);
        }
      } catch (partnerError) {
        console.error('❌ Error creating partner from lead:', partnerError);
        // Don't fail the lead update, just log the error
      }
    }

    // Send notification to sales person about status change
    await sendNotification(lead.createdBy, 'LEAD_STATUS_UPDATED', {
      leadId: id,
      companyName: lead.companyName,
      oldStatus: lead.status,
      newStatus: status
    });

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: updatedLead.value,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating lead status:', error);
    res.status(500).json({
      success: false,
      error: 'LEAD_STATUS_UPDATE_FAILED',
      message: 'Failed to update lead status',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/sales/leads/:id/contract - Generate contract
router.post('/leads/:id/contract', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const leadsCollection = await getCollection('leads');
    const lead = await leadsCollection.findOne({ id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found',
        timestamp: new Date().toISOString()
      });
    }

    // Generate contract PDF
    const contractPdf = await generateContractPDF(lead);

    // Update lead status
    await leadsCollection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          status: LEAD_STATUS.CONTRACT_GENERATED,
          contractGenerated: true,
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    // Send notification to sales person
    await sendNotification(lead.createdBy, 'CONTRACT_GENERATED', {
      leadId: id,
      companyName: lead.companyName
    });

    res.status(200).json({
      success: true,
      message: 'Contract generated successfully',
      data: {
        contract: contractPdf.toString('base64')
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

// POST /api/v1/sales/leads/:id/contract/upload - Upload signed contract
router.post('/leads/:id/contract/upload', authenticateToken, upload.single('contract'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'NO_FILE_UPLOADED',
        message: 'No contract file uploaded',
        timestamp: new Date().toISOString()
      });
    }

    const leadsCollection = await getCollection('leads');
    const lead = await leadsCollection.findOne({ id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found',
        timestamp: new Date().toISOString()
      });
    }

    // Update lead with contract file info
    await leadsCollection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          status: LEAD_STATUS.CONTRACT_SIGNED,
          contractSigned: true,
          contractFilePath: req.file.path,
          contractFileName: req.file.filename,
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    // Send notification to legal and executive teams
    await sendNotificationToLegalAndExecutive('CONTRACT_UPLOADED', {
      leadId: id,
      companyName: lead.companyName,
      contractFileName: req.file.filename
    });

    res.status(200).json({
      success: true,
      message: 'Contract uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error uploading contract:', error);
    res.status(500).json({
      success: false,
      error: 'CONTRACT_UPLOAD_FAILED',
      message: 'Failed to upload contract',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/sales/leads/:id/approve - Approve contract
router.post('/leads/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true for approve, false for reject

    const leadsCollection = await getCollection('leads');
    const lead = await leadsCollection.findOne({ id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'LEAD_NOT_FOUND',
        message: 'Lead not found',
        timestamp: new Date().toISOString()
      });
    }

    const newStatus = approved ? LEAD_STATUS.APPROVED : LEAD_STATUS.REJECTED;
    
    await leadsCollection.findOneAndUpdate(
      { id },
      { 
        $set: { 
          status: newStatus,
          contractApproved: approved,
          approvedBy: req.user.userId,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString() 
        } 
      }
    );

    if (approved) {
      // Create partner in database
      const partnerId = await createPartner(lead);
      
      // Update lead with partner ID
      await leadsCollection.findOneAndUpdate(
        { id },
        { 
          $set: { 
            partnerId,
            status: LEAD_STATUS.COMPLETED,
            updatedAt: new Date().toISOString() 
          } 
        }
      );

      // Send notification to sales person
      await sendNotification(lead.createdBy, 'CONTRACT_APPROVED', {
        leadId: id,
        companyName: lead.companyName,
        partnerId
      });
    } else {
      // Send notification to sales person about rejection
      await sendNotification(lead.createdBy, 'CONTRACT_REJECTED', {
        leadId: id,
        companyName: lead.companyName
      });
    }

    res.status(200).json({
      success: true,
      message: approved ? 'Contract approved successfully' : 'Contract rejected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error approving contract:', error);
    res.status(500).json({
      success: false,
      error: 'CONTRACT_APPROVAL_FAILED',
      message: 'Failed to process contract approval',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to generate contract PDF
async function generateContractPDF(lead) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Contract header
    doc.fontSize(20).text('PARTNERSHIP AGREEMENT', { align: 'center' });
    doc.moveDown(2);

    // Company information
    doc.fontSize(14).text('Company Details:', { underline: true });
    doc.fontSize(12);
    doc.text(`Company Name: ${lead.companyName}`);
    doc.text(`Contact Person: ${lead.contactPerson}`);
    doc.text(`Email: ${lead.email}`);
    doc.text(`Phone: ${lead.phone}`);
    doc.text(`Address: ${lead.address}, ${lead.city}`);
    doc.text(`Partner Type: ${lead.partnerType.replace('_', ' ').toUpperCase()}`);
    doc.moveDown();

    // Contract terms
    doc.fontSize(14).text('Terms and Conditions:', { underline: true });
    doc.fontSize(12);
    doc.text('1. This agreement establishes a partnership between Clutch and the above-mentioned company.');
    doc.text('2. The partner agrees to maintain high standards of service and customer satisfaction.');
    doc.text('3. Both parties agree to comply with all applicable laws and regulations.');
    doc.text('4. This agreement is valid for a period of one year from the date of signing.');
    doc.text('5. Either party may terminate this agreement with 30 days written notice.');
    doc.moveDown();

    // Signature section
    doc.fontSize(14).text('Signatures:', { underline: true });
    doc.moveDown();
    doc.text('Partner Signature: _________________________ Date: ___________');
    doc.moveDown();
    doc.text('Clutch Representative: _________________________ Date: ___________');

    doc.end();
  });
}

// Helper function to create partner in database
async function createPartner(lead) {
  try {
    const partnersCollection = await getCollection('partners');
    const partnerId = uuidv4();
    
    const partner = {
      id: partnerId,
      companyName: lead.companyName,
      contactPerson: lead.contactPerson,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.city,
      partnerType: lead.partnerType,
      status: 'active',
      createdAt: new Date().toISOString(),
      contractFilePath: lead.contractFilePath,
      contractFileName: lead.contractFileName
    };

    await partnersCollection.insertOne(partner);
    return partnerId;
  } catch (error) {
    console.error('❌ Error creating partner:', error);
    throw error;
  }
}

// Helper function to send notification
async function sendNotification(userId, type, data) {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    const notification = {
      id: uuidv4(),
      userId,
      type,
      data,
      read: false,
      createdAt: new Date().toISOString()
    };

    await notificationsCollection.insertOne(notification);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}

// Helper function to send notification to legal and executive teams
async function sendNotificationToLegalAndExecutive(type, data) {
  try {
    const notificationsCollection = await getCollection('notifications');
    const usersCollection = await getCollection('users');
    
    // Get legal and executive team members
    const legalAndExecutiveUsers = await usersCollection.find({
      role: { $in: ['legal_team', 'executive', 'head_administrator'] }
    }).toArray();

    const notifications = legalAndExecutiveUsers.map(user => ({
      id: uuidv4(),
      userId: user._id,
      type,
      data,
      read: false,
      createdAt: new Date().toISOString()
    }));

    if (notifications.length > 0) {
      await notificationsCollection.insertMany(notifications);
    }
  } catch (error) {
    console.error('❌ Error sending notification to legal/executive:', error);
  }
}

module.exports = router;