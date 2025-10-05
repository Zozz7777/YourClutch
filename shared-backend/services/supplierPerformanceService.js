/**
 * Supplier Performance Tracking Service
 * Handles SPI calculation, performance metrics, and automated scoring
 */

const { getCollection } = require('../config/optimized-database');
const { ObjectId } = require('mongodb');
const logger = require('../config/logger');

class SupplierPerformanceService {
  constructor() {
    this.performanceWeights = {
      delivery: 0.3,      // 30% weight
      quality: 0.25,      // 25% weight
      compliance: 0.2,    // 20% weight
      cost: 0.15,         // 15% weight
      support: 0.1        // 10% weight
    };
    
    this.performanceThresholds = {
      EXCELLENT: 90,
      GOOD: 80,
      AVERAGE: 70,
      POOR: 60,
      CRITICAL: 50
    };
  }

  /**
   * Calculate Supplier Performance Index (SPI)
   * @param {string} supplierId - Supplier ID
   * @param {Object} options - Calculation options
   * @returns {Object} - SPI calculation result
   */
  async calculateSPI(supplierId, options = {}) {
    try {
      const { period = '12m', includeTrends = true } = options;
      
      // Get supplier data
      const suppliersCollection = await getCollection('procurement_suppliers');
      const supplier = await suppliersCollection.findOne({ _id: new ObjectId(supplierId) });
      
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // Get performance data
      const performanceData = await this.getPerformanceData(supplierId, period);
      
      // Calculate individual scores
      const scores = {
        delivery: await this.calculateDeliveryScore(supplierId, performanceData),
        quality: await this.calculateQualityScore(supplierId, performanceData),
        compliance: await this.calculateComplianceScore(supplierId, performanceData),
        cost: await this.calculateCostScore(supplierId, performanceData),
        support: await this.calculateSupportScore(supplierId, performanceData)
      };

      // Calculate weighted SPI
      const spi = this.calculateWeightedSPI(scores);
      
      // Get performance level
      const performanceLevel = this.getPerformanceLevel(spi);
      
      // Get trends if requested
      let trends = null;
      if (includeTrends) {
        trends = await this.getPerformanceTrends(supplierId, period);
      }

      // Create performance record
      const performanceRecord = {
        supplierId: new ObjectId(supplierId),
        supplierName: supplier.supplierName,
        period,
        scores,
        spi,
        performanceLevel,
        trends,
        calculatedAt: new Date(),
        dataPoints: performanceData.length
      };

      // Save performance record
      await this.savePerformanceRecord(performanceRecord);

      return performanceRecord;
    } catch (error) {
      logger.error('Error calculating SPI:', error);
      throw error;
    }
  }

