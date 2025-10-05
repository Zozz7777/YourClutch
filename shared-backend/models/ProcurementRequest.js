const mongoose = require('../shims/mongoose');

const procurementRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    default: () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  requestNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  requestedBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  department: {
    type: String,
    required: true,
    enum: ['administration', 'finance', 'hr', 'marketing', 'operations', 'sales', 'it', 'legal', 'procurement', 'other']
  },
  project: {
    projectId: String,
    projectName: String,
    projectManager: String
  },
  items: [{
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: ['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']
    },
    specifications: {
      type: String,
      default: ''
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    catalogItemId: {
      type: String,
      ref: 'SupplierCatalog'
    },
    supplierId: {
      type: String,
      ref: 'Supplier'
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'cancelled'],
    default: 'draft'
  },
  approvalWorkflow: {
    approvalChain: [{
      approverId: {
        type: String,
        ref: 'User'
      },
      approverName: String,
      approverRole: String,
      approvalLevel: Number,
      required: Boolean,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      approvedAt: Date,
      comments: String
    }],
    currentApprovalStep: {
      type: Number,
      default: 0
    },
    approvalHistory: [{
      step: Number,
      approverId: String,
      approverName: String,
      action: {
        type: String,
        enum: ['approved', 'rejected', 'delegated']
      },
      comments: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  budgetTracking: {
    departmentBudgetId: {
      type: String,
      ref: 'DepartmentBudget'
    },
    projectBudgetId: {
      type: String,
      ref: 'ProjectBudget'
    },
    budgetCheckStatus: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'warning'],
      default: 'pending'
    },
    budgetCheckResult: {
      availableAmount: Number,
      requiredAmount: Number,
      isWithinBudget: Boolean,
      warningMessage: String
    }
  },
  justification: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    comment: String,
    commentedBy: {
      type: String,
      ref: 'User'
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Audit trail
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    default: null
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
procurementRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total amount from items
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  next();
});

// Indexes for performance
procurementRequestSchema.index({ requestId: 1 });
procurementRequestSchema.index({ requestNumber: 1 });
procurementRequestSchema.index({ requestedBy: 1, status: 1 });
procurementRequestSchema.index({ department: 1, status: 1 });
procurementRequestSchema.index({ status: 1, createdAt: -1 });
procurementRequestSchema.index({ 'approvalWorkflow.currentApprovalStep': 1 });
procurementRequestSchema.index({ 'budgetTracking.departmentBudgetId': 1 });
procurementRequestSchema.index({ 'budgetTracking.projectBudgetId': 1 });
procurementRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProcurementRequest', procurementRequestSchema);
