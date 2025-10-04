const docusign = require('docusign-esign');

class DocuSignProvider {
  constructor() {
    this.apiClient = new docusign.ApiClient();
    this.apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH || 'https://demo.docusign.net/restapi');
    
    // Configure authentication
    this.apiClient.addDefaultHeader('Authorization', `Bearer ${process.env.DOCUSIGN_ACCESS_TOKEN}`);
  }

  async sendForSign(documentData, callbacks = {}) {
    try {
      const { leadId, companyName, contactName, contactEmail, businessAddress, city, governorate, businessLicense, taxId, partnerType, templateId } = documentData;
      
      // Create envelope definition
      const envelopeDefinition = {
        emailSubject: `Partnership Agreement - ${companyName}`,
        documents: [{
          documentId: '1',
          name: 'Partnership Agreement',
          documentBase64: await this.getTemplateContent(templateId)
        }],
        recipients: {
          signers: [{
            email: contactEmail,
            name: contactName,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [{
                documentId: '1',
                pageNumber: '1',
                xPosition: '100',
                yPosition: '100'
              }]
            }
          }]
        },
        status: 'sent'
      };

      // Create envelope
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const envelope = await envelopesApi.createEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, { envelopeDefinition });
      
      // Set up webhook for status updates
      if (callbacks.onSigned) {
        this.setupWebhook(envelope.envelopeId, callbacks);
      }

      // Get signing URL
      const recipientViewRequest = {
        authenticationMethod: 'email',
        email: contactEmail,
        userName: contactName,
        returnUrl: `${process.env.FRONTEND_URL}/contracts/signed`
      };

      const viewUrl = await envelopesApi.createRecipientView(process.env.DOCUSIGN_ACCOUNT_ID, envelope.envelopeId, { recipientViewRequest });

      return {
        signingUrl: viewUrl.url,
        envelopeId: envelope.envelopeId
      };
    } catch (error) {
      console.error('DocuSign send error:', error);
      throw error;
    }
  }

  async getStatus(envelopeId) {
    try {
      const envelopesApi = new docusign.EnvelopesApi(this.apiClient);
      const envelope = await envelopesApi.getEnvelope(process.env.DOCUSIGN_ACCOUNT_ID, envelopeId);
      
      return {
        status: envelope.status,
        completed: envelope.status === 'completed',
        signed: envelope.status === 'completed'
      };
    } catch (error) {
      console.error('DocuSign status error:', error);
      throw error;
    }
  }

  async handleWebhook(payload) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload)) {
        throw new Error('Invalid webhook signature');
      }

      const { event, data } = payload;
      
      if (event === 'envelope.completed') {
        return {
          envelopeId: data.envelopeId,
          status: 'completed',
          signed: true
        };
      }

      return {
        envelopeId: data.envelopeId,
        status: data.status,
        signed: false
      };
    } catch (error) {
      console.error('DocuSign webhook error:', error);
      throw error;
    }
  }

  async getTemplateContent(templateId) {
    // In production, this would fetch the actual template content
    // For now, return a placeholder
    return Buffer.from('Template content placeholder').toString('base64');
  }

  setupWebhook(envelopeId, callbacks) {
    // In production, this would set up actual webhook endpoints
    // For now, we'll simulate the callback
    setTimeout(async () => {
      try {
        const status = await this.getStatus(envelopeId);
        if (status.signed && callbacks.onSigned) {
          await callbacks.onSigned(envelopeId);
        }
      } catch (error) {
        console.error('Webhook callback error:', error);
      }
    }, 30000); // Simulate 30 second delay
  }

  verifyWebhookSignature(payload) {
    // In production, implement proper webhook signature verification
    return true;
  }
}

module.exports = new DocuSignProvider();