  /**
   * Get performance data for supplier
   * @param {string} supplierId - Supplier ID
   * @param {string} period - Time period
   * @returns {Array} - Performance data
   */
  async getPerformanceData(supplierId, period) {
    try {
      const startDate = this.getStartDateForPeriod(period);
      
      // Get purchase orders
      const posCollection = await getCollection('procurement_purchase_orders');
      const pos = await posCollection.find({
        supplierId: new ObjectId(supplierId),
        issueDate: { $gte: startDate }
      }).toArray();

      // Get goods receipts
      const receiptsCollection = await getCollection('goods_receipts');
      const receipts = await receiptsCollection.find({
        supplierId: new ObjectId(supplierId),
        receivedDate: { $gte: startDate }
      }).toArray();

      // Get contracts
      const contractsCollection = await getCollection('procurement_contracts');
      const contracts = await contractsCollection.find({
        supplierId: new ObjectId(supplierId),
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).toArray();

      return {
        purchaseOrders: pos,
        goodsReceipts: receipts,
        contracts: contracts
      };
    } catch (error) {
      logger.error('Error getting performance data:', error);
      return { purchaseOrders: [], goodsReceipts: [], contracts: [] };
    }
  }

  /**
   * Calculate delivery score
   * @param {string} supplierId - Supplier ID
   * @param {Object} performanceData - Performance data
   * @returns {Object} - Delivery score
   */
  async calculateDeliveryScore(supplierId, performanceData) {
    try {
      const { purchaseOrders, goodsReceipts } = performanceData;
      
      if (purchaseOrders.length === 0) {
        return { score: 0, details: 'No delivery data available' };
      }

      let onTimeDeliveries = 0;
      let totalDeliveries = 0;
      let averageDelayDays = 0;
      let delayDays = [];

      for (const po of purchaseOrders) {
        if (po.status === 'received' && po.actualDeliveryDate && po.expectedDeliveryDate) {
          totalDeliveries++;
          
          const actualDate = new Date(po.actualDeliveryDate);
          const expectedDate = new Date(po.expectedDeliveryDate);
          const delayDays = Math.ceil((actualDate - expectedDate) / (1000 * 60 * 60 * 24));
          
          if (delayDays <= 0) {
            onTimeDeliveries++;
          } else {
            delayDays.push(delayDays);
          }
        }
      }

      if (totalDeliveries === 0) {
        return { score: 0, details: 'No completed deliveries' };
      }

      const onTimePercentage = (onTimeDeliveries / totalDeliveries) * 100;
      const averageDelay = delayDays.length > 0 ? delayDays.reduce((a, b) => a + b, 0) / delayDays.length : 0;

      // Calculate score based on on-time percentage and average delay
      let score = onTimePercentage;
      if (averageDelay > 0) {
        score = Math.max(0, score - (averageDelay * 2)); // Penalty for delays
      }

      return {
        score: Math.round(score),
        onTimePercentage,
        averageDelay,
        totalDeliveries,
        onTimeDeliveries,
        details: `${onTimeDeliveries}/${totalDeliveries} deliveries on time (${onTimePercentage.toFixed(1)}%)`
      };
    } catch (error) {
      logger.error('Error calculating delivery score:', error);
      return { score: 0, details: 'Error calculating delivery score' };
    }
  }

  /**
   * Calculate quality score
   * @param {string} supplierId - Supplier ID
   * @param {Object} performanceData - Performance data
   * @returns {Object} - Quality score
   */
  async calculateQualityScore(supplierId, performanceData) {
    try {
      const { goodsReceipts } = performanceData;
      
      if (goodsReceipts.length === 0) {
        return { score: 0, details: 'No quality data available' };
      }

      let totalItems = 0;
      let acceptedItems = 0;
      let rejectedItems = 0;
      let qualityIssues = 0;

      for (const receipt of goodsReceipts) {
        for (const item of receipt.items) {
          totalItems += item.quantityReceived;
          acceptedItems += item.quantityAccepted;
          rejectedItems += item.quantityRejected;
          
          if (item.inspectionStatus === 'rejected' || item.hasDiscrepancy) {
            qualityIssues++;
          }
        }
      }

      if (totalItems === 0) {
        return { score: 0, details: 'No items received' };
      }

      const acceptanceRate = (acceptedItems / totalItems) * 100;
      const rejectionRate = (rejectedItems / totalItems) * 100;
      const qualityIssueRate = (qualityIssues / goodsReceipts.length) * 100;

      // Calculate score based on acceptance rate and quality issues
      let score = acceptanceRate;
      score = Math.max(0, score - (rejectionRate * 2)); // Penalty for rejections
      score = Math.max(0, score - (qualityIssueRate * 1.5)); // Penalty for quality issues

      return {
        score: Math.round(score),
        acceptanceRate,
        rejectionRate,
        qualityIssueRate,
        totalItems,
        acceptedItems,
        rejectedItems,
        details: `${acceptedItems}/${totalItems} items accepted (${acceptanceRate.toFixed(1)}%)`
      };
    } catch (error) {
      logger.error('Error calculating quality score:', error);
      return { score: 0, details: 'Error calculating quality score' };
    }
  }

  /**
   * Calculate compliance score
   * @param {string} supplierId - Supplier ID
   * @param {Object} performanceData - Performance data
   * @returns {Object} - Compliance score
   */
  async calculateComplianceScore(supplierId, performanceData) {
    try {
      const { contracts } = performanceData;
      
      if (contracts.length === 0) {
        return { score: 0, details: 'No compliance data available' };
      }

      let totalComplianceChecks = 0;
      let passedChecks = 0;
      let complianceIssues = 0;

      for (const contract of contracts) {
        // Check SLA compliance
        if (contract.sla && contract.sla.length > 0) {
          for (const sla of contract.sla) {
            totalComplianceChecks++;
            // This would check actual SLA performance against targets
            // For now, we'll use a simplified calculation
            const slaCompliance = Math.random() * 100; // Placeholder
            if (slaCompliance >= 80) {
              passedChecks++;
            } else {
              complianceIssues++;
            }
          }
        }

        // Check certification compliance
        if (contract.complianceRequirements && contract.complianceRequirements.length > 0) {
          totalComplianceChecks += contract.complianceRequirements.length;
          // This would check actual compliance status
          // For now, we'll use a simplified calculation
          const complianceRate = Math.random() * 100; // Placeholder
          if (complianceRate >= 90) {
            passedChecks += contract.complianceRequirements.length;
          } else {
            complianceIssues++;
          }
        }
      }

      if (totalComplianceChecks === 0) {
        return { score: 0, details: 'No compliance checks available' };
      }

      const complianceRate = (passedChecks / totalComplianceChecks) * 100;
      const issueRate = (complianceIssues / totalComplianceChecks) * 100;

      // Calculate score based on compliance rate and issues
      let score = complianceRate;
      score = Math.max(0, score - (issueRate * 2)); // Penalty for compliance issues

      return {
        score: Math.round(score),
        complianceRate,
        issueRate,
        totalChecks: totalComplianceChecks,
        passedChecks,
        complianceIssues,
        details: `${passedChecks}/${totalComplianceChecks} compliance checks passed (${complianceRate.toFixed(1)}%)`
      };
    } catch (error) {
      logger.error('Error calculating compliance score:', error);
      return { score: 0, details: 'Error calculating compliance score' };
    }
  }

  /**
   * Calculate cost score
   * @param {string} supplierId - Supplier ID
   * @param {Object} performanceData - Performance data
   * @returns {Object} - Cost score
   */
  async calculateCostScore(supplierId, performanceData) {
    try {
      const { purchaseOrders } = performanceData;
      
      if (purchaseOrders.length === 0) {
        return { score: 0, details: 'No cost data available' };
      }

      // Get market prices for comparison
      const marketPrices = await this.getMarketPrices(purchaseOrders);
      
      let totalSavings = 0;
      let totalSpend = 0;
      let costEfficiencyScore = 0;

      for (const po of purchaseOrders) {
        if (po.status === 'received' || po.status === 'completed') {
          totalSpend += po.totalAmount;
          
          // Calculate savings compared to market price
          const marketPrice = marketPrices[po.poNumber] || po.totalAmount;
          const savings = marketPrice - po.totalAmount;
          totalSavings += Math.max(0, savings);
        }
      }

      if (totalSpend === 0) {
        return { score: 0, details: 'No completed purchases' };
      }

      const savingsPercentage = (totalSavings / totalSpend) * 100;
      
      // Calculate cost efficiency score
      costEfficiencyScore = Math.min(100, savingsPercentage * 2); // Cap at 100%

      return {
        score: Math.round(costEfficiencyScore),
        totalSpend,
        totalSavings,
        savingsPercentage,
        costEfficiencyScore,
        details: `Total spend: ${totalSpend.toFixed(2)} EGP, Savings: ${totalSavings.toFixed(2)} EGP (${savingsPercentage.toFixed(1)}%)`
      };
    } catch (error) {
      logger.error('Error calculating cost score:', error);
      return { score: 0, details: 'Error calculating cost score' };
    }
  }

  /**
   * Calculate support score
   * @param {string} supplierId - Supplier ID
   * @param {Object} performanceData - Performance data
   * @returns {Object} - Support score
   */
  async calculateSupportScore(supplierId, performanceData) {
    try {
      // This would typically come from support tickets, response times, etc.
      // For now, we'll use a simplified calculation based on supplier data
      
      const suppliersCollection = await getCollection('procurement_suppliers');
      const supplier = await suppliersCollection.findOne({ _id: new ObjectId(supplierId) });
      
      if (!supplier) {
        return { score: 0, details: 'Supplier not found' };
      }

      // Base score on supplier relationship status and performance history
      let score = 70; // Base score
      
      if (supplier.isPreferred) {
        score += 20;
      }
      
      if (supplier.relationshipStatus === 'active') {
        score += 10;
      }
      
      // Adjust based on performance history
      if (supplier.performance && supplier.performance.overallSPI) {
        score = Math.max(score, supplier.performance.overallSPI);
      }

      return {
        score: Math.round(score),
        isPreferred: supplier.isPreferred,
        relationshipStatus: supplier.relationshipStatus,
        details: `Support score based on supplier relationship and performance history`
      };
    } catch (error) {
      logger.error('Error calculating support score:', error);
      return { score: 0, details: 'Error calculating support score' };
    }
  }

  /**
   * Calculate weighted SPI
   * @param {Object} scores - Individual scores
   * @returns {number} - Weighted SPI
   */
  calculateWeightedSPI(scores) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [metric, weight] of Object.entries(this.performanceWeights)) {
      if (scores[metric] && scores[metric].score !== undefined) {
        weightedSum += scores[metric].score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  /**
   * Get performance level based on SPI
   * @param {number} spi - SPI score
   * @returns {string} - Performance level
   */
  getPerformanceLevel(spi) {
    if (spi >= this.performanceThresholds.EXCELLENT) return 'EXCELLENT';
    if (spi >= this.performanceThresholds.GOOD) return 'GOOD';
    if (spi >= this.performanceThresholds.AVERAGE) return 'AVERAGE';
    if (spi >= this.performanceThresholds.POOR) return 'POOR';
    return 'CRITICAL';
  }

  /**
   * Get performance trends
   * @param {string} supplierId - Supplier ID
   * @param {string} period - Time period
   * @returns {Object} - Performance trends
   */
  async getPerformanceTrends(supplierId, period) {
    try {
      const performanceCollection = await getCollection('supplier_performance');
      
      // Get historical performance data
      const startDate = this.getStartDateForPeriod(period);
      const performanceData = await performanceCollection.find({
        supplierId: new ObjectId(supplierId),
        calculatedAt: { $gte: startDate }
      }).sort({ calculatedAt: 1 }).toArray();

      if (performanceData.length === 0) {
        return { trend: 'NO_DATA', change: 0 };
      }

      // Calculate trend
      const firstSPI = performanceData[0].spi;
      const lastSPI = performanceData[performanceData.length - 1].spi;
      const change = lastSPI - firstSPI;
      const changePercentage = firstSPI > 0 ? (change / firstSPI) * 100 : 0;

      let trend = 'STABLE';
      if (changePercentage > 5) trend = 'IMPROVING';
      else if (changePercentage < -5) trend = 'DECLINING';

      return {
        trend,
        change,
        changePercentage,
        firstSPI,
        lastSPI,
        dataPoints: performanceData.length
      };
    } catch (error) {
      logger.error('Error getting performance trends:', error);
      return { trend: 'ERROR', change: 0 };
    }
  }

  /**
   * Save performance record
   * @param {Object} performanceRecord - Performance record
   */
  async savePerformanceRecord(performanceRecord) {
    try {
      const performanceCollection = await getCollection('supplier_performance');
      await performanceCollection.insertOne(performanceRecord);
    } catch (error) {
      logger.error('Error saving performance record:', error);
    }
  }

  /**
   * Get start date for period
   * @param {string} period - Time period
   * @returns {Date} - Start date
   */
  getStartDateForPeriod(period) {
    const now = new Date();
    const periods = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '12m': 12,
      '24m': 24
    };
    
    const months = periods[period] || 12;
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - months);
    
    return startDate;
  }

