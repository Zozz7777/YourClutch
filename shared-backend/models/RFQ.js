const mongoose = require('../shims/mongoose');

const rfqSchema = new mongoose.Schema({
  rfqId: {
    type: String,
    required: true,
    unique: true,
    default: () => `rfq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  rfqNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  procurementRequestId: {
    type: String,
    ref: 'ProcurementRequest'
  },
  items: [{
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    specifications: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: true,
      enum: ['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    estimatedValue: Number
  }],
  suppliers: [{
    supplierId: {
      type: String,
      ref: 'ProcurementSupplier'
    },
    supplierName: String,
    invitedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: String,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['invited', 'viewed', 'quoted', 'declined', 'no_response'],
      default: 'invited'
    },
    responseDate: Date,
    declineReason: String
  }],
  timeline: {
    issueDate: {
      type: Date,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    extendedDueDate: Date,
    extensionReason: String
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'issued', 'bidding_open', 'bidding_closed', 'evaluated', 'awarded', 'cancelled'],
    default: 'draft'
  },
  quotes: [{
    supplierId: {
      type: String,
      ref: 'ProcurementSupplier'
    },
    supplierName: String,
    quoteNumber: String,
    items: [{
      itemName: String,
      quantity: Number,
      unitPrice: Number,
      totalPrice: Number,
      deliveryTime: Number, // in days
      specifications: String,
      notes: String
    }],
    totalQuote: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryTime: {
      type: Number,
      required: true,
      min: 0
    },
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
      default: 'net_30'
    },
    customTerms: String,
    validUntil: Date,
    currency: {
      type: String,
      default: 'EGP',
      enum: ['EGP', 'USD', 'EUR', 'GBP']
    },
    exchangeRate: {
      type: Number,
      default: 1
    },
    totalInEGP: Number,
    submittedAt: {
      type: Date,
      default: Date.now
    },
    submittedBy: {
      type: String,
      ref: 'User'
    },
    notes: String,
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String
    }],
    isSelected: {
      type: Boolean,
      default: false
    }
  }],
  evaluation: {
    criteria: [{
      name: String,
      weight: {
        type: Number,
        min: 0,
        max: 100
      },
      description: String
    }],
    scoringMatrix: [{
      supplierId: String,
      supplierName: String,
      scores: [{
        criteria: String,
        score: {
          type: Number,
          min: 0,
          max: 100
        },
        comments: String
      }],
      totalScore: Number,
      weightedScore: Number
    }],
    selectedSupplierId: String,
    selectedSupplierName: String,
    selectionReason: String,
    evaluatedBy: {
      type: String,
      ref: 'User'
    },
    evaluatedAt: Date
  },
  requirements: {
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    specialInstructions: String,
    qualityRequirements: String,
    complianceRequirements: [String],
    certifications: [String],
    insuranceRequirements: String,
    warrantyRequirements: String
  },
  communication: {
    emailTemplate: String,
    subject: String,
    message: String,
    sentEmails: [{
      supplierId: String,
      supplierName: String,
      email: String,
      sentAt: Date,
      sentBy: String,
      status: {
        type: String,
        enum: ['sent', 'delivered', 'opened', 'bounced', 'failed']
      }
    }],
    reminders: [{
      sentAt: Date,
      sentTo: [String],
      message: String
    }]
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: String,
      ref: 'User'
    }
  }],
  comments: [{
    comment: String,
    commentedBy: {
      type: String,
      ref: 'User'
    },
    commentedAt: {
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
rfqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total in EGP for quotes
  this.quotes.forEach(quote => {
    if (quote.currency !== 'EGP' && quote.exchangeRate) {
      quote.totalInEGP = quote.totalQuote * quote.exchangeRate;
    } else if (quote.currency === 'EGP') {
      quote.totalInEGP = quote.totalQuote;
    }
  });
  
  next();
});

// Indexes for performance
rfqSchema.index({ rfqId: 1 });
rfqSchema.index({ rfqNumber: 1 });
rfqSchema.index({ procurementRequestId: 1 });
rfqSchema.index({ status: 1, createdAt: -1 });
rfqSchema.index({ 'suppliers.supplierId': 1 });
rfqSchema.index({ 'timeline.dueDate': 1 });
rfqSchema.index({ 'evaluation.selectedSupplierId': 1 });
rfqSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RFQ', rfqSchema);
