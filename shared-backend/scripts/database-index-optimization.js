/**
 * Database Index Optimization Script
 * Creates compound indexes for frequently queried fields to improve performance
 */

const mongoose = require('mongoose');
const { optimizedLogger } = require('../utils/optimized-logger');

// Index optimization configuration
const INDEX_OPTIMIZATION = {
  // User-related indexes
  users: [
    { email: 1, status: 1 }, // Email + status queries
    { phone: 1, status: 1 }, // Phone + status queries
    { role: 1, status: 1 }, // Role-based queries
    { createdAt: -1, status: 1 }, // Recent users by status
    { partnerId: 1, status: 1 }, // Partner users
    { email: 1, phone: 1 }, // Email or phone lookups
    { lastLoginAt: -1 }, // Recent logins
    { isActive: 1, role: 1 } // Active users by role
  ],

  // Partner-related indexes
  partners: [
    { partnerId: 1, status: 1 }, // Partner ID + status
    { email: 1, status: 1 }, // Partner email + status
    { phone: 1, status: 1 }, // Partner phone + status
    { businessName: 1, status: 1 }, // Business name + status
    { partnerType: 1, status: 1 }, // Partner type + status
    { createdAt: -1, status: 1 }, // Recent partners
    { location: '2dsphere' }, // Geospatial queries
    { isVerified: 1, status: 1 } // Verified partners
  ],

  // Order-related indexes
  orders: [
    { partnerId: 1, status: 1 }, // Partner orders by status
    { customerId: 1, status: 1 }, // Customer orders by status
    { createdAt: -1, status: 1 }, // Recent orders by status
    { scheduledDate: 1, status: 1 }, // Scheduled orders
    { total: 1, status: 1 }, // Orders by amount
    { priority: 1, status: 1 }, // Orders by priority
    { paymentStatus: 1, status: 1 }, // Payment status queries
    { partnerId: 1, createdAt: -1 } // Partner order history
  ],

  // Procurement-related indexes
  procurementRequests: [
    { requestedBy: 1, status: 1 }, // User requests by status
    { department: 1, status: 1 }, // Department requests
    { createdAt: -1, status: 1 }, // Recent requests
    { totalAmount: 1, status: 1 }, // Amount-based queries
    { category: 1, status: 1 }, // Category-based queries
    { priority: 1, status: 1 }, // Priority-based queries
    { approvedBy: 1, status: 1 }, // Approval queries
    { requestedBy: 1, createdAt: -1 } // User request history
  ],

  // Supplier-related indexes
  suppliers: [
    { supplierId: 1, status: 1 }, // Supplier ID + status
    { name: 1, status: 1 }, // Supplier name + status
    { category: 1, status: 1 }, // Category + status
    { location: '2dsphere' }, // Geospatial queries
    { rating: -1, status: 1 }, // Rating-based queries
    { createdAt: -1, status: 1 }, // Recent suppliers
    { isVerified: 1, status: 1 }, // Verified suppliers
    { riskLevel: 1, status: 1 } // Risk-based queries
  ],

  // Risk assessment indexes
  riskAssessments: [
    { supplierId: 1, status: 1 }, // Supplier assessments
    { assessedBy: 1, status: 1 }, // Assessor queries
    { assessmentDate: -1, status: 1 }, // Recent assessments
    { 'overallRisk.riskLevel': 1, status: 1 }, // Risk level queries
    { approvedBy: 1, status: 1 }, // Approval queries
    { nextAssessment: 1, status: 1 }, // Upcoming assessments
    { supplierId: 1, assessmentDate: -1 } // Supplier assessment history
  ],

  // Financial indexes
  payments: [
    { partnerId: 1, status: 1 }, // Partner payments
    { customerId: 1, status: 1 }, // Customer payments
    { paymentDate: -1, status: 1 }, // Recent payments
    { amount: 1, status: 1 }, // Amount-based queries
    { paymentMethod: 1, status: 1 }, // Payment method queries
    { transactionId: 1 }, // Transaction lookups
    { partnerId: 1, paymentDate: -1 } // Partner payment history
  ],

  // Notification indexes
  notifications: [
    { userId: 1, status: 1 }, // User notifications
    { type: 1, status: 1 }, // Notification type queries
    { createdAt: -1, status: 1 }, // Recent notifications
    { isRead: 1, userId: 1 }, // Unread notifications
    { priority: 1, status: 1 }, // Priority-based queries
    { channel: 1, status: 1 }, // Channel-based queries
    { userId: 1, createdAt: -1 } // User notification history
  ],

  // Audit log indexes
  auditLogs: [
    { userId: 1, action: 1 }, // User action queries
    { entityType: 1, action: 1 }, // Entity action queries
    { timestamp: -1, action: 1 }, // Recent actions
    { ipAddress: 1, timestamp: -1 }, // IP-based queries
    { resource: 1, action: 1 }, // Resource action queries
    { userId: 1, timestamp: -1 } // User action history
  ],

  // Session indexes
  sessions: [
    { userId: 1, isActive: 1 }, // Active user sessions
    { sessionToken: 1 }, // Session token lookups
    { expiresAt: 1, isActive: 1 }, // Expiring sessions
    { deviceId: 1, userId: 1 }, // Device-based sessions
    { ipAddress: 1, userId: 1 }, // IP-based sessions
    { createdAt: -1, isActive: 1 } // Recent sessions
  ]
};

