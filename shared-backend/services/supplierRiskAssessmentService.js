const SupplierRiskAssessment = require('../models/SupplierRiskAssessment');
const ProcurementSupplier = require('../models/ProcurementSupplier');
const { logger } = require('../config/logger');

class SupplierRiskAssessmentService {
  constructor() {
    this.riskWeights = {
      financial: 0.25,
      operational: 0.20,
      compliance: 0.20,
      reputational: 0.15,
      strategic: 0.15,
      environmental: 0.05
    };
    
    this.riskThresholds = {
      low: 40,
      medium: 60,
      high: 80,
      critical: 90
    };
  }

  /**
   * Create a new risk assessment
   */
  async createRiskAssessment(assessmentData, userId) {
    try {
      // Generate assessment ID
      const assessmentId = `RA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create assessment
      const assessment = new SupplierRiskAssessment({
        assessmentId,
        ...assessmentData,
        assessedBy: userId
      });

      // Calculate overall risk
      this.calculateOverallRisk(assessment);

      // Generate recommendations
      assessment.recommendations = this.generateRecommendations(assessment);

      await assessment.save();

      // Update supplier risk information
      await this.updateSupplierRiskProfile(assessment.supplierId, assessment);

      return assessment;
    } catch (error) {
      logger.error('Error creating risk assessment:', error);
      throw error;
    }
  }

  /**
   * Calculate overall risk score and level
   */
  calculateOverallRisk(assessment) {
    let totalScore = 0;
    let totalWeight = 0;

    // Calculate weighted risk score from factors
    assessment.riskFactors.forEach(factor => {
      const weight = this.riskWeights[factor.category] || 0.1;
      const factorScore = (factor.probability * factor.impact) / 100;
      totalScore += factorScore * weight;
      totalWeight += weight;
    });

    // Apply additional risk factors
    const additionalScore = this.calculateAdditionalRiskScore(assessment);
    totalScore += additionalScore * 0.1; // 10% weight for additional factors
    totalWeight += 0.1;

    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    
    assessment.overallRisk.riskScore = overallScore;
    assessment.overallRisk.riskLevel = this.getRiskLevel(overallScore);

    return assessment.overallRisk;
  }

  /**
   * Calculate additional risk score from other assessment areas
   */
  calculateAdditionalRiskScore(assessment) {
    let additionalScore = 0;

    // Financial risk
    if (assessment.financialRisk) {
      const financialScore = this.calculateFinancialRiskScore(assessment.financialRisk);
      additionalScore += financialScore * 0.3;
    }

    // Operational risk
    if (assessment.operationalRisk) {
      const operationalScore = this.calculateOperationalRiskScore(assessment.operationalRisk);
      additionalScore += operationalScore * 0.25;
    }

    // Compliance risk
    if (assessment.complianceRisk) {
      const complianceScore = this.calculateComplianceRiskScore(assessment.complianceRisk);
      additionalScore += complianceScore * 0.25;
    }

    // Reputational risk
    if (assessment.reputationalRisk) {
      const reputationalScore = this.calculateReputationalRiskScore(assessment.reputationalRisk);
      additionalScore += reputationalScore * 0.2;
    }

    return additionalScore;
  }

  /**
   * Calculate financial risk score
   */
  calculateFinancialRiskScore(financialRisk) {
    let score = 0;

    // Credit rating
    const creditRatingScores = {
      'AAA': 10, 'AA': 20, 'A': 30, 'BBB': 40, 'BB': 60, 'B': 70,
      'CCC': 80, 'CC': 85, 'C': 90, 'D': 95, 'unrated': 50
    };
    score += creditRatingScores[financialRisk.creditRating] || 50;

    // Payment history
    if (financialRisk.paymentHistory) {
      const onTimeRate = financialRisk.paymentHistory.onTimePayments || 0;
      score += (100 - onTimeRate) * 0.5;
      
      if (financialRisk.paymentHistory.latePayments > 0) {
        score += Math.min(financialRisk.paymentHistory.latePayments * 5, 30);
      }
    }

    // Financial stability
    const stabilityScores = {
      'very_stable': 10, 'stable': 20, 'moderate': 40, 'unstable': 70, 'critical': 90
    };
    score += stabilityScores[financialRisk.financialStability] || 50;

    return Math.min(score, 100);
  }

  /**
   * Calculate operational risk score
   */
  calculateOperationalRiskScore(operationalRisk) {
    let score = 0;

    // Delivery performance
    if (operationalRisk.deliveryPerformance) {
      const onTimeRate = operationalRisk.deliveryPerformance.onTimeDeliveryRate || 0;
      score += (100 - onTimeRate) * 0.3;
      
      const avgDelay = operationalRisk.deliveryPerformance.averageDelayDays || 0;
      score += Math.min(avgDelay * 2, 20);
    }

    // Quality performance
    if (operationalRisk.qualityPerformance) {
      const qualityScore = operationalRisk.qualityPerformance.qualityScore || 0;
      score += (100 - qualityScore) * 0.3;
      
      const defectRate = operationalRisk.qualityPerformance.defectRate || 0;
      score += defectRate * 0.2;
    }

    // Capacity
    if (operationalRisk.capacity) {
      const capacityScores = {
        'excess': 10, 'adequate': 20, 'limited': 50, 'insufficient': 80
      };
      score += capacityScores[operationalRisk.capacity.productionCapacity] || 30;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate compliance risk score
   */
  calculateComplianceRiskScore(complianceRisk) {
    let score = 0;

    // Regulatory compliance
    if (complianceRisk.regulatoryCompliance) {
      const complianceScore = complianceRisk.regulatoryCompliance.complianceScore || 0;
      score += (100 - complianceScore) * 0.4;
      
      // Violations
      if (complianceRisk.regulatoryCompliance.violations) {
        complianceRisk.regulatoryCompliance.violations.forEach(violation => {
          const severityScores = { 'minor': 10, 'moderate': 30, 'major': 60, 'critical': 90 };
          score += severityScores[violation.severity] || 0;
        });
      }
    }

    // Legal issues
    if (complianceRisk.legalIssues) {
      score += (complianceRisk.legalIssues.activeLawsuits || 0) * 15;
      score += (complianceRisk.legalIssues.regulatoryActions || 0) * 20;
      score += (complianceRisk.legalIssues.fines || 0) * 0.1;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate reputational risk score
   */
  calculateReputationalRiskScore(reputationalRisk) {
    let score = 0;

    // Market reputation
    const reputationScores = {
      'excellent': 10, 'good': 20, 'fair': 40, 'poor': 70, 'unknown': 50
    };
    score += reputationScores[reputationalRisk.marketReputation] || 50;

    // Media coverage
    if (reputationalRisk.mediaCoverage) {
      const sentimentScores = {
        'positive': 10, 'neutral': 30, 'negative': 80, 'mixed': 50
      };
      score += sentimentScores[reputationalRisk.mediaCoverage.sentiment] || 30;
    }

    return Math.min(score, 100);
  }

  /**
   * Get risk level based on score
   */
  getRiskLevel(score) {
    if (score >= this.riskThresholds.critical) return 'critical';
    if (score >= this.riskThresholds.high) return 'high';
    if (score >= this.riskThresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations based on risk assessment
   */
  generateRecommendations(assessment) {
    const recommendations = [];

    // High risk factors
    const highRiskFactors = assessment.riskFactors.filter(f => 
      f.riskLevel === 'high' || f.riskLevel === 'critical'
    );

    highRiskFactors.forEach(factor => {
      switch (factor.category) {
        case 'financial':
          recommendations.push({
            category: 'risk_mitigation',
            priority: 'high',
            recommendation: `Implement financial monitoring for ${factor.factor}`,
            description: `Set up regular financial reviews and credit monitoring for this supplier.`,
            expectedImpact: 'high',
            implementationEffort: 'medium'
          });
          break;

        case 'operational':
          recommendations.push({
            category: 'performance_improvement',
            priority: 'high',
            recommendation: `Address operational issues with ${factor.factor}`,
            description: `Work with supplier to improve operational performance in this area.`,
            expectedImpact: 'high',
            implementationEffort: 'high'
          });
          break;

        case 'compliance':
          recommendations.push({
            category: 'risk_mitigation',
            priority: 'high',
            recommendation: `Ensure compliance with ${factor.factor}`,
            description: `Verify supplier compliance and implement monitoring measures.`,
            expectedImpact: 'high',
            implementationEffort: 'medium'
          });
          break;

        case 'reputational':
          recommendations.push({
            category: 'relationship_management',
            priority: 'medium',
            recommendation: `Monitor reputational issues with ${factor.factor}`,
            description: `Implement reputation monitoring and stakeholder communication.`,
            expectedImpact: 'medium',
            implementationEffort: 'low'
          });
          break;

        case 'strategic':
          recommendations.push({
            category: 'contract_terms',
            priority: 'high',
            recommendation: `Review strategic alignment for ${factor.factor}`,
            description: `Evaluate strategic fit and consider alternative suppliers.`,
            expectedImpact: 'high',
            implementationEffort: 'high'
          });
          break;
      }
    });

    // Overall risk recommendations
    if (assessment.overallRisk.riskLevel === 'critical') {
      recommendations.push({
        category: 'risk_mitigation',
        priority: 'high',
        recommendation: 'Consider supplier replacement',
        description: 'Critical risk level suggests immediate action may be required.',
        expectedImpact: 'high',
        implementationEffort: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Update supplier risk profile
   */
  async updateSupplierRiskProfile(supplierId, assessment) {
    try {
      const supplier = await ProcurementSupplier.findOne({ supplierId });
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      supplier.risk = {
        riskLevel: assessment.overallRisk.riskLevel,
        riskScore: assessment.overallRisk.riskScore,
        lastRiskAssessment: assessment.assessmentDate,
        riskFactors: assessment.riskFactors.map(factor => ({
          factor: factor.factor,
          impact: factor.impact,
          mitigation: factor.mitigation?.strategy || ''
        }))
      };

      await supplier.save();
    } catch (error) {
      logger.error('Error updating supplier risk profile:', error);
      throw error;
    }
  }

  /**
   * Get risk assessment dashboard data
   */
  async getDashboardData() {
    try {
      const [
        totalAssessments,
        criticalRisk,
        highRisk,
        mediumRisk,
        lowRisk,
        recentAssessments,
        overdueAssessments,
        riskTrends
      ] = await Promise.all([
        SupplierRiskAssessment.countDocuments(),
        SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'critical' }),
        SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'high' }),
        SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'medium' }),
        SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'low' }),
        SupplierRiskAssessment.find({ status: 'approved' })
          .sort({ assessmentDate: -1 })
          .limit(5)
          .populate('assessedBy', 'name email'),
        SupplierRiskAssessment.find({
          nextAssessment: { $lt: new Date() },
          status: { $ne: 'archived' }
        }).countDocuments(),
        this.getRiskTrends()
      ]);

      return {
        totalAssessments,
        riskDistribution: {
          critical: criticalRisk,
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk
        },
        recentAssessments,
        overdueAssessments,
        riskTrends
      };
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get risk trends over time
   */
  async getRiskTrends() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const trends = await SupplierRiskAssessment.aggregate([
        {
          $match: {
            assessmentDate: { $gte: sixMonthsAgo },
            status: 'approved'
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$assessmentDate' },
              year: { $year: '$assessmentDate' },
              riskLevel: '$overallRisk.riskLevel'
            },
            count: { $sum: 1 },
            avgScore: { $avg: '$overallRisk.riskScore' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      return trends;
    } catch (error) {
      logger.error('Error getting risk trends:', error);
      throw error;
    }
  }

  /**
   * Get suppliers requiring risk assessment
   */
  async getSuppliersRequiringAssessment() {
    try {
      const suppliers = await ProcurementSupplier.find({
        $or: [
          { 'risk.lastRiskAssessment': { $exists: false } },
          { 'risk.lastRiskAssessment': { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } }, // 1 year ago
          { 'risk.riskLevel': { $in: ['high', 'critical'] } }
        ]
      }).select('supplierId companyName risk');

      return suppliers;
    } catch (error) {
      logger.error('Error getting suppliers requiring assessment:', error);
      throw error;
    }
  }

  /**
   * Auto-assess risk based on performance data
   */
  async autoAssessRisk(supplierId, performanceData) {
    try {
      const riskFactors = [];

      // Analyze delivery performance
      if (performanceData.deliveryPerformance) {
        const onTimeRate = performanceData.deliveryPerformance.onTimeDeliveryRate;
        if (onTimeRate < 80) {
          riskFactors.push({
            category: 'operational',
            factor: 'Delivery Performance',
            description: `On-time delivery rate is ${onTimeRate}%`,
            riskLevel: onTimeRate < 60 ? 'critical' : onTimeRate < 70 ? 'high' : 'medium',
            probability: 100 - onTimeRate,
            impact: 70
          });
        }
      }

      // Analyze quality performance
      if (performanceData.qualityPerformance) {
        const qualityScore = performanceData.qualityPerformance.qualityScore;
        if (qualityScore < 80) {
          riskFactors.push({
            category: 'operational',
            factor: 'Quality Performance',
            description: `Quality score is ${qualityScore}%`,
            riskLevel: qualityScore < 60 ? 'critical' : qualityScore < 70 ? 'high' : 'medium',
            probability: 100 - qualityScore,
            impact: 80
          });
        }
      }

      // Analyze financial performance
      if (performanceData.financialPerformance) {
        const paymentHistory = performanceData.financialPerformance.paymentHistory;
        if (paymentHistory && paymentHistory.onTimePayments < 90) {
          riskFactors.push({
            category: 'financial',
            factor: 'Payment History',
            description: `On-time payment rate is ${paymentHistory.onTimePayments}%`,
            riskLevel: paymentHistory.onTimePayments < 70 ? 'critical' : 'high',
            probability: 100 - paymentHistory.onTimePayments,
            impact: 60
          });
        }
      }

      return riskFactors;
    } catch (error) {
      logger.error('Error in auto risk assessment:', error);
      throw error;
    }
  }
}

module.exports = new SupplierRiskAssessmentService();
