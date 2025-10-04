// Comprehensive Egyptian Cities and Governorates Data
// This file contains ALL Egyptian governorates and major cities with 100% coverage

const egyptianCitiesData = {
  governorates: [
    {
      name: 'Cairo',
      nameArabic: 'القاهرة',
      code: 'CAI',
      type: 'governorate',
      population: 10230350,
      area: 3085.1,
      coordinates: {
        latitude: 30.0444,
        longitude: 31.2357
      },
      isCapital: true,
      isActive: true,
      majorCities: [
        'Cairo', 'Giza', 'Shubra El Kheima', 'Helwan', '6th October City',
        'New Cairo', 'Badr City', 'Sheikh Zayed City', 'Obour City'
      ]
    },
    {
      name: 'Alexandria',
      nameArabic: 'الإسكندرية',
      code: 'ALX',
      type: 'governorate',
      population: 5216718,
      area: 2679.0,
      coordinates: {
        latitude: 31.2001,
        longitude: 29.9187
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Alexandria', 'Borg El Arab', 'New Borg El Arab'
      ]
    },
    {
      name: 'Giza',
      nameArabic: 'الجيزة',
      code: 'GIZ',
      type: 'governorate',
      population: 9042000,
      area: 85153.0,
      coordinates: {
        latitude: 30.0131,
        longitude: 31.2089
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Giza', '6th October City', 'Sheikh Zayed City', 'Badr City',
        'New Sphinx City', 'New Minya City'
      ]
    },
    {
      name: 'Luxor',
      nameArabic: 'الأقصر',
      code: 'LXR',
      type: 'governorate',
      population: 1324000,
      area: 2409.0,
      coordinates: {
        latitude: 25.6872,
        longitude: 32.6396
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Luxor', 'Esna', 'Armant', 'Tod', 'El Qurna'
      ]
    },
    {
      name: 'Aswan',
      nameArabic: 'أسوان',
      code: 'ASW',
      type: 'governorate',
      population: 1520000,
      area: 67926.0,
      coordinates: {
        latitude: 24.0889,
        longitude: 32.8998
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Aswan', 'Kom Ombo', 'Edfu', 'Abu Simbel', 'New Aswan'
      ]
    },
    {
      name: 'Red Sea',
      nameArabic: 'البحر الأحمر',
      code: 'RSE',
      type: 'governorate',
      population: 366000,
      area: 119099.0,
      coordinates: {
        latitude: 25.5,
        longitude: 33.0
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Hurghada', 'Sharm El Sheikh', 'Dahab', 'Marsa Alam', 'El Gouna',
        'Safaga', 'Quseir', 'Ras Ghareb'
      ]
    },
    {
      name: 'South Sinai',
      nameArabic: 'جنوب سيناء',
      code: 'SIN',
      type: 'governorate',
      population: 108000,
      area: 33140.0,
      coordinates: {
        latitude: 28.5,
        longitude: 33.0
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Sharm El Sheikh', 'Dahab', 'Nuweiba', 'Taba', 'Saint Catherine'
      ]
    },
    {
      name: 'North Sinai',
      nameArabic: 'شمال سيناء',
      code: 'NSI',
      type: 'governorate',
      population: 450000,
      area: 27574.0,
      coordinates: {
        latitude: 30.5,
        longitude: 33.0
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'El Arish', 'Rafah', 'Sheikh Zuweid', 'Bir Al Abd'
      ]
    },
    {
      name: 'Suez',
      nameArabic: 'السويس',
      code: 'SUZ',
      type: 'governorate',
      population: 750000,
      area: 9002.0,
      coordinates: {
        latitude: 29.9668,
        longitude: 32.5498
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Suez', 'Port Tawfiq', 'Ataqa'
      ]
    },
    {
      name: 'Ismailia',
      nameArabic: 'الإسماعيلية',
      code: 'ISM',
      type: 'governorate',
      population: 1350000,
      area: 5067.0,
      coordinates: {
        latitude: 30.6043,
        longitude: 32.2723
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Ismailia', 'Fayed', 'Qantara', 'New Ismailia'
      ]
    },
    {
      name: 'Port Said',
      nameArabic: 'بورسعيد',
      code: 'PTS',
      type: 'governorate',
      population: 750000,
      area: 1351.0,
      coordinates: {
        latitude: 31.2653,
        longitude: 32.3019
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Port Said', 'Port Fuad', 'New Port Said'
      ]
    },
    {
      name: 'Damietta',
      nameArabic: 'دمياط',
      code: 'DAM',
      type: 'governorate',
      population: 1400000,
      area: 910.0,
      coordinates: {
        latitude: 31.4165,
        longitude: 31.8133
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Damietta', 'Ras El Bar', 'New Damietta', 'Kafr Saad'
      ]
    },
    {
      name: 'Kafr El Sheikh',
      nameArabic: 'كفر الشيخ',
      code: 'KFS',
      type: 'governorate',
      population: 3400000,
      area: 3467.0,
      coordinates: {
        latitude: 31.3085,
        longitude: 30.8039
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Kafr El Sheikh', 'Desouk', 'Fuwa', 'Bila', 'Qallin'
      ]
    },
    {
      name: 'Gharbia',
      nameArabic: 'الغربية',
      code: 'GHB',
      type: 'governorate',
      population: 5200000,
      area: 1942.0,
      coordinates: {
        latitude: 30.8753,
        longitude: 31.0335
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Tanta', 'Mahalla El Kubra', 'Kafr El Zayat', 'Zefta', 'Basyoun'
      ]
    },
    {
      name: 'Dakahlia',
      nameArabic: 'الدقهلية',
      code: 'DAK',
      type: 'governorate',
      population: 6500000,
      area: 3538.0,
      coordinates: {
        latitude: 31.0409,
        longitude: 31.3785
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Mansoura', 'Talkha', 'Mit Ghamr', 'Aga', 'Dekernes'
      ]
    },
    {
      name: 'Sharqia',
      nameArabic: 'الشرقية',
      code: 'SHR',
      type: 'governorate',
      population: 7500000,
      area: 4911.0,
      coordinates: {
        latitude: 30.5872,
        longitude: 31.5022
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Zagazig', '10th of Ramadan City', 'Belbeis', 'Abu Hammad', 'Minya El Qamh'
      ]
    },
    {
      name: 'Qalyubia',
      nameArabic: 'القليوبية',
      code: 'QLY',
      type: 'governorate',
      population: 5800000,
      area: 1001.0,
      coordinates: {
        latitude: 30.4167,
        longitude: 31.2167
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Benha', 'Qalyub', 'Shubra El Kheima', 'Khanka', 'Kafr Shukr'
      ]
    },
    {
      name: 'Monufia',
      nameArabic: 'المنوفية',
      code: 'MNF',
      type: 'governorate',
      population: 4500000,
      area: 1662.0,
      coordinates: {
        latitude: 30.4667,
        longitude: 30.9333
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Shibin El Kom', 'Menouf', 'Quesna', 'Sers El Layan', 'Tala'
      ]
    },
    {
      name: 'Beheira',
      nameArabic: 'البحيرة',
      code: 'BEH',
      type: 'governorate',
      population: 6500000,
      area: 9826.0,
      coordinates: {
        latitude: 30.4667,
        longitude: 30.1833
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Damanhur', 'Kafr El Dawwar', 'Rashid', 'Abu El Matamir', 'Hosh Essa'
      ]
    },
    {
      name: 'Minya',
      nameArabic: 'المنيا',
      code: 'MNY',
      type: 'governorate',
      population: 5800000,
      area: 32279.0,
      coordinates: {
        latitude: 28.1099,
        longitude: 30.7503
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Minya', 'New Minya', 'Malawi', 'Abu Qurqas', 'Maghagha'
      ]
    },
    {
      name: 'Asyut',
      nameArabic: 'أسيوط',
      code: 'ASY',
      type: 'governorate',
      population: 4500000,
      area: 25926.0,
      coordinates: {
        latitude: 27.1828,
        longitude: 31.1828
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Asyut', 'New Asyut', 'Abnub', 'El Qusiya', 'Manfalut'
      ]
    },
    {
      name: 'Sohag',
      nameArabic: 'سوهاج',
      code: 'SOH',
      type: 'governorate',
      population: 5000000,
      area: 11022.0,
      coordinates: {
        latitude: 26.5569,
        longitude: 31.6947
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Sohag', 'New Sohag', 'Akhmim', 'Girga', 'Tima'
      ]
    },
    {
      name: 'Qena',
      nameArabic: 'قنا',
      code: 'QEN',
      type: 'governorate',
      population: 3200000,
      area: 1851.0,
      coordinates: {
        latitude: 26.1667,
        longitude: 32.7167
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Qena', 'New Qena', 'Nag Hammadi', 'Dishna', 'Farshut'
      ]
    },
    {
      name: 'New Valley',
      nameArabic: 'الوادي الجديد',
      code: 'NWV',
      type: 'governorate',
      population: 250000,
      area: 440098.0,
      coordinates: {
        latitude: 25.5,
        longitude: 30.0
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Kharga', 'Dakhla', 'Farafra', 'Balat', 'Mut'
      ]
    },
    {
      name: 'Matrouh',
      nameArabic: 'مطروح',
      code: 'MTR',
      type: 'governorate',
      population: 500000,
      area: 166563.0,
      coordinates: {
        latitude: 31.35,
        longitude: 27.2333
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Mersa Matruh', 'El Alamein', 'Siwa', 'Sallum', 'El Dabaa'
      ]
    },
    {
      name: 'Beni Suef',
      nameArabic: 'بني سويف',
      code: 'BNS',
      type: 'governorate',
      population: 3200000,
      area: 10954.0,
      coordinates: {
        latitude: 29.0667,
        longitude: 31.0833
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Beni Suef', 'New Beni Suef', 'El Fashn', 'Biba', 'Samasta'
      ]
    },
    {
      name: 'Fayoum',
      nameArabic: 'الفيوم',
      code: 'FAY',
      type: 'governorate',
      population: 3800000,
      area: 6068.0,
      coordinates: {
        latitude: 29.3081,
        longitude: 30.8428
      },
      isCapital: false,
      isActive: true,
      majorCities: [
        'Fayoum', 'New Fayoum', 'Tamiya', 'Sinnuris', 'Ibshaway'
      ]
    }
  ]
};

module.exports = egyptianCitiesData;
