const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');

// GET /api/v1/careers/admin/jobs - Get all job postings
router.get('/admin/jobs', authenticateToken, async (req, res) => {
  try {
    const jobsCollection = await getCollection('jobs');
    const jobs = await jobsCollection.find({}).toArray();
    
    res.status(200).json({
      success: true,
      data: { jobs },
      message: 'Jobs retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'JOBS_FETCH_FAILED',
      message: 'Failed to retrieve jobs',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/careers/admin/applications - Get all job applications
router.get('/admin/applications', authenticateToken, async (req, res) => {
  try {
    const applicationsCollection = await getCollection('job_applications');
    const applications = await applicationsCollection.find({}).toArray();
    
    res.status(200).json({
      success: true,
      data: { applications },
      message: 'Applications retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'APPLICATIONS_FETCH_FAILED',
      message: 'Failed to retrieve applications',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;