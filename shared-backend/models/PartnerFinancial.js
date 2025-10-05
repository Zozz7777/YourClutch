const mongoose = require('../shims/mongoose');

const partnerFinancialSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Partner'
  },
  commissionStructure: {
    type: {
      type: String,
      enum: ['fixed', 'tiered', 'category', 'hybrid'],
      required: true
    },
    fixedRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tieredRates: [{
      minAmount: {
        type: Number,
        required: true
      },
      maxAmount: {
        type: Number,
        default: null // null means no upper limit
      },
      rate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    }],
    categoryRates: [{
      category: {
        type: String,
        required: true,
        enum: ['parts', 'services', 'accessories', 'repair', 'maintenance']
      },
      rate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    }],
    hybridConfig: {
      baseRate: {
        type: Number,
        min: 0,
        max: 100
      },
      categoryMultipliers: [{
        category: String,
        multiplier: {
          type: Number,
          min: 0
        }
      }],
      tierMultipliers: [{
        minAmount: Number,
        maxAmount: Number,
        multiplier: {
          type: Number,
          min: 0
        }
      }]
    }
  },
  vatApplicable: {
    type: Boolean,
    default: false
  },
  vatRate: {
    type: Number,
    default: 14,
    min: 0,
    max: 100
  },
  clutchMarkupStrategy: {
    type: String,
    enum: ['partner_pays', 'user_pays', 'split'],
    default: 'partner_pays'
  },
  markupPercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },
  payoutSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 1 // Monday
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      default: 1
    }
  },
  financials: {
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalCommission: {
      type: Number,
      default: 0
    },
    unpaidCommission: {
      type: Number,
      default: 0
    },
    totalVatCollected: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    }
  },
  lastPayoutDate: {
    type: Date,
    default: null
  },
  nextPayoutDate: {
    type: Date,
    default: null
  },
  contractTerms: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check', 'digital_wallet'],
    default: 'bank_transfer'
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String,
    accountHolderName: String
  },
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: String
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
partnerFinancialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
partnerFinancialSchema.index({ partnerId: 1 });
partnerFinancialSchema.index({ 'contractTerms.isActive': 1 });
partnerFinancialSchema.index({ 'financials.unpaidCommission': -1 });

module.exports = mongoose.model('PartnerFinancial', partnerFinancialSchema);
