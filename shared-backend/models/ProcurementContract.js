const mongoose = require('../shims/mongoose');

const procurementContractSchema = new mongoose.Schema({
  contractId: {
    type: String,
    required: true,
    unique: true,
    default: () => `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  supplierId: {
    type: String,
    required: true,
    ref: 'ProcurementSupplier'
  },
  supplierName: {
    type: String,
    required: true
  },
  contractType: {
    type: String,
    required: true,
    enum: ['blanket', 'fixed_price', 'cost_plus', 'time_materials', 'retainer', 'other']
  },
  terms: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    renewalDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    },
    renewalPeriod: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'custom']
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'EGP',
      enum: ['EGP', 'USD', 'EUR', 'GBP']
    },
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
      default: 'net_30'
    },
    customPaymentTerms: String
  },
  coveredItems: [{
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    category: {
      type: String,
      enum: ['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']
    },
    unitPrice: Number,
    unit: String,
    minimumOrder: Number,
    maximumOrder: Number,
    leadTime: Number
  }],
  pricingTerms: {
    pricingModel: {
      type: String,
      enum: ['fixed', 'variable', 'tiered', 'volume_discount', 'time_based']
    },
    priceBreaks: [{
      minQuantity: Number,
      maxQuantity: Number,
      unitPrice: Number,
      discount: Number
    }],
    escalationClause: String,
    priceReviewFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually', 'as_needed']
    }
  },
  deliveryTerms: {
    deliveryMethod: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup', 'custom']
    },
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    deliveryTime: Number, // in days
    deliveryInstructions: String,
    packagingRequirements: String,
    insuranceRequirements: String
  },
  compliance: {
    complianceRequirements: [String],
    certifications: [{
      name: String,
      required: Boolean,
      expiryDate: Date
    }],
    qualityStandards: [String],
    environmentalRequirements: [String],
    safetyRequirements: [String]
  },
  sla: [{
    metric: String,
    target: String,
    measurement: String,
    penalty: String,
    bonus: String
  }],
  usage: {
    utilization: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    spending: [{
      period: String,
      amount: Number,
      transactions: Number
    }],
    lastUsed: Date,
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    totalTransactions: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'expiring_soon', 'expired', 'renewed', 'cancelled', 'suspended'],
    default: 'draft'
  },
  renewal: {
    isRenewable: {
      type: Boolean,
      default: true
    },
    renewalTerms: String,
    renewalValue: Number,
    renewalDate: Date,
    renewalStatus: {
      type: String,
      enum: ['not_due', 'due_soon', 'overdue', 'renewed', 'declined']
    },
    renewalNotes: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'amendment', 'addendum', 'certificate', 'insurance', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: String,
      ref: 'User'
    }
  }],
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
procurementContractSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update status based on dates
  const now = new Date();
  const daysToExpiry = Math.ceil((this.terms.endDate - now) / (1000 * 60 * 60 * 24));
  
  if (daysToExpiry < 0) {
    this.status = 'expired';
  } else if (daysToExpiry <= 30) {
    this.status = 'expiring_soon';
  } else if (this.status === 'draft') {
    this.status = 'active';
  }
  
  // Calculate utilization percentage
  if (this.usage.totalSpent > 0 && this.terms.value > 0) {
    this.usage.utilization = (this.usage.totalSpent / this.terms.value) * 100;
  }
  
  next();
});

// Indexes for performance
procurementContractSchema.index({ contractId: 1 });
procurementContractSchema.index({ contractNumber: 1 });
procurementContractSchema.index({ supplierId: 1, status: 1 });
procurementContractSchema.index({ status: 1 });
procurementContractSchema.index({ 'terms.startDate': 1, 'terms.endDate': 1 });
procurementContractSchema.index({ 'terms.endDate': 1 });
procurementContractSchema.index({ 'renewal.renewalStatus': 1 });
procurementContractSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProcurementContract', procurementContractSchema);
