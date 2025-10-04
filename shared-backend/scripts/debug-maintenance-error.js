const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function debugMaintenanceError() {
  let client;
  try {
    console.log('🔧 Debugging Maintenance Update Error');
    console.log('='.repeat(50));

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    const carsCollection = db.collection('cars');

    // 1. Find the user
    const user = await usersCollection.findOne({ email: 'ziadabdelmageed1@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.email);
    console.log('   User ID:', user._id);

    // 2. Find user's cars
    const cars = await carsCollection.find({ userId: user._id.toString() }).toArray();
    console.log(`📊 User has ${cars.length} cars`);
    
    if (cars.length === 0) {
      console.log('❌ No cars found for user');
      return;
    }

    const car = cars[0];
    console.log('🚗 First car:', {
      id: car._id,
      brand: car.brand,
      model: car.model,
      licensePlate: car.licensePlate,
      userId: car.userId,
      isActive: car.isActive
    });

    // 3. Test the exact query that the backend uses
    console.log('\n🔍 Testing backend query...');
    const backendQuery = { 
      _id: new ObjectId(car._id), 
      userId: user._id.toString(), 
      isActive: true 
    };
    console.log('Backend query:', JSON.stringify(backendQuery, null, 2));
    
    const foundCar = await carsCollection.findOne(backendQuery);
    if (foundCar) {
      console.log('✅ Car found with backend query');
    } else {
      console.log('❌ Car NOT found with backend query');
      
      // Try without isActive filter
      const queryWithoutActive = { 
        _id: new ObjectId(car._id), 
        userId: user._id.toString()
      };
      const carWithoutActive = await carsCollection.findOne(queryWithoutActive);
      if (carWithoutActive) {
        console.log('✅ Car found without isActive filter');
        console.log('   isActive value:', carWithoutActive.isActive);
      } else {
        console.log('❌ Car not found even without isActive filter');
      }
    }

    // 4. Test the update operation
    console.log('\n🔧 Testing update operation...');
    const testUpdateData = {
      lastMaintenanceDate: new Date('2025-09-28'),
      lastMaintenanceKilometers: 50000,
      currentMileage: 50000,
      lastMaintenanceServices: [
        {
          serviceGroup: 'GENERAL',
          serviceName: 'Oil Change',
          date: new Date('2025-09-28')
        }
      ],
      updatedAt: new Date()
    };

    const updateResult = await carsCollection.updateOne(
      { _id: new ObjectId(car._id) },
      { $set: testUpdateData }
    );

    console.log('Update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });

    if (updateResult.modifiedCount > 0) {
      console.log('✅ Update successful');
    } else {
      console.log('❌ Update failed - no documents modified');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

debugMaintenanceError().catch(console.error);
