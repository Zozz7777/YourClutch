// Comprehensive Electrical Parts Data
// This file contains ALL electrical system parts from smallest to largest

const electricalPartsData = {
  parts: [
    // Battery and Charging System
    {
      name: 'Car Battery',
      category: 'electrical',
      subcategory: 'battery',
      description: '12V lead-acid battery for starting and power',
      partNumber: 'ELC-BAT-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Lead/Plastic',
        weight: { value: 15, unit: 'kg' },
        dimensions: { length: 30, width: 17, height: 20, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Battery Terminal',
      category: 'electrical',
      subcategory: 'battery',
      description: 'Battery connection terminal',
      partNumber: 'ELC-BT-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 60, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Lead/Copper',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { diameter: 2, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Battery Cable',
      category: 'electrical',
      subcategory: 'battery',
      description: 'Heavy gauge wire for battery connections',
      partNumber: 'ELC-BC-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Copper/Rubber',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 100, diameter: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Battery Hold Down',
      category: 'electrical',
      subcategory: 'battery',
      description: 'Secures battery in place',
      partNumber: 'ELC-BHD-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { length: 25, width: 3, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Alternator',
      category: 'electrical',
      subcategory: 'charging',
      description: 'Generates electrical power while running',
      partNumber: 'ELC-ALT-001',
      brand: 'OEM',
      priceRange: { min: 600, max: 1500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Aluminum/Steel',
        weight: { value: 8, unit: 'kg' },
        dimensions: { diameter: 15, height: 12, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Alternator Belt',
      category: 'electrical',
      subcategory: 'charging',
      description: 'Drives alternator from engine',
      partNumber: 'ELC-AB-001',
      brand: 'OEM',
      priceRange: { min: 40, max: 120, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Rubber',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 80, width: 1, thickness: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Voltage Regulator',
      category: 'electrical',
      subcategory: 'charging',
      description: 'Controls alternator output voltage',
      partNumber: 'ELC-VR-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 3, unit: 'cm' }
      },
      isActive: true
    },

    // Starter System
    {
      name: 'Starter Motor',
      category: 'electrical',
      subcategory: 'starter',
      description: 'Cranks engine for starting',
      partNumber: 'ELC-SM-001',
      brand: 'OEM',
      priceRange: { min: 800, max: 2000, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Copper',
        weight: { value: 6, unit: 'kg' },
        dimensions: { length: 20, diameter: 10, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Starter Solenoid',
      category: 'electrical',
      subcategory: 'starter',
      description: 'Engages starter motor',
      partNumber: 'ELC-SS-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Copper',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Starter Relay',
      category: 'electrical',
      subcategory: 'starter',
      description: 'Controls starter circuit',
      partNumber: 'ELC-SR-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 4, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Ignition System
    {
      name: 'Ignition Coil',
      category: 'electrical',
      subcategory: 'ignition',
      description: 'Generates high voltage for spark plugs',
      partNumber: 'ELC-IC-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.8, unit: 'kg' },
        dimensions: { length: 10, width: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Distributor',
      category: 'electrical',
      subcategory: 'ignition',
      description: 'Distributes spark to cylinders',
      partNumber: 'ELC-DIST-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['Older Vehicles'],
      specifications: {
        material: 'Aluminum/Plastic',
        weight: { value: 2, unit: 'kg' },
        dimensions: { diameter: 12, height: 15, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Distributor Cap',
      category: 'electrical',
      subcategory: 'ignition',
      description: 'Covers distributor rotor',
      partNumber: 'ELC-DC-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 150, currency: 'EGP' },
      compatibility: ['Older Vehicles'],
      specifications: {
        material: 'Plastic',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { diameter: 12, height: 5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Distributor Rotor',
      category: 'electrical',
      subcategory: 'ignition',
      description: 'Rotates inside distributor cap',
      partNumber: 'ELC-DR-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 60, currency: 'EGP' },
      compatibility: ['Older Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { diameter: 6, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Spark Plug Wire',
      category: 'electrical',
      subcategory: 'ignition',
      description: 'High voltage wire to spark plugs',
      partNumber: 'ELC-SPW-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Silicone/Copper',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 50, diameter: 0.8, unit: 'cm' }
      },
      isActive: true
    },

    // Lighting System
    {
      name: 'Headlight Bulb',
      category: 'electrical',
      subcategory: 'lighting',
      description: 'High/low beam headlight bulb',
      partNumber: 'ELC-HB-001',
      brand: 'OEM',
      priceRange: { min: 50, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Glass/Tungsten',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 8, diameter: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Taillight Bulb',
      category: 'electrical',
      subcategory: 'lighting',
      description: 'Rear taillight bulb',
      partNumber: 'ELC-TB-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 80, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Glass/Tungsten',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { length: 5, diameter: 1.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Turn Signal Bulb',
      category: 'electrical',
      subcategory: 'lighting',
      description: 'Turn signal indicator bulb',
      partNumber: 'ELC-TSB-001',
      brand: 'OEM',
      priceRange: { min: 15, max: 50, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Glass/Tungsten',
        weight: { value: 0.03, unit: 'kg' },
        dimensions: { length: 4, diameter: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'LED Light Strip',
      category: 'electrical',
      subcategory: 'lighting',
      description: 'LED lighting strip for accent lighting',
      partNumber: 'ELC-LED-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'LED/Plastic',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 50, width: 1, height: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Light Switch',
      category: 'electrical',
      subcategory: 'lighting',
      description: 'Dashboard light control switch',
      partNumber: 'ELC-LS-001',
      brand: 'OEM',
      priceRange: { min: 80, max: 200, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 6, width: 4, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Fuses and Relays
    {
      name: 'Fuse',
      category: 'electrical',
      subcategory: 'fuses',
      description: 'Protects electrical circuits',
      partNumber: 'ELC-FUSE-001',
      brand: 'OEM',
      priceRange: { min: 5, max: 20, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Metal/Plastic',
        weight: { value: 0.01, unit: 'kg' },
        dimensions: { length: 3, width: 1, height: 0.5, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Fuse Box',
      category: 'electrical',
      subcategory: 'fuses',
      description: 'Houses fuses and relays',
      partNumber: 'ELC-FB-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 20, width: 15, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Relay',
      category: 'electrical',
      subcategory: 'relays',
      description: 'Controls high current circuits',
      partNumber: 'ELC-REL-001',
      brand: 'OEM',
      priceRange: { min: 30, max: 100, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 3, width: 2, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Wiring and Connectors
    {
      name: 'Wire Harness',
      category: 'electrical',
      subcategory: 'wiring',
      description: 'Bundle of wires for electrical system',
      partNumber: 'ELC-WH-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Copper/Plastic',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 200, width: 5, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Electrical Connector',
      category: 'electrical',
      subcategory: 'wiring',
      description: 'Connects electrical components',
      partNumber: 'ELC-EC-001',
      brand: 'OEM',
      priceRange: { min: 10, max: 40, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.05, unit: 'kg' },
        dimensions: { length: 3, width: 2, height: 1, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Ground Wire',
      category: 'electrical',
      subcategory: 'wiring',
      description: 'Electrical ground connection',
      partNumber: 'ELC-GW-001',
      brand: 'OEM',
      priceRange: { min: 20, max: 60, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Copper',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 50, diameter: 0.5, unit: 'cm' }
      },
      isActive: true
    },

    // Sensors
    {
      name: 'Oxygen Sensor',
      category: 'electrical',
      subcategory: 'sensors',
      description: 'Monitors exhaust oxygen content',
      partNumber: 'ELC-OS-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 600, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Ceramic/Metal',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 15, diameter: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Mass Air Flow Sensor',
      category: 'electrical',
      subcategory: 'sensors',
      description: 'Measures air intake volume',
      partNumber: 'ELC-MAF-001',
      brand: 'OEM',
      priceRange: { min: 300, max: 800, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.2, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Throttle Position Sensor',
      category: 'electrical',
      subcategory: 'sensors',
      description: 'Monitors throttle position',
      partNumber: 'ELC-TPS-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 4, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Crankshaft Position Sensor',
      category: 'electrical',
      subcategory: 'sensors',
      description: 'Monitors crankshaft position',
      partNumber: 'ELC-CPS-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 6, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Camshaft Position Sensor',
      category: 'electrical',
      subcategory: 'sensors',
      description: 'Monitors camshaft position',
      partNumber: 'ELC-CAMS-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.1, unit: 'kg' },
        dimensions: { length: 5, width: 3, height: 2, unit: 'cm' }
      },
      isActive: true
    },

    // Accessories
    {
      name: 'Power Window Motor',
      category: 'electrical',
      subcategory: 'accessories',
      description: 'Motor for power windows',
      partNumber: 'ELC-PWM-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Plastic',
        weight: { value: 1, unit: 'kg' },
        dimensions: { length: 8, width: 6, height: 4, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Power Door Lock Actuator',
      category: 'electrical',
      subcategory: 'accessories',
      description: 'Motor for power door locks',
      partNumber: 'ELC-PDLA-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.3, unit: 'kg' },
        dimensions: { length: 6, width: 4, height: 3, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Horn',
      category: 'electrical',
      subcategory: 'accessories',
      description: 'Vehicle horn assembly',
      partNumber: 'ELC-HORN-001',
      brand: 'OEM',
      priceRange: { min: 100, max: 300, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Plastic/Metal',
        weight: { value: 0.5, unit: 'kg' },
        dimensions: { diameter: 12, height: 8, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Wiper Motor',
      category: 'electrical',
      subcategory: 'accessories',
      description: 'Motor for windshield wipers',
      partNumber: 'ELC-WM-001',
      brand: 'OEM',
      priceRange: { min: 200, max: 500, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Plastic',
        weight: { value: 1.5, unit: 'kg' },
        dimensions: { length: 10, width: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    },
    {
      name: 'Blower Motor',
      category: 'electrical',
      subcategory: 'accessories',
      description: 'Motor for HVAC blower',
      partNumber: 'ELC-BM-001',
      brand: 'OEM',
      priceRange: { min: 150, max: 400, currency: 'EGP' },
      compatibility: ['All Vehicles'],
      specifications: {
        material: 'Steel/Plastic',
        weight: { value: 1, unit: 'kg' },
        dimensions: { diameter: 8, height: 6, unit: 'cm' }
      },
      isActive: true
    }
  ]
};

module.exports = electricalPartsData;
