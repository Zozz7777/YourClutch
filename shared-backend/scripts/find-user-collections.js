const { MongoClient } = require('mongodb');
require('dotenv').config();

async function findUserCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // List all collections
  const collections = await db.listCollections().toArray();
  console.log('All collections:');
  collections.forEach((col, index) => {
    console.log(`${index + 1}. ${col.name}`);
  });
  
  // Check collections that might contain user data
  const userRelatedCollections = [
    'users', 'clients', 'customers', 'employees', 'user_profiles', 
    'user_accounts', 'accounts', 'members', 'subscribers'
  ];
  
  console.log('\nChecking user-related collections:');
  for (const collectionName of userRelatedCollections) {
    try {
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      console.log(`${collectionName}: ${count} documents`);
      
      if (count > 0) {
        const sample = await collection.findOne({});
        console.log(`  Sample: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`${collectionName}: Error - ${error.message}`);
    }
  }
  
  await client.close();
}

findUserCollections().catch(console.error);
