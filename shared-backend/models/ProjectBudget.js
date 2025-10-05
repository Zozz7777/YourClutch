const mongoose = require('../shims/mongoose');

const projectBudgetSchema = new mongoose.Schema({
  budgetId: {
    type: String,
    required: true,
    unique: true,
    default: () => `proj_budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectManager: {
    type: String,
    required: true,
    ref: 'User'
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budgetBreakdown: [{
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
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
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
    forecastedSpend: {
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
        enum: ['threshold_warning', 'budget_exceeded', 'category_exceeded', 'project_overrun']
      },
      message: String,
      sentAt: Date,
      sentTo: [String]
    }]
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  forecast: {
    monthlyForecast: [{
      month: String,
      year: Number,
      forecastedSpend: Number,
      actualSpend: Number,
      variance: Number
    }],
    milestoneForecast: [{
      milestone: String,
      date: Date,
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
  milestones: [{
    name: String,
    date: Date,
    budgetAllocation: Number,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'delayed']
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100
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
projectBudgetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate available amount
  this.tracking.availableAmount = this.totalBudget - this.tracking.committedAmount - this.tracking.spentAmount;
  
  // Calculate utilization percentage
  this.tracking.utilizationPercentage = ((this.tracking.committedAmount + this.tracking.spentAmount) / this.totalBudget) * 100;
  
  // Update category available amounts
  this.budgetBreakdown.forEach(category => {
    category.availableAmount = category.allocatedAmount - category.committedAmount - category.spentAmount;
  });
  
  next();
});

// Indexes for performance
projectBudgetSchema.index({ budgetId: 1 });
projectBudgetSchema.index({ projectId: 1 });
projectBudgetSchema.index({ projectManager: 1 });
projectBudgetSchema.index({ status: 1 });
projectBudgetSchema.index({ startDate: 1, endDate: 1 });
projectBudgetSchema.index({ 'tracking.utilizationPercentage': -1 });
projectBudgetSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProjectBudget', projectBudgetSchema);
