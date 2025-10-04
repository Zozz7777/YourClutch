const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCollection } = require('../config/database');

// GET /api/v1/employees/invitations - Get employee invitations
router.get('/invitations', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    const invitationsCollection = await getCollection('employee_invitations');
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const invitations = await invitationsCollection.find(query).toArray();
    
    res.status(200).json({
      success: true,
      data: { invitations },
      message: 'Employee invitations retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching employee invitations:', error);
    res.status(500).json({
      success: false,
      error: 'INVITATIONS_FETCH_FAILED',
      message: 'Failed to retrieve employee invitations',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/v1/employees/invitations - Create new employee invitation
router.post('/invitations', authenticateToken, async (req, res) => {
  try {
    const { email, role, department, invitedBy } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email and role are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const invitationsCollection = await getCollection('employee_invitations');
    
    // Check if invitation already exists
    const existingInvitation = await invitationsCollection.findOne({ email: email.toLowerCase() });
    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        error: 'INVITATION_EXISTS',
        message: 'Invitation already exists for this email',
        timestamp: new Date().toISOString()
      });
    }
    
    const invitation = {
      email: email.toLowerCase(),
      role,
      department: department || '',
      status: 'pending',
      invitedBy: invitedBy || req.user.userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    await invitationsCollection.insertOne(invitation);
    
    res.status(201).json({
      success: true,
      data: invitation,
      message: 'Employee invitation created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error creating employee invitation:', error);
    res.status(500).json({
      success: false,
      error: 'INVITATION_CREATION_FAILED',
      message: 'Failed to create employee invitation',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;