  /**
   * Get market prices for comparison
   * @param {Array} purchaseOrders - Purchase orders
   * @returns {Object} - Market prices
   */
  async getMarketPrices(purchaseOrders) {
    try {
      // This would typically query market data or historical prices
      // For now, we'll return a simplified calculation
      const marketPrices = {};
      
      for (const po of purchaseOrders) {
        // Simulate market price (typically 10-20% higher than actual price)
        const marketPrice = po.totalAmount * (1 + Math.random() * 0.2);
        marketPrices[po.poNumber] = marketPrice;
      }
      
      return marketPrices;
    } catch (error) {
      logger.error('Error getting market prices:', error);
      return {};
    }
  }

  /**
   * Get supplier performance dashboard
   * @param {Object} filters - Filter criteria
   * @returns {Object} - Performance dashboard
   */
  async getSupplierPerformanceDashboard(filters = {}) {
    try {
      const performanceCollection = await getCollection('supplier_performance');
      
      // Build query
      const query = {};
      if (filters.supplierId) query.supplierId = new ObjectId(filters.supplierId);
      if (filters.performanceLevel) query.performanceLevel = filters.performanceLevel;
      if (filters.startDate) query.calculatedAt = { $gte: new Date(filters.startDate) };
      if (filters.endDate) query.calculatedAt = { ...query.calculatedAt, $lte: new Date(filters.endDate) };

      // Get performance data
      const performanceData = await performanceCollection.find(query).toArray();

      // Calculate dashboard metrics
      const dashboard = {
        totalSuppliers: performanceData.length,
        averageSPI: this.calculateAverageSPI(performanceData),
        performanceDistribution: this.getPerformanceDistribution(performanceData),
        topPerformers: this.getTopPerformers(performanceData),
        underPerformers: this.getUnderPerformers(performanceData),
        trends: this.getOverallTrends(performanceData)
      };

      return dashboard;
    } catch (error) {
      logger.error('Error getting supplier performance dashboard:', error);
      throw error;
    }
  }

