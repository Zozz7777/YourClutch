const mongoose = require('../shims/mongoose');

const supplierCatalogSchema = new mongoose.Schema({
  catalogId: {
    type: String,
    required: true,
    unique: true,
    default: () => `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    itemId: {
      type: String,
      required: true
    },
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    itemCode: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    moq: {
      type: Number,
      default: 1,
      min: 1
    },
    leadTime: {
      type: Number,
      default: 7,
      min: 0
    },
    specifications: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      required: true,
      enum: ['office_supplies', 'it_equipment', 'furniture', 'services', 'raw_materials', 'maintenance', 'marketing', 'travel', 'other']
    },
    subCategory: String,
    unit: {
      type: String,
      default: 'piece',
      enum: ['piece', 'kg', 'liter', 'meter', 'hour', 'day', 'month', 'other']
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: 'cm'
      }
    },
    priceBreaks: [{
      minQuantity: {
        type: Number,
        required: true,
        min: 1
      },
      maxQuantity: Number,
      unitPrice: {
        type: Number,
        required: true,
        min: 0
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }],
    currency: {
      type: String,
      default: 'EGP',
      enum: ['EGP', 'USD', 'EUR', 'GBP']
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validTo: Date,
    inStock: {
      type: Boolean,
      default: true
    },
    stockLevel: {
      type: Number,
      default: 0,
      min: 0
    },
    restockDate: Date,
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    freeShippingThreshold: {
      type: Number,
      default: 0,
      min: 0
    },
    images: [{
      url: String,
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    documents: [{
      name: String,
      url: String,
      type: String
    }],
    tags: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  catalogName: {
    type: String,
    required: true,
    trim: true
  },
  catalogDescription: String,
  version: {
    type: String,
    default: '1.0'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
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
supplierCatalogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastUpdated = Date.now();
  next();
});

// Indexes for performance
supplierCatalogSchema.index({ catalogId: 1 });
supplierCatalogSchema.index({ supplierId: 1 });
supplierCatalogSchema.index({ 'items.itemName': 'text', 'items.description': 'text' });
supplierCatalogSchema.index({ 'items.category': 1 });
supplierCatalogSchema.index({ 'items.isActive': 1 });
supplierCatalogSchema.index({ isActive: 1 });
supplierCatalogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupplierCatalog', supplierCatalogSchema);
