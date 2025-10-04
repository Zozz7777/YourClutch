const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testMaintenanceUpdate() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🔧 Testing Maintenance Update');
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
  
  // Test maintenance update data format
  const maintenanceData = {
    maintenanceDate: '2025-09-28',
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
    kilometers: 50000
  };
  
  console.log('🔧 Testing maintenance update with data:');
  console.log(JSON.stringify(maintenanceData, null, 2));
  
  // Try to update the car maintenance
  try {
    const updateResult = await carsCollection.updateOne(
      { _id: car._id },
      {
        $set: {
          lastMaintenanceDate: new Date(maintenanceData.maintenanceDate),
          lastMaintenanceKilometers: maintenanceData.kilometers,
          currentMileage: maintenanceData.kilometers,
          lastMaintenanceServices: maintenanceData.services.map(service => ({
            serviceGroup: service.serviceGroup,
            serviceName: service.serviceName,
            date: new Date(maintenanceData.maintenanceDate)
          })),
          updatedAt: new Date()
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Car maintenance updated successfully');
      
      // Also create a maintenance record
      const maintenanceRecordsCollection = db.collection('maintenance_records');
      const maintenanceRecord = {
        userId: user._id.toString(),
        carId: car._id.toString(),
        date: new Date(maintenanceData.maintenanceDate),
        maintenanceType: maintenanceData.services.map(s => s.serviceName).join(', '),
        kilometers: maintenanceData.kilometers,
        description: `Maintenance performed: ${maintenanceData.services.map(s => s.serviceName).join(', ')}`,
        services: maintenanceData.services,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const recordResult = await maintenanceRecordsCollection.insertOne(maintenanceRecord);
      console.log('✅ Maintenance record created:', recordResult.insertedId);
      
    } else {
      console.log('❌ Failed to update car maintenance');
    }
    
  } catch (error) {
    console.log('❌ Error updating maintenance:', error.message);
  }
  
  await client.close();
}

testMaintenanceUpdate().catch(console.error);
