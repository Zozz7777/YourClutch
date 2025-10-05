const mongoose = require('../shims/mongoose');

const payoutSchema = new mongoose.Schema({
  payoutId: {
    type: String,
    required: true,
    unique: true,
    default: () => `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  partnerId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionIds: [{
    type: String,
    ref: 'Commission'
  }],
  method: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'cash', 'check', 'digital_wallet']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date,
    default: null
  },
  receiptUrl: {
    type: String,
    default: null // S3 URL for receipt/confirmation
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String,
    accountHolderName: String
  },
  transactionDetails: {
    transactionId: String,
    referenceNumber: String,
    processingFee: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    }
  },
  breakdown: {
    totalCommissions: {
      type: Number,
      required: true
    },
    vatAmount: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    netAmount: {
      type: Number,
      required: true
    }
  },
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: String
  }],
  audit: [{
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: String,
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    fromStatus: String,
    toStatus: String,
    reason: String
  }],
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
payoutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
payoutSchema.index({ partnerId: 1, status: 1 });
payoutSchema.index({ status: 1, scheduledDate: 1 });
payoutSchema.index({ paidDate: -1 });
payoutSchema.index({ payoutId: 1 });

module.exports = mongoose.model('Payout', payoutSchema);