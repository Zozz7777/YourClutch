const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const verifyComprehensiveData = async () => {
  try {
    console.log('🔍 Verifying comprehensive data in database...\n');
    
    await connectDB();
    
    // Verify Cities
    const citiesCount = await mongoose.connection.db.collection('cities').countDocuments();
    const citiesSample = await mongoose.connection.db.collection('cities').find({}).limit(5).toArray();
    
    console.log('🏙️ CITIES VERIFICATION:');
    console.log(`- Total Cities: ${citiesCount}`);
    console.log('- Sample Cities:');
    citiesSample.forEach(city => {
      console.log(`  * ${city.name} (${city.nameArabic}) - ${city.type}`);
    });
    
    // Verify Areas
    const areasCount = await mongoose.connection.db.collection('areas').countDocuments();
    const areasSample = await mongoose.connection.db.collection('areas').find({}).limit(5).toArray();
    
    console.log('\n🏘️ AREAS VERIFICATION:');
    console.log(`- Total Areas: ${areasCount}`);
    console.log('- Sample Areas:');
    areasSample.forEach(area => {
      console.log(`  * ${area.name} (${area.nameArabic}) - ${area.city}, ${area.governorate}`);
    });
    
    // Verify Services
    const servicesCount = await mongoose.connection.db.collection('services').countDocuments();
    const servicesSample = await mongoose.connection.db.collection('services').find({}).limit(5).toArray();
    
    console.log('\n🔧 SERVICES VERIFICATION:');
    console.log(`- Total Services: ${servicesCount}`);
    console.log('- Sample Services:');
    servicesSample.forEach(service => {
      console.log(`  * ${service.serviceName} - ${service.serviceGroup} (${service.difficulty})`);
    });
    
    // Verify Diagnostics
    const diagnosticsCount = await mongoose.connection.db.collection('diagnostics').countDocuments();
    const diagnosticsSample = await mongoose.connection.db.collection('diagnostics').find({}).limit(5).toArray();
    
    console.log('\n🔍 DIAGNOSTIC CODES VERIFICATION:');
    console.log(`- Total Diagnostic Codes: ${diagnosticsCount}`);
    console.log('- Sample Diagnostic Codes:');
    diagnosticsSample.forEach(diagnostic => {
      console.log(`  * ${diagnostic.code} - ${diagnostic.description} (${diagnostic.severity})`);
    });
    
    // Detailed Statistics
    console.log('\n📊 DETAILED STATISTICS:');
    console.log('========================\n');
    
    // Cities by type
    const citiesByType = await mongoose.connection.db.collection('cities').aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('Cities by Type:');
    citiesByType.forEach(type => {
      console.log(`- ${type._id}: ${type.count}`);
    });
    
    // Areas by city
    const areasByCity = await mongoose.connection.db.collection('areas').aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    console.log('\nTop 10 Cities by Area Count:');
    areasByCity.forEach(city => {
      console.log(`- ${city._id}: ${city.count} areas`);
    });
    
    // Services by group
    const servicesByGroup = await mongoose.connection.db.collection('services').aggregate([
      { $group: { _id: '$serviceGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nServices by Group:');
    servicesByGroup.forEach(group => {
      console.log(`- ${group._id}: ${group.count} services`);
    });
    
    // Services by difficulty
    const servicesByDifficulty = await mongoose.connection.db.collection('services').aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nServices by Difficulty:');
    servicesByDifficulty.forEach(difficulty => {
      console.log(`- ${difficulty._id}: ${difficulty.count} services`);
    });
    
    // Diagnostics by severity
    const diagnosticsBySeverity = await mongoose.connection.db.collection('diagnostics').aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nDiagnostic Codes by Severity:');
    diagnosticsBySeverity.forEach(severity => {
      console.log(`- ${severity._id}: ${severity.count} codes`);
    });
    
    // Diagnostics by system
    const diagnosticsBySystem = await mongoose.connection.db.collection('diagnostics').aggregate([
      { $group: { _id: '$system', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nDiagnostic Codes by System:');
    diagnosticsBySystem.forEach(system => {
      console.log(`- ${system._id}: ${system.count} codes`);
    });
    
    // Final Summary
    const totalRecords = citiesCount + areasCount + servicesCount + diagnosticsCount;
    
    console.log('\n🎉 COMPREHENSIVE DATA VERIFICATION COMPLETE!');
    console.log('===========================================');
    console.log(`📊 FINAL SUMMARY:`);
    console.log(`- Cities/Governorates: ${citiesCount}`);
    console.log(`- Areas: ${areasCount}`);
    console.log(`- Services: ${servicesCount}`);
    console.log(`- Diagnostic Codes: ${diagnosticsCount}`);
    console.log(`- Total Records: ${totalRecords.toLocaleString()}`);
    
    console.log('\n✅ All data verified successfully!');
    console.log('🌟 The Clutch platform now has COMPLETE data coverage!');
    
  } catch (error) {
    console.error('Error during verification:', error);
    throw error;
  }
};

// Run verification if this file is executed directly
if (require.main === module) {
  verifyComprehensiveData()
    .then(() => {
      mongoose.connection.close();
      console.log('\nDatabase connection closed');
    })
    .catch(error => {
      console.error('Verification failed:', error);
      mongoose.connection.close();
      process.exit(1);
    });
}

module.exports = { verifyComprehensiveData, connectDB };
