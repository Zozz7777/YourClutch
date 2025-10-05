const mongoose = require('../shims/mongoose');

const billSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
    unique: true,
    default: () => `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  billNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vendorId: {
    type: String,
    required: true,
    ref: 'Vendor'
  },
  vendorName: {
    type: String,
    required: true
  },
  billDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [{
    itemId: String,
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    category: String,
    accountId: {
      type: String,
      ref: 'Account'
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    vatRate: {
      type: Number,
      default: 14,
      min: 0,
      max: 100
    },
    vatAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    otherTaxes: [{
      name: String,
      rate: Number,
      amount: Number
    }]
  },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      default: 0,
      min: 0
    },
    amount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  amountDue: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'sent', 'received', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentTerms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
    default: 'net_30'
  },
  customTerms: String,
  earlyPaymentDiscount: {
    discountPercentage: {
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
  department: {
    type: String,
    enum: ['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'other'],
    default: 'operations'
  },
  project: {
    projectId: String,
    projectName: String
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    type: String, // File URLs
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  payments: [{
    paymentId: {
      type: String,
      ref: 'VendorPayment'
    },
    amount: Number,
    paymentDate: Date,
    paymentMethod: String,
    reference: String
  }],
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    approvedBy: String,
    approvedAt: Date,
    approvalNotes: String
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually'],
      default: 'monthly'
    },
    nextBillDate: Date,
    endDate: Date,
    templateId: String
  },
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
billSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate amount due
  this.amountDue = this.total - this.amountPaid;
  
  // Update status based on payment
  if (this.amountDue <= 0) {
    this.status = 'paid';
  } else if (this.amountPaid > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  next();
});

// Indexes for performance
billSchema.index({ billId: 1 });
billSchema.index({ billNumber: 1 });
billSchema.index({ vendorId: 1, status: 1 });
billSchema.index({ billDate: -1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ status: 1 });
billSchema.index({ department: 1, status: 1 });
billSchema.index({ 'recurring.isRecurring': 1 });
billSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bill', billSchema);
