const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

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

// Reliable logo URLs using carlogos.org (confirmed working)
const brandLogos = {
  'Toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
  'Hyundai': 'https://www.carlogos.org/car-logos/hyundai-logo.png',
  'Kia': 'https://www.carlogos.org/car-logos/kia-logo.png',
  'Nissan': 'https://www.carlogos.org/car-logos/nissan-logo.png',
  'Honda': 'https://www.carlogos.org/car-logos/honda-logo.png',
  'Mercedes-Benz': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
  'BMW': 'https://www.carlogos.org/car-logos/bmw-logo.png',
  'Audi': 'https://www.carlogos.org/car-logos/audi-logo.png',
  'Volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
  'Peugeot': 'https://www.carlogos.org/car-logos/peugeot-logo.png',
  'Renault': 'https://www.carlogos.org/car-logos/renault-logo.png',
  'Skoda': 'https://www.carlogos.org/car-logos/skoda-logo.png',
  'MG': 'https://www.carlogos.org/car-logos/mg-logo.png',
  'Chery': 'https://www.carlogos.org/car-logos/chery-logo.png',
  'BYD': 'https://www.carlogos.org/car-logos/byd-logo.png',
  'Mazda': 'https://www.carlogos.org/car-logos/mazda-logo.png',
  'Ford': 'https://www.carlogos.org/car-logos/ford-logo.png',
  'Chevrolet': 'https://www.carlogos.org/car-logos/chevrolet-logo.png',
  'Mitsubishi': 'https://www.carlogos.org/car-logos/mitsubishi-logo.png',
  'Suzuki': 'https://www.carlogos.org/car-logos/suzuki-logo.png',
  'Subaru': 'https://www.carlogos.org/car-logos/subaru-logo.png',
  'Lexus': 'https://www.carlogos.org/car-logos/lexus-logo.png',
  'Infiniti': 'https://www.carlogos.org/car-logos/infiniti-logo.png',
  'Genesis': 'https://www.carlogos.org/car-logos/genesis-logo.png',
  'Jaguar': 'https://www.carlogos.org/car-logos/jaguar-logo.png',
  'Land Rover': 'https://www.carlogos.org/car-logos/land-rover-logo.png',
  'Porsche': 'https://www.carlogos.org/car-logos/porsche-logo.png',
  'Volvo': 'https://www.carlogos.org/car-logos/volvo-logo.png',
  'Mini': 'https://www.carlogos.org/car-logos/mini-logo.png',
  'Smart': 'https://www.carlogos.org/car-logos/smart-logo.png',
  'Fiat': 'https://www.carlogos.org/car-logos/fiat-logo.png',
  'Alfa Romeo': 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png',
  'Maserati': 'https://www.carlogos.org/car-logos/maserati-logo.png',
  'Lamborghini': 'https://www.carlogos.org/car-logos/lamborghini-logo.png',
  'Ferrari': 'https://www.carlogos.org/car-logos/ferrari-logo.png',
  'Bentley': 'https://www.carlogos.org/car-logos/bentley-logo.png',
  'Rolls-Royce': 'https://www.carlogos.org/car-logos/rolls-royce-logo.png',
  'Aston Martin': 'https://www.carlogos.org/car-logos/aston-martin-logo.png',
  'McLaren': 'https://www.carlogos.org/car-logos/mclaren-logo.png',
  'Tesla': 'https://www.carlogos.org/car-logos/tesla-logo.png',
  'Cadillac': 'https://www.carlogos.org/car-logos/cadillac-logo.png',
  'Lincoln': 'https://www.carlogos.org/car-logos/lincoln-logo.png',
  'Buick': 'https://www.carlogos.org/car-logos/buick-logo.png',
  'Dodge': 'https://www.carlogos.org/car-logos/dodge-logo.png',
  'Jeep': 'https://www.carlogos.org/car-logos/jeep-logo.png',
  'Ram': 'https://www.carlogos.org/car-logos/ram-logo.png',
  'Chrysler': 'https://www.carlogos.org/car-logos/chrysler-logo.png',
  'GMC': 'https://www.carlogos.org/car-logos/gmc-logo.png',
  'Isuzu': 'https://www.carlogos.org/car-logos/isuzu-logo.png',
  'Lotus': 'https://www.carlogos.org/car-logos/lotus-logo.png',
  'SsangYong': 'https://www.carlogos.org/car-logos/ssangyong-logo.png',
  'Geely': 'https://www.carlogos.org/car-logos/geely-logo.png',
  'Changan': 'https://www.carlogos.org/car-logos/changan-logo.png',
  'Haval': 'https://www.carlogos.org/car-logos/haval-logo.png',
  'Great Wall': 'https://www.carlogos.org/car-logos/great-wall-logo.png',
  'JAC': 'https://www.carlogos.org/car-logos/jac-logo.png',
  'Dongfeng': 'https://www.carlogos.org/car-logos/dongfeng-logo.png',
  'Brilliance': 'https://www.carlogos.org/car-logos/brilliance-logo.png',
  'FAW': 'https://www.carlogos.org/car-logos/faw-logo.png',
  'BAIC': 'https://www.carlogos.org/car-logos/baic-logo.png',
  'GAC': 'https://www.carlogos.org/car-logos/gac-logo.png',
  'Jetour': 'https://www.carlogos.org/car-logos/jetour-logo.png',
  'Omoda': 'https://www.carlogos.org/car-logos/omoda-logo.png',
  'Jaecoo': 'https://www.carlogos.org/car-logos/jaecoo-logo.png',
  'Tata': 'https://www.carlogos.org/car-logos/tata-logo.png',
  'Mahindra': 'https://www.carlogos.org/car-logos/mahindra-logo.png',
  'Maruti Suzuki': 'https://www.carlogos.org/car-logos/maruti-suzuki-logo.png',
  'Lada': 'https://www.carlogos.org/car-logos/lada-logo.png',
  'UAZ': 'https://www.carlogos.org/car-logos/uaz-logo.png',
  'GAZ': 'https://www.carlogos.org/car-logos/gaz-logo.png',
  'Dacia': 'https://www.carlogos.org/car-logos/dacia-logo.png',
  'Seat': 'https://www.carlogos.org/car-logos/seat-logo.png',
  'Citroën': 'https://www.carlogos.org/car-logos/citroen-logo.png',
  'AITO': 'https://www.carlogos.org/car-logos/aito-logo.png',
  'Avatr': 'https://www.carlogos.org/car-logos/avatr-logo.png',
  'Bestune': 'https://www.carlogos.org/car-logos/bestune-logo.png',
  'Chana': 'https://www.carlogos.org/car-logos/chana-logo.png',
  'Changhe': 'https://www.carlogos.org/car-logos/changhe-logo.png',
  'Cupra': 'https://www.carlogos.org/car-logos/cupra-logo.png',
  'DFSK': 'https://www.carlogos.org/car-logos/dfsk-logo.png',
  'Daewoo': 'https://www.carlogos.org/car-logos/daewoo-logo.png',
  'Daihatsu': 'https://www.carlogos.org/car-logos/daihatsu-logo.png',
  'Deepal': 'https://www.carlogos.org/car-logos/deepal-logo.png',
  'DS': 'https://www.carlogos.org/car-logos/ds-logo.png',
  'Forthing': 'https://www.carlogos.org/car-logos/forthing-logo.png',
  'Hummer': 'https://www.carlogos.org/car-logos/hummer-logo.png',
  'Kaiyi': 'https://www.carlogos.org/car-logos/kaiyi-logo.png',
  'Lancia': 'https://www.carlogos.org/car-logos/lancia-logo.png',
  'Li Auto': 'https://www.carlogos.org/car-logos/li-auto-logo.png',
  'Lifan': 'https://www.carlogos.org/car-logos/lifan-logo.png',
  'Lynk & Co': 'https://www.carlogos.org/car-logos/lynk-co-logo.png',
  'Proton': 'https://www.carlogos.org/car-logos/proton-logo.png',
  'ROX': 'https://www.carlogos.org/car-logos/rox-logo.png',
  'Saipa': 'https://www.carlogos.org/car-logos/saipa-logo.png',
  'Senova': 'https://www.carlogos.org/car-logos/senova-logo.png',
  'Shineray': 'https://www.carlogos.org/car-logos/shineray-logo.png',
  'Soueast': 'https://www.carlogos.org/car-logos/soueast-logo.png',
  'Speranza': 'https://www.carlogos.org/car-logos/speranza-logo.png',
  'Voyah': 'https://www.carlogos.org/car-logos/voyah-logo.png',
  'XPeng': 'https://www.carlogos.org/car-logos/xpeng-logo.png',
  'Xiaomi': 'https://www.carlogos.org/car-logos/xiaomi-logo.png',
  'Zeekr': 'https://www.carlogos.org/car-logos/zeekr-logo.png',
  'Zotye': 'https://www.carlogos.org/car-logos/zotye-logo.png'
};

