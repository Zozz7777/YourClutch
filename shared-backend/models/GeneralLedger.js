const mongoose = require('../shims/mongoose');

const generalLedgerSchema = new mongoose.Schema({
  ledgerId: {
    type: String,
    required: true,
    unique: true,
    default: () => `gl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  accountId: {
    type: String,
    required: true,
    ref: 'Account'
  },
  accountName: {
    type: String,
    required: true
  },
  accountNumber: {
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
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  },
  entryId: {
    type: String,
    required: true,
    ref: 'JournalEntry'
  },
  entryNumber: {
    type: String,
    required: true
  },
  referenceType: {
    type: String,
    required: true,
    enum: ['journal_entry', 'invoice', 'payment', 'receipt', 'adjustment', 'reversal', 'closing']
  },
  referenceId: {
    type: String,
    required: true
  },
  reconciled: {
    type: Boolean,
    default: false
  },
  reconciliationDate: {
    type: Date,
    default: null
  },
  reconciliationNotes: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: null
  },
  project: {
    projectId: {
      type: String,
      default: null
    },
    projectName: {
      type: String,
      default: null
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    default: ''
  },
  
  // Audit trail
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
generalLedgerSchema.index({ ledgerId: 1 });
generalLedgerSchema.index({ accountId: 1, date: -1 });
generalLedgerSchema.index({ accountId: 1, reconciled: 1 });
generalLedgerSchema.index({ date: -1 });
generalLedgerSchema.index({ entryId: 1 });
generalLedgerSchema.index({ referenceType: 1, referenceId: 1 });
generalLedgerSchema.index({ reconciled: 1 });
generalLedgerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GeneralLedger', generalLedgerSchema);
