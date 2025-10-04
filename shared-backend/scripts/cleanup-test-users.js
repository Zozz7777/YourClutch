
/**
 * Cleanup Test Users Script
 * 
 * This script removes test users from the database while preserving real users.
 * It identifies test users by common patterns in email addresses and phone numbers.
 * 
 * Usage: node scripts/cleanup-test-users.js [--dry-run] [--confirm]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --confirm    Skip confirmation prompt and proceed with deletion
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

// Test user patterns to identify test accounts
const TEST_USER_PATTERNS = {
  // Email patterns
  emailPatterns: [
    /^test/i,                    // test@, testuser@, etc.
    /test.*@/i,                  // anything with "test" before @
    /@test/i,                    // @test.com, @testdomain.com
    /@example\./i,               // @example.com, @example.org
    /@localhost/i,               // @localhost
    /@dummy/i,                   // @dummy.com
    /@fake/i,                    // @fake.com
    /@temp/i,                    // @temp.com
    /@temp_/i,                   // @temp_1234567890_abc123
    /user_\d+_/i,                // user_1234567890_abc123@
    /temp_\d+_/i,                // temp_1234567890_abc123@
    /^admin@yourclutch\.com$/i,  // admin@yourclutch.com (fallback user)
    /^ceo@yourclutch\.com$/i,    // ceo@yourclutch.com (fallback user)
    /@yourclutch\.com$/i,        // any @yourclutch.com (fallback users)
    /@clutch\.app$/i,            // any @clutch.app (converted phone numbers)
  ],
  
  // Phone number patterns
  phonePatterns: [
    /^temp_/i,                   // temp_1234567890_abc123
    /^user_/i,                   // user_1234567890_abc123
    /^123456789/i,               // 1234567890, 1234567891, etc.
    /^000000000/i,               // 0000000000, 0000000001, etc.
    /^111111111/i,               // 1111111111, 1111111112, etc.
    /^999999999/i,               // 9999999999, 9999999998, etc.
  ],
  
  // Name patterns
  namePatterns: [
    /^test/i,                    // Test User, TestUser, etc.
    /^admin/i,                   // Admin User
    /^demo/i,                    // Demo User
    /^sample/i,                  // Sample User
    /^dummy/i,                   // Dummy User
    /^fake/i,                    // Fake User
    /^temp/i,                    // Temp User
    /^user_\d+_/i,               // user_1234567890_abc123
    /^temp_\d+_/i,               // temp_1234567890_abc123
  ]
};

// Real user patterns to preserve (whitelist)
const REAL_USER_PATTERNS = {
  emailPatterns: [
    /@gmail\.com$/i,             // Gmail users
    /@yahoo\.com$/i,             // Yahoo users
    /@hotmail\.com$/i,           // Hotmail users
    /@outlook\.com$/i,           // Outlook users
    /@icloud\.com$/i,            // iCloud users
    /@live\.com$/i,              // Live users
    /@msn\.com$/i,               // MSN users
    /@aol\.com$/i,               // AOL users
    /@protonmail\.com$/i,        // ProtonMail users
    /@yandex\.com$/i,            // Yandex users
    /@mail\.ru$/i,               // Mail.ru users
    /@zoho\.com$/i,              // Zoho users
    /@fastmail\.com$/i,          // Fastmail users
    /@tutanota\.com$/i,          // Tutanota users
  ],
  
  phonePatterns: [
    /^01[0-9]{9}$/,              // Egyptian mobile numbers (01xxxxxxxxx)
    /^\+20[0-9]{10}$/,           // Egyptian mobile with country code
    /^\+1[0-9]{10}$/,            // US/Canada numbers
    /^\+44[0-9]{10}$/,           // UK numbers
    /^\+33[0-9]{9}$/,            // French numbers
    /^\+49[0-9]{10,11}$/,        // German numbers
    /^\+81[0-9]{10,11}$/,        // Japanese numbers
    /^\+86[0-9]{11}$/,           // Chinese numbers
    /^\+91[0-9]{10}$/,           // Indian numbers
    /^\+971[0-9]{9}$/,           // UAE numbers
    /^\+966[0-9]{9}$/,           // Saudi numbers
    /^\+965[0-9]{8}$/,           // Kuwait numbers
    /^\+974[0-9]{8}$/,           // Qatar numbers
    /^\+973[0-9]{8}$/,           // Bahrain numbers
    /^\+968[0-9]{8}$/,           // Oman numbers
  ]
};

class TestUserCleanup {
  constructor() {
    this.client = null;
    this.db = null;
    this.dryRun = false;
    this.confirmed = false;
  }

  async connect() {
    try {
      console.log('🔌 Connecting to database...');
      this.client = new MongoClient(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      await this.client.connect();
      this.db = this.client.db();
      console.log('✅ Connected to database successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Database connection closed');
    }
  }

  isTestUser(user) {
    const { email, phoneNumber, phone, name } = user;
    
    // Check if it's a real user (whitelist)
    if (this.isRealUser(user)) {
      return false;
    }
    
    // Check email patterns
    if (email) {
      for (const pattern of TEST_USER_PATTERNS.emailPatterns) {
        if (pattern.test(email)) {
          return true;
        }
      }
    }
    
    // Check phone number patterns
    const phoneToCheck = phoneNumber || phone;
    if (phoneToCheck) {
      for (const pattern of TEST_USER_PATTERNS.phonePatterns) {
        if (pattern.test(phoneToCheck)) {
          return true;
        }
      }
    }
    
    // Check name patterns
    if (name) {
      for (const pattern of TEST_USER_PATTERNS.namePatterns) {
        if (pattern.test(name)) {
          return true;
        }
      }
    }
    
    return false;
  }

  isRealUser(user) {
    const { email, phoneNumber, phone } = user;
    
    // Check email patterns
    if (email) {
      for (const pattern of REAL_USER_PATTERNS.emailPatterns) {
        if (pattern.test(email)) {
          return true;
        }
      }
    }
    
    // Check phone number patterns
    const phoneToCheck = phoneNumber || phone;
    if (phoneToCheck) {
      for (const pattern of REAL_USER_PATTERNS.phonePatterns) {
        if (pattern.test(phoneToCheck)) {
          return true;
        }
      }
    }
    
    return false;
  }

  async findTestUsers() {
    console.log('🔍 Scanning for test users...');
    
    const usersCollection = this.db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();
    
    const testUsers = [];
    const realUsers = [];
    
    for (const user of allUsers) {
      if (this.isTestUser(user)) {
        testUsers.push(user);
      } else {
        realUsers.push(user);
      }
    }
    
    console.log(`📊 Found ${allUsers.length} total users:`);
    console.log(`   🧪 Test users: ${testUsers.length}`);
    console.log(`   👤 Real users: ${realUsers.length}`);
    
    return { testUsers, realUsers, total: allUsers.length };
  }

  displayTestUsers(testUsers) {
    if (testUsers.length === 0) {
      console.log('✅ No test users found!');
      return;
    }
    
    console.log('\n🧪 Test users to be deleted:');
    console.log('=' .repeat(80));
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phoneNumber || user.phone || 'N/A'}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
      console.log(`   Active: ${user.isActive || false}`);
      console.log('-'.repeat(40));
    });
  }

  async deleteTestUsers(testUsers) {
    if (testUsers.length === 0) {
      console.log('✅ No test users to delete');
      return 0;
    }
    
    if (this.dryRun) {
      console.log(`🧪 DRY RUN: Would delete ${testUsers.length} test users`);
      return 0;
    }
    
    console.log(`🗑️  Deleting ${testUsers.length} test users...`);
    
    const usersCollection = this.db.collection('users');
    const userIds = testUsers.map(user => user._id);
    
    const result = await usersCollection.deleteMany({
      _id: { $in: userIds }
    });
    
    console.log(`✅ Successfully deleted ${result.deletedCount} test users`);
    return result.deletedCount;
  }

  async confirmDeletion(testUsers) {
    if (this.confirmed) {
      return true;
    }
    
    if (testUsers.length === 0) {
      return true;
    }
    
    console.log(`\n⚠️  WARNING: You are about to delete ${testUsers.length} test users!`);
    console.log('This action cannot be undone.');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      });
    });
  }

  async run() {
    try {
      // Parse command line arguments
      const args = process.argv.slice(2);
      this.dryRun = args.includes('--dry-run');
      this.confirmed = args.includes('--confirm');
      
      console.log('🧹 Test User Cleanup Script');
      console.log('=' .repeat(50));
      
      if (this.dryRun) {
        console.log('🧪 Running in DRY RUN mode - no changes will be made');
      }
      
      await this.connect();
      
      // Find test users
      const { testUsers, realUsers, total } = await this.findTestUsers();
      
      // Display test users
      this.displayTestUsers(testUsers);
      
      if (testUsers.length > 0) {
        // Confirm deletion
        const confirmed = await this.confirmDeletion(testUsers);
        
        if (confirmed) {
          // Delete test users
          const deletedCount = await this.deleteTestUsers(testUsers);
          
          console.log('\n📊 Cleanup Summary:');
          console.log(`   Total users before: ${total}`);
          console.log(`   Test users deleted: ${deletedCount}`);
          console.log(`   Real users preserved: ${realUsers.length}`);
          console.log(`   Total users after: ${total - deletedCount}`);
        } else {
          console.log('❌ Operation cancelled by user');
        }
      }
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run the cleanup
if (require.main === module) {
  const cleanup = new TestUserCleanup();
  cleanup.run().catch(console.error);
}

module.exports = TestUserCleanup;
