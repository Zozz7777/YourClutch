const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testMaintenanceRecords() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🔧 Testing Maintenance Records');
  console.log('=' .repeat(50));
  
  // Check if user exists
  const usersCollection = db.collection('users');
  const user = await usersCollection.findOne({
    email: 'ziadabdelmageed1@gmail.com'
  });
  
  if (!user) {
    console.log('❌ User not found');
    await client.close();
    return;
  }
  
  console.log('✅ User found:', user.email);
  console.log('   User ID:', user._id);
  
  // Check if user has cars
  const carsCollection = db.collection('cars');
  const userCars = await carsCollection.find({
    userId: user._id.toString()
  }).toArray();
  
  console.log(`📊 User has ${userCars.length} cars`);
  
  if (userCars.length === 0) {
    console.log('❌ No cars found for user');
    await client.close();
    return;
  }
  
  const car = userCars[0];
  console.log('🚗 First car:', {
    id: car._id,
    brand: car.brand,
    model: car.model,
    licensePlate: car.licensePlate
  });
  
  // Check existing maintenance records
  const maintenanceRecordsCollection = db.collection('maintenance_records');
  const existingRecords = await maintenanceRecordsCollection.find({
    userId: user._id.toString(),
    carId: car._id.toString()
  }).sort({ createdAt: -1 }).toArray();
  
  console.log(`📋 Found ${existingRecords.length} existing maintenance records`);
  
  if (existingRecords.length > 0) {
    console.log('📋 Recent maintenance records:');
    existingRecords.slice(0, 3).forEach((record, index) => {
      console.log(`${index + 1}. Date: ${record.date}`);
      console.log(`   Type: ${record.maintenanceType}`);
      console.log(`   Kilometers: ${record.kilometers}`);
      console.log(`   Services: ${record.services?.map(s => s.serviceName).join(', ') || 'N/A'}`);
      console.log(`   Created: ${record.createdAt}`);
      console.log('-'.repeat(40));
    });
  }
  
  // Test creating a new maintenance record
  const testMaintenanceData = {
    userId: user._id.toString(),
    carId: car._id.toString(),
    date: new Date('2025-09-28'),
    maintenanceType: 'Oil Change, Brake Service',
    kilometers: 55000,
    description: 'Test maintenance record creation',
    services: [
      {
        serviceGroup: 'GENERAL',
        serviceName: 'Oil Change'
      },
      {
        serviceGroup: 'GENERAL',
        serviceName: 'Brake Service'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('🔧 Creating test maintenance record...');
  
  try {
    const result = await maintenanceRecordsCollection.insertOne(testMaintenanceData);
    console.log('✅ Test maintenance record created:', result.insertedId);
    
    // Verify the record was created
    const createdRecord = await maintenanceRecordsCollection.findOne({
      _id: result.insertedId
    });
    
    if (createdRecord) {
      console.log('✅ Record verification successful:');
      console.log(`   ID: ${createdRecord._id}`);
      console.log(`   User ID: ${createdRecord.userId}`);
      console.log(`   Car ID: ${createdRecord.carId}`);
      console.log(`   Date: ${createdRecord.date}`);
      console.log(`   Type: ${createdRecord.maintenanceType}`);
      console.log(`   Kilometers: ${createdRecord.kilometers}`);
      console.log(`   Services: ${createdRecord.services?.length || 0} services`);
    }
    
  } catch (error) {
    console.log('❌ Error creating maintenance record:', error.message);
  }
  
  // Check total maintenance records count
  const totalRecords = await maintenanceRecordsCollection.countDocuments({
    userId: user._id.toString()
  });
  
  console.log(`📊 Total maintenance records for user: ${totalRecords}`);
  
  await client.close();
}

testMaintenanceRecords().catch(console.error);
