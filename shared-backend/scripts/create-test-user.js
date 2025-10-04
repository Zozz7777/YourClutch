/**
 * Create Test User Script
 * Creates a test user for authentication testing
 */

const { connectToDatabase, getCollection } = require('../config/optimized-database');
const { hashPassword } = require('../utils/password-utils');
require('dotenv').config();

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');
    
    // Connect to database
    await connectToDatabase();
    
    // Get users collection
    const usersCollection = await getCollection('users');
    
    // Test user data
    const testUser = {
      email: 'admin@yourclutch.com',
      password: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'head_administrator',
      isActive: true,
      permissions: ['*'], // All permissions
      createdAt: new Date(),
      lastLogin: null,
      emailVerified: true,
      phoneNumber: '+1234567890',
      organizationId: 'clutch-main',
      isEmployee: true,
      firebaseId: 'admin-test-user-' + Date.now() // Unique firebaseId
    };
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('✅ Test user already exists:', testUser.email);
      
      // Update password to ensure it's correct
      await usersCollection.updateOne(
        { email: testUser.email },
        { 
          $set: { 
            password: testUser.password,
            isActive: true,
            role: 'head_administrator',
            permissions: ['*']
          }
        }
      );
      console.log('✅ Test user password updated');
    } else {
      // Create new user
      const result = await usersCollection.insertOne(testUser);
      console.log('✅ Test user created successfully:', result.insertedId);
    }
    
    // Also create a regular user for testing
    const regularUser = {
      email: 'user@yourclutch.com',
      password: await hashPassword('user123'),
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      isActive: true,
      permissions: ['read', 'write'],
      createdAt: new Date(),
      lastLogin: null,
      emailVerified: true,
      phoneNumber: '+1234567891',
      organizationId: 'clutch-main',
      isEmployee: false,
      firebaseId: 'user-test-user-' + Date.now() // Unique firebaseId
    };
    
    const existingRegularUser = await usersCollection.findOne({ email: regularUser.email });
    
    if (existingRegularUser) {
      console.log('✅ Regular test user already exists:', regularUser.email);
      
      // Update password to ensure it's correct
      await usersCollection.updateOne(
        { email: regularUser.email },
        { 
          $set: { 
            password: regularUser.password,
            isActive: true,
            role: 'user',
            permissions: ['read', 'write']
          }
        }
      );
      console.log('✅ Regular test user password updated');
    } else {
      // Create new user
      const result = await usersCollection.insertOne(regularUser);
      console.log('✅ Regular test user created successfully:', result.insertedId);
    }
    
    console.log('🎉 Test users setup completed!');
    console.log('📧 Admin credentials: admin@yourclutch.com / admin123');
    console.log('📧 User credentials: user@yourclutch.com / user123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('✅ Test user creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test user creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };




