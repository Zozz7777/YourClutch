// Comprehensive Engine Parts Data
// This file contains ALL engine-related parts from smallest to largest

const enginePartsData = {
  parts: [
    // Engine Block Components
    {
      name: 'Engine Block',
      category: 'engine',
      subcategory: 'engine_block',
      description: 'Main engine casting that houses cylinders and other components',
      partNumber: 'ENG-BLK-001',
      brand: 'OEM',
      priceRange: { min: 2000, max: 8000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Aluminum',
        weight: { value: 50, unit: 'kg' },
        dimensions: { length: 60, width: 40, height: 30, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Cylinder Head',
      category: 'engine',
      subcategory: 'engine_block',
      description: 'Top part of engine block containing combustion chambers',
      partNumber: 'ENG-CH-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 3000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Aluminum',
        weight: { value: 15, unit: 'kg' },
        dimensions: { length: 50, width: 30, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Cylinder Head Gasket',
      category: 'engine',
      subcategory: 'gaskets',
      description: 'Seal between cylinder head and engine block',
      partNumber: 'ENG-GSK-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Multi-layer Steel',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 50, width: 30, height: 0.2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Piston',
      category: 'engine',
      subcategory: 'pistons',
      description: 'Component that moves up and down in cylinder',
      partNumber: 'ENG-PST-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum Alloy',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Piston Ring',
      category: 'engine',
      subcategory: 'pistons',
      description: 'Ring that seals piston to cylinder wall',
      partNumber: 'ENG-PR-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Steel',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { diameter: 8, thickness: 0.2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Connecting Rod',
      category: 'engine',
      subcategory: 'pistons',
      description: 'Connects piston to crankshaft',
      partNumber: 'ENG-CR-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Forged Steel',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 15, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Crankshaft',
      category: 'engine',
      subcategory: 'crankshaft',
      description: 'Converts linear motion to rotational motion',
      partNumber: 'ENG-CS-001',
      brand: 'OEM',
      priceRange: { min: 500, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Forged Steel',
        weight: { value: 15, unit: 'kg' },
        dimensions: { length: 40, diameter: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Camshaft',
      category: 'engine',
      subcategory: 'valvetrain',
      description: 'Controls valve opening and closing',
      partNumber: 'ENG-CAM-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Steel',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 35, diameter: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Valve',
      category: 'engine',
      subcategory: 'valvetrain',
      description: 'Controls air/fuel intake and exhaust',
      partNumber: 'ENG-VLV-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 120, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Stainless Steel',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { diameter: 3, length: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Valve Spring',
      category: 'engine',
      subcategory: 'valvetrain',
      description: 'Returns valve to closed position',
      partNumber: 'ENG-VS-001',
      brand: 'OEM',
      priceRange: { min: 15, max: 60, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Spring Steel',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { diameter: 2, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Timing Belt',
      category: 'engine',
      subcategory: 'timing',
      description: 'Synchronizes camshaft and crankshaft',
      partNumber: 'ENG-TB-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber with Fiber',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 120, width: 2, thickness: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Timing Chain',
      category: 'engine',
      subcategory: 'timing',
      description: 'Metal chain for timing synchronization',
      partNumber: 'ENG-TC-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 100, width: 1, thickness: 0.3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Oil Pump',
      category: 'engine',
      subcategory: 'lubrication',
      description: 'Circulates engine oil',
      partNumber: 'ENG-OP-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Steel',
        weight: { value: 1.5, unit: 'kg' },
        dimensions: { length: 10, width: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Oil Filter',
      category: 'engine',
      subcategory: 'filters',
      description: 'Filters engine oil',
      partNumber: 'ENG-OF-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Paper/Steel',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 8, height: 10, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Spark Plug',
      category: 'engine',
      subcategory: 'ignition',
      description: 'Ignites air/fuel mixture',
      partNumber: 'ENG-SP-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Ceramic/Metal',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { diameter: 1.4, length: 7, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Ignition Coil',
      category: 'engine',
      subcategory: 'ignition',
      description: 'Generates high voltage for spark plugs',
      partNumber: 'ENG-IC-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Fuel Injector',
      category: 'engine',
      subcategory: 'fuel_system',
      description: 'Sprays fuel into combustion chamber',
      partNumber: 'ENG-FI-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 2, length: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Throttle Body',
      category: 'engine',
      subcategory: 'fuel_system',
      description: 'Controls air intake to engine',
      partNumber: 'ENG-TB-002',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum',
        weight: { value: 1, unit: 'kg' },
        dimensions: { diameter: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Intake Manifold',
      category: 'engine',
      subcategory: 'fuel_system',
      description: 'Distributes air to cylinders',
      partNumber: 'ENG-IM-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Aluminum',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 30, width: 15, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Exhaust Manifold',
      category: 'engine',
      subcategory: 'exhaust',
      description: 'Collects exhaust gases from cylinders',
      partNumber: 'ENG-EM-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron/Stainless Steel',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 25, width: 12, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Catalytic Converter',
      category: 'engine',
      subcategory: 'exhaust',
      description: 'Reduces harmful emissions',
      partNumber: 'ENG-CC-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Stainless Steel/Ceramic',
        weight: { value: 8, unit: 'kg' },
        dimensions: { length: 30, diameter: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Muffler',
      category: 'engine',
      subcategory: 'exhaust',
      description: 'Reduces exhaust noise',
      partNumber: 'ENG-MUF-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Stainless Steel',
        weight: { value: 5, unit: 'kg' },
        dimensions: { length: 40, diameter: 20, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Radiator',
      category: 'engine',
      subcategory: 'cooling',
      description: 'Cools engine coolant',
      partNumber: 'ENG-RAD-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Plastic',
        weight: { value: 4, unit: 'kg' },
        dimensions: { length: 60, width: 40, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Water Pump',
      category: 'engine',
      subcategory: 'cooling',
      description: 'Circulates engine coolant',
      partNumber: 'ENG-WP-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Steel',
        weight: { value: 1, unit: 'kg' },
        dimensions: { diameter: 12, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Thermostat',
      category: 'engine',
      subcategory: 'cooling',
      description: 'Controls coolant flow',
      partNumber: 'ENG-TH-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Brass/Plastic',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 6, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Engine Mount',
      category: 'engine',
      subcategory: 'mounts',
      description: 'Supports and isolates engine',
      partNumber: 'ENG-EM-002',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Metal',
        weight: { value: 1.5, unit: 'kg' },
        dimensions: { length: 15, width: 10, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Engine Oil',
      category: 'engine',
      subcategory: 'fluids',
      description: 'Lubricates engine components',
      partNumber: 'ENG-OIL-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Synthetic Oil',
        weight: { value: 4, unit: 'kg' },
        dimensions: { length: 20, width: 15, height: 25, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Coolant',
      category: 'engine',
      subcategory: 'fluids',
      description: 'Engine cooling fluid',
      partNumber: 'ENG-COOL-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 120, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Ethylene Glycol',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 20, width: 15, height: 20, unit: 'cm' }
      },
      isActive: true
    }
  ]
};

module.exports = enginePartsData;
