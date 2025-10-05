const mongoose = require('../shims/mongoose');

const bankAccountSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true,
    default: () => `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['checking', 'savings', 'money_market', 'cd', 'line_of_credit', 'other']
  },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  routingNumber: {
    type: String,
    trim: true
  },
  swiftCode: {
    type: String,
    trim: true
  },
  iban: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'EGP',
    enum: ['EGP', 'USD', 'EUR', 'GBP']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  lastReconciled: {
    type: Date,
    default: null
  },
  lastReconciledBy: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bankDetails: {
    bankCode: String,
    branchCode: String,
    branchName: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    phone: String,
    email: String,
    website: String
  },
  onlineBanking: {
    enabled: {
      type: Boolean,
      default: false
    },
    username: String,
    lastSync: Date,
    syncStatus: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending'
    },
    syncError: String
  },
  settings: {
    autoReconcile: {
      type: Boolean,
      default: false
    },
    minimumBalance: {
      type: Number,
      default: 0
    },
    alertThreshold: {
      type: Number,
      default: 1000
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    default: ''
  },
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
bankAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
bankAccountSchema.index({ accountId: 1 });
bankAccountSchema.index({ bankName: 1, accountNumber: 1 });
bankAccountSchema.index({ isActive: 1 });
bankAccountSchema.index({ currency: 1 });
bankAccountSchema.index({ 'onlineBanking.enabled': 1 });
bankAccountSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
