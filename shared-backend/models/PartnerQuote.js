const mongoose = require('mongoose');

const partnerQuoteSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  quoteNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  vehicleInfo: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    licensePlate: { type: String },
    vin: { type: String }
  },
  quoteType: {
    type: String,
    required: true,
    enum: ['service', 'repair', 'maintenance', 'installation', 'consultation']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0.14, // 14% VAT
    min: 0,
    max: 1
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  validUntil: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  sentAt: {
    type: Date
  },
  viewedAt: {
    type: Date
  },
  respondedAt: {
    type: Date
  },
  response: {
    type: String,
    trim: true
  },
  convertedToOrder: {
    type: mongoose.Schema.Types.ObjectId
  },
  convertedAt: {
    type: Date
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
partnerQuoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerQuoteSchema.index({ partnerId: 1, status: 1 });
partnerQuoteSchema.index({ partnerId: 1, quoteType: 1 });
partnerQuoteSchema.index({ partnerId: 1, createdAt: -1 });
partnerQuoteSchema.index({ quoteNumber: 1 });
partnerQuoteSchema.index({ customerPhone: 1 });

module.exports = mongoose.model('PartnerQuote', partnerQuoteSchema);
