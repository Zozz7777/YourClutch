const mongoose = require('../shims/mongoose');

const payrollSchema = new mongoose.Schema({
  payrollId: {
    type: String,
    required: true,
    unique: true,
    default: () => `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  payrollPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  employeePayments: [{
    employeeId: {
      type: String,
      required: true,
      ref: 'Employee'
    },
    employeeName: {
      type: String,
      required: true
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },
    allowances: [{
      type: {
        type: String,
        required: true,
        enum: ['housing', 'transport', 'meal', 'communication', 'medical', 'other']
      },
      name: String,
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    bonuses: [{
      type: {
        type: String,
        required: true,
        enum: ['performance', 'overtime', 'commission', 'holiday', 'other']
      },
      name: String,
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    overtimePay: {
      type: Number,
      default: 0,
      min: 0
    },
    grossPay: {
      type: Number,
      required: true,
      min: 0
    },
    deductions: [{
      type: {
        type: String,
        required: true,
        enum: ['tax', 'insurance', 'loan', 'advance', 'other']
      },
      name: String,
      amount: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    taxes: {
      incomeTax: {
        type: Number,
        default: 0,
        min: 0
      },
      socialInsurance: {
        type: Number,
        default: 0,
        min: 0
      },
      healthInsurance: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    netPay: {
      type: Number,
      required: true,
      min: 0
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountHolderName: String
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paidDate: Date,
    transactionReference: String
  }],
  totals: {
    totalGrossPay: {
      type: Number,
      required: true,
      min: 0
    },
    totalDeductions: {
      type: Number,
      required: true,
      min: 0
    },
    totalNetPay: {
      type: Number,
      required: true,
      min: 0
    },
    totalTaxes: {
      type: Number,
      required: true,
      min: 0
    },
    totalAllowances: {
      type: Number,
      required: true,
      min: 0
    },
    totalBonuses: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'approved', 'processing', 'completed', 'cancelled'],
    default: 'draft'
  },
  approval: {
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
  processing: {
    processedBy: {
      type: String,
      default: null
    },
    processedAt: {
      type: Date,
      default: null
    },
    processingNotes: {
      type: String,
      default: ''
    }
  },
  payment: {
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'check'],
      default: 'bank_transfer'
    },
    paymentDate: {
      type: Date,
      default: null
    },
    paymentReference: {
      type: String,
      default: null
    },
    bankAccount: {
      bankName: String,
      accountNumber: String,
      accountHolder: String
    }
  },
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    type: String, // File URLs
    description: String
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
payrollSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
payrollSchema.index({ payrollId: 1 });
payrollSchema.index({ 'payrollPeriod.year': -1, 'payrollPeriod.month': -1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payroll', payrollSchema);
