const mongoose = require('mongoose');

const supplierRiskAssessmentSchema = new mongoose.Schema({
  // Basic Information
  assessmentId: {
    type: String,
    required: true,
    unique: true
  },
  supplierId: {
    type: String,
    required: true,
    ref: 'ProcurementSupplier'
  },
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  assessedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessmentType: {
    type: String,
    enum: ['initial', 'periodic', 'triggered', 'comprehensive'],
    default: 'periodic'
  },
  trigger: {
    type: String,
    enum: ['scheduled', 'performance_issue', 'compliance_breach', 'financial_concern', 'market_change', 'manual'],
    default: 'scheduled'
  },

  // Overall Risk Assessment
  overallRisk: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskCategory: {
      type: String,
      enum: ['financial', 'operational', 'compliance', 'reputational', 'strategic', 'environmental'],
      required: true
    }
  },

  // Risk Factors Assessment
  riskFactors: [{
    category: {
      type: String,
      enum: ['financial', 'operational', 'compliance', 'reputational', 'strategic', 'environmental', 'technical'],
      required: true
    },
    factor: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    impact: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    evidence: [{
      type: {
        type: String,
        enum: ['document', 'report', 'certificate', 'audit', 'performance_data', 'news', 'other'],
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: String,
      url: String,
      date: Date,
      source: String
    }],
    mitigation: {
      strategy: String,
      description: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      deadline: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
      },
      effectiveness: {
        type: String,
        enum: ['high', 'medium', 'low', 'unknown'],
        default: 'unknown'
      }
    }
  }],

  // Financial Risk Assessment
  financialRisk: {
    creditRating: {
      type: String,
      enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D', 'unrated'],
      default: 'unrated'
    },
    creditScore: {
      type: Number,
      min: 300,
      max: 850
    },
    debtToEquityRatio: Number,
    currentRatio: Number,
    quickRatio: Number,
    workingCapital: Number,
    revenueGrowth: Number,
    profitability: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
    },
    paymentHistory: {
      onTimePayments: {
        type: Number,
        min: 0,
        max: 100
      },
      averagePaymentDays: Number,
      latePayments: Number,
      defaultedPayments: Number
    },
    financialStability: {
      type: String,
      enum: ['very_stable', 'stable', 'moderate', 'unstable', 'critical']
    }
  },

  // Operational Risk Assessment
  operationalRisk: {
    deliveryPerformance: {
      onTimeDeliveryRate: {
        type: Number,
        min: 0,
        max: 100
      },
      averageDelayDays: Number,
      deliveryIssues: Number
    },
    qualityPerformance: {
      qualityScore: {
        type: Number,
        min: 0,
        max: 100
      },
      defectRate: {
        type: Number,
        min: 0,
        max: 100
      },
      qualityIssues: Number,
      customerComplaints: Number
    },
    capacity: {
      productionCapacity: {
        type: String,
        enum: ['excess', 'adequate', 'limited', 'insufficient']
      },
      scalability: {
        type: String,
        enum: ['high', 'medium', 'low', 'unknown']
      },
      leadTime: Number,
      flexibility: {
        type: String,
        enum: ['high', 'medium', 'low', 'unknown']
      }
    },
    technology: {
      technologyLevel: {
        type: String,
        enum: ['advanced', 'modern', 'adequate', 'outdated', 'unknown']
      },
      innovation: {
        type: String,
        enum: ['high', 'medium', 'low', 'unknown']
      },
      digitalCapability: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
      }
    }
  },

  // Compliance Risk Assessment
  complianceRisk: {
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['valid', 'expired', 'suspended', 'revoked']
      },
      certificateUrl: String
    }],
    regulatoryCompliance: {
      industryStandards: [String],
      complianceScore: {
        type: Number,
        min: 0,
        max: 100
      },
      violations: [{
        violation: String,
        date: Date,
        severity: {
          type: String,
          enum: ['minor', 'moderate', 'major', 'critical']
        },
        status: {
          type: String,
          enum: ['open', 'resolved', 'under_review']
        }
      }],
      auditHistory: [{
        auditType: String,
        auditDate: Date,
        auditor: String,
        result: {
          type: String,
          enum: ['pass', 'conditional_pass', 'fail']
        },
        findings: [String],
        recommendations: [String]
      }]
    },
    legalIssues: {
      activeLawsuits: Number,
      regulatoryActions: Number,
      fines: Number,
      legalRisk: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }
  },

  // Reputational Risk Assessment
  reputationalRisk: {
    marketReputation: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
    },
    customerSatisfaction: {
      type: String,
      enum: ['high', 'medium', 'low', 'unknown']
    },
    mediaCoverage: {
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative', 'mixed']
      },
      coverageVolume: {
        type: String,
        enum: ['high', 'medium', 'low']
      },
      recentIssues: [String]
    },
    socialResponsibility: {
      environmentalCompliance: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
      },
      laborPractices: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
      },
      communityInvolvement: {
        type: String,
        enum: ['high', 'medium', 'low', 'unknown']
      }
    }
  },

  // Strategic Risk Assessment
  strategicRisk: {
    marketPosition: {
      type: String,
      enum: ['leader', 'strong', 'moderate', 'weak', 'unknown']
    },
    competitiveAdvantage: {
      type: String,
      enum: ['strong', 'moderate', 'weak', 'none', 'unknown']
    },
    businessContinuity: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
    },
    dependency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    alternativeSuppliers: {
      available: {
        type: String,
        enum: ['many', 'some', 'few', 'none']
      },
      switchingCost: {
        type: String,
        enum: ['low', 'medium', 'high', 'very_high']
      }
    }
  },

  // Environmental Risk Assessment
  environmentalRisk: {
    environmentalCompliance: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
    },
    sustainability: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'unknown']
    },
    climateRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    environmentalCertifications: [String],
    environmentalIncidents: [{
      incident: String,
      date: Date,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'critical']
      },
      impact: String
    }]
  },

  // Risk Mitigation Plan
  mitigationPlan: {
    overallStrategy: String,
    priorityActions: [{
      action: String,
      description: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      deadline: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
      },
      effectiveness: {
        type: String,
        enum: ['high', 'medium', 'low', 'unknown'],
        default: 'unknown'
      }
    }],
    monitoringPlan: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
        default: 'monthly'
      },
      nextReview: Date,
      responsible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      metrics: [String]
    }
  },

  // Recommendations
  recommendations: [{
    category: {
      type: String,
      enum: ['risk_mitigation', 'performance_improvement', 'relationship_management', 'contract_terms', 'monitoring'],
      required: true
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true
    },
    recommendation: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    expectedImpact: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    implementationEffort: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    timeline: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'in_progress', 'completed', 'rejected'],
      default: 'pending'
    }
  }],

  // Assessment Status
  status: {
    type: String,
    enum: ['draft', 'under_review', 'approved', 'implemented', 'archived'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  nextAssessment: Date,

  // Metadata
  version: {
    type: Number,
    default: 1
  },
  previousAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplierRiskAssessment'
  },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
supplierRiskAssessmentSchema.index({ supplierId: 1, assessmentDate: -1 });
supplierRiskAssessmentSchema.index({ overallRisk: 1 });
supplierRiskAssessmentSchema.index({ assessmentDate: -1 });
supplierRiskAssessmentSchema.index({ status: 1 });

// Virtual for risk level color
supplierRiskAssessmentSchema.virtual('riskLevelColor').get(function() {
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  };
  return colors[this.overallRisk.riskLevel] || 'gray';
});

