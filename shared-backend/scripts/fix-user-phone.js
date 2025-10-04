
/**
 * Fix User Phone Number Script
 * 
 * This script updates a user's phone number from temporary to real phone number.
 * 
 * Usage: node scripts/fix-user-phone.js <email> <real_phone>
 * 
 * Example: node scripts/fix-user-phone.js ziadabdelmageed1@gmail.com 01009561143
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function fixUserPhone(email, realPhone) {
  let client;
  
  try {
    console.log('🔧 Fix User Phone Number');
    console.log('=' .repeat(50));
    console.log(`Email: ${email}`);
    console.log(`Real Phone: ${realPhone}`);
    console.log('');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    console.log('✅ Connected to database');
    console.log('');
    
    // Find the user by email
    console.log('🔍 Finding user by email...');
    const user = await usersCollection.findOne({
      email: email.toLowerCase()
    });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return;
    }
    
    console.log('✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Active: ${user.isActive || false}`);
    console.log('');
    
    // Check if phone number is already correct
    if (user.phoneNumber === realPhone || user.phone === realPhone) {
      console.log('✅ Phone number is already correct!');
      return;
    }
    
    // Update the phone number
    console.log('🔧 Updating phone number...');
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          phoneNumber: realPhone,
          phone: realPhone,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log('✅ Phone number updated successfully!');
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ _id: user._id });
      console.log('📱 Updated user data:');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   PhoneNumber: ${updatedUser.phoneNumber}`);
      console.log(`   Phone: ${updatedUser.phone}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Active: ${updatedUser.isActive}`);
      
      console.log('\n🎉 User can now login with phone number:', realPhone);
    } else {
      console.log('❌ Failed to update phone number');
    }
    
  } catch (error) {
    console.error('❌ Error during phone number fix:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Get parameters from command line
const email = process.argv[2];
const realPhone = process.argv[3];

if (!email || !realPhone) {
  console.log('❌ Please provide both email and phone number');
  console.log('Usage: node scripts/fix-user-phone.js <email> <real_phone>');
  console.log('Example: node scripts/fix-user-phone.js ziadabdelmageed1@gmail.com 01009561143');
  process.exit(1);
}

// Run the fix
if (require.main === module) {
  fixUserPhone(email, realPhone).catch(console.error);
}

module.exports = fixUserPhone;
