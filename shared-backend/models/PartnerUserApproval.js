const mongoose = require('../shims/mongoose');

const partnerUserApprovalSchema = new mongoose.Schema({
  // Request Information
  partnerId: {
    type: String,
    required: true,
    trim: true
  },
  requesterEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  requesterPhone: {
    type: String,
    required: true,
    trim: true
  },
  requesterName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Requested Role and Permissions
  requestedRole: {
    type: String,
    enum: ['partner_owner', 'partner_manager', 'partner_employee'],
    required: true
  },
  requestedPermissions: [{
    type: String,
    enum: [
      'view_orders', 'manage_orders', 'view_payments', 'manage_payments',
      'view_settings', 'manage_settings', 'view_dashboard', 'manage_dashboard',
      'view_invoices', 'manage_invoices', 'view_analytics', 'manage_analytics'
    ]
  }],
  
  // Approval Information
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartnerUser'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // Final Role Assignment (after approval)
  approvedRole: {
    type: String,
    enum: ['partner_owner', 'partner_manager', 'partner_employee']
  },
  approvedPermissions: [{
    type: String,
    enum: [
      'view_orders', 'manage_orders', 'view_payments', 'manage_payments',
      'view_settings', 'manage_settings', 'view_dashboard', 'manage_dashboard',
      'view_invoices', 'manage_invoices', 'view_analytics', 'manage_analytics'
    ]
  }],
  
  // Notification Information
  notificationsSent: {
    owner: { type: Boolean, default: false },
    requester: { type: Boolean, default: false }
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  },
  
  // Additional Information
  businessJustification: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
partnerUserApprovalSchema.index({ partnerId: 1, status: 1 });
partnerUserApprovalSchema.index({ requesterEmail: 1 });
partnerUserApprovalSchema.index({ status: 1 });
partnerUserApprovalSchema.index({ expiresAt: 1 });
partnerUserApprovalSchema.index({ approvedBy: 1 });

// Virtuals
partnerUserApprovalSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

partnerUserApprovalSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
partnerUserApprovalSchema.pre('save', function(next) {
  // Auto-expire if past expiry date
  if (this.status === 'pending' && this.isExpired) {
    this.status = 'expired';
  }
  next();
});

// Static methods
partnerUserApprovalSchema.statics.findPendingForPartner = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

partnerUserApprovalSchema.statics.findByRequester = function(email) {
  return this.find({ requesterEmail: email }).sort({ createdAt: -1 });
};

// Instance methods
partnerUserApprovalSchema.methods.approve = function(approvedBy, approvedRole, approvedPermissions, notes) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvedRole = approvedRole || this.requestedRole;
  this.approvedPermissions = approvedPermissions || this.requestedPermissions;
  if (notes) this.notes = notes;
  return this.save();
};

partnerUserApprovalSchema.methods.reject = function(approvedBy, rejectionReason) {
  this.status = 'rejected';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.rejectionReason = rejectionReason;
  return this.save();
};

partnerUserApprovalSchema.methods.sendOwnerNotification = function() {
  // This would integrate with your notification system
  console.log(`📧 Sending approval notification to partner owner for ${this.partnerId}`);
  this.notificationsSent.owner = true;
  return this.save();
};

partnerUserApprovalSchema.methods.sendRequesterNotification = function() {
  // This would integrate with your notification system
  console.log(`📧 Sending status notification to requester ${this.requesterEmail}`);
  this.notificationsSent.requester = true;
  return this.save();
};

module.exports = mongoose.model('PartnerUserApproval', partnerUserApprovalSchema);
