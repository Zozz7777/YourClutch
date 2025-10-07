
/**
 * Quick Test User Cleanup Script
 * 
 * This is a simplified version that quickly removes obvious test users.
 * Use this for immediate cleanup of test data.
 * 
 * Usage: node scripts/quick-cleanup-test-users.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function quickCleanup() {
  let client;
  
  try {
    console.log('🧹 Quick Test User Cleanup');
    console.log('=' .repeat(40));
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    client = new MongoClient(MONGODB_URI, {
      });
    
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    console.log('✅ Connected to database');
    
    // Count total users before cleanup
    const totalBefore = await usersCollection.countDocuments();
    console.log(`📊 Total users before cleanup: ${totalBefore}`);
    
    // Define test user patterns for quick cleanup
    const testUserQueries = [
      // Email patterns
      { email: { $regex: /^test/i } },
      { email: { $regex: /test.*@/i } },
      { email: { $regex: /@test/i } },
      { email: { $regex: /@example\./i } },
      { email: { $regex: /@localhost/i } },
      { email: { $regex: /@dummy/i } },
      { email: { $regex: /@fake/i } },
      { email: { $regex: /@temp/i } },
      { email: { $regex: /@temp_/i } },
      { email: { $regex: /user_\d+_/i } },
      { email: { $regex: /temp_\d+_/i } },
      { email: { $regex: /@yourclutch\.com$/i } },
      { email: { $regex: /@clutch\.app$/i } },
      
      // Phone patterns
      { phoneNumber: { $regex: /^temp_/i } },
      { phone: { $regex: /^temp_/i } },
      { phoneNumber: { $regex: /^user_/i } },
      { phone: { $regex: /^user_/i } },
      { phoneNumber: { $regex: /^123456789/i } },
      { phone: { $regex: /^123456789/i } },
      { phoneNumber: { $regex: /^000000000/i } },
      { phone: { $regex: /^000000000/i } },
      { phoneNumber: { $regex: /^111111111/i } },
      { phone: { $regex: /^111111111/i } },
      
      // Name patterns
      { name: { $regex: /^test/i } },
      { name: { $regex: /^admin/i } },
      { name: { $regex: /^demo/i } },
      { name: { $regex: /^sample/i } },
      { name: { $regex: /^dummy/i } },
      { name: { $regex: /^fake/i } },
      { name: { $regex: /^temp/i } },
      { name: { $regex: /user_\d+_/i } },
      { name: { $regex: /temp_\d+_/i } },
    ];
    
    // Find test users
    console.log('🔍 Finding test users...');
    const testUsers = await usersCollection.find({
      $or: testUserQueries
    }).toArray();
    
    console.log(`🧪 Found ${testUsers.length} test users to delete`);
    
    if (testUsers.length === 0) {
      console.log('✅ No test users found!');
      return;
    }
    
    // Show some examples
    console.log('\n📋 Examples of test users to be deleted:');
    testUsers.slice(0, 5).forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'N/A'} | ${user.phoneNumber || user.phone || 'N/A'} | ${user.name || 'N/A'}`);
    });
    
    if (testUsers.length > 5) {
      console.log(`   ... and ${testUsers.length - 5} more`);
    }
    
    // Confirm deletion
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise((resolve) => {
      rl.question(`\n⚠️  Delete ${testUsers.length} test users? (yes/no): `, resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('❌ Operation cancelled');
      return;
    }
    
    // Delete test users
    console.log('🗑️  Deleting test users...');
    const userIds = testUsers.map(user => user._id);
    
    const result = await usersCollection.deleteMany({
      _id: { $in: userIds }
    });
    
    // Count users after cleanup
    const totalAfter = await usersCollection.countDocuments();
    
    console.log('\n✅ Cleanup completed!');
    console.log('📊 Summary:');
    console.log(`   Users before: ${totalBefore}`);
    console.log(`   Users deleted: ${result.deletedCount}`);
    console.log(`   Users after: ${totalAfter}`);
    console.log(`   Reduction: ${totalBefore - totalAfter} users (${((totalBefore - totalAfter) / totalBefore * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the cleanup
if (require.main === module) {
  quickCleanup().catch(console.error);
}

module.exports = quickCleanup;
