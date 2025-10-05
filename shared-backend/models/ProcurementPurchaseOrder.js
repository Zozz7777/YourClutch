const mongoose = require('../shims/mongoose');

const procurementPurchaseOrderSchema = new mongoose.Schema({
  poId: {
    type: String,
    required: true,
    unique: true,
    default: () => `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  poNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  procurementRequestId: {
    type: String,
    ref: 'ProcurementRequest'
  },
  rfqId: {
    type: String,
    ref: 'RFQ'
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
    specifications: String,
    unit: {
      type: String,
      default: 'piece'
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
    enum: ['draft', 'issued', 'acknowledged', 'in_transit', 'partially_received', 'received', 'completed', 'cancelled'],
    default: 'draft'
  },
  delivery: {
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup', 'other']
    },
    trackingNumber: String,
    carrier: String
  },
  payment: {
    paymentTerms: {
      type: String,
      enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
      default: 'net_30'
    },
    customTerms: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending'
    },
    invoiceId: {
      type: String,
      ref: 'Bill'
    },
    paymentDate: Date,
    paymentMethod: String,
    paymentReference: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['po_pdf', 'supplier_confirmation', 'delivery_note', 'invoice', 'receipt', 'other']
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
  timeline: {
    created: {
      date: Date,
      by: String
    },
    issued: {
      date: Date,
      by: String
    },
    acknowledged: {
      date: Date,
      by: String,
      supplierConfirmation: String
    },
    shipped: {
      date: Date,
      trackingNumber: String,
      carrier: String
    },
    received: {
      date: Date,
      by: String,
      receiptId: String
    },
    invoiced: {
      date: Date,
      invoiceNumber: String,
      invoiceId: String
    },
    paid: {
      date: Date,
      by: String,
      paymentReference: String
    }
  },
  terms: {
    warranty: String,
    returnPolicy: String,
    qualityStandards: String,
    complianceRequirements: [String],
    specialInstructions: String
  },
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    approvedBy: String,
    approvedAt: Date,
    approvalNotes: String
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
procurementPurchaseOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total amount from items
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  next();
});

// Indexes for performance
procurementPurchaseOrderSchema.index({ poId: 1 });
procurementPurchaseOrderSchema.index({ poNumber: 1 });
procurementPurchaseOrderSchema.index({ procurementRequestId: 1 });
procurementPurchaseOrderSchema.index({ rfqId: 1 });
procurementPurchaseOrderSchema.index({ supplierId: 1, status: 1 });
procurementPurchaseOrderSchema.index({ status: 1, createdAt: -1 });
procurementPurchaseOrderSchema.index({ 'delivery.expectedDeliveryDate': 1 });
procurementPurchaseOrderSchema.index({ 'payment.invoiceId': 1 });
procurementPurchaseOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProcurementPurchaseOrder', procurementPurchaseOrderSchema);
