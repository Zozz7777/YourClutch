const mongoose = require('../shims/mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  deliveryPartnerId: {
    type: String,
    required: true,
    unique: true,
    default: () => `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  partnerName: {
    type: String,
    required: true,
    trim: true
  },
  contactInfo: {
    primaryContact: {
      name: String,
      email: String,
      phone: String
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  businessInfo: {
    businessType: {
      type: String,
      enum: ['individual', 'company', 'franchise'],
      default: 'individual'
    },
    taxId: String,
    registrationNumber: String,
    licenseNumber: String
  },
  serviceAreas: [{
    governorate: String,
    cities: [String],
    districts: [String]
  }],
  paymentTerms: {
    settlementFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    settlementDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1
    },
    minimumSettlement: {
      type: Number,
      default: 0,
      min: 0
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    routingNumber: String,
    swiftCode: String
  },
  performance: {
    totalDeliveries: {
      type: Number,
      default: 0
    },
    successfulDeliveries: {
      type: Number,
      default: 0
    },
    failedDeliveries: {
      type: Number,
      default: 0
    },
    averageDeliveryTime: {
      type: Number,
      default: 0 // in hours
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    lastDeliveryDate: Date
  },
  financials: {
    totalCollected: {
      type: Number,
      default: 0
    },
    totalSettled: {
      type: Number,
      default: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0
    },
    lastSettlementDate: Date,
    nextSettlementDate: Date
  },
  collectionHistory: [{
    collectionId: {
      type: String,
      ref: 'PaymentCollection'
    },
    period: {
      startDate: Date,
      endDate: Date
    },
    totalCollected: Number,
    totalDeliveries: Number,
    settlementAmount: Number,
    settlementDate: Date,
    status: {
      type: String,
      enum: ['pending', 'settled', 'disputed'],
      default: 'pending'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
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
deliveryPartnerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
deliveryPartnerSchema.index({ deliveryPartnerId: 1 });
deliveryPartnerSchema.index({ partnerName: 1 });
deliveryPartnerSchema.index({ isActive: 1 });
deliveryPartnerSchema.index({ 'financials.outstandingBalance': -1 });
deliveryPartnerSchema.index({ 'performance.rating': -1 });
deliveryPartnerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
