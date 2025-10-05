const { connectToDatabase } = require('../config/database');

async function createFinancialIndexes() {
  try {
    console.log('🔧 Creating financial and integration indexes...');
    
    const { getCollection } = require('../config/database');
    
    // Payment Gateways collection indexes
    const paymentGatewaysCollection = await getCollection('paymentgateways');
    
    // Unique index on gatewayId
    await paymentGatewaysCollection.createIndex({ gatewayId: 1 }, { unique: true });
    console.log('✅ Created unique index on paymentgateways.gatewayId');
    
    // Unique index on slug
    await paymentGatewaysCollection.createIndex({ slug: 1 }, { unique: true });
    console.log('✅ Created unique index on paymentgateways.slug');
    
    // Compound indexes for filtering
    await paymentGatewaysCollection.createIndex({ isActive: 1, environment: 1 });
    console.log('✅ Created compound index on paymentgateways.isActive, environment');
    
    await paymentGatewaysCollection.createIndex({ testStatus: 1, isActive: 1 });
    console.log('✅ Created compound index on paymentgateways.testStatus, isActive');
    
    await paymentGatewaysCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on paymentgateways.createdAt (descending)');
    
    // Integrations collection indexes
    const integrationsCollection = await getCollection('integrations');
    
    // Unique index on integrationId
    await integrationsCollection.createIndex({ integrationId: 1 }, { unique: true });
    console.log('✅ Created unique index on integrations.integrationId');
    
    // Compound indexes for filtering
    await integrationsCollection.createIndex({ type: 1, isActive: 1 });
    console.log('✅ Created compound index on integrations.type, isActive');
    
    await integrationsCollection.createIndex({ category: 1, isActive: 1 });
    console.log('✅ Created compound index on integrations.category, isActive');
    
    await integrationsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on integrations.createdAt (descending)');
    
    // Partner Financial collection indexes
    const partnerFinancialCollection = await getCollection('partnerfinancials');
    
    // Unique index on partnerId
    await partnerFinancialCollection.createIndex({ partnerId: 1 }, { unique: true });
    console.log('✅ Created unique index on partnerfinancials.partnerId');
    
    // Compound indexes for filtering
    await partnerFinancialCollection.createIndex({ 'contractTerms.isActive': 1 });
    console.log('✅ Created index on partnerfinancials.contractTerms.isActive');
    
    await partnerFinancialCollection.createIndex({ 'financials.unpaidCommission': -1 });
    console.log('✅ Created index on partnerfinancials.financials.unpaidCommission (descending)');
    
    await partnerFinancialCollection.createIndex({ 'financials.totalRevenue': -1 });
    console.log('✅ Created index on partnerfinancials.financials.totalRevenue (descending)');
    
    await partnerFinancialCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on partnerfinancials.createdAt (descending)');
    
    // Commissions collection indexes
    const commissionsCollection = await getCollection('commissions');
    
    // Unique index on commissionId
    await commissionsCollection.createIndex({ commissionId: 1 }, { unique: true });
    console.log('✅ Created unique index on commissions.commissionId');
    
    // Compound indexes for filtering
    await commissionsCollection.createIndex({ partnerId: 1, status: 1 });
    console.log('✅ Created compound index on commissions.partnerId, status');
    
    await commissionsCollection.createIndex({ orderId: 1 });
    console.log('✅ Created index on commissions.orderId');
    
    await commissionsCollection.createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Created compound index on commissions.status, createdAt (descending)');
    
    await commissionsCollection.createIndex({ paidAt: -1 });
    console.log('✅ Created index on commissions.paidAt (descending)');
    
    await commissionsCollection.createIndex({ category: 1, status: 1 });
    console.log('✅ Created compound index on commissions.category, status');
    
    await commissionsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on commissions.createdAt (descending)');
    
    // Payouts collection indexes
    const payoutsCollection = await getCollection('payouts');
    
    // Unique index on payoutId
    await payoutsCollection.createIndex({ payoutId: 1 }, { unique: true });
    console.log('✅ Created unique index on payouts.payoutId');
    
    // Compound indexes for filtering
    await payoutsCollection.createIndex({ partnerId: 1, status: 1 });
    console.log('✅ Created compound index on payouts.partnerId, status');
    
    await payoutsCollection.createIndex({ status: 1, scheduledDate: 1 });
    console.log('✅ Created compound index on payouts.status, scheduledDate');
    
    await payoutsCollection.createIndex({ paidDate: -1 });
    console.log('✅ Created index on payouts.paidDate (descending)');
    
    await payoutsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on payouts.createdAt (descending)');
    
    // Shipping Zones collection indexes
    const shippingZonesCollection = await getCollection('shippingzones');
    
    // Unique index on zoneId
    await shippingZonesCollection.createIndex({ zoneId: 1 }, { unique: true });
    console.log('✅ Created unique index on shippingzones.zoneId');
    
    // Compound indexes for filtering
    await shippingZonesCollection.createIndex({ governorate: 1, city: 1 });
    console.log('✅ Created compound index on shippingzones.governorate, city');
    
    await shippingZonesCollection.createIndex({ isActive: 1 });
    console.log('✅ Created index on shippingzones.isActive');
    
    await shippingZonesCollection.createIndex({ cost: 1 });
    console.log('✅ Created index on shippingzones.cost');
    
    await shippingZonesCollection.createIndex({ 'deliveryOptions.standard.enabled': 1 });
    console.log('✅ Created index on shippingzones.deliveryOptions.standard.enabled');
    
    await shippingZonesCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on shippingzones.createdAt (descending)');
    
    // Text search indexes for better search performance
    await paymentGatewaysCollection.createIndex({ name: 'text', slug: 'text' });
    console.log('✅ Created text index on paymentgateways.name, slug');
    
    await integrationsCollection.createIndex({ name: 'text', description: 'text' });
    console.log('✅ Created text index on integrations.name, description');
    
    await shippingZonesCollection.createIndex({ governorate: 'text', city: 'text', district: 'text' });
    console.log('✅ Created text index on shippingzones.governorate, city, district');
    
    console.log('🎉 All financial and integration indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createFinancialIndexes()
    .then(() => {
      console.log('✅ Index creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Index creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createFinancialIndexes };
