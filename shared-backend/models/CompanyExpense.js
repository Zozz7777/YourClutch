const mongoose = require('../shims/mongoose');

const companyExpenseSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    required: true,
    unique: true,
    default: () => `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  expenseType: {
    type: String,
    required: true,
    enum: ['rent', 'utilities', 'marketing', 'software', 'office_supplies', 'travel', 'entertainment', 'professional_fees', 'insurance', 'maintenance', 'equipment', 'training', 'legal', 'accounting', 'other']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  vendor: {
    vendorName: {
      type: String,
      required: true,
      trim: true
    },
    vendorId: {
      type: String,
      ref: 'Vendor',
      default: null
    },
    contactInfo: {
      email: String,
      phone: String
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EGP',
    enum: ['EGP', 'USD', 'EUR', 'GBP']
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  amountInEGP: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'cash', 'check', 'credit_card', 'digital_wallet']
  },
  paymentDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  recurringSchedule: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
      default: null
    },
    nextPaymentDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  department: {
    type: String,
    required: true,
    enum: ['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'other']
  },
  project: {
    projectId: {
      type: String,
      default: null
    },
    projectName: {
      type: String,
      default: null
    }
  },
  budget: {
    budgetCategory: {
      type: String,
      default: null
    },
    budgetedAmount: {
      type: Number,
      default: null
    },
    variance: {
      type: Number,
      default: null
    }
  },
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: String,
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    approvalNotes: {
      type: String,
      default: ''
    }
  },
  tax: {
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
    vatAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    taxDeductible: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    type: String, // File URLs
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  receipt: {
    receiptNumber: String,
    receiptDate: Date,
    receiptAmount: Number,
    receiptUrl: String
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
companyExpenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate amount in EGP if currency is not EGP
  if (this.currency !== 'EGP' && this.exchangeRate) {
    this.amountInEGP = this.amount * this.exchangeRate;
  } else if (this.currency === 'EGP') {
    this.amountInEGP = this.amount;
  }
  
  // Calculate VAT amount if applicable
  if (this.tax.vatApplicable) {
    this.tax.vatAmount = (this.amountInEGP * this.tax.vatRate) / 100;
  }
  
  next();
});

// Indexes for performance
companyExpenseSchema.index({ expenseId: 1 });
companyExpenseSchema.index({ expenseType: 1, status: 1 });
companyExpenseSchema.index({ category: 1 });
companyExpenseSchema.index({ department: 1, status: 1 });
companyExpenseSchema.index({ paymentDate: -1 });
companyExpenseSchema.index({ dueDate: 1 });
companyExpenseSchema.index({ 'recurringSchedule.isRecurring': 1 });
companyExpenseSchema.index({ createdBy: 1 });
companyExpenseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CompanyExpense', companyExpenseSchema);
