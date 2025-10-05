const mongoose = require('../shims/mongoose');

const orderRevenueSchema = new mongoose.Schema({
  revenueId: {
    type: String,
    required: true,
    unique: true,
    default: () => `revenue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  orderId: {
    type: String,
    required: true,
    ref: 'Order'
  },
  customerId: {
    type: String,
    required: true,
    ref: 'Customer'
  },
  partnerId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  orderType: {
    type: String,
    required: true,
    enum: ['parts', 'accessories', 'repair', 'service']
  },
  orderAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['online', 'installments', 'cod_delivery', 'cod_team', 'cash_to_partner']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  // Money collection details
  moneyReceivedFrom: {
    type: String,
    required: true,
    enum: ['payment_gateway', 'delivery_partner', 'delivery_team', 'installment_provider', 'cash_from_partner']
  },
  receivedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  receivedDate: {
    type: Date,
    required: true
  },
  // Payment gateway details (if applicable)
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paymob', 'fawry', 'paypal', 'other']
  },
  gatewayFees: {
    type: Number,
    default: 0,
    min: 0
  },
  gatewayTransactionId: String,
  gatewaySettlementDate: Date,
  
  // Delivery details (if applicable)
  deliveryPartnerId: {
    type: String,
    ref: 'DeliveryPartner'
  },
  deliveryFees: {
    type: Number,
    default: 0,
    min: 0
  },
  deliverySettlementDate: Date,
  
  // Installment details (if applicable)
  installmentProviderId: {
    type: String,
    ref: 'InstallmentProvider'
  },
  installmentFees: {
    type: Number,
    default: 0,
    min: 0
  },
  installmentSettlementDate: Date,
  
  // Commission calculation
  clutchPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  clutchRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  partnerPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  partnerCommission: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Cash handling (if cash paid to partner)
  cashPaidToPartner: {
    type: Number,
    default: 0,
    min: 0
  },
  cashReceivedFromPartner: {
    type: Number,
    default: 0,
    min: 0
  },
  cashSettlementDate: Date,
  
  // Tax and fees
  vatAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  vatRate: {
    type: Number,
    default: 14,
    min: 0,
    max: 100
  },
  otherFees: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Final calculations
  netRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  totalFees: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Status and settlement
  status: {
    type: String,
    required: true,
    enum: ['pending', 'received', 'settled', 'paid_out', 'disputed'],
    default: 'pending'
  },
  settledDate: {
    type: Date,
    default: null
  },
  weeklyPayoutId: {
    type: String,
    ref: 'WeeklyPayout',
    default: null
  },
  
  // Additional details
  notes: {
    type: String,
    default: ''
  },
  attachments: [{
    type: String, // File URLs
    description: String
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
orderRevenueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
orderRevenueSchema.index({ orderId: 1 });
orderRevenueSchema.index({ partnerId: 1, status: 1 });
orderRevenueSchema.index({ customerId: 1 });
orderRevenueSchema.index({ paymentMethod: 1, status: 1 });
orderRevenueSchema.index({ moneyReceivedFrom: 1, receivedDate: -1 });
orderRevenueSchema.index({ weeklyPayoutId: 1 });
orderRevenueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('OrderRevenue', orderRevenueSchema);
