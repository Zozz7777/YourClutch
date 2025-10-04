const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

// @route   GET /api/v1/partners/dashboard/analytics
// @desc    Get partner dashboard analytics
// @access  Private
router.get('/analytics', async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { period = 'week' } = req.query;
    
    console.log('📊 Dashboard analytics request:', { partnerId, period });
    
    const { getCollection } = require('../config/database');
    const ordersCollection = await getCollection('orders');
    const paymentsCollection = await getCollection('payments');
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get orders analytics
    const orders = await ordersCollection.find({
      partnerId,
      createdAt: { $gte: startDate }
    }).toArray();
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const inProgressOrders = orders.filter(order => order.status === 'in_progress').length;
    
    // Get payments analytics
    const payments = await paymentsCollection.find({
      partnerId,
      createdAt: { $gte: startDate }
    }).toArray();
    
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const completedPayments = payments.filter(payment => payment.status === 'completed').length;
    const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
    
    // Calculate growth
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousOrders = await ordersCollection.find({
      partnerId,
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    }).toArray();
    
    const previousRevenue = await paymentsCollection.find({
      partnerId,
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    }).toArray();
    
    const revenueGrowth = previousRevenue.length > 0 
      ? ((totalRevenue - previousRevenue.reduce((sum, p) => sum + p.amount, 0)) / previousRevenue.reduce((sum, p) => sum + p.amount, 0)) * 100
      : 0;
    
    const orderGrowth = previousOrders.length > 0 
      ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100
      : 0;
    
    res.json({
      success: true,
      data: {
        period,
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          inProgress: inProgressOrders,
          growth: orderGrowth
        },
        revenue: {
          total: totalRevenue,
          completed: completedPayments,
          pending: pendingPayments,
          growth: revenueGrowth
        },
        trends: {
          dailyRevenue: calculateDailyTrends(payments),
          orderStatusDistribution: {
            completed: completedOrders,
            pending: pendingOrders,
            inProgress: inProgressOrders
          }
        }
      }
    });
    
  } catch (error) {
    logger.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/dashboard/inventory
// @desc    Get inventory overview
// @access  Private
router.get('/inventory', async (req, res) => {
  try {
    const { partnerId } = req.user;
    
    console.log('📦 Inventory overview request:', { partnerId });
    
    const { getCollection } = require('../config/database');
    const inventoryCollection = await getCollection('inventory');
    
    const inventory = await inventoryCollection.find({ partnerId }).toArray();
    
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold).length;
    const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
    const activeItems = inventory.filter(item => item.isActive).length;
    
    // Calculate inventory value
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        activeItems,
        totalValue,
        categories: getInventoryCategories(inventory)
      }
    });
    
  } catch (error) {
    logger.error('Inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/partners/dashboard/recent-orders
// @desc    Get recent orders for dashboard
// @access  Private
router.get('/recent-orders', async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { limit = 5 } = req.query;
    
    console.log('📋 Recent orders request:', { partnerId, limit });
    
    const { getCollection } = require('../config/database');
    const ordersCollection = await getCollection('orders');
    
    const recentOrders = await ordersCollection.find({ partnerId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({
      success: true,
      data: recentOrders
    });
    
  } catch (error) {
    logger.error('Recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

function calculateDailyTrends(payments) {
  const dailyRevenue = {};
  payments.forEach(payment => {
    const date = payment.createdAt.toISOString().split('T')[0];
    dailyRevenue[date] = (dailyRevenue[date] || 0) + payment.amount;
  });
  return dailyRevenue;
}

function getInventoryCategories(inventory) {
  const categories = {};
  inventory.forEach(item => {
    const category = item.category || 'Uncategorized';
    categories[category] = (categories[category] || 0) + 1;
  });
  return categories;
}

module.exports = router;
