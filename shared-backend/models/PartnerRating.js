const mongoose = require('mongoose');

const partnerRatingSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  category: {
    type: String,
    enum: ['service_quality', 'response_time', 'communication', 'pricing', 'reliability', 'overall'],
    default: 'overall'
  },
  source: {
    type: String,
    enum: ['customer_feedback', 'clutch_app', 'admin_review', 'peer_review'],
    required: true
  },
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  review: {
    type: String,
    trim: true
  },
  orderId: {
    type: String,
    index: true
  },
  serviceId: {
    type: String,
    index: true
  },
  response: {
    text: { type: String },
    isPublic: { type: Boolean, default: true },
    respondedAt: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId },
    respondedByName: { type: String }
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flag: {
    reason: { type: String },
    description: { type: String },
    flaggedBy: { type: mongoose.Schema.Types.ObjectId },
    flaggedAt: { type: Date }
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
partnerRatingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerRatingSchema.index({ partnerId: 1, createdAt: -1 });
partnerRatingSchema.index({ partnerId: 1, rating: -1 });
partnerRatingSchema.index({ partnerId: 1, category: 1 });
partnerRatingSchema.index({ partnerId: 1, source: 1 });
partnerRatingSchema.index({ orderId: 1 });

module.exports = mongoose.model('PartnerRating', partnerRatingSchema);
