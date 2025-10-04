const { MongoClient } = require('mongodb');

async function createTestPartner() {
  const client = new MongoClient('mongodb+srv://clutch:clutch123@cluster0.mongodb.net/clutch');
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const partnersCollection = db.collection('partners');
    
    // Check if test partner already exists
    const existingPartner = await partnersCollection.findOne({ partnerId: 'TEST-PARTNER-001' });
    if (existingPartner) {
      console.log('✅ Test partner already exists:', existingPartner.partnerId);
      return;
    }
    
    // Create test partner
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
    console.log('   Status: active');
    
  } catch (error) {
    console.error('❌ Error creating test partner:', error);
  } finally {
    await client.close();
  }
}

createTestPartner();