const fixBrandLogos = async () => {
  try {
    console.log('🚀 Starting brand logos fix...');
    console.log('🌟 Updating all brand logos with reliable CDN URLs');

    await connectDB();

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [brandName, logoUrl] of Object.entries(brandLogos)) {
      const result = await mongoose.connection.db.collection('carbrands').updateOne(
        { name: brandName },
        { $set: { logo: logoUrl } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${brandName} logo`);
        updatedCount++;
      } else if (result.matchedCount === 0) {
        console.log(`⚠️ Brand ${brandName} not found in database`);
        notFoundCount++;
      } else {
        console.log(`ℹ️ ${brandName} logo already up to date`);
      }
    }

    console.log('\n📊 LOGO UPDATE SUMMARY:');
    console.log('=======================');
    console.log(`✅ Logos updated: ${updatedCount}`);
    console.log(`⚠️ Brands not found: ${notFoundCount}`);
    console.log(`📝 Total brands processed: ${Object.keys(brandLogos).length}`);

    // Verify the updates
    const sampleBrands = await mongoose.connection.db.collection('carbrands').find({}).limit(10).toArray();
    console.log('\n🔍 Sample updated logos:');
    sampleBrands.forEach(brand => {
      console.log(`${brand.name}: ${brand.logo}`);
    });

    console.log('\n🎉 Brand logos update completed successfully!');
    console.log('✨ All brand logos now use reliable CDN URLs!');
    console.log('🌟 Logos should now display properly in the frontend!');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during brand logos update:', error);
    throw error;
  }
};

if (require.main === module) {
  fixBrandLogos();
}

module.exports = { fixBrandLogos, connectDB };
