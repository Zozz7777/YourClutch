const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/v1/partners/reports/sales - Get sales report
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date = new Date().toISOString(),
      group_by = 'day' // day, week, month
    } = req.query;
    
    const ordersCollection = await getCollection('orders');
    const salesCollection = await getCollection('sales');
    
    // Get sales data
    const sales = await salesCollection.find({
      partnerId,
      saleDate: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).toArray();
    
    // Get orders data
    const orders = await ordersCollection.find({
      partnerId,
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).toArray();
    
    // Calculate sales metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Group by time period
    const groupedData = {};
    sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      let key;
      
      switch (group_by) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          revenue: 0,
          orders: 0,
          averageOrderValue: 0
        };
      }
      
      groupedData[key].revenue += sale.totalAmount;
      groupedData[key].orders += 1;
    });
    
    // Calculate averages
    Object.values(groupedData).forEach(group => {
      group.averageOrderValue = group.orders > 0 ? group.revenue / group.orders : 0;
    });
    
    const report = {
      period: {
        start_date,
        end_date,
        group_by
      },
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        average_order_value: averageOrderValue
      },
      data: Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))
    };
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report'
    });
  }
});

// GET /api/v1/partners/reports/inventory - Get inventory report
router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      category = '',
      brand = '',
      min_stock = '',
      max_stock = ''
    } = req.query;
    
    const productsCollection = await getCollection('products');
    
    // Build query
    const query = { partnerId };
    
    if (category) {
      query.category = category;
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    if (min_stock !== '') {
      query.stockQuantity = { ...query.stockQuantity, $gte: parseInt(min_stock) };
    }
    
    if (max_stock !== '') {
      query.stockQuantity = { ...query.stockQuantity, $lte: parseInt(max_stock) };
    }
    
    const products = await productsCollection.find(query).toArray();
    
    // Calculate inventory metrics
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0);
    const lowStockProducts = products.filter(p => p.stockQuantity <= (p.minStock || 10));
    const outOfStockProducts = products.filter(p => p.stockQuantity === 0);
    
    // Group by category
    const categoryBreakdown = products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          value: 0,
          low_stock: 0,
          out_of_stock: 0
        };
      }
      acc[category].count += 1;
      acc[category].value += product.price * product.stockQuantity;
      if (product.stockQuantity <= (product.minStock || 10)) {
        acc[category].low_stock += 1;
      }
      if (product.stockQuantity === 0) {
        acc[category].out_of_stock += 1;
      }
      return acc;
    }, {});
    
    // Group by brand
    const brandBreakdown = products.reduce((acc, product) => {
      const brand = product.brand || 'Unknown';
      if (!acc[brand]) {
        acc[brand] = {
          count: 0,
          value: 0,
          low_stock: 0,
          out_of_stock: 0
        };
      }
      acc[brand].count += 1;
      acc[brand].value += product.price * product.stockQuantity;
      if (product.stockQuantity <= (product.minStock || 10)) {
        acc[brand].low_stock += 1;
      }
      if (product.stockQuantity === 0) {
        acc[brand].out_of_stock += 1;
      }
      return acc;
    }, {});
    
    const report = {
      summary: {
        total_products: totalProducts,
        total_value: totalValue,
        low_stock_products: lowStockProducts.length,
        out_of_stock_products: outOfStockProducts.length
      },
      category_breakdown: categoryBreakdown,
      brand_breakdown: brandBreakdown,
      low_stock_products: lowStockProducts.map(p => ({
        id: p._id,
        sku: p.sku,
        name: p.name,
        stock: p.stockQuantity,
        min_stock: p.minStock || 10,
        price: p.price
      })),
      out_of_stock_products: outOfStockProducts.map(p => ({
        id: p._id,
        sku: p.sku,
        name: p.name,
        price: p.price
      }))
    };
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report'
    });
  }
});