// Method to calculate overall risk score
supplierRiskAssessmentSchema.methods.calculateOverallRisk = function() {
  let totalScore = 0;
  let totalWeight = 0;

  this.riskFactors.forEach(factor => {
    const weight = this.getFactorWeight(factor.category);
    totalScore += factor.riskScore * weight;
    totalWeight += weight;
  });

  const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  this.overallRisk.riskScore = Math.round(overallScore);
  
  // Determine risk level
  if (overallScore >= 80) this.overallRisk.riskLevel = 'critical';
  else if (overallScore >= 60) this.overallRisk.riskLevel = 'high';
  else if (overallScore >= 40) this.overallRisk.riskLevel = 'medium';
  else this.overallRisk.riskLevel = 'low';

  return this.overallRisk;
};

// Method to get factor weight
supplierRiskAssessmentSchema.methods.getFactorWeight = function(category) {
  const weights = {
    financial: 0.25,
    operational: 0.20,
    compliance: 0.20,
    reputational: 0.15,
    strategic: 0.15,
    environmental: 0.05
  };
  return weights[category] || 0.1;
};

// Method to generate recommendations
supplierRiskAssessmentSchema.methods.generateRecommendations = function() {
  const recommendations = [];

  // High risk factors
  const highRiskFactors = this.riskFactors.filter(f => f.riskLevel === 'high' || f.riskLevel === 'critical');
  
  highRiskFactors.forEach(factor => {
    switch (factor.category) {
      case 'financial':
        recommendations.push({
          category: 'risk_mitigation',
          priority: 'high',
          recommendation: `Implement financial monitoring for ${factor.factor}`,
          description: `Set up regular financial reviews and credit monitoring for this supplier.`,
          expectedImpact: 'high'
        });
        break;
      case 'operational':
        recommendations.push({
          category: 'performance_improvement',
          priority: 'high',
          recommendation: `Address operational issues with ${factor.factor}`,
          description: `Work with supplier to improve operational performance in this area.`,
          expectedImpact: 'high'
        });
        break;
      case 'compliance':
        recommendations.push({
          category: 'risk_mitigation',
          priority: 'high',
          recommendation: `Ensure compliance with ${factor.factor}`,
          description: `Verify supplier compliance and implement monitoring measures.`,
          expectedImpact: 'high'
        });
        break;
    }
  });

  return recommendations;
};

module.exports = mongoose.model('SupplierRiskAssessment', supplierRiskAssessmentSchema);
