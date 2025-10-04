const express = require('express');
const { getCollection } = require('../config/database');

const router = express.Router();

// GET /api/v1/updates/clutch-partners-desktop - Get update info for desktop app
router.get('/clutch-partners-desktop', async (req, res) => {
  try {
    console.log('🔍 Update check request for Clutch Partners Desktop');
    
    // Get current version from query params or default to latest
    const currentVersion = req.query.current_version || '1.0.0';
    
    // In a real implementation, this would:
    // 1. Check database for latest version
    // 2. Compare with current version
    // 3. Return update info if newer version exists
    
    // For now, return a mock update (version 1.1.0)
    const latestVersion = '1.1.0';
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;
    
    if (hasUpdate) {
      console.log(`📦 Update available: ${currentVersion} -> ${latestVersion}`);
      
      res.json({
        version: latestVersion,
        download_url: 'https://github.com/clutch-main/partners-desktop/releases/download/v1.1.0/Clutch-Partners-System_1.1.0_x64-setup.exe',
        changelog: `
## Version 1.1.0 - Enhanced Features

### 🚀 New Features
- **Auto-updater**: Automatic update checking and installation
- **Enhanced POS**: Improved barcode scanning and payment processing
- **Advanced Reports**: New analytics and reporting capabilities
- **Multi-language**: Full Arabic and English support
- **Offline Sync**: Better offline-first synchronization

### 🔧 Improvements
- **Performance**: 50% faster startup time
- **UI/UX**: Redesigned interface following design.json tokens
- **Database**: Optimized SQLite performance
- **Security**: Enhanced authentication and data encryption

### 🐛 Bug Fixes
- Fixed database connection issues
- Resolved UI layout problems in Arabic mode
- Improved error handling and logging
- Fixed sync conflicts resolution

### 📱 Compatibility
- Windows 7 SP1+ support
- Optimized for low-spec machines (2GB RAM)
- Better printer and scanner integration
        `.trim(),
        force_update: false,
        file_size: 4711081, // Size in bytes
        release_notes: 'Enhanced POS system with auto-updater and improved performance'
      });
    } else {
      console.log(`✅ No updates available (current: ${currentVersion})`);
      
      res.json({
        version: currentVersion,
        download_url: null,
        changelog: null,
        force_update: false,
        file_size: 0,
        release_notes: null
      });
    }
    
  } catch (error) {
    console.error('❌ Update check error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_CHECK_FAILED',
      message: 'Failed to check for updates',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/updates/register - Register device for updates
router.post('/register', async (req, res) => {
  try {
    const { device_id, app_version, platform, partner_id } = req.body;
    
    console.log('📱 Device registration for updates:', { device_id, app_version, platform, partner_id });
    
    // Store device info in database
    const devicesCollection = await getCollection('update_devices');
    await devicesCollection.insertOne({
      device_id,
      app_version,
      platform,
      partner_id,
      registered_at: new Date(),
      last_check: new Date(),
      status: 'active'
    });
    
    res.json({
      success: true,
      message: 'Device registered for updates successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Device registration error:', error);
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Failed to register device for updates',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/updates/devices - Get registered devices (admin)
router.get('/devices', async (req, res) => {
  try {
    const devicesCollection = await getCollection('update_devices');
    const devices = await devicesCollection.find({}).toArray();
    
    res.json({
      success: true,
      devices,
      count: devices.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Get devices error:', error);
    res.status(500).json({
      success: false,
      error: 'GET_DEVICES_FAILED',
      message: 'Failed to get registered devices',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/updates/push - Push update to devices (admin)
router.post('/push', async (req, res) => {
  try {
    const { version, force_update, target_devices } = req.body;
    
    console.log('📤 Pushing update:', { version, force_update, target_devices });
    
    // Update device records with new version info
    const devicesCollection = await getCollection('update_devices');
    
    const filter = target_devices ? { device_id: { $in: target_devices } } : {};
    
    await devicesCollection.updateMany(filter, {
      $set: {
        pending_update: {
          version,
          force_update,
          pushed_at: new Date()
        }
      }
    });
    
    res.json({
      success: true,
      message: `Update ${version} pushed to devices successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Push update error:', error);
    res.status(500).json({
      success: false,
      error: 'PUSH_UPDATE_FAILED',
      message: 'Failed to push update to devices',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to compare semantic versions
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1parts.length, v2parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  
  return 0;
}

module.exports = router;
