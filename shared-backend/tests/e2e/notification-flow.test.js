const request = require('supertest');
const app = require('../../app');
const NotificationService = require('../../services/NotificationService');

describe('Notification System E2E Tests', () => {
  let testPartnerId = 'TEST-PARTNER-NOTIFICATIONS';
  let authToken;

  beforeAll(async () => {
    // Setup test partner
    const { getCollection } = require('../../config/database');
    const partnersCollection = await getCollection('partners');
    
    await partnersCollection.insertOne({
      partnerId: testPartnerId,
      name: 'Test Notification Partner',
      type: 'AUTO_PARTS_SHOP',
      primaryContact: {
        name: 'Test Owner',
        email: 'test@notifications.com',
        phone: '+201234567890'
      },
      deviceTokens: ['test-device-token-123'],
      status: 'active',
      createdAt: new Date()
    });
  });

  afterAll(async () => {
    // Cleanup
    const { getCollection } = require('../../config/database');
    const partnersCollection = await getCollection('partners');
    const notificationsCollection = await getCollection('notifications');
    
    await partnersCollection.deleteMany({ partnerId: testPartnerId });
    await notificationsCollection.deleteMany({ partnerId: testPartnerId });
  });

  describe('Push Notifications', () => {
    test('1. Send push notification', async () => {
      const notification = {
        title: 'Test Push Notification',
        body: 'This is a test push notification',
        data: { type: 'test', orderId: 'TEST-001' }
      };

      // Mock FCM response
      const mockFCM = {
        send: jest.fn().mockResolvedValue('mock-message-id')
      };

      const result = await NotificationService.sendPushNotification(
        'test-device-token-123',
        notification
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    test('2. Handle push notification failure', async () => {
      const notification = {
        title: 'Test Push Notification',
        body: 'This is a test push notification'
      };

      // Mock FCM failure
      const mockFCM = {
        send: jest.fn().mockRejectedValue(new Error('FCM Error'))
      };

      await expect(
        NotificationService.sendPushNotification('invalid-token', notification)
      ).rejects.toThrow();
    });
  });

  describe('Email Notifications', () => {
    test('3. Send email notification', async () => {
      const notification = {
        title: 'Test Email Notification',
        body: 'This is a test email notification',
        subject: 'Test Subject'
      };

      // Mock SendGrid
      const mockSendGrid = {
        send: jest.fn().mockResolvedValue({})
      };

      const result = await NotificationService.sendEmailNotification(
        'test@notifications.com',
        notification
      );

      expect(result.success).toBe(true);
    });

    test('4. Generate email template', async () => {
      const notification = {
        title: 'Test Email',
        body: 'Test email body',
        actionUrl: 'https://example.com'
      };

      const template = NotificationService.generateEmailTemplate(notification);
      
      expect(template).toContain('Test Email');
      expect(template).toContain('Test email body');
      expect(template).toContain('https://example.com');
      expect(template).toContain('<!DOCTYPE html>');
    });
  });

  describe('SMS Notifications', () => {
    test('5. Send SMS notification', async () => {
      const notification = {
        title: 'Test SMS',
        body: 'This is a test SMS notification'
      };

      // Mock Twilio
      const mockTwilio = {
        messages: {
          create: jest.fn().mockResolvedValue({ sid: 'mock-sms-id' })
        }
      };

      const result = await NotificationService.sendSMSNotification(
        '+201234567890',
        notification
      );

      expect(result.success).toBe(true);
      expect(result.messageSid).toBeDefined();
    });
  });

  describe('Multi-Channel Notifications', () => {
    test('6. Send multi-channel notification', async () => {
      const notification = {
        title: 'Multi-Channel Test',
        body: 'This is a multi-channel notification test',
        type: 'order_update'
      };

      const result = await NotificationService.sendMultiChannelNotification(
        testPartnerId,
        notification,
        ['push', 'email', 'sms']
      );

      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
    });

    test('7. Send notification with specific channels', async () => {
      const notification = {
        title: 'Email Only Test',
        body: 'This should only send via email',
        type: 'system_update'
      };

      const result = await NotificationService.sendMultiChannelNotification(
        testPartnerId,
        notification,
        ['email']
      );

      expect(result.success).toBe(true);
      expect(result.results.email).toBeDefined();
    });
  });

  describe('Bulk Notifications', () => {
    test('8. Send bulk notifications', async () => {
      const partnerIds = [testPartnerId, 'TEST-PARTNER-002'];
      const notification = {
        title: 'Bulk Notification Test',
        body: 'This is a bulk notification test',
        type: 'announcement'
      };

      const result = await NotificationService.sendBulkNotifications(
        partnerIds,
        notification,
        ['push', 'email']
      );

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('Scheduled Notifications', () => {
    test('9. Schedule notification', async () => {
      const notification = {
        title: 'Scheduled Notification',
        body: 'This is a scheduled notification',
        type: 'reminder'
      };

      const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const result = await NotificationService.scheduleNotification(
        testPartnerId,
        notification,
        scheduledTime,
        ['push', 'email']
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Notification Database Operations', () => {
    test('10. Save notification to database', async () => {
      const notification = {
        title: 'Database Test',
        body: 'This notification should be saved to database',
        type: 'test'
      };

      const results = {
        push: { success: true },
        email: { success: true }
      };

      await NotificationService.saveNotificationToDatabase(
        testPartnerId,
        notification,
        results
      );

      // Verify notification was saved
      const { getCollection } = require('../../config/database');
      const notificationsCollection = await getCollection('notifications');
      
      const savedNotification = await notificationsCollection.findOne({
        partnerId: testPartnerId,
        title: 'Database Test'
      });

      expect(savedNotification).toBeDefined();
      expect(savedNotification.title).toBe('Database Test');
      expect(savedNotification.channels).toEqual(['push', 'email']);
    });
  });

  describe('Notification API Endpoints', () => {
    test('11. Get notifications via API', async () => {
      const response = await request(app)
        .get(`/api/v1/partners/notifications?partnerId=${testPartnerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
    });

    test('12. Send notification via API', async () => {
      const notificationData = {
        partnerId: testPartnerId,
        type: 'order',
        title: 'API Test Notification',
        message: 'This notification was sent via API',
        data: { orderId: 'TEST-ORDER-001' }
      };

      const response = await request(app)
        .post('/api/v1/partners/notifications/send')
        .send(notificationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notificationId).toBeDefined();
    });

    test('13. Mark notifications as read via API', async () => {
      // First get some notifications
      const getResponse = await request(app)
        .get(`/api/v1/partners/notifications?partnerId=${testPartnerId}`)
        .expect(200);

      if (getResponse.body.data.notifications.length > 0) {
        const notificationIds = getResponse.body.data.notifications
          .slice(0, 2)
          .map(n => n._id);

        const response = await request(app)
          .post('/api/v1/partners/notifications/mark-read')
          .send({ notificationIds })
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    test('14. Handle invalid partner ID', async () => {
      const notification = {
        title: 'Invalid Partner Test',
        body: 'This should fail',
        type: 'test'
      };

      await expect(
        NotificationService.sendMultiChannelNotification(
          'INVALID-PARTNER-ID',
          notification
        )
      ).rejects.toThrow('Partner not found');
    });

    test('15. Handle missing device tokens', async () => {
      const notification = {
        title: 'No Device Token Test',
        body: 'This should handle missing tokens gracefully',
        type: 'test'
      };

      // Create partner without device tokens
      const { getCollection } = require('../../config/database');
      const partnersCollection = await getCollection('partners');
      
      await partnersCollection.insertOne({
        partnerId: 'TEST-PARTNER-NO-TOKENS',
        name: 'No Tokens Partner',
        type: 'AUTO_PARTS_SHOP',
        primaryContact: {
          name: 'No Tokens Owner',
          email: 'notokens@test.com',
          phone: '+201234567891'
        },
        status: 'active',
        createdAt: new Date()
      });

      const result = await NotificationService.sendMultiChannelNotification(
        'TEST-PARTNER-NO-TOKENS',
        notification,
        ['push']
      );

      expect(result.success).toBe(true);
      expect(result.results.push).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('16. Bulk notification performance', async () => {
      const partnerIds = Array.from({ length: 10 }, (_, i) => `TEST-PARTNER-${i}`);
      const notification = {
        title: 'Performance Test',
        body: 'Testing bulk notification performance',
        type: 'performance_test'
      };

      const startTime = Date.now();
      
      const result = await NotificationService.sendBulkNotifications(
        partnerIds,
        notification,
        ['email']
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
