const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const realCarTrimsData = require('../data/real-car-trims-data');

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const updateCarTrims = async () => {
  try {
    console.log('🔄 Starting car trims update with real trim levels...');
    console.log('🌟 Replacing generic trims with actual manufacturer trim levels\n');

    let totalUpdated = 0;
    let brandsProcessed = 0;

    for (const brandData of realCarTrimsData.brands) {
      console.log(`\n🏷️ Processing ${brandData.name}...`);
      
      // Find the brand in the database
      const brand = await mongoose.connection.db.collection('carbrands').findOne({ 
        name: brandData.name 
      });

      if (!brand) {
        console.log(`❌ Brand ${brandData.name} not found in database`);
        continue;
      }

      console.log(`✅ Found brand: ${brand.name}`);

      // Update each model's trims
      for (const modelData of brandData.models) {
        console.log(`  📋 Updating ${modelData.name} trims...`);
        
        // Find the model in the database
        let model = await mongoose.connection.db.collection('carmodels').findOne({
          brandId: brand._id,
          name: modelData.name
        });

        if (!model) {
          console.log(`    ⚠️ Model ${modelData.name} not found - creating new model`);
          
          // Create the missing model
          const newModel = {
            modelId: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: modelData.name,
            brandId: brand._id,
            trims: modelData.trims,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const insertResult = await mongoose.connection.db.collection('carmodels').insertOne(newModel);
          console.log(`    ✅ Created new model ${modelData.name} with ID: ${insertResult.insertedId}`);
          
          // Update the model reference for trim operations
          model = { _id: insertResult.insertedId, name: modelData.name };
        }

        // Update the model with real trims
        const updateResult = await mongoose.connection.db.collection('carmodels').updateOne(
          { _id: model._id },
          { 
            $set: { 
              trims: modelData.trims,
              updatedAt: new Date()
            }
          }
        );

        if (updateResult.modifiedCount > 0) {
          console.log(`    ✅ Updated ${modelData.name} with ${modelData.trims.length} real trims: ${modelData.trims.join(', ')}`);
          totalUpdated++;
        } else {
          console.log(`    ⚠️ No changes made to ${modelData.name}`);
        }

        // Also update any existing trims in the car_trims collection
        const existingTrims = await mongoose.connection.db.collection('cartrims').find({
          modelId: model._id
        }).toArray();

        if (existingTrims.length > 0) {
          // Delete existing generic trims
          await mongoose.connection.db.collection('cartrims').deleteMany({
            modelId: model._id
          });
          console.log(`    🗑️ Removed ${existingTrims.length} generic trims`);
        }

        // Insert new real trims
        const newTrims = modelData.trims.map((trimName, index) => ({
          trimId: `trim_${Date.now()}_${index}`,
          name: trimName,
          modelId: model._id,
          brandId: brand._id,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        if (newTrims.length > 0) {
          await mongoose.connection.db.collection('cartrims').insertMany(newTrims);
          console.log(`    ✅ Inserted ${newTrims.length} real trims`);
        }
      }

      brandsProcessed++;
    }

    console.log('\n📊 UPDATE SUMMARY:');
    console.log('==================');
    console.log(`✅ Brands processed: ${brandsProcessed}`);
    console.log(`✅ Models updated: ${totalUpdated}`);
    console.log(`✅ Total real trims added: ${realCarTrimsData.brands.reduce((total, brand) => 
      total + brand.models.reduce((modelTotal, model) => modelTotal + model.trims.length, 0), 0
    )}`);

    // Generate statistics
    console.log('\n📈 DETAILED STATISTICS:');
    console.log('========================');

    // Count trims by brand
    const brandTrimCounts = {};
    realCarTrimsData.brands.forEach(brand => {
      const totalTrims = brand.models.reduce((total, model) => total + model.trims.length, 0);
      brandTrimCounts[brand.name] = totalTrims;
    });

    console.log('\n🏷️ Trims by Brand:');
    Object.entries(brandTrimCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`  - ${brand}: ${count} trims`);
      });

    // Count models by brand
    const brandModelCounts = {};
    realCarTrimsData.brands.forEach(brand => {
      brandModelCounts[brand.name] = brand.models.length;
    });

    console.log('\n🚗 Models by Brand:');
    Object.entries(brandModelCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`  - ${brand}: ${count} models`);
      });

    // Sample real trims
    console.log('\n🔍 Sample Real Trims:');
    realCarTrimsData.brands.slice(0, 5).forEach(brand => {
      console.log(`\n${brand.name}:`);
      brand.models.slice(0, 2).forEach(model => {
        console.log(`  - ${model.name}: ${model.trims.slice(0, 3).join(', ')}${model.trims.length > 3 ? '...' : ''}`);
      });
    });

    console.log('\n🎉 Car trims update completed successfully!');
    console.log('✨ All generic trims have been replaced with real manufacturer trim levels!');
    console.log('🌟 The database now contains accurate, specific trim information!');

  } catch (error) {
    console.error('Error updating car trims:', error);
    throw error;
  }
};

const updateCarTrimsScript = async () => {
  try {
    console.log('🚀 Starting REAL CAR TRIMS UPDATE...');
    console.log('🌟 Replacing generic trims with actual manufacturer specifications\n');

    await connectDB();
    await updateCarTrims();

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during car trims update:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  updateCarTrimsScript();
}

module.exports = { 
  updateCarTrimsScript, 
  connectDB, 
  updateCarTrims 
};
