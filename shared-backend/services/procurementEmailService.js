const nodemailer = require('nodemailer');
const EmailTemplate = require('../models/EmailTemplate');
const logger = require('../utils/logger');

class ProcurementEmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.templateTypes = {
      // Request notifications
      REQUEST_CREATED: 'procurement_request_created',
      REQUEST_APPROVED: 'procurement_request_approved',
      REQUEST_REJECTED: 'procurement_request_rejected',
      REQUEST_PENDING_APPROVAL: 'procurement_request_pending_approval',
      
      // RFQ notifications
      RFQ_CREATED: 'rfq_created',
      RFQ_RESPONSE_RECEIVED: 'rfq_response_received',
      RFQ_CLOSED: 'rfq_closed',
      
      // Purchase Order notifications
      PO_CREATED: 'purchase_order_created',
      PO_APPROVED: 'purchase_order_approved',
      PO_SENT_TO_SUPPLIER: 'purchase_order_sent_to_supplier',
      PO_RECEIVED: 'purchase_order_received',
      
      // Contract notifications
      CONTRACT_CREATED: 'contract_created',
      CONTRACT_APPROVED: 'contract_approved',
      CONTRACT_EXPIRING: 'contract_expiring',
      CONTRACT_RENEWED: 'contract_renewed',
      CONTRACT_TERMINATED: 'contract_terminated',
      
      // Supplier notifications
      SUPPLIER_REGISTERED: 'supplier_registered',
      SUPPLIER_APPROVED: 'supplier_approved',
      SUPPLIER_SUSPENDED: 'supplier_suspended',
      SUPPLIER_PERFORMANCE_ALERT: 'supplier_performance_alert',
      
      // Budget notifications
      BUDGET_EXCEEDED: 'budget_exceeded',
      BUDGET_WARNING: 'budget_warning',
      BUDGET_APPROVED: 'budget_approved',
      
      // Risk notifications
      RISK_ASSESSMENT_CREATED: 'risk_assessment_created',
      RISK_LEVEL_CHANGED: 'risk_level_changed',
      HIGH_RISK_ALERT: 'high_risk_alert',
      
