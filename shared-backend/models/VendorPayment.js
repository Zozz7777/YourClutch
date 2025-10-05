const mongoose = require('../shims/mongoose');

const vendorPaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `vpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  billIds: [{
    type: String,
    ref: 'Bill'
  }],
  paymentDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bank_transfer', 'check', 'cash', 'credit_card', 'digital_wallet', 'other']
  },
  referenceNumber: {
    type: String,
    required: true,
    trim: true
  },
  bankAccount: {
    bankName: String,
    accountNumber: String,
    accountHolderName: String,
    routingNumber: String
  },
  checkDetails: {
    checkNumber: String,
    checkDate: Date,
    bankName: String
  },
  creditCardDetails: {
    lastFourDigits: String,
    cardType: String,
    transactionId: String
  },
  digitalWalletDetails: {
    walletType: String,
    transactionId: String,
    walletId: String
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  processing: {
    processedBy: String,
    processedAt: Date,
    processingNotes: String
  },
  reconciliation: {
    reconciled: {
      type: Boolean,
      default: false
    },
    reconciledBy: String,
    reconciledAt: Date,
    bankStatementId: String,
    reconciliationNotes: String
  },
  earlyPaymentDiscount: {
    applied: {
      type: Boolean,
      default: false
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    originalAmount: Number
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
vendorPaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate amount in EGP if currency is not EGP
  if (this.currency !== 'EGP' && this.exchangeRate) {
    this.amountInEGP = this.amount * this.exchangeRate;
  } else if (this.currency === 'EGP') {
    this.amountInEGP = this.amount;
  }
  
  next();
});

// Indexes for performance
vendorPaymentSchema.index({ paymentId: 1 });
vendorPaymentSchema.index({ vendorId: 1, paymentDate: -1 });
vendorPaymentSchema.index({ billIds: 1 });
vendorPaymentSchema.index({ paymentDate: -1 });
vendorPaymentSchema.index({ status: 1 });
vendorPaymentSchema.index({ referenceNumber: 1 });
vendorPaymentSchema.index({ 'reconciliation.reconciled': 1 });
vendorPaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VendorPayment', vendorPaymentSchema);
