/**
 * Budget Control Service
 * Handles real-time budget checking, commitment tracking, and alerts
 */

const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');
const logger = require('../config/logger');

class BudgetControlService {
  constructor() {
    this.alertThresholds = {
      WARNING: 80,    // 80% of budget used
      CRITICAL: 95,   // 95% of budget used
      EXCEEDED: 100   // 100% of budget used
    };
  }

  /**
   * Check budget availability for a procurement request
   * @param {Object} requestData - Request data
   * @returns {Object} - Budget check result
   */
  async checkBudgetAvailability(requestData) {
    try {
      const { totalAmount, department, project, departmentBudgetId, projectBudgetId } = requestData;
      
      const budgetCheck = {
        isAvailable: true,
        warnings: [],
        errors: [],
        recommendations: [],
        departmentBudget: null,
        projectBudget: null,
        totalAvailable: 0,
        totalCommitted: 0,
        totalSpent: 0
      };

      // Check department budget
      if (departmentBudgetId) {
        const deptBudget = await this.checkDepartmentBudget(departmentBudgetId, totalAmount);
        budgetCheck.departmentBudget = deptBudget;
        
        if (!deptBudget.isAvailable) {
          budgetCheck.isAvailable = false;
          budgetCheck.errors.push(`Insufficient department budget: ${deptBudget.availableAmount} EGP available, ${totalAmount} EGP required`);
        }
        
        budgetCheck.totalAvailable += deptBudget.availableAmount;
        budgetCheck.totalCommitted += deptBudget.committedAmount;
        budgetCheck.totalSpent += deptBudget.spentAmount;
      }

      // Check project budget
      if (projectBudgetId) {
        const projBudget = await this.checkProjectBudget(projectBudgetId, totalAmount);
        budgetCheck.projectBudget = projBudget;
        
        if (!projBudget.isAvailable) {
          budgetCheck.isAvailable = false;
          budgetCheck.errors.push(`Insufficient project budget: ${projBudget.availableAmount} EGP available, ${totalAmount} EGP required`);
        }
        
        budgetCheck.totalAvailable += projBudget.availableAmount;
        budgetCheck.totalCommitted += projBudget.committedAmount;
        budgetCheck.totalSpent += projBudget.spentAmount;
      }

      // Generate recommendations
      budgetCheck.recommendations = this.generateBudgetRecommendations(budgetCheck, totalAmount);

      return budgetCheck;
    } catch (error) {
      logger.error('Error checking budget availability:', error);
      throw new Error('Failed to check budget availability');
    }
  }

  /**
   * Check department budget availability
   * @param {string} budgetId - Budget ID
   * @param {number} requestedAmount - Requested amount
   * @returns {Object} - Budget check result
   */
  async checkDepartmentBudget(budgetId, requestedAmount) {
    try {
      const budgetsCollection = await getCollection('department_budgets');
      const budget = await budgetsCollection.findOne({ _id: new ObjectId(budgetId) });
      
      if (!budget) {
        throw new Error('Department budget not found');
      }

      const availableAmount = budget.availableAmount;
      const utilizationPercentage = ((budget.committedAmount + budget.spentAmount) / budget.totalBudget) * 100;
      
      return {
        budgetId,
        budgetName: budget.departmentName,
        totalBudget: budget.totalBudget,
        committedAmount: budget.committedAmount,
        spentAmount: budget.spentAmount,
        availableAmount,
        isAvailable: availableAmount >= requestedAmount,
        utilizationPercentage,
        alertLevel: this.getAlertLevel(utilizationPercentage),
        categories: budget.categories || []
      };
    } catch (error) {
      logger.error('Error checking department budget:', error);
      throw error;
    }
  }

  /**
   * Check project budget availability
   * @param {string} budgetId - Budget ID
   * @param {number} requestedAmount - Requested amount
   * @returns {Object} - Budget check result
   */
  async checkProjectBudget(budgetId, requestedAmount) {
    try {
      const budgetsCollection = await getCollection('project_budgets');
      const budget = await budgetsCollection.findOne({ _id: new ObjectId(budgetId) });
      
      if (!budget) {
        throw new Error('Project budget not found');
      }

      const availableAmount = budget.availableAmount;
      const utilizationPercentage = ((budget.committedAmount + budget.spentAmount) / budget.totalBudget) * 100;
      
      return {
        budgetId,
        budgetName: budget.projectName,
        totalBudget: budget.totalBudget,
        committedAmount: budget.committedAmount,
        spentAmount: budget.spentAmount,
        availableAmount,
        isAvailable: availableAmount >= requestedAmount,
        utilizationPercentage,
        alertLevel: this.getAlertLevel(utilizationPercentage),
        breakdown: budget.budgetBreakdown || []
      };
    } catch (error) {
      logger.error('Error checking project budget:', error);
      throw error;
    }
  }

