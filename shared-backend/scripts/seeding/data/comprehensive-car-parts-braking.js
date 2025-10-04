// Comprehensive Braking System Parts Data
// This file contains ALL braking system parts from smallest to largest

const brakingPartsData = {
  parts: [
    // Brake Pads and Shoes
    {
      name: 'Brake Pad',
      category: 'brakes',
      subcategory: 'brake_pads',
      description: 'Friction material that contacts brake rotor',
      partNumber: 'BRK-PAD-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Ceramic/Semi-metallic',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 12, width: 6, thickness: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Shoe',
      category: 'brakes',
      subcategory: 'brake_pads',
      description: 'Friction material for drum brakes',
      partNumber: 'BRK-SHOE-001',
      brand: 'OEM',
      priceRange: { min: 60, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Asbestos-free',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 20, width: 4, thickness: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Pad Clip',
      category: 'brakes',
      subcategory: 'brake_pads',
      description: 'Retains brake pad in caliper',
      partNumber: 'BRK-CLIP-001',
      brand: 'OEM',
      priceRange: { min: 10, max: 30, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Stainless Steel',
        weight: { value: 0.02, unit: 'kg' },
        dimensions: { length: 8, width: 1, thickness: 0.2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Pad Shim',
      category: 'brakes',
      subcategory: 'brake_pads',
      description: 'Reduces brake noise and vibration',
      partNumber: 'BRK-SHIM-001',
      brand: 'OEM',
      priceRange: { min: 5, max: 20, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Stainless Steel',
        weight: { value: 0.01, unit: 'kg' },
        dimensions: { length: 10, width: 5, thickness: 0.1, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Rotors and Drums
    {
      name: 'Brake Rotor',
      category: 'brakes',
      subcategory: 'brake_rotors',
      description: 'Disc that brake pads clamp against',
      partNumber: 'BRK-ROT-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron',
        weight: { value: 8, unit: 'kg' },
        dimensions: { diameter: 30, thickness: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Drum',
      category: 'brakes',
      subcategory: 'brake_rotors',
      description: 'Hollow cylinder for drum brakes',
      partNumber: 'BRK-DRUM-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Cast Iron',
        weight: { value: 6, unit: 'kg' },
        dimensions: { diameter: 25, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Rotor Screw',
      category: 'brakes',
      subcategory: 'brake_rotors',
      description: 'Secures brake rotor to hub',
      partNumber: 'BRK-SCR-001',
      brand: 'OEM',
      priceRange: { min: 2, max: 8, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.01, unit: 'kg' },
        dimensions: { length: 2, diameter: 0.6, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Calipers
    {
      name: 'Brake Caliper',
      category: 'brakes',
      subcategory: 'brake_calipers',
      description: 'Houses brake pads and applies pressure',
      partNumber: 'BRK-CAL-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Cast Iron',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 15, width: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Caliper Piston',
      category: 'brakes',
      subcategory: 'brake_calipers',
      description: 'Pushes brake pad against rotor',
      partNumber: 'BRK-PIST-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 4, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Caliper Seal',
      category: 'brakes',
      subcategory: 'brake_calipers',
      description: 'Seals brake fluid in caliper',
      partNumber: 'BRK-SEAL-001',
      brand: 'OEM',
      priceRange: { min: 10, max: 30, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.01, unit: 'kg' },
        dimensions: { diameter: 4, thickness: 0.2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Caliper Bolt',
      category: 'brakes',
      subcategory: 'brake_calipers',
      description: 'Secures caliper to mounting bracket',
      partNumber: 'BRK-BOLT-001',
      brand: 'OEM',
      priceRange: { min: 5, max: 15, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { length: 8, diameter: 1, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Lines and Hoses
    {
      name: 'Brake Line',
      category: 'brakes',
      subcategory: 'brake_lines',
      description: 'Steel tube carrying brake fluid',
      partNumber: 'BRK-LINE-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 100, diameter: 0.6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Hose',
      category: 'brakes',
      subcategory: 'brake_lines',
      description: 'Flexible hose for brake fluid',
      partNumber: 'BRK-HOSE-001',
      brand: 'OEM',
      priceRange: { min: 40, max: 120, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Steel',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 50, diameter: 0.8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Line Fitting',
      category: 'brakes',
      subcategory: 'brake_lines',
      description: 'Connects brake lines and hoses',
      partNumber: 'BRK-FIT-001',
      brand: 'OEM',
      priceRange: { min: 5, max: 20, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Brass/Steel',
        weight: { value: 0.02, unit: 'kg' },
        dimensions: { length: 2, diameter: 1, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Master Cylinder
    {
      name: 'Brake Master Cylinder',
      category: 'brakes',
      subcategory: 'master_cylinder',
      description: 'Converts pedal force to hydraulic pressure',
      partNumber: 'BRK-MC-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Cast Iron',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 15, width: 8, height: 10, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Master Cylinder Piston',
      category: 'brakes',
      subcategory: 'master_cylinder',
      description: 'Creates hydraulic pressure',
      partNumber: 'BRK-MCP-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { diameter: 2, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Master Cylinder Seal',
      category: 'brakes',
      subcategory: 'master_cylinder',
      description: 'Seals brake fluid in master cylinder',
      partNumber: 'BRK-MCS-001',
      brand: 'OEM',
      priceRange: { min: 10, max: 25, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.01, unit: 'kg' },
        dimensions: { diameter: 2, thickness: 0.1, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Booster
    {
      name: 'Brake Booster',
      category: 'brakes',
      subcategory: 'brake_booster',
      description: 'Amplifies brake pedal force',
      partNumber: 'BRK-BOOST-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Steel',
        weight: { value: 4, unit: 'kg' },
        dimensions: { diameter: 20, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Booster Diaphragm',
      category: 'brakes',
      subcategory: 'brake_booster',
      description: 'Creates vacuum pressure',
      partNumber: 'BRK-DIA-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 18, thickness: 0.2, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Fluid
    {
      name: 'Brake Fluid',
      category: 'brakes',
      subcategory: 'brake_fluid',
      description: 'Hydraulic fluid for brake system',
      partNumber: 'BRK-FLUID-001',
      brand: 'OEM',
      priceRange: { min: 40, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'DOT 3/4/5.1',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 15, width: 8, height: 20, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Pedal
    {
      name: 'Brake Pedal',
      category: 'brakes',
      subcategory: 'brake_pedal',
      description: 'Driver input for brake system',
      partNumber: 'BRK-PEDAL-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 20, width: 8, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Pedal Pad',
      category: 'brakes',
      subcategory: 'brake_pedal',
      description: 'Rubber pad on brake pedal',
      partNumber: 'BRK-PAD-002',
      brand: 'OEM',
      priceRange: { min: 20, max: 50, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 12, width: 6, thickness: 0.5, unit: 'cm' }
      },
      isActive: true
    },

    // Parking Brake
    {
      name: 'Parking Brake Cable',
      category: 'brakes',
      subcategory: 'parking_brake',
      description: 'Cable for parking brake system',
      partNumber: 'BRK-PBC-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 200, diameter: 0.3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Parking Brake Lever',
      category: 'brakes',
      subcategory: 'parking_brake',
      description: 'Hand lever for parking brake',
      partNumber: 'BRK-PBL-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Plastic',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 25, width: 5, height: 3, unit: 'cm' }
      },
      isActive: true
    },

    // Brake Sensors
    {
      name: 'Brake Pad Wear Sensor',
      category: 'brakes',
      subcategory: 'brake_sensors',
      description: 'Monitors brake pad wear',
      partNumber: 'BRK-SENS-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { length: 5, width: 1, height: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Brake Fluid Level Sensor',
      category: 'brakes',
      subcategory: 'brake_sensors',
      description: 'Monitors brake fluid level',
      partNumber: 'BRK-FLS-001',
      brand: 'OEM',
      priceRange: { min: 40, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 3, width: 2, height: 1, unit: 'cm' }
      },
      isActive: true
    }
  ]
};

module.exports = brakingPartsData;
