const mongoose = require('../shims/mongoose');

const paymentCollectionSchema = new mongoose.Schema({
  collectionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  orderIds: [{
    type: String,
    ref: 'Order'
  }],
  revenueIds: [{
    type: String,
    ref: 'OrderRevenue'
  }],
  collectionMethod: {
    type: String,
    required: true,
    enum: ['payment_gateway', 'delivery_partner', 'delivery_team', 'installment_provider', 'cash_from_partner']
  },
  collectorId: {
    type: String,
    required: true
  },
  collectorName: {
    type: String,
    required: true
  },
  collectorType: {
    type: String,
    required: true,
    enum: ['payment_gateway', 'delivery_partner', 'delivery_team', 'installment_provider', 'partner']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  collectionDate: {
    type: Date,
    required: true
  },
  bankDepositDate: {
    type: Date,
    default: null
  },
  depositReference: {
    type: String,
    default: null
  },
  bankAccount: {
    bankName: String,
    accountNumber: String,
    accountHolder: String
  },
  fees: {
    gatewayFees: {
      type: Number,
      default: 0,
      min: 0
    },
    processingFees: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryFees: {
      type: Number,
      default: 0,
      min: 0
    },
    installmentFees: {
      type: Number,
      default: 0,
      min: 0
    },
    otherFees: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'collected', 'deposited', 'reconciled', 'disputed'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    type: String, // File URLs
    description: String
  }],
  
  // Settlement details for different collection methods
  settlementDetails: {
    // For payment gateways
    gatewaySettlement: {
      settlementId: String,
      settlementDate: Date,
      settlementAmount: Number,
      gatewayFees: Number,
      netSettlement: Number
    },
    // For delivery partners
    deliverySettlement: {
      deliveryPartnerId: String,
      deliveryPartnerName: String,
      codAmount: Number,
      deliveryFees: Number,
      netAmount: Number,
      deliveryDate: Date
    },
    // For installment providers
    installmentSettlement: {
      providerId: String,
      providerName: String,
      installmentAmount: Number,
      providerFees: Number,
      netAmount: Number,
      installmentDate: Date
    },
    // For cash from partners
    cashSettlement: {
      partnerId: String,
      partnerName: String,
      cashAmount: Number,
      clutchPercentage: Number,
      clutchAmount: Number,
      partnerAmount: Number,
      cashDate: Date
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
paymentCollectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
paymentCollectionSchema.index({ collectionMethod: 1, status: 1 });
paymentCollectionSchema.index({ collectorId: 1 });
paymentCollectionSchema.index({ collectionDate: -1 });
paymentCollectionSchema.index({ bankDepositDate: -1 });
paymentCollectionSchema.index({ reconciled: 1 });
paymentCollectionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentCollection', paymentCollectionSchema);
