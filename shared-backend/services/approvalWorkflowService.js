/**
 * Dynamic Approval Workflow Service
 * Handles multi-level approval workflows based on amount thresholds and business rules
 */

const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');
const logger = require('../config/logger');

class ApprovalWorkflowService {
  constructor() {
    this.approvalThresholds = {
      // Amount-based thresholds (in EGP)
      LOW: { max: 10000, approvers: ['department_manager'] },
      MEDIUM: { max: 50000, approvers: ['department_manager', 'finance_manager'] },
      HIGH: { max: 200000, approvers: ['department_manager', 'finance_manager', 'ceo'] },
      CRITICAL: { max: Infinity, approvers: ['department_manager', 'finance_manager', 'ceo', 'board'] }
    };

    this.approvalRoles = {
      department_manager: 'Department Manager',
      finance_manager: 'Finance Manager',
      ceo: 'CEO',
      board: 'Board of Directors'
    };
  }

  /**
   * Determine approval workflow for a procurement request
   * @param {Object} requestData - The procurement request data
   * @returns {Object} - Approval workflow configuration
   */
  async determineApprovalWorkflow(requestData) {
    try {
      const { totalAmount, department, project, requestedBy } = requestData;
      
      // Get approval thresholds for the department
      const departmentThresholds = await this.getDepartmentThresholds(department);
      
      // Determine approval level based on amount
      const approvalLevel = this.getApprovalLevel(totalAmount, departmentThresholds);
      
      // Get required approvers for this level
      const requiredApprovers = await this.getRequiredApprovers(approvalLevel, department, project);
      
      // Create approval chain
      const approvalChain = this.createApprovalChain(requiredApprovers, requestData);
      
      return {
        approvalLevel,
        approvalChain,
        estimatedApprovalTime: this.calculateEstimatedApprovalTime(approvalLevel),
        requiresBudgetCheck: totalAmount > 5000,
        requiresLegalReview: totalAmount > 100000,
        requiresBoardApproval: totalAmount > 500000
      };
    } catch (error) {
      logger.error('Error determining approval workflow:', error);
      throw new Error('Failed to determine approval workflow');
    }
  }

  /**
   * Get department-specific approval thresholds
   * @param {string} department - Department name
   * @returns {Object} - Department thresholds
   */
  async getDepartmentThresholds(department) {
    try {
      const settingsCollection = await getCollection('procurement_settings');
      const settings = await settingsCollection.findOne({ 
        type: 'approval_thresholds',
        department: department 
      });
      
      if (settings) {
        return settings.thresholds;
      }
      
      // Return default thresholds if no department-specific settings
      return this.approvalThresholds;
    } catch (error) {
      logger.error('Error getting department thresholds:', error);
      return this.approvalThresholds;
    }
  }

