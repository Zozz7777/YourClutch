const express = require('express');
const router = express.Router();
const esignIntegration = require('../integrations/esign');
const Contract = require('../models/Contract');
const ClutchLead = require('../models/ClutchLead');
const Approval = require('../models/Approval');

// DocuSign webhook
router.post('/docusign', async (req, res) => {
  try {
    const result = await esignIntegration.handleWebhook('docusign', req.body);
    
    if (result.signed) {
      // Find contract by envelope ID
      const contract = await Contract.findOne({ 
        'metadata.esignEnvelopeId': result.envelopeId 
      });
      
      if (contract) {
        // Update contract status
        contract.status = 'signed';
        contract.metadata.esignEnvelopeId = result.envelopeId;
        await contract.save();
        
        // Update lead status to legal_review
        const lead = await ClutchLead.findById(contract.leadId);
        if (lead) {
          await lead.updateStatus('legal_review', 'system', 'Contract signed via e-signature');
          lead.contract.status = 'signed';
          await lead.save();
          
          // Create legal approval record
          await Approval.create({
            resourceType: 'contract',
            resourceId: contract._id,
            requesterId: 'system',
            approverRole: 'legal',
            status: 'pending'
          });
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('DocuSign webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Adobe Sign webhook
router.post('/adobesign', async (req, res) => {
  try {
    const result = await esignIntegration.handleWebhook('adobesign', req.body);
    
    if (result.signed) {
      // Find contract by envelope ID
      const contract = await Contract.findOne({ 
        'metadata.esignEnvelopeId': result.envelopeId 
      });
      
      if (contract) {
        // Update contract status
        contract.status = 'signed';
        contract.metadata.esignEnvelopeId = result.envelopeId;
        await contract.save();
        
        // Update lead status to legal_review
        const lead = await ClutchLead.findById(contract.leadId);
        if (lead) {
          await lead.updateStatus('legal_review', 'system', 'Contract signed via e-signature');
          lead.contract.status = 'signed';
          await lead.save();
          
          // Create legal approval record
          await Approval.create({
            resourceType: 'contract',
            resourceId: contract._id,
            requesterId: 'system',
            approverRole: 'legal',
            status: 'pending'
          });
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Adobe Sign webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
