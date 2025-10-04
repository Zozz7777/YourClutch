const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkClients() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // Check clients collection
  const clientsCollection = db.collection('clients');
  const clientCount = await clientsCollection.countDocuments();
  console.log('Clients collection count:', clientCount);
  
  if (clientCount > 0) {
    // Get sample clients
    const sampleClients = await clientsCollection.find({}).limit(5).toArray();
    console.log('Sample clients:');
    sampleClients.forEach((client, index) => {
      console.log(`${index + 1}. Email: ${client.email || 'N/A'}`);
      console.log(`   Phone: ${client.phoneNumber || client.phone || 'N/A'}`);
      console.log(`   Name: ${client.name || client.firstName + ' ' + client.lastName || 'N/A'}`);
      console.log(`   Active: ${client.isActive || false}`);
      console.log('-'.repeat(40));
    });
    
    // Search for Ziad specifically
    const ziadClients = await clientsCollection.find({
      $or: [
        { email: { $regex: 'ziad', $options: 'i' } },
        { name: { $regex: 'ziad', $options: 'i' } },
        { firstName: { $regex: 'ziad', $options: 'i' } },
        { lastName: { $regex: 'ziad', $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`\nFound ${ziadClients.length} Ziad clients:`);
    ziadClients.forEach((client, index) => {
      console.log(`${index + 1}. Email: ${client.email || 'N/A'}`);
      console.log(`   Phone: ${client.phoneNumber || client.phone || 'N/A'}`);
      console.log(`   Name: ${client.name || client.firstName + ' ' + client.lastName || 'N/A'}`);
      console.log(`   Active: ${client.isActive || false}`);
      console.log('-'.repeat(40));
    });
  }
  
  await client.close();
}

checkClients().catch(console.error);
