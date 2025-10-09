const nodemailer = require('nodemailer');
const twilio = require('twilio');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.smsClient = null;
    this.initializeServices();
  }

  initializeServices() {
    // Initialize email service
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      logger.info('Email service initialized');
    }

    // Initialize SMS service
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.smsClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      logger.info('SMS service initialized');
    }
  }

  // Send email notification
  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.emailTransporter) {
        logger.warn('Email service not configured');
        return { success: false, error: 'Email service not configured' };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@clutch.com',
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${result.messageId}`);
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send SMS notification
  async sendSMS(to, message) {
    try {
      if (!this.smsClient) {
        logger.warn('SMS service not configured');
        return { success: false, error: 'SMS service not configured' };
      }

      const result = await this.smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      logger.info(`SMS sent to ${to}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error) {
      logger.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send push notification (placeholder for FCM/APNS)
  async sendPushNotification(deviceToken, title, body, data = {}) {
    try {
      // This would integrate with Firebase Cloud Messaging or Apple Push Notification Service
      logger.info(`Push notification sent to ${deviceToken}: ${title}`);
      return { success: true, messageId: `push_${Date.now()}` };
    } catch (error) {
      logger.error('Push notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send order notification to partner
  async sendOrderNotification(partner, order) {
    const notifications = [];

    // Email notification
    if (partner.email && partner.notifications?.orders) {
      const emailResult = await this.sendOrderEmail(partner, order);
      notifications.push(emailResult);
    }

    // SMS notification
    if (partner.phone && partner.notifications?.orders) {
      const smsResult = await this.sendOrderSMS(partner, order);
      notifications.push(smsResult);
    }

    // Push notification
    if (partner.deviceTokens && partner.deviceTokens.length > 0) {
      const pushResult = await this.sendOrderPush(partner, order);
      notifications.push(pushResult);
    }

    return notifications;
  }

  // Send payment notification
  async sendPaymentNotification(partner, payment) {
    const notifications = [];

    if (payment.status === 'paid') {
      // Payment successful
      if (partner.email && partner.notifications?.payments) {
        const emailResult = await this.sendPaymentSuccessEmail(partner, payment);
        notifications.push(emailResult);
      }
    } else if (payment.status === 'failed') {
      // Payment failed
      if (partner.email && partner.notifications?.payments) {
        const emailResult = await this.sendPaymentFailedEmail(partner, payment);
        notifications.push(emailResult);
      }
    }

    return notifications;
  }

  // Send low stock notification
  async sendLowStockNotification(partner, products) {
    const notifications = [];

    if (partner.email && partner.notifications?.inventory) {
      const emailResult = await this.sendLowStockEmail(partner, products);
      notifications.push(emailResult);
    }

    return notifications;
  }

  // Send system notification
  async sendSystemNotification(partner, notification) {
    const notifications = [];

    if (partner.email) {
      const emailResult = await this.sendSystemEmail(partner, notification);
      notifications.push(emailResult);
    }

    return notifications;
  }

  // Email templates
  async sendOrderEmail(partner, order) {
    const subject = `New Order #${order.orderNumber} - ${partner.businessName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Order Received</h2>
        <p>Hello ${partner.businessName},</p>
        <p>You have received a new order:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <p>Please log in to your Clutch Partners system to view and process this order.</p>
        <p>Best regards,<br>Clutch Team</p>
      </div>
    `;

    return await this.sendEmail(partner.email, subject, html);
  }

  async sendOrderSMS(partner, order) {
    const message = `New order #${order.orderNumber} received for $${order.totalAmount}. Customer: ${order.customerName}. Please check your Clutch Partners system.`;
    return await this.sendSMS(partner.phone, message);
  }

  async sendOrderPush(partner, order) {
    const title = 'New Order Received';
    const body = `Order #${order.orderNumber} - $${order.totalAmount}`;
    const data = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      type: 'new_order'
    };

    const results = [];
    for (const deviceToken of partner.deviceTokens) {
      const result = await this.sendPushNotification(deviceToken, title, body, data);
      results.push(result);
    }
    return results;
  }

  async sendPaymentSuccessEmail(partner, payment) {
    const subject = `Payment Received - Order #${payment.orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Payment Received</h2>
        <p>Hello ${partner.businessName},</p>
        <p>Payment has been successfully received for order #${payment.orderNumber}:</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${payment.amount}</p>
          <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
          <p><strong>Processed At:</strong> ${new Date(payment.processedAt).toLocaleString()}</p>
        </div>
        <p>You can now prepare the order for pickup or delivery.</p>
        <p>Best regards,<br>Clutch Team</p>
      </div>
    `;

    return await this.sendEmail(partner.email, subject, html);
  }

  async sendPaymentFailedEmail(partner, payment) {
    const subject = `Payment Failed - Order #${payment.orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p>Hello ${partner.businessName},</p>
        <p>Payment has failed for order #${payment.orderNumber}:</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${payment.amount}</p>
          <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
          <p><strong>Error:</strong> ${payment.errorMessage || 'Unknown error'}</p>
        </div>
        <p>Please contact the customer to resolve the payment issue.</p>
        <p>Best regards,<br>Clutch Team</p>
      </div>
    `;

    return await this.sendEmail(partner.email, subject, html);
  }

  async sendLowStockEmail(partner, products) {
    const subject = `Low Stock Alert - ${partner.businessName}`;
    const productList = products.map(p => `<li>${p.name} (SKU: ${p.sku}) - ${p.stockQuantity} remaining</li>`).join('');
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Low Stock Alert</h2>
        <p>Hello ${partner.businessName},</p>
        <p>The following products are running low on stock:</p>
        <ul style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${productList}
        </ul>
        <p>Please consider reordering these items to avoid stockouts.</p>
        <p>Best regards,<br>Clutch Team</p>
      </div>
    `;

    return await this.sendEmail(partner.email, subject, html);
  }

  async sendSystemEmail(partner, notification) {
    const subject = notification.title;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${notification.title}</h2>
        <p>Hello ${partner.businessName},</p>
        <p>${notification.message}</p>
        <p>Best regards,<br>Clutch Team</p>
      </div>
    `;

    return await this.sendEmail(partner.email, subject, html);
  }

  // Utility function to strip HTML tags
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Get notification statistics
  getStats() {
    return {
      emailConfigured: !!this.emailTransporter,
      smsConfigured: !!this.smsClient,
      services: {
        email: !!this.emailTransporter,
        sms: !!this.smsClient,
        push: true // Always available as placeholder
      }
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