  /**
   * Determine approval level based on amount
   * @param {number} amount - Request amount
   * @param {Object} thresholds - Approval thresholds
   * @returns {string} - Approval level
   */
  getApprovalLevel(amount, thresholds = this.approvalThresholds) {
    if (amount <= thresholds.LOW.max) return 'LOW';
    if (amount <= thresholds.MEDIUM.max) return 'MEDIUM';
    if (amount <= thresholds.HIGH.max) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Get required approvers for approval level
   * @param {string} approvalLevel - Approval level
   * @param {string} department - Department
   * @param {string} project - Project (optional)
   * @returns {Array} - List of required approvers
   */
  async getRequiredApprovers(approvalLevel, department, project = null) {
    try {
      const approvers = [];
      const thresholds = this.approvalThresholds[approvalLevel];
      
      for (const role of thresholds.approvers) {
        const approver = await this.findApproverByRole(role, department, project);
        if (approver) {
          approvers.push({
            role,
            roleName: this.approvalRoles[role],
            approverId: approver._id,
            approverName: approver.name,
            approverEmail: approver.email,
            department: approver.department,
            isRequired: true,
            canDelegate: this.canDelegate(role),
            maxDelegationLevel: this.getMaxDelegationLevel(role)
          });
        }
      }
      
      return approvers;
    } catch (error) {
      logger.error('Error getting required approvers:', error);
      return [];
    }
  }

  /**
   * Find approver by role and department
   * @param {string} role - Approver role
   * @param {string} department - Department
   * @param {string} project - Project (optional)
   * @returns {Object|null} - Approver details
   */
  async findApproverByRole(role, department, project = null) {
    try {
      const usersCollection = await getCollection('users');
      
      // Build query based on role
      let query = { isActive: true };
      
      switch (role) {
        case 'department_manager':
          query = {
            ...query,
            department: department,
            role: { $in: ['manager', 'department_manager', 'admin'] }
          };
          break;
        case 'finance_manager':
          query = {
            ...query,
            department: { $in: ['finance', 'accounting'] },
            role: { $in: ['finance_manager', 'admin', 'super_admin'] }
          };
          break;
        case 'ceo':
          query = {
            ...query,
            role: { $in: ['ceo', 'admin', 'super_admin'] }
          };
          break;
        case 'board':
          query = {
            ...query,
            role: { $in: ['board_member', 'super_admin'] }
          };
          break;
      }
      
      const approver = await usersCollection.findOne(query);
      return approver;
    } catch (error) {
      logger.error('Error finding approver by role:', error);
      return null;
    }
  }

  /**
   * Create approval chain with approvers
   * @param {Array} approvers - List of approvers
   * @param {Object} requestData - Request data
   * @returns {Array} - Approval chain
   */
  createApprovalChain(approvers, requestData) {
    return approvers.map((approver, index) => ({
      step: index + 1,
      approverId: approver.approverId,
      approverName: approver.approverName,
      approverEmail: approver.approverEmail,
      role: approver.role,
      roleName: approver.roleName,
      department: approver.department,
      status: 'pending',
      isRequired: approver.isRequired,
      canDelegate: approver.canDelegate,
      maxDelegationLevel: approver.maxDelegationLevel,
      dueDate: this.calculateDueDate(index, requestData),
      priority: this.calculatePriority(index, requestData),
      comments: '',
      approvalDate: null,
      delegatedTo: null,
      delegationReason: null
    }));
  }

  /**
   * Calculate due date for approval step
   * @param {number} stepIndex - Step index
   * @param {Object} requestData - Request data
   * @returns {Date} - Due date
   */
  calculateDueDate(stepIndex, requestData) {
    const baseHours = 24; // Base 24 hours per step
    const urgencyMultiplier = this.getUrgencyMultiplier(requestData.urgency);
    const stepMultiplier = Math.pow(1.2, stepIndex); // Each step gets 20% more time
    
    const hours = baseHours * urgencyMultiplier * stepMultiplier;
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + hours);
    
    return dueDate;
  }

  /**
   * Get urgency multiplier for due date calculation
   * @param {string} urgency - Urgency level
   * @returns {number} - Multiplier
   */
  getUrgencyMultiplier(urgency) {
    const multipliers = {
      'critical': 0.5,  // 50% of normal time
      'high': 0.75,     // 75% of normal time
      'medium': 1.0,    // Normal time
      'low': 1.5        // 150% of normal time
    };
    
    return multipliers[urgency] || 1.0;
  }

