/**
 * Database Indexing Script for Performance Optimization
 * Creates essential indexes for all collections to achieve 100/100 score
 */

const { connectToDatabase, getCollection } = require('../config/database-unified');

const createIndexes = async () => {
  console.log('🚀 Creating database indexes for performance optimization...');
  
  try {
    await connectToDatabase();
    
    // Users collection indexes
    const usersCollection = await getCollection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ isActive: 1 });
    await usersCollection.createIndex({ createdAt: -1 });
    await usersCollection.createIndex({ role: 1 });
    console.log('✅ Users collection indexes created');

    // Cars collection indexes
    const carsCollection = await getCollection('cars');
    await carsCollection.createIndex({ userId: 1, isActive: 1 });
    await carsCollection.createIndex({ licensePlate: 1 }, { unique: true });
    await carsCollection.createIndex({ brand: 1, model: 1 });
    await carsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Cars collection indexes created');

    // Bookings collection indexes
    const bookingsCollection = await getCollection('bookings');
    await bookingsCollection.createIndex({ userId: 1, status: 1 });
    await bookingsCollection.createIndex({ serviceProviderId: 1, status: 1 });
    await bookingsCollection.createIndex({ scheduledDate: 1 });
    await bookingsCollection.createIndex({ createdAt: -1 });
    await bookingsCollection.createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Bookings collection indexes created');

    // Employees collection indexes
    const employeesCollection = await getCollection('employees');
    await employeesCollection.createIndex({ email: 1 }, { unique: true });
    await employeesCollection.createIndex({ role: 1 });
    await employeesCollection.createIndex({ isActive: 1 });
    await employeesCollection.createIndex({ sessionToken: 1 }, { sparse: true });
    await employeesCollection.createIndex({ sessionExpiry: 1 }, { sparse: true });
    console.log('✅ Employees collection indexes created');

    // Maintenance collection indexes
    const maintenanceCollection = await getCollection('maintenance');
    await maintenanceCollection.createIndex({ carId: 1, status: 1 });
    await maintenanceCollection.createIndex({ userId: 1, createdAt: -1 });
    await maintenanceCollection.createIndex({ serviceType: 1 });
    await maintenanceCollection.createIndex({ scheduledDate: 1 });
    console.log('✅ Maintenance collection indexes created');

    // Notifications collection indexes
    const notificationsCollection = await getCollection('notifications');
    await notificationsCollection.createIndex({ userId: 1, isRead: 1 });
    await notificationsCollection.createIndex({ createdAt: -1 });
    await notificationsCollection.createIndex({ type: 1 });
    console.log('✅ Notifications collection indexes created');

    // Payments collection indexes
    const paymentsCollection = await getCollection('payments');
    await paymentsCollection.createIndex({ userId: 1, status: 1 });
    await paymentsCollection.createIndex({ bookingId: 1 });
    await paymentsCollection.createIndex({ transactionId: 1 }, { unique: true, sparse: true });
    await paymentsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Payments collection indexes created');

    // Service Centers collection indexes
    const serviceCentersCollection = await getCollection('servicecenters');
    await serviceCentersCollection.createIndex({ location: '2dsphere' });
    await serviceCentersCollection.createIndex({ isActive: 1 });
    await serviceCentersCollection.createIndex({ rating: -1 });
    await serviceCentersCollection.createIndex({ services: 1 });
    console.log('✅ Service Centers collection indexes created');

    // Parts collection indexes
    const partsCollection = await getCollection('parts');
    await partsCollection.createIndex({ partNumber: 1 }, { unique: true });
    await partsCollection.createIndex({ category: 1, isActive: 1 });
    await partsCollection.createIndex({ brand: 1, model: 1 });
    await partsCollection.createIndex({ price: 1 });
    console.log('✅ Parts collection indexes created');

    // Analytics collection indexes
    const analyticsCollection = await getCollection('analytics');
    await analyticsCollection.createIndex({ eventType: 1, timestamp: -1 });
    await analyticsCollection.createIndex({ userId: 1, timestamp: -1 });
    await analyticsCollection.createIndex({ timestamp: -1 });
    console.log('✅ Analytics collection indexes created');

    // Fleet collection indexes
    const fleetCollection = await getCollection('fleet');
    await fleetCollection.createIndex({ organizationId: 1, isActive: 1 });
    await fleetCollection.createIndex({ vehicleId: 1 }, { unique: true });
    await fleetCollection.createIndex({ status: 1 });
    await fleetCollection.createIndex({ location: '2dsphere' });
    console.log('✅ Fleet collection indexes created');

    console.log('🎉 All database indexes created successfully!');
    console.log('📈 Performance optimization complete - Database queries will be significantly faster');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  createIndexes()
    .then(() => {
      console.log('✅ Database indexing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database indexing failed:', error);
      process.exit(1);
    });
}

module.exports = { createIndexes };
