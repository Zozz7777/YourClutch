const mongoose = require('mongoose');

const partnerContractSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['service_agreement', 'supply_agreement', 'partnership', 'distribution', 'maintenance', 'warranty']
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  terms: {
    type: String,
    trim: true
  },
  value: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'under_review', 'approved', 'rejected', 'expired', 'terminated'],
    default: 'pending'
  },
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  signature: {
    required: { type: Boolean, default: false },
    signed: { type: Boolean, default: false },
    signedAt: { type: Date },
    signatureData: { type: String },
    signatureType: { type: String, enum: ['draw', 'upload'] }
  },
  review: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId },
    reviewedAt: { type: Date },
    comments: { type: String },
    rejectionReason: { type: String }
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
partnerContractSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerContractSchema.index({ partnerId: 1, status: 1 });
partnerContractSchema.index({ partnerId: 1, type: 1 });
partnerContractSchema.index({ partnerId: 1, createdAt: -1 });

module.exports = mongoose.model('PartnerContract', partnerContractSchema);
