const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Appointment Status
const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

// Service Types
const SERVICE_TYPES = {
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
  INSPECTION: 'inspection',
  DIAGNOSTIC: 'diagnostic',
  INSTALLATION: 'installation',
  CONSULTATION: 'consultation'
};

// Create appointment
router.post('/appointments', [
  auth,
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').notEmpty().withMessage('Customer phone is required'),
  body('customerEmail').optional().isEmail().withMessage('Valid email is required'),
  body('vehicleInfo').isObject().withMessage('Vehicle info is required'),
  body('vehicleInfo.make').notEmpty().withMessage('Vehicle make is required'),
  body('vehicleInfo.model').notEmpty().withMessage('Vehicle model is required'),
  body('vehicleInfo.year').optional().isNumeric().withMessage('Vehicle year must be numeric'),
  body('vehicleInfo.licensePlate').optional().isString().withMessage('License plate must be string'),
  body('vehicleInfo.vin').optional().isString().withMessage('VIN must be string'),
  body('serviceType').isIn(Object.values(SERVICE_TYPES)).withMessage('Invalid service type'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('scheduledDate').isISO8601().withMessage('Scheduled date must be valid ISO date'),
  body('estimatedDuration').optional().isNumeric().withMessage('Duration must be numeric'),
  body('estimatedCost').optional().isNumeric().withMessage('Cost must be numeric'),
  body('notes').optional().isString().withMessage('Notes must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      vehicleInfo,
      serviceType,
      description,
      scheduledDate,
      estimatedDuration = 60, // minutes
      estimatedCost,
      notes
    } = req.body;

    const appointment = {
      partnerId: partner.partnerId,
      customerName,
      customerPhone,
      customerEmail: customerEmail?.toLowerCase(),
      vehicleInfo,
      serviceType,
      description,
      scheduledDate: new Date(scheduledDate),
      estimatedDuration,
      estimatedCost,
      notes,
      status: APPOINTMENT_STATUS.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Check-in/out tracking
      checkIn: {
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null
      },
      checkOut: {
        checkedOut: false,
        checkedOutAt: null,
        checkedOutBy: null
      },
      // Service completion
      completion: {
        completed: false,
        completedAt: null,
        actualDuration: null,
        actualCost: null,
        serviceNotes: null,
        recommendations: null
      }
    };

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    const result = await appointmentsCollection.insertOne(appointment);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...appointment
      },
      message: 'Appointment created successfully'
    });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// Get appointments
router.get('/appointments', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      status = '', 
      serviceType = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(APPOINTMENT_STATUS).includes(status)) {
      query.status = status;
    }
    
    if (serviceType && Object.values(SERVICE_TYPES).includes(serviceType)) {
      query.serviceType = serviceType;
    }

    if (dateFrom) {
      query.scheduledDate = { ...query.scheduledDate, $gte: new Date(dateFrom) };
    }

    if (dateTo) {
      query.scheduledDate = { ...query.scheduledDate, $lte: new Date(dateTo) };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    const appointments = await appointmentsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await appointmentsCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Appointments retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get appointment by ID
router.get('/appointments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    const appointment = await appointmentsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
});

// Update appointment status
router.patch('/appointments/:id/status', [
  auth,
  body('status').isIn(Object.values(APPOINTMENT_STATUS)).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    const appointment = await appointmentsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (notes) {
      updateData.statusNotes = notes;
    }

    // Set timestamps based on status
    if (status === APPOINTMENT_STATUS.IN_PROGRESS && !appointment.checkIn.checkedIn) {
      updateData['checkIn.checkedIn'] = true;
      updateData['checkIn.checkedInAt'] = new Date();
      updateData['checkIn.checkedInBy'] = partner._id;
    }

    if (status === APPOINTMENT_STATUS.COMPLETED && !appointment.checkOut.checkedOut) {
      updateData['checkOut.checkedOut'] = true;
      updateData['checkOut.checkedOutAt'] = new Date();
      updateData['checkOut.checkedOutBy'] = partner._id;
    }

    await appointmentsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (error) {
    logger.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

// Check-in appointment
router.post('/appointments/:id/checkin', [
  auth,
  body('notes').optional().isString().withMessage('Notes must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { notes } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    const appointment = await appointmentsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.checkIn.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already checked in'
      });
    }

    await appointmentsCollection.updateOne(
      { _id: id },
      {
        $set: {
          'checkIn.checkedIn': true,
          'checkIn.checkedInAt': new Date(),
          'checkIn.checkedInBy': partner._id,
          status: APPOINTMENT_STATUS.IN_PROGRESS,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Appointment checked in successfully'
    });
  } catch (error) {
    logger.error('Error checking in appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in appointment',
      error: error.message
    });
  }
});

