// Comprehensive Transmission Parts Data
// This file contains ALL transmission system parts from smallest to largest

const transmissionPartsData = {
  parts: [
    // Manual Transmission Components
    {
      name: 'Transmission Case',
      category: 'transmission',
      subcategory: 'transmission_case',
      description: 'Main transmission housing',
      partNumber: 'TRN-TC-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Cast Iron',
        weight: { value: 25, unit: 'kg' },
        dimensions: { length: 40, width: 30, height: 25, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Input Shaft',
      category: 'transmission',
      subcategory: 'shafts',
      description: 'Receives power from engine',
      partNumber: 'TRN-IS-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 25, diameter: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Output Shaft',
      category: 'transmission',
      subcategory: 'shafts',
      description: 'Delivers power to wheels',
      partNumber: 'TRN-OS-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 25, diameter: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Counter Shaft',
      category: 'transmission',
      subcategory: 'shafts',
      description: 'Intermediate shaft for gear ratios',
      partNumber: 'TRN-CS-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 20, diameter: 2.5, unit: 'cm' }
      },
      isActive: true
    },

    // Gears
    {
      name: '1st Gear',
      category: 'transmission',
      subcategory: 'gears',
      description: 'First gear for low speed',
      partNumber: 'TRN-1G-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 1.5, unit: 'kg' },
        dimensions: { diameter: 8, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: '2nd Gear',
      category: 'transmission',
      subcategory: 'gears',
      description: 'Second gear for acceleration',
      partNumber: 'TRN-2G-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 1.2, unit: 'kg' },
        dimensions: { diameter: 7, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: '3rd Gear',
      category: 'transmission',
      subcategory: 'gears',
      description: 'Third gear for cruising',
      partNumber: 'TRN-3G-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 1, unit: 'kg' },
        dimensions: { diameter: 6, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: '4th Gear',
      category: 'transmission',
      subcategory: 'gears',
      description: 'Fourth gear for highway',
      partNumber: 'TRN-4G-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { diameter: 5, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: '5th Gear',
      category: 'transmission',
      subcategory: 'gears',
      description: 'Fifth gear for overdrive',
      partNumber: 'TRN-5G-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.6, unit: 'kg' },
        dimensions: { diameter: 4, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: '6th Gear',
      category: 'transmission',
      subcategory: 'gears',
      description: 'Sixth gear for fuel economy',
      partNumber: 'TRN-6G-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { diameter: 3.5, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Reverse Gear',
      category: 'transmission',
      subcategory: 'gears',
      description: 'Reverse gear for backing up',
      partNumber: 'TRN-RG-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 1.2, unit: 'kg' },
        dimensions: { diameter: 7, height: 3, unit: 'cm' }
      },
      isActive: true
    },

    // Synchronizers
    {
      name: 'Synchronizer Ring',
      category: 'transmission',
      subcategory: 'synchronizers',
      description: 'Synchronizes gear speeds',
      partNumber: 'TRN-SR-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Brass/Steel',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 6, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Synchronizer Hub',
      category: 'transmission',
      subcategory: 'synchronizers',
      description: 'Hub for synchronizer assembly',
      partNumber: 'TRN-SH-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { diameter: 5, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Synchronizer Sleeve',
      category: 'transmission',
      subcategory: 'synchronizers',
      description: 'Engages gears smoothly',
      partNumber: 'TRN-SS-001',
      brand: 'OEM',
      priceRange: { min: 60, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 4, height: 1.5, unit: 'cm' }
      },
      isActive: true
    },

    // Clutch Components
    {
      name: 'Clutch Disc',
      category: 'transmission',
      subcategory: 'clutch',
      description: 'Friction disc for clutch engagement',
      partNumber: 'TRN-CD-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['Manual Transmission'],
      specifications: {
        material: 'Friction Material/Steel',
        weight: { value: 2, unit: 'kg' },
        dimensions: { diameter: 25, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Clutch Pressure Plate',
      category: 'transmission',
      subcategory: 'clutch',
      description: 'Applies pressure to clutch disc',
      partNumber: 'TRN-CPP-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['Manual Transmission'],
      specifications: {
        material: 'Cast Iron/Steel',
        weight: { value: 8, unit: 'kg' },
        dimensions: { diameter: 25, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Clutch Release Bearing',
      category: 'transmission',
      subcategory: 'clutch',
      description: 'Releases clutch pressure',
      partNumber: 'TRN-CRB-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['Manual Transmission'],
      specifications: {
        material: 'Steel/Bearing',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { diameter: 6, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Clutch Fork',
      category: 'transmission',
      subcategory: 'clutch',
      description: 'Activates clutch release bearing',
      partNumber: 'TRN-CF-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['Manual Transmission'],
      specifications: {
        material: 'Steel',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 20, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Automatic Transmission Components
    {
      name: 'Torque Converter',
      category: 'transmission',
      subcategory: 'automatic',
      description: 'Connects engine to transmission',
      partNumber: 'TRN-TC-002',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['Automatic Transmission'],
      specifications: {
        material: 'Aluminum/Steel',
        weight: { value: 15, unit: 'kg' },
        dimensions: { diameter: 30, height: 20, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Planetary Gear Set',
      category: 'transmission',
      subcategory: 'automatic',
      description: 'Creates gear ratios in automatic',
      partNumber: 'TRN-PGS-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1000, currency: 'EGP' },
      compatibility: ['Automatic Transmission'],
      specifications: {
        material: 'Steel',
        weight: { value: 5, unit: 'kg' },
        dimensions: { diameter: 15, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Clutch Pack',
      category: 'transmission',
      subcategory: 'automatic',
      description: 'Engages gears in automatic',
      partNumber: 'TRN-CP-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['Automatic Transmission'],
      specifications: {
        material: 'Steel/Friction',
        weight: { value: 2, unit: 'kg' },
        dimensions: { diameter: 12, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Valve Body',
      category: 'transmission',
      subcategory: 'automatic',
      description: 'Controls hydraulic pressure',
      partNumber: 'TRN-VB-001',
      brand: 'OEM',
      priceRange: { min: 600, max: 1500, currency: 'EGP' },
      compatibility: ['Automatic Transmission'],
      specifications: {
        material: 'Aluminum',
        weight: { value: 4, unit: 'kg' },
        dimensions: { length: 25, width: 20, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Transmission Filter',
      category: 'transmission',
      subcategory: 'automatic',
      description: 'Filters transmission fluid',
      partNumber: 'TRN-TF-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['Automatic Transmission'],
      specifications: {
        material: 'Paper/Steel',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },

    // CVT Components
    {
      name: 'CVT Belt',
      category: 'transmission',
      subcategory: 'cvt',
      description: 'Variable ratio belt',
      partNumber: 'TRN-CVT-B-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['CVT Transmission'],
      specifications: {
        material: 'Steel/Rubber',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 80, width: 3, thickness: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'CVT Pulley',
      category: 'transmission',
      subcategory: 'cvt',
      description: 'Variable diameter pulley',
      partNumber: 'TRN-CVT-P-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1000, currency: 'EGP' },
      compatibility: ['CVT Transmission'],
      specifications: {
        material: 'Steel',
        weight: { value: 3, unit: 'kg' },
        dimensions: { diameter: 20, height: 8, unit: 'cm' }
      },
      isActive: true
    },

    // Differential Components
    {
      name: 'Differential Case',
      category: 'transmission',
      subcategory: 'differential',
      description: 'Houses differential gears',
      partNumber: 'TRN-DC-001',
      brand: 'OEM',
      priceRange: { min: 500, max: 1200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Steel',
        weight: { value: 15, unit: 'kg' },
        dimensions: { diameter: 25, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Ring Gear',
      category: 'transmission',
      subcategory: 'differential',
      description: 'Large gear in differential',
      partNumber: 'TRN-RG-002',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 4, unit: 'kg' },
        dimensions: { diameter: 20, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Pinion Gear',
      category: 'transmission',
      subcategory: 'differential',
      description: 'Small gear driving ring gear',
      partNumber: 'TRN-PG-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 1, unit: 'kg' },
        dimensions: { diameter: 6, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Spider Gears',
      category: 'transmission',
      subcategory: 'differential',
      description: 'Allow wheel speed differences',
      partNumber: 'TRN-SG-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { diameter: 4, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Transmission Fluids
    {
      name: 'Transmission Fluid',
      category: 'transmission',
      subcategory: 'fluids',
      description: 'Lubricates transmission components',
      partNumber: 'TRN-TF-002',
      brand: 'OEM',
      priceRange: { min: 60, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Synthetic Oil',
        weight: { value: 4, unit: 'kg' },
        dimensions: { length: 20, width: 15, height: 25, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'CVT Fluid',
      category: 'transmission',
      subcategory: 'fluids',
      description: 'Special fluid for CVT transmission',
      partNumber: 'TRN-CVT-F-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['CVT Transmission'],
      specifications: {
        material: 'CVT Specific Oil',
        weight: { value: 4, unit: 'kg' },
        dimensions: { length: 20, width: 15, height: 25, unit: 'cm' }
      },
      isActive: true
    }
  ]
};

module.exports = transmissionPartsData;