  /**
   * Get alert level based on utilization percentage
   * @param {number} utilizationPercentage - Utilization percentage
   * @returns {string} - Alert level
   */
  getAlertLevel(utilizationPercentage) {
    if (utilizationPercentage >= this.alertThresholds.EXCEEDED) return 'EXCEEDED';
    if (utilizationPercentage >= this.alertThresholds.CRITICAL) return 'CRITICAL';
    if (utilizationPercentage >= this.alertThresholds.WARNING) return 'WARNING';
    return 'NORMAL';
  }

  /**
   * Generate budget recommendations
   * @param {Object} budgetCheck - Budget check result
   * @param {number} requestedAmount - Requested amount
   * @returns {Array} - Recommendations
   */
  generateBudgetRecommendations(budgetCheck, requestedAmount) {
    const recommendations = [];
    
    if (!budgetCheck.isAvailable) {
      recommendations.push({
        type: 'BUDGET_INSUFFICIENT',
        message: 'Consider requesting budget increase or reducing request amount',
        priority: 'HIGH'
      });
    }
    
    if (budgetCheck.departmentBudget && budgetCheck.departmentBudget.alertLevel === 'CRITICAL') {
      recommendations.push({
        type: 'DEPARTMENT_BUDGET_CRITICAL',
        message: 'Department budget is critically low. Consider alternative funding sources.',
        priority: 'HIGH'
      });
    }
    
    if (budgetCheck.projectBudget && budgetCheck.projectBudget.alertLevel === 'CRITICAL') {
      recommendations.push({
        type: 'PROJECT_BUDGET_CRITICAL',
        message: 'Project budget is critically low. Review project scope or request additional funding.',
        priority: 'HIGH'
      });
    }
    
    if (requestedAmount > 50000) {
      recommendations.push({
        type: 'HIGH_VALUE_REQUEST',
        message: 'High-value request. Consider breaking into smaller phases or negotiating better terms.',
        priority: 'MEDIUM'
      });
    }
    
    return recommendations;
  }

  /**
   * Commit budget for a procurement request
   * @param {string} requestId - Request ID
   * @param {number} amount - Amount to commit
   * @param {string} departmentBudgetId - Department budget ID
   * @param {string} projectBudgetId - Project budget ID
   * @returns {Object} - Commitment result
   */
  async commitBudget(requestId, amount, departmentBudgetId, projectBudgetId) {
    try {
      const commitment = {
        requestId,
        amount,
        departmentBudgetId,
        projectBudgetId,
        committedAt: new Date(),
        status: 'active'
      };

      // Update department budget
      if (departmentBudgetId) {
        await this.updateDepartmentBudgetCommitment(departmentBudgetId, amount, 'commit');
      }

      // Update project budget
      if (projectBudgetId) {
        await this.updateProjectBudgetCommitment(projectBudgetId, amount, 'commit');
      }

      // Create commitment record
      const commitmentsCollection = await getCollection('budget_commitments');
      await commitmentsCollection.insertOne(commitment);

      // Send alerts if needed
      await this.checkAndSendBudgetAlerts(departmentBudgetId, projectBudgetId);

      return commitment;
    } catch (error) {
      logger.error('Error committing budget:', error);
      throw error;
    }
  }

  /**
   * Release budget commitment
   * @param {string} requestId - Request ID
   * @param {number} amount - Amount to release
   * @param {string} departmentBudgetId - Department budget ID
   * @param {string} projectBudgetId - Project budget ID
   * @returns {Object} - Release result
   */
  async releaseBudgetCommitment(requestId, amount, departmentBudgetId, projectBudgetId) {
    try {
      // Update department budget
      if (departmentBudgetId) {
        await this.updateDepartmentBudgetCommitment(departmentBudgetId, amount, 'release');
      }

      // Update project budget
      if (projectBudgetId) {
        await this.updateProjectBudgetCommitment(projectBudgetId, amount, 'release');
      }

      // Update commitment record
      const commitmentsCollection = await getCollection('budget_commitments');
      await commitmentsCollection.updateOne(
        { requestId },
        { $set: { status: 'released', releasedAt: new Date() } }
      );

      return { success: true, message: 'Budget commitment released' };
    } catch (error) {
      logger.error('Error releasing budget commitment:', error);
      throw error;
    }
  }

