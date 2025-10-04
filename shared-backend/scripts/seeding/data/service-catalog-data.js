// Comprehensive Service Catalog Data
// This file contains ALL automotive services with 100% coverage

const serviceCatalogData = {
  services: [
    // Engine Services
    {
      serviceGroup: 'Engine',
      serviceName: 'Oil Change',
      description: 'Complete engine oil and filter replacement service',
      icon: 'oil-can',
      estimatedDuration: 30,
      difficulty: 'easy',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 150,
        max: 300,
        currency: 'EGP'
      },
      frequency: 'every 5000-10000 km',
      partsRequired: ['Engine Oil', 'Oil Filter'],
      toolsRequired: ['Oil Drain Pan', 'Oil Filter Wrench', 'Funnel']
    },
    {
      serviceGroup: 'Engine',
      serviceName: 'Engine Tune-up',
      description: 'Complete engine performance optimization service',
      icon: 'cog',
      estimatedDuration: 120,
      difficulty: 'medium',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 500,
        max: 1000,
        currency: 'EGP'
      },
      frequency: 'every 20000-30000 km',
      partsRequired: ['Spark Plugs', 'Air Filter', 'Fuel Filter'],
      toolsRequired: ['Spark Plug Wrench', 'Screwdriver Set', 'Multimeter']
    },
    {
      serviceGroup: 'Engine',
      serviceName: 'Engine Diagnostic',
      description: 'Complete engine health check and diagnostic scan',
      icon: 'stethoscope',
      estimatedDuration: 60,
      difficulty: 'professional',
      category: 'diagnostic',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: [],
      toolsRequired: ['OBD Scanner', 'Multimeter', 'Compression Tester']
    },
    {
      serviceGroup: 'Engine',
      serviceName: 'Timing Belt Replacement',
      description: 'Timing belt and tensioner replacement service',
      icon: 'cogs',
      estimatedDuration: 240,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 800,
        max: 1500,
        currency: 'EGP'
      },
      frequency: 'every 60000-100000 km',
      partsRequired: ['Timing Belt', 'Tensioner', 'Water Pump'],
      toolsRequired: ['Timing Belt Tool Kit', 'Torque Wrench', 'Engine Hoist']
    },
    {
      serviceGroup: 'Engine',
      serviceName: 'Engine Overhaul',
      description: 'Complete engine rebuild and restoration service',
      icon: 'wrench',
      estimatedDuration: 1440,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 5000,
        max: 15000,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Engine Gasket Set', 'Piston Rings', 'Bearings'],
      toolsRequired: ['Engine Stand', 'Micrometer', 'Torque Wrench Set']
    },

    // Transmission Services
    {
      serviceGroup: 'Transmission',
      serviceName: 'Transmission Fluid Change',
      description: 'Automatic transmission fluid and filter replacement',
      icon: 'oil-can',
      estimatedDuration: 90,
      difficulty: 'medium',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 300,
        max: 600,
        currency: 'EGP'
      },
      frequency: 'every 40000-60000 km',
      partsRequired: ['Transmission Fluid', 'Transmission Filter', 'Gasket'],
      toolsRequired: ['Transmission Jack', 'Drain Pan', 'Funnel']
    },
    {
      serviceGroup: 'Transmission',
      serviceName: 'Transmission Diagnostic',
      description: 'Transmission system diagnostic and health check',
      icon: 'stethoscope',
      estimatedDuration: 60,
      difficulty: 'professional',
      category: 'diagnostic',
      isActive: true,
      priceRange: {
        min: 250,
        max: 450,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: [],
      toolsRequired: ['Transmission Scanner', 'Pressure Gauge', 'Multimeter']
    },
    {
      serviceGroup: 'Transmission',
      serviceName: 'Clutch Replacement',
      description: 'Complete clutch assembly replacement service',
      icon: 'cog',
      estimatedDuration: 300,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 1200,
        max: 2500,
        currency: 'EGP'
      },
      frequency: 'every 80000-120000 km',
      partsRequired: ['Clutch Kit', 'Flywheel', 'Release Bearing'],
      toolsRequired: ['Transmission Jack', 'Clutch Alignment Tool', 'Torque Wrench']
    },
    {
      serviceGroup: 'Transmission',
      serviceName: 'Transmission Rebuild',
      description: 'Complete transmission overhaul and rebuild service',
      icon: 'wrench',
      estimatedDuration: 720,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 3000,
        max: 8000,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Transmission Rebuild Kit', 'Seals', 'Gaskets'],
      toolsRequired: ['Transmission Stand', 'Specialty Tools', 'Press']
    },

    // Brake Services
    {
      serviceGroup: 'Brakes',
      serviceName: 'Brake Pad Replacement',
      description: 'Front and rear brake pad replacement service',
      icon: 'brake-pad',
      estimatedDuration: 90,
      difficulty: 'medium',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 400,
        max: 800,
        currency: 'EGP'
      },
      frequency: 'every 20000-40000 km',
      partsRequired: ['Brake Pads', 'Brake Fluid', 'Brake Cleaner'],
      toolsRequired: ['Brake Caliper Tool', 'Torque Wrench', 'Brake Bleeder']
    },
    {
      serviceGroup: 'Brakes',
      serviceName: 'Brake Disc Resurfacing',
      description: 'Brake disc resurfacing and rotor service',
      icon: 'disc',
      estimatedDuration: 120,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: [],
      toolsRequired: ['Brake Lathe', 'Micrometer', 'Brake Cleaner']
    },
    {
      serviceGroup: 'Brakes',
      serviceName: 'Brake System Flush',
      description: 'Complete brake system fluid flush and bleed',
      icon: 'droplet',
      estimatedDuration: 60,
      difficulty: 'medium',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 150,
        max: 300,
        currency: 'EGP'
      },
      frequency: 'every 2-3 years',
      partsRequired: ['Brake Fluid', 'Brake Cleaner'],
      toolsRequired: ['Brake Bleeder', 'Vacuum Pump', 'Wrench Set']
    },
    {
      serviceGroup: 'Brakes',
      serviceName: 'Brake Caliper Rebuild',
      description: 'Brake caliper rebuild and seal replacement',
      icon: 'wrench',
      estimatedDuration: 180,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 600,
        max: 1200,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Caliper Rebuild Kit', 'Brake Fluid', 'Seals'],
      toolsRequired: ['Caliper Tool', 'Compressed Air', 'Brake Cleaner']
    },

    // Suspension Services
    {
      serviceGroup: 'Suspension',
      serviceName: 'Shock Absorber Replacement',
      description: 'Front and rear shock absorber replacement',
      icon: 'shock',
      estimatedDuration: 120,
      difficulty: 'medium',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 800,
        max: 1500,
        currency: 'EGP'
      },
      frequency: 'every 60000-80000 km',
      partsRequired: ['Shock Absorbers', 'Mounting Hardware', 'Bushings'],
      toolsRequired: ['Spring Compressor', 'Torque Wrench', 'Jack Stands']
    },
    {
      serviceGroup: 'Suspension',
      serviceName: 'Wheel Alignment',
      description: 'Complete wheel alignment and camber adjustment',
      icon: 'alignment',
      estimatedDuration: 60,
      difficulty: 'professional',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'every 10000-15000 km',
      partsRequired: [],
      toolsRequired: ['Alignment Machine', 'Wrench Set', 'Measuring Tools']
    },
    {
      serviceGroup: 'Suspension',
      serviceName: 'Ball Joint Replacement',
      description: 'Upper and lower ball joint replacement service',
      icon: 'joint',
      estimatedDuration: 150,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 400,
        max: 800,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Ball Joints', 'Grease', 'Cotter Pins'],
      toolsRequired: ['Ball Joint Press', 'Torque Wrench', 'Jack Stands']
    },
    {
      serviceGroup: 'Suspension',
      serviceName: 'Strut Assembly Replacement',
      description: 'Complete strut assembly replacement service',
      icon: 'strut',
      estimatedDuration: 180,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 1000,
        max: 2000,
        currency: 'EGP'
      },
      frequency: 'every 80000-100000 km',
      partsRequired: ['Strut Assembly', 'Mounting Hardware', 'Bushings'],
      toolsRequired: ['Spring Compressor', 'Torque Wrench', 'Jack Stands']
    },

    // Electrical Services
    {
      serviceGroup: 'Electrical',
      serviceName: 'Battery Replacement',
      description: 'Car battery replacement and testing service',
      icon: 'battery',
      estimatedDuration: 30,
      difficulty: 'easy',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 800,
        max: 1500,
        currency: 'EGP'
      },
      frequency: 'every 3-5 years',
      partsRequired: ['Car Battery', 'Battery Terminals', 'Battery Tray'],
      toolsRequired: ['Battery Terminal Cleaner', 'Wrench Set', 'Multimeter']
    },
    {
      serviceGroup: 'Electrical',
      serviceName: 'Alternator Repair',
      description: 'Alternator testing, repair, and replacement',
      icon: 'alternator',
      estimatedDuration: 120,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 600,
        max: 1200,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Alternator', 'Drive Belt', 'Mounting Hardware'],
      toolsRequired: ['Multimeter', 'Belt Tensioner', 'Torque Wrench']
    },
    {
      serviceGroup: 'Electrical',
      serviceName: 'Starter Motor Repair',
      description: 'Starter motor testing, repair, and replacement',
      icon: 'starter',
      estimatedDuration: 90,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 500,
        max: 1000,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Starter Motor', 'Solenoid', 'Mounting Hardware'],
      toolsRequired: ['Multimeter', 'Torque Wrench', 'Wire Strippers']
    },
    {
      serviceGroup: 'Electrical',
      serviceName: 'Electrical System Diagnostic',
      description: 'Complete electrical system diagnostic and testing',
      icon: 'stethoscope',
      estimatedDuration: 90,
      difficulty: 'professional',
      category: 'diagnostic',
      isActive: true,
      priceRange: {
        min: 300,
        max: 600,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: [],
      toolsRequired: ['Multimeter', 'Oscilloscope', 'Wire Tracer']
    },

    // Cooling System Services
    {
      serviceGroup: 'Cooling System',
      serviceName: 'Radiator Flush',
      description: 'Complete cooling system flush and refill',
      icon: 'radiator',
      estimatedDuration: 90,
      difficulty: 'medium',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'every 2-3 years',
      partsRequired: ['Coolant', 'Thermostat', 'Radiator Cap'],
      toolsRequired: ['Drain Pan', 'Funnel', 'Thermometer']
    },
    {
      serviceGroup: 'Cooling System',
      serviceName: 'Water Pump Replacement',
      description: 'Water pump replacement and cooling system service',
      icon: 'pump',
      estimatedDuration: 180,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 800,
        max: 1500,
        currency: 'EGP'
      },
      frequency: 'every 60000-100000 km',
      partsRequired: ['Water Pump', 'Gasket', 'Coolant', 'Drive Belt'],
      toolsRequired: ['Torque Wrench', 'Belt Tensioner', 'Drain Pan']
    },
    {
      serviceGroup: 'Cooling System',
      serviceName: 'Thermostat Replacement',
      description: 'Engine thermostat replacement service',
      icon: 'thermostat',
      estimatedDuration: 60,
      difficulty: 'medium',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 150,
        max: 300,
        currency: 'EGP'
      },
      frequency: 'every 50000-70000 km',
      partsRequired: ['Thermostat', 'Gasket', 'Coolant'],
      toolsRequired: ['Wrench Set', 'Drain Pan', 'Funnel']
    },
    {
      serviceGroup: 'Cooling System',
      serviceName: 'Radiator Replacement',
      description: 'Radiator replacement and cooling system repair',
      icon: 'radiator',
      estimatedDuration: 240,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 1000,
        max: 2000,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Radiator', 'Hoses', 'Coolant', 'Mounting Hardware'],
      toolsRequired: ['Torque Wrench', 'Hose Clamp Tool', 'Drain Pan']
    },

    // Fuel System Services
    {
      serviceGroup: 'Fuel System',
      serviceName: 'Fuel Filter Replacement',
      description: 'Fuel filter replacement and fuel system service',
      icon: 'filter',
      estimatedDuration: 60,
      difficulty: 'medium',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'every 20000-30000 km',
      partsRequired: ['Fuel Filter', 'Fuel Line Clamps', 'Fuel System Cleaner'],
      toolsRequired: ['Fuel Line Disconnect Tool', 'Wrench Set', 'Safety Glasses']
    },
    {
      serviceGroup: 'Fuel System',
      serviceName: 'Fuel Pump Replacement',
      description: 'Fuel pump replacement and fuel system repair',
      icon: 'pump',
      estimatedDuration: 180,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 800,
        max: 1500,
        currency: 'EGP'
      },
      frequency: 'every 100000-150000 km',
      partsRequired: ['Fuel Pump', 'Fuel Filter', 'Gasket', 'Fuel Line'],
      toolsRequired: ['Fuel Pump Tool', 'Torque Wrench', 'Safety Equipment']
    },
    {
      serviceGroup: 'Fuel System',
      serviceName: 'Fuel Injector Cleaning',
      description: 'Fuel injector cleaning and flow testing',
      icon: 'injector',
      estimatedDuration: 120,
      difficulty: 'professional',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 400,
        max: 800,
        currency: 'EGP'
      },
      frequency: 'every 30000-50000 km',
      partsRequired: ['Fuel Injector Cleaner', 'O-Rings', 'Gaskets'],
      toolsRequired: ['Injector Cleaning Machine', 'Multimeter', 'Safety Equipment']
    },

    // Exhaust System Services
    {
      serviceGroup: 'Exhaust System',
      serviceName: 'Muffler Replacement',
      description: 'Muffler replacement and exhaust system repair',
      icon: 'muffler',
      estimatedDuration: 90,
      difficulty: 'medium',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 400,
        max: 800,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Muffler', 'Exhaust Hangers', 'Gaskets'],
      toolsRequired: ['Exhaust Cutter', 'Wrench Set', 'Jack Stands']
    },
    {
      serviceGroup: 'Exhaust System',
      serviceName: 'Catalytic Converter Replacement',
      description: 'Catalytic converter replacement service',
      icon: 'converter',
      estimatedDuration: 120,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 1500,
        max: 3000,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Catalytic Converter', 'Gaskets', 'Mounting Hardware'],
      toolsRequired: ['Exhaust Cutter', 'Torque Wrench', 'Jack Stands']
    },
    {
      serviceGroup: 'Exhaust System',
      serviceName: 'Exhaust System Inspection',
      description: 'Complete exhaust system inspection and leak detection',
      icon: 'inspection',
      estimatedDuration: 60,
      difficulty: 'medium',
      category: 'inspection',
      isActive: true,
      priceRange: {
        min: 100,
        max: 200,
        currency: 'EGP'
      },
      frequency: 'every 10000-15000 km',
      partsRequired: [],
      toolsRequired: ['Smoke Machine', 'Mirror', 'Flashlight']
    },

    // Tire Services
    {
      serviceGroup: 'Tires',
      serviceName: 'Tire Rotation',
      description: 'Tire rotation and balance service',
      icon: 'tire',
      estimatedDuration: 45,
      difficulty: 'easy',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 100,
        max: 200,
        currency: 'EGP'
      },
      frequency: 'every 8000-12000 km',
      partsRequired: [],
      toolsRequired: ['Tire Machine', 'Balance Machine', 'Torque Wrench']
    },
    {
      serviceGroup: 'Tires',
      serviceName: 'Tire Alignment',
      description: 'Wheel alignment and tire balancing service',
      icon: 'alignment',
      estimatedDuration: 60,
      difficulty: 'professional',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'every 10000-15000 km',
      partsRequired: [],
      toolsRequired: ['Alignment Machine', 'Balance Machine', 'Measuring Tools']
    },
    {
      serviceGroup: 'Tires',
      serviceName: 'Tire Mounting',
      description: 'Tire mounting and balancing service',
      icon: 'mount',
      estimatedDuration: 30,
      difficulty: 'medium',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 50,
        max: 100,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Tire', 'Valve Stem', 'Wheel Weights'],
      toolsRequired: ['Tire Machine', 'Balance Machine', 'Torque Wrench']
    },

    // Air Conditioning Services
    {
      serviceGroup: 'Air Conditioning',
      serviceName: 'AC System Recharge',
      description: 'Air conditioning system recharge and leak test',
      icon: 'snowflake',
      estimatedDuration: 60,
      difficulty: 'professional',
      category: 'maintenance',
      isActive: true,
      priceRange: {
        min: 300,
        max: 600,
        currency: 'EGP'
      },
      frequency: 'every 1-2 years',
      partsRequired: ['Refrigerant', 'Oil', 'Dye'],
      toolsRequired: ['AC Machine', 'Leak Detector', 'Manifold Gauge']
    },
    {
      serviceGroup: 'Air Conditioning',
      serviceName: 'AC Compressor Replacement',
      description: 'Air conditioning compressor replacement service',
      icon: 'compressor',
      estimatedDuration: 180,
      difficulty: 'professional',
      category: 'repair',
      isActive: true,
      priceRange: {
        min: 1500,
        max: 3000,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['AC Compressor', 'Refrigerant', 'Oil', 'O-Rings'],
      toolsRequired: ['AC Machine', 'Torque Wrench', 'Vacuum Pump']
    },
    {
      serviceGroup: 'Air Conditioning',
      serviceName: 'AC System Diagnostic',
      description: 'Air conditioning system diagnostic and testing',
      icon: 'stethoscope',
      estimatedDuration: 60,
      difficulty: 'professional',
      category: 'diagnostic',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: [],
      toolsRequired: ['Manifold Gauge', 'Leak Detector', 'Thermometer']
    },

    // General Services
    {
      serviceGroup: 'General',
      serviceName: 'Vehicle Inspection',
      description: 'Complete vehicle safety and mechanical inspection',
      icon: 'inspection',
      estimatedDuration: 90,
      difficulty: 'professional',
      category: 'inspection',
      isActive: true,
      priceRange: {
        min: 200,
        max: 400,
        currency: 'EGP'
      },
      frequency: 'annually',
      partsRequired: [],
      toolsRequired: ['Inspection Checklist', 'Multimeter', 'Jack Stands']
    },
    {
      serviceGroup: 'General',
      serviceName: 'Pre-purchase Inspection',
      description: 'Comprehensive pre-purchase vehicle inspection',
      icon: 'magnifying-glass',
      estimatedDuration: 120,
      difficulty: 'professional',
      category: 'inspection',
      isActive: true,
      priceRange: {
        min: 500,
        max: 1000,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: [],
      toolsRequired: ['Inspection Checklist', 'Multimeter', 'Compression Tester']
    },
    {
      serviceGroup: 'General',
      serviceName: 'Roadside Assistance',
      description: 'Emergency roadside assistance and towing service',
      icon: 'truck',
      estimatedDuration: 60,
      difficulty: 'professional',
      category: 'emergency',
      isActive: true,
      priceRange: {
        min: 200,
        max: 500,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: [],
      toolsRequired: ['Tow Truck', 'Jumper Cables', 'Basic Tools']
    },
    {
      serviceGroup: 'General',
      serviceName: 'Vehicle Detailing',
      description: 'Complete vehicle interior and exterior detailing',
      icon: 'sparkles',
      estimatedDuration: 180,
      difficulty: 'easy',
      category: 'cosmetic',
      isActive: true,
      priceRange: {
        min: 300,
        max: 800,
        currency: 'EGP'
      },
      frequency: 'as needed',
      partsRequired: ['Cleaning Products', 'Wax', 'Polish'],
      toolsRequired: ['Pressure Washer', 'Vacuum', 'Microfiber Cloths']
    }
  ]
};

module.exports = serviceCatalogData;
