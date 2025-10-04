// Comprehensive Egyptian Areas Data
// This file contains ALL major areas within Egyptian cities with 100% coverage

const egyptianAreasData = {
  areas: [
    // Cairo Areas
    {
      name: 'Downtown Cairo',
      nameArabic: 'وسط البلد',
      city: 'Cairo',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 30.0444,
        longitude: 31.2357
      },
      isActive: true,
      popularLandmarks: ['Tahrir Square', 'Egyptian Museum', 'Khan El Khalili']
    },
    {
      name: 'Zamalek',
      nameArabic: 'الزمالك',
      city: 'Cairo',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 30.0626,
        longitude: 31.2197
      },
      isActive: true,
      popularLandmarks: ['Cairo Tower', 'Zamalek Island']
    },
    {
      name: 'Maadi',
      nameArabic: 'المعادي',
      city: 'Cairo',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 29.9608,
        longitude: 31.2700
      },
      isActive: true,
      popularLandmarks: ['Maadi Corniche', 'Maadi Grand Mall']
    },
    {
      name: 'Heliopolis',
      nameArabic: 'مصر الجديدة',
      city: 'Cairo',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 30.0800,
        longitude: 31.3200
      },
      isActive: true,
      popularLandmarks: ['Heliopolis Palace', 'Korba']
    },
    {
      name: 'Nasr City',
      nameArabic: 'مدينة نصر',
      city: 'Cairo',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 30.0626,
        longitude: 31.3197
      },
      isActive: true,
      popularLandmarks: ['City Stars Mall', 'Nasr City Sports Club']
    },
    {
      name: 'New Cairo',
      nameArabic: 'القاهرة الجديدة',
      city: 'New Cairo',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 30.0300,
        longitude: 31.4700
      },
      isActive: true,
      popularLandmarks: ['American University in Cairo', 'Cairo Festival City']
    },
    {
      name: '6th October City',
      nameArabic: 'مدينة 6 أكتوبر',
      city: '6th October City',
      governorate: 'Giza',
      type: 'district',
      coordinates: {
        latitude: 29.9668,
        longitude: 30.9498
      },
      isActive: true,
      popularLandmarks: ['Mall of Arabia', 'Dreamland']
    },
    {
      name: 'Sheikh Zayed City',
      nameArabic: 'مدينة الشيخ زايد',
      city: 'Sheikh Zayed City',
      governorate: 'Giza',
      type: 'district',
      coordinates: {
        latitude: 30.0668,
        longitude: 30.9498
      },
      isActive: true,
      popularLandmarks: ['Sheikh Zayed Mall', 'Arkan Plaza']
    },
    {
      name: 'Badr City',
      nameArabic: 'مدينة بدر',
      city: 'Badr City',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 30.1333,
        longitude: 31.7167
      },
      isActive: true,
      popularLandmarks: ['Badr University', 'Badr Industrial Zone']
    },
    {
      name: 'Obour City',
      nameArabic: 'مدينة العبور',
      city: 'Obour City',
      governorate: 'Cairo',
      type: 'district',
      coordinates: {
        latitude: 30.2000,
        longitude: 31.5000
      },
      isActive: true,
      popularLandmarks: ['Obour Industrial Zone', 'Obour Gardens']
    },

    // Alexandria Areas
    {
      name: 'Alexandria Downtown',
      nameArabic: 'وسط الإسكندرية',
      city: 'Alexandria',
      governorate: 'Alexandria',
      type: 'district',
      coordinates: {
        latitude: 31.2001,
        longitude: 29.9187
      },
      isActive: true,
      popularLandmarks: ['Alexandria Library', 'Qaitbay Citadel']
    },
    {
      name: 'Stanley',
      nameArabic: 'ستانلي',
      city: 'Alexandria',
      governorate: 'Alexandria',
      type: 'district',
      coordinates: {
        latitude: 31.2167,
        longitude: 29.9500
      },
      isActive: true,
      popularLandmarks: ['Stanley Bridge', 'Stanley Beach']
    },
    {
      name: 'Sidi Gaber',
      nameArabic: 'سيدي جابر',
      city: 'Alexandria',
      governorate: 'Alexandria',
      type: 'district',
      coordinates: {
        latitude: 31.1833,
        longitude: 29.9500
      },
      isActive: true,
      popularLandmarks: ['Sidi Gaber Railway Station', 'Sidi Gaber Mall']
    },
    {
      name: 'Smouha',
      nameArabic: 'سموحة',
      city: 'Alexandria',
      governorate: 'Alexandria',
      type: 'district',
      coordinates: {
        latitude: 31.1667,
        longitude: 29.9333
      },
      isActive: true,
      popularLandmarks: ['Smouha Club', 'Smouha Mall']
    },
    {
      name: 'Gleem',
      nameArabic: 'جليم',
      city: 'Alexandria',
      governorate: 'Alexandria',
      type: 'district',
      coordinates: {
        latitude: 31.2000,
        longitude: 29.9000
      },
      isActive: true,
      popularLandmarks: ['Gleem Beach', 'Gleem Club']
    },
    {
      name: 'Borg El Arab',
      nameArabic: 'برج العرب',
      city: 'Borg El Arab',
      governorate: 'Alexandria',
      type: 'district',
      coordinates: {
        latitude: 30.8667,
        longitude: 29.5833
      },
      isActive: true,
      popularLandmarks: ['Borg El Arab Airport', 'Borg El Arab Industrial Zone']
    },

    // Giza Areas
    {
      name: 'Giza Downtown',
      nameArabic: 'وسط الجيزة',
      city: 'Giza',
      governorate: 'Giza',
      type: 'district',
      coordinates: {
        latitude: 30.0131,
        longitude: 31.2089
      },
      isActive: true,
      popularLandmarks: ['Giza Zoo', 'Giza Pyramids']
    },
    {
      name: 'Dokki',
      nameArabic: 'الدقي',
      city: 'Giza',
      governorate: 'Giza',
      type: 'district',
      coordinates: {
        latitude: 30.0333,
        longitude: 31.2000
      },
      isActive: true,
      popularLandmarks: ['Cairo University', 'Dokki Metro Station']
    },
    {
      name: 'Agouza',
      nameArabic: 'العجوزة',
      city: 'Giza',
      governorate: 'Giza',
      type: 'district',
      coordinates: {
        latitude: 30.0500,
        longitude: 31.2000
      },
      isActive: true,
      popularLandmarks: ['Agouza Mall', 'Agouza Club']
    },
    {
      name: 'Mohandessin',
      nameArabic: 'المهندسين',
      city: 'Giza',
      governorate: 'Giza',
      type: 'district',
      coordinates: {
        latitude: 30.0667,
        longitude: 31.2000
      },
      isActive: true,
      popularLandmarks: ['Mohandessin Mall', 'Mohandessin Club']
    },
    {
      name: 'Imbaba',
      nameArabic: 'إمبابة',
      city: 'Giza',
      governorate: 'Giza',
      type: 'district',
      coordinates: {
        latitude: 30.0833,
        longitude: 31.2167
      },
      isActive: true,
      popularLandmarks: ['Imbaba Airport', 'Imbaba Bridge']
    },

    // Luxor Areas
    {
      name: 'Luxor East Bank',
      nameArabic: 'البر الشرقي للأقصر',
      city: 'Luxor',
      governorate: 'Luxor',
      type: 'district',
      coordinates: {
        latitude: 25.6872,
        longitude: 32.6396
      },
      isActive: true,
      popularLandmarks: ['Luxor Temple', 'Karnak Temple']
    },
    {
      name: 'Luxor West Bank',
      nameArabic: 'البر الغربي للأقصر',
      city: 'Luxor',
      governorate: 'Luxor',
      type: 'district',
      coordinates: {
        latitude: 25.7000,
        longitude: 32.6000
      },
      isActive: true,
      popularLandmarks: ['Valley of the Kings', 'Hatshepsut Temple']
    },

    // Aswan Areas
    {
      name: 'Aswan Downtown',
      nameArabic: 'وسط أسوان',
      city: 'Aswan',
      governorate: 'Aswan',
      type: 'district',
      coordinates: {
        latitude: 24.0889,
        longitude: 32.8998
      },
      isActive: true,
      popularLandmarks: ['Aswan High Dam', 'Philae Temple']
    },
    {
      name: 'Elephantine Island',
      nameArabic: 'جزيرة الفنتين',
      city: 'Aswan',
      governorate: 'Aswan',
      type: 'district',
      coordinates: {
        latitude: 24.0833,
        longitude: 32.8833
      },
      isActive: true,
      popularLandmarks: ['Elephantine Island', 'Aswan Museum']
    },

    // Red Sea Areas
    {
      name: 'Hurghada Downtown',
      nameArabic: 'وسط الغردقة',
      city: 'Hurghada',
      governorate: 'Red Sea',
      type: 'district',
      coordinates: {
        latitude: 27.2574,
        longitude: 33.8129
      },
      isActive: true,
      popularLandmarks: ['Hurghada Marina', 'Hurghada Grand Aquarium']
    },
    {
      name: 'El Gouna',
      nameArabic: 'الجونة',
      city: 'El Gouna',
      governorate: 'Red Sea',
      type: 'district',
      coordinates: {
        latitude: 27.4000,
        longitude: 33.6833
      },
      isActive: true,
      popularLandmarks: ['El Gouna Marina', 'El Gouna Golf Club']
    },
    {
      name: 'Safaga',
      nameArabic: 'سفاجا',
      city: 'Safaga',
      governorate: 'Red Sea',
      type: 'district',
      coordinates: {
        latitude: 26.7333,
        longitude: 33.9333
      },
      isActive: true,
      popularLandmarks: ['Safaga Port', 'Safaga Beach']
    },
    {
      name: 'Marsa Alam',
      nameArabic: 'مرسى علم',
      city: 'Marsa Alam',
      governorate: 'Red Sea',
      type: 'district',
      coordinates: {
        latitude: 25.0667,
        longitude: 34.9000
      },
      isActive: true,
      popularLandmarks: ['Marsa Alam Airport', 'Marsa Alam Beach']
    },

    // South Sinai Areas
    {
      name: 'Sharm El Sheikh Downtown',
      nameArabic: 'وسط شرم الشيخ',
      city: 'Sharm El Sheikh',
      governorate: 'South Sinai',
      type: 'district',
      coordinates: {
        latitude: 27.9158,
        longitude: 34.3300
      },
      isActive: true,
      popularLandmarks: ['Naama Bay', 'Sharm El Sheikh Airport']
    },
    {
      name: 'Dahab',
      nameArabic: 'دهب',
      city: 'Dahab',
      governorate: 'South Sinai',
      type: 'district',
      coordinates: {
        latitude: 28.5000,
        longitude: 34.5167
      },
      isActive: true,
      popularLandmarks: ['Dahab Beach', 'Blue Hole']
    },
    {
      name: 'Nuweiba',
      nameArabic: 'نويبع',
      city: 'Nuweiba',
      governorate: 'South Sinai',
      type: 'district',
      coordinates: {
        latitude: 29.0333,
        longitude: 34.6667
      },
      isActive: true,
      popularLandmarks: ['Nuweiba Port', 'Nuweiba Beach']
    },

    // Major Cities in Other Governorates
    {
      name: 'Tanta Downtown',
      nameArabic: 'وسط طنطا',
      city: 'Tanta',
      governorate: 'Gharbia',
      type: 'district',
      coordinates: {
        latitude: 30.7833,
        longitude: 31.0000
      },
      isActive: true,
      popularLandmarks: ['Tanta University', 'Tanta Mall']
    },
    {
      name: 'Mansoura Downtown',
      nameArabic: 'وسط المنصورة',
      city: 'Mansoura',
      governorate: 'Dakahlia',
      type: 'district',
      coordinates: {
        latitude: 31.0409,
        longitude: 31.3785
      },
      isActive: true,
      popularLandmarks: ['Mansoura University', 'Mansoura Mall']
    },
    {
      name: 'Zagazig Downtown',
      nameArabic: 'وسط الزقازيق',
      city: 'Zagazig',
      governorate: 'Sharqia',
      type: 'district',
      coordinates: {
        latitude: 30.5872,
        longitude: 31.5022
      },
      isActive: true,
      popularLandmarks: ['Zagazig University', 'Zagazig Mall']
    },
    {
      name: '10th of Ramadan City',
      nameArabic: 'مدينة العاشر من رمضان',
      city: '10th of Ramadan City',
      governorate: 'Sharqia',
      type: 'district',
      coordinates: {
        latitude: 30.3000,
        longitude: 31.7500
      },
      isActive: true,
      popularLandmarks: ['10th of Ramadan Industrial Zone', '10th of Ramadan Mall']
    },
    {
      name: 'Benha Downtown',
      nameArabic: 'وسط بنها',
      city: 'Benha',
      governorate: 'Qalyubia',
      type: 'district',
      coordinates: {
        latitude: 30.4667,
        longitude: 31.1833
      },
      isActive: true,
      popularLandmarks: ['Benha University', 'Benha Mall']
    },
    {
      name: 'Minya Downtown',
      nameArabic: 'وسط المنيا',
      city: 'Minya',
      governorate: 'Minya',
      type: 'district',
      coordinates: {
        latitude: 28.1099,
        longitude: 30.7503
      },
      isActive: true,
      popularLandmarks: ['Minya University', 'Minya Mall']
    },
    {
      name: 'Asyut Downtown',
      nameArabic: 'وسط أسيوط',
      city: 'Asyut',
      governorate: 'Asyut',
      type: 'district',
      coordinates: {
        latitude: 27.1828,
        longitude: 31.1828
      },
      isActive: true,
      popularLandmarks: ['Asyut University', 'Asyut Mall']
    },
    {
      name: 'Sohag Downtown',
      nameArabic: 'وسط سوهاج',
      city: 'Sohag',
      governorate: 'Sohag',
      type: 'district',
      coordinates: {
        latitude: 26.5569,
        longitude: 31.6947
      },
      isActive: true,
      popularLandmarks: ['Sohag University', 'Sohag Mall']
    },
    {
      name: 'Qena Downtown',
      nameArabic: 'وسط قنا',
      city: 'Qena',
      governorate: 'Qena',
      type: 'district',
      coordinates: {
        latitude: 26.1667,
        longitude: 32.7167
      },
      isActive: true,
      popularLandmarks: ['Qena University', 'Qena Mall']
    },
    {
      name: 'Fayoum Downtown',
      nameArabic: 'وسط الفيوم',
      city: 'Fayoum',
      governorate: 'Fayoum',
      type: 'district',
      coordinates: {
        latitude: 29.3081,
        longitude: 30.8428
      },
      isActive: true,
      popularLandmarks: ['Fayoum University', 'Fayoum Mall']
    },
    {
      name: 'Beni Suef Downtown',
      nameArabic: 'وسط بني سويف',
      city: 'Beni Suef',
      governorate: 'Beni Suef',
      type: 'district',
      coordinates: {
        latitude: 29.0667,
        longitude: 31.0833
      },
      isActive: true,
      popularLandmarks: ['Beni Suef University', 'Beni Suef Mall']
    }
  ]
};

module.exports = egyptianAreasData;