  /**
   * Calculate priority for approval step
   * @param {number} stepIndex - Step index
   * @param {Object} requestData - Request data
   * @returns {string} - Priority level
   */
  calculatePriority(stepIndex, requestData) {
    const { totalAmount, urgency } = requestData;
    
    if (urgency === 'critical' || totalAmount > 100000) {
      return 'high';
    } else if (urgency === 'high' || totalAmount > 25000) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate estimated approval time
   * @param {string} approvalLevel - Approval level
   * @returns {number} - Estimated time in hours
   */
  calculateEstimatedApprovalTime(approvalLevel) {
    const baseTime = {
      'LOW': 24,      // 1 day
      'MEDIUM': 48,   // 2 days
      'HIGH': 72,     // 3 days
      'CRITICAL': 120 // 5 days
    };
    
    return baseTime[approvalLevel] || 48;
  }

  /**
   * Check if role can delegate
   * @param {string} role - Role name
   * @returns {boolean} - Can delegate
   */
  canDelegate(role) {
    const delegatableRoles = ['department_manager', 'finance_manager'];
    return delegatableRoles.includes(role);
  }

  /**
   * Get max delegation level for role
   * @param {string} role - Role name
   * @returns {number} - Max delegation level
   */
  getMaxDelegationLevel(role) {
    const delegationLevels = {
      'department_manager': 1,
      'finance_manager': 1,
      'ceo': 0,
      'board': 0
    };
    
    return delegationLevels[role] || 0;
  }

  /**
   * Process approval action
   * @param {string} requestId - Request ID
   * @param {string} approverId - Approver ID
   * @param {string} action - Action (approve, reject, delegate)
   * @param {Object} actionData - Action data
   * @returns {Object} - Updated request
   */
  async processApprovalAction(requestId, approverId, action, actionData = {}) {
    try {
      const requestsCollection = await getCollection('procurement_requests');
      const request = await requestsCollection.findOne({ _id: new ObjectId(requestId) });
      
      if (!request) {
        throw new Error('Request not found');
      }
      
      const currentStep = request.currentApprovalStep;
      const approvalChain = request.approvalChain;
      
      if (currentStep >= approvalChain.length) {
        throw new Error('No pending approvals');
      }
      
      const currentApproval = approvalChain[currentStep];
      
      // Verify approver
      if (currentApproval.approverId.toString() !== approverId) {
        throw new Error('Not authorized to approve this step');
      }
      
      // Process action
      switch (action) {
        case 'approve':
          return await this.processApproval(requestId, currentStep, actionData);
        case 'reject':
          return await this.processRejection(requestId, currentStep, actionData);
        case 'delegate':
          return await this.processDelegation(requestId, currentStep, actionData);
        default:
          throw new Error('Invalid action');
      }
    } catch (error) {
      logger.error('Error processing approval action:', error);
      throw error;
    }
  }

  /**
   * Process approval
   * @param {string} requestId - Request ID
   * @param {number} stepIndex - Step index
   * @param {Object} actionData - Action data
   * @returns {Object} - Updated request
   */
  async processApproval(requestId, stepIndex, actionData) {
    try {
      const requestsCollection = await getCollection('procurement_requests');
      
      // Update approval step
      const updateQuery = {
        $set: {
          [`approvalChain.${stepIndex}.status`]: 'approved',
          [`approvalChain.${stepIndex}.approvalDate`]: new Date(),
          [`approvalChain.${stepIndex}.comments`]: actionData.comments || '',
          currentApprovalStep: stepIndex + 1,
          updatedAt: new Date()
        }
      };
      
      const result = await requestsCollection.findOneAndUpdate(
        { _id: new ObjectId(requestId) },
        updateQuery,
        { returnDocument: 'after' }
      );
      
      // Check if all approvals are complete
      const request = result.value;
      if (request.currentApprovalStep >= request.approvalChain.length) {
        await this.completeApprovalWorkflow(requestId);
      }
      
      return request;
    } catch (error) {
      logger.error('Error processing approval:', error);
      throw error;
    }
  }

  /**
   * Process rejection
   * @param {string} requestId - Request ID
   * @param {number} stepIndex - Step index
   * @param {Object} actionData - Action data
   * @returns {Object} - Updated request
   */
  async processRejection(requestId, stepIndex, actionData) {
    try {
      const requestsCollection = await getCollection('procurement_requests');
      
      const updateQuery = {
        $set: {
          [`approvalChain.${stepIndex}.status`]: 'rejected',
          [`approvalChain.${stepIndex}.approvalDate`]: new Date(),
          [`approvalChain.${stepIndex}.comments`]: actionData.comments || '',
          status: 'rejected',
          updatedAt: new Date()
        }
      };
      
      const result = await requestsCollection.findOneAndUpdate(
        { _id: new ObjectId(requestId) },
        updateQuery,
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      logger.error('Error processing rejection:', error);
      throw error;
    }
  }

  /**
   * Process delegation
   * @param {string} requestId - Request ID
   * @param {number} stepIndex - Step index
   * @param {Object} actionData - Action data
   * @returns {Object} - Updated request
   */
  async processDelegation(requestId, stepIndex, actionData) {
    try {
      const requestsCollection = await getCollection('procurement_requests');
      
      // Verify delegate exists and has appropriate permissions
      const delegate = await this.findApproverByRole(
        actionData.delegateRole,
        actionData.delegateDepartment
      );
      
      if (!delegate) {
        throw new Error('Delegate not found or not authorized');
      }
      
      const updateQuery = {
        $set: {
          [`approvalChain.${stepIndex}.delegatedTo`]: delegate._id,
          [`approvalChain.${stepIndex}.delegationReason`]: actionData.reason,
          [`approvalChain.${stepIndex}.comments`]: actionData.comments || '',
          updatedAt: new Date()
        }
      };
      
      const result = await requestsCollection.findOneAndUpdate(
        { _id: new ObjectId(requestId) },
        updateQuery,
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      logger.error('Error processing delegation:', error);
      throw error;
    }
  }

  /**
   * Complete approval workflow
   * @param {string} requestId - Request ID
   * @returns {Object} - Updated request
   */
  async completeApprovalWorkflow(requestId) {
    try {
      const requestsCollection = await getCollection('procurement_requests');
      
      const updateQuery = {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      const result = await requestsCollection.findOneAndUpdate(
        { _id: new ObjectId(requestId) },
        updateQuery,
        { returnDocument: 'after' }
      );
      
      // Trigger post-approval actions
      await this.triggerPostApprovalActions(requestId);
      
      return result.value;
    } catch (error) {
      logger.error('Error completing approval workflow:', error);
      throw error;
    }
  }

  /**
   * Trigger post-approval actions
   * @param {string} requestId - Request ID
   */
  async triggerPostApprovalActions(requestId) {
    try {
      // Send notifications
      await this.sendApprovalNotifications(requestId);
      
      // Update budget commitments
      await this.updateBudgetCommitments(requestId);
      
      // Create audit log
      await this.createApprovalAuditLog(requestId);
      
    } catch (error) {
      logger.error('Error triggering post-approval actions:', error);
    }
  }

  /**
   * Send approval notifications
   * @param {string} requestId - Request ID
   */
  async sendApprovalNotifications(requestId) {
    // Implementation for sending notifications
    // This would integrate with the notification service
    logger.info(`Sending approval notifications for request ${requestId}`);
  }

  /**
   * Update budget commitments
   * @param {string} requestId - Request ID
   */
  async updateBudgetCommitments(requestId) {
    // Implementation for updating budget commitments
    // This would integrate with the budget control service
    logger.info(`Updating budget commitments for request ${requestId}`);
  }

  /**
   * Create approval audit log
   * @param {string} requestId - Request ID
   */
  async createApprovalAuditLog(requestId) {
    // Implementation for creating audit logs
    // This would integrate with the audit service
    logger.info(`Creating approval audit log for request ${requestId}`);
  }

  /**
   * Get approval workflow status
   * @param {string} requestId - Request ID
   * @returns {Object} - Workflow status
   */
  async getApprovalWorkflowStatus(requestId) {
    try {
      const requestsCollection = await getCollection('procurement_requests');
      const request = await requestsCollection.findOne({ _id: new ObjectId(requestId) });
      
      if (!request) {
        throw new Error('Request not found');
      }
      
      const { approvalChain, currentApprovalStep, status } = request;
      
      return {
        requestId,
        status,
        currentStep: currentApprovalStep,
        totalSteps: approvalChain.length,
        completedSteps: approvalChain.filter(step => step.status === 'approved').length,
        pendingSteps: approvalChain.filter(step => step.status === 'pending').length,
        rejectedSteps: approvalChain.filter(step => step.status === 'rejected').length,
        approvalChain,
        isComplete: currentApprovalStep >= approvalChain.length,
        isRejected: status === 'rejected',
        progressPercentage: Math.round((currentApprovalStep / approvalChain.length) * 100)
      };
    } catch (error) {
      logger.error('Error getting approval workflow status:', error);
      throw error;
    }
  }
}

module.exports = new ApprovalWorkflowService();