  /**
   * Calculate average SPI
   * @param {Array} performanceData - Performance data
   * @returns {number} - Average SPI
   */
  calculateAverageSPI(performanceData) {
    if (performanceData.length === 0) return 0;
    const totalSPI = performanceData.reduce((sum, record) => sum + record.spi, 0);
    return Math.round(totalSPI / performanceData.length);
  }

  /**
   * Get performance distribution
   * @param {Array} performanceData - Performance data
   * @returns {Object} - Performance distribution
   */
  getPerformanceDistribution(performanceData) {
    const distribution = {
      EXCELLENT: 0,
      GOOD: 0,
      AVERAGE: 0,
      POOR: 0,
      CRITICAL: 0
    };

    performanceData.forEach(record => {
      distribution[record.performanceLevel]++;
    });

    return distribution;
  }

  /**
   * Get top performers
   * @param {Array} performanceData - Performance data
   * @returns {Array} - Top performers
   */
  getTopPerformers(performanceData) {
    return performanceData
      .filter(record => record.performanceLevel === 'EXCELLENT' || record.performanceLevel === 'GOOD')
      .sort((a, b) => b.spi - a.spi)
      .slice(0, 10);
  }

  /**
   * Get under performers
   * @param {Array} performanceData - Performance data
   * @returns {Array} - Under performers
   */
  getUnderPerformers(performanceData) {
    return performanceData
      .filter(record => record.performanceLevel === 'POOR' || record.performanceLevel === 'CRITICAL')
      .sort((a, b) => a.spi - b.spi)
      .slice(0, 10);
  }

  /**
   * Get overall trends
   * @param {Array} performanceData - Performance data
   * @returns {Object} - Overall trends
   */
  getOverallTrends(performanceData) {
    // Implementation for calculating overall trends
    return {
      improving: 0,
      declining: 0,
      stable: 0
    };
  }
}

module.exports = new SupplierPerformanceService();
