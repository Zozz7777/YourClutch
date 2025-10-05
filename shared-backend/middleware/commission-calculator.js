const Commission = require('../models/Commission');
const PartnerFinancial = require('../models/PartnerFinancial');
const { v4: uuidv4 } = require('uuid');

/**
 * Calculate commission for a completed order
 * @param {object} orderData - Order data
 * @param {string} orderData.orderId - Order ID
 * @param {string} orderData.partnerId - Partner ID
 * @param {number} orderData.orderAmount - Order total amount
 * @param {string} orderData.paymentMethod - Payment method used
 * @param {string} orderData.category - Order category (parts, services, etc.)
 * @param {array} orderData.items - Order items
 * @returns {object} - Commission calculation result
 */
async function calculateCommission(orderData) {
  try {
    const { orderId, partnerId, orderAmount, paymentMethod, category, items } = orderData;

    // Get partner financial configuration
    const partnerFinancial = await PartnerFinancial.findOne({ partnerId });
    if (!partnerFinancial) {
      throw new Error('Partner financial configuration not found');
    }

    // Calculate commission based on structure type
    let commissionRate = 0;
    let commissionAmount = 0;
    let vatAmount = 0;
    let partnerNet = 0;
    let clutchRevenue = 0;

    const commissionStructure = partnerFinancial.commissionStructure;

    switch (commissionStructure.type) {
      case 'fixed':
        commissionRate = commissionStructure.fixedRate;
        commissionAmount = (orderAmount * commissionRate) / 100;
        break;

      case 'tiered':
        commissionRate = calculateTieredRate(orderAmount, commissionStructure.tieredRates);
        commissionAmount = (orderAmount * commissionRate) / 100;
        break;

      case 'category':
        const categoryRate = commissionStructure.categoryRates.find(cr => cr.category === category);
        commissionRate = categoryRate ? categoryRate.rate : 0;
        commissionAmount = (orderAmount * commissionRate) / 100;
        break;

      case 'hybrid':
        commissionRate = calculateHybridRate(orderAmount, category, commissionStructure.hybridConfig);
        commissionAmount = (orderAmount * commissionRate) / 100;
        break;

      default:
        throw new Error('Invalid commission structure type');
    }

    // Apply VAT if applicable
    if (partnerFinancial.vatApplicable) {
      vatAmount = (commissionAmount * partnerFinancial.vatRate) / 100;
    }

    // Calculate markup based on strategy
    let markupAmount = 0;
    if (partnerFinancial.clutchMarkupStrategy !== 'none') {
      markupAmount = (orderAmount * partnerFinancial.markupPercentage) / 100;
    }

    // Calculate final amounts based on markup strategy
    switch (partnerFinancial.clutchMarkupStrategy) {
      case 'partner_pays':
        // Partner pays the markup, reduces their net
        partnerNet = commissionAmount - markupAmount;
        clutchRevenue = orderAmount - commissionAmount + markupAmount;
        break;
      case 'user_pays':
        // User pays the markup, increases order amount
        partnerNet = commissionAmount;
        clutchRevenue = orderAmount - commissionAmount + markupAmount;
        break;
      case 'split':
        // Split the markup between partner and user
        const partnerMarkupShare = markupAmount * 0.5;
        partnerNet = commissionAmount - partnerMarkupShare;
        clutchRevenue = orderAmount - commissionAmount + markupAmount;
        break;
      default:
        partnerNet = commissionAmount;
        clutchRevenue = orderAmount - commissionAmount;
    }

    // Create commission record
    const commission = new Commission({
      partnerId,
      orderId,
      orderAmount,
      commissionRate,
      commissionAmount,
      vatAmount,
      partnerNet,
      clutchRevenue,
      paymentMethod,
      category,
      status: 'pending',
      calculationDetails: {
        baseAmount: orderAmount,
        appliedRate: commissionRate,
        vatRate: partnerFinancial.vatRate,
        markupApplied: markupAmount > 0,
        markupAmount,
        markupStrategy: partnerFinancial.clutchMarkupStrategy
      },
      orderDetails: {
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        orderDate: new Date(),
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          category: item.category
        }))
      }
    });

    await commission.save();

    // Update partner financial totals
    await PartnerFinancial.findOneAndUpdate(
      { partnerId },
      {
        $inc: {
          'financials.totalRevenue': orderAmount,
          'financials.unpaidCommission': commissionAmount,
          'financials.totalOrders': 1,
          'financials.totalVatCollected': vatAmount
        },
        $set: {
          'financials.averageOrderValue': await calculateAverageOrderValue(partnerId)
        }
      }
    );

    return {
      success: true,
      data: {
        commissionId: commission.commissionId,
        commissionAmount,
        partnerNet,
        clutchRevenue,
        vatAmount,
        markupAmount
      }
    };
  } catch (error) {
    console.error('Error calculating commission:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate tiered commission rate
 * @param {number} orderAmount - Order amount
 * @param {array} tieredRates - Tiered rates configuration
 * @returns {number} - Commission rate
 */
function calculateTieredRate(orderAmount, tieredRates) {
  for (const tier of tieredRates) {
    if (orderAmount >= tier.minAmount && (!tier.maxAmount || orderAmount <= tier.maxAmount)) {
      return tier.rate;
    }
  }
  return 0;
}

/**
 * Calculate hybrid commission rate
 * @param {number} orderAmount - Order amount
 * @param {string} category - Order category
 * @param {object} hybridConfig - Hybrid configuration
 * @returns {number} - Commission rate
 */
function calculateHybridRate(orderAmount, category, hybridConfig) {
  let rate = hybridConfig.baseRate || 0;

  // Apply category multiplier
  const categoryMultiplier = hybridConfig.categoryMultipliers?.find(cm => cm.category === category);
  if (categoryMultiplier) {
    rate *= categoryMultiplier.multiplier;
  }

  // Apply tier multiplier
  const tierMultiplier = hybridConfig.tierMultipliers?.find(tm => 
    orderAmount >= tm.minAmount && (!tm.maxAmount || orderAmount <= tm.maxAmount)
  );
  if (tierMultiplier) {
    rate *= tierMultiplier.multiplier;
  }

  return rate;
}

/**
 * Calculate average order value for a partner
 * @param {string} partnerId - Partner ID
 * @returns {number} - Average order value
 */
async function calculateAverageOrderValue(partnerId) {
  try {
    const result = await Commission.aggregate([
      { $match: { partnerId } },
      { $group: { _id: null, average: { $avg: '$orderAmount' } } }
    ]);

    return result[0]?.average || 0;
  } catch (error) {
    console.error('Error calculating average order value:', error);
    return 0;
  }
}

/**
 * Process commission for multiple orders
 * @param {array} orders - Array of order data
 * @returns {array} - Array of commission results
 */
async function processBulkCommissions(orders) {
  const results = [];

  for (const order of orders) {
    const result = await calculateCommission(order);
    results.push({
      orderId: order.orderId,
      ...result
    });
  }

  return results;
}

/**
 * Recalculate commission for an existing order
 * @param {string} orderId - Order ID
 * @returns {object} - Recalculation result
 */
async function recalculateCommission(orderId) {
  try {
    // Find existing commission
    const existingCommission = await Commission.findOne({ orderId });
    if (!existingCommission) {
      throw new Error('Commission not found for this order');
    }

    // Get updated order data (this would come from your order service)
    // For now, we'll use the existing commission data
    const orderData = {
      orderId: existingCommission.orderId,
      partnerId: existingCommission.partnerId,
      orderAmount: existingCommission.orderAmount,
      paymentMethod: existingCommission.paymentMethod,
      category: existingCommission.category,
      items: existingCommission.orderDetails.items
    };

    // Delete existing commission
    await Commission.findByIdAndDelete(existingCommission._id);

    // Recalculate
    const result = await calculateCommission(orderData);

    return result;
  } catch (error) {
    console.error('Error recalculating commission:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get commission summary for a partner
 * @param {string} partnerId - Partner ID
 * @param {object} dateRange - Date range filter
 * @returns {object} - Commission summary
 */
async function getCommissionSummary(partnerId, dateRange = {}) {
  try {
    const query = { partnerId };
    if (dateRange.startDate || dateRange.endDate) {
      query.createdAt = {};
      if (dateRange.startDate) query.createdAt.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) query.createdAt.$lte = new Date(dateRange.endDate);
    }

    const summary = await Commission.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: '$commissionAmount' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$orderAmount' },
          averageCommission: { $avg: '$commissionAmount' },
          averageOrderValue: { $avg: '$orderAmount' },
          pendingCommissions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$commissionAmount', 0] }
          },
          paidCommissions: {
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$commissionAmount', 0] }
          }
        }
      }
    ]);

    return {
      success: true,
      data: summary[0] || {
        totalCommissions: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageCommission: 0,
        averageOrderValue: 0,
        pendingCommissions: 0,
        paidCommissions: 0
      }
    };
  } catch (error) {
    console.error('Error getting commission summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  calculateCommission,
  processBulkCommissions,
  recalculateCommission,
  getCommissionSummary
};
