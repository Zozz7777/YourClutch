const mongoose = require('../shims/mongoose');

const spendAnalyticsSchema = new mongoose.Schema({
  analyticsId: {
    type: String,
    required: true,
    unique: true,
    default: () => `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually']
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  department: {
    type: String,
    enum: ['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other', 'all']
  },
  category: {
    type: String,
    enum: ['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other', 'all']
  },
  supplier: {
    supplierId: {
      type: String,
      ref: 'ProcurementSupplier'
    },
    supplierName: String
  },
  metrics: {
    totalSpend: {
      type: Number,
      required: true,
      min: 0
    },
    transactionCount: {
      type: Number,
      required: true,
      min: 0
    },
    averageTransactionValue: {
      type: Number,
      min: 0
    },
    maverickSpend: {
      type: Number,
      default: 0,
      min: 0
    },
    spendUnderManagement: {
      type: Number,
      default: 0,
      min: 0
    },
    costSavings: {
      type: Number,
      default: 0,
      min: 0
    },
    PPV: {
      type: Number,
      default: 0
    },
    contractCompliance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    supplierDiversity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  breakdown: {
    bySupplier: [{
      supplierId: String,
      supplierName: String,
      spend: Number,
      transactions: Number,
      percentage: Number
    }],
    byCategory: [{
      category: String,
      spend: Number,
      transactions: Number,
      percentage: Number
    }],
    byDepartment: [{
      department: String,
      spend: Number,
      transactions: Number,
      percentage: Number
    }],
    byPaymentMethod: [{
      method: String,
      spend: Number,
      transactions: Number,
      percentage: Number
    }]
  },
  trends: {
    previousPeriod: {
      totalSpend: Number,
      transactionCount: Number,
      averageTransactionValue: Number
    },
    growthRate: {
      spend: Number,
      transactions: Number,
      averageValue: Number
    },
    variance: {
      spend: Number,
      transactions: Number,
      averageValue: Number
    }
  },
  alerts: [{
    type: {
      type: String,
      enum: ['spend_increase', 'maverick_spend', 'budget_exceeded', 'supplier_risk', 'contract_expiry']
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    message: String,
    threshold: Number,
    actualValue: Number,
    triggeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  forecasts: {
    nextPeriod: {
      predictedSpend: Number,
      confidence: Number,
      factors: [String]
    },
    seasonalAdjustment: Number,
    trendAnalysis: String
  },
  benchmarks: {
    industryAverage: Number,
    bestInClass: Number,
    companyTarget: Number,
    performance: {
      type: String,
      enum: ['below_average', 'average', 'above_average', 'best_in_class']
    }
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: String,
    ref: 'User'
  },
  
  // Audit trail
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
spendAnalyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate average transaction value
  if (this.metrics.transactionCount > 0) {
    this.metrics.averageTransactionValue = this.metrics.totalSpend / this.metrics.transactionCount;
  }
  
  // Calculate percentages for breakdowns
  this.breakdown.bySupplier.forEach(item => {
    item.percentage = (item.spend / this.metrics.totalSpend) * 100;
  });
  
  this.breakdown.byCategory.forEach(item => {
    item.percentage = (item.spend / this.metrics.totalSpend) * 100;
  });
  
  this.breakdown.byDepartment.forEach(item => {
    item.percentage = (item.spend / this.metrics.totalSpend) * 100;
  });
  
  this.breakdown.byPaymentMethod.forEach(item => {
    item.percentage = (item.spend / this.metrics.totalSpend) * 100;
  });
  
  // Calculate growth rates
  if (this.trends.previousPeriod.totalSpend > 0) {
    this.trends.growthRate.spend = ((this.metrics.totalSpend - this.trends.previousPeriod.totalSpend) / this.trends.previousPeriod.totalSpend) * 100;
  }
  
  if (this.trends.previousPeriod.transactionCount > 0) {
    this.trends.growthRate.transactions = ((this.metrics.transactionCount - this.trends.previousPeriod.transactionCount) / this.trends.previousPeriod.transactionCount) * 100;
  }
  
  if (this.trends.previousPeriod.averageTransactionValue > 0) {
    this.trends.growthRate.averageValue = ((this.metrics.averageTransactionValue - this.trends.previousPeriod.averageTransactionValue) / this.trends.previousPeriod.averageTransactionValue) * 100;
  }
  
  next();
});

// Indexes for performance
spendAnalyticsSchema.index({ analyticsId: 1 });
spendAnalyticsSchema.index({ period: 1, periodStart: -1, periodEnd: -1 });
spendAnalyticsSchema.index({ department: 1, category: 1 });
spendAnalyticsSchema.index({ 'supplier.supplierId': 1 });
spendAnalyticsSchema.index({ 'metrics.totalSpend': -1 });
spendAnalyticsSchema.index({ generatedAt: -1 });
spendAnalyticsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SpendAnalytics', spendAnalyticsSchema);