  /**
   * Update department budget commitment
   * @param {string} budgetId - Budget ID
   * @param {number} amount - Amount
   * @param {string} action - Action (commit or release)
   */
  async updateDepartmentBudgetCommitment(budgetId, amount, action) {
    try {
      const budgetsCollection = await getCollection('department_budgets');
      
      const updateQuery = action === 'commit' 
        ? { $inc: { committedAmount: amount } }
        : { $inc: { committedAmount: -amount } };
      
      await budgetsCollection.updateOne(
        { _id: new ObjectId(budgetId) },
        updateQuery
      );
    } catch (error) {
      logger.error('Error updating department budget commitment:', error);
      throw error;
    }
  }

  /**
   * Update project budget commitment
   * @param {string} budgetId - Budget ID
   * @param {number} amount - Amount
   * @param {string} action - Action (commit or release)
   */
  async updateProjectBudgetCommitment(budgetId, amount, action) {
    try {
      const budgetsCollection = await getCollection('project_budgets');
      
      const updateQuery = action === 'commit' 
        ? { $inc: { committedAmount: amount } }
        : { $inc: { committedAmount: -amount } };
      
      await budgetsCollection.updateOne(
        { _id: new ObjectId(budgetId) },
        updateQuery
      );
    } catch (error) {
      logger.error('Error updating project budget commitment:', error);
      throw error;
    }
  }

  /**
   * Check and send budget alerts
   * @param {string} departmentBudgetId - Department budget ID
   * @param {string} projectBudgetId - Project budget ID
   */
  async checkAndSendBudgetAlerts(departmentBudgetId, projectBudgetId) {
    try {
      if (departmentBudgetId) {
        const deptBudget = await this.checkDepartmentBudget(departmentBudgetId, 0);
        if (deptBudget.alertLevel !== 'NORMAL') {
          await this.sendBudgetAlert('department', deptBudget);
        }
      }

      if (projectBudgetId) {
        const projBudget = await this.checkProjectBudget(projectBudgetId, 0);
        if (projBudget.alertLevel !== 'NORMAL') {
          await this.sendBudgetAlert('project', projBudget);
        }
      }
    } catch (error) {
      logger.error('Error checking and sending budget alerts:', error);
    }
  }

  /**
   * Send budget alert
   * @param {string} budgetType - Budget type
   * @param {Object} budget - Budget data
   */
  async sendBudgetAlert(budgetType, budget) {
    try {
      // Implementation for sending budget alerts
      // This would integrate with the notification service
      logger.warn(`Budget alert: ${budgetType} budget ${budget.budgetName} is at ${budget.alertLevel} level (${budget.utilizationPercentage.toFixed(1)}% utilized)`);
    } catch (error) {
      logger.error('Error sending budget alert:', error);
    }
  }

  /**
   * Get budget utilization report
   * @param {string} department - Department name
   * @param {string} project - Project name
   * @param {string} period - Period (monthly, quarterly, yearly)
   * @returns {Object} - Utilization report
   */
  async getBudgetUtilizationReport(department, project, period = 'monthly') {
    try {
      const report = {
        department,
        project,
        period,
        totalBudget: 0,
        totalCommitted: 0,
        totalSpent: 0,
        totalAvailable: 0,
        utilizationPercentage: 0,
        trends: [],
        alerts: []
      };

      // Get department budget data
      if (department) {
        const deptBudget = await this.getDepartmentBudgetData(department, period);
        report.totalBudget += deptBudget.totalBudget;
        report.totalCommitted += deptBudget.totalCommitted;
        report.totalSpent += deptBudget.totalSpent;
        report.totalAvailable += deptBudget.totalAvailable;
      }

      // Get project budget data
      if (project) {
        const projBudget = await this.getProjectBudgetData(project, period);
        report.totalBudget += projBudget.totalBudget;
        report.totalCommitted += projBudget.totalCommitted;
        report.totalSpent += projBudget.totalSpent;
        report.totalAvailable += projBudget.totalAvailable;
      }

      // Calculate utilization percentage
      if (report.totalBudget > 0) {
        report.utilizationPercentage = ((report.totalCommitted + report.totalSpent) / report.totalBudget) * 100;
      }

      // Get trends
      report.trends = await this.getBudgetTrends(department, project, period);

      // Get alerts
      report.alerts = await this.getBudgetAlerts(department, project);

      return report;
    } catch (error) {
      logger.error('Error getting budget utilization report:', error);
      throw error;
    }
  }

