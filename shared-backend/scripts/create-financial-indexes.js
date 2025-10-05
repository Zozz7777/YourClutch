const { connectToDatabase } = require('../config/database');
const mongoose = require('mongoose');

// Import all financial models
const OrderRevenue = require('../models/OrderRevenue');
const PaymentCollection = require('../models/PaymentCollection');
const WeeklyPayout = require('../models/WeeklyPayout');
const DeliveryPartner = require('../models/DeliveryPartner');
const Payroll = require('../models/Payroll');
const CompanyExpense = require('../models/CompanyExpense');
const Account = require('../models/Account');
const JournalEntry = require('../models/JournalEntry');
const GeneralLedger = require('../models/GeneralLedger');

async function createFinancialIndexes() {
  try {
    console.log('🔧 Creating comprehensive financial database indexes...');
    await connectToDatabase();

    // OrderRevenue indexes
    console.log('📊 Creating OrderRevenue indexes...');
    await OrderRevenue.createIndexes([
      { key: { orderId: 1 } },
      { key: { partnerId: 1, status: 1 } },
      { key: { customerId: 1 } },
      { key: { paymentMethod: 1, status: 1 } },
      { key: { moneyReceivedFrom: 1, receivedDate: -1 } },
      { key: { weeklyPayoutId: 1 } },
      { key: { createdAt: -1 } },
      { key: { orderType: 1, status: 1 } },
      { key: { partnerId: 1, createdAt: -1 } }
    ]);
    console.log('✅ OrderRevenue indexes created');

    // PaymentCollection indexes
    console.log('💰 Creating PaymentCollection indexes...');
    await PaymentCollection.createIndexes([
      { key: { collectionMethod: 1, status: 1 } },
      { key: { collectorId: 1 } },
      { key: { collectionDate: -1 } },
      { key: { bankDepositDate: -1 } },
      { key: { reconciled: 1 } },
      { key: { createdAt: -1 } },
      { key: { 'settlementDetails.gatewaySettlement.settlementId': 1 } },
      { key: { 'settlementDetails.deliverySettlement.deliveryPartnerId': 1 } }
    ]);
    console.log('✅ PaymentCollection indexes created');

    // WeeklyPayout indexes
    console.log('🤝 Creating WeeklyPayout indexes...');
    await WeeklyPayout.createIndexes([
      { key: { partnerId: 1, status: 1 } },
      { key: { 'payoutPeriod.startDate': -1, 'payoutPeriod.endDate': -1 } },
      { key: { status: 1, scheduledDate: 1 } },
      { key: { paidDate: -1 } },
      { key: { createdAt: -1 } },
      { key: { payoutMethod: 1, status: 1 } }
    ]);
    console.log('✅ WeeklyPayout indexes created');

    // DeliveryPartner indexes
    console.log('🚚 Creating DeliveryPartner indexes...');
    await DeliveryPartner.createIndexes([
      { key: { deliveryPartnerId: 1 } },
      { key: { partnerName: 1 } },
      { key: { isActive: 1 } },
      { key: { 'financials.outstandingBalance': -1 } },
      { key: { 'performance.rating': -1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('✅ DeliveryPartner indexes created');

    // Payroll indexes
    console.log('💼 Creating Payroll indexes...');
    await Payroll.createIndexes([
      { key: { payrollId: 1 } },
      { key: { 'payrollPeriod.year': -1, 'payrollPeriod.month': -1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { 'employeePayments.employeeId': 1 } }
    ]);
    console.log('✅ Payroll indexes created');

    // CompanyExpense indexes
    console.log('🏢 Creating CompanyExpense indexes...');
    await CompanyExpense.createIndexes([
      { key: { expenseId: 1 } },
      { key: { expenseType: 1, status: 1 } },
      { key: { category: 1 } },
      { key: { department: 1, status: 1 } },
      { key: { paymentDate: -1 } },
      { key: { dueDate: 1 } },
      { key: { 'recurringSchedule.isRecurring': 1 } },
      { key: { createdBy: 1 } },
      { key: { createdAt: -1 } },
      { key: { 'vendor.vendorId': 1 } }
    ]);
    console.log('✅ CompanyExpense indexes created');

    // Account indexes
    console.log('📋 Creating Account indexes...');
    await Account.createIndexes([
      { key: { accountId: 1 } },
      { key: { accountNumber: 1 } },
      { key: { accountType: 1, accountSubType: 1 } },
      { key: { parentAccountId: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('✅ Account indexes created');

    // JournalEntry indexes
    console.log('📝 Creating JournalEntry indexes...');
    await JournalEntry.createIndexes([
      { key: { entryId: 1 } },
      { key: { entryNumber: 1 } },
      { key: { date: -1 } },
      { key: { type: 1, status: 1 } },
      { key: { status: 1 } },
      { key: { 'lines.accountId': 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('✅ JournalEntry indexes created');

    // GeneralLedger indexes
    console.log('📊 Creating GeneralLedger indexes...');
    await GeneralLedger.createIndexes([
      { key: { ledgerId: 1 } },
      { key: { accountId: 1, date: -1 } },
      { key: { accountId: 1, reconciled: 1 } },
      { key: { date: -1 } },
      { key: { entryId: 1 } },
      { key: { referenceType: 1, referenceId: 1 } },
      { key: { reconciled: 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('✅ GeneralLedger indexes created');

    console.log('✨ All financial indexes created successfully!');
    console.log('📈 Performance optimized for:');
    console.log('   - Revenue tracking queries');
    console.log('   - Payment collection analysis');
    console.log('   - Partner payout calculations');
    console.log('   - Payroll processing');
    console.log('   - Expense management');
    console.log('   - Financial reporting');
    console.log('   - Chart of accounts operations');
    console.log('   - General ledger queries');

  } catch (error) {
    console.error('❌ Error creating financial indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  createFinancialIndexes();
}

module.exports = createFinancialIndexes;
