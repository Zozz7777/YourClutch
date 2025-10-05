/**
 * Enterprise Database Configuration for 100k+ Users
 * Optimized for high-scale production environments
 */

const { MongoClient } = require('mongodb');

class EnterpriseDatabase {
  constructor() {
    this.client = null;
    this.database = null;
    this.connectionOptions = {
      // Connection pool settings for 100k users
      maxPoolSize: 50, // Maximum number of connections in the pool
      minPoolSize: 10, // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      connectTimeoutMS: 10000, // How long to wait for a connection
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      
      // Write concern for data consistency
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 10000
      },
      
      // Read preference for performance
      readPreference: 'secondaryPreferred',
      
      // Compression for network efficiency
      compressors: ['zlib'],
      
      // Retry settings
      retryWrites: true,
      retryReads: true
    };
    
    this.indexes = new Map();
    this.setupIndexes();
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch';
      
      this.client = new MongoClient(mongoUri, this.connectionOptions);
      await this.client.connect();
      
      this.database = this.client.db();
      
      // Create all necessary indexes for performance
      await this.createPerformanceIndexes();
      
      console.log('✅ Enterprise database connected with optimized settings');
      return this.database;
    } catch (error) {
      console.error('❌ Enterprise database connection failed:', error);
      throw error;
    }
  }

  async createPerformanceIndexes() {
    const collections = [
      'partners',
      'auto_parts_inventory', 
      'auto_parts_orders',
      'users',
      'notifications',
      'audit_logs',
      'knowledge_base_articles'
    ];

    for (const collectionName of collections) {
      try {
        const collection = this.database.collection(collectionName);
        
        // Create compound indexes for common query patterns
        const indexes = this.getIndexesForCollection(collectionName);
        
        for (const index of indexes) {
          try {
            await collection.createIndex(index.fields, index.options);
            console.log(`✅ Index created for ${collectionName}:`, index.fields);
          } catch (error) {
            if (!error.message.includes('already exists')) {
              console.error(`❌ Error creating index for ${collectionName}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error setting up indexes for ${collectionName}:`, error);
      }
    }
  }

  getIndexesForCollection(collectionName) {
    const indexMap = {
      'partners': [
        { fields: { partnerId: 1 }, options: { unique: true } },
        { fields: { status: 1, createdAt: -1 }, options: {} },
        { fields: { 'primaryContact.email': 1 }, options: {} },
        { fields: { type: 1, status: 1 }, options: {} },
        { fields: { createdAt: -1 }, options: {} }
      ],
      'auto_parts_inventory': [
        { fields: { partNumber: 1 }, options: { unique: true } },
        { fields: { category: 1, brand: 1 }, options: {} },
        { fields: { status: 1, quantity: 1 }, options: {} },
        { fields: { partnerId: 1, status: 1 }, options: {} },
        { fields: { name: 'text', description: 'text' }, options: {} },
        { fields: { price: 1 }, options: {} },
        { fields: { createdAt: -1 }, options: {} }
      ],
      'auto_parts_orders': [
        { fields: { orderId: 1 }, options: { unique: true } },
        { fields: { partnerId: 1, status: 1 }, options: {} },
        { fields: { status: 1, createdAt: -1 }, options: {} },
        { fields: { customerEmail: 1 }, options: {} },
        { fields: { totalAmount: 1 }, options: {} },
        { fields: { createdAt: -1 }, options: {} }
      ],
      'users': [
        { fields: { email: 1 }, options: { unique: true } },
        { fields: { partnerId: 1, role: 1 }, options: {} },
        { fields: { status: 1, createdAt: -1 }, options: {} },
        { fields: { role: 1, status: 1 }, options: {} },
        { fields: { createdAt: -1 }, options: {} }
      ],
      'notifications': [
        { fields: { partnerId: 1, isRead: 1 }, options: {} },
        { fields: { type: 1, createdAt: -1 }, options: {} },
        { fields: { isRead: 1, createdAt: -1 }, options: {} },
        { fields: { createdAt: -1 }, options: {} }
      ],
      'audit_logs': [
        { fields: { userId: 1, createdAt: -1 }, options: {} },
        { fields: { action: 1, createdAt: -1 }, options: {} },
        { fields: { category: 1, severity: 1 }, options: {} },
        { fields: { createdAt: -1 }, options: {} }
      ],
      'knowledge_base_articles': [
        { fields: { title: 'text', content: 'text' }, options: {} },
        { fields: { category: 1, status: 1 }, options: {} },
        { fields: { status: 1, createdAt: -1 }, options: {} },
        { fields: { tags: 1 }, options: {} },
        { fields: { createdAt: -1 }, options: {} }
      ]
    };

    return indexMap[collectionName] || [];
  }

  // Optimized query methods for high-scale usage
  async findWithPagination(collectionName, query = {}, options = {}) {
    const collection = this.database.collection(collectionName);
    
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      projection = null
    } = options;

    const skip = (page - 1) * limit;
    
    const cursor = collection.find(query, {
      projection,
      sort,
      limit,
      skip
    });

    const [data, total] = await Promise.all([
      cursor.toArray(),
      collection.countDocuments(query)
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Optimized aggregation for analytics
  async getAnalytics(collectionName, pipeline, options = {}) {
    const collection = this.database.collection(collectionName);
    
    const {
      allowDiskUse = true,
      maxTimeMS = 30000
    } = options;

    return await collection.aggregate(pipeline, {
      allowDiskUse,
      maxTimeMS
    }).toArray();
  }

  // Connection health check
  async healthCheck() {
    try {
      await this.database.admin().ping();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date() };
    }
  }

  // Get connection stats
  async getConnectionStats() {
    try {
      const serverStatus = await this.database.admin().serverStatus();
      return {
        connections: serverStatus.connections,
        memory: serverStatus.mem,
        uptime: serverStatus.uptime,
        version: serverStatus.version
      };
    } catch (error) {
      console.error('Error getting connection stats:', error);
      return null;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Enterprise database connection closed');
    }
  }
}

// Create singleton instance
const enterpriseDatabase = new EnterpriseDatabase();

module.exports = {
  enterpriseDatabase,
  connect: () => enterpriseDatabase.connect(),
  getDatabase: () => enterpriseDatabase.database,
  healthCheck: () => enterpriseDatabase.healthCheck(),
  getConnectionStats: () => enterpriseDatabase.getConnectionStats(),
  findWithPagination: (collectionName, query, options) => 
    enterpriseDatabase.findWithPagination(collectionName, query, options),
  getAnalytics: (collectionName, pipeline, options) => 
    enterpriseDatabase.getAnalytics(collectionName, pipeline, options)
};
