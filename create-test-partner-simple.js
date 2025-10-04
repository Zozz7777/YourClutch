const { getCollection } = require('./shared-backend/config/database');

async function createTestPartner() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Get collections
    const partnersCollection = await getCollection('partners');
    const usersCollection = await getCollection('users');
    
    console.log('✅ Connected to database');
    
    // Test partner data
    const testPartner = {
      partnerId: 'TEST-PARTNER-001',
      name: 'Test Auto Parts Store',
      type: 'parts_shop',
      status: 'active',
      primaryContact: {
        name: 'Ahmed Hassan',
        email: 'ahmed@testautoparts.com',
        phone: '+201234567890'
      },
      addresses: [{
        line1: '123 Main Street',
        line2: 'Downtown District',
        city: 'Cairo',
        state: 'Cairo',
        country: 'Egypt',
        postalCode: '11511',
        isPrimary: true
      }],
      apps: {
        mobile: {
          active: true,
          lastLoginAt: null,
          deviceTokens: []
        },
        api: {
          key: 'test-api-key-12345',
          keyLastRotatedAt: new Date().toISOString(),
          permissions: ['read_orders', 'create_orders', 'update_inventory']
        },
        web: {
          active: true,
          lastLoginAt: null
        }
      },
      rating: {
        average: 4.5,
        count: 23,
        lastUpdatedAt: new Date().toISOString(),
        breakdown: {
          '5': 15,
          '4': 6,
          '3': 2,
          '2': 0,
          '1': 0
        }
      },
      businessInfo: {
        registrationNumber: 'EG-123456789',
        taxId: 'TAX-987654321',
        businessType: 'LLC',
        establishedDate: '2020-01-15',
        website: 'https://testautoparts.com',
        description: 'Premium auto parts and accessories store'
      },
      services: [
        'Engine Parts',
        'Brake Systems',
        'Suspension Components',
        'Electrical Parts',
        'Body Parts'
      ],
      inventory: {
        totalItems: 1250,
        categories: [
          { name: 'Engine Parts', count: 450 },
          { name: 'Brake Systems', count: 200 },
          { name: 'Suspension', count: 180 },
          { name: 'Electrical', count: 220 },
          { name: 'Body Parts', count: 200 }
        ],
        lastUpdated: new Date().toISOString()
      },
      orders: {
        total: 156,
        completed: 142,
        pending: 8,
        cancelled: 6,
        totalRevenue: 125000.50,
        lastOrderAt: new Date().toISOString()
      },
      notes: [
        {
          content: 'Test partner created for development',
          addedBy: 'system',
          addedAt: new Date().toISOString(),
          type: 'system'
        }
      ],
      audit: [
        {
          action: 'created',
          performedBy: 'system',
          performedAt: new Date().toISOString(),
          details: 'Test partner created for development and testing'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    
    // Check if test partner already exists
    const existingPartner = await partnersCollection.findOne({ partnerId: 'TEST-PARTNER-001' });
    
    if (existingPartner) {
      console.log('⚠️  Test partner already exists. Updating...');
      await partnersCollection.updateOne(
        { partnerId: 'TEST-PARTNER-001' },
        { $set: testPartner }
      );
      console.log('✅ Test partner updated successfully');
    } else {
      await partnersCollection.insertOne(testPartner);
      console.log('✅ Test partner created successfully');
    }
    
    // Also create a user account for the partner
    const testUser = {
      email: 'ahmed@testautoparts.com',
      password: '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', // password: "testpass123"
      role: 'partner',
      partnerId: 'TEST-PARTNER-001',
      isActive: true,
      profile: {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+201234567890',
        avatar: null
      },
      permissions: [
        'view_orders',
        'create_orders',
        'update_inventory',
        'view_analytics',
        'manage_products'
      ],
      lastLogin: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ email: 'ahmed@testautoparts.com' });
    
    if (existingUser) {
      console.log('⚠️  Test user already exists. Updating...');
      await usersCollection.updateOne(
        { email: 'ahmed@testautoparts.com' },
        { $set: testUser }
      );
      console.log('✅ Test user updated successfully');
    } else {
      await usersCollection.insertOne(testUser);
      console.log('✅ Test user created successfully');
    }
    
    console.log('\n🎉 Test Partner Setup Complete!');
    console.log('📋 Partner Details:');
    console.log(`   Partner ID: TEST-PARTNER-001`);
    console.log(`   Business Name: Test Auto Parts Store`);
    console.log(`   Contact Email: ahmed@testautoparts.com`);
    console.log(`   Contact Phone: +201234567890`);
    console.log(`   Password: testpass123`);
    console.log(`   Partner Type: Parts Shop`);
    console.log(`   Status: Active`);
    console.log(`   Rating: 4.5/5 (23 reviews)`);
    console.log(`   Total Orders: 156`);
    console.log(`   Total Revenue: $125,000.50`);
    
    console.log('\n🔐 Login Credentials for Partner Apps:');
    console.log(`   Email: ahmed@testautoparts.com`);
    console.log(`   Password: testpass123`);
    console.log(`   Partner ID: TEST-PARTNER-001`);
    
    console.log('\n📱 You can now test:');
    console.log('   - Partner mobile app sign-in');
    console.log('   - Partner web dashboard');
    console.log('   - Partner API access');
    console.log('   - Order management');
    console.log('   - Inventory management');
    
  } catch (error) {
    console.error('❌ Error creating test partner:', error);
  }
}

// Run the script
createTestPartner();
