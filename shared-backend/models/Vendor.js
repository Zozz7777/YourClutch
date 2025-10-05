const mongoose = require('../shims/mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true,
    default: () => `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  contactInfo: {
    primaryContact: {
      name: String,
      email: String,
      phone: String,
      position: String
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    website: String,
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String
    }
  },
  businessInfo: {
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership', 'corporation'],
      default: 'company'
    },
    taxId: String,
    registrationNumber: String,
    licenseNumber: String,
    industry: String,
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'enterprise'],
      default: 'small'
    }
  },
  paymentTerms: {
    defaultTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
      default: 'net_30'
    },
    customTerms: String,
    discountTerms: {
      earlyPaymentDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      discountDays: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'EGP',
      enum: ['EGP', 'USD', 'EUR', 'GBP']
    }
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    routingNumber: String,
    swiftCode: String,
    iban: String
  },
  financials: {
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0,
      min: 0
    },
    creditUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    creditAvailable: {
      type: Number,
      default: 0,
      min: 0
    },
    averagePaymentDays: {
      type: Number,
      default: 30,
      min: 0
    },
    lastPaymentDate: Date,
    lastPurchaseDate: Date
  },
  paymentHistory: [{
    paymentId: {
      type: String,
      ref: 'VendorPayment'
    },
    amount: Number,
    paymentDate: Date,
    paymentMethod: String,
    reference: String
  }],
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'license', 'certificate', 'insurance', 'other']
    },
    name: String,
    url: String,
    expiryDate: Date,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
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
vendorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
vendorSchema.index({ vendorId: 1 });
vendorSchema.index({ vendorName: 1 });
vendorSchema.index({ 'contactInfo.primaryContact.email': 1 });
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ 'financials.outstandingBalance': -1 });
vendorSchema.index({ 'businessInfo.industry': 1 });
vendorSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Vendor', vendorSchema);
