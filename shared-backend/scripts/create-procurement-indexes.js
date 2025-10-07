const mongoose = require('mongoose');
require('dotenv').config();

// Import all procurement models
const ProcurementRequest = require('../models/ProcurementRequest');
const ProcurementSupplier = require('../models/ProcurementSupplier');
const SupplierCatalog = require('../models/SupplierCatalog');
const RFQ = require('../models/RFQ');
const ProcurementPurchaseOrder = require('../models/ProcurementPurchaseOrder');
const GoodsReceipt = require('../models/GoodsReceipt');
const DepartmentBudget = require('../models/DepartmentBudget');
const ProjectBudget = require('../models/ProjectBudget');
const ProcurementContract = require('../models/ProcurementContract');
const SpendAnalytics = require('../models/SpendAnalytics');

async function createProcurementIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch', {
      });

    console.log('Connected to MongoDB');

    // Create indexes for ProcurementRequest
    console.log('Creating indexes for ProcurementRequest...');
    await ProcurementRequest.collection.createIndex({ requestId: 1 }, { unique: true });
    await ProcurementRequest.collection.createIndex({ requestNumber: 1 }, { unique: true });
    await ProcurementRequest.collection.createIndex({ requestedBy: 1, status: 1 });
    await ProcurementRequest.collection.createIndex({ department: 1, status: 1 });
    await ProcurementRequest.collection.createIndex({ status: 1, createdAt: -1 });
    await ProcurementRequest.collection.createIndex({ 'approvalWorkflow.currentApprovalStep': 1 });
    await ProcurementRequest.collection.createIndex({ 'budgetTracking.departmentBudgetId': 1 });
    await ProcurementRequest.collection.createIndex({ 'budgetTracking.projectBudgetId': 1 });
    await ProcurementRequest.collection.createIndex({ createdAt: -1 });
    await ProcurementRequest.collection.createIndex({ totalAmount: 1 });
    await ProcurementRequest.collection.createIndex({ 'items.category': 1 });

    // Create indexes for ProcurementSupplier
    console.log('Creating indexes for ProcurementSupplier...');
    await ProcurementSupplier.collection.createIndex({ supplierId: 1 }, { unique: true });
    await ProcurementSupplier.collection.createIndex({ supplierName: 1 });
    await ProcurementSupplier.collection.createIndex({ 'contactInfo.primaryContact.email': 1 });
    await ProcurementSupplier.collection.createIndex({ productCategories: 1 });
    await ProcurementSupplier.collection.createIndex({ 'performance.overallSPI': -1 });
    await ProcurementSupplier.collection.createIndex({ 'risk.riskLevel': 1 });
    await ProcurementSupplier.collection.createIndex({ 'status.isActive': 1 });
    await ProcurementSupplier.collection.createIndex({ 'status.isPreferred': 1 });
    await ProcurementSupplier.collection.createIndex({ 'diversity.diversityClassification': 1 });
    await ProcurementSupplier.collection.createIndex({ createdAt: -1 });
    await ProcurementSupplier.collection.createIndex({ 'businessInfo.industry': 1 });

    // Create indexes for SupplierCatalog
    console.log('Creating indexes for SupplierCatalog...');
    await SupplierCatalog.collection.createIndex({ catalogId: 1 }, { unique: true });
    await SupplierCatalog.collection.createIndex({ supplierId: 1 });
    await SupplierCatalog.collection.createIndex({ 'items.itemName': 'text', 'items.description': 'text' });
    await SupplierCatalog.collection.createIndex({ 'items.category': 1 });
    await SupplierCatalog.collection.createIndex({ 'items.isActive': 1 });
    await SupplierCatalog.collection.createIndex({ isActive: 1 });
    await SupplierCatalog.collection.createIndex({ createdAt: -1 });
    await SupplierCatalog.collection.createIndex({ 'items.itemCode': 1 });

    // Create indexes for RFQ
    console.log('Creating indexes for RFQ...');
    await RFQ.collection.createIndex({ rfqId: 1 }, { unique: true });
    await RFQ.collection.createIndex({ rfqNumber: 1 }, { unique: true });
    await RFQ.collection.createIndex({ procurementRequestId: 1 });
    await RFQ.collection.createIndex({ status: 1, createdAt: -1 });
    await RFQ.collection.createIndex({ 'suppliers.supplierId': 1 });
    await RFQ.collection.createIndex({ 'timeline.dueDate': 1 });
    await RFQ.collection.createIndex({ 'evaluation.selectedSupplierId': 1 });
    await RFQ.collection.createIndex({ createdAt: -1 });
    await RFQ.collection.createIndex({ 'items.category': 1 });

    // Create indexes for ProcurementPurchaseOrder
    console.log('Creating indexes for ProcurementPurchaseOrder...');
    await ProcurementPurchaseOrder.collection.createIndex({ poId: 1 }, { unique: true });
    await ProcurementPurchaseOrder.collection.createIndex({ poNumber: 1 }, { unique: true });
    await ProcurementPurchaseOrder.collection.createIndex({ procurementRequestId: 1 });
    await ProcurementPurchaseOrder.collection.createIndex({ rfqId: 1 });
    await ProcurementPurchaseOrder.collection.createIndex({ supplierId: 1, status: 1 });
    await ProcurementPurchaseOrder.collection.createIndex({ status: 1, createdAt: -1 });
    await ProcurementPurchaseOrder.collection.createIndex({ 'delivery.expectedDeliveryDate': 1 });
    await ProcurementPurchaseOrder.collection.createIndex({ 'payment.invoiceId': 1 });
    await ProcurementPurchaseOrder.collection.createIndex({ createdAt: -1 });
    await ProcurementPurchaseOrder.collection.createIndex({ totalAmount: 1 });

    // Create indexes for GoodsReceipt
    console.log('Creating indexes for GoodsReceipt...');
    await GoodsReceipt.collection.createIndex({ receiptId: 1 }, { unique: true });
    await GoodsReceipt.collection.createIndex({ poId: 1 });
    await GoodsReceipt.collection.createIndex({ poNumber: 1 });
    await GoodsReceipt.collection.createIndex({ supplierId: 1, receivedDate: -1 });
    await GoodsReceipt.collection.createIndex({ receivedBy: 1, receivedDate: -1 });
    await GoodsReceipt.collection.createIndex({ status: 1 });
    await GoodsReceipt.collection.createIndex({ 'quality.inspectionStatus': 1 });
    await GoodsReceipt.collection.createIndex({ 'discrepancies.hasDiscrepancy': 1 });
    await GoodsReceipt.collection.createIndex({ receivedDate: -1 });
    await GoodsReceipt.collection.createIndex({ createdAt: -1 });

    // Create indexes for DepartmentBudget
    console.log('Creating indexes for DepartmentBudget...');
    await DepartmentBudget.collection.createIndex({ budgetId: 1 }, { unique: true });
    await DepartmentBudget.collection.createIndex({ department: 1, fiscalYear: 1 });
    await DepartmentBudget.collection.createIndex({ 'period.startDate': 1, 'period.endDate': 1 });
    await DepartmentBudget.collection.createIndex({ 'period.isActive': 1 });
    await DepartmentBudget.collection.createIndex({ 'tracking.utilizationPercentage': -1 });
    await DepartmentBudget.collection.createIndex({ createdAt: -1 });
    await DepartmentBudget.collection.createIndex({ totalBudget: 1 });

    // Create indexes for ProjectBudget
    console.log('Creating indexes for ProjectBudget...');
    await ProjectBudget.collection.createIndex({ budgetId: 1 }, { unique: true });
    await ProjectBudget.collection.createIndex({ projectId: 1 }, { unique: true });
    await ProjectBudget.collection.createIndex({ projectManager: 1 });
    await ProjectBudget.collection.createIndex({ status: 1 });
    await ProjectBudget.collection.createIndex({ startDate: 1, endDate: 1 });
    await ProjectBudget.collection.createIndex({ 'tracking.utilizationPercentage': -1 });
    await ProjectBudget.collection.createIndex({ createdAt: -1 });
    await ProjectBudget.collection.createIndex({ totalBudget: 1 });

    // Create indexes for ProcurementContract
    console.log('Creating indexes for ProcurementContract...');
    await ProcurementContract.collection.createIndex({ contractId: 1 }, { unique: true });
    await ProcurementContract.collection.createIndex({ contractNumber: 1 }, { unique: true });
    await ProcurementContract.collection.createIndex({ supplierId: 1, status: 1 });
    await ProcurementContract.collection.createIndex({ status: 1 });
    await ProcurementContract.collection.createIndex({ 'terms.startDate': 1, 'terms.endDate': 1 });
    await ProcurementContract.collection.createIndex({ 'terms.endDate': 1 });
    await ProcurementContract.collection.createIndex({ 'renewal.renewalStatus': 1 });
    await ProcurementContract.collection.createIndex({ createdAt: -1 });
    await ProcurementContract.collection.createIndex({ 'terms.value': 1 });

    // Create indexes for SpendAnalytics
    console.log('Creating indexes for SpendAnalytics...');
    await SpendAnalytics.collection.createIndex({ analyticsId: 1 }, { unique: true });
    await SpendAnalytics.collection.createIndex({ period: 1, periodStart: -1, periodEnd: -1 });
    await SpendAnalytics.collection.createIndex({ department: 1, category: 1 });
    await SpendAnalytics.collection.createIndex({ 'supplier.supplierId': 1 });
    await SpendAnalytics.collection.createIndex({ 'metrics.totalSpend': -1 });
    await SpendAnalytics.collection.createIndex({ generatedAt: -1 });
    await SpendAnalytics.collection.createIndex({ createdAt: -1 });

    // Create compound indexes for common queries
    console.log('Creating compound indexes...');
    
    // Procurement requests by department and status
    await ProcurementRequest.collection.createIndex({ department: 1, status: 1, createdAt: -1 });
    
    // Suppliers by performance and risk
    await ProcurementSupplier.collection.createIndex({ 'performance.overallSPI': -1, 'risk.riskLevel': 1 });
    
    // RFQ by status and due date
    await RFQ.collection.createIndex({ status: 1, 'timeline.dueDate': 1 });
    
    // Purchase orders by supplier and status
    await ProcurementPurchaseOrder.collection.createIndex({ supplierId: 1, status: 1, createdAt: -1 });
    
    // Budgets by type and utilization
    await DepartmentBudget.collection.createIndex({ department: 1, 'tracking.utilizationPercentage': -1 });
    await ProjectBudget.collection.createIndex({ status: 1, 'tracking.utilizationPercentage': -1 });
    
    // Contracts by status and expiration
    await ProcurementContract.collection.createIndex({ status: 1, 'terms.endDate': 1 });
    
    // Goods receipts by status and date
    await GoodsReceipt.collection.createIndex({ status: 1, receivedDate: -1 });

    console.log('All procurement indexes created successfully!');

    // Display index information
    console.log('\nIndex Summary:');
    console.log('===============');
    
    const collections = [
      { name: 'ProcurementRequest', model: ProcurementRequest },
      { name: 'ProcurementSupplier', model: ProcurementSupplier },
      { name: 'SupplierCatalog', model: SupplierCatalog },
      { name: 'RFQ', model: RFQ },
      { name: 'ProcurementPurchaseOrder', model: ProcurementPurchaseOrder },
      { name: 'GoodsReceipt', model: GoodsReceipt },
      { name: 'DepartmentBudget', model: DepartmentBudget },
      { name: 'ProjectBudget', model: ProjectBudget },
      { name: 'ProcurementContract', model: ProcurementContract },
      { name: 'SpendAnalytics', model: SpendAnalytics }
    ];

    for (const collection of collections) {
      try {
        const indexes = await collection.model.collection.getIndexes();
        console.log(`${collection.name}: ${indexes.length} indexes`);
      } catch (error) {
        console.log(`${collection.name}: Error getting indexes - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('Error creating procurement indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createProcurementIndexes()
    .then(() => {
      console.log('Procurement indexes creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create procurement indexes:', error);
      process.exit(1);
    });
}

module.exports = { createProcurementIndexes };
