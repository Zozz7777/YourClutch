const mongoose = require('../shims/mongoose');

const journalEntrySchema = new mongoose.Schema({
  entryId: {
    type: String,
    required: true,
    unique: true,
    default: () => `je_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  entryNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['manual', 'automatic', 'recurring', 'adjustment', 'closing']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  lines: [{
    lineId: {
      type: String,
      required: true
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
    description: {
      type: String,
      default: ''
    },
    reference: {
      type: String,
      default: ''
    }
  }],
  totalDebit: {
    type: Number,
    required: true,
    min: 0
  },
  totalCredit: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'posted', 'reversed', 'cancelled'],
    default: 'draft'
  },
  postedBy: {
    type: String,
    default: null
  },
  postedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  reversal: {
    isReversed: {
      type: Boolean,
      default: false
    },
    reversedBy: {
      type: String,
      default: null
    },
    reversedAt: {
      type: Date,
      default: null
    },
    reversalReason: {
      type: String,
      default: ''
    },
    originalEntryId: {
      type: String,
      default: null
    }
  },
  attachments: [{
    type: String, // File URLs
    description: String
  }],
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
journalEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate totals
  this.totalDebit = this.lines.reduce((sum, line) => sum + line.debit, 0);
  this.totalCredit = this.lines.reduce((sum, line) => sum + line.credit, 0);
  
  // Validate that debits equal credits
  if (this.totalDebit !== this.totalCredit) {
    return next(new Error('Total debits must equal total credits'));
  }
  
  next();
});

// Indexes for performance
journalEntrySchema.index({ entryId: 1 });
journalEntrySchema.index({ entryNumber: 1 });
journalEntrySchema.index({ date: -1 });
journalEntrySchema.index({ type: 1, status: 1 });
journalEntrySchema.index({ status: 1 });
journalEntrySchema.index({ 'lines.accountId': 1 });
journalEntrySchema.index({ createdAt: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
