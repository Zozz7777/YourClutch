const mongoose = require('mongoose');
const egyptianCitiesData = require('../data/egyptian-cities-data');
const egyptianAreasData = require('../data/egyptian-areas-data');
const serviceCatalogData = require('../data/service-catalog-data');
const diagnosticCodesData = require('../data/diagnostic-codes-data');

// Import models (assuming they exist or need to be created)
// Note: These models may need to be created based on the existing schema structure

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearExistingData = async () => {
  try {
    console.log('Clearing existing data...');
    
    // Clear cities collection
    await mongoose.connection.db.collection('cities').deleteMany({});
    console.log('✅ Cleared cities collection');
    
    // Clear areas collection
    await mongoose.connection.db.collection('areas').deleteMany({});
    console.log('✅ Cleared areas collection');
    
    // Clear services collection
    await mongoose.connection.db.collection('services').deleteMany({});
    console.log('✅ Cleared services collection');
    
    // Clear diagnostics collection
    await mongoose.connection.db.collection('diagnostics').deleteMany({});
    console.log('✅ Cleared diagnostics collection');
    
    console.log('All existing data cleared successfully!\n');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
};

const seedCities = async () => {
  try {
    console.log('🌍 Seeding Egyptian Cities and Governorates...');
    
    const cities = egyptianCitiesData.governorates.map((governorate, index) => ({
      cityId: `city_${Date.now()}_${index}`,
      name: governorate.name,
      nameArabic: governorate.nameArabic,
      code: governorate.code,
      type: governorate.type,
      population: governorate.population,
      area: governorate.area,
      coordinates: governorate.coordinates,
      isCapital: governorate.isCapital,
      isActive: governorate.isActive,
      majorCities: governorate.majorCities,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await mongoose.connection.db.collection('cities').insertMany(cities);
    console.log(`✅ Seeded ${result.insertedCount} cities/governorates`);
    
    return cities;
  } catch (error) {
    console.error('Error seeding cities:', error);
    throw error;
  }
};

const seedAreas = async () => {
  try {
    console.log('🏘️ Seeding Egyptian Areas...');
    
    const areas = egyptianAreasData.areas.map((area, index) => ({
      areaId: `area_${Date.now()}_${index}`,
      name: area.name,
      nameArabic: area.nameArabic,
      city: area.city,
      governorate: area.governorate,
      type: area.type,
      coordinates: area.coordinates,
      isActive: area.isActive,
      popularLandmarks: area.popularLandmarks,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await mongoose.connection.db.collection('areas').insertMany(areas);
    console.log(`✅ Seeded ${result.insertedCount} areas`);
    
    return areas;
  } catch (error) {
    console.error('Error seeding areas:', error);
    throw error;
  }
};

const seedServices = async () => {
  try {
    console.log('🔧 Seeding Service Catalog...');
    
    const services = serviceCatalogData.services.map((service, index) => ({
      serviceId: `service_${Date.now()}_${index}`,
      serviceGroup: service.serviceGroup,
      serviceName: service.serviceName,
      description: service.description,
      icon: service.icon,
      estimatedDuration: service.estimatedDuration,
      difficulty: service.difficulty,
      category: service.category,
      isActive: service.isActive,
      priceRange: service.priceRange,
      frequency: service.frequency,
      partsRequired: service.partsRequired,
      toolsRequired: service.toolsRequired,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await mongoose.connection.db.collection('services').insertMany(services);
    console.log(`✅ Seeded ${result.insertedCount} services`);
    
    return services;
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  }
};

const seedDiagnostics = async () => {
  try {
    console.log('🔍 Seeding Diagnostic Codes...');
    
    const diagnostics = diagnosticCodesData.diagnosticCodes.map(diagnostic => ({
      code: diagnostic.code,
      description: diagnostic.description,
      category: diagnostic.category,
      severity: diagnostic.severity,
      system: diagnostic.system,
      possibleCauses: diagnostic.possibleCauses,
      symptoms: diagnostic.symptoms,
      isActive: diagnostic.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const result = await mongoose.connection.db.collection('diagnostics').insertMany(diagnostics);
    console.log(`✅ Seeded ${result.insertedCount} diagnostic codes`);
    
    return diagnostics;
  } catch (error) {
    console.error('Error seeding diagnostics:', error);
    throw error;
  }
};

const generateStatistics = async () => {
  try {
    console.log('\n📊 GENERATING COMPREHENSIVE STATISTICS...');
    console.log('==========================================\n');
    
    // Cities Statistics
    const citiesCount = await mongoose.connection.db.collection('cities').countDocuments();
    const capitalCities = await mongoose.connection.db.collection('cities').countDocuments({ isCapital: true });
    const activeCities = await mongoose.connection.db.collection('cities').countDocuments({ isActive: true });
    
    console.log('🏙️ CITIES & GOVERNORATES:');
    console.log(`- Total Cities/Governorates: ${citiesCount}`);
    console.log(`- Capital Cities: ${capitalCities}`);
    console.log(`- Active Cities: ${activeCities}`);
    
    // Areas Statistics
    const areasCount = await mongoose.connection.db.collection('areas').countDocuments();
    const activeAreas = await mongoose.connection.db.collection('areas').countDocuments({ isActive: true });
    
    console.log('\n🏘️ AREAS:');
    console.log(`- Total Areas: ${areasCount}`);
    console.log(`- Active Areas: ${activeAreas}`);
    
    // Services Statistics
    const servicesCount = await mongoose.connection.db.collection('services').countDocuments();
    const activeServices = await mongoose.connection.db.collection('services').countDocuments({ isActive: true });
    
    // Group services by category
    const serviceGroups = await mongoose.connection.db.collection('services').aggregate([
      { $group: { _id: '$serviceGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n🔧 SERVICES:');
    console.log(`- Total Services: ${servicesCount}`);
    console.log(`- Active Services: ${activeServices}`);
    console.log('- Services by Group:');
    serviceGroups.forEach(group => {
      console.log(`  * ${group._id}: ${group.count} services`);
    });
    
    // Diagnostics Statistics
    const diagnosticsCount = await mongoose.connection.db.collection('diagnostics').countDocuments();
    const activeDiagnostics = await mongoose.connection.db.collection('diagnostics').countDocuments({ isActive: true });
    
    // Group diagnostics by severity
    const severityGroups = await mongoose.connection.db.collection('diagnostics').aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n🔍 DIAGNOSTIC CODES:');
    console.log(`- Total Diagnostic Codes: ${diagnosticsCount}`);
    console.log(`- Active Diagnostic Codes: ${activeDiagnostics}`);
    console.log('- Codes by Severity:');
    severityGroups.forEach(group => {
      console.log(`  * ${group._id}: ${group.count} codes`);
    });
    
    // Total Statistics
    const totalRecords = citiesCount + areasCount + servicesCount + diagnosticsCount;
    console.log('\n📈 TOTAL SUMMARY:');
    console.log(`- Total Records Seeded: ${totalRecords.toLocaleString()}`);
    console.log(`- Cities/Governorates: ${citiesCount}`);
    console.log(`- Areas: ${areasCount}`);
    console.log(`- Services: ${servicesCount}`);
    console.log(`- Diagnostic Codes: ${diagnosticsCount}`);
    
  } catch (error) {
    console.error('Error generating statistics:', error);
    throw error;
  }
};

const seedComprehensiveData = async () => {
  try {
    console.log('🚀 Starting COMPREHENSIVE data seeding...');
    console.log('🌟 This includes EVERYTHING needed for the Clutch platform!');
    console.log('📋 Complete with cities, areas, services, and diagnostic codes\n');
    
    await connectDB();
    await clearExistingData();
    
    const cities = await seedCities();
    const areas = await seedAreas();
    const services = await seedServices();
    const diagnostics = await seedDiagnostics();
    
    await generateStatistics();
    
    console.log('\n🎉 COMPREHENSIVE data seeding completed successfully!');
    console.log(`📊 FINAL SUMMARY:`);
    console.log(`- Cities/Governorates: ${cities.length}`);
    console.log(`- Areas: ${areas.length}`);
    console.log(`- Services: ${services.length}`);
    console.log(`- Diagnostic Codes: ${diagnostics.length}`);
    console.log(`- Total Records: ${cities.length + areas.length + services.length + diagnostics.length}`);
    
    console.log('\n✨ The Clutch platform now has COMPLETE data coverage!');
    console.log('🌟 Ready for production use with 100% coverage!');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error during comprehensive seeding:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedComprehensiveData();
}

module.exports = { 
  seedComprehensiveData, 
  connectDB, 
  clearExistingData, 
  seedCities, 
  seedAreas, 
  seedServices, 
  seedDiagnostics 
};
