// Comprehensive Suspension Parts Data
// This file contains ALL suspension system parts from smallest to largest

const suspensionPartsData = {
  parts: [
    // Shock Absorbers and Struts
    {
      name: 'Shock Absorber',
      category: 'suspension',
      subcategory: 'shocks_struts',
      description: 'Dampens suspension movement',
      partNumber: 'SUS-SA-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 40, diameter: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Strut Assembly',
      category: 'suspension',
      subcategory: 'shocks_struts',
      description: 'Complete strut with spring',
      partNumber: 'SUS-STR-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 8, unit: 'kg' },
        dimensions: { length: 50, diameter: 12, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Strut Mount',
      category: 'suspension',
      subcategory: 'shocks_struts',
      description: 'Top strut mounting point',
      partNumber: 'SUS-SM-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Metal',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { diameter: 15, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Strut Bearing',
      category: 'suspension',
      subcategory: 'shocks_struts',
      description: 'Allows strut to rotate',
      partNumber: 'SUS-SB-001',
      brand: 'OEM',
      priceRange: { min: 60, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Bearing',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 8, height: 3, unit: 'cm' }
      },
      isActive: true
    },

    // Springs
    {
      name: 'Coil Spring',
      category: 'suspension',
      subcategory: 'springs',
      description: 'Supports vehicle weight',
      partNumber: 'SUS-CS-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 4, unit: 'kg' },
        dimensions: { diameter: 12, height: 25, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Leaf Spring',
      category: 'suspension',
      subcategory: 'springs',
      description: 'Multi-leaf spring for heavy vehicles',
      partNumber: 'SUS-LS-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['Trucks, SUVs'],
      specifications: {
        material: 'Steel',
        weight: { value: 15, unit: 'kg' },
        dimensions: { length: 120, width: 8, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Air Spring',
      category: 'suspension',
      subcategory: 'springs',
      description: 'Air-filled suspension spring',
      partNumber: 'SUS-AS-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['Luxury Vehicles'],
      specifications: {
        material: 'Rubber/Air',
        weight: { value: 2, unit: 'kg' },
        dimensions: { diameter: 15, height: 20, unit: 'cm' }
      },
      isActive: true
    },

    // Control Arms and Links
    {
      name: 'Control Arm',
      category: 'suspension',
      subcategory: 'control_arms',
      description: 'Connects wheel hub to chassis',
      partNumber: 'SUS-CA-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 40, width: 5, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Control Arm Bushing',
      category: 'suspension',
      subcategory: 'control_arms',
      description: 'Isolates control arm from chassis',
      partNumber: 'SUS-CAB-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 6, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Ball Joint',
      category: 'suspension',
      subcategory: 'control_arms',
      description: 'Allows steering and suspension movement',
      partNumber: 'SUS-BJ-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Rubber',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { diameter: 4, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Sway Bar Link',
      category: 'suspension',
      subcategory: 'control_arms',
      description: 'Connects sway bar to control arm',
      partNumber: 'SUS-SBL-001',
      brand: 'OEM',
      priceRange: { min: 40, max: 120, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Rubber',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 15, diameter: 1, unit: 'cm' }
      },
      isActive: true
    },

    // Sway Bars
    {
      name: 'Sway Bar',
      category: 'suspension',
      subcategory: 'sway_bars',
      description: 'Reduces body roll during cornering',
      partNumber: 'SUS-SB-002',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 5, unit: 'kg' },
        dimensions: { length: 100, diameter: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Sway Bar Bushing',
      category: 'suspension',
      subcategory: 'sway_bars',
      description: 'Mounts sway bar to chassis',
      partNumber: 'SUS-SBB-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 60, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { diameter: 4, height: 3, unit: 'cm' }
      },
      isActive: true
    },

    // Wheel Hubs and Bearings
    {
      name: 'Wheel Hub',
      category: 'suspension',
      subcategory: 'wheel_hubs',
      description: 'Mounting point for wheel and brake',
      partNumber: 'SUS-WH-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Steel',
        weight: { value: 4, unit: 'kg' },
        dimensions: { diameter: 15, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Wheel Bearing',
      category: 'suspension',
      subcategory: 'wheel_hubs',
      description: 'Allows wheel to rotate smoothly',
      partNumber: 'SUS-WB-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Bearing',
        weight: { value: 1, unit: 'kg' },
        dimensions: { diameter: 8, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Hub Cap',
      category: 'suspension',
      subcategory: 'wheel_hubs',
      description: 'Decorative wheel center cover',
      partNumber: 'SUS-HC-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Chrome',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 12, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Tie Rods and Steering
    {
      name: 'Tie Rod',
      category: 'suspension',
      subcategory: 'steering',
      description: 'Connects steering rack to wheel',
      partNumber: 'SUS-TR-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 25, diameter: 1.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Tie Rod End',
      category: 'suspension',
      subcategory: 'steering',
      description: 'Ball joint at end of tie rod',
      partNumber: 'SUS-TRE-001',
      brand: 'OEM',
      priceRange: { min: 60, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Rubber',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 3, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Steering Knuckle',
      category: 'suspension',
      subcategory: 'steering',
      description: 'Connects wheel to suspension',
      partNumber: 'SUS-SK-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Steel',
        weight: { value: 6, unit: 'kg' },
        dimensions: { length: 20, width: 15, height: 10, unit: 'cm' }
      },
      isActive: true
    },

    // Mounts and Bushings
    {
      name: 'Engine Mount',
      category: 'suspension',
      subcategory: 'mounts',
      description: 'Supports and isolates engine',
      partNumber: 'SUS-EM-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Metal',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 15, width: 10, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Transmission Mount',
      category: 'suspension',
      subcategory: 'mounts',
      description: 'Supports transmission',
      partNumber: 'SUS-TM-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Metal',
        weight: { value: 1.5, unit: 'kg' },
        dimensions: { length: 12, width: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Body Mount',
      category: 'suspension',
      subcategory: 'mounts',
      description: 'Mounts body to frame',
      partNumber: 'SUS-BM-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Metal',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { diameter: 8, height: 5, unit: 'cm' }
      },
      isActive: true
    },

    // Stabilizer Components
    {
      name: 'Stabilizer Bar',
      category: 'suspension',
      subcategory: 'stabilizers',
      description: 'Reduces body roll',
      partNumber: 'SUS-STB-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 250, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 80, diameter: 1.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Stabilizer Link',
      category: 'suspension',
      subcategory: 'stabilizers',
      description: 'Connects stabilizer to suspension',
      partNumber: 'SUS-STL-001',
      brand: 'OEM',
      priceRange: { min: 40, max: 120, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Rubber',
        weight: { value: 0.4, unit: 'kg' },
        dimensions: { length: 20, diameter: 1, unit: 'cm' }
      },
      isActive: true
    },

    // Air Suspension Components
    {
      name: 'Air Compressor',
      category: 'suspension',
      subcategory: 'air_suspension',
      description: 'Compresses air for air suspension',
      partNumber: 'SUS-AC-001',
      brand: 'OEM',
      priceRange: { min: 500, max: 1200, currency: 'EGP' },
      compatibility: ['Luxury Vehicles'],
      specifications: {
        material: 'Aluminum/Steel',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 15, width: 10, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Air Line',
      category: 'suspension',
      subcategory: 'air_suspension',
      description: 'Carries compressed air',
      partNumber: 'SUS-AL-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 60, currency: 'EGP' },
      compatibility: ['Luxury Vehicles'],
      specifications: {
        material: 'Rubber/Plastic',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 100, diameter: 0.6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Air Valve',
      category: 'suspension',
      subcategory: 'air_suspension',
      description: 'Controls air flow to springs',
      partNumber: 'SUS-AV-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['Luxury Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 5, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    }
  ]
};

module.exports = suspensionPartsData;
