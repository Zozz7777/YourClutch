// E2E Test Setup
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup test database
beforeAll(async () => {
  console.log('🔧 Setting up test database...');
  
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  console.log('✅ Test database connected');
});

// Cleanup after tests
afterAll(async () => {
  console.log('🧹 Cleaning up test database...');
  
  // Close database connection
  await mongoose.connection.close();
  
  // Stop in-memory MongoDB
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('✅ Test database cleaned up');
});

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestPartner: () => ({
    partnerId: `TEST-PARTNER-${Date.now()}`,
    name: 'Test Partner',
    type: 'AUTO_PARTS_SHOP',
    primaryContact: {
      name: 'Test Owner',
      email: `test${Date.now()}@example.com`,
      phone: '+201234567890'
    },
    addresses: [{
      line1: '123 Test Street',
      city: 'Cairo',
      state: 'Cairo',
      postalCode: '12345'
    }],
    status: 'active',
    createdAt: new Date()
  }),

  // Generate test user
  generateTestUser: (partnerId) => ({
    partnerId,
    email: `user${Date.now()}@example.com`,
    password: 'TestPassword123!',
    businessName: 'Test Business',
    ownerName: 'Test Owner',
    partnerType: 'AUTO_PARTS_SHOP',
    businessAddress: {
      street: '123 Test Street',
      city: 'Cairo',
      state: 'Cairo',
      zipCode: '12345'
    },
    status: 'active',
    isVerified: true,
    createdAt: new Date()
  }),

  // Generate test order
  generateTestOrder: (partnerId) => ({
    partnerId,
    orderId: `TEST-ORDER-${Date.now()}`,
    customerName: 'Test Customer',
    customerPhone: '+201234567890',
    customerEmail: 'customer@example.com',
    items: [{
      name: 'Test Product',
      quantity: 1,
      price: 100.00
    }],
    totalAmount: 100.00,
    status: 'pending',
    createdAt: new Date()
  }),

  // Generate test notification
  generateTestNotification: (partnerId) => ({
    partnerId,
    type: 'order',
    title: 'Test Notification',
    message: 'This is a test notification',
    data: { orderId: 'TEST-ORDER-001' },
    isRead: false,
    createdAt: new Date()
  }),

  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate random email
  randomEmail: () => `test${Date.now()}@example.com`,

  // Generate random phone
  randomPhone: () => `+201234567${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
};

// Mock external services
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  messaging: () => ({
    send: jest.fn().mockResolvedValue('mock-message-id')
  })
}));

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue({})
}));

jest.mock('twilio', () => () => ({
  messages: {
    create: jest.fn().mockResolvedValue({ sid: 'mock-sms-id' })
  }
}));

console.log('✅ E2E test setup completed');