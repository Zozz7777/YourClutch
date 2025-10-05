const mongoose = require('../shims/mongoose');

const paymentGatewaySchema = new mongoose.Schema({
  gatewayId: {
    type: String,
    required: true,
    unique: true,
    default: () => `gateway_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: null // S3 URL
  },
  isActive: {
    type: Boolean,
    default: false
  },
  credentials: {
    type: String,
    required: true // Encrypted JSON string
  },
  supportedCurrencies: [{
    type: String,
    enum: ['EGP', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD']
  }],
  webhookUrl: {
    type: String,
    default: null
  },
  apiEndpoints: {
    sandbox: {
      baseUrl: String,
      paymentUrl: String,
      refundUrl: String,
      statusUrl: String
    },
    production: {
      baseUrl: String,
      paymentUrl: String,
      refundUrl: String,
      statusUrl: String
    }
  },
  configSchema: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  environment: {
    type: String,
    enum: ['sandbox', 'production'],
    default: 'sandbox'
  },
  lastTested: {
    type: Date,
    default: null
  },
  testStatus: {
    type: String,
    enum: ['not_tested', 'passed', 'failed'],
    default: 'not_tested'
  },
  testMessage: {
    type: String,
    default: null
  },
  stats: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    successfulTransactions: {
      type: Number,
      default: 0
    },
    failedTransactions: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    lastTransactionAt: {
      type: Date,
      default: null
    }
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
paymentGatewaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for performance
paymentGatewaySchema.index({ slug: 1, isActive: 1 });
paymentGatewaySchema.index({ isActive: 1, environment: 1 });

module.exports = mongoose.model('PaymentGateway', paymentGatewaySchema);
