const mongoose = require('../shims/mongoose');

const procurementSupplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    required: true,
    unique: true,
    default: () => `supp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  supplierName: {
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
  productCategories: [{
    type: String,
    enum: ['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']
  }],
  certifications: [{
    name: String,
    issuingBody: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  performance: {
    deliveryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    qualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    complianceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    overallSPI: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastUpdated: Date,
    totalOrders: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    qualityIssueRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  financial: {
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
      default: 'net_30'
    },
    customTerms: String,
    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSpend: {
      type: Number,
      default: 0,
      min: 0
    },
    currencyPreference: {
      type: String,
      default: 'EGP',
      enum: ['EGP', 'USD', 'EUR', 'GBP']
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String,
      routingNumber: String,
      swiftCode: String,
      iban: String
    }
  },
  risk: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    riskFactors: [{
      factor: String,
      impact: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      mitigation: String
    }],
    lastRiskAssessment: Date,
    riskScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    }
  },
  diversity: {
    diversityClassification: {
      type: String,
      enum: ['minority_owned', 'women_owned', 'veteran_owned', 'lgbtq_owned', 'small_business', 'none'],
      default: 'none'
    },
    certificationNumber: String,
    certificationDate: Date,
    certificationExpiry: Date
  },
  status: {
    isActive: {
      type: Boolean,
      default: true
    },
    isPreferred: {
      type: Boolean,
      default: false
    },
    relationship: {
      type: String,
      enum: ['strategic', 'approved', 'probation', 'blacklisted'],
      default: 'approved'
    },
    blacklistReason: String,
    blacklistDate: Date
  },
  notes: [{
    note: String,
    addedBy: {
      type: String,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
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
procurementSupplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate overall SPI (Supplier Performance Index)
  this.performance.overallSPI = (
    this.performance.deliveryScore * 0.4 +
    this.performance.qualityScore * 0.3 +
    this.performance.complianceScore * 0.3
  );
  
  next();
});

// Indexes for performance
procurementSupplierSchema.index({ supplierId: 1 });
procurementSupplierSchema.index({ supplierName: 1 });
procurementSupplierSchema.index({ 'contactInfo.primaryContact.email': 1 });
procurementSupplierSchema.index({ productCategories: 1 });
procurementSupplierSchema.index({ 'performance.overallSPI': -1 });
procurementSupplierSchema.index({ 'risk.riskLevel': 1 });
procurementSupplierSchema.index({ 'status.isActive': 1 });
procurementSupplierSchema.index({ 'status.isPreferred': 1 });
procurementSupplierSchema.index({ 'diversity.diversityClassification': 1 });
procurementSupplierSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProcurementSupplier', procurementSupplierSchema);
