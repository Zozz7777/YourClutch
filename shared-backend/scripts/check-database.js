const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('Database name:', db.databaseName);
  
  // List all collections
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  // Check users collection specifically
  const usersCollection = db.collection('users');
  const userCount = await usersCollection.countDocuments();
  console.log('Users collection count:', userCount);
  
  // Get a sample user
  const sampleUser = await usersCollection.findOne({});
  if (sampleUser) {
    console.log('Sample user:', {
      email: sampleUser.email,
      phone: sampleUser.phoneNumber || sampleUser.phone,
      name: sampleUser.name,
      active: sampleUser.isActive
    });
  }
  
  await client.close();
}

checkDatabase().catch(console.error);
