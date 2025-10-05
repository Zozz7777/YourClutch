const mongoose = require('../shims/mongoose');

const bankReconciliationSchema = new mongoose.Schema({
  reconciliationId: {
    type: String,
    required: true,
    unique: true,
    default: () => `recon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  bankAccountId: {
    type: String,
    required: true,
    ref: 'BankAccount'
  },
  bankAccountNumber: {
    type: String,
    required: true
  },
  statementDate: {
    type: Date,
    required: true
  },
  statementBalance: {
    type: Number,
    required: true
  },
  bookBalance: {
    type: Number,
    required: true
  },
  adjustments: [{
    type: {
      type: String,
      required: true,
      enum: ['deposit_in_transit', 'outstanding_check', 'bank_fee', 'interest_earned', 'nsf_fee', 'other']
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    reference: String
  }],
  totalAdjustments: {
    type: Number,
    default: 0
  },
  adjustedBookBalance: {
    type: Number,
    required: true
  },
  difference: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'in_progress', 'completed', 'disputed'],
    default: 'draft'
  },
  transactions: [{
    transactionId: {
      type: String,
      ref: 'BankTransaction'
    },
    bankTransactionId: String,
    date: Date,
    description: String,
    amount: Number,
    type: String,
    matched: {
      type: Boolean,
      default: false
    },
    matchedLedgerEntry: {
      type: String,
      ref: 'GeneralLedger'
    },
    notes: String
  }],
  unreconciledTransactions: [{
    transactionId: {
      type: String,
      ref: 'BankTransaction'
    },
    date: Date,
    description: String,
    amount: Number,
    type: String,
    reason: String
  }],
  completedBy: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    type: String, // File URLs
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
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
bankReconciliationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total adjustments
  this.totalAdjustments = this.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  
  // Calculate adjusted book balance
  this.adjustedBookBalance = this.bookBalance + this.totalAdjustments;
  
  // Calculate difference
  this.difference = this.statementBalance - this.adjustedBookBalance;
  
  next();
});

// Indexes for performance
bankReconciliationSchema.index({ reconciliationId: 1 });
bankReconciliationSchema.index({ bankAccountId: 1, statementDate: -1 });
bankReconciliationSchema.index({ statementDate: -1 });
bankReconciliationSchema.index({ status: 1 });
bankReconciliationSchema.index({ completedBy: 1 });
bankReconciliationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BankReconciliation', bankReconciliationSchema);
