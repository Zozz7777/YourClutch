const { MongoClient } = require('mongodb');
require('dotenv').config();

async function findZiadUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // Find all users with "ziad" in email or name
  const users = await db.collection('users').find({
    $or: [
      { email: { $regex: 'ziad', $options: 'i' } },
      { name: { $regex: 'ziad', $options: 'i' } }
    ]
  }).toArray();
  
  console.log('Found Ziad users:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email}`);
    console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Active: ${user.isActive || false}`);
    console.log('-'.repeat(40));
  });
  
  await client.close();
}

findZiadUser().catch(console.error);