/**
 * Create optimized indexes for a collection
 */
async function createOptimizedIndexes(collectionName, indexes) {
  try {
    const collection = mongoose.connection.db.collection(collectionName);
    
    optimizedLogger.info(`Creating indexes for ${collectionName}...`);
    
    for (const index of indexes) {
      try {
        await collection.createIndex(index, { background: true });
        optimizedLogger.info(`✅ Created index: ${JSON.stringify(index)}`);
      } catch (error) {
        if (error.code === 85) { // Index already exists
          optimizedLogger.info(`⚠️ Index already exists: ${JSON.stringify(index)}`);
        } else {
          optimizedLogger.error(`❌ Failed to create index: ${JSON.stringify(index)}`, error);
        }
      }
    }
    
    optimizedLogger.info(`✅ Completed indexing for ${collectionName}`);
  } catch (error) {
    optimizedLogger.error(`❌ Error creating indexes for ${collectionName}:`, error);
  }
}

/**
 * Create text search indexes
 */
async function createTextSearchIndexes() {
  const textIndexes = [
    { collection: 'users', fields: { email: 'text', firstName: 'text', lastName: 'text' } },
    { collection: 'partners', fields: { businessName: 'text', description: 'text' } },
    { collection: 'orders', fields: { description: 'text', serviceName: 'text' } },
    { collection: 'suppliers', fields: { name: 'text', description: 'text' } },
    { collection: 'products', fields: { name: 'text', description: 'text' } }
  ];

  for (const { collection, fields } of textIndexes) {
    try {
      const dbCollection = mongoose.connection.db.collection(collection);
      await dbCollection.createIndex(fields, { background: true });
      optimizedLogger.info(`✅ Created text index for ${collection}`);
    } catch (error) {
      optimizedLogger.error(`❌ Failed to create text index for ${collection}:`, error);
    }
  }
}

/**
 * Create geospatial indexes
 */
async function createGeospatialIndexes() {
  const geoIndexes = [
    { collection: 'partners', field: 'location' },
    { collection: 'suppliers', field: 'location' },
    { collection: 'orders', field: 'deliveryLocation' },
    { collection: 'users', field: 'location' }
  ];

  for (const { collection, field } of geoIndexes) {
    try {
      const dbCollection = mongoose.connection.db.collection(collection);
      await dbCollection.createIndex({ [field]: '2dsphere' }, { background: true });
      optimizedLogger.info(`✅ Created geospatial index for ${collection}.${field}`);
    } catch (error) {
      optimizedLogger.error(`❌ Failed to create geospatial index for ${collection}.${field}:`, error);
    }
  }
}