// GET /api/v1/partners/reports/customers - Get customer report
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date = new Date().toISOString()
    } = req.query;
    
    const customersCollection = await getCollection('customers');
    const ordersCollection = await getCollection('orders');
    
    // Get customers
    const customers = await customersCollection.find({ partnerId }).toArray();
    
    // Get orders in date range
    const orders = await ordersCollection.find({
      partnerId,
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).toArray();
    
    // Calculate customer metrics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const newCustomers = customers.filter(c => 
      new Date(c.createdAt) >= new Date(start_date)
    ).length;
    
    // Calculate customer lifetime value
    const customerLTV = customers.map(customer => {
      const customerOrders = orders.filter(o => o.customerId === customer._id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const orderCount = customerOrders.length;
      
      return {
        customer_id: customer._id,
        name: customer.name,
        email: customer.email,
        total_spent: totalSpent,
        order_count: orderCount,
        average_order_value: orderCount > 0 ? totalSpent / orderCount : 0,
        last_order: customerOrders.length > 0 ? 
          Math.max(...customerOrders.map(o => new Date(o.createdAt).getTime())) : null
      };
    }).sort((a, b) => b.total_spent - a.total_spent);
    
    // Top customers by spending
    const topCustomers = customerLTV.slice(0, 10);
    
    // Customer acquisition by month
    const acquisitionData = customers.reduce((acc, customer) => {
      const date = new Date(customer.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    const report = {
      period: {
        start_date,
        end_date
      },
      summary: {
        total_customers: totalCustomers,
        active_customers: activeCustomers,
        new_customers: newCustomers,
        inactive_customers: totalCustomers - activeCustomers
      },
      top_customers: topCustomers,
      acquisition_data: acquisitionData,
      customer_segments: {
        high_value: customerLTV.filter(c => c.total_spent > 1000).length,
        medium_value: customerLTV.filter(c => c.total_spent > 500 && c.total_spent <= 1000).length,
        low_value: customerLTV.filter(c => c.total_spent <= 500).length
      }
    };
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get customer report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer report'
    });
  }
});

// GET /api/v1/partners/reports/financial - Get financial report
router.get('/financial', authenticateToken, async (req, res) => {
  try {
    const { partnerId } = req.user;
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date = new Date().toISOString()
    } = req.query;
    
    const salesCollection = await getCollection('sales');
    const ordersCollection = await getCollection('orders');
    const paymentsCollection = await getCollection('payments');
    
    // Get sales data
    const sales = await salesCollection.find({
      partnerId,
      saleDate: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).toArray();
    
    // Get payments data
    const payments = await paymentsCollection.find({
      partnerId,
      processedAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).toArray();
    
    // Calculate financial metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalCost = sales.reduce((sum, sale) => sum + (sale.costAmount || 0), 0);
    const grossProfit = totalRevenue - totalCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    // Payment method breakdown
    const paymentMethods = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
      return acc;
    }, {});
    
    // Daily revenue
    const dailyRevenue = sales.reduce((acc, sale) => {
      const date = new Date(sale.saleDate).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + sale.totalAmount;
      return acc;
    }, {});
    
    // Tax calculation (assuming 14% VAT for Egypt)
    const taxRate = 0.14;
    const taxableAmount = totalRevenue / (1 + taxRate);
    const taxAmount = totalRevenue - taxableAmount;
    
    const report = {
      period: {
        start_date,
        end_date
      },
      summary: {
        total_revenue: totalRevenue,
        total_cost: totalCost,
        gross_profit: grossProfit,
        gross_margin: grossMargin,
        taxable_amount: taxableAmount,
        tax_amount: taxAmount,
        net_profit: grossProfit - taxAmount
      },
      payment_methods: paymentMethods,
      daily_revenue: dailyRevenue,
      profit_margin_analysis: {
        high_margin_products: sales
          .filter(sale => sale.grossMargin > 50)
          .map(sale => ({
            product_id: sale.productId,
            product_name: sale.productName,
            margin: sale.grossMargin
          })),
        low_margin_products: sales
          .filter(sale => sale.grossMargin < 20)
          .map(sale => ({
            product_id: sale.productId,
            product_name: sale.productName,
            margin: sale.grossMargin
          }))
      }
    };
    
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get financial report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial report'
    });
  }
});

// POST /api/v1/partners/reports/export - Export report
router.post('/export', authenticateToken, [
  body('report_type').isIn(['sales', 'inventory', 'customers', 'financial']).withMessage('Invalid report type'),
  body('format').isIn(['csv', 'pdf', 'excel']).withMessage('Invalid format'),
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { partnerId } = req.user;
    const { report_type, format, start_date, end_date } = req.body;
    
    // TODO: Implement actual report generation and export
    // For now, return a mock response
    
    res.json({
      success: true,
      message: 'Report export initiated',
      data: {
        report_type,
        format,
        download_url: `/api/v1/partners/reports/download/${report_type}_${Date.now()}.${format}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report'
    });
  }
});

module.exports = router;
