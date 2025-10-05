const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Performance Metrics
const PERFORMANCE_METRICS = {
  ORDER_COMPLETION_RATE: 'order_completion_rate',
  RESPONSE_TIME: 'response_time',
  CUSTOMER_SATISFACTION: 'customer_satisfaction',
  REVENUE_GROWTH: 'revenue_growth',
  ORDER_VOLUME: 'order_volume',
  PROFIT_MARGIN: 'profit_margin'
};

// Performance Periods
const PERFORMANCE_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

// Get performance overview
router.get('/performance/overview', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d' // 7d, 30d, 90d, 1y
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    
    // Get orders data
    const ordersCollection = await getCollection('partnerOrders');
    const orders = await ordersCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: startDate }
    }).toArray();

    // Get feedback data
    const feedbackCollection = await getCollection('partnerFeedback');
    const feedback = await feedbackCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: startDate }
    }).toArray();

    // Calculate performance metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length 
      : 0;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate response time (average time from order creation to first action)
    const responseTimes = orders
      .filter(order => order.firstActionAt && order.createdAt)
      .map(order => new Date(order.firstActionAt) - new Date(order.createdAt));
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Get previous period for comparison
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousOrders = await ordersCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: previousStartDate, $lt: startDate }
    }).toArray();

    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const performanceData = {
      orderCompletionRate: Math.round(orderCompletionRate * 100) / 100,
      averageRating: Math.round(averageRating * 100) / 100,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime / (1000 * 60)), // Convert to minutes
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      totalOrders,
      completedOrders,
      totalFeedback: feedback.length,
      period,
      startDate,
      endDate: now
    };

    res.json({
      success: true,
      data: performanceData,
      message: 'Performance overview retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching performance overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance overview',
      error: error.message
    });
  }
});

// Get performance trends
router.get('/performance/trends', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d', // 7d, 30d, 90d, 1y
      metric = 'revenue' // revenue, orders, rating, completion_rate
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    const ordersCollection = await getCollection('partnerOrders');
    const feedbackCollection = await getCollection('partnerFeedback');
    
    let trends = [];

    if (metric === 'revenue' || metric === 'orders') {
      // Get daily order trends
      const orderTrends = await ordersCollection.aggregate([
        {
          $match: {
            partnerId: partner.partnerId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]).toArray();

      trends = orderTrends.map(trend => ({
        date: new Date(trend._id.year, trend._id.month - 1, trend._id.day),
        revenue: trend.revenue,
        orders: trend.orders,
        completedOrders: trend.completedOrders,
        completionRate: trend.orders > 0 ? (trend.completedOrders / trend.orders) * 100 : 0
      }));
    } else if (metric === 'rating') {
      // Get daily rating trends
      const ratingTrends = await feedbackCollection.aggregate([
        {
          $match: {
            partnerId: partner.partnerId,
            createdAt: { $gte: startDate },
            rating: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            averageRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]).toArray();

      trends = ratingTrends.map(trend => ({
        date: new Date(trend._id.year, trend._id.month - 1, trend._id.day),
        averageRating: Math.round(trend.averageRating * 100) / 100,
        count: trend.count
      }));
    }

    res.json({
      success: true,
      data: {
        trends,
        metric,
        period,
        startDate,
        endDate: now
      },
      message: 'Performance trends retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching performance trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance trends',
      error: error.message
    });
  }
});

// Get performance comparison
router.get('/performance/comparison', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      currentPeriod = '30d', // 7d, 30d, 90d, 1y
      compareWith = 'previous' // previous, same_period_last_year
    } = req.query;

    // Calculate current period date range
    const now = new Date();
    let currentStartDate;
    switch (currentPeriod) {
      case '7d':
        currentStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        currentStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        currentStartDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        currentStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate comparison period date range
    let compareStartDate, compareEndDate;
    if (compareWith === 'previous') {
      const periodDuration = now.getTime() - currentStartDate.getTime();
      compareEndDate = currentStartDate;
      compareStartDate = new Date(compareEndDate.getTime() - periodDuration);
    } else if (compareWith === 'same_period_last_year') {
      const periodDuration = now.getTime() - currentStartDate.getTime();
      compareEndDate = new Date(currentStartDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      compareStartDate = new Date(compareEndDate.getTime() - periodDuration);
    }

    const { getCollection } = require('../config/database');
    const ordersCollection = await getCollection('partnerOrders');
    const feedbackCollection = await getCollection('partnerFeedback');
    
    // Get current period data
    const currentOrders = await ordersCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: currentStartDate }
    }).toArray();

    const currentFeedback = await feedbackCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: currentStartDate }
    }).toArray();

    // Get comparison period data
    const compareOrders = await ordersCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: compareStartDate, $lt: compareEndDate }
    }).toArray();

    const compareFeedback = await feedbackCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: compareStartDate, $lt: compareEndDate }
    }).toArray();

    // Calculate metrics for both periods
    const calculateMetrics = (orders, feedback) => {
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
      
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const averageRating = feedback.length > 0 
        ? feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length 
        : 0;

      return {
        totalOrders,
        completedOrders,
        completionRate,
        totalRevenue,
        averageOrderValue,
        averageRating,
        totalFeedback: feedback.length
      };
    };

    const currentMetrics = calculateMetrics(currentOrders, currentFeedback);
    const compareMetrics = calculateMetrics(compareOrders, compareFeedback);

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const comparison = {
      current: currentMetrics,
      comparison: compareMetrics,
      changes: {
        totalOrders: calculateChange(currentMetrics.totalOrders, compareMetrics.totalOrders),
        completionRate: calculateChange(currentMetrics.completionRate, compareMetrics.completionRate),
        totalRevenue: calculateChange(currentMetrics.totalRevenue, compareMetrics.totalRevenue),
        averageOrderValue: calculateChange(currentMetrics.averageOrderValue, compareMetrics.averageOrderValue),
        averageRating: calculateChange(currentMetrics.averageRating, compareMetrics.averageRating),
        totalFeedback: calculateChange(currentMetrics.totalFeedback, compareMetrics.totalFeedback)
      },
      currentPeriod: {
        startDate: currentStartDate,
        endDate: now
      },
      comparisonPeriod: {
        startDate: compareStartDate,
        endDate: compareEndDate
      }
    };

    res.json({
      success: true,
      data: comparison,
      message: 'Performance comparison retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching performance comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance comparison',
      error: error.message
    });
  }
});

