const mongoose = require('mongoose');

const partnerPromotionSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed_amount', 'buy_one_get_one', 'free_shipping', 'gift_with_purchase']
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  promoCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  minOrderAmount: {
    type: Number,
    min: 0
  },
  maxUses: {
    type: Number,
    min: 1
  },
  maxUsesPerCustomer: {
    type: Number,
    default: 1,
    min: 1
  },
  applicableServices: [{
    type: String
  }],
  terms: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'cancelled'],
    default: 'draft'
  },
  usage: {
    totalUses: { type: Number, default: 0 },
    uniqueCustomers: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    applications: [{
      orderId: { type: String, required: true },
      customerId: { type: String },
      discount: { type: Number, required: true },
      appliedAt: { type: Date, default: Date.now }
    }]
  },
  sentAt: {
    type: Date
  },
  sentMethod: {
    type: String,
    enum: ['email', 'sms', 'whatsapp']
  },
  sentMessage: {
    type: String
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
partnerPromotionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerPromotionSchema.index({ partnerId: 1, status: 1 });
partnerPromotionSchema.index({ partnerId: 1, type: 1 });
partnerPromotionSchema.index({ promoCode: 1 });
partnerPromotionSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('PartnerPromotion', partnerPromotionSchema);
