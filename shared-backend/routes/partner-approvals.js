const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const PartnerUserApproval = require('../models/PartnerUserApproval');
const PartnerUser = require('../models/PartnerUser');
const logger = require('../config/logger');

const router = express.Router();

// ============================================================================
// PARTNER USER APPROVAL ENDPOINTS
// ============================================================================

// GET /api/v1/partner-approvals/pending - Get pending approval requests for partner owner
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const partnerId = req.user.partnerId;
    
    if (!partnerId) {
      return res.status(400).json({
        success: false,
        message: 'Partner ID not found in token'
      });
    }

    // Check if user is partner owner
    const currentUser = await PartnerUser.findOne({ 
      partnerId, 
      email: req.user.email 
    });

    if (!currentUser || currentUser.role !== 'partner_owner') {
      return res.status(403).json({
        success: false,
        message: 'Only partner owners can view approval requests'
      });
    }

    const pendingRequests = await PartnerUserApproval.findPendingForPartner(partnerId);

    res.status(200).json({
      success: true,
      data: pendingRequests,
      message: 'Pending approval requests retrieved successfully'
    });

  } catch (error) {
    logger.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approval requests'
    });
  }
});

// GET /api/v1/partner-approvals/my-requests - Get user's own approval requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const myRequests = await PartnerUserApproval.findByRequester(email);

    res.status(200).json({
      success: true,
      data: myRequests,
      message: 'Your approval requests retrieved successfully'
    });

  } catch (error) {
    logger.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your approval requests'
    });
  }
});

// POST /api/v1/partner-approvals/:id/approve - Approve a user request
router.post('/:id/approve', authenticateToken, [
  body('approvedRole').optional().isIn(['partner_owner', 'partner_manager', 'partner_employee']),
  body('approvedPermissions').optional().isArray(),
  body('notes').optional().isString()
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

    const { id } = req.params;
    const { approvedRole, approvedPermissions, notes } = req.body;
    const partnerId = req.user.partnerId;

    // Check if user is partner owner
    const currentUser = await PartnerUser.findOne({ 
      partnerId, 
      email: req.user.email 
    });

    if (!currentUser || currentUser.role !== 'partner_owner') {
      return res.status(403).json({
        success: false,
        message: 'Only partner owners can approve requests'
      });
    }

    // Find the approval request
    const approvalRequest = await PartnerUserApproval.findById(id);
    
    if (!approvalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    if (approvalRequest.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve requests for your own partner'
      });
    }

    if (approvalRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Approve the request
    await approvalRequest.approve(currentUser._id, approvedRole, approvedPermissions, notes);

    // Create the new partner user account
    const newPartnerUser = new PartnerUser({
      partnerId: approvalRequest.partnerId,
      email: approvalRequest.requesterEmail,
      phone: approvalRequest.requesterPhone,
      password: 'temp_password', // Will need to be set by user on first login
      businessName: currentUser.businessName,
      ownerName: approvalRequest.requesterName,
      partnerType: currentUser.partnerType,
      role: approvedRole || approvalRequest.requestedRole,
      businessAddress: currentUser.businessAddress,
      workingHours: currentUser.workingHours,
      businessSettings: currentUser.businessSettings,
      status: 'active',
      isVerified: false,
      isLocked: false,
      loginAttempts: 0,
      lastLogin: null,
      appPreferences: {
        language: 'ar',
        theme: 'light',
        notifications: {
          orders: true,
          payments: true,
          updates: true
        }
      }
    });

    await newPartnerUser.save();

    // Send notification to requester
    await approvalRequest.sendRequesterNotification();

    res.status(200).json({
      success: true,
      message: 'User request approved successfully',
      data: {
        approvalId: approvalRequest._id,
        newUserId: newPartnerUser._id,
        role: newPartnerUser.role,
        status: 'approved'
      }
    });

  } catch (error) {
    logger.error('Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request'
    });
  }
});

// POST /api/v1/partner-approvals/:id/reject - Reject a user request
router.post('/:id/reject', authenticateToken, [
  body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
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

    const { id } = req.params;
    const { rejectionReason } = req.body;
    const partnerId = req.user.partnerId;

    // Check if user is partner owner
    const currentUser = await PartnerUser.findOne({ 
      partnerId, 
      email: req.user.email 
    });

    if (!currentUser || currentUser.role !== 'partner_owner') {
      return res.status(403).json({
        success: false,
        message: 'Only partner owners can reject requests'
      });
    }

    // Find the approval request
    const approvalRequest = await PartnerUserApproval.findById(id);
    
    if (!approvalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    if (approvalRequest.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests for your own partner'
      });
    }

    if (approvalRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Reject the request
    await approvalRequest.reject(currentUser._id, rejectionReason);

    // Send notification to requester
    await approvalRequest.sendRequesterNotification();

    res.status(200).json({
      success: true,
      message: 'User request rejected',
      data: {
        approvalId: approvalRequest._id,
        status: 'rejected',
        rejectionReason
      }
    });

  } catch (error) {
    logger.error('Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request'
    });
  }
});

// GET /api/v1/partner-approvals/:id - Get specific approval request details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.user.partnerId;

    const approvalRequest = await PartnerUserApproval.findById(id);
    
    if (!approvalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Check if user has access to this request
    const currentUser = await PartnerUser.findOne({ 
      partnerId, 
      email: req.user.email 
    });

    if (!currentUser) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Allow access if user is owner of the partner or the requester
    if (approvalRequest.partnerId !== partnerId && approvalRequest.requesterEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: approvalRequest,
      message: 'Approval request details retrieved successfully'
    });

  } catch (error) {
    logger.error('Error fetching approval request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approval request'
    });
  }
});

module.exports = router;
