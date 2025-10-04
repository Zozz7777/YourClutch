// Real Car Trims Data for Egypt Market
// This file contains the actual, specific trim levels for each car brand and model

const realCarTrimsData = {
  brands: [
    // TOYOTA - Real Trim Levels
    {
      name: 'Toyota',
      models: [
        {
          name: 'Corolla',
          trims: [
            'L', 'LE', 'XLE', 'SE', 'XSE', 'Hybrid LE', 'Hybrid XLE', 'GR Corolla'
          ]
        },
        {
          name: 'Camry',
          trims: [
            'L', 'LE', 'SE', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid XLE', 'Hybrid SE'
          ]
        },
        {
          name: 'RAV4',
          trims: [
            'LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE', 'Prime SE', 'Prime XSE'
          ]
        },
        {
          name: 'Prius',
          trims: [
            'LE', 'XLE', 'Limited', 'Prime LE', 'Prime XLE', 'Prime Limited'
          ]
        },
        {
          name: 'Highlander',
          trims: [
            'L', 'LE', 'XLE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE', 'Hybrid Limited', 'Hybrid Platinum'
          ]
        },
        {
          name: 'Land Cruiser',
          trims: [
            'Base', 'GX-R', 'VX-R', 'VX-R Limited', 'Heritage Edition'
          ]
        },
        {
          name: 'Hilux',
          trims: [
            'Single Cab', 'Double Cab', 'Extra Cab', 'SR', 'SR5', 'TRD Sport', 'TRD Off-Road'
          ]
        },
        {
          name: 'Avalon',
          trims: [
            'XLE', 'XSE', 'Limited', 'Touring', 'Hybrid XLE', 'Hybrid Limited'
          ]
        },
        {
          name: 'Sienna',
          trims: [
            'LE', 'XLE', 'XSE', 'Limited', 'Platinum'
          ]
        },
        {
          name: 'Tacoma',
          trims: [
            'SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'Limited', 'TRD Pro'
          ]
        }
      ]
    },

    // HYUNDAI - Real Trim Levels
    {
      name: 'Hyundai',
      models: [
        {
          name: 'Elantra',
          trims: [
            'SE', 'SEL', 'Limited', 'N Line', 'Hybrid Blue', 'Hybrid Limited'
          ]
        },
        {
          name: 'Sonata',
          trims: [
            'SE', 'SEL', 'SEL Plus', 'Limited', 'N Line', 'Hybrid Blue', 'Hybrid Limited'
          ]
        },
        {
          name: 'Tucson',
          trims: [
            'SE', 'SEL', 'SEL Convenience', 'Limited', 'N Line', 'Hybrid Blue', 'Hybrid SEL', 'Hybrid Limited'
          ]
        },
        {
          name: 'Santa Fe',
          trims: [
            'SE', 'SEL', 'SEL Premium', 'Limited', 'Calligraphy', 'Hybrid SEL', 'Hybrid Limited', 'Hybrid Calligraphy'
          ]
        },
        {
          name: 'Palisade',
          trims: [
            'SE', 'SEL', 'Limited', 'Calligraphy'
          ]
        },
        {
          name: 'Kona',
          trims: [
            'SE', 'SEL', 'Limited', 'N Line', 'Electric SE', 'Electric Limited'
          ]
        },
        {
          name: 'Veloster',
          trims: [
            '2.0', 'Turbo', 'Turbo R-Spec', 'N'
          ]
        },
        {
          name: 'Genesis',
          trims: [
            'G70 2.0T', 'G70 3.3T', 'G70 3.3T Sport', 'G80 2.5T', 'G80 3.5T', 'G80 3.5T Sport', 'G90 3.3T', 'G90 5.0L'
          ]
        }
      ]
    },

    // BMW - Real Trim Levels
    {
      name: 'BMW',
      models: [
        {
          name: '3 Series',
          trims: [
            '320i', '330i', '330e', 'M340i', 'M340i xDrive', 'M3', 'M3 Competition'
          ]
        },
        {
          name: '5 Series',
          trims: [
            '530i', '530i xDrive', '530e', '540i', '540i xDrive', 'M550i xDrive', 'M5', 'M5 Competition'
          ]
        },
        {
          name: 'X3',
          trims: [
            'sDrive30i', 'xDrive30i', 'M40i', 'X3 M', 'X3 M Competition'
          ]
        },
        {
          name: 'X5',
          trims: [
            'sDrive40i', 'xDrive40i', 'xDrive50i', 'M50i', 'X5 M', 'X5 M Competition'
          ]
        },
        {
          name: 'X1',
          trims: [
            'sDrive28i', 'xDrive28i'
          ]
        },
        {
          name: 'X7',
          trims: [
            'xDrive40i', 'xDrive50i', 'M50i', 'Alpina XB7'
          ]
        },
        {
          name: '7 Series',
          trims: [
            '740i', '740i xDrive', '750i xDrive', 'M760i xDrive', 'Alpina B7'
          ]
        },
        {
          name: 'Z4',
          trims: [
            'sDrive30i', 'M40i'
          ]
        }
      ]
    },

    // MERCEDES-BENZ - Real Trim Levels
    {
      name: 'Mercedes-Benz',
      models: [
        {
          name: 'C-Class',
          trims: [
            'C200', 'C300', 'C300 4MATIC', 'C43 AMG', 'C63 AMG', 'C63 S AMG'
          ]
        },
        {
          name: 'E-Class',
          trims: [
            'E200', 'E300', 'E300 4MATIC', 'E350', 'E350 4MATIC', 'E43 AMG', 'E53 AMG', 'E63 AMG', 'E63 S AMG'
          ]
        },
        {
          name: 'S-Class',
          trims: [
            'S450', 'S450 4MATIC', 'S500', 'S500 4MATIC', 'S560', 'S560 4MATIC', 'S63 AMG', 'S65 AMG', 'Maybach S450', 'Maybach S560', 'Maybach S650'
          ]
        },
        {
          name: 'GLC',
          trims: [
            'GLC200', 'GLC300', 'GLC300 4MATIC', 'GLC43 AMG', 'GLC63 AMG', 'GLC63 S AMG'
          ]
        },
        {
          name: 'GLE',
          trims: [
            'GLE300d', 'GLE350', 'GLE350 4MATIC', 'GLE450 4MATIC', 'GLE53 AMG', 'GLE63 AMG', 'GLE63 S AMG'
          ]
        },
        {
          name: 'GLS',
          trims: [
            'GLS450', 'GLS450 4MATIC', 'GLS550', 'GLS550 4MATIC', 'GLS63 AMG', 'Maybach GLS600'
          ]
        },
        {
          name: 'A-Class',
          trims: [
            'A180', 'A200', 'A220', 'A220 4MATIC', 'A35 AMG', 'A45 AMG', 'A45 S AMG'
          ]
        },
        {
          name: 'CLA',
          trims: [
            'CLA200', 'CLA220', 'CLA220 4MATIC', 'CLA250', 'CLA250 4MATIC', 'CLA35 AMG', 'CLA45 AMG', 'CLA45 S AMG'
          ]
        }
      ]
    },

    // AUDI - Real Trim Levels
    {
      name: 'Audi',
      models: [
        {
          name: 'A3',
          trims: [
            'A3 35 TFSI', 'A3 40 TFSI', 'A3 40 TFSI quattro', 'S3', 'RS3'
          ]
        },
        {
          name: 'A4',
          trims: [
            'A4 35 TFSI', 'A4 40 TFSI', 'A4 40 TFSI quattro', 'A4 45 TFSI quattro', 'S4', 'RS4'
          ]
        },
        {
          name: 'A6',
          trims: [
            'A6 40 TDI', 'A6 45 TFSI', 'A6 45 TFSI quattro', 'A6 55 TFSI quattro', 'S6', 'RS6'
          ]
        },
        {
          name: 'A8',
          trims: [
            'A8 50 TDI', 'A8 55 TFSI', 'A8 55 TFSI quattro', 'A8 60 TFSI quattro', 'S8'
          ]
        },
        {
          name: 'Q3',
          trims: [
            'Q3 35 TFSI', 'Q3 40 TFSI', 'Q3 40 TFSI quattro', 'RS Q3'
          ]
        },
        {
          name: 'Q5',
          trims: [
            'Q5 40 TDI', 'Q5 45 TFSI', 'Q5 45 TFSI quattro', 'Q5 55 TFSI quattro', 'SQ5', 'RS Q5'
          ]
        },
        {
          name: 'Q7',
          trims: [
            'Q7 45 TDI', 'Q7 55 TFSI', 'Q7 55 TFSI quattro', 'SQ7', 'RS Q7'
          ]
        },
        {
          name: 'Q8',
          trims: [
            'Q8 45 TDI', 'Q8 55 TFSI', 'Q8 55 TFSI quattro', 'SQ8', 'RS Q8'
          ]
        }
      ]
    },

    // NISSAN - Real Trim Levels
    {
      name: 'Nissan',
      models: [
        {
          name: 'Altima',
          trims: [
            'S', 'SV', 'SR', 'SL', 'Platinum', 'SR VC-Turbo'
          ]
        },
        {
          name: 'Sentra',
          trims: [
            'S', 'SV', 'SR', 'SR Premium'
          ]
        },
        {
          name: 'Rogue',
          trims: [
            'S', 'SV', 'SL', 'Platinum', 'SV Premium', 'SL Premium'
          ]
        },
        {
          name: 'Murano',
          trims: [
            'S', 'SV', 'SL', 'Platinum'
          ]
        },
        {
          name: 'Pathfinder',
          trims: [
            'S', 'SV', 'SL', 'Platinum'
          ]
        },
        {
          name: 'Armada',
          trims: [
            'SV', 'SL', 'Platinum'
          ]
        },
        {
          name: 'Frontier',
          trims: [
            'S', 'SV', 'Pro-4X', 'Pro-X'
          ]
        },
        {
          name: 'Titan',
          trims: [
            'S', 'SV', 'SL', 'Platinum', 'Pro-4X'
          ]
        }
      ]
    },

    // HONDA - Real Trim Levels
    {
      name: 'Honda',
      models: [
        {
          name: 'Civic',
          trims: [
            'LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Si', 'Type R'
          ]
        },
        {
          name: 'Accord',
          trims: [
            'LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Sport 2.0T', 'Touring 2.0T'
          ]
        },
        {
          name: 'CR-V',
          trims: [
            'LX', 'EX', 'EX-L', 'Touring', 'Hybrid Sport', 'Hybrid EX-L', 'Hybrid Touring'
          ]
        },
        {
          name: 'Pilot',
          trims: [
            'LX', 'EX', 'EX-L', 'Touring', 'Elite'
          ]
        },
        {
          name: 'HR-V',
          trims: [
            'LX', 'Sport', 'EX', 'EX-L'
          ]
        },
        {
          name: 'Passport',
          trims: [
            'Sport', 'EX-L', 'Touring', 'Elite'
          ]
        },
        {
          name: 'Ridgeline',
          trims: [
            'Sport', 'RTL', 'RTL-T', 'RTL-E', 'Black Edition'
          ]
        },
        {
          name: 'Odyssey',
          trims: [
            'LX', 'EX', 'EX-L', 'Touring', 'Elite'
          ]
        }
      ]
    },

    // FORD - Real Trim Levels
    {
      name: 'Ford',
      models: [
        {
          name: 'F-150',
          trims: [
            'Regular Cab', 'SuperCab', 'SuperCrew', 'XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor'
          ]
        },
        {
          name: 'Mustang',
          trims: [
            'EcoBoost', 'EcoBoost Premium', 'GT', 'GT Premium', 'Mach 1', 'Shelby GT500'
          ]
        },
        {
          name: 'Explorer',
          trims: [
            'Base', 'XLT', 'Limited', 'ST', 'Platinum', 'King Ranch'
          ]
        },
        {
          name: 'Escape',
          trims: [
            'S', 'SE', 'SEL', 'Titanium', 'ST-Line', 'Hybrid SE', 'Hybrid SEL', 'Hybrid Titanium'
          ]
        },
        {
          name: 'Edge',
          trims: [
            'SE', 'SEL', 'ST-Line', 'Titanium', 'ST'
          ]
        },
        {
          name: 'Expedition',
          trims: [
            'XL', 'XLT', 'Limited', 'Platinum', 'King Ranch', 'Max Limited', 'Max Platinum', 'Max King Ranch'
          ]
        },
        {
          name: 'Ranger',
          trims: [
            'XL', 'XLT', 'Lariat', 'Tremor', 'Raptor'
          ]
        },
        {
          name: 'Bronco',
          trims: [
            'Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'First Edition'
          ]
        }
      ]
    },

    // CHEVROLET - Real Trim Levels
    {
      name: 'Chevrolet',
      models: [
        {
          name: 'Silverado',
          trims: [
            'Work Truck', 'Custom', 'LT', 'RST', 'LTZ', 'High Country', 'Trail Boss', 'Z71'
          ]
        },
        {
          name: 'Camaro',
          trims: [
            'LS', 'LT', 'SS', 'ZL1', 'ZL1 1LE'
          ]
        },
        {
          name: 'Equinox',
          trims: [
            'L', 'LS', 'LT', 'Premier', 'RS'
          ]
        },
        {
          name: 'Traverse',
          trims: [
            'L', 'LS', 'LT', 'RS', 'Premier', 'High Country'
          ]
        },
        {
          name: 'Tahoe',
          trims: [
            'LS', 'LT', 'RST', 'Premier', 'High Country', 'Z71'
          ]
        },
        {
          name: 'Suburban',
          trims: [
            'LS', 'LT', 'RST', 'Premier', 'High Country', 'Z71'
          ]
        },
        {
          name: 'Malibu',
          trims: [
            'L', 'LS', 'LT', 'Premier', 'RS'
          ]
        },
        {
          name: 'Cruze',
          trims: [
            'L', 'LS', 'LT', 'Premier', 'RS'
          ]
        }
      ]
    },

    // VOLKSWAGEN - Real Trim Levels
    {
      name: 'Volkswagen',
      models: [
        {
          name: 'Jetta',
          trims: [
            'S', 'SE', 'SEL', 'GLI', 'GLI Autobahn'
          ]
        },
        {
          name: 'Passat',
          trims: [
            'S', 'SE', 'SEL', 'SEL Premium'
          ]
        },
        {
          name: 'Tiguan',
          trims: [
            'S', 'SE', 'SEL', 'SEL Premium', 'SEL R-Line'
          ]
        },
        {
          name: 'Atlas',
          trims: [
            'S', 'SE', 'SEL', 'SEL Premium', 'SEL R-Line'
          ]
        },
        {
          name: 'Golf',
          trims: [
            'S', 'SE', 'SEL', 'GTI S', 'GTI SE', 'GTI Autobahn', 'R'
          ]
        },
        {
          name: 'Arteon',
          trims: [
            'SE', 'SEL', 'SEL Premium', 'SEL R-Line'
          ]
        },
        {
          name: 'ID.4',
          trims: [
            'Standard', 'Pro', 'Pro S', 'Pro S Plus'
          ]
        }
      ]
    },

    // KIA - Real Trim Levels
    {
      name: 'Kia',
      models: [
        {
          name: 'Forte',
          trims: [
            'FE', 'LXS', 'GT-Line', 'GT'
          ]
        },
        {
          name: 'Optima',
          trims: [
            'LX', 'S', 'EX', 'SX', 'SX Limited'
          ]
        },
        {
          name: 'Sportage',
          trims: [
            'LX', 'S', 'EX', 'SX', 'SX Turbo'
          ]
        },
        {
          name: 'Sorento',
          trims: [
            'L', 'LX', 'S', 'EX', 'SX', 'SX Prestige'
          ]
        },
        {
          name: 'Telluride',
          trims: [
            'LX', 'S', 'EX', 'SX', 'SX Prestige'
          ]
        },
        {
          name: 'Soul',
          trims: [
            'LX', 'S', 'GT-Line', 'EX'
          ]
        },
        {
          name: 'Stinger',
          trims: [
            'GT-Line', 'GT1', 'GT2'
          ]
        },
        {
          name: 'Niro',
          trims: [
            'LX', 'EX', 'EX Premium', 'EV EX', 'EV EX Premium'
          ]
        }
      ]
    },

    // MAZDA - Real Trim Levels
    {
      name: 'Mazda',
      models: [
        {
          name: 'Mazda3',
          trims: [
            '2.0 S', '2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', '2.5 Turbo', '2.5 Turbo Premium Plus'
          ]
        },
        {
          name: 'Mazda6',
          trims: [
            'Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'
          ]
        },
        {
          name: 'CX-5',
          trims: [
            'Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'
          ]
        },
        {
          name: 'CX-9',
          trims: [
            'Sport', 'Touring', 'Grand Touring', 'Grand Touring Reserve', 'Signature'
          ]
        },
        {
          name: 'CX-30',
          trims: [
            '2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', '2.5 Turbo', '2.5 Turbo Premium Plus'
          ]
        },
        {
          name: 'MX-5 Miata',
          trims: [
            'Sport', 'Club', 'Grand Touring', 'RF Club', 'RF Grand Touring'
          ]
        }
      ]
    },

    // SUBARU - Real Trim Levels
    {
      name: 'Subaru',
      models: [
        {
          name: 'Impreza',
          trims: [
            'Base', 'Premium', 'Sport', 'Limited'
          ]
        },
        {
          name: 'Legacy',
          trims: [
            'Base', 'Premium', 'Sport', 'Limited', 'Touring XT'
          ]
        },
        {
          name: 'Outback',
          trims: [
            'Base', 'Premium', 'Limited', 'Touring', 'Wilderness'
          ]
        },
        {
          name: 'Forester',
          trims: [
            'Base', 'Premium', 'Sport', 'Limited', 'Wilderness'
          ]
        },
        {
          name: 'Ascent',
          trims: [
            'Base', 'Premium', 'Limited', 'Touring'
          ]
        },
        {
          name: 'WRX',
          trims: [
            'Base', 'Premium', 'Limited', 'GT'
          ]
        },
        {
          name: 'BRZ',
          trims: [
            'Premium', 'Limited'
          ]
        }
      ]
    },

    // LEXUS - Real Trim Levels
    {
      name: 'Lexus',
      models: [
        {
          name: 'ES',
          trims: [
            'ES 250', 'ES 300h', 'ES 350', 'ES 350 F Sport'
          ]
        },
        {
          name: 'IS',
          trims: [
            'IS 300', 'IS 300 AWD', 'IS 350', 'IS 350 F Sport', 'IS 500 F Sport'
          ]
        },
        {
          name: 'GS',
          trims: [
            'GS 300', 'GS 350', 'GS 350 F Sport', 'GS F'
          ]
        },
        {
          name: 'LS',
          trims: [
            'LS 500', 'LS 500 F Sport', 'LS 500h', 'LS 500h F Sport'
          ]
        },
        {
          name: 'RX',
          trims: [
            'RX 350', 'RX 350 F Sport', 'RX 450h', 'RX 450h F Sport', 'RX L'
          ]
        },
        {
          name: 'GX',
          trims: [
            'GX 460', 'GX 460 Luxury'
          ]
        },
        {
          name: 'LX',
          trims: [
            'LX 570', 'LX 570 Sport'
          ]
        },
        {
          name: 'NX',
          trims: [
            'NX 300', 'NX 300 F Sport', 'NX 300h', 'NX 300h F Sport'
          ]
        }
      ]
    },

    // INFINITI - Real Trim Levels
    {
      name: 'Infiniti',
      models: [
        {
          name: 'Q50',
          trims: [
            'Pure', 'Luxe', 'Sport', 'Red Sport 400'
          ]
        },
        {
          name: 'Q60',
          trims: [
            'Pure', 'Luxe', 'Sport', 'Red Sport 400'
          ]
        },
        {
          name: 'Q70',
          trims: [
            '3.7', '5.6', '5.6 Sport'
          ]
        },
        {
          name: 'QX50',
          trims: [
            'Pure', 'Luxe', 'Essential', 'Sensory', 'Autograph'
          ]
        },
        {
          name: 'QX60',
          trims: [
            'Pure', 'Luxe', 'Essential', 'Sensory', 'Autograph'
          ]
        },
        {
          name: 'QX80',
          trims: [
            'Luxe', 'Premium', 'Sensory', 'Autograph'
          ]
        }
      ]
    },

    // ACURA - Real Trim Levels
    {
      name: 'Acura',
      models: [
        {
          name: 'ILX',
          trims: [
            'Base', 'Premium', 'Technology', 'A-Spec'
          ]
        },
        {
          name: 'TLX',
          trims: [
            'Base', 'Technology', 'A-Spec', 'Advance', 'Type S'
          ]
        },
        {
          name: 'RLX',
          trims: [
            'Base', 'Technology', 'Advance', 'Sport Hybrid'
          ]
        },
        {
          name: 'RDX',
          trims: [
            'Base', 'Technology', 'A-Spec', 'Advance'
          ]
        },
        {
          name: 'MDX',
          trims: [
            'Base', 'Technology', 'A-Spec', 'Advance', 'Type S'
          ]
        },
        {
          name: 'NSX',
          trims: [
            'Base', 'Type S'
          ]
        }
      ]
    },

    // JAGUAR - Real Trim Levels
    {
      name: 'Jaguar',
      models: [
        {
          name: 'XE',
          trims: [
            'P250', 'P300', 'P300 R-Dynamic'
          ]
        },
        {
          name: 'XF',
          trims: [
            'P250', 'P300', 'P300 R-Dynamic'
          ]
        },
        {
          name: 'XJ',
          trims: [
            'P300', 'P300 R-Dynamic', 'P450'
          ]
        },
        {
          name: 'F-PACE',
          trims: [
            'P250', 'P300', 'P300 R-Dynamic', 'P400 R-Dynamic', 'SVR'
          ]
        },
        {
          name: 'E-PACE',
          trims: [
            'P250', 'P300', 'P300 R-Dynamic'
          ]
        },
        {
          name: 'I-PACE',
          trims: [
            'EV400', 'EV400 S', 'EV400 HSE'
          ]
        }
      ]
    },

    // LAND ROVER - Real Trim Levels
    {
      name: 'Land Rover',
      models: [
        {
          name: 'Range Rover Evoque',
          trims: [
            'P250 S', 'P250 SE', 'P300 R-Dynamic S', 'P300 R-Dynamic SE', 'P300 R-Dynamic HSE'
          ]
        },
        {
          name: 'Range Rover Velar',
          trims: [
            'P250 S', 'P250 SE', 'P300 R-Dynamic S', 'P300 R-Dynamic SE', 'P400 R-Dynamic HSE'
          ]
        },
        {
          name: 'Range Rover Sport',
          trims: [
            'P360 S', 'P360 SE', 'P400 R-Dynamic S', 'P400 R-Dynamic SE', 'P400 R-Dynamic HSE', 'SVR'
          ]
        },
        {
          name: 'Range Rover',
          trims: [
            'P360 SE', 'P400 SE', 'P400 HSE', 'P400 Westminster', 'P525 SVAutobiography'
          ]
        },
        {
          name: 'Discovery',
          trims: [
            'P300 S', 'P300 SE', 'P360 SE', 'P360 HSE'
          ]
        },
        {
          name: 'Discovery Sport',
          trims: [
            'P200 S', 'P250 S', 'P250 SE', 'P300 R-Dynamic S', 'P300 R-Dynamic SE'
          ]
        }
      ]
    },

    // PORSCHE - Real Trim Levels
    {
      name: 'Porsche',
      models: [
        {
          name: '911',
          trims: [
            'Carrera', 'Carrera S', 'Carrera 4', 'Carrera 4S', 'Targa 4', 'Targa 4S', 'Turbo', 'Turbo S', 'GT3', 'GT3 RS', 'GT2 RS'
          ]
        },
        {
          name: 'Cayenne',
          trims: [
            'Base', 'S', 'GTS', 'Turbo', 'Turbo S', 'E-Hybrid', 'Turbo S E-Hybrid'
          ]
        },
        {
          name: 'Macan',
          trims: [
            'Base', 'S', 'GTS', 'Turbo'
          ]
        },
        {
          name: 'Panamera',
          trims: [
            'Base', '4', '4S', 'GTS', 'Turbo', 'Turbo S', '4 E-Hybrid', 'Turbo S E-Hybrid'
          ]
        },
        {
          name: 'Taycan',
          trims: [
            '4S', 'Turbo', 'Turbo S', 'Cross Turismo 4S', 'Cross Turismo Turbo', 'Cross Turismo Turbo S'
          ]
        },
        {
          name: 'Boxster',
          trims: [
            'Base', 'S', 'GTS', 'Spyder'
          ]
        },
        {
          name: 'Cayman',
          trims: [
            'Base', 'S', 'GTS', 'GT4'
          ]
        }
      ]
    },

    // TESLA - Real Trim Levels
    {
      name: 'Tesla',
      models: [
        {
          name: 'Model S',
          trims: [
            'Long Range', 'Plaid'
          ]
        },
        {
          name: 'Model 3',
          trims: [
            'Standard Range Plus', 'Long Range', 'Performance'
          ]
        },
        {
          name: 'Model X',
          trims: [
            'Long Range', 'Plaid'
          ]
        },
        {
          name: 'Model Y',
          trims: [
            'Long Range', 'Performance'
          ]
        }
      ]
    },

    // CHINESE BRANDS - Real Trim Levels
    {
      name: 'Geely',
      models: [
        {
          name: 'Atlas',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Coolray',
          trims: [
            'Comfort', 'Premium', 'Sport'
          ]
        },
        {
          name: 'Tugella',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Monjaro',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        }
      ]
    },

    {
      name: 'Chery',
      models: [
        {
          name: 'Tiggo 7',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Tiggo 8',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Arrizo 6',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Arrizo 8',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        }
      ]
    },

    {
      name: 'MG',
      models: [
        {
          name: 'HS',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'ZS',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'RX5',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'RX8',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        }
      ]
    },

    {
      name: 'BYD',
      models: [
        {
          name: 'Tang',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Song',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Qin',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        },
        {
          name: 'Han',
          trims: [
            'Comfort', 'Premium', 'Luxury'
          ]
        }
      ]
    },

    // DS - Real Trim Levels
    {
      name: 'DS',
      models: [
        {
          name: 'DS3',
          trims: [
            'PureTech 110', 'PureTech 130', 'E-Tense 100kW', 'Crossback PureTech 110', 'Crossback PureTech 130', 'Crossback E-Tense 100kW'
          ]
        },
        {
          name: 'DS4',
          trims: [
            'PureTech 130', 'PureTech 180', 'E-Tense 165kW', 'Crossback PureTech 130', 'Crossback PureTech 180', 'Crossback E-Tense 165kW'
          ]
        },
        {
          name: 'DS7',
          trims: [
            'PureTech 180', 'PureTech 225', 'E-Tense 4x4 300kW', 'Crossback PureTech 180', 'Crossback PureTech 225', 'Crossback E-Tense 4x4 300kW'
          ]
        },
        {
          name: 'DS9',
          trims: [
            'PureTech 180', 'PureTech 225', 'E-Tense 4x4 360kW', 'Crossback PureTech 180', 'Crossback PureTech 225', 'Crossback E-Tense 4x4 360kW'
          ]
        }
      ]
    }
  ]
};

module.exports = realCarTrimsData;
