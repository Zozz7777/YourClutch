// Comprehensive Body Parts Data
// This file contains ALL body parts from smallest to largest

const bodyPartsData = {
  parts: [
    // Exterior Body Panels
    {
      name: 'Front Bumper',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Front protective panel of vehicle',
      partNumber: 'BDY-FB-001',
      brand: 'OEM',
      priceRange: { min: 500, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Steel',
        weight: { value: 8, unit: 'kg' },
        dimensions: { length: 180, width: 20, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Rear Bumper',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Rear protective panel of vehicle',
      partNumber: 'BDY-RB-001',
      brand: 'OEM',
      priceRange: { min: 500, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Steel',
        weight: { value: 8, unit: 'kg' },
        dimensions: { length: 180, width: 20, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Front Fender',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Front wheel well panel',
      partNumber: 'BDY-FF-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 5, unit: 'kg' },
        dimensions: { length: 100, width: 60, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Rear Fender',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Rear wheel well panel',
      partNumber: 'BDY-RF-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 5, unit: 'kg' },
        dimensions: { length: 100, width: 60, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Hood',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Engine compartment cover',
      partNumber: 'BDY-HOOD-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 15, unit: 'kg' },
        dimensions: { length: 150, width: 120, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Trunk Lid',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Rear cargo compartment cover',
      partNumber: 'BDY-TL-001',
      brand: 'OEM',
      priceRange: { min: 600, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 12, unit: 'kg' },
        dimensions: { length: 120, width: 100, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Panel',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Exterior door skin',
      partNumber: 'BDY-DP-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 8, unit: 'kg' },
        dimensions: { length: 100, width: 60, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Roof Panel',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Vehicle roof skin',
      partNumber: 'BDY-RP-001',
      brand: 'OEM',
      priceRange: { min: 1000, max: 2500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 20, unit: 'kg' },
        dimensions: { length: 180, width: 120, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Quarter Panel',
      category: 'body',
      subcategory: 'exterior_panels',
      description: 'Side rear body panel',
      partNumber: 'BDY-QP-001',
      brand: 'OEM',
      priceRange: { min: 600, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 10, unit: 'kg' },
        dimensions: { length: 120, width: 80, height: 3, unit: 'cm' }
      },
      isActive: true
    },

    // Doors and Windows
    {
      name: 'Door Assembly',
      category: 'body',
      subcategory: 'doors',
      description: 'Complete door with all components',
      partNumber: 'BDY-DA-001',
      brand: 'OEM',
      priceRange: { min: 1500, max: 4000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Aluminum',
        weight: { value: 25, unit: 'kg' },
        dimensions: { length: 100, width: 60, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Handle',
      category: 'body',
      subcategory: 'doors',
      description: 'Exterior door handle',
      partNumber: 'BDY-DH-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Chrome',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 15, width: 5, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Lock',
      category: 'body',
      subcategory: 'doors',
      description: 'Door locking mechanism',
      partNumber: 'BDY-DL-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Plastic',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Hinge',
      category: 'body',
      subcategory: 'doors',
      description: 'Door mounting hinge',
      partNumber: 'BDY-DH-002',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 12, width: 4, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Seal',
      category: 'body',
      subcategory: 'doors',
      description: 'Weatherproof door seal',
      partNumber: 'BDY-DS-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 200, width: 2, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Window Glass',
      category: 'body',
      subcategory: 'windows',
      description: 'Door window glass',
      partNumber: 'BDY-WG-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Tempered Glass',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 50, width: 30, thickness: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Windshield',
      category: 'body',
      subcategory: 'windows',
      description: 'Front windshield glass',
      partNumber: 'BDY-WS-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Laminated Glass',
        weight: { value: 15, unit: 'kg' },
        dimensions: { length: 120, width: 60, thickness: 0.8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Rear Window',
      category: 'body',
      subcategory: 'windows',
      description: 'Rear windshield glass',
      partNumber: 'BDY-RW-001',
      brand: 'OEM',
      priceRange: { min: 600, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Tempered Glass',
        weight: { value: 12, unit: 'kg' },
        dimensions: { length: 100, width: 50, thickness: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Window Regulator',
      category: 'body',
      subcategory: 'windows',
      description: 'Window up/down mechanism',
      partNumber: 'BDY-WR-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Plastic',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 30, width: 20, height: 5, unit: 'cm' }
      },
      isActive: true
    },

    // Mirrors
    {
      name: 'Side Mirror',
      category: 'body',
      subcategory: 'mirrors',
      description: 'Exterior side mirror assembly',
      partNumber: 'BDY-SM-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Glass',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 15, width: 10, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Mirror Glass',
      category: 'body',
      subcategory: 'mirrors',
      description: 'Mirror reflective glass',
      partNumber: 'BDY-MG-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Glass',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 12, width: 8, thickness: 0.3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Mirror Motor',
      category: 'body',
      subcategory: 'mirrors',
      description: 'Power mirror adjustment motor',
      partNumber: 'BDY-MM-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 250, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 5, width: 4, height: 3, unit: 'cm' }
      },
      isActive: true
    },

    // Grilles and Trim
    {
      name: 'Front Grille',
      category: 'body',
      subcategory: 'grilles',
      description: 'Front decorative grille',
      partNumber: 'BDY-FG-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Chrome',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 80, width: 20, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Chrome Trim',
      category: 'body',
      subcategory: 'trim',
      description: 'Decorative chrome trim piece',
      partNumber: 'BDY-CT-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Chrome/Plastic',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 50, width: 2, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Molding',
      category: 'body',
      subcategory: 'trim',
      description: 'Protective door molding',
      partNumber: 'BDY-DM-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber/Plastic',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 100, width: 3, height: 1, unit: 'cm' }
      },
      isActive: true
    },

    // Lights
    {
      name: 'Headlight Assembly',
      category: 'body',
      subcategory: 'lights',
      description: 'Complete headlight unit',
      partNumber: 'BDY-HL-001',
      brand: 'OEM',
      priceRange: { min: 400, max: 1200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Glass',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 25, width: 15, height: 10, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Taillight Assembly',
      category: 'body',
      subcategory: 'lights',
      description: 'Complete taillight unit',
      partNumber: 'BDY-TL-002',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Glass',
        weight: { value: 1.5, unit: 'kg' },
        dimensions: { length: 20, width: 12, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Turn Signal Light',
      category: 'body',
      subcategory: 'lights',
      description: 'Turn signal indicator light',
      partNumber: 'BDY-TSL-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Glass',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 8, width: 5, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Fog Light',
      category: 'body',
      subcategory: 'lights',
      description: 'Front fog light assembly',
      partNumber: 'BDY-FL-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Glass',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 10, width: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },

    // Interior Body Parts
    {
      name: 'Dashboard',
      category: 'body',
      subcategory: 'interior',
      description: 'Main dashboard panel',
      partNumber: 'BDY-DASH-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic',
        weight: { value: 8, unit: 'kg' },
        dimensions: { length: 120, width: 30, height: 20, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Center Console',
      category: 'body',
      subcategory: 'interior',
      description: 'Center console assembly',
      partNumber: 'BDY-CC-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic',
        weight: { value: 3, unit: 'kg' },
        dimensions: { length: 40, width: 20, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Door Panel Interior',
      category: 'body',
      subcategory: 'interior',
      description: 'Interior door panel',
      partNumber: 'BDY-DPI-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Fabric',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 80, width: 50, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Headliner',
      category: 'body',
      subcategory: 'interior',
      description: 'Roof interior covering',
      partNumber: 'BDY-HL-002',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Fabric/Foam',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 150, width: 100, height: 1, unit: 'cm' }
      },
      isActive: true
    }
  ]
};

module.exports = bodyPartsData;
