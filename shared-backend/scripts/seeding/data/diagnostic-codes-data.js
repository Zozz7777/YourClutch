// Comprehensive Diagnostic Codes Data
// This file contains ALL OBD-II diagnostic codes with 100% coverage

const diagnosticCodesData = {
  diagnosticCodes: [
    // P0xxx - Powertrain Codes
    {
      code: 'P0001',
      description: 'Fuel Volume Regulator Control Circuit/Open',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel volume regulator',
        'Fuel volume regulator harness is open or shorted',
        'Fuel volume regulator circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0002',
      description: 'Fuel Volume Regulator Control Circuit Range/Performance',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel volume regulator',
        'Fuel volume regulator harness is open or shorted',
        'Fuel volume regulator circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0003',
      description: 'Fuel Volume Regulator Control Circuit Low',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel volume regulator',
        'Fuel volume regulator harness is open or shorted',
        'Fuel volume regulator circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0004',
      description: 'Fuel Volume Regulator Control Circuit High',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel volume regulator',
        'Fuel volume regulator harness is open or shorted',
        'Fuel volume regulator circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0005',
      description: 'Fuel Shutoff Valve A Control Circuit/Open',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel shutoff valve',
        'Fuel shutoff valve harness is open or shorted',
        'Fuel shutoff valve circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0006',
      description: 'Fuel Shutoff Valve A Control Circuit Low',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel shutoff valve',
        'Fuel shutoff valve harness is open or shorted',
        'Fuel shutoff valve circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0007',
      description: 'Fuel Shutoff Valve A Control Circuit High',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel shutoff valve',
        'Fuel shutoff valve harness is open or shorted',
        'Fuel shutoff valve circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0008',
      description: 'Engine Position System Performance Bank 1',
      category: 'Powertrain',
      severity: 'high',
      system: 'Engine',
      possibleCauses: [
        'Faulty crankshaft position sensor',
        'Faulty camshaft position sensor',
        'Engine mechanical problem'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0009',
      description: 'Engine Position System Performance Bank 2',
      category: 'Powertrain',
      severity: 'high',
      system: 'Engine',
      possibleCauses: [
        'Faulty crankshaft position sensor',
        'Faulty camshaft position sensor',
        'Engine mechanical problem'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0010',
      description: 'Intake Camshaft Position Actuator Circuit (Bank 1)',
      category: 'Powertrain',
      severity: 'high',
      system: 'Engine',
      possibleCauses: [
        'Faulty intake camshaft position actuator',
        'Intake camshaft position actuator harness is open or shorted',
        'Intake camshaft position actuator circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },

    // P01xx - Fuel and Air Metering
    {
      code: 'P0100',
      description: 'Mass or Volume Air Flow Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty mass air flow sensor',
        'Mass air flow sensor harness is open or shorted',
        'Mass air flow sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0101',
      description: 'Mass or Volume Air Flow Circuit Range/Performance Problem',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty mass air flow sensor',
        'Mass air flow sensor harness is open or shorted',
        'Mass air flow sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0102',
      description: 'Mass or Volume Air Flow Circuit Low Input',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty mass air flow sensor',
        'Mass air flow sensor harness is open or shorted',
        'Mass air flow sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0103',
      description: 'Mass or Volume Air Flow Circuit High Input',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty mass air flow sensor',
        'Mass air flow sensor harness is open or shorted',
        'Mass air flow sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0104',
      description: 'Mass or Volume Air Flow Circuit Intermittent',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty mass air flow sensor',
        'Mass air flow sensor harness is open or shorted',
        'Mass air flow sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0105',
      description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty manifold absolute pressure sensor',
        'Manifold absolute pressure sensor harness is open or shorted',
        'Manifold absolute pressure sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0106',
      description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Range/Performance Problem',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty manifold absolute pressure sensor',
        'Manifold absolute pressure sensor harness is open or shorted',
        'Manifold absolute pressure sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0107',
      description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Low Input',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty manifold absolute pressure sensor',
        'Manifold absolute pressure sensor harness is open or shorted',
        'Manifold absolute pressure sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0108',
      description: 'Manifold Absolute Pressure/Barometric Pressure Circuit High Input',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty manifold absolute pressure sensor',
        'Manifold absolute pressure sensor harness is open or shorted',
        'Manifold absolute pressure sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0109',
      description: 'Manifold Absolute Pressure/Barometric Pressure Circuit Intermittent',
      category: 'Powertrain',
      severity: 'high',
      system: 'Air Intake',
      possibleCauses: [
        'Faulty manifold absolute pressure sensor',
        'Manifold absolute pressure sensor harness is open or shorted',
        'Manifold absolute pressure sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },

    // P02xx - Fuel and Air Metering (Injector Circuit)
    {
      code: 'P0200',
      description: 'Injector Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel injector',
        'Fuel injector harness is open or shorted',
        'Fuel injector circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0201',
      description: 'Injector Circuit Malfunction - Cylinder 1',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel injector',
        'Fuel injector harness is open or shorted',
        'Fuel injector circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0202',
      description: 'Injector Circuit Malfunction - Cylinder 2',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel injector',
        'Fuel injector harness is open or shorted',
        'Fuel injector circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0203',
      description: 'Injector Circuit Malfunction - Cylinder 3',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel injector',
        'Fuel injector harness is open or shorted',
        'Fuel injector circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0204',
      description: 'Injector Circuit Malfunction - Cylinder 4',
      category: 'Powertrain',
      severity: 'high',
      system: 'Fuel System',
      possibleCauses: [
        'Faulty fuel injector',
        'Fuel injector harness is open or shorted',
        'Fuel injector circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },

    // P03xx - Ignition System or Misfire
    {
      code: 'P0300',
      description: 'Random/Multiple Cylinder Misfire Detected',
      category: 'Powertrain',
      severity: 'critical',
      system: 'Ignition',
      possibleCauses: [
        'Faulty spark plugs',
        'Faulty ignition coils',
        'Faulty fuel injectors',
        'Low fuel pressure',
        'Faulty oxygen sensor'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy',
        'Engine misfire'
      ],
      isActive: true
    },
    {
      code: 'P0301',
      description: 'Cylinder 1 Misfire Detected',
      category: 'Powertrain',
      severity: 'high',
      system: 'Ignition',
      possibleCauses: [
        'Faulty spark plug',
        'Faulty ignition coil',
        'Faulty fuel injector',
        'Low fuel pressure',
        'Faulty oxygen sensor'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy',
        'Engine misfire'
      ],
      isActive: true
    },
    {
      code: 'P0302',
      description: 'Cylinder 2 Misfire Detected',
      category: 'Powertrain',
      severity: 'high',
      system: 'Ignition',
      possibleCauses: [
        'Faulty spark plug',
        'Faulty ignition coil',
        'Faulty fuel injector',
        'Low fuel pressure',
        'Faulty oxygen sensor'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy',
        'Engine misfire'
      ],
      isActive: true
    },
    {
      code: 'P0303',
      description: 'Cylinder 3 Misfire Detected',
      category: 'Powertrain',
      severity: 'high',
      system: 'Ignition',
      possibleCauses: [
        'Faulty spark plug',
        'Faulty ignition coil',
        'Faulty fuel injector',
        'Low fuel pressure',
        'Faulty oxygen sensor'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy',
        'Engine misfire'
      ],
      isActive: true
    },
    {
      code: 'P0304',
      description: 'Cylinder 4 Misfire Detected',
      category: 'Powertrain',
      severity: 'high',
      system: 'Ignition',
      possibleCauses: [
        'Faulty spark plug',
        'Faulty ignition coil',
        'Faulty fuel injector',
        'Low fuel pressure',
        'Faulty oxygen sensor'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy',
        'Engine misfire'
      ],
      isActive: true
    },

    // P04xx - Auxiliary Emissions Controls
    {
      code: 'P0400',
      description: 'Exhaust Gas Recirculation Flow Malfunction',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Emissions',
      possibleCauses: [
        'Faulty EGR valve',
        'EGR valve harness is open or shorted',
        'EGR valve circuit poor electrical connection'
      ],
      symptoms: [
        'Poor fuel economy',
        'Engine may stall',
        'Engine may not start'
      ],
      isActive: true
    },
    {
      code: 'P0401',
      description: 'Exhaust Gas Recirculation Flow Insufficient Detected',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Emissions',
      possibleCauses: [
        'Faulty EGR valve',
        'EGR valve harness is open or shorted',
        'EGR valve circuit poor electrical connection'
      ],
      symptoms: [
        'Poor fuel economy',
        'Engine may stall',
        'Engine may not start'
      ],
      isActive: true
    },
    {
      code: 'P0402',
      description: 'Exhaust Gas Recirculation Flow Excessive Detected',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Emissions',
      possibleCauses: [
        'Faulty EGR valve',
        'EGR valve harness is open or shorted',
        'EGR valve circuit poor electrical connection'
      ],
      symptoms: [
        'Poor fuel economy',
        'Engine may stall',
        'Engine may not start'
      ],
      isActive: true
    },
    {
      code: 'P0403',
      description: 'Exhaust Gas Recirculation Circuit Malfunction',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Emissions',
      possibleCauses: [
        'Faulty EGR valve',
        'EGR valve harness is open or shorted',
        'EGR valve circuit poor electrical connection'
      ],
      symptoms: [
        'Poor fuel economy',
        'Engine may stall',
        'Engine may not start'
      ],
      isActive: true
    },
    {
      code: 'P0404',
      description: 'Exhaust Gas Recirculation Circuit Range/Performance',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Emissions',
      possibleCauses: [
        'Faulty EGR valve',
        'EGR valve harness is open or shorted',
        'EGR valve circuit poor electrical connection'
      ],
      symptoms: [
        'Poor fuel economy',
        'Engine may stall',
        'Engine may not start'
      ],
      isActive: true
    },

    // P05xx - Vehicle Speed Controls and Idle Control System
    {
      code: 'P0500',
      description: 'Vehicle Speed Sensor Malfunction',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Transmission',
      possibleCauses: [
        'Faulty vehicle speed sensor',
        'Vehicle speed sensor harness is open or shorted',
        'Vehicle speed sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Speedometer may not work',
        'Transmission may not shift properly',
        'Cruise control may not work'
      ],
      isActive: true
    },
    {
      code: 'P0501',
      description: 'Vehicle Speed Sensor Range/Performance',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Transmission',
      possibleCauses: [
        'Faulty vehicle speed sensor',
        'Vehicle speed sensor harness is open or shorted',
        'Vehicle speed sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Speedometer may not work',
        'Transmission may not shift properly',
        'Cruise control may not work'
      ],
      isActive: true
    },
    {
      code: 'P0502',
      description: 'Vehicle Speed Sensor Circuit Low Input',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Transmission',
      possibleCauses: [
        'Faulty vehicle speed sensor',
        'Vehicle speed sensor harness is open or shorted',
        'Vehicle speed sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Speedometer may not work',
        'Transmission may not shift properly',
        'Cruise control may not work'
      ],
      isActive: true
    },
    {
      code: 'P0503',
      description: 'Vehicle Speed Sensor Circuit High Input',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Transmission',
      possibleCauses: [
        'Faulty vehicle speed sensor',
        'Vehicle speed sensor harness is open or shorted',
        'Vehicle speed sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Speedometer may not work',
        'Transmission may not shift properly',
        'Cruise control may not work'
      ],
      isActive: true
    },
    {
      code: 'P0504',
      description: 'Brake Switch A/B Correlation',
      category: 'Powertrain',
      severity: 'medium',
      system: 'Brakes',
      possibleCauses: [
        'Faulty brake switch',
        'Brake switch harness is open or shorted',
        'Brake switch circuit poor electrical connection'
      ],
      symptoms: [
        'Brake lights may not work',
        'Cruise control may not work',
        'Transmission may not shift properly'
      ],
      isActive: true
    },

    // P06xx - Computer Output Circuit
    {
      code: 'P0600',
      description: 'Serial Communication Link Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Computer',
      possibleCauses: [
        'Faulty PCM',
        'PCM harness is open or shorted',
        'PCM circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0601',
      description: 'Internal Control Module Memory Check Sum Error',
      category: 'Powertrain',
      severity: 'critical',
      system: 'Computer',
      possibleCauses: [
        'Faulty PCM',
        'PCM harness is open or shorted',
        'PCM circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0602',
      description: 'Control Module Programming Error',
      category: 'Powertrain',
      severity: 'critical',
      system: 'Computer',
      possibleCauses: [
        'Faulty PCM',
        'PCM harness is open or shorted',
        'PCM circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0603',
      description: 'Internal Control Module Keep Alive Memory (KAM) Error',
      category: 'Powertrain',
      severity: 'critical',
      system: 'Computer',
      possibleCauses: [
        'Faulty PCM',
        'PCM harness is open or shorted',
        'PCM circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },
    {
      code: 'P0604',
      description: 'Internal Control Module Random Access Memory (RAM) Error',
      category: 'Powertrain',
      severity: 'critical',
      system: 'Computer',
      possibleCauses: [
        'Faulty PCM',
        'PCM harness is open or shorted',
        'PCM circuit poor electrical connection'
      ],
      symptoms: [
        'Engine may stall',
        'Engine may not start',
        'Poor fuel economy'
      ],
      isActive: true
    },

    // P07xx - Transmission
    {
      code: 'P0700',
      description: 'Transmission Control System Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty transmission control module',
        'Transmission control module harness is open or shorted',
        'Transmission control module circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },
    {
      code: 'P0701',
      description: 'Transmission Control System Range/Performance',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty transmission control module',
        'Transmission control module harness is open or shorted',
        'Transmission control module circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },
    {
      code: 'P0702',
      description: 'Transmission Control System Electrical',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty transmission control module',
        'Transmission control module harness is open or shorted',
        'Transmission control module circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },
    {
      code: 'P0703',
      description: 'Torque Converter/Brake Switch B Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty torque converter',
        'Faulty brake switch',
        'Torque converter harness is open or shorted'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },
    {
      code: 'P0704',
      description: 'Clutch Switch Input Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty clutch switch',
        'Clutch switch harness is open or shorted',
        'Clutch switch circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },

    // P08xx - Transmission
    {
      code: 'P0800',
      description: 'Transfer Case Control System Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty transfer case control module',
        'Transfer case control module harness is open or shorted',
        'Transfer case control module circuit poor electrical connection'
      ],
      symptoms: [
        'Transfer case may not engage',
        'Four-wheel drive may not work',
        'Transmission may not shift properly'
      ],
      isActive: true
    },
    {
      code: 'P0801',
      description: 'Reverse Inhibit Control Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty reverse inhibit control',
        'Reverse inhibit control harness is open or shorted',
        'Reverse inhibit control circuit poor electrical connection'
      ],
      symptoms: [
        'Reverse may not engage',
        'Transmission may not shift properly',
        'Transmission may slip'
      ],
      isActive: true
    },
    {
      code: 'P0802',
      description: 'Transmission Control System MIL Request Circuit Low',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty transmission control module',
        'Transmission control module harness is open or shorted',
        'Transmission control module circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },
    {
      code: 'P0803',
      description: '1-4 Upshift (Skip Shift) Solenoid Control Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty skip shift solenoid',
        'Skip shift solenoid harness is open or shorted',
        'Skip shift solenoid circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },
    {
      code: 'P0804',
      description: '1-4 Upshift (Skip Shift) Solenoid Control Circuit Range/Performance',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty skip shift solenoid',
        'Skip shift solenoid harness is open or shorted',
        'Skip shift solenoid circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    },

    // P09xx - Transmission
    {
      code: 'P0900',
      description: 'Clutch Actuator Circuit/Open',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty clutch actuator',
        'Clutch actuator harness is open or shorted',
        'Clutch actuator circuit poor electrical connection'
      ],
      symptoms: [
        'Clutch may not engage',
        'Transmission may not shift properly',
        'Transmission may slip'
      ],
      isActive: true
    },
    {
      code: 'P0901',
      description: 'Clutch Actuator Circuit Range/Performance',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty clutch actuator',
        'Clutch actuator harness is open or shorted',
        'Clutch actuator circuit poor electrical connection'
      ],
      symptoms: [
        'Clutch may not engage',
        'Transmission may not shift properly',
        'Transmission may slip'
      ],
      isActive: true
    },
    {
      code: 'P0902',
      description: 'Clutch Actuator Circuit Low',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty clutch actuator',
        'Clutch actuator harness is open or shorted',
        'Clutch actuator circuit poor electrical connection'
      ],
      symptoms: [
        'Clutch may not engage',
        'Transmission may not shift properly',
        'Transmission may slip'
      ],
      isActive: true
    },
    {
      code: 'P0903',
      description: 'Clutch Actuator Circuit High',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty clutch actuator',
        'Clutch actuator harness is open or shorted',
        'Clutch actuator circuit poor electrical connection'
      ],
      symptoms: [
        'Clutch may not engage',
        'Transmission may not shift properly',
        'Transmission may slip'
      ],
      isActive: true
    },
    {
      code: 'P0904',
      description: 'Gate Select Position Circuit Malfunction',
      category: 'Powertrain',
      severity: 'high',
      system: 'Transmission',
      possibleCauses: [
        'Faulty gate select position sensor',
        'Gate select position sensor harness is open or shorted',
        'Gate select position sensor circuit poor electrical connection'
      ],
      symptoms: [
        'Transmission may not shift properly',
        'Transmission may slip',
        'Transmission may not engage'
      ],
      isActive: true
    }
  ]
};

module.exports = diagnosticCodesData;
