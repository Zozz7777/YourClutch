const mongoose = require('mongoose');

const partnerSupplierSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service_provider']
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String }
  },
  website: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  performance: {
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalOrders: { type: Number, default: 0 },
    onTimeDelivery: { type: Number, default: 0, min: 0, max: 100 },
    qualityScore: { type: Number, default: 0, min: 0, max: 100 },
    communicationScore: { type: Number, default: 0, min: 0, max: 100 }
  },
  ratings: [{
    rating: { type: Number, required: true, min: 1, max: 5 },
    onTimeDelivery: { type: Number, min: 1, max: 5 },
    qualityScore: { type: Number, min: 1, max: 5 },
    communicationScore: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    ratedAt: { type: Date, default: Date.now }
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
partnerSupplierSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerSupplierSchema.index({ partnerId: 1, status: 1 });
partnerSupplierSchema.index({ partnerId: 1, type: 1 });
partnerSupplierSchema.index({ partnerId: 1, 'performance.rating': -1 });

module.exports = mongoose.model('PartnerSupplier', partnerSupplierSchema);
