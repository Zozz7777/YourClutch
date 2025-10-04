const { MongoClient } = require('mongodb');
require('dotenv').config();

async function listAllUsers() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const users = await db.collection('users').find({}).limit(20).toArray();
  
  console.log(`Found ${users.length} users (showing first 20):`);
  users.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email}`);
    console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Active: ${user.isActive || false}`);
    console.log('-'.repeat(40));
  });
  
  await client.close();
}

listAllUsers().catch(console.error);
