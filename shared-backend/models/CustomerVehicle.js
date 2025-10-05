const mongoose = require('mongoose');

const customerVehicleSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  customerId: {
    type: String,
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
    vin: { type: String, unique: true, sparse: true },
    color: { type: String },
    mileage: { type: Number, min: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  serviceHistory: [{
    id: { type: String, required: true },
    serviceType: { 
      type: String, 
      enum: ['maintenance', 'repair', 'inspection', 'diagnostic', 'installation', 'warranty'],
      required: true 
    },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    cost: { type: Number, default: 0 },
    mileage: { type: Number },
    technician: { type: String },
    partsUsed: [{ 
      name: { type: String },
      quantity: { type: Number },
      cost: { type: Number }
    }],
    notes: { type: String },
    warranty: {
      valid: { type: Boolean, default: false },
      expiresAt: { type: Date },
      terms: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId }
  }],
  lastServiceDate: {
    type: Date
  },
  nextServiceDue: {
    type: Date
  },
  totalServices: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
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
customerVehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
customerVehicleSchema.index({ partnerId: 1, status: 1 });
customerVehicleSchema.index({ partnerId: 1, 'vehicleInfo.make': 1, 'vehicleInfo.model': 1 });
customerVehicleSchema.index({ customerPhone: 1 });
customerVehicleSchema.index({ 'vehicleInfo.vin': 1 });
customerVehicleSchema.index({ 'vehicleInfo.licensePlate': 1 });

module.exports = mongoose.model('CustomerVehicle', customerVehicleSchema);