// Check-out appointment
router.post('/appointments/:id/checkout', [
  auth,
  body('actualDuration').optional().isNumeric().withMessage('Duration must be numeric'),
  body('actualCost').optional().isNumeric().withMessage('Cost must be numeric'),
  body('serviceNotes').optional().isString().withMessage('Service notes must be string'),
  body('recommendations').optional().isString().withMessage('Recommendations must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { actualDuration, actualCost, serviceNotes, recommendations } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    const appointment = await appointmentsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.checkIn.checkedIn) {
      return res.status(400).json({
        success: false,
        message: 'Appointment must be checked in first'
      });
    }

    if (appointment.checkOut.checkedOut) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already checked out'
      });
    }

    const updateData = {
      'checkOut.checkedOut': true,
      'checkOut.checkedOutAt': new Date(),
      'checkOut.checkedOutBy': partner._id,
      'completion.completed': true,
      'completion.completedAt': new Date(),
      status: APPOINTMENT_STATUS.COMPLETED,
      updatedAt: new Date()
    };

    if (actualDuration) {
      updateData['completion.actualDuration'] = actualDuration;
    }

    if (actualCost) {
      updateData['completion.actualCost'] = actualCost;
    }

    if (serviceNotes) {
      updateData['completion.serviceNotes'] = serviceNotes;
    }

    if (recommendations) {
      updateData['completion.recommendations'] = recommendations;
    }

    await appointmentsCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: 'Appointment checked out successfully'
    });
  } catch (error) {
    logger.error('Error checking out appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out appointment',
      error: error.message
    });
  }
});

// Get calendar view
router.get('/appointments/calendar', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1
    } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    const appointments = await appointmentsCollection
      .find({
        partnerId: partner.partnerId,
        scheduledDate: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ scheduledDate: 1 })
      .toArray();

    // Group appointments by date
    const calendarData = {};
    appointments.forEach(appointment => {
      const date = appointment.scheduledDate.toISOString().split('T')[0];
      if (!calendarData[date]) {
        calendarData[date] = [];
      }
      calendarData[date].push({
        id: appointment._id,
        customerName: appointment.customerName,
        serviceType: appointment.serviceType,
        scheduledDate: appointment.scheduledDate,
        status: appointment.status,
        estimatedDuration: appointment.estimatedDuration
      });
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        month: parseInt(month),
        appointments: calendarData
      },
      message: 'Calendar data retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching calendar data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar data',
      error: error.message
    });
  }
});

// Get appointment statistics
router.get('/appointments/stats', auth, async (req, res) => {
  try {
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { 
      period = '30d' // 7d, 30d, 90d, 1y
    } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const { getCollection } = require('../config/database');
    const appointmentsCollection = await getCollection('partnerAppointments');
    
    const stats = await appointmentsCollection.aggregate([
      {
        $match: {
          partnerId: partner.partnerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', APPOINTMENT_STATUS.COMPLETED] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', APPOINTMENT_STATUS.CANCELLED] }, 1, 0] }
          },
          noShowAppointments: {
            $sum: { $cond: [{ $eq: ['$status', APPOINTMENT_STATUS.NO_SHOW] }, 1, 0] }
          },
          averageDuration: { $avg: '$completion.actualDuration' },
          totalRevenue: { $sum: '$completion.actualCost' }
        }
      }
    ]).toArray();

    const appointmentStats = stats[0] || {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      averageDuration: 0,
      totalRevenue: 0
    };

    const completionRate = appointmentStats.totalAppointments > 0 
      ? (appointmentStats.completedAppointments / appointmentStats.totalAppointments) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalAppointments: appointmentStats.totalAppointments,
        completedAppointments: appointmentStats.completedAppointments,
        cancelledAppointments: appointmentStats.cancelledAppointments,
        noShowAppointments: appointmentStats.noShowAppointments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageDuration: Math.round(appointmentStats.averageDuration || 0),
        totalRevenue: appointmentStats.totalRevenue || 0,
        period,
        startDate,
        endDate: now
      },
      message: 'Appointment statistics retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching appointment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment statistics',
      error: error.message
    });
  }
});

module.exports = router;
