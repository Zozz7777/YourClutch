class AdobeSignProvider {
  constructor() {
    this.apiKey = process.env.ADOBE_SIGN_API_KEY;
    this.baseUrl = process.env.ADOBE_SIGN_BASE_URL || 'https://api.na1.adobesign.com/api/rest/v6';
  }

  async sendForSign(documentData, callbacks = {}) {
    try {
      const { leadId, companyName, contactName, contactEmail, businessAddress, city, governorate, businessLicense, taxId, partnerType, templateId } = documentData;
      
      // Create agreement
      const agreementData = {
        fileInfos: [{
          libraryDocumentId: templateId
        }],
        name: `Partnership Agreement - ${companyName}`,
        participantSetsInfo: [{
          memberInfos: [{
            email: contactEmail
          }],
          order: 1,
          role: 'SIGNER'
        }],
        signatureType: 'ESIGN',
        state: 'IN_PROCESS'
      };

      const response = await fetch(`${this.baseUrl}/agreements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agreementData)
      });

      const agreement = await response.json();
      
      // Set up webhook for status updates
      if (callbacks.onSigned) {
        this.setupWebhook(agreement.id, callbacks);
      }

      // Get signing URL
      const signingUrlResponse = await fetch(`${this.baseUrl}/agreements/${agreement.id}/signingUrls`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const signingUrls = await signingUrlResponse.json();

      return {
        signingUrl: signingUrls.signingUrlSetInfos[0].signingUrls[0].esignUrl,
        envelopeId: agreement.id
      };
    } catch (error) {
      console.error('Adobe Sign send error:', error);
      throw error;
    }
  }

  async getStatus(envelopeId) {
    try {
      const response = await fetch(`${this.baseUrl}/agreements/${envelopeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const agreement = await response.json();
      
      return {
        status: agreement.status,
        completed: agreement.status === 'SIGNED',
        signed: agreement.status === 'SIGNED'
      };
    } catch (error) {
      console.error('Adobe Sign status error:', error);
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
      
      if (event === 'agreement.workflow.completed') {
        return {
          envelopeId: data.agreement.id,
          status: 'SIGNED',
          signed: true
        };
      }

      return {
        envelopeId: data.agreement.id,
        status: data.agreement.status,
        signed: false
      };
    } catch (error) {
      console.error('Adobe Sign webhook error:', error);
      throw error;
    }
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

module.exports = new AdobeSignProvider();
