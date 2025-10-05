const mongoose = require('../shims/mongoose');

const integrationSchema = new mongoose.Schema({
  integrationId: {
    type: String,
    required: true,
    unique: true,
    default: () => `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  type: {
    type: String,
    required: true,
    enum: ['payment', 'shipping', 'notification', 'analytics', 'crm', 'other']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
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
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  endpoints: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  authentication: {
    type: {
      type: String,
      enum: ['api_key', 'oauth2', 'basic', 'bearer', 'custom'],
      default: 'api_key'
    },
    credentials: {
      type: String, // Encrypted
      default: null
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  webhookConfig: {
    url: String,
    secret: String,
    events: [String]
  },
  rateLimits: {
    requestsPerMinute: {
      type: Number,
      default: 60
    },
    requestsPerHour: {
      type: Number,
      default: 1000
    }
  },
  healthCheck: {
    endpoint: String,
    interval: {
      type: Number,
      default: 300 // 5 minutes
    },
    lastCheck: Date,
    status: {
      type: String,
      enum: ['healthy', 'unhealthy', 'unknown'],
      default: 'unknown'
    }
  },
  usage: {
    totalRequests: {
      type: Number,
      default: 0
    },
    successfulRequests: {
      type: Number,
      default: 0
    },
    failedRequests: {
      type: Number,
      default: 0
    },
    lastUsed: Date
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
integrationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
integrationSchema.index({ type: 1, isActive: 1 });
integrationSchema.index({ category: 1, isActive: 1 });
integrationSchema.index({ integrationId: 1 });

module.exports = mongoose.model('Integration', integrationSchema);
