const express = require('express');
const router = express.Router();

// Simple test endpoint without any middleware
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint with basic error handling
router.get('/test-error', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Error test endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in test endpoint',
      error: error.message
    });
  }
});

module.exports = router;
