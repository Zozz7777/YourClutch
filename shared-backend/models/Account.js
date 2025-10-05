const mongoose = require('../shims/mongoose');

const accountSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true,
    default: () => `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense']
  },
  accountSubType: {
    type: String,
    required: true,
    enum: [
      // Assets
      'current_asset', 'fixed_asset', 'intangible_asset', 'investment',
      // Liabilities
      'current_liability', 'long_term_liability', 'payroll_liability',
      // Equity
      'owner_equity', 'retained_earnings', 'capital',
      // Revenue
      'operating_revenue', 'non_operating_revenue',
      // Expenses
      'operating_expense', 'non_operating_expense', 'cost_of_goods_sold'
    ]
  },
  parentAccountId: {
    type: String,
    ref: 'Account',
    default: null
  },
  subAccounts: [{
    type: String,
    ref: 'Account'
  }],
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'EGP',
    enum: ['EGP', 'USD', 'EUR', 'GBP']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  taxInfo: {
    taxApplicable: {
      type: Boolean,
      default: false
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    taxAccount: {
      type: String,
      ref: 'Account',
      default: null
    }
  },
  reconciliationInfo: {
    lastReconciled: {
      type: Date,
      default: null
    },
    reconciledBy: {
      type: String,
      default: null
    },
    reconciliationNotes: {
      type: String,
      default: ''
    }
  },
  budget: {
    monthlyBudget: {
      type: Number,
      default: 0,
      min: 0
    },
    yearlyBudget: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  settings: {
    allowNegativeBalance: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    minimumBalance: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String,
    default: ''
  },
  
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
accountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
accountSchema.index({ accountId: 1 });
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ accountType: 1, accountSubType: 1 });
accountSchema.index({ parentAccountId: 1 });
accountSchema.index({ isActive: 1 });
accountSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Account', accountSchema);