  /**
   * Get department budget data
   * @param {string} department - Department name
   * @param {string} period - Period
   * @returns {Object} - Budget data
   */
  async getDepartmentBudgetData(department, period) {
    try {
      const budgetsCollection = await getCollection('department_budgets');
      const budget = await budgetsCollection.findOne({ departmentName: department });
      
      if (!budget) {
        return { totalBudget: 0, totalCommitted: 0, totalSpent: 0, totalAvailable: 0 };
      }

      return {
        totalBudget: budget.totalBudget,
        totalCommitted: budget.committedAmount,
        totalSpent: budget.spentAmount,
        totalAvailable: budget.availableAmount
      };
    } catch (error) {
      logger.error('Error getting department budget data:', error);
      return { totalBudget: 0, totalCommitted: 0, totalSpent: 0, totalAvailable: 0 };
    }
  }

  /**
   * Get project budget data
   * @param {string} project - Project name
   * @param {string} period - Period
   * @returns {Object} - Budget data
   */
  async getProjectBudgetData(project, period) {
    try {
      const budgetsCollection = await getCollection('project_budgets');
      const budget = await budgetsCollection.findOne({ projectName: project });
      
      if (!budget) {
        return { totalBudget: 0, totalCommitted: 0, totalSpent: 0, totalAvailable: 0 };
      }

      return {
        totalBudget: budget.totalBudget,
        totalCommitted: budget.committedAmount,
        totalSpent: budget.spentAmount,
        totalAvailable: budget.availableAmount
      };
    } catch (error) {
      logger.error('Error getting project budget data:', error);
      return { totalBudget: 0, totalCommitted: 0, totalSpent: 0, totalAvailable: 0 };
    }
  }

  /**
   * Get budget trends
   * @param {string} department - Department name
   * @param {string} project - Project name
   * @param {string} period - Period
   * @returns {Array} - Trends data
   */
  async getBudgetTrends(department, project, period) {
    try {
      // Implementation for getting budget trends
      // This would query historical budget data
      return [];
    } catch (error) {
      logger.error('Error getting budget trends:', error);
      return [];
    }
  }

  /**
   * Get budget alerts
   * @param {string} department - Department name
   * @param {string} project - Project name
   * @returns {Array} - Alerts
   */
  async getBudgetAlerts(department, project) {
    try {
      const alerts = [];
      
      // Check department budget alerts
      if (department) {
        const deptBudget = await this.getDepartmentBudgetData(department, 'monthly');
        if (deptBudget.totalBudget > 0) {
          const utilization = ((deptBudget.totalCommitted + deptBudget.totalSpent) / deptBudget.totalBudget) * 100;
          if (utilization >= this.alertThresholds.WARNING) {
            alerts.push({
              type: 'BUDGET_WARNING',
              level: utilization >= this.alertThresholds.CRITICAL ? 'CRITICAL' : 'WARNING',
              message: `Department budget is ${utilization.toFixed(1)}% utilized`,
              department
            });
          }
        }
      }

      // Check project budget alerts
      if (project) {
        const projBudget = await this.getProjectBudgetData(project, 'monthly');
        if (projBudget.totalBudget > 0) {
          const utilization = ((projBudget.totalCommitted + projBudget.totalSpent) / projBudget.totalBudget) * 100;
          if (utilization >= this.alertThresholds.WARNING) {
            alerts.push({
              type: 'BUDGET_WARNING',
              level: utilization >= this.alertThresholds.CRITICAL ? 'CRITICAL' : 'WARNING',
              message: `Project budget is ${utilization.toFixed(1)}% utilized`,
              project
            });
          }
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting budget alerts:', error);
      return [];
    }
  }
}

module.exports = new BudgetControlService();
