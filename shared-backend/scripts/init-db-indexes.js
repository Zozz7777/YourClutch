const { connectToDatabase } = require('../config/database');

async function createIndexes() {
  try {
    console.log('🔧 Creating database indexes...');
    
    const { getCollection } = require('../config/database');
    
    // Partners collection indexes
    const partnersCollection = await getCollection('partners');
    
    // Unique index on partnerId
    await partnersCollection.createIndex({ partnerId: 1 }, { unique: true });
    console.log('✅ Created unique index on partners.partnerId');
    
    // Text search index on name
    await partnersCollection.createIndex({ name: 'text' });
    console.log('✅ Created text index on partners.name');
    
    // Compound indexes for filtering
    await partnersCollection.createIndex({ status: 1, type: 1 });
    console.log('✅ Created compound index on partners.status, type');
    
    await partnersCollection.createIndex({ 'rating.average': -1 });
    console.log('✅ Created index on partners.rating.average (descending)');
    
    await partnersCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on partners.createdAt (descending)');
    
    // Email search index
    await partnersCollection.createIndex({ 'primaryContact.email': 1 });
    console.log('✅ Created index on partners.primaryContact.email');
    
    // Leads collection indexes (for better performance)
    const leadsCollection = await getCollection('leads');
    
    await leadsCollection.createIndex({ id: 1 }, { unique: true });
    console.log('✅ Created unique index on leads.id');
    
    await leadsCollection.createIndex({ status: 1 });
    console.log('✅ Created index on leads.status');
    
    await leadsCollection.createIndex({ partnerType: 1 });
    console.log('✅ Created index on leads.partnerType');
    
    await leadsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Created index on leads.createdAt (descending)');
    
    // Text search on leads
    await leadsCollection.createIndex({ 
      companyName: 'text', 
      contactPerson: 'text', 
      email: 'text' 
    });
    console.log('✅ Created text index on leads (companyName, contactPerson, email)');
    
    console.log('🎉 All database indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log('✅ Database initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { createIndexes };
