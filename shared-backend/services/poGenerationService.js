/**
 * Purchase Order Generation Service
 * Handles PO creation, PDF generation, email sending, and AP integration
 */

const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

class POGenerationService {
  constructor() {
    this.poTemplate = {
      companyName: 'Clutch',
      companyAddress: '123 Business Street, Cairo, Egypt',
      companyPhone: '+20 2 1234 5678',
      companyEmail: 'procurement@clutch.com',
      logoPath: path.join(__dirname, '../assets/logo.png')
    };
  }

  /**
   * Generate Purchase Order from RFQ
   * @param {string} rfqId - RFQ ID
   * @param {Object} poData - PO data
   * @returns {Object} - Generated PO
   */
  async generatePOFromRFQ(rfqId, poData) {
    try {
      const rfqsCollection = await getCollection('rfqs');
      const suppliersCollection = await getCollection('procurement_suppliers');
      
      // Get RFQ
      const rfq = await rfqsCollection.findOne({ _id: new ObjectId(rfqId) });
      if (!rfq) {
        throw new Error('RFQ not found');
      }

      if (!rfq.selectedSupplierId) {
        throw new Error('No supplier selected for this RFQ');
      }

      // Get supplier details
      const supplier = await suppliersCollection.findOne({ _id: rfq.selectedSupplierId });
      if (!supplier) {
        throw new Error('Selected supplier not found');
      }

      // Generate PO number
      const poNumber = await this.generatePONumber();
      
      // Create PO
      const po = {
        poNumber,
        procurementRequestId: rfq.procurementRequestId,
        rfqId: new ObjectId(rfqId),
        supplierId: rfq.selectedSupplierId,
        supplierName: supplier.supplierName,
        items: this.mapRFQItemsToPOItems(rfq.items, rfq.supplierQuotes),
        subtotal: 0,
        taxAmount: 0,
        shippingCost: poData.shippingCost || 0,
        totalAmount: 0,
        currency: poData.currency || 'EGP',
        issueDate: new Date(),
        expectedDeliveryDate: poData.expectedDeliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deliveryAddress: poData.deliveryAddress,
        status: 'draft',
        paymentTerms: poData.paymentTerms || supplier.financials?.paymentTerms || 'net_30',
        paymentStatus: 'pending',
        attachments: [],
        notes: poData.notes,
        createdBy: new ObjectId(poData.createdBy),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate totals
      this.calculatePOTotals(po);

      // Save PO
      const posCollection = await getCollection('procurement_purchase_orders');
      const result = await posCollection.insertOne(po);
      
      return { ...po, _id: result.insertedId };
    } catch (error) {
      logger.error('Error generating PO from RFQ:', error);
      throw error;
    }
  }

  /**
   * Generate PO from scratch
   * @param {Object} poData - PO data
   * @returns {Object} - Generated PO
   */
  async generatePOFromScratch(poData) {
    try {
      // Generate PO number
      const poNumber = await this.generatePONumber();
      
      // Create PO
      const po = {
        poNumber,
        procurementRequestId: poData.procurementRequestId ? new ObjectId(poData.procurementRequestId) : null,
        rfqId: null,
        supplierId: new ObjectId(poData.supplierId),
        supplierName: poData.supplierName,
        items: poData.items,
        subtotal: 0,
        taxAmount: 0,
        shippingCost: poData.shippingCost || 0,
        totalAmount: 0,
        currency: poData.currency || 'EGP',
        issueDate: new Date(),
        expectedDeliveryDate: poData.expectedDeliveryDate,
        deliveryAddress: poData.deliveryAddress,
        status: 'draft',
        paymentTerms: poData.paymentTerms,
        paymentStatus: 'pending',
        attachments: [],
        notes: poData.notes,
        createdBy: new ObjectId(poData.createdBy),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Calculate totals
      this.calculatePOTotals(po);

      // Save PO
      const posCollection = await getCollection('procurement_purchase_orders');
      const result = await posCollection.insertOne(po);
      
      return { ...po, _id: result.insertedId };
    } catch (error) {
      logger.error('Error generating PO from scratch:', error);
      throw error;
    }
  }

  /**
   * Generate unique PO number
   * @returns {string} - PO number
   */
  async generatePONumber() {
    try {
      const posCollection = await getCollection('procurement_purchase_orders');
      const year = new Date().getFullYear();
      const prefix = `PO-${year}`;
      
      // Find the highest number for this year
      const lastPO = await posCollection.findOne(
        { poNumber: { $regex: `^${prefix}` } },
        { sort: { poNumber: -1 } }
      );
      
      let nextNumber = 1;
      if (lastPO) {
        const lastNumber = parseInt(lastPO.poNumber.split('-')[2]);
        nextNumber = lastNumber + 1;
      }
      
      return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      logger.error('Error generating PO number:', error);
      throw error;
    }
  }

  /**
   * Map RFQ items to PO items
   * @param {Array} rfqItems - RFQ items
   * @param {Array} supplierQuotes - Supplier quotes
   * @returns {Array} - PO items
   */
  mapRFQItemsToPOItems(rfqItems, supplierQuotes) {
    const selectedQuote = supplierQuotes.find(quote => quote.status === 'submitted');
    if (!selectedQuote) {
      throw new Error('No submitted quote found');
    }

    return rfqItems.map(rfqItem => {
      const quoteItem = selectedQuote.items.find(item => 
        item.rfqItemId === rfqItem._id.toString()
      );
      
      return {
        rfqItemId: rfqItem._id.toString(),
        itemName: rfqItem.itemName,
        description: rfqItem.description,
        quantity: rfqItem.quantity,
        unitPrice: quoteItem?.quotedUnitPrice || 0,
        totalPrice: quoteItem?.quotedTotalPrice || 0,
        unitOfMeasure: rfqItem.unitOfMeasure || 'unit',
        specifications: rfqItem.specifications,
        notes: rfqItem.notes
      };
    });
  }

  /**
   * Calculate PO totals
   * @param {Object} po - PO object
   */
  calculatePOTotals(po) {
    // Calculate subtotal
    po.subtotal = po.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate tax (assuming 14% VAT for Egypt)
    po.taxAmount = po.subtotal * 0.14;
    
    // Calculate total
    po.totalAmount = po.subtotal + po.taxAmount + po.shippingCost;
  }

  /**
   * Generate PDF for Purchase Order
   * @param {string} poId - PO ID
   * @returns {string} - PDF file path
   */
  async generatePOPDF(poId) {
    try {
      const posCollection = await getCollection('procurement_purchase_orders');
      const po = await posCollection.findOne({ _id: new ObjectId(poId) });
      
      if (!po) {
        throw new Error('Purchase Order not found');
      }

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set up file path
      const fileName = `PO-${po.poNumber}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads/pos', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Pipe PDF to file
      doc.pipe(fs.createWriteStream(filePath));
      
      // Generate PDF content
      await this.generatePDFContent(doc, po);
      
      // Finalize PDF
      doc.end();
      
      // Update PO with PDF attachment
      await posCollection.updateOne(
        { _id: new ObjectId(poId) },
        { 
          $push: { 
            attachments: {
              fileName,
              fileUrl: filePath,
              uploadedAt: new Date()
            }
          }
        }
      );
      
      return filePath;
    } catch (error) {
      logger.error('Error generating PO PDF:', error);
      throw error;
    }
  }

  /**
   * Generate PDF content
   * @param {PDFDocument} doc - PDF document
   * @param {Object} po - PO data
   */
  async generatePDFContent(doc, po) {
    try {
      // Header
      doc.fontSize(20).text('PURCHASE ORDER', { align: 'center' });
      doc.moveDown();
      
      // Company info
      doc.fontSize(12)
         .text(this.poTemplate.companyName, { align: 'left' })
         .text(this.poTemplate.companyAddress, { align: 'left' })
         .text(`Phone: ${this.poTemplate.companyPhone}`, { align: 'left' })
         .text(`Email: ${this.poTemplate.companyEmail}`, { align: 'left' });
      
      doc.moveDown();
      
      // PO details
      doc.fontSize(14).text('Purchase Order Details', { underline: true });
      doc.moveDown();
      
      doc.fontSize(10)
         .text(`PO Number: ${po.poNumber}`, { continued: true })
         .text(`Issue Date: ${po.issueDate.toLocaleDateString()}`, { align: 'right' })
         .text(`Supplier: ${po.supplierName}`, { continued: true })
         .text(`Expected Delivery: ${po.expectedDeliveryDate.toLocaleDateString()}`, { align: 'right' });
      
      doc.moveDown();
      
      // Items table
      doc.fontSize(12).text('Items:', { underline: true });
      doc.moveDown();
      
      // Table header
      const tableTop = doc.y;
      const itemCodeWidth = 100;
      const descriptionWidth = 200;
      const quantityWidth = 80;
      const unitPriceWidth = 80;
      const totalWidth = 80;
      
      doc.fontSize(10)
         .text('Item Code', 50, tableTop)
         .text('Description', 50 + itemCodeWidth, tableTop)
         .text('Qty', 50 + itemCodeWidth + descriptionWidth, tableTop)
         .text('Unit Price', 50 + itemCodeWidth + descriptionWidth + quantityWidth, tableTop)
         .text('Total', 50 + itemCodeWidth + descriptionWidth + quantityWidth + unitPriceWidth, tableTop);
      
      // Draw table lines
      doc.moveTo(50, tableTop + 20)
         .lineTo(50 + itemCodeWidth + descriptionWidth + quantityWidth + unitPriceWidth + totalWidth, tableTop + 20)
         .stroke();
      
      // Items rows
      let currentY = tableTop + 30;
      po.items.forEach((item, index) => {
        if (currentY > 700) { // New page if needed
          doc.addPage();
          currentY = 50;
        }
        
        doc.text(item.itemName || `Item ${index + 1}`, 50, currentY)
           .text(item.description || '', 50 + itemCodeWidth, currentY)
           .text(item.quantity.toString(), 50 + itemCodeWidth + descriptionWidth, currentY)
           .text(`${item.unitPrice.toFixed(2)} ${po.currency}`, 50 + itemCodeWidth + descriptionWidth + quantityWidth, currentY)
           .text(`${item.totalPrice.toFixed(2)} ${po.currency}`, 50 + itemCodeWidth + descriptionWidth + quantityWidth + unitPriceWidth, currentY);
        
        currentY += 20;
      });
      
      // Totals
      doc.moveDown();
      doc.text(`Subtotal: ${po.subtotal.toFixed(2)} ${po.currency}`, { align: 'right' });
      doc.text(`Tax (14%): ${po.taxAmount.toFixed(2)} ${po.currency}`, { align: 'right' });
      if (po.shippingCost > 0) {
        doc.text(`Shipping: ${po.shippingCost.toFixed(2)} ${po.currency}`, { align: 'right' });
      }
      doc.fontSize(12).text(`Total: ${po.totalAmount.toFixed(2)} ${po.currency}`, { align: 'right' });
      
      // Terms and conditions
      doc.moveDown();
      doc.fontSize(10).text('Terms and Conditions:', { underline: true });
      doc.text(`Payment Terms: ${po.paymentTerms}`);
      doc.text(`Delivery Address: ${po.deliveryAddress}`);
      if (po.notes) {
        doc.text(`Notes: ${po.notes}`);
      }
      
    } catch (error) {
      logger.error('Error generating PDF content:', error);
      throw error;
    }
  }

  /**
   * Send PO via email
   * @param {string} poId - PO ID
   * @param {Object} emailData - Email data
   * @returns {Object} - Email result
   */
  async sendPOEmail(poId, emailData) {
    try {
      const posCollection = await getCollection('procurement_purchase_orders');
      const po = await posCollection.findOne({ _id: new ObjectId(poId) });
      
      if (!po) {
        throw new Error('Purchase Order not found');
      }

      // Generate PDF if not exists
      let pdfPath = po.attachments?.find(att => att.fileName.endsWith('.pdf'))?.fileUrl;
      if (!pdfPath) {
        pdfPath = await this.generatePOPDF(poId);
      }

      // Send email
      const emailResult = await this.sendEmailWithAttachment(
        emailData.recipientEmail,
        `Purchase Order ${po.poNumber}`,
        this.generateEmailBody(po, emailData),
        pdfPath
      );

      // Update PO status
      await posCollection.updateOne(
        { _id: new ObjectId(poId) },
        { 
          $set: { 
            status: 'issued',
            issuedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      return emailResult;
    } catch (error) {
      logger.error('Error sending PO email:', error);
      throw error;
    }
  }

  /**
   * Generate email body
   * @param {Object} po - PO data
   * @param {Object} emailData - Email data
   * @returns {string} - Email body
   */
  generateEmailBody(po, emailData) {
    return `
Dear ${po.supplierName},

Please find attached Purchase Order ${po.poNumber} for your review and processing.

PO Details:
- PO Number: ${po.poNumber}
- Issue Date: ${po.issueDate.toLocaleDateString()}
- Expected Delivery: ${po.expectedDeliveryDate.toLocaleDateString()}
- Total Amount: ${po.totalAmount.toFixed(2)} ${po.currency}
- Payment Terms: ${po.paymentTerms}

Please confirm receipt of this PO and provide your expected delivery timeline.

For any questions, please contact our procurement team.

Best regards,
Clutch Procurement Team

${emailData.customMessage || ''}
    `.trim();
  }

  /**
   * Send email with attachment
   * @param {string} recipientEmail - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @param {string} attachmentPath - Attachment path
   * @returns {Object} - Email result
   */
  async sendEmailWithAttachment(recipientEmail, subject, body, attachmentPath) {
    try {
      // Implementation for sending email with attachment
      // This would integrate with the email service
      logger.info(`Sending PO email to ${recipientEmail} with attachment ${attachmentPath}`);
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        recipient: recipientEmail,
        subject
      };
    } catch (error) {
      logger.error('Error sending email with attachment:', error);
      throw error;
    }
  }

  /**
   * Integrate with Accounts Payable system
   * @param {string} poId - PO ID
   * @returns {Object} - AP integration result
   */
  async integrateWithAP(poId) {
    try {
      const posCollection = await getCollection('procurement_purchase_orders');
      const po = await posCollection.findOne({ _id: new ObjectId(poId) });
      
      if (!po) {
        throw new Error('Purchase Order not found');
      }

      // Create AP bill
      const apBill = {
        billNumber: `BILL-${po.poNumber}`,
        poId: new ObjectId(poId),
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        amount: po.totalAmount,
        currency: po.currency,
        dueDate: this.calculateDueDate(po.issueDate, po.paymentTerms),
        status: 'pending',
        paymentTerms: po.paymentTerms,
        items: po.items,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to AP system
      const apCollection = await getCollection('bills');
      const result = await apCollection.insertOne(apBill);

      // Update PO with AP bill reference
      await posCollection.updateOne(
        { _id: new ObjectId(poId) },
        { 
          $set: { 
            invoiceId: result.insertedId,
            updatedAt: new Date()
          }
        }
      );

      return {
        success: true,
        apBillId: result.insertedId,
        billNumber: apBill.billNumber
      };
    } catch (error) {
      logger.error('Error integrating with AP:', error);
      throw error;
    }
  }

  /**
   * Calculate due date based on payment terms
   * @param {Date} issueDate - Issue date
   * @param {string} paymentTerms - Payment terms
   * @returns {Date} - Due date
   */
  calculateDueDate(issueDate, paymentTerms) {
    const days = this.getPaymentTermsDays(paymentTerms);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  }

  /**
   * Get payment terms days
   * @param {string} paymentTerms - Payment terms
   * @returns {number} - Days
   */
  getPaymentTermsDays(paymentTerms) {
    const termsMap = {
      'net_15': 15,
      'net_30': 30,
      'net_45': 45,
      'net_60': 60,
      'due_on_receipt': 0
    };
    
    return termsMap[paymentTerms] || 30;
  }

  /**
   * Get PO analytics
   * @param {Object} filters - Filter criteria
   * @returns {Object} - PO analytics
   */
  async getPOAnalytics(filters = {}) {
    try {
      const posCollection = await getCollection('procurement_purchase_orders');
      
      // Build query
      const query = {};
      if (filters.startDate) query.issueDate = { $gte: new Date(filters.startDate) };
      if (filters.endDate) query.issueDate = { ...query.issueDate, $lte: new Date(filters.endDate) };
      if (filters.status) query.status = filters.status;
      if (filters.supplierId) query.supplierId = new ObjectId(filters.supplierId);

      // Get POs
      const pos = await posCollection.find(query).toArray();

      // Calculate analytics
      const analytics = {
        totalPOs: pos.length,
        totalValue: pos.reduce((sum, po) => sum + po.totalAmount, 0),
        byStatus: this.groupPOsByStatus(pos),
        bySupplier: this.groupPOsBySupplier(pos),
        averagePOValue: this.calculateAveragePOValue(pos),
        onTimeDelivery: this.calculateOnTimeDelivery(pos),
        topSuppliers: this.getTopPOSuppliers(pos)
      };

      return analytics;
    } catch (error) {
      logger.error('Error getting PO analytics:', error);
      throw error;
    }
  }

  /**
   * Group POs by status
   * @param {Array} pos - POs array
   * @returns {Object} - Status groups
   */
  groupPOsByStatus(pos) {
    const groups = {};
    pos.forEach(po => {
      groups[po.status] = (groups[po.status] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group POs by supplier
   * @param {Array} pos - POs array
   * @returns {Object} - Supplier groups
   */
  groupPOsBySupplier(pos) {
    const groups = {};
    pos.forEach(po => {
      groups[po.supplierName] = (groups[po.supplierName] || 0) + 1;
    });
    return groups;
  }

  /**
   * Calculate average PO value
   * @param {Array} pos - POs array
   * @returns {number} - Average value
   */
  calculateAveragePOValue(pos) {
    if (pos.length === 0) return 0;
    const totalValue = pos.reduce((sum, po) => sum + po.totalAmount, 0);
    return totalValue / pos.length;
  }

  /**
   * Calculate on-time delivery percentage
   * @param {Array} pos - POs array
   * @returns {number} - On-time delivery percentage
   */
  calculateOnTimeDelivery(pos) {
    const deliveredPOs = pos.filter(po => po.status === 'received' && po.actualDeliveryDate);
    if (deliveredPOs.length === 0) return 0;
    
    const onTimePOs = deliveredPOs.filter(po => 
      new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate)
    );
    
    return (onTimePOs.length / deliveredPOs.length) * 100;
  }

  /**
   * Get top PO suppliers
   * @param {Array} pos - POs array
   * @returns {Array} - Top suppliers
   */
  getTopPOSuppliers(pos) {
    const supplierStats = {};
    pos.forEach(po => {
      if (!supplierStats[po.supplierName]) {
        supplierStats[po.supplierName] = { count: 0, totalValue: 0 };
      }
      supplierStats[po.supplierName].count++;
      supplierStats[po.supplierName].totalValue += po.totalAmount;
    });
    
    return Object.entries(supplierStats)
      .map(([supplierName, stats]) => ({ supplierName, ...stats }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  }
}

module.exports = new POGenerationService();
