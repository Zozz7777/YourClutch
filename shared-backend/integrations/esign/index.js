const docusign = require('./docusign');
const adobesign = require('./adobesign');

class ESignIntegration {
  constructor() {
    this.providers = {
      docusign: docusign,
      adobesign: adobesign
    };
  }

  async sendForSign(lead, templateId, callbacks = {}) {
    try {
      const provider = process.env.ESIGN_PROVIDER || 'docusign';
      const providerInstance = this.providers[provider];
      
      if (!providerInstance) {
        throw new Error(`E-sign provider ${provider} not supported`);
      }

      // Prepare document data
      const documentData = {
        leadId: lead._id,
        companyName: lead.companyName,
        contactName: lead.contact.name,
        contactEmail: lead.contact.email,
        businessAddress: lead.businessDetails.address,
        city: lead.businessDetails.city,
        governorate: lead.businessDetails.governorate,
        businessLicense: lead.businessDetails.businessLicense,
        taxId: lead.businessDetails.taxId,
        partnerType: lead.type,
        templateId: templateId
      };

      // Send for signature
      const result = await providerInstance.sendForSign(documentData, callbacks);
      
      return {
        signingUrl: result.signingUrl,
        envelopeId: result.envelopeId,
        provider: provider
      };
    } catch (error) {
      console.error('E-sign integration error:', error);
      throw error;
    }
  }

  async getStatus(envelopeId) {
    try {
      const provider = process.env.ESIGN_PROVIDER || 'docusign';
      const providerInstance = this.providers[provider];
      
      if (!providerInstance) {
        throw new Error(`E-sign provider ${provider} not supported`);
      }

      return await providerInstance.getStatus(envelopeId);
    } catch (error) {
      console.error('Error getting e-sign status:', error);
      throw error;
    }
  }

  async handleWebhook(provider, payload) {
    try {
      const providerInstance = this.providers[provider];
      
      if (!providerInstance) {
        throw new Error(`E-sign provider ${provider} not supported`);
      }

      return await providerInstance.handleWebhook(payload);
    } catch (error) {
      console.error('Error handling e-sign webhook:', error);
      throw error;
    }
  }
}

module.exports = new ESignIntegration();
