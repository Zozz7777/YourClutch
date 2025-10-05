const mongoose = require('../shims/mongoose');

const goodsReceiptSchema = new mongoose.Schema({
  receiptId: {
    type: String,
    required: true,
    unique: true,
    default: () => `gr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  poId: {
    type: String,
    required: true,
    ref: 'ProcurementPurchaseOrder'
  },
  poNumber: {
    type: String,
    required: true
  },
  supplierId: {
    type: String,
    required: true,
    ref: 'ProcurementSupplier'
  },
  supplierName: {
    type: String,
    required: true
  },
  receivedBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  receivedDate: {
    type: Date,
    required: true
  },
  items: [{
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    orderedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    receivedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    acceptedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    rejectedQuantity: {
      type: Number,
      default: 0,
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
    batchNumber: String,
    serialNumbers: [String],
    expiryDate: Date,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
      default: 'good'
    },
    notes: String
  }],
  totalReceivedValue: {
    type: Number,
    required: true,
    min: 0
  },
  quality: {
    inspectionStatus: {
      type: String,
      enum: ['pending', 'in_progress', 'passed', 'failed', 'conditional'],
      default: 'pending'
    },
    inspectionNotes: String,
    inspectedBy: {
      type: String,
      ref: 'User'
    },
    inspectedAt: Date,
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    qualityIssues: [{
      issue: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      description: String,
      resolution: String,
      resolved: {
        type: Boolean,
        default: false
      }
    }]
  },
  discrepancies: {
    hasDiscrepancy: {
      type: Boolean,
      default: false
    },
    discrepancyType: {
      type: String,
      enum: ['quantity_shortage', 'quantity_excess', 'wrong_item', 'damaged_goods', 'quality_issue', 'missing_documentation', 'other']
    },
    discrepancyDescription: String,
    discrepancyNotes: String,
    resolution: String,
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: String,
      ref: 'User'
    },
    resolvedAt: Date
  },
  delivery: {
    deliveryMethod: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup', 'other']
    },
    carrier: String,
    trackingNumber: String,
    deliveryPerson: String,
    deliveryPersonContact: String,
    deliveryNotes: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['delivery_note', 'packing_slip', 'invoice', 'quality_certificate', 'warranty', 'other']
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: String,
      ref: 'User'
    }
  }],
  photos: [{
    fileName: String,
    fileUrl: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: String,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['draft', 'received', 'inspected', 'accepted', 'rejected', 'partial', 'completed'],
    default: 'draft'
  },
  warehouse: {
    location: String,
    binNumber: String,
    storageInstructions: String,
    handledBy: {
      type: String,
      ref: 'User'
    }
  },
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
goodsReceiptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total received value
  this.totalReceivedValue = this.items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitPrice), 0);
  
  // Update status based on inspection and discrepancies
  if (this.quality.inspectionStatus === 'passed' && !this.discrepancies.hasDiscrepancy) {
    this.status = 'accepted';
  } else if (this.quality.inspectionStatus === 'failed' || this.discrepancies.hasDiscrepancy) {
    this.status = 'rejected';
  } else if (this.quality.inspectionStatus === 'in_progress') {
    this.status = 'inspected';
  }
  
  next();
});

// Indexes for performance
goodsReceiptSchema.index({ receiptId: 1 });
goodsReceiptSchema.index({ poId: 1 });
goodsReceiptSchema.index({ poNumber: 1 });
goodsReceiptSchema.index({ supplierId: 1, receivedDate: -1 });
goodsReceiptSchema.index({ receivedBy: 1, receivedDate: -1 });
goodsReceiptSchema.index({ status: 1 });
goodsReceiptSchema.index({ 'quality.inspectionStatus': 1 });
goodsReceiptSchema.index({ 'discrepancies.hasDiscrepancy': 1 });
goodsReceiptSchema.index({ receivedDate: -1 });
goodsReceiptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GoodsReceipt', goodsReceiptSchema);
