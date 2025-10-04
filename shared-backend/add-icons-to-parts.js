const mongoose = require('mongoose');

// Direct MongoDB connection
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';

// Icon mapping function
const getPartIcon = (part) => {
  const iconBaseUrl = 'https://img.icons8.com/color/96/';
  
  // Category-based icons
  const categoryIcons = {
    'engine': 'engine.png',
    'brakes': 'brake-disc.png',
    'body': 'car.png',
    'suspension': 'car-suspension.png',
    'transmission': 'gear.png',
    'electrical': 'electrical.png',
    'accessories': 'car-accessories.png',
    'cooling': 'radiator.png',
    'fuel': 'fuel-pump.png',
    'exhaust': 'exhaust-pipe.png',
    'tires': 'tire.png',
    'battery': 'battery.png',
    'filters': 'filter.png',
    'fluids': 'oil-can.png',
    'lighting': 'car-light.png',
    'interior': 'car-seat.png',
    'exterior': 'car-paint.png',
    'other': 'car-part.png'
  };

  // Specific part icons based on name
  const specificIcons = {
    // Engine parts
    'Engine Block': 'engine.png',
    'Cylinder Head': 'engine.png',
    'Piston': 'piston.png',
    'Crankshaft': 'crankshaft.png',
    'Camshaft': 'camshaft.png',
    'Timing Belt': 'timing-belt.png',
    'Oil Filter': 'oil-filter.png',
    'Air Filter': 'air-filter.png',
    'Spark Plug': 'spark-plug.png',
    'Fuel Injector': 'fuel-injector.png',
    'Turbocharger': 'turbo.png',
    'Supercharger': 'supercharger.png',
    
    // Brake parts
    'Brake Pad': 'brake-pad.png',
    'Brake Disc': 'brake-disc.png',
    'Brake Caliper': 'brake-caliper.png',
    'Brake Line': 'brake-line.png',
    'Brake Fluid': 'brake-fluid.png',
    'Master Cylinder': 'brake-cylinder.png',
    
    // Body parts
    'Bumper': 'car-bumper.png',
    'Door': 'car-door.png',
    'Hood': 'car-hood.png',
    'Trunk': 'car-trunk.png',
    'Fender': 'car-fender.png',
    'Mirror': 'car-mirror.png',
    'Window': 'car-window.png',
    'Windshield': 'windshield.png',
    
    // Suspension parts
    'Shock Absorber': 'shock-absorber.png',
    'Strut': 'strut.png',
    'Spring': 'spring.png',
    'Control Arm': 'control-arm.png',
    'Ball Joint': 'ball-joint.png',
    'Tie Rod': 'tie-rod.png',
    
    // Transmission parts
    'Clutch': 'clutch.png',
    'Transmission': 'transmission.png',
    'Gear': 'gear.png',
    'Differential': 'differential.png',
    'CV Joint': 'cv-joint.png',
    'Drive Shaft': 'drive-shaft.png',
    
    // Electrical parts
    'Battery': 'battery.png',
    'Alternator': 'alternator.png',
    'Starter': 'starter.png',
    'Fuse': 'fuse.png',
    'Relay': 'relay.png',
    'Wiring Harness': 'wiring.png',
    'ECU': 'ecu.png',
    'Sensor': 'sensor.png',
    
    // Tires and wheels
    'Tire': 'tire.png',
    'Wheel': 'wheel.png',
    'Rim': 'rim.png',
    'Tire Valve': 'tire-valve.png',
    
    // Lights
    'Headlight': 'headlight.png',
    'Taillight': 'taillight.png',
    'Turn Signal': 'turn-signal.png',
    'Fog Light': 'fog-light.png',
    
    // Interior
    'Seat': 'car-seat.png',
    'Steering Wheel': 'steering-wheel.png',
    'Dashboard': 'dashboard.png',
    'Airbag': 'airbag.png',
    
    // Fluids
    'Engine Oil': 'oil-can.png',
    'Coolant': 'coolant.png',
    'Brake Fluid': 'brake-fluid.png',
    'Transmission Fluid': 'transmission-fluid.png',
    'Power Steering Fluid': 'power-steering-fluid.png',
    
    // Filters
    'Oil Filter': 'oil-filter.png',
    'Air Filter': 'air-filter.png',
    'Fuel Filter': 'fuel-filter.png',
    'Cabin Filter': 'cabin-filter.png',
    
    // Gaskets and seals
    'Gasket': 'gasket.png',
    'Seal': 'seal.png',
    'O-Ring': 'o-ring.png',
    
    // Bolts and fasteners
    'Bolt': 'bolt.png',
    'Screw': 'screw.png',
    'Nut': 'nut.png',
    'Washer': 'washer.png',
    'Clip': 'clip.png',
    'Bracket': 'bracket.png',
    
    // Hoses and tubes
    'Hose': 'hose.png',
    'Tube': 'tube.png',
    'Pipe': 'pipe.png',
    
    // Belts and chains
    'Belt': 'belt.png',
    'Chain': 'chain.png',
    'Pulley': 'pulley.png',
    
    // Sensors
    'Oxygen Sensor': 'oxygen-sensor.png',
    'Temperature Sensor': 'temperature-sensor.png',
    'Pressure Sensor': 'pressure-sensor.png',
    'Speed Sensor': 'speed-sensor.png',
    'ABS Sensor': 'abs-sensor.png',
    
    // Cooling system
    'Radiator': 'radiator.png',
    'Water Pump': 'water-pump.png',
    'Thermostat': 'thermostat.png',
    'Cooling Fan': 'cooling-fan.png',
    
    // Exhaust system
    'Catalytic Converter': 'catalytic-converter.png',
    'Muffler': 'muffler.png',
    'Exhaust Manifold': 'exhaust-manifold.png',
    'Exhaust Pipe': 'exhaust-pipe.png',
    
    // Fuel system
    'Fuel Pump': 'fuel-pump.png',
    'Fuel Tank': 'fuel-tank.png',
    'Fuel Line': 'fuel-line.png',
    'Carburetor': 'carburetor.png',
    
    // Accessories
    'Car Cover': 'car-cover.png',
    'Floor Mat': 'floor-mat.png',
    'Cargo Liner': 'cargo-liner.png',
    'Phone Mount': 'phone-mount.png',
    'USB Charger': 'usb-charger.png',
    'Dash Cam': 'dash-cam.png',
    'GPS': 'gps.png',
    'Bluetooth': 'bluetooth.png'
  };

  // Check for specific part icon first
  if (specificIcons[part.name]) {
    return iconBaseUrl + specificIcons[part.name];
  }
  
  // Check for subcategory-based icons
  if (part.subcategory) {
    const subcategoryIcons = {
      'engine_block': 'engine.png',
      'gaskets': 'gasket.png',
      'pistons': 'piston.png',
      'valves': 'valve.png',
      'bearings': 'bearing.png',
      'oil_system': 'oil-can.png',
      'cooling_system': 'radiator.png',
      'ignition': 'spark-plug.png',
      'fuel_system': 'fuel-pump.png',
      'exhaust_system': 'exhaust-pipe.png',
      'brake_pads': 'brake-pad.png',
      'brake_discs': 'brake-disc.png',
      'brake_calipers': 'brake-caliper.png',
      'brake_lines': 'brake-line.png',
      'brake_fluid': 'brake-fluid.png',
      'body_panels': 'car.png',
      'doors': 'car-door.png',
      'windows': 'car-window.png',
      'lights': 'car-light.png',
      'mirrors': 'car-mirror.png',
      'bumpers': 'car-bumper.png',
      'shocks': 'shock-absorber.png',
      'springs': 'spring.png',
      'control_arms': 'control-arm.png',
      'ball_joints': 'ball-joint.png',
      'tie_rods': 'tie-rod.png',
      'clutch_system': 'clutch.png',
      'transmission_gears': 'gear.png',
      'differential': 'differential.png',
      'cv_joints': 'cv-joint.png',
      'drive_shafts': 'drive-shaft.png',
      'battery_system': 'battery.png',
      'charging_system': 'alternator.png',
      'starting_system': 'starter.png',
      'lighting_system': 'car-light.png',
      'sensors': 'sensor.png',
      'wiring': 'wiring.png',
      'tires': 'tire.png',
      'wheels': 'wheel.png',
      'interior_parts': 'car-seat.png',
      'exterior_parts': 'car-paint.png',
      'filters': 'filter.png',
      'fluids': 'oil-can.png',
      'fasteners': 'bolt.png',
      'hoses': 'hose.png',
      'belts': 'belt.png',
      'accessories': 'car-accessories.png'
    };
    
    if (subcategoryIcons[part.subcategory]) {
      return iconBaseUrl + subcategoryIcons[part.subcategory];
    }
  }
  
  // Fall back to category icon
  if (categoryIcons[part.category]) {
    return iconBaseUrl + categoryIcons[part.category];
  }
  
  // Default icon
  return iconBaseUrl + 'car-part.png';
};

async function addIconsToParts() {
  try {
    console.log('🚗 Adding icons to all car parts...');
    console.log('🎨 Updating existing parts with appropriate icons');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all existing parts
    const existingParts = await mongoose.connection.db.collection('car_parts').find({}).toArray();
    console.log(`📊 Found ${existingParts.length} existing parts`);
    
    let updatedCount = 0;
    
    // Update each part with an icon
    for (const part of existingParts) {
      const icon = getPartIcon(part);
      
      const result = await mongoose.connection.db.collection('car_parts').updateOne(
        { _id: part._id },
        { 
          $set: { 
            icon: icon,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        updatedCount++;
        console.log(`✅ Updated ${part.name} with icon: ${icon}`);
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Updated: ${updatedCount} parts with icons`);
    console.log(`📝 Total parts processed: ${existingParts.length}`);
    
    // Show sample updated parts
    const sampleParts = await mongoose.connection.db.collection('car_parts').find({}).limit(5).toArray();
    console.log('\n🔍 Sample parts with icons:');
    sampleParts.forEach(part => {
      console.log(`${part.name}: ${part.icon}`);
    });
    
    console.log('\n🎉 Car parts icon update completed!');
    console.log('✨ All parts now have appropriate icons!');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addIconsToParts();