/**
 * Create TTL indexes for automatic cleanup
 */
async function createTTLIndexes() {
  const ttlIndexes = [
    { collection: 'sessions', field: 'expiresAt', expireAfterSeconds: 0 },
    { collection: 'tokens', field: 'expiresAt', expireAfterSeconds: 0 },
    { collection: 'notifications', field: 'expiresAt', expireAfterSeconds: 0 },
    { collection: 'auditLogs', field: 'timestamp', expireAfterSeconds: 31536000 } // 1 year
  ];

  for (const { collection, field, expireAfterSeconds } of ttlIndexes) {
    try {
      const dbCollection = mongoose.connection.db.collection(collection);
      await dbCollection.createIndex({ [field]: 1 }, { 
        background: true, 
        expireAfterSeconds 
      });
      optimizedLogger.info(`✅ Created TTL index for ${collection}.${field}`);
    } catch (error) {
      optimizedLogger.error(`❌ Failed to create TTL index for ${collection}.${field}:`, error);
    }
  }
}

/**
 * Analyze query performance
 */
async function analyzeQueryPerformance() {
  try {
    const collections = Object.keys(INDEX_OPTIMIZATION);
    
    for (const collectionName of collections) {
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Get index statistics
      const stats = await collection.indexStats();
      
      optimizedLogger.info(`📊 Index statistics for ${collectionName}:`, {
        totalIndexes: stats.length,
        indexes: stats.map(stat => ({
          name: stat.name,
          accesses: stat.accesses?.ops || 0,
          size: stat.size
        }))
      });
    }
  } catch (error) {
    optimizedLogger.error('❌ Error analyzing query performance:', error);
  }
}

/**
 * Main optimization function
 */
async function optimizeDatabaseIndexes() {
  try {
    optimizedLogger.info('🚀 Starting database index optimization...');
    
    // Create optimized indexes for each collection
    for (const [collectionName, indexes] of Object.entries(INDEX_OPTIMIZATION)) {
      await createOptimizedIndexes(collectionName, indexes);
    }
    
    // Create text search indexes
    await createTextSearchIndexes();
    
    // Create geospatial indexes
    await createGeospatialIndexes();
    
    // Create TTL indexes
    await createTTLIndexes();
    
    // Analyze performance
    await analyzeQueryPerformance();
    
    optimizedLogger.info('✅ Database index optimization completed successfully!');
    
    return {
      success: true,
      message: 'Database indexes optimized successfully',
      collections: Object.keys(INDEX_OPTIMIZATION).length,
      totalIndexes: Object.values(INDEX_OPTIMIZATION).flat().length
    };
  } catch (error) {
    optimizedLogger.error('❌ Database index optimization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get index recommendations
 */
function getIndexRecommendations() {
  return {
    performance: {
      queryTime: 'Target: <100ms for all queries',
      indexHitRate: 'Target: >95% index usage',
      slowQueries: 'Monitor queries >1000ms'
    },
    maintenance: {
      indexSize: 'Monitor index size vs collection size',
      indexFragmentation: 'Rebuild indexes if fragmentation >30%',
      unusedIndexes: 'Remove unused indexes to save space'
    },
    monitoring: {
      queryPlans: 'Analyze query execution plans',
      indexStats: 'Monitor index access patterns',
      performance: 'Track query performance metrics'
    }
  };
}

module.exports = {
  optimizeDatabaseIndexes,
  createOptimizedIndexes,
  createTextSearchIndexes,
  createGeospatialIndexes,
  createTTLIndexes,
  analyzeQueryPerformance,
  getIndexRecommendations,
  INDEX_OPTIMIZATION
};

// Run optimization if called directly
if (require.main === module) {
  const connectToDatabase = require('../config/optimized-database').connectToDatabase;
  
  async function main() {
    try {
      await connectToDatabase();
      const result = await optimizeDatabaseIndexes();
      console.log('Optimization result:', result);
      process.exit(0);
    } catch (error) {
      console.error('Optimization failed:', error);
      process.exit(1);
    }
  }
  
  main();
}
