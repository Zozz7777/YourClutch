const mongoose = require('../shims/mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
    default: () => `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerId: {
    type: String,
    required: true,
    ref: 'Customer'
  },
  customerName: {
    type: String,
    required: true
  },
  invoiceDate: {
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
    enum: ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'],
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
    default: 'sales'
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
      ref: 'CustomerPayment'
    },
    amount: Number,
    paymentDate: Date,
    paymentMethod: String,
    reference: String
  }],
  email: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    sentTo: String,
    viewed: {
      type: Boolean,
      default: false
    },
    viewedAt: Date,
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentAt: Date
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
    nextInvoiceDate: Date,
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
invoiceSchema.pre('save', function(next) {
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
invoiceSchema.index({ invoiceId: 1 });
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customerId: 1, status: 1 });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ department: 1, status: 1 });
invoiceSchema.index({ 'recurring.isRecurring': 1 });
invoiceSchema.index({ 'email.sent': 1 });
invoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);