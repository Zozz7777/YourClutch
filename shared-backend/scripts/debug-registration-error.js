const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugRegistrationError() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // Check if user already exists
  const usersCollection = db.collection('users');
  const existingUser = await usersCollection.findOne({
    email: 'ziadabdelmageed1@gmail.com'
  });
  
  if (existingUser) {
    console.log('❌ User already exists:');
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Phone: ${existingUser.phoneNumber || existingUser.phone || 'N/A'}`);
    console.log(`   Name: ${existingUser.name || 'N/A'}`);
    console.log(`   Active: ${existingUser.isActive || false}`);
    console.log(`   Created: ${existingUser.createdAt || 'N/A'}`);
    console.log(`   ID: ${existingUser._id}`);
  } else {
    console.log('✅ User does not exist - registration should work');
  }
  
  // Check total user count
  const totalUsers = await usersCollection.countDocuments();
  console.log(`\n📊 Total users in database: ${totalUsers}`);
  
  // Show recent users
  const recentUsers = await usersCollection.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
    
  console.log('\n📋 Recent users:');
  recentUsers.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
    console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Created: ${user.createdAt || 'N/A'}`);
    console.log('-'.repeat(40));
  });
  
  await client.close();
}

debugRegistrationError().catch(console.error);
