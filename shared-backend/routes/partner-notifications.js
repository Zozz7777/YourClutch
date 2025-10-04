const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// @route   GET /api/v1/partners/notifications
// @desc    Get partner notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { type, limit = 20, offset = 0 } = req.query;
    
    console.log('🔔 Notifications request:', { partnerId, type, limit, offset });
    
    const { getCollection } = require('../config/database');
    const notificationsCollection = await getCollection('notifications');
    
    let query = { partnerId };
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const notifications = await notificationsCollection.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();
    
    const totalCount = await notificationsCollection.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        notifications,
        totalCount,
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });
    
  } catch (error) {
    logger.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/notifications/mark-read
// @desc    Mark notifications as read
// @access  Private
router.post('/mark-read', [
  body('notificationIds').isArray().withMessage('Notification IDs must be an array')
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
    
    const { partnerId } = req.user;
    const { notificationIds } = req.body;
    
    console.log('✅ Mark notifications as read:', { partnerId, notificationIds });
    
    const { getCollection } = require('../config/database');
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateMany(
      { 
        _id: { $in: notificationIds },
        partnerId 
      },
      { 
        $set: { 
          isRead: true,
          readAt: new Date()
        } 
      }
    );
    
    res.json({
      success: true,
      message: 'Notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
    
  } catch (error) {
    logger.error('Mark notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.post('/mark-all-read', async (req, res) => {
  try {
    const { partnerId } = req.user;
    
    console.log('✅ Mark all notifications as read:', { partnerId });
    
    const { getCollection } = require('../config/database');
    const notificationsCollection = await getCollection('notifications');
    
    const result = await notificationsCollection.updateMany(
      { 
        partnerId,
        isRead: false
      },
      { 
        $set: { 
          isRead: true,
          readAt: new Date()
        } 
      }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
    
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/v1/partners/notifications/send
// @desc    Send notification to partner
// @access  Private (Admin only)
router.post('/send', [
  body('partnerId').notEmpty().withMessage('Partner ID is required'),
  body('type').notEmpty().withMessage('Notification type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required')
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
    
    const { partnerId, type, title, message, data } = req.body;
    
    console.log('📤 Send notification:', { partnerId, type, title });
    
    const { getCollection } = require('../config/database');
    const notificationsCollection = await getCollection('notifications');
    
    const notification = {
      partnerId,
      type,
      title,
      message,
      data: data || {},
      isRead: false,
      createdAt: new Date(),
      readAt: null
    };
    
    const result = await notificationsCollection.insertOne(notification);
    
    // TODO: Send push notification via FCM
    // TODO: Send email notification
    // TODO: Send SMS notification
    
    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        notificationId: result.insertedId
      }
    });
    
  } catch (error) {
    logger.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;