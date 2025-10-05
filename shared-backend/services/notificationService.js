const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class NotificationService {
  /**
   * Send push notification via FCM
   */
  static async sendPushNotification(deviceToken, notification) {
    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#E74C3C',
            sound: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: notification.badge || 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('✅ Push notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('❌ Push notification error:', error);
      throw error;
    }
  }

  /**
   * Send email notification via SendGrid
   */
  static async sendEmailNotification(email, notification) {
    try {
      const msg = {
        to: email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@clutch.com',
          name: 'Clutch Partners'
        },
        subject: notification.subject || notification.title,
        html: this.generateEmailTemplate(notification),
        text: notification.body
      };

      await sgMail.send(msg);
      console.log('✅ Email notification sent successfully to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Email notification error:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification via Twilio
   */
  static async sendSMSNotification(phoneNumber, notification) {
    try {
      const message = await twilioClient.messages.create({
        body: `${notification.title}\n\n${notification.body}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log('✅ SMS notification sent successfully:', message.sid);
      return { success: true, messageSid: message.sid };
    } catch (error) {
      console.error('❌ SMS notification error:', error);
      throw error;
    }
  }

  /**
   * Send multi-channel notification
   */
  static async sendMultiChannelNotification(partnerId, notification, channels = ['push', 'email', 'sms']) {
    try {
      const { getCollection } = require('../config/database');
      const partnersCollection = await getCollection('partners');
      const partner = await partnersCollection.findOne({ partnerId });

      if (!partner) {
        throw new Error('Partner not found');
      }

      const results = {};

      // Send push notification
      if (channels.includes('push') && partner.deviceTokens && partner.deviceTokens.length > 0) {
        for (const deviceToken of partner.deviceTokens) {
          try {
            await this.sendPushNotification(deviceToken, notification);
            results.push = { success: true };
          } catch (error) {
            console.error('Push notification failed for token:', deviceToken, error);
            results.push = { success: false, error: error.message };
          }
        }
      }

      // Send email notification
      if (channels.includes('email') && partner.primaryContact?.email) {
        try {
          await this.sendEmailNotification(partner.primaryContact.email, notification);
          results.email = { success: true };
        } catch (error) {
          console.error('Email notification failed:', error);
          results.email = { success: false, error: error.message };
        }
      }

      // Send SMS notification
      if (channels.includes('sms') && partner.primaryContact?.phone) {
        try {
          await this.sendSMSNotification(partner.primaryContact.phone, notification);
          results.sms = { success: true };
        } catch (error) {
          console.error('SMS notification failed:', error);
          results.sms = { success: false, error: error.message };
        }
      }

      // Save notification to database
      await this.saveNotificationToDatabase(partnerId, notification, results);

      return { success: true, results };
    } catch (error) {
      console.error('❌ Multi-channel notification error:', error);
      throw error;
    }
  }

  /**
   * Save notification to database
   */
  static async saveNotificationToDatabase(partnerId, notification, results) {
    try {
      const { getCollection } = require('../config/database');
      const notificationsCollection = await getCollection('notifications');

      const notificationRecord = {
        partnerId,
        type: notification.type || 'general',
        title: notification.title,
        message: notification.body,
        data: notification.data || {},
        channels: Object.keys(results),
        results,
        isRead: false,
        createdAt: new Date(),
        readAt: null
      };

      await notificationsCollection.insertOne(notificationRecord);
      console.log('✅ Notification saved to database');
    } catch (error) {
      console.error('❌ Save notification error:', error);
    }
  }

  /**
   * Generate email template
   */
  static generateEmailTemplate(notification) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #E74C3C; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 10px 20px; background-color: #E74C3C; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Clutch Partners</h1>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            <p>${notification.body}</p>
            ${notification.actionUrl ? `<a href="${notification.actionUrl}" class="button">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>This is an automated message from Clutch Partners. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send bulk notifications
   */
  static async sendBulkNotifications(partnerIds, notification, channels = ['push', 'email']) {
    try {
      const results = [];
      
      for (const partnerId of partnerIds) {
        try {
          const result = await this.sendMultiChannelNotification(partnerId, notification, channels);
          results.push({ partnerId, success: true, result });
        } catch (error) {
          results.push({ partnerId, success: false, error: error.message });
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('❌ Bulk notifications error:', error);
      throw error;
    }
  }

  /**
   * Schedule notification
   */
  static async scheduleNotification(partnerId, notification, scheduledTime, channels = ['push', 'email']) {
    try {
      const { getCollection } = require('../config/database');
      const scheduledNotificationsCollection = await getCollection('scheduled_notifications');

      const scheduledNotification = {
        partnerId,
        notification,
        channels,
        scheduledTime: new Date(scheduledTime),
        status: 'scheduled',
        createdAt: new Date()
      };

      await scheduledNotificationsCollection.insertOne(scheduledNotification);
      console.log('✅ Notification scheduled for:', scheduledTime);
      return { success: true };
    } catch (error) {
      console.error('❌ Schedule notification error:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;