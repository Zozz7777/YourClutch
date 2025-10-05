const ShippingZone = require('../models/ShippingZone');
const fs = require('fs');
const path = require('path');

class ShippingService {
  constructor() {
    this.locationsData = null;
    this.loadLocationsData();
  }

  /**
   * Load Egypt locations data from JSON file
   */
  loadLocationsData() {
    try {
      const locationsPath = path.join(__dirname, '../data/egypt-locations.json');
      this.locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
    } catch (error) {
      console.error('Error loading locations data:', error);
      this.locationsData = null;
    }
  }

  /**
   * Calculate shipping cost for an address
   * @param {object} address - Address object with governorate, city, district
   * @param {number} orderValue - Order value for free shipping check
   * @returns {object} - Shipping calculation result
   */
  async calculateShippingCost(address, orderValue = 0) {
    try {
      const { governorate, city, district } = address;

      if (!governorate || !city) {
        throw new Error('Governorate and city are required');
      }

      // Find matching zone
      const zone = await this.findZoneByLocation(governorate, city, district);

      if (!zone) {
        throw new Error('No shipping zone found for this location');
      }

      // Check if order qualifies for free shipping
      let shippingCost = zone.cost;
      let isFreeShipping = false;

      if (zone.freeShippingThreshold && orderValue >= zone.freeShippingThreshold) {
        shippingCost = 0;
        isFreeShipping = true;
      }

      // Get delivery options
      const deliveryOptions = this.getDeliveryOptions(zone);

      return {
        success: true,
        data: {
          zone: {
            governorate: zone.governorate,
            city: zone.city,
            district: zone.district
          },
          shippingCost,
          isFreeShipping,
          estimatedDays: zone.estimatedDays,
          deliveryOptions,
          restrictions: zone.restrictions,
          weightLimits: zone.weightLimits
        }
      };
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all available shipping zones
   * @param {object} filters - Optional filters
   * @returns {array} - Array of shipping zones
   */
  async getAvailableZones(filters = {}) {
    try {
      const query = { isActive: true };
      
      if (filters.governorate) {
        query.governorate = { $regex: filters.governorate, $options: 'i' };
      }
      if (filters.city) {
        query.city = { $regex: filters.city, $options: 'i' };
      }

      const zones = await ShippingZone.find(query).lean();
      return {
        success: true,
        data: zones
      };
    } catch (error) {
      console.error('Error fetching available zones:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Find zone by location
   * @param {string} governorate - Governorate name
   * @param {string} city - City name
   * @param {string} district - District name (optional)
   * @returns {object|null} - Shipping zone or null
   */
  async findZoneByLocation(governorate, city, district = null) {
    try {
      const query = {
        governorate: { $regex: governorate, $options: 'i' },
        city: { $regex: city, $options: 'i' },
        isActive: true
      };

      if (district) {
        query.district = { $regex: district, $options: 'i' };
      }

      // First try to find exact match with district
      if (district) {
        const exactMatch = await ShippingZone.findOne(query);
        if (exactMatch) return exactMatch;
      }

      // If no exact match, try without district
      delete query.district;
      const zone = await ShippingZone.findOne(query);
      
      return zone;
    } catch (error) {
      console.error('Error finding zone by location:', error);
      return null;
    }
  }

  /**
   * Get delivery options for a zone
   * @param {object} zone - Shipping zone object
   * @returns {array} - Array of delivery options
   */
  getDeliveryOptions(zone) {
    const options = [];

    if (zone.deliveryOptions) {
      if (zone.deliveryOptions.standard?.enabled) {
        options.push({
          type: 'standard',
          cost: zone.cost,
          days: zone.estimatedDays,
          label: 'Standard Delivery',
          description: `Delivered in ${zone.estimatedDays} business days`
        });
      }

      if (zone.deliveryOptions.express?.enabled) {
        options.push({
          type: 'express',
          cost: zone.deliveryOptions.express.cost,
          days: zone.deliveryOptions.express.days,
          label: 'Express Delivery',
          description: `Delivered in ${zone.deliveryOptions.express.days} business days`
        });
      }

      if (zone.deliveryOptions.overnight?.enabled) {
        options.push({
          type: 'overnight',
          cost: zone.deliveryOptions.overnight.cost,
          days: zone.deliveryOptions.overnight.days,
          label: 'Overnight Delivery',
          description: `Delivered in ${zone.deliveryOptions.overnight.days} business days`
        });
      }
    }

    return options;
  }

  /**
   * Check if shipping is available for an address
   * @param {object} address - Address object
   * @returns {boolean} - Whether shipping is available
   */
  async isShippingAvailable(address) {
    try {
      const zone = await this.findZoneByLocation(address.governorate, address.city, address.district);
      return zone !== null;
    } catch (error) {
      console.error('Error checking shipping availability:', error);
      return false;
    }
  }

  /**
   * Get shipping zones by governorate
   * @param {string} governorate - Governorate name
   * @returns {array} - Array of zones in the governorate
   */
  async getZonesByGovernorate(governorate) {
    try {
      const zones = await ShippingZone.find({
        governorate: { $regex: governorate, $options: 'i' },
        isActive: true
      }).lean();

      return {
        success: true,
        data: zones
      };
    } catch (error) {
      console.error('Error fetching zones by governorate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get shipping cost estimate for multiple locations
   * @param {array} addresses - Array of address objects
   * @returns {array} - Array of shipping cost estimates
   */
  async getBulkShippingEstimates(addresses) {
    try {
      const estimates = [];

      for (const address of addresses) {
        const estimate = await this.calculateShippingCost(address);
        estimates.push({
          address,
          ...estimate
        });
      }

      return {
        success: true,
        data: estimates
      };
    } catch (error) {
      console.error('Error getting bulk shipping estimates:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get governorates list from locations data
   * @returns {array} - Array of governorate names
   */
  getGovernorates() {
    if (!this.locationsData) {
      this.loadLocationsData();
    }

    return this.locationsData?.governorates?.map(g => g.name) || [];
  }

  /**
   * Get cities by governorate
   * @param {string} governorate - Governorate name
   * @returns {array} - Array of city names
   */
  getCitiesByGovernorate(governorate) {
    if (!this.locationsData) {
      this.loadLocationsData();
    }

    const gov = this.locationsData?.governorates?.find(g => g.name === governorate);
    return gov?.cities?.map(c => c.name) || [];
  }

  /**
   * Get districts by city
   * @param {string} governorate - Governorate name
   * @param {string} city - City name
   * @returns {array} - Array of district names
   */
  getDistrictsByCity(governorate, city) {
    if (!this.locationsData) {
      this.loadLocationsData();
    }

    const gov = this.locationsData?.governorates?.find(g => g.name === governorate);
    const cityData = gov?.cities?.find(c => c.name === city);
    return cityData?.districts || [];
  }

  /**
   * Validate shipping address
   * @param {object} address - Address object
   * @returns {object} - Validation result
   */
  async validateShippingAddress(address) {
    try {
      const { governorate, city, district } = address;

      // Check if governorate exists
      const governorates = this.getGovernorates();
      if (!governorates.includes(governorate)) {
        return {
          success: false,
          error: 'Invalid governorate',
          message: 'Governorate not found'
        };
      }

      // Check if city exists in governorate
      const cities = this.getCitiesByGovernorate(governorate);
      if (!cities.includes(city)) {
        return {
          success: false,
          error: 'Invalid city',
          message: 'City not found in this governorate'
        };
      }

      // Check if district exists (if provided)
      if (district) {
        const districts = this.getDistrictsByCity(governorate, city);
        if (!districts.includes(district)) {
          return {
            success: false,
            error: 'Invalid district',
            message: 'District not found in this city'
          };
        }
      }

      // Check if shipping zone exists
      const zone = await this.findZoneByLocation(governorate, city, district);
      if (!zone) {
        return {
          success: false,
          error: 'No shipping zone',
          message: 'No shipping zone found for this location'
        };
      }

      return {
        success: true,
        data: {
          zone,
          isShippingAvailable: true
        }
      };
    } catch (error) {
      console.error('Error validating shipping address:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const shippingService = new ShippingService();

module.exports = shippingService;
