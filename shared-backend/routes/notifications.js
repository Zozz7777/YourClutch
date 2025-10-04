const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Notification types
const NOTIFICATION_TYPES = {
  CONTRACT_SIGNED: 'contract_signed',
  CONTRACT_APPROVED: 'contract_approved',
  CONTRACT_DECLINED: 'contract_declined',
  PARTNER_CREATED: 'partner_created',
  LEAD_STATUS_CHANGE: 'lead_status_change'
};

// GET /api/v1/notifications - Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, unread } = req.query;
    const skip = (page - 1) * limit;

    const notificationsCollection = await getCollection('notifications');
    
    // Build query
    const query = { userId: req.user.userId };
    
    if (type) {
      query.type = type;
    }
    
    if (unread === 'true') {
      query.read = false;
    }

    // Get notifications
    const notifications = await notificationsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get unread count
    const unreadCount = await notificationsCollection.countDocuments({
      userId: req.user.userId,
      read: false
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: notifications.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'NOTIFICATIONS_FETCH_FAILED',
      message: 'Failed to fetch notifications',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/notifications/:id/read - Mark notification as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationsCollection = await getCollection('notifications');

    const result = await notificationsCollection.updateOne(
      { 
        _id: id, 
        userId: req.user.userId 
      },
      { 
        $set: { 
          read: true, 
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'NOTIFICATION_UPDATE_FAILED',
      message: 'Failed to mark notification as read',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/notifications/read-all - Mark all notifications as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    const notificationsCollection = await getCollection('notifications');

    const result = await notificationsCollection.updateMany(
      { 
        userId: req.user.userId,
        read: false
      },
      { 
        $set: { 
          read: true, 
          readAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'NOTIFICATIONS_UPDATE_FAILED',
      message: 'Failed to mark all notifications as read',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationsCollection = await getCollection('notifications');

    const result = await notificationsCollection.deleteOne({
      _id: id,
      userId: req.user.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'NOTIFICATION_DELETE_FAILED',
      message: 'Failed to delete notification',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to create notification
async function createNotification({
  userId,
  type,
  title,
  message,
  data = {},
  actionUrl,
  actionText
}) {
  try {
    const notificationsCollection = await getCollection('notifications');
    
    const notification = {
      _id: uuidv4(),
      userId,
      type,
      title,
      message,
      data,
      actionUrl,
      actionText,
      read: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await notificationsCollection.insertOne(notification);
    console.log(`✅ Notification created: ${type} for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

// Helper function to create contract signed notification
async function createContractSignedNotification(contract, salesPersonId) {
  return await createNotification({
    userId: salesPersonId,
    type: NOTIFICATION_TYPES.CONTRACT_SIGNED,
    title: 'Contract Signed',
    message: `Contract ${contract._id} has been signed and is ready for review.`,
    data: {
      contractId: contract._id,
      leadId: contract.leadId,
      partnerType: contract.partnerType,
      contractType: contract.contractType
    },
    actionUrl: '/legal',
    actionText: 'Review Contract'
  });
}

// Helper function to create contract decision notification
async function createContractDecisionNotification(contract, decision, salesPersonId, reason = '') {
  const isApproved = decision === 'approved';
  
  return await createNotification({
    userId: salesPersonId,
    type: isApproved ? NOTIFICATION_TYPES.CONTRACT_APPROVED : NOTIFICATION_TYPES.CONTRACT_DECLINED,
    title: isApproved ? 'Contract Approved' : 'Contract Declined',
    message: isApproved 
      ? `Contract ${contract._id} has been approved and partner created.`
      : `Contract ${contract._id} has been declined. ${reason ? `Reason: ${reason}` : ''}`,
    data: {
      contractId: contract._id,
      leadId: contract.leadId,
      partnerType: contract.partnerType,
      contractType: contract.contractType,
      decision,
      reason
    },
    actionUrl: isApproved ? '/partners' : '/sales',
    actionText: isApproved ? 'View Partner' : 'View Lead'
  });
}

// Helper function to create partner created notification
async function createPartnerCreatedNotification(partner, salesPersonId) {
  return await createNotification({
    userId: salesPersonId,
    type: NOTIFICATION_TYPES.PARTNER_CREATED,
    title: 'New Partner Created',
    message: `New partner ${partner.partnerId} has been created and is ready to use our services.`,
    data: {
      partnerId: partner.partnerId,
      name: partner.name,
      type: partner.type,
      status: partner.status
    },
    actionUrl: '/partners',
    actionText: 'View Partner'
  });
}

// Helper function to create lead status change notification
async function createLeadStatusChangeNotification(lead, oldStatus, newStatus, salesPersonId) {
  return await createNotification({
    userId: salesPersonId,
    type: NOTIFICATION_TYPES.LEAD_STATUS_CHANGE,
    title: 'Lead Status Updated',
    message: `Lead ${lead.id} status changed from ${oldStatus} to ${newStatus}.`,
    data: {
      leadId: lead.id,
      companyName: lead.companyName,
      oldStatus,
      newStatus,
      partnerType: lead.partnerType
    },
    actionUrl: '/sales',
    actionText: 'View Lead'
  });
}

module.exports = {
  router,
  createNotification,
  createContractSignedNotification,
  createContractDecisionNotification,
  createPartnerCreatedNotification,
  createLeadStatusChangeNotification,
  NOTIFICATION_TYPES
};