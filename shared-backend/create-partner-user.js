const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createPartnerUser() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const partnersCollection = db.collection('partners');
    const partnerUsersCollection = db.collection('partnerusers');
    
    // Find the test partner
    const partner = await partnersCollection.findOne({ partnerId: 'TEST-PARTNER-001' });
    
    if (!partner) {
      console.log('❌ Partner not found');
      return;
    }
    
    console.log('✅ Found partner:', partner.name);
    
    // Check if PartnerUser already exists
    const existingPartnerUser = await partnerUsersCollection.findOne({ partnerId: 'TEST-PARTNER-001' });
    
    if (existingPartnerUser) {
      console.log('✅ PartnerUser already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create PartnerUser record
    const partnerUser = {
      partnerId: partner.partnerId,
      email: partner.primaryContact.email,
      phone: partner.primaryContact.phone,
      password: hashedPassword,
      businessName: partner.name,
      ownerName: partner.primaryContact.name,
      partnerType: partner.type,
      businessAddress: {
        street: partner.addresses[0]?.line1 || '',
        city: partner.addresses[0]?.city || '',
        state: partner.addresses[0]?.state || '',
        zipCode: partner.addresses[0]?.postalCode || ''
      },
      workingHours: {},
      businessSettings: {},
      status: 'active',
      isVerified: false,
      isLocked: false,
      loginAttempts: 0,
      lastLogin: null,
      appPreferences: {
        language: 'ar',
        theme: 'light',
        notifications: {
          orders: true,
          payments: true,
          updates: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert PartnerUser record
    const result = await partnerUsersCollection.insertOne(partnerUser);
    
    console.log('✅ PartnerUser created successfully:', result.insertedId);
    console.log('📧 Email:', partnerUser.email);
    console.log('🔑 Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createPartnerUser();
