const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

/**
 * Extract placeholders from DOCX template
 * @param {Buffer} docxBuffer - DOCX file buffer
 * @returns {Array<string>} - List of placeholders found
 */
function extractPlaceholders(docxBuffer) {
  try {
    const zip = new PizZip(docxBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });

    // Get all text content to find placeholders
    const fullText = doc.getFullText();
    
    // Find all {{placeholder}} patterns
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const placeholders = [];
    let match;
    
    while ((match = placeholderRegex.exec(fullText)) !== null) {
      const placeholder = match[1].trim();
      if (!placeholders.includes(placeholder)) {
        placeholders.push(placeholder);
      }
    }
    
    console.log(`✅ Extracted ${placeholders.length} placeholders from template`);
    return placeholders;
  } catch (error) {
    console.error('❌ Error extracting placeholders:', error);
    throw new Error(`Failed to extract placeholders: ${error.message}`);
  }
}

/**
 * Merge data into DOCX template
 * @param {Buffer} docxBuffer - DOCX template buffer
 * @param {Object} data - Data to merge
 * @returns {Buffer} - Merged DOCX buffer
 */
function mergeTemplate(docxBuffer, data) {
  try {
    const zip = new PizZip(docxBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}'
      }
    });

    // Set the template variables
    doc.setData(data);

    // Render the document
    doc.render();

    // Generate the output
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 4
      }
    });

    console.log('✅ Template merged successfully');
    return buf;
  } catch (error) {
    console.error('❌ Error merging template:', error);
    throw new Error(`Failed to merge template: ${error.message}`);
  }
}

/**
 * Validate required fields for contract type
 * @param {Object} leadData - Lead data
 * @param {string} contractType - Contract type (person/company)
 * @returns {Object} - Validation result
 */
function validateContractFields(leadData, contractType) {
  const errors = [];
  const warnings = [];

  if (contractType === 'person') {
    const requiredFields = ['personName', 'nationalId', 'personAddress'];
    requiredFields.forEach(field => {
      if (!leadData[field] || leadData[field].trim() === '') {
        errors.push(`Person contract requires: ${field}`);
      }
    });
  } else if (contractType === 'company') {
    const requiredFields = ['companyRegistrationId', 'companyTaxId', 'companyOwnerName'];
    requiredFields.forEach(field => {
      if (!leadData[field] || leadData[field].trim() === '') {
        errors.push(`Company contract requires: ${field}`);
      }
    });
  }

  // Check for common required fields
  const commonRequired = ['companyName', 'contactPerson', 'email', 'phone', 'partnerType'];
  commonRequired.forEach(field => {
    if (!leadData[field] || leadData[field].trim() === '') {
      errors.push(`Required field missing: ${field}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Prepare data for template merging
 * @param {Object} leadData - Lead data
 * @param {string} contractType - Contract type
 * @returns {Object} - Prepared data for template
 */
function prepareTemplateData(leadData, contractType) {
  const now = new Date();
  
  const baseData = {
    // Company information
    companyName: leadData.companyName || '',
    contactPerson: leadData.contactPerson || '',
    email: leadData.email || '',
    phone: leadData.phone || '',
    address: leadData.address || '',
    city: leadData.city || '',
    partnerType: leadData.partnerType || '',
    
    // Contract metadata
    contractDate: now.toLocaleDateString(),
    contractYear: now.getFullYear(),
    contractMonth: now.toLocaleDateString('en-US', { month: 'long' }),
    
    // Partner type specific
    contractType: contractType
  };

  if (contractType === 'person') {
    baseData.personName = leadData.personName || '';
    baseData.nationalId = leadData.nationalId || '';
    baseData.personAddress = leadData.personAddress || '';
  } else if (contractType === 'company') {
    baseData.companyRegistrationId = leadData.companyRegistrationId || '';
    baseData.companyTaxId = leadData.companyTaxId || '';
    baseData.companyOwnerName = leadData.companyOwnerName || '';
  }

  return baseData;
}

/**
 * Convert DOCX to PDF (optional - requires additional setup)
 * @param {Buffer} docxBuffer - DOCX buffer
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function convertToPDF(docxBuffer) {
  try {
    // This is a placeholder for PDF conversion
    // In production, you might use:
    // - LibreOffice headless mode
    // - Puppeteer with HTML conversion
    // - Cloud services like AWS Textract
    // - Third-party services
    
    console.log('⚠️ PDF conversion not implemented - returning DOCX buffer');
    return docxBuffer;
  } catch (error) {
    console.error('❌ Error converting to PDF:', error);
    throw new Error(`Failed to convert to PDF: ${error.message}`);
  }
}

/**
 * Get template preview data
 * @param {Array<string>} placeholders - Template placeholders
 * @returns {Object} - Sample data for preview
 */
function getPreviewData(placeholders) {
  const previewData = {
    companyName: 'Sample Company Ltd.',
    contactPerson: 'John Doe',
    email: 'john@samplecompany.com',
    phone: '+1234567890',
    address: '123 Business Street',
    city: 'Business City',
    partnerType: 'service_center',
    contractDate: new Date().toLocaleDateString(),
    contractYear: new Date().getFullYear(),
    contractMonth: new Date().toLocaleDateString('en-US', { month: 'long' }),
    contractType: 'person',
    personName: 'John Doe',
    nationalId: '123456789',
    personAddress: '123 Personal Street, Personal City',
    companyRegistrationId: 'REG123456',
    companyTaxId: 'TAX789012',
    companyOwnerName: 'Jane Smith'
  };

  // Only include placeholders that exist in the template
  const filteredData = {};
  placeholders.forEach(placeholder => {
    if (previewData.hasOwnProperty(placeholder)) {
      filteredData[placeholder] = previewData[placeholder];
    }
  });

  return filteredData;
}

module.exports = {
  extractPlaceholders,
  mergeTemplate,
  validateContractFields,
  prepareTemplateData,
  convertToPDF,
  getPreviewData
};
