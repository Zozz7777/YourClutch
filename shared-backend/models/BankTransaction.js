const mongoose = require('../shims/mongoose');

const bankTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `btxn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['debit', 'credit']
  },
  category: {
    type: String,
    enum: ['income', 'expense', 'transfer', 'fee', 'interest', 'other'],
    default: 'other'
  },
  subCategory: {
    type: String,
    trim: true
  },
  payee: {
    type: String,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  checkNumber: {
    type: String,
    trim: true
  },
  matchedLedgerEntry: {
    type: String,
    ref: 'GeneralLedger',
    default: null
  },
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciliationDate: {
    type: Date,
    default: null
  },
  reconciledBy: {
    type: String,
    default: null
  },
  cleared: {
    type: Boolean,
    default: false
  },
  clearedDate: {
    type: Date,
    default: null
  },
  runningBalance: {
    type: Number,
    default: 0
  },
  bankTransactionId: {
    type: String,
    trim: true
  },
  bankReference: {
    type: String,
    trim: true
  },
  fees: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'EGP',
    enum: ['EGP', 'USD', 'EUR', 'GBP']
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  amountInEGP: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    enum: ['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'other'],
    default: null
  },
  project: {
    projectId: String,
    projectName: String
  },
  tags: [{
    type: String,
    trim: true
  }],
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
bankTransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate amount in EGP if currency is not EGP
  if (this.currency !== 'EGP' && this.exchangeRate) {
    this.amountInEGP = this.amount * this.exchangeRate;
  } else if (this.currency === 'EGP') {
    this.amountInEGP = this.amount;
  }
  
  next();
});

// Indexes for performance
bankTransactionSchema.index({ transactionId: 1 });
bankTransactionSchema.index({ bankAccountId: 1, date: -1 });
bankTransactionSchema.index({ bankAccountId: 1, reconciled: 1 });
bankTransactionSchema.index({ date: -1 });
bankTransactionSchema.index({ type: 1, category: 1 });
bankTransactionSchema.index({ payee: 1 });
bankTransactionSchema.index({ reference: 1 });
bankTransactionSchema.index({ checkNumber: 1 });
bankTransactionSchema.index({ matchedLedgerEntry: 1 });
bankTransactionSchema.index({ reconciled: 1 });
bankTransactionSchema.index({ cleared: 1 });
bankTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BankTransaction', bankTransactionSchema);
