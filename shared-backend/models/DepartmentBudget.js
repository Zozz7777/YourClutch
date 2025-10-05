const mongoose = require('../shims/mongoose');

const departmentBudgetSchema = new mongoose.Schema({
  budgetId: {
    type: String,
    required: true,
    unique: true,
    default: () => `dept_budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  department: {
    type: String,
    required: true,
    enum: ['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']
  },
  fiscalYear: {
    type: String,
    required: true,
    trim: true
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  categories: [{
    category: {
      type: String,
      required: true,
      enum: ['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    committedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    availableAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  tracking: {
    committedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    availableAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    utilizationPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  alerts: {
    thresholdWarning: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    },
    alertRecipients: [{
      userId: {
        type: String,
        ref: 'User'
      },
      email: String,
      role: String
    }],
    lastAlertSent: Date,
    alertHistory: [{
      alertType: {
        type: String,
        enum: ['threshold_warning', 'budget_exceeded', 'category_exceeded']
      },
      message: String,
      sentAt: Date,
      sentTo: [String]
    }]
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  forecast: {
    monthlyForecast: [{
      month: String,
      year: Number,
      forecastedSpend: Number,
      actualSpend: Number,
      variance: Number
    }],
    quarterlyForecast: [{
      quarter: String,
      year: Number,
      forecastedSpend: Number,
      actualSpend: Number,
      variance: Number
    }],
    lastForecastUpdate: Date,
    forecastAccuracy: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  transactions: [{
    transactionId: String,
    transactionType: {
      type: String,
      enum: ['procurement_request', 'purchase_order', 'expense', 'adjustment']
    },
    amount: Number,
    category: String,
    description: String,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'committed', 'spent', 'cancelled']
    }
  }],
  approvals: {
    requiresApproval: {
      type: Boolean,
      default: true
    },
    approvalThreshold: {
      type: Number,
      default: 1000,
      min: 0
    },
    approvers: [{
      userId: {
        type: String,
        ref: 'User'
      },
      role: String,
      approvalLevel: Number
    }]
  },
  notes: [{
    note: String,
    addedBy: {
      type: String,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Audit trail
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    default: null
  },
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
departmentBudgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate available amount
  this.tracking.availableAmount = this.totalBudget - this.tracking.committedAmount - this.tracking.spentAmount;
  
  // Calculate utilization percentage
  this.tracking.utilizationPercentage = ((this.tracking.committedAmount + this.tracking.spentAmount) / this.totalBudget) * 100;
  
  // Update category available amounts
  this.categories.forEach(category => {
    category.availableAmount = category.allocatedAmount - category.committedAmount - category.spentAmount;
  });
  
  next();
});

// Indexes for performance
departmentBudgetSchema.index({ budgetId: 1 });
departmentBudgetSchema.index({ department: 1, fiscalYear: 1 });
departmentBudgetSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
departmentBudgetSchema.index({ 'period.isActive': 1 });
departmentBudgetSchema.index({ 'tracking.utilizationPercentage': -1 });
departmentBudgetSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DepartmentBudget', departmentBudgetSchema);