// Get performance KPIs
router.get('/performance/kpis', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d' // 7d, 30d, 90d, 1y
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    const ordersCollection = await getCollection('partnerOrders');
    const feedbackCollection = await getCollection('partnerFeedback');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    // Get data for the period
    const orders = await ordersCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: startDate }
    }).toArray();

    const feedback = await feedbackCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: startDate }
    }).toArray();

    const appointments = await appointmentsCollection.find({
      partnerId: partner.partnerId,
      createdAt: { $gte: startDate }
    }).toArray();

    // Calculate KPIs
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length 
      : 0;

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const appointmentCompletionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    // Calculate response time
    const responseTimes = orders
      .filter(order => order.firstActionAt && order.createdAt)
      .map(order => new Date(order.firstActionAt) - new Date(order.createdAt));
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const kpis = {
      orderCompletionRate: {
        value: Math.round(orderCompletionRate * 100) / 100,
        target: 95,
        status: orderCompletionRate >= 95 ? 'excellent' : orderCompletionRate >= 80 ? 'good' : 'needs_improvement',
        unit: '%'
      },
      averageRating: {
        value: Math.round(averageRating * 100) / 100,
        target: 4.5,
        status: averageRating >= 4.5 ? 'excellent' : averageRating >= 4.0 ? 'good' : 'needs_improvement',
        unit: 'stars'
      },
      totalRevenue: {
        value: totalRevenue,
        target: null, // No specific target
        status: 'info',
        unit: 'EGP'
      },
      averageOrderValue: {
        value: Math.round(averageOrderValue * 100) / 100,
        target: null,
        status: 'info',
        unit: 'EGP'
      },
      appointmentCompletionRate: {
        value: Math.round(appointmentCompletionRate * 100) / 100,
        target: 90,
        status: appointmentCompletionRate >= 90 ? 'excellent' : appointmentCompletionRate >= 75 ? 'good' : 'needs_improvement',
        unit: '%'
      },
      averageResponseTime: {
        value: Math.round(averageResponseTime / (1000 * 60)), // Convert to minutes
        target: 30, // 30 minutes
        status: averageResponseTime <= 30 * 60 * 1000 ? 'excellent' : averageResponseTime <= 60 * 60 * 1000 ? 'good' : 'needs_improvement',
        unit: 'minutes'
      }
    };

    res.json({
      success: true,
      data: {
        kpis,
        period,
        startDate,
        endDate: now
      },
      message: 'Performance KPIs retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching performance KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance KPIs',
      error: error.message
    });
  }
});

// Get performance leaderboard
router.get('/performance/leaderboard', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      metric = 'revenue', // revenue, orders, rating, completion_rate
      period = '30d', // 7d, 30d, 90d, 1y
      limit = 50
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    const partnersCollection = await getCollection('partnerUsers');
    const ordersCollection = await getCollection('partnerOrders');
    const feedbackCollection = await getCollection('partnerFeedback');
    
    // Get all partners in the same region/category
    const partners = await partnersCollection.find({
      businessAddress: { $exists: true },
      businessType: partner.businessType
    }).toArray();

    const leaderboard = [];

    for (const p of partners) {
      const orders = await ordersCollection.find({
        partnerId: p.partnerId,
        createdAt: { $gte: startDate }
      }).toArray();

      const feedback = await feedbackCollection.find({
        partnerId: p.partnerId,
        createdAt: { $gte: startDate }
      }).toArray();

      let score = 0;
      switch (metric) {
        case 'revenue':
          score = orders.reduce((sum, order) => sum + (order.total || 0), 0);
          break;
        case 'orders':
          score = orders.length;
          break;
        case 'rating':
          score = feedback.length > 0 
            ? feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length 
            : 0;
          break;
        case 'completion_rate':
          const completedOrders = orders.filter(order => order.status === 'completed').length;
          score = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;
          break;
      }

      leaderboard.push({
        partnerId: p.partnerId,
        businessName: p.businessName,
        businessType: p.businessType,
        score: Math.round(score * 100) / 100,
        orders: orders.length,
        revenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
        averageRating: feedback.length > 0 
          ? Math.round((feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.length) * 100) / 100 
          : 0
      });
    }

    // Sort by score and limit results
    leaderboard.sort((a, b) => b.score - a.score);
    const topPartners = leaderboard.slice(0, parseInt(limit));

    // Add rank to each entry
    topPartners.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Find current partner's rank
    const currentPartnerRank = leaderboard.findIndex(entry => entry.partnerId === partner.partnerId) + 1;

    res.json({
      success: true,
      data: {
        leaderboard: topPartners,
        currentPartnerRank,
        metric,
        period,
        startDate,
        endDate: now
      },
      message: 'Performance leaderboard retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching performance leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance leaderboard',
      error: error.message
    });
  }
});

module.exports = router;
