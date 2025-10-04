/**
 * Optimized Database Configuration - Performance Focused
 * Reduced connection pool and optimized for speed
 */

const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('../utils/logger');

let db = null;
let client = null;

// Optimized Database configuration for performance
const DB_CONFIG_FAST = {
  // Reduced connection settings for better performance
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 20, // Reduced from 100
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,  // Reduced from 20
  connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS) || 5000, // Reduced from 10000
  socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT_MS) || 15000, // Reduced from 30000
  serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT_MS) || 5000, // Reduced from 10000
  
  // Performance optimization settings
  maxIdleTimeMS: 30000, // Reduced from 60000
  waitQueueTimeoutMS: 3000, // Reduced from 5000
  maxConnecting: 5, // Reduced from 10
  
  // Security settings
  tls: true,
  tlsAllowInvalidCertificates: false,
  
  // Monitoring and debugging - disabled for performance
  monitorCommands: false, // Disabled for performance
  
  // Read preferences for better performance
  readPreference: 'primaryPreferred',
  
  // Write concerns for data consistency
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 5000 // Reduced from 10000
  },
  
  // Retry settings
  retryReads: true,
  retryWrites: true,
  
  // Compression for network efficiency
  compressors: ['zlib'],
  zlibCompressionLevel: 6
};

// Fast connection function
async function connectToDatabaseFast() {
  if (client && client.topology && client.topology.isConnected()) {
    return client;
  }
  
  try {
    console.log('🚀 Connecting to MongoDB with optimized settings...');
    
    // Use native MongoDB client for better performance
    client = new MongoClient(process.env.MONGODB_URI, DB_CONFIG_FAST);
    await client.connect();
    
    db = client.db(process.env.MONGODB_DB || 'clutch');
    console.log('✅ Fast database connection established');
    
    return client;
  } catch (error) {
    console.error('❌ Fast database connection failed:', error);
    throw error;
  }
}

// Optimized collection getter
async function getCollectionFast(collectionName) {
  if (!db) {
    await connectToDatabaseFast();
  }
  
  return db.collection(collectionName);
}

// Fast connection with timeout
async function connectToDatabaseFastWithTimeout() {
  const connectionPromise = connectToDatabaseFast();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Database connection timeout after 10 seconds')), 10000)
  );
  
  return Promise.race([connectionPromise, timeoutPromise]);
}

module.exports = {
  connectToDatabaseFast,
  getCollectionFast,
  connectToDatabaseFastWithTimeout,
  DB_CONFIG_FAST
};
