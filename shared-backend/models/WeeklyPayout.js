const mongoose = require('../shims/mongoose');

const weeklyPayoutSchema = new mongoose.Schema({
  payoutId: {
    type: String,
    required: true,
    unique: true,
    default: () => `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  payoutPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    weekNumber: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  partnerId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  partnerName: {
    type: String,
    required: true
  },
  orderIds: [{
    type: String,
    ref: 'Order'
  }],
  revenueIds: [{
    type: String,
    ref: 'OrderRevenue'
  }],
  totalOrders: {
    type: Number,
    required: true,
    min: 0
  },
  totalRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  commissionCalculation: {
    clutchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    partnerPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    grossCommission: {
      type: Number,
      required: true,
      min: 0
    },
    clutchRevenue: {
      type: Number,
      required: true,
      min: 0
    },
    partnerCommission: {
      type: Number,
      required: true,
      min: 0
    }
  },
  deductions: [{
    type: {
      type: String,
      required: true,
      enum: ['cash_paid_to_clutch', 'returns', 'adjustments', 'penalties', 'other']
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    orderId: {
      type: String,
      default: null
    },
    reason: {
      type: String,
      default: ''
    }
  }],
  totalDeductions: {
    type: Number,
    required: true,
    min: 0
  },
  netPayout: {
    type: Number,
    required: true,
    min: 0
  },
  payoutMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'cash', 'check', 'digital_wallet']
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    routingNumber: String,
    swiftCode: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'],
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
  transactionReference: {
    type: String,
    default: null
  },
  receipt: {
    type: String, // File URL
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    type: String, // File URLs
    description: String
  }],
  
  // Approval workflow
  approval: {
    approvedBy: {
      type: String,
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    approvalNotes: {
      type: String,
      default: ''
    }
  },
  
  // Processing details
  processing: {
    processedBy: {
      type: String,
      default: null
    },
    processedAt: {
      type: Date,
      default: null
    },
    processingNotes: {
      type: String,
      default: ''
    }
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
weeklyPayoutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
weeklyPayoutSchema.index({ partnerId: 1, status: 1 });
weeklyPayoutSchema.index({ 'payoutPeriod.startDate': -1, 'payoutPeriod.endDate': -1 });
weeklyPayoutSchema.index({ status: 1, scheduledDate: 1 });
weeklyPayoutSchema.index({ paidDate: -1 });
weeklyPayoutSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WeeklyPayout', weeklyPayoutSchema);
