const mongoose = require('mongoose');

const partnerAppointmentSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
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
  serviceType: {
    type: String,
    required: true,
    enum: ['maintenance', 'repair', 'inspection', 'diagnostic', 'installation', 'consultation']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  estimatedDuration: {
    type: Number,
    default: 60 // minutes
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  checkIn: {
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId }
  },
  checkOut: {
    checkedOut: { type: Boolean, default: false },
    checkedOutAt: { type: Date },
    checkedOutBy: { type: mongoose.Schema.Types.ObjectId }
  },
  completion: {
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    actualDuration: { type: Number }, // minutes
    actualCost: { type: Number },
    serviceNotes: { type: String },
    recommendations: { type: String }
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
partnerAppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerAppointmentSchema.index({ partnerId: 1, scheduledDate: 1 });
partnerAppointmentSchema.index({ partnerId: 1, status: 1 });
partnerAppointmentSchema.index({ partnerId: 1, serviceType: 1 });
partnerAppointmentSchema.index({ customerPhone: 1 });

module.exports = mongoose.model('PartnerAppointment', partnerAppointmentSchema);
