const mongoose = require('mongoose');

const partnerTrainingSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  courseId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'failed'],
    default: 'not_started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0
  },
  modules: [{
    moduleId: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['not_started', 'in_progress', 'completed', 'failed'],
      default: 'not_started' 
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date },
    score: { type: Number, min: 0, max: 100 }
  }],
  feedback: {
    type: String,
    trim: true
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
partnerTrainingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
partnerTrainingSchema.index({ partnerId: 1, courseId: 1 }, { unique: true });
partnerTrainingSchema.index({ partnerId: 1, status: 1 });
partnerTrainingSchema.index({ partnerId: 1, progress: -1 });

module.exports = mongoose.model('PartnerTraining', partnerTrainingSchema);
