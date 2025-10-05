const ProcurementContract = require('../models/ProcurementContract');
const PartnerContract = require('../models/PartnerContract');
const Legal = require('../models/Legal');
const logger = require('../utils/logger');

class ContractLifecycleService {
  constructor() {
    this.contractStatuses = {
      draft: 'draft',
      pending_review: 'pending_review',
      under_review: 'under_review',
      approved: 'approved',
      active: 'active',
      expired: 'expired',
      terminated: 'terminated',
      renewed: 'renewed'
    };

    this.renewalReminders = {
      '90_days': 90,
      '60_days': 60,
      '30_days': 30,
      '15_days': 15,
      '7_days': 7,
      '1_day': 1
    };
  }

  /**
   * Create a new contract
   */
  async createContract(contractData, userId) {
    try {
      // Generate contract number
      const contractNumber = await this.generateContractNumber(contractData.contractType);
      
      const contract = new ProcurementContract({
        ...contractData,
        contractNumber,
        createdBy: userId,
        status: this.contractStatuses.draft
      });

      await contract.save();

      // Create initial lifecycle entry
      await this.createLifecycleEntry(contract._id, 'created', 'Contract created', userId);

      return contract;
    } catch (error) {
      logger.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Generate unique contract number
   */
  async generateContractNumber(contractType) {
    const prefix = this.getContractPrefix(contractType);
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get the last contract number for this type and month
    const lastContract = await ProcurementContract.findOne({
      contractNumber: new RegExp(`^${prefix}${year}${month}`)
    }).sort({ contractNumber: -1 });

    let sequence = 1;
    if (lastContract) {
      const lastSequence = parseInt(lastContract.contractNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Get contract prefix based on type
   */
  getContractPrefix(contractType) {
    const prefixes = {
      'blanket': 'BLK',
      'fixed_price': 'FP',
      'cost_plus': 'CP',
      'time_materials': 'TM',
      'retainer': 'RET',
      'other': 'CTR'
    };
    return prefixes[contractType] || 'CTR';
  }

  /**
   * Submit contract for review
   */
  async submitForReview(contractId, userId) {
    try {
      const contract = await ProcurementContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      if (contract.status !== this.contractStatuses.draft) {
        throw new Error('Contract must be in draft status to submit for review');
      }

      contract.status = this.contractStatuses.pending_review;
      contract.submittedAt = new Date();
      contract.submittedBy = userId;

      await contract.save();

      // Create lifecycle entry
      await this.createLifecycleEntry(contractId, 'submitted_for_review', 'Contract submitted for review', userId);

      // Send notification to legal team
      await this.sendReviewNotification(contract);

      return contract;
    } catch (error) {
      logger.error('Error submitting contract for review:', error);
      throw error;
    }
  }

  /**
   * Review contract
   */
  async reviewContract(contractId, reviewData, userId) {
    try {
      const contract = await ProcurementContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      if (contract.status !== this.contractStatuses.pending_review) {
        throw new Error('Contract must be pending review');
      }

      contract.status = this.contractStatuses.under_review;
      contract.review = {
        reviewedBy: userId,
        reviewedAt: new Date(),
        comments: reviewData.comments,
        reviewNotes: reviewData.reviewNotes,
        requiredChanges: reviewData.requiredChanges || []
      };

      await contract.save();

      // Create lifecycle entry
      await this.createLifecycleEntry(contractId, 'under_review', 'Contract under review', userId);

      return contract;
    } catch (error) {
      logger.error('Error reviewing contract:', error);
      throw error;
    }
  }

  /**
   * Approve contract
   */
  async approveContract(contractId, approvalData, userId) {
    try {
      const contract = await ProcurementContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      if (!['pending_review', 'under_review'].includes(contract.status)) {
        throw new Error('Contract must be pending or under review to approve');
      }

      contract.status = this.contractStatuses.approved;
      contract.approval = {
        approvedBy: userId,
        approvedAt: new Date(),
        approvalComments: approvalData.comments,
        conditions: approvalData.conditions || []
      };

      // Set activation date
      contract.activationDate = approvalData.activationDate || new Date();

      await contract.save();

      // Create lifecycle entry
      await this.createLifecycleEntry(contractId, 'approved', 'Contract approved', userId);

      // Send approval notification
      await this.sendApprovalNotification(contract);

      return contract;
    } catch (error) {
      logger.error('Error approving contract:', error);
      throw error;
    }
  }

  /**
   * Activate contract
   */
  async activateContract(contractId, userId) {
    try {
      const contract = await ProcurementContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      if (contract.status !== this.contractStatuses.approved) {
        throw new Error('Contract must be approved to activate');
      }

      contract.status = this.contractStatuses.active;
      contract.activatedAt = new Date();
      contract.activatedBy = userId;

      await contract.save();

      // Create lifecycle entry
      await this.createLifecycleEntry(contractId, 'activated', 'Contract activated', userId);

      // Set up renewal reminders
      await this.setupRenewalReminders(contract);

      return contract;
    } catch (error) {
      logger.error('Error activating contract:', error);
      throw error;
    }
  }

  /**
   * Terminate contract
   */
  async terminateContract(contractId, terminationData, userId) {
    try {
      const contract = await ProcurementContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      if (!['active', 'approved'].includes(contract.status)) {
        throw new Error('Contract must be active or approved to terminate');
      }

      contract.status = this.contractStatuses.terminated;
      contract.termination = {
        terminatedBy: userId,
        terminatedAt: new Date(),
        reason: terminationData.reason,
        effectiveDate: terminationData.effectiveDate || new Date(),
        noticePeriod: terminationData.noticePeriod,
        terminationClause: terminationData.terminationClause
      };

      await contract.save();

      // Create lifecycle entry
      await this.createLifecycleEntry(contractId, 'terminated', 'Contract terminated', userId);

      // Send termination notification
      await this.sendTerminationNotification(contract);

      return contract;
    } catch (error) {
      logger.error('Error terminating contract:', error);
      throw error;
    }
  }

  /**
   * Renew contract
   */
  async renewContract(contractId, renewalData, userId) {
    try {
      const contract = await ProcurementContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }

      if (contract.status !== this.contractStatuses.active) {
        throw new Error('Contract must be active to renew');
      }

      // Create new contract based on existing one
      const newContractData = {
        ...contract.toObject(),
        _id: undefined,
        contractId: undefined,
        contractNumber: undefined,
        status: this.contractStatuses.draft,
        terms: {
          ...contract.terms,
          startDate: renewalData.newStartDate,
          endDate: renewalData.newEndDate,
          value: renewalData.newValue || contract.terms.value
        },
        renewal: {
          originalContractId: contract._id,
          renewedAt: new Date(),
          renewedBy: userId,
          renewalReason: renewalData.reason
        }
      };

      const newContract = await this.createContract(newContractData, userId);

      // Update original contract
      contract.status = this.contractStatuses.renewed;
      contract.renewal = {
        renewedTo: newContract._id,
        renewedAt: new Date(),
        renewedBy: userId
      };

      await contract.save();

      // Create lifecycle entries
      await this.createLifecycleEntry(contractId, 'renewed', 'Contract renewed', userId);
      await this.createLifecycleEntry(newContract._id, 'created_from_renewal', 'Contract created from renewal', userId);

      return { originalContract: contract, newContract };
    } catch (error) {
      logger.error('Error renewing contract:', error);
      throw error;
    }
  }

  /**
   * Create lifecycle entry
   */
  async createLifecycleEntry(contractId, action, description, userId, metadata = {}) {
    try {
      const lifecycleEntry = {
        contractId,
        action,
        description,
        performedBy: userId,
        performedAt: new Date(),
        metadata
      };

      // Store in contract's lifecycle array
      await ProcurementContract.findByIdAndUpdate(contractId, {
        $push: { lifecycle: lifecycleEntry }
      });

      return lifecycleEntry;
    } catch (error) {
      logger.error('Error creating lifecycle entry:', error);
      throw error;
    }
  }

  /**
   * Setup renewal reminders
   */
  async setupRenewalReminders(contract) {
    try {
      if (!contract.terms.endDate) return;

      const endDate = new Date(contract.terms.endDate);
      const reminders = [];

      // Create reminders for each period
      for (const [period, days] of Object.entries(this.renewalReminders)) {
        const reminderDate = new Date(endDate);
        reminderDate.setDate(reminderDate.getDate() - days);

        if (reminderDate > new Date()) {
          reminders.push({
            contractId: contract._id,
            reminderDate,
            period,
            days,
            status: 'pending',
            type: 'renewal_reminder'
          });
        }
      }

      // Store reminders in contract
      contract.renewalReminders = reminders;
      await contract.save();

      return reminders;
    } catch (error) {
      logger.error('Error setting up renewal reminders:', error);
      throw error;
    }
  }

  /**
   * Get contracts expiring soon
   */
  async getExpiringContracts(days = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const contracts = await ProcurementContract.find({
        status: this.contractStatuses.active,
        'terms.endDate': {
          $lte: futureDate,
          $gte: new Date()
        }
      }).populate('supplierId', 'companyName contactEmail');

      return contracts;
    } catch (error) {
      logger.error('Error getting expiring contracts:', error);
      throw error;
    }
  }

  /**
   * Get contract lifecycle
   */
  async getContractLifecycle(contractId) {
    try {
      const contract = await ProcurementContract.findById(contractId)
        .populate('lifecycle.performedBy', 'name email');

      if (!contract) {
        throw new Error('Contract not found');
      }

      return contract.lifecycle || [];
    } catch (error) {
      logger.error('Error getting contract lifecycle:', error);
      throw error;
    }
  }

  /**
   * Get contract dashboard data
   */
  async getDashboardData() {
    try {
      const [
        totalContracts,
        activeContracts,
        expiringContracts,
        pendingReview,
        terminatedContracts,
        renewalStats
      ] = await Promise.all([
        ProcurementContract.countDocuments(),
        ProcurementContract.countDocuments({ status: this.contractStatuses.active }),
        this.getExpiringContracts(30),
        ProcurementContract.countDocuments({ status: this.contractStatuses.pending_review }),
        ProcurementContract.countDocuments({ status: this.contractStatuses.terminated }),
        this.getRenewalStats()
      ]);

      return {
        totalContracts,
        activeContracts,
        expiringContracts: expiringContracts.length,
        pendingReview,
        terminatedContracts,
        renewalStats,
        expiringContractsList: expiringContracts
      };
    } catch (error) {
      logger.error('Error getting contract dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get renewal statistics
   */
  async getRenewalStats() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const stats = await ProcurementContract.aggregate([
        {
          $match: {
            status: this.contractStatuses.renewed,
            'renewal.renewedAt': { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$renewal.renewedAt' },
              year: { $year: '$renewal.renewedAt' }
            },
            count: { $sum: 1 },
            totalValue: { $sum: '$terms.value' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Error getting renewal stats:', error);
      throw error;
    }
  }

  /**
   * Send review notification
   */
  async sendReviewNotification(contract) {
    try {
      // Implementation would send email notification to legal team
      logger.info(`Review notification sent for contract ${contract.contractNumber}`);
    } catch (error) {
      logger.error('Error sending review notification:', error);
    }
  }

  /**
   * Send approval notification
   */
  async sendApprovalNotification(contract) {
    try {
      // Implementation would send email notification to stakeholders
      logger.info(`Approval notification sent for contract ${contract.contractNumber}`);
    } catch (error) {
      logger.error('Error sending approval notification:', error);
    }
  }

  /**
   * Send termination notification
   */
  async sendTerminationNotification(contract) {
    try {
      // Implementation would send email notification to stakeholders
      logger.info(`Termination notification sent for contract ${contract.contractNumber}`);
    } catch (error) {
      logger.error('Error sending termination notification:', error);
    }
  }

  /**
   * Process renewal reminders
   */
  async processRenewalReminders() {
    try {
      const today = new Date();
      const contracts = await ProcurementContract.find({
        status: this.contractStatuses.active,
        'renewalReminders.reminderDate': { $lte: today },
        'renewalReminders.status': 'pending'
      });

      for (const contract of contracts) {
        for (const reminder of contract.renewalReminders) {
          if (reminder.reminderDate <= today && reminder.status === 'pending') {
            // Send reminder notification
            await this.sendRenewalReminder(contract, reminder);
            
            // Mark reminder as sent
            reminder.status = 'sent';
            reminder.sentAt = new Date();
          }
        }
        
        await contract.save();
      }

      return contracts.length;
    } catch (error) {
      logger.error('Error processing renewal reminders:', error);
      throw error;
    }
  }

  /**
   * Send renewal reminder
   */
  async sendRenewalReminder(contract, reminder) {
    try {
      // Implementation would send email notification
      logger.info(`Renewal reminder sent for contract ${contract.contractNumber} - ${reminder.period}`);
    } catch (error) {
      logger.error('Error sending renewal reminder:', error);
    }
  }
}

module.exports = new ContractLifecycleService();
