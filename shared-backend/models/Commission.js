const mongoose = require('../shims/mongoose');

const commissionSchema = new mongoose.Schema({
  commissionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  partnerId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  orderId: {
    type: String,
    required: true,
    ref: 'Order'
  },
  orderAmount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  vatAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  partnerNet: {
    type: Number,
    required: true,
    min: 0
  },
  clutchRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paymob', 'fawry', 'paypal', 'bank_transfer', 'cash']
  },
  category: {
    type: String,
    required: true,
    enum: ['parts', 'services', 'accessories', 'repair', 'maintenance']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paidAt: {
    type: Date,
    default: null
  },
  payoutId: {
    type: String,
    default: null,
    ref: 'Payout'
  },
  calculationDetails: {
    baseAmount: {
      type: Number,
      required: true
    },
    appliedRate: {
      type: Number,
      required: true
    },
    vatRate: {
      type: Number,
      default: 0
    },
    markupApplied: {
      type: Boolean,
      default: false
    },
    markupAmount: {
      type: Number,
      default: 0
    },
    markupStrategy: {
      type: String,
      enum: ['partner_pays', 'user_pays', 'split'],
      default: 'partner_pays'
    }
  },
  orderDetails: {
    customerId: String,
    customerName: String,
    orderDate: {
      type: Date,
      required: true
    },
    items: [{
      name: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number,
      category: String
    }]
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
commissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
commissionSchema.index({ partnerId: 1, status: 1 });
commissionSchema.index({ orderId: 1 });
commissionSchema.index({ status: 1, createdAt: -1 });
commissionSchema.index({ paidAt: -1 });
commissionSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
