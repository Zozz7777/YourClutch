const mongoose = require('mongoose');

const partnerLoyaltySchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsHistory: [{
    points: { type: Number, required: true },
    source: { 
      type: String, 
      enum: ['order_completion', 'fast_response', 'high_rating', 'monthly_bonus', 'referral', 'training_completion', 'manual_adjustment'],
      required: true 
    },
    description: { type: String },
    orderId: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  rewards: [{
    points: { type: Number, required: true },
    rewardType: { 
      type: String, 
      enum: ['cashback', 'commission_reduction', 'premium_features', 'training_access', 'featured_listing', 'dedicated_support'],
      required: true 
    },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'redeemed'], default: 'pending' }
  }],
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
partnerLoyaltySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerLoyaltySchema.index({ partnerId: 1 });
partnerLoyaltySchema.index({ tier: 1, points: -1 });

module.exports = mongoose.model('PartnerLoyalty', partnerLoyaltySchema);
