const mongoose = require('../shims/mongoose');

const shippingZoneSchema = new mongoose.Schema({
  zoneId: {
    type: String,
    required: true,
    unique: true,
    default: () => `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  governorate: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    trim: true,
    default: null
  },
  areas: [{
    type: String,
    trim: true
  }],
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDays: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  freeShippingThreshold: {
    type: Number,
    default: null,
    min: 0
  },
  weightLimits: {
    maxWeight: {
      type: Number,
      default: null // in kg
    },
    maxDimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  deliveryOptions: {
    standard: {
      enabled: {
        type: Boolean,
        default: true
      },
      cost: Number,
      days: Number
    },
    express: {
      enabled: {
        type: Boolean,
        default: false
      },
      cost: Number,
      days: Number
    },
    overnight: {
      enabled: {
        type: Boolean,
        default: false
      },
      cost: Number,
      days: Number
    }
  },
  restrictions: {
    excludedItems: [String],
    specialHandling: [String],
    timeRestrictions: {
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      daysOfWeek: [Number] // 0-6 (Sunday-Saturday)
    }
  },
  notes: {
    type: String,
    trim: true
  },
  metadata: {
    distanceFromCairo: {
      type: Number,
      default: null // in km
    },
    population: {
      type: Number,
      default: null
    },
    economicTier: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
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
shippingZoneSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
shippingZoneSchema.index({ governorate: 1, city: 1 });
shippingZoneSchema.index({ isActive: 1 });
shippingZoneSchema.index({ cost: 1 });
shippingZoneSchema.index({ 'deliveryOptions.standard.enabled': 1 });

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
