const { MongoClient } = require('mongodb');

async function debugPartners() {
  const client = new MongoClient('mongodb+srv://clutch:clutch123@cluster0.mongodb.net/clutch');
  
  try {
    await client.connect();
    console.log('🔍 Checking partners in database...');
    
    const db = client.db();
    const partnersCollection = db.collection('partners');
    const partnerUsersCollection = db.collection('partnerusers');
    
    // Check partners collection
    const partners = await partnersCollection.find({}).toArray();
    
    console.log(`📊 Found ${partners.length} partners in 'partners' collection:`);
    partners.forEach(partner => {
      console.log(`  - Partner ID: ${partner.partnerId || 'N/A'}`);
      console.log(`  - Name: ${partner.name || 'N/A'}`);
      console.log(`  - Status: ${partner.status || 'N/A'}`);
      console.log(`  - Type: ${partner.type || 'N/A'}`);
      console.log('  ---');
    });
    
    // Check partnerusers collection
    const partnerUsers = await partnerUsersCollection.find({}).toArray();
    
    console.log(`📊 Found ${partnerUsers.length} partner users in 'partnerusers' collection:`);
    partnerUsers.forEach(user => {
      console.log(`  - Partner ID: ${user.partnerId || 'N/A'}`);
      console.log(`  - Email: ${user.email || 'N/A'}`);
      console.log(`  - Business Name: ${user.businessName || 'N/A'}`);
      console.log(`  - Status: ${user.status || 'N/A'}`);
      console.log('  ---');
    });
    
    // If no partners exist, create a test partner
    if (partners.length === 0) {
      console.log('🔧 No partners found. Creating test partner...');
      
      const testPartner = {
        partnerId: 'TEST-PARTNER-001',
        name: 'Test Auto Parts Shop',
        type: 'auto_parts_shop',
        status: 'active',
        primaryContact: {
          name: 'Ahmed Ali',
          email: 'ahmed@testshop.com',
          phone: '+201234567890'
        },
        addresses: [{
          line1: '123 Main Street',
          city: 'Cairo',
          state: 'Cairo',
          postalCode: '11511',
          country: 'Egypt'
        }],
        rating: {
          average: 4.5,
          count: 10,
          lastUpdatedAt: new Date().toISOString()
        },
        apps: {
          mobile: {
            active: true,
            lastLoginAt: null
          },
          api: {
            keyLastRotatedAt: null
          }
        },
        notes: [],
        audit: [{
          action: 'created_for_testing',
          performedBy: 'system',
          performedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await partnersCollection.insertOne(testPartner);
      console.log('✅ Test partner created successfully!');
      console.log('   Partner ID: TEST-PARTNER-001');
      console.log('   Name: Test Auto Parts Shop');
    }
    
  } catch (error) {
    console.error('❌ Error checking partners:', error);
  } finally {
    process.exit(0);
  }
}

debugPartners();