      // General notifications
      SYSTEM_ALERT: 'system_alert',
      REMINDER: 'reminder',
      REPORT_READY: 'report_ready'
    };
  }

  /**
   * Send procurement email notification
   */
  async sendNotification(recipients, templateType, data, options = {}) {
    try {
      const template = await this.getTemplate(templateType);
      if (!template) {
        throw new Error(`Template not found: ${templateType}`);
      }

      const emailData = {
        subject: this.processTemplate(template.subject, data),
        html: this.processTemplate(template.htmlContent, data),
        text: this.processTemplate(template.textContent, data)
      };

      const mailOptions = {
        from: options.from || process.env.FROM_EMAIL || 'noreply@clutch.com',
        to: Array.isArray(recipients) ? recipients.join(', ') : recipients,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        ...options
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Update template analytics
      await this.updateTemplateAnalytics(template._id, true);
      
      logger.info(`Email sent successfully: ${templateType} to ${recipients}`);
      return result;
    } catch (error) {
      logger.error(`Error sending email: ${templateType}`, error);
      
      // Update template analytics with failure
      const template = await this.getTemplate(templateType);
      if (template) {
        await this.updateTemplateAnalytics(template._id, false);
      }
      
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(recipients, templateType, data, options = {}) {
    try {
      const results = [];
      const batchSize = 50; // Send in batches to avoid rate limits
      
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const result = await this.sendNotification(batch, templateType, data, options);
        results.push(result);
        
        // Add delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Get email template
   */
  async getTemplate(templateType) {
    try {
      let template = await EmailTemplate.findOne({ 
        type: templateType, 
        'settings.isActive': true 
      });

      if (!template) {
        // Create default template if not found
        template = await this.createDefaultTemplate(templateType);
      }

      return template;
    } catch (error) {
      logger.error('Error getting email template:', error);
      throw error;
    }
  }

  /**
   * Process template with data
   */
  processTemplate(template, data) {
    if (!template || !data) return template;

    let processedTemplate = template;
    
    // Replace variables in template
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedTemplate = processedTemplate.replace(regex, data[key] || '');
    });

    return processedTemplate;
  }

  /**
   * Update template analytics
   */
  async updateTemplateAnalytics(templateId, success) {
    try {
      const update = {
        $inc: { 'analytics.usageCount': 1 },
        $set: { 'analytics.lastUsed': new Date() }
      };

      if (success) {
        // Calculate success rate
        const template = await EmailTemplate.findById(templateId);
        const currentSuccessRate = template.analytics.successRate || 0;
        const currentUsage = template.analytics.usageCount || 0;
        const newSuccessRate = ((currentSuccessRate * currentUsage) + 1) / (currentUsage + 1);
        update.$set['analytics.successRate'] = newSuccessRate;
      }

      await EmailTemplate.findByIdAndUpdate(templateId, update);
    } catch (error) {
      logger.error('Error updating template analytics:', error);
    }
  }

  /**
   * Create default template
   */
  async createDefaultTemplate(templateType) {
    const defaultTemplates = this.getDefaultTemplates();
    const templateData = defaultTemplates[templateType];
    
    if (!templateData) {
      throw new Error(`No default template found for: ${templateType}`);
    }

    const template = new EmailTemplate({
      name: templateData.name,
      type: templateType,
      subject: templateData.subject,
      htmlContent: templateData.htmlContent,
      textContent: templateData.textContent,
      variables: templateData.variables || [],
      settings: {
        isActive: true,
        isDefault: true,
        category: 'procurement',
        priority: 'medium'
      }
    });

    await template.save();
    return template;
  }

  /**
   * Get default templates
   */
  getDefaultTemplates() {
    return {
      [this.templateTypes.REQUEST_CREATED]: {
        name: 'Procurement Request Created',
        subject: 'New Procurement Request Created - {{requestNumber}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333;">New Procurement Request</h2>
              <p>Hello {{requesterName}},</p>
              <p>Your procurement request has been created successfully.</p>
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3>Request Details:</h3>
                <ul>
                  <li><strong>Request Number:</strong> {{requestNumber}}</li>
                  <li><strong>Department:</strong> {{department}}</li>
                  <li><strong>Total Amount:</strong> ${{totalAmount}}</li>
                  <li><strong>Priority:</strong> {{priority}}</li>
                  <li><strong>Created Date:</strong> {{createdDate}}</li>
                </ul>
              </div>
              
              <p>Your request is now pending approval. You will be notified once it's reviewed.</p>
              <p>Best regards,<br>Procurement Team</p>
            </div>
          </div>
        `,
        textContent: `
          New Procurement Request Created - {{requestNumber}}
          
          Hello {{requesterName}},
          
          Your procurement request has been created successfully.
          
          Request Details:
          - Request Number: {{requestNumber}}
          - Department: {{department}}
          - Total Amount: ${{totalAmount}}
          - Priority: {{priority}}
          - Created Date: {{createdDate}}
          
          Your request is now pending approval. You will be notified once it's reviewed.
          
          Best regards,
          Procurement Team
        `,
        variables: [
          { name: 'requesterName', description: 'Name of the person who created the request', isRequired: true },
          { name: 'requestNumber', description: 'Unique request number', isRequired: true },
          { name: 'department', description: 'Department name', isRequired: true },
          { name: 'totalAmount', description: 'Total amount of the request', isRequired: true },
          { name: 'priority', description: 'Request priority level', isRequired: true },
          { name: 'createdDate', description: 'Date when request was created', isRequired: true }
        ]
      },

      [this.templateTypes.REQUEST_APPROVED]: {
        name: 'Procurement Request Approved',
        subject: 'Procurement Request Approved - {{requestNumber}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
              <h2 style="color: #155724;">Request Approved</h2>
              <p>Hello {{requesterName}},</p>
              <p>Great news! Your procurement request has been approved.</p>
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3>Approval Details:</h3>
                <ul>
                  <li><strong>Request Number:</strong> {{requestNumber}}</li>
                  <li><strong>Approved By:</strong> {{approvedBy}}</li>
                  <li><strong>Approval Date:</strong> {{approvalDate}}</li>
                  <li><strong>Total Amount:</strong> ${{totalAmount}}</li>
                </ul>
              </div>
              
              <p>You can now proceed with the procurement process.</p>
              <p>Best regards,<br>Procurement Team</p>
            </div>
          </div>
        `,
        textContent: `
          Procurement Request Approved - {{requestNumber}}
          
          Hello {{requesterName}},
          
          Great news! Your procurement request has been approved.
          
          Approval Details:
          - Request Number: {{requestNumber}}
          - Approved By: {{approvedBy}}
          - Approval Date: {{approvalDate}}
          - Total Amount: ${{totalAmount}}
          
          You can now proceed with the procurement process.
          
          Best regards,
          Procurement Team
        `,
        variables: [
          { name: 'requesterName', description: 'Name of the person who created the request', isRequired: true },
          { name: 'requestNumber', description: 'Unique request number', isRequired: true },
          { name: 'approvedBy', description: 'Name of the approver', isRequired: true },
          { name: 'approvalDate', description: 'Date of approval', isRequired: true },
          { name: 'totalAmount', description: 'Total amount of the request', isRequired: true }
        ]
      },

      [this.templateTypes.CONTRACT_EXPIRING]: {
        name: 'Contract Expiring Soon',
        subject: 'Contract Expiring Soon - {{contractNumber}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h2 style="color: #856404;">Contract Expiring Soon</h2>
              <p>Hello {{recipientName}},</p>
              <p>This is a reminder that the following contract is expiring soon.</p>
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3>Contract Details:</h3>
                <ul>
                  <li><strong>Contract Number:</strong> {{contractNumber}}</li>
                  <li><strong>Supplier:</strong> {{supplierName}}</li>
                  <li><strong>Expiry Date:</strong> {{expiryDate}}</li>
                  <li><strong>Days Remaining:</strong> {{daysRemaining}}</li>
                  <li><strong>Contract Value:</strong> ${{contractValue}}</li>
                </ul>
              </div>
              
              <p>Please review the contract and take necessary action for renewal or termination.</p>
              <p>Best regards,<br>Procurement Team</p>
            </div>
          </div>
        `,
        textContent: `
          Contract Expiring Soon - {{contractNumber}}
          
          Hello {{recipientName}},
          
          This is a reminder that the following contract is expiring soon.
          
          Contract Details:
          - Contract Number: {{contractNumber}}
          - Supplier: {{supplierName}}
          - Expiry Date: {{expiryDate}}
          - Days Remaining: {{daysRemaining}}
          - Contract Value: ${{contractValue}}
          
          Please review the contract and take necessary action for renewal or termination.
          
          Best regards,
          Procurement Team
        `,
        variables: [
          { name: 'recipientName', description: 'Name of the recipient', isRequired: true },
          { name: 'contractNumber', description: 'Contract number', isRequired: true },
          { name: 'supplierName', description: 'Supplier name', isRequired: true },
          { name: 'expiryDate', description: 'Contract expiry date', isRequired: true },
          { name: 'daysRemaining', description: 'Number of days remaining', isRequired: true },
          { name: 'contractValue', description: 'Contract value', isRequired: true }
        ]
      },

      [this.templateTypes.BUDGET_EXCEEDED]: {
        name: 'Budget Exceeded Alert',
        subject: 'Budget Exceeded - {{budgetName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h2 style="color: #721c24;">Budget Exceeded Alert</h2>
              <p>Hello {{recipientName}},</p>
              <p>This is an alert that the following budget has been exceeded.</p>
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3>Budget Details:</h3>
                <ul>
                  <li><strong>Budget Name:</strong> {{budgetName}}</li>
                  <li><strong>Budget Type:</strong> {{budgetType}}</li>
                  <li><strong>Allocated Amount:</strong> ${{allocatedAmount}}</li>
                  <li><strong>Spent Amount:</strong> ${{spentAmount}}</li>
                  <li><strong>Overrun:</strong> ${{overrunAmount}}</li>
                </ul>
              </div>
              
              <p>Please review the budget and take necessary action.</p>
              <p>Best regards,<br>Procurement Team</p>
            </div>
          </div>
        `,
        textContent: `
          Budget Exceeded - {{budgetName}}
          
          Hello {{recipientName}},
          
          This is an alert that the following budget has been exceeded.
          
          Budget Details:
          - Budget Name: {{budgetName}}
          - Budget Type: {{budgetType}}
          - Allocated Amount: ${{allocatedAmount}}
          - Spent Amount: ${{spentAmount}}
          - Overrun: ${{overrunAmount}}
          
          Please review the budget and take necessary action.
          
          Best regards,
          Procurement Team
        `,
        variables: [
          { name: 'recipientName', description: 'Name of the recipient', isRequired: true },
          { name: 'budgetName', description: 'Name of the budget', isRequired: true },
          { name: 'budgetType', description: 'Type of budget', isRequired: true },
          { name: 'allocatedAmount', description: 'Allocated budget amount', isRequired: true },
          { name: 'spentAmount', description: 'Amount spent', isRequired: true },
          { name: 'overrunAmount', description: 'Amount overrun', isRequired: true }
        ]
      },

      [this.templateTypes.HIGH_RISK_ALERT]: {
        name: 'High Risk Supplier Alert',
        subject: 'High Risk Supplier Alert - {{supplierName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h2 style="color: #721c24;">High Risk Supplier Alert</h2>
              <p>Hello {{recipientName}},</p>
              <p>This is an alert that a supplier has been identified as high risk.</p>
              
              <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h3>Supplier Details:</h3>
                <ul>
                  <li><strong>Supplier Name:</strong> {{supplierName}}</li>
                  <li><strong>Risk Level:</strong> {{riskLevel}}</li>
                  <li><strong>Risk Score:</strong> {{riskScore}}</li>
                  <li><strong>Risk Factors:</strong> {{riskFactors}}</li>
                  <li><strong>Assessment Date:</strong> {{assessmentDate}}</li>
                </ul>
              </div>
              
              <p>Please review the risk assessment and take necessary action.</p>
              <p>Best regards,<br>Procurement Team</p>
            </div>
          </div>
        `,
        textContent: `
          High Risk Supplier Alert - {{supplierName}}
          
          Hello {{recipientName}},
          
          This is an alert that a supplier has been identified as high risk.
          
          Supplier Details:
          - Supplier Name: {{supplierName}}
          - Risk Level: {{riskLevel}}
          - Risk Score: {{riskScore}}
          - Risk Factors: {{riskFactors}}
          - Assessment Date: {{assessmentDate}}
          
          Please review the risk assessment and take necessary action.
          
          Best regards,
          Procurement Team
        `,
        variables: [
          { name: 'recipientName', description: 'Name of the recipient', isRequired: true },
          { name: 'supplierName', description: 'Name of the supplier', isRequired: true },
          { name: 'riskLevel', description: 'Risk level', isRequired: true },
          { name: 'riskScore', description: 'Risk score', isRequired: true },
          { name: 'riskFactors', description: 'Risk factors', isRequired: true },
          { name: 'assessmentDate', description: 'Assessment date', isRequired: true }
        ]
      }
    };
  }

  /**
   * Send procurement request created notification
   */
  async sendRequestCreatedNotification(requesterEmail, requestData) {
    return await this.sendNotification(
      requesterEmail,
      this.templateTypes.REQUEST_CREATED,
      requestData
    );
  }

  /**
   * Send procurement request approved notification
   */
  async sendRequestApprovedNotification(requesterEmail, requestData) {
    return await this.sendNotification(
      requesterEmail,
      this.templateTypes.REQUEST_APPROVED,
      requestData
    );
  }

  /**
   * Send contract expiring notification
   */
  async sendContractExpiringNotification(recipientEmail, contractData) {
    return await this.sendNotification(
      recipientEmail,
      this.templateTypes.CONTRACT_EXPIRING,
      contractData
    );
  }

  /**
   * Send budget exceeded notification
   */
  async sendBudgetExceededNotification(recipientEmail, budgetData) {
    return await this.sendNotification(
      recipientEmail,
      this.templateTypes.BUDGET_EXCEEDED,
      budgetData
    );
  }

  /**
   * Send high risk supplier alert
   */
  async sendHighRiskAlert(recipientEmail, supplierData) {
    return await this.sendNotification(
      recipientEmail,
      this.templateTypes.HIGH_RISK_ALERT,
      supplierData
    );
  }
}

module.exports = new ProcurementEmailService();
