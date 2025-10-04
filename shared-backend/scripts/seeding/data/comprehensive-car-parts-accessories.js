// Comprehensive Car Accessories Data
// This file contains ALL car accessories from smallest to largest

const accessoriesPartsData = {
  parts: [
    // Interior Accessories
    {
      name: 'Car Seat Cover',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Protective cover for car seats',
      partNumber: 'ACC-SC-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Fabric/Leather',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 60, width: 50, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Floor Mat',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Protective floor covering',
      partNumber: 'ACC-FM-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Carpet',
        weight: { value: 1.5, unit: 'kg' },
        dimensions: { length: 100, width: 50, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Steering Wheel Cover',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Grip cover for steering wheel',
      partNumber: 'ACC-SWC-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Leather/Fabric',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 40, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Dashboard Cover',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Protective dashboard mat',
      partNumber: 'ACC-DC-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Fabric/Rubber',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 120, width: 30, height: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Cup Holder',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Removable cup holder for drinks',
      partNumber: 'ACC-CH-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 8, height: 10, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Phone Mount',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Dashboard phone holder',
      partNumber: 'ACC-PM-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 10, width: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Air Freshener',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Car interior air freshener',
      partNumber: 'ACC-AF-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Fragrance',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 8, width: 5, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Trunk Organizer',
      category: 'accessories',
      subcategory: 'interior',
      description: 'Organizing system for trunk',
      partNumber: 'ACC-TO-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Fabric',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 60, width: 40, height: 20, unit: 'cm' }
      },
      isActive: true
    },

    // Exterior Accessories
    {
      name: 'Car Cover',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Protective cover for entire vehicle',
      partNumber: 'ACC-CC-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 1000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Polyester/Waterproof',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 500, width: 200, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Mud Flap',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Protects from mud and debris',
      partNumber: 'ACC-MF-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Plastic',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 40, width: 25, height: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Windshield Sun Shade',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Blocks sun from windshield',
      partNumber: 'ACC-WSS-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Reflective Foil',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 120, width: 60, height: 0.1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'License Plate Frame',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Decorative license plate holder',
      partNumber: 'ACC-LPF-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Chrome',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 30, width: 15, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Edge Guard',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Protects door edges from damage',
      partNumber: 'ACC-DEG-001',
      brand: 'OEM',
      priceRange: { min: 40, max: 120, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Plastic',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 100, width: 2, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Bumper Guard',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Protects bumper from scratches',
      partNumber: 'ACC-BG-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Chrome',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 180, width: 5, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Roof Rack',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Carries cargo on roof',
      partNumber: 'ACC-RR-001',
      brand: 'OEM',
      priceRange: { min: 500, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Steel',
        weight: { value: 8, unit: 'kg' },
        dimensions: { length: 150, width: 100, height: 10, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Towing Hitch',
      category: 'accessories',
      subcategory: 'exterior',
      description: 'Trailer towing attachment',
      partNumber: 'ACC-TH-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 15, unit: 'kg' },
        dimensions: { length: 30, width: 20, height: 15, unit: 'cm' }
      },
      isActive: true
    },

    // Performance Accessories
    {
      name: 'Cold Air Intake',
      category: 'accessories',
      subcategory: 'performance',
      description: 'Improves engine air intake',
      partNumber: 'ACC-CAI-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Plastic',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 50, width: 15, height: 10, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Performance Exhaust',
      category: 'accessories',
      subcategory: 'performance',
      description: 'High-performance exhaust system',
      partNumber: 'ACC-PE-001',
      brand: 'OEM',
      priceRange: { min: 1000, max: 3000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Stainless Steel',
        weight: { value: 12, unit: 'kg' },
        dimensions: { length: 200, width: 10, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Performance Chip',
      category: 'accessories',
      subcategory: 'performance',
      description: 'Engine performance tuning chip',
      partNumber: 'ACC-PC-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Electronic Components',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Sport Suspension',
      category: 'accessories',
      subcategory: 'performance',
      description: 'Lowered sport suspension kit',
      partNumber: 'ACC-SS-001',
      brand: 'OEM',
      priceRange: { min: 1500, max: 4000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 20, unit: 'kg' },
        dimensions: { length: 50, width: 30, height: 20, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Performance Brake Pads',
      category: 'accessories',
      subcategory: 'performance',
      description: 'High-performance brake pads',
      partNumber: 'ACC-PBP-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Ceramic/Metallic',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 12, width: 6, height: 1, unit: 'cm' }
      },
      isActive: true
    },

    // Safety Accessories
    {
      name: 'Dash Cam',
      category: 'accessories',
      subcategory: 'safety',
      description: 'Dashboard camera for recording',
      partNumber: 'ACC-DC-002',
      brand: 'OEM',
      priceRange: { min: 300, max: 1000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 8, width: 5, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Backup Camera',
      category: 'accessories',
      subcategory: 'safety',
      description: 'Rear view camera system',
      partNumber: 'ACC-BC-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 6, width: 4, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Blind Spot Mirror',
      category: 'accessories',
      subcategory: 'safety',
      description: 'Convex mirror for blind spots',
      partNumber: 'ACC-BSM-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Glass/Plastic',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { diameter: 8, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Emergency Kit',
      category: 'accessories',
      subcategory: 'safety',
      description: 'Emergency roadside assistance kit',
      partNumber: 'ACC-EK-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Various',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 30, width: 20, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'First Aid Kit',
      category: 'accessories',
      subcategory: 'safety',
      description: 'Medical emergency supplies',
      partNumber: 'ACC-FAK-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Medical',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 25, width: 15, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Fire Extinguisher',
      category: 'accessories',
      subcategory: 'safety',
      description: 'Vehicle fire suppression system',
      partNumber: 'ACC-FE-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Chemical',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 20, width: 8, height: 8, unit: 'cm' }
      },
      isActive: true
    },

    // Technology Accessories
    {
      name: 'Bluetooth Adapter',
      category: 'accessories',
      subcategory: 'technology',
      description: 'Wireless audio connection',
      partNumber: 'ACC-BA-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 5, width: 3, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'USB Charger',
      category: 'accessories',
      subcategory: 'technology',
      description: '12V to USB power adapter',
      partNumber: 'ACC-UC-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { length: 4, width: 2, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'GPS Navigation',
      category: 'accessories',
      subcategory: 'technology',
      description: 'Portable GPS navigation system',
      partNumber: 'ACC-GPS-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 12, width: 8, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Car Alarm System',
      category: 'accessories',
      subcategory: 'technology',
      description: 'Vehicle security alarm system',
      partNumber: 'ACC-CAS-001',
      brand: 'OEM',
      priceRange: { min: 600, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 10, width: 8, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Remote Start System',
      category: 'accessories',
      subcategory: 'technology',
      description: 'Remote engine start system',
      partNumber: 'ACC-RSS-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Maintenance Accessories
    {
      name: 'Car Wash Kit',
      category: 'accessories',
      subcategory: 'maintenance',
      description: 'Complete car washing supplies',
      partNumber: 'ACC-CWK-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Various',
        weight: { value: 5, unit: 'kg' },
        dimensions: { length: 40, width: 30, height: 20, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Tire Pressure Gauge',
      category: 'accessories',
      subcategory: 'maintenance',
      description: 'Digital tire pressure monitor',
      partNumber: 'ACC-TPG-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 8, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Jump Starter',
      category: 'accessories',
      subcategory: 'maintenance',
      description: 'Portable battery jump starter',
      partNumber: 'ACC-JS-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Lithium',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 20, width: 15, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'OBD Scanner',
      category: 'accessories',
      subcategory: 'maintenance',
      description: 'Diagnostic code reader',
      partNumber: 'ACC-OBD-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Electronic',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 10, width: 6, height: 2, unit: 'cm' }
      },
      isActive: true
    }
  ]
};

module.exports = accessoriesPartsData;
