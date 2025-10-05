/**
 * RFQ (Request for Quotation) Service
 * Handles RFQ creation, supplier invitations, quote collection, and evaluation
 */

const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');
const logger = require('../config/logger');

class RFQService {
  constructor() {
    this.evaluationCriteria = {
      PRICE: { weight: 0.4, name: 'Price' },
      QUALITY: { weight: 0.25, name: 'Quality' },
      DELIVERY: { weight: 0.2, name: 'Delivery Time' },
      COMPLIANCE: { weight: 0.1, name: 'Compliance' },
      SUPPORT: { weight: 0.05, name: 'Support' }
    };
  }

  /**
   * Create RFQ from procurement request
   * @param {string} requestId - Procurement request ID
   * @param {Object} rfqData - RFQ data
   * @returns {Object} - Created RFQ
   */
  async createRFQFromRequest(requestId, rfqData) {
    try {
      const requestsCollection = await getCollection('procurement_requests');
      const request = await requestsCollection.findOne({ _id: new ObjectId(requestId) });
      
      if (!request) {
        throw new Error('Procurement request not found');
      }

      // Generate RFQ number
      const rfqNumber = await this.generateRFQNumber();
      
      // Create RFQ
      const rfq = {
        rfqNumber,
        procurementRequestId: new ObjectId(requestId),
        title: rfqData.title || `RFQ for ${request.department}`,
        description: rfqData.description || request.notes,
        items: request.items.map(item => ({
          procurementRequestItemId: item._id,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitOfMeasure: item.unitOfMeasure || 'unit',
          specifications: item.specifications,
          requiredByDate: item.expectedDeliveryDate,
          notes: item.notes
        })),
        invitedSuppliers: [],
        supplierQuotes: [],
        issueDate: new Date(),
        dueDate: rfqData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'draft',
        evaluationCriteria: rfqData.evaluationCriteria || Object.keys(this.evaluationCriteria),
        scoringMatrix: rfqData.scoringMatrix || this.evaluationCriteria,
        attachments: [],
        createdBy: new ObjectId(rfqData.createdBy),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const rfqsCollection = await getCollection('rfqs');
      const result = await rfqsCollection.insertOne(rfq);
      
      return { ...rfq, _id: result.insertedId };
    } catch (error) {
      logger.error('Error creating RFQ from request:', error);
      throw error;
    }
  }

  /**
   * Create RFQ from scratch
   * @param {Object} rfqData - RFQ data
   * @returns {Object} - Created RFQ
   */
  async createRFQFromScratch(rfqData) {
    try {
      // Generate RFQ number
      const rfqNumber = await this.generateRFQNumber();
      
      // Create RFQ
      const rfq = {
        rfqNumber,
        procurementRequestId: null,
        title: rfqData.title,
        description: rfqData.description,
        items: rfqData.items,
        invitedSuppliers: [],
        supplierQuotes: [],
        issueDate: new Date(),
        dueDate: rfqData.dueDate,
        status: 'draft',
        evaluationCriteria: rfqData.evaluationCriteria || Object.keys(this.evaluationCriteria),
        scoringMatrix: rfqData.scoringMatrix || this.evaluationCriteria,
        attachments: [],
        createdBy: new ObjectId(rfqData.createdBy),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const rfqsCollection = await getCollection('rfqs');
      const result = await rfqsCollection.insertOne(rfq);
      
      return { ...rfq, _id: result.insertedId };
    } catch (error) {
      logger.error('Error creating RFQ from scratch:', error);
      throw error;
    }
  }

  /**
   * Generate unique RFQ number
   * @returns {string} - RFQ number
   */
  async generateRFQNumber() {
    try {
      const rfqsCollection = await getCollection('rfqs');
      const year = new Date().getFullYear();
      const prefix = `RFQ-${year}`;
      
      // Find the highest number for this year
      const lastRFQ = await rfqsCollection.findOne(
        { rfqNumber: { $regex: `^${prefix}` } },
        { sort: { rfqNumber: -1 } }
      );
      
      let nextNumber = 1;
      if (lastRFQ) {
        const lastNumber = parseInt(lastRFQ.rfqNumber.split('-')[2]);
        nextNumber = lastNumber + 1;
      }
      
      return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      logger.error('Error generating RFQ number:', error);
      throw error;
    }
  }

  /**
   * Invite suppliers to RFQ
   * @param {string} rfqId - RFQ ID
   * @param {Array} supplierIds - Supplier IDs
   * @param {Object} invitationData - Invitation data
   * @returns {Object} - Invitation result
   */
  async inviteSuppliersToRFQ(rfqId, supplierIds, invitationData = {}) {
    try {
      const rfqsCollection = await getCollection('rfqs');
      const suppliersCollection = await getCollection('procurement_suppliers');
      
      // Get RFQ
      const rfq = await rfqsCollection.findOne({ _id: new ObjectId(rfqId) });
      if (!rfq) {
        throw new Error('RFQ not found');
      }

      // Get supplier details
      const suppliers = await suppliersCollection.find({
        _id: { $in: supplierIds.map(id => new ObjectId(id)) },
        isActive: true
      }).toArray();

      if (suppliers.length !== supplierIds.length) {
        throw new Error('Some suppliers not found or inactive');
      }

      // Update RFQ with invited suppliers
      await rfqsCollection.updateOne(
        { _id: new ObjectId(rfqId) },
        { 
          $set: { 
            invitedSuppliers: supplierIds.map(id => new ObjectId(id)),
            status: 'issued',
            updatedAt: new Date()
          }
        }
      );

      // Send invitations
      const invitations = await this.sendSupplierInvitations(rfq, suppliers, invitationData);

      return {
        success: true,
        invitedCount: suppliers.length,
        invitations
      };
    } catch (error) {
      logger.error('Error inviting suppliers to RFQ:', error);
      throw error;
    }
  }

  /**
   * Send supplier invitations
   * @param {Object} rfq - RFQ data
   * @param {Array} suppliers - Supplier data
   * @param {Object} invitationData - Invitation data
   * @returns {Array} - Invitation results
   */
  async sendSupplierInvitations(rfq, suppliers, invitationData) {
    try {
      const invitations = [];
      
      for (const supplier of suppliers) {
        const invitation = {
          rfqId: rfq._id,
          supplierId: supplier._id,
          supplierName: supplier.supplierName,
          supplierEmail: supplier.contactInfo?.primaryContact?.email,
          invitationDate: new Date(),
          status: 'sent',
          message: invitationData.message || this.generateDefaultInvitationMessage(rfq, supplier),
          attachments: invitationData.attachments || []
        };

        // Send email invitation
        await this.sendEmailInvitation(invitation, rfq);
        
        invitations.push(invitation);
      }

      return invitations;
    } catch (error) {
      logger.error('Error sending supplier invitations:', error);
      throw error;
    }
  }

  /**
   * Generate default invitation message
   * @param {Object} rfq - RFQ data
   * @param {Object} supplier - Supplier data
   * @returns {string} - Invitation message
   */
  generateDefaultInvitationMessage(rfq, supplier) {
    return `
Dear ${supplier.supplierName},

We are pleased to invite you to participate in our Request for Quotation (RFQ) ${rfq.rfqNumber}.

RFQ Details:
- Title: ${rfq.title}
- Due Date: ${rfq.dueDate.toLocaleDateString()}
- Items: ${rfq.items.length} items

Please review the attached documents and submit your quotation by the due date.

For any questions, please contact our procurement team.

Best regards,
Clutch Procurement Team
    `.trim();
  }

  /**
   * Send email invitation
   * @param {Object} invitation - Invitation data
   * @param {Object} rfq - RFQ data
   */
  async sendEmailInvitation(invitation, rfq) {
    try {
      // Implementation for sending email invitations
      // This would integrate with the email service
      logger.info(`Sending RFQ invitation to ${invitation.supplierName} for RFQ ${rfq.rfqNumber}`);
    } catch (error) {
      logger.error('Error sending email invitation:', error);
    }
  }

  /**
   * Submit supplier quote
   * @param {string} rfqId - RFQ ID
   * @param {Object} quoteData - Quote data
   * @returns {Object} - Submitted quote
   */
  async submitSupplierQuote(rfqId, quoteData) {
    try {
      const rfqsCollection = await getCollection('rfqs');
      const suppliersCollection = await getCollection('procurement_suppliers');
      
      // Get RFQ
      const rfq = await rfqsCollection.findOne({ _id: new ObjectId(rfqId) });
      if (!rfq) {
        throw new Error('RFQ not found');
      }

      // Verify supplier is invited
      const supplierId = new ObjectId(quoteData.supplierId);
      if (!rfq.invitedSuppliers.some(id => id.toString() === supplierId.toString())) {
        throw new Error('Supplier not invited to this RFQ');
      }

      // Get supplier details
      const supplier = await suppliersCollection.findOne({ _id: supplierId });
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // Create quote
      const quote = {
        supplierId,
        supplierName: supplier.supplierName,
        items: quoteData.items,
        totalQuoteAmount: quoteData.totalQuoteAmount,
        currency: quoteData.currency || 'EGP',
        paymentTerms: quoteData.paymentTerms,
        deliveryTime: quoteData.deliveryTime,
        quoteDate: new Date(),
        status: 'submitted',
        attachments: quoteData.attachments || [],
        notes: quoteData.notes
      };

      // Add quote to RFQ
      await rfqsCollection.updateOne(
        { _id: new ObjectId(rfqId) },
        { 
          $push: { supplierQuotes: quote },
          $set: { 
            status: 'quotes_received',
            updatedAt: new Date()
          }
        }
      );

      return quote;
    } catch (error) {
      logger.error('Error submitting supplier quote:', error);
      throw error;
    }
  }

  /**
   * Evaluate supplier quotes
   * @param {string} rfqId - RFQ ID
   * @param {Object} evaluationData - Evaluation data
   * @returns {Object} - Evaluation result
   */
  async evaluateSupplierQuotes(rfqId, evaluationData) {
    try {
      const rfqsCollection = await getCollection('rfqs');
      
      // Get RFQ
      const rfq = await rfqsCollection.findOne({ _id: new ObjectId(rfqId) });
      if (!rfq) {
        throw new Error('RFQ not found');
      }

      if (rfq.supplierQuotes.length === 0) {
        throw new Error('No quotes to evaluate');
      }

      // Evaluate each quote
      const evaluations = [];
      for (const quote of rfq.supplierQuotes) {
        const evaluation = await this.evaluateQuote(quote, rfq.scoringMatrix, evaluationData);
        evaluations.push(evaluation);
      }

      // Sort by total score
      evaluations.sort((a, b) => b.totalScore - a.totalScore);

      // Update RFQ with evaluations
      await rfqsCollection.updateOne(
        { _id: new ObjectId(rfqId) },
        { 
          $set: { 
            status: 'under_evaluation',
            evaluations,
            updatedAt: new Date()
          }
        }
      );

      return {
        rfqId,
        evaluations,
        recommendedSupplier: evaluations[0],
        evaluationDate: new Date()
      };
    } catch (error) {
      logger.error('Error evaluating supplier quotes:', error);
      throw error;
    }
  }

  /**
   * Evaluate individual quote
   * @param {Object} quote - Quote data
   * @param {Object} scoringMatrix - Scoring matrix
   * @param {Object} evaluationData - Evaluation data
   * @returns {Object} - Quote evaluation
   */
  async evaluateQuote(quote, scoringMatrix, evaluationData) {
    try {
      const evaluation = {
        supplierId: quote.supplierId,
        supplierName: quote.supplierName,
        scores: {},
        totalScore: 0,
        rank: 0
      };

      // Calculate scores for each criterion
      for (const [criterion, weight] of Object.entries(scoringMatrix)) {
        const score = await this.calculateCriterionScore(quote, criterion, evaluationData);
        evaluation.scores[criterion] = {
          score,
          weight: weight.weight || weight,
          weightedScore: score * (weight.weight || weight)
        };
        evaluation.totalScore += evaluation.scores[criterion].weightedScore;
      }

      return evaluation;
    } catch (error) {
      logger.error('Error evaluating quote:', error);
      throw error;
    }
  }

  /**
   * Calculate score for a specific criterion
   * @param {Object} quote - Quote data
   * @param {string} criterion - Criterion name
   * @param {Object} evaluationData - Evaluation data
   * @returns {number} - Score (0-100)
   */
  async calculateCriterionScore(quote, criterion, evaluationData) {
    try {
      switch (criterion) {
        case 'PRICE':
          return this.calculatePriceScore(quote, evaluationData);
        case 'QUALITY':
          return this.calculateQualityScore(quote, evaluationData);
        case 'DELIVERY':
          return this.calculateDeliveryScore(quote, evaluationData);
        case 'COMPLIANCE':
          return this.calculateComplianceScore(quote, evaluationData);
        case 'SUPPORT':
          return this.calculateSupportScore(quote, evaluationData);
        default:
          return 50; // Default score
      }
    } catch (error) {
      logger.error('Error calculating criterion score:', error);
      return 50;
    }
  }

  /**
   * Calculate price score
   * @param {Object} quote - Quote data
   * @param {Object} evaluationData - Evaluation data
   * @returns {number} - Price score
   */
  calculatePriceScore(quote, evaluationData) {
    // Lower price gets higher score
    const baseScore = 100;
    const priceVariance = (quote.totalQuoteAmount - evaluationData.budgetEstimate) / evaluationData.budgetEstimate;
    
    if (priceVariance <= 0) return 100; // Under budget
    if (priceVariance <= 0.1) return 90; // 10% over budget
    if (priceVariance <= 0.2) return 80; // 20% over budget
    if (priceVariance <= 0.3) return 70; // 30% over budget
    return 50; // More than 30% over budget
  }

  /**
   * Calculate quality score
   * @param {Object} quote - Quote data
   * @param {Object} evaluationData - Evaluation data
   * @returns {number} - Quality score
   */
  calculateQualityScore(quote, evaluationData) {
    // Based on supplier performance history and certifications
    return 75; // Default quality score
  }

  /**
   * Calculate delivery score
   * @param {Object} quote - Quote data
   * @param {Object} evaluationData - Evaluation data
   * @returns {number} - Delivery score
   */
  calculateDeliveryScore(quote, evaluationData) {
    // Shorter delivery time gets higher score
    const requiredDays = evaluationData.requiredDeliveryDays || 30;
    const quotedDays = quote.deliveryTime || 30;
    
    if (quotedDays <= requiredDays) return 100;
    if (quotedDays <= requiredDays * 1.2) return 90;
    if (quotedDays <= requiredDays * 1.5) return 80;
    return 60;
  }

  /**
   * Calculate compliance score
   * @param {Object} quote - Quote data
   * @param {Object} evaluationData - Evaluation data
   * @returns {number} - Compliance score
   */
  calculateComplianceScore(quote, evaluationData) {
    // Based on supplier compliance history
    return 85; // Default compliance score
  }

  /**
   * Calculate support score
   * @param {Object} quote - Quote data
   * @param {Object} evaluationData - Evaluation data
   * @returns {number} - Support score
   */
  calculateSupportScore(quote, evaluationData) {
    // Based on supplier support capabilities
    return 80; // Default support score
  }

  /**
   * Award RFQ to supplier
   * @param {string} rfqId - RFQ ID
   * @param {string} supplierId - Supplier ID
   * @param {Object} awardData - Award data
   * @returns {Object} - Award result
   */
  async awardRFQToSupplier(rfqId, supplierId, awardData) {
    try {
      const rfqsCollection = await getCollection('rfqs');
      
      // Update RFQ with selected supplier
      await rfqsCollection.updateOne(
        { _id: new ObjectId(rfqId) },
        { 
          $set: { 
            selectedSupplierId: new ObjectId(supplierId),
            status: 'awarded',
            awardDate: new Date(),
            awardNotes: awardData.notes,
            updatedAt: new Date()
          }
        }
      );

      // Send award notification
      await this.sendAwardNotification(rfqId, supplierId, awardData);

      return {
        success: true,
        rfqId,
        selectedSupplierId: supplierId,
        awardDate: new Date()
      };
    } catch (error) {
      logger.error('Error awarding RFQ to supplier:', error);
      throw error;
    }
  }

  /**
   * Send award notification
   * @param {string} rfqId - RFQ ID
   * @param {string} supplierId - Supplier ID
   * @param {Object} awardData - Award data
   */
  async sendAwardNotification(rfqId, supplierId, awardData) {
    try {
      // Implementation for sending award notifications
      // This would integrate with the notification service
      logger.info(`Sending award notification for RFQ ${rfqId} to supplier ${supplierId}`);
    } catch (error) {
      logger.error('Error sending award notification:', error);
    }
  }

  /**
   * Get RFQ analytics
   * @param {Object} filters - Filter criteria
   * @returns {Object} - RFQ analytics
   */
  async getRFQAnalytics(filters = {}) {
    try {
      const rfqsCollection = await getCollection('rfqs');
      
      // Build query
      const query = {};
      if (filters.startDate) query.issueDate = { $gte: new Date(filters.startDate) };
      if (filters.endDate) query.issueDate = { ...query.issueDate, $lte: new Date(filters.endDate) };
      if (filters.status) query.status = filters.status;
      if (filters.department) query.department = filters.department;

      // Get RFQs
      const rfqs = await rfqsCollection.find(query).toArray();

      // Calculate analytics
      const analytics = {
        totalRFQs: rfqs.length,
        byStatus: this.groupByStatus(rfqs),
        byDepartment: this.groupByDepartment(rfqs),
        averageQuotesPerRFQ: this.calculateAverageQuotesPerRFQ(rfqs),
        averageEvaluationTime: this.calculateAverageEvaluationTime(rfqs),
        topSuppliers: this.getTopSuppliers(rfqs),
        costSavings: this.calculateCostSavings(rfqs)
      };

      return analytics;
    } catch (error) {
      logger.error('Error getting RFQ analytics:', error);
      throw error;
    }
  }

  /**
   * Group RFQs by status
   * @param {Array} rfqs - RFQs array
   * @returns {Object} - Status groups
   */
  groupByStatus(rfqs) {
    const groups = {};
    rfqs.forEach(rfq => {
      groups[rfq.status] = (groups[rfq.status] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group RFQs by department
   * @param {Array} rfqs - RFQs array
   * @returns {Object} - Department groups
   */
  groupByDepartment(rfqs) {
    const groups = {};
    rfqs.forEach(rfq => {
      const department = rfq.department || 'Unknown';
      groups[department] = (groups[department] || 0) + 1;
    });
    return groups;
  }

  /**
   * Calculate average quotes per RFQ
   * @param {Array} rfqs - RFQs array
   * @returns {number} - Average quotes
   */
  calculateAverageQuotesPerRFQ(rfqs) {
    if (rfqs.length === 0) return 0;
    const totalQuotes = rfqs.reduce((sum, rfq) => sum + (rfq.supplierQuotes?.length || 0), 0);
    return totalQuotes / rfqs.length;
  }

  /**
   * Calculate average evaluation time
   * @param {Array} rfqs - RFQs array
   * @returns {number} - Average evaluation time in days
   */
  calculateAverageEvaluationTime(rfqs) {
    const evaluatedRFQs = rfqs.filter(rfq => rfq.status === 'awarded' && rfq.awardDate);
    if (evaluatedRFQs.length === 0) return 0;
    
    const totalDays = evaluatedRFQs.reduce((sum, rfq) => {
      const days = (rfq.awardDate - rfq.issueDate) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    return totalDays / evaluatedRFQs.length;
  }

  /**
   * Get top suppliers
   * @param {Array} rfqs - RFQs array
   * @returns {Array} - Top suppliers
   */
  getTopSuppliers(rfqs) {
    const supplierCounts = {};
    rfqs.forEach(rfq => {
      if (rfq.selectedSupplierId) {
        const supplierId = rfq.selectedSupplierId.toString();
        supplierCounts[supplierId] = (supplierCounts[supplierId] || 0) + 1;
      }
    });
    
    return Object.entries(supplierCounts)
      .map(([supplierId, count]) => ({ supplierId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Calculate cost savings
   * @param {Array} rfqs - RFQs array
   * @returns {Object} - Cost savings data
   */
  calculateCostSavings(rfqs) {
    // Implementation for calculating cost savings
    return {
      totalSavings: 0,
      averageSavings: 0,
      savingsPercentage: 0
    };
  }
}

module.exports = new RFQService();
