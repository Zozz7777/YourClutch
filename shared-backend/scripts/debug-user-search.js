
/**
 * Debug User Search Script
 * 
 * This script helps debug why a specific user cannot be found during login.
 * It searches for users by email and phone number with detailed logging.
 * 
 * Usage: node scripts/debug-user-search.js <email_or_phone>
 * 
 * Example: node scripts/debug-user-search.js 01009561143
 * Example: node scripts/debug-user-search.js ziadabdelmageed1@gmail.com
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function debugUserSearch(searchTerm) {
  let client;
  
  try {
    console.log('🔍 Debug User Search');
    console.log('=' .repeat(50));
    console.log(`Searching for: ${searchTerm}`);
    console.log('');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    client = new MongoClient(MONGODB_URI, {
      });
    
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    console.log('✅ Connected to database');
    console.log('');
    
    // Check if it's an email or phone number
    const isEmail = searchTerm.includes('@');
    const isPhone = /^[0-9+\-\s()]+$/.test(searchTerm.replace(/\s/g, ''));
    
    console.log(`📧 Is email: ${isEmail}`);
    console.log(`📱 Is phone: ${isPhone}`);
    console.log('');
    
    if (isEmail) {
      await searchByEmail(usersCollection, searchTerm);
    } else if (isPhone) {
      await searchByPhone(usersCollection, searchTerm);
    } else {
      console.log('❌ Invalid search term - must be email or phone number');
      return;
    }
    
    // Also do a general search across all fields
    console.log('🔍 General search across all fields...');
    const generalResults = await usersCollection.find({
      $or: [
        { email: { $regex: searchTerm, $options: 'i' } },
        { phoneNumber: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } },
        { mobile: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } }
      ]
    }).toArray();
    
    console.log(`📊 General search found ${generalResults.length} results:`);
    generalResults.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
      console.log(`   Name: ${user.name || user.firstName + ' ' + user.lastName || 'N/A'}`);
      console.log(`   Active: ${user.isActive || false}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
      console.log('-'.repeat(40));
    });
    
    // Show total user count
    const totalUsers = await usersCollection.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
    
    // Show some sample users
    console.log('\n📋 Sample users in database:');
    const sampleUsers = await usersCollection.find({}).limit(5).toArray();
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Active: ${user.isActive || false}`);
      console.log('-'.repeat(30));
    });
    
  } catch (error) {
    console.error('❌ Error during search:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

async function searchByEmail(usersCollection, email) {
  console.log('📧 Searching by email...');
  
  const emailResults = await usersCollection.find({
    email: email.toLowerCase()
  }).toArray();
  
  console.log(`📊 Found ${emailResults.length} users with exact email match:`);
  emailResults.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email}`);
    console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Active: ${user.isActive || false}`);
    console.log(`   Created: ${user.createdAt || 'N/A'}`);
    console.log('-'.repeat(40));
  });
  
  // Also search for similar emails
  const similarEmails = await usersCollection.find({
    email: { $regex: email.replace('@', '.*@'), $options: 'i' }
  }).toArray();
  
  if (similarEmails.length > emailResults.length) {
    console.log(`\n📧 Found ${similarEmails.length - emailResults.length} users with similar emails:`);
    similarEmails.filter(user => !emailResults.some(exact => exact._id.equals(user._id)))
      .forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Active: ${user.isActive || false}`);
        console.log('-'.repeat(40));
      });
  }
}

async function searchByPhone(usersCollection, phone) {
  console.log('📱 Searching by phone number...');
  
  // Clean phone number
  const cleanPhone = phone.replace(/\D/g, '');
  console.log(`Cleaned phone: ${cleanPhone}`);
  
  // Try different phone number formats
  const phoneVariations = [
    cleanPhone,                    // 01009561143
    `+2${cleanPhone}`,            // +201009561143
    `+20${cleanPhone}`,           // +2001009561143
    `0${cleanPhone}`,             // 001009561143
    cleanPhone.replace(/^0/, ''), // 1009561143
    cleanPhone.replace(/^0/, '20') // 201009561143
  ];
  
  console.log('📱 Phone variations to search:', phoneVariations);
  console.log('');
  
  // Search by phone variations
  const phoneResults = await usersCollection.find({
    $or: [
      { phoneNumber: { $in: phoneVariations } },
      { phone: { $in: phoneVariations } },
      { mobile: { $in: phoneVariations } }
    ]
  }).toArray();
  
  console.log(`📊 Found ${phoneResults.length} users with phone number match:`);
  phoneResults.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
    console.log(`   PhoneNumber: ${user.phoneNumber || 'N/A'}`);
    console.log(`   Phone: ${user.phone || 'N/A'}`);
    console.log(`   Mobile: ${user.mobile || 'N/A'}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Active: ${user.isActive || false}`);
    console.log(`   Created: ${user.createdAt || 'N/A'}`);
    console.log('-'.repeat(40));
  });
  
  // Also search for partial matches
  const partialResults = await usersCollection.find({
    $or: [
      { phoneNumber: { $regex: cleanPhone, $options: 'i' } },
      { phone: { $regex: cleanPhone, $options: 'i' } },
      { mobile: { $regex: cleanPhone, $options: 'i' } }
    ]
  }).toArray();
  
  if (partialResults.length > phoneResults.length) {
    console.log(`\n📱 Found ${partialResults.length - phoneResults.length} users with partial phone matches:`);
    partialResults.filter(user => !phoneResults.some(exact => exact._id.equals(user._id)))
      .forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
        console.log(`   PhoneNumber: ${user.phoneNumber || 'N/A'}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Mobile: ${user.mobile || 'N/A'}`);
        console.log(`   Name: ${user.name || 'N/A'}`);
        console.log(`   Active: ${user.isActive || false}`);
        console.log('-'.repeat(40));
      });
  }
}

// Get search term from command line
const searchTerm = process.argv[2];

if (!searchTerm) {
  console.log('❌ Please provide a search term (email or phone number)');
  console.log('Usage: node scripts/debug-user-search.js <email_or_phone>');
  console.log('Example: node scripts/debug-user-search.js 01009561143');
  console.log('Example: node scripts/debug-user-search.js ziadabdelmageed1@gmail.com');
  process.exit(1);
}

// Run the search
if (require.main === module) {
  debugUserSearch(searchTerm).catch(console.error);
}

module.exports = debugUserSearch;
