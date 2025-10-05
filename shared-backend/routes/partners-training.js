const express = require('express');
const { body, validationResult } = require('express-validator');
const PartnerUser = require('../models/PartnerUser');
const { authenticateToken: auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Training Status
const TRAINING_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Training Types
const TRAINING_TYPES = {
  VIDEO: 'video',
  QUIZ: 'quiz',
  DOCUMENT: 'document',
  INTERACTIVE: 'interactive'
};

// Certification Levels
const CERTIFICATION_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

// Get available training courses
router.get('/training/courses', auth, async (req, res) => {
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
      category = '', 
      level = '',
      type = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (level && Object.values(CERTIFICATION_LEVELS).includes(level)) {
      query.level = level;
    }
    
    if (type && Object.values(TRAINING_TYPES).includes(type)) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const coursesCollection = await getCollection('trainingCourses');
    
    const courses = await coursesCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await coursesCollection.countDocuments(query);

    // Get partner's progress for each course
    const progressCollection = await getCollection('partnerTrainingProgress');
    const progressQuery = {
      partnerId: partner.partnerId,
      courseId: { $in: courses.map(course => course._id) }
    };
    const progressRecords = await progressCollection.find(progressQuery).toArray();
    
    const progressMap = {};
    progressRecords.forEach(progress => {
      progressMap[progress.courseId] = progress;
    });

    // Add progress info to courses
    const coursesWithProgress = courses.map(course => ({
      ...course,
      progress: progressMap[course._id] || {
        status: TRAINING_STATUS.NOT_STARTED,
        progress: 0,
        completedAt: null
      }
    }));

    res.json({
      success: true,
      data: {
        courses: coursesWithProgress,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Training courses retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching training courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training courses',
      error: error.message
    });
  }
});

// Get course details
router.get('/training/courses/:id', auth, async (req, res) => {
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
    const coursesCollection = await getCollection('trainingCourses');
    
    const course = await coursesCollection.findOne({
      _id: id,
      isActive: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get partner's progress
    const progressCollection = await getCollection('partnerTrainingProgress');
    const progress = await progressCollection.findOne({
      partnerId: partner.partnerId,
      courseId: id
    });

    res.json({
      success: true,
      data: {
        course,
        progress: progress || {
          status: TRAINING_STATUS.NOT_STARTED,
          progress: 0,
          completedAt: null
        }
      },
      message: 'Course details retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: error.message
    });
  }
});

// Start training course
router.post('/training/courses/:id/start', auth, async (req, res) => {
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
    const coursesCollection = await getCollection('trainingCourses');
    const progressCollection = await getCollection('partnerTrainingProgress');
    
    const course = await coursesCollection.findOne({
      _id: id,
      isActive: true
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already started
    const existingProgress = await progressCollection.findOne({
      partnerId: partner.partnerId,
      courseId: id
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Course already started'
      });
    }

    const progress = {
      partnerId: partner.partnerId,
      courseId: id,
      status: TRAINING_STATUS.IN_PROGRESS,
      progress: 0,
      startedAt: new Date(),
      completedAt: null,
      score: null,
      attempts: 0,
      modules: course.modules.map(module => ({
        moduleId: module.id,
        status: TRAINING_STATUS.NOT_STARTED,
        progress: 0,
        completedAt: null,
        score: null
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await progressCollection.insertOne(progress);

    res.json({
      success: true,
      data: progress,
      message: 'Training course started successfully'
    });
  } catch (error) {
    logger.error('Error starting training course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start training course',
      error: error.message
    });
  }
});

// Update training progress
router.patch('/training/courses/:id/progress', [
  auth,
  body('moduleId').notEmpty().withMessage('Module ID is required'),
  body('progress').isNumeric().withMessage('Progress must be numeric'),
  body('status').optional().isIn(Object.values(TRAINING_STATUS)).withMessage('Invalid status'),
  body('score').optional().isNumeric().withMessage('Score must be numeric')
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
    const { moduleId, progress, status, score } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const progressCollection = await getCollection('partnerTrainingProgress');
    
    const trainingProgress = await progressCollection.findOne({
      partnerId: partner.partnerId,
      courseId: id
    });

    if (!trainingProgress) {
      return res.status(404).json({
        success: false,
        message: 'Training progress not found'
      });
    }

    // Update module progress
    const moduleIndex = trainingProgress.modules.findIndex(m => m.moduleId === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const moduleProgress = trainingProgress.modules[moduleIndex];
    moduleProgress.progress = Math.min(100, Math.max(0, parseInt(progress)));
    
    if (status) {
      moduleProgress.status = status;
    }
    
    if (score !== undefined) {
      moduleProgress.score = score;
    }

    if (moduleProgress.progress === 100 && moduleProgress.status !== TRAINING_STATUS.COMPLETED) {
      moduleProgress.status = TRAINING_STATUS.COMPLETED;
      moduleProgress.completedAt = new Date();
    }

    // Calculate overall progress
    const totalModules = trainingProgress.modules.length;
    const completedModules = trainingProgress.modules.filter(m => m.status === TRAINING_STATUS.COMPLETED).length;
    const overallProgress = Math.round((completedModules / totalModules) * 100);

    // Update overall status
    let overallStatus = trainingProgress.status;
    if (overallProgress === 100 && overallStatus !== TRAINING_STATUS.COMPLETED) {
      overallStatus = TRAINING_STATUS.COMPLETED;
    } else if (overallProgress > 0 && overallStatus === TRAINING_STATUS.NOT_STARTED) {
      overallStatus = TRAINING_STATUS.IN_PROGRESS;
    }

    await progressCollection.updateOne(
      { _id: trainingProgress._id },
      {
        $set: {
          progress: overallProgress,
          status: overallStatus,
          completedAt: overallStatus === TRAINING_STATUS.COMPLETED ? new Date() : null,
          updatedAt: new Date(),
          [`modules.${moduleIndex}`]: moduleProgress
        }
      }
    );

    res.json({
      success: true,
      data: {
        moduleProgress,
        overallProgress,
        status: overallStatus
      },
      message: 'Training progress updated successfully'
    });
  } catch (error) {
    logger.error('Error updating training progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update training progress',
      error: error.message
    });
  }
});

// Complete training course
router.post('/training/courses/:id/complete', [
  auth,
  body('score').optional().isNumeric().withMessage('Score must be numeric'),
  body('feedback').optional().isString().withMessage('Feedback must be string')
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
    const { score, feedback } = req.body;
    const partner = await PartnerUser.findByPartnerId(req.user.partnerId);
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const { getCollection } = require('../config/database');
    const progressCollection = await getCollection('partnerTrainingProgress');
    const coursesCollection = await getCollection('trainingCourses');
    
    const trainingProgress = await progressCollection.findOne({
      partnerId: partner.partnerId,
      courseId: id
    });

    if (!trainingProgress) {
      return res.status(404).json({
        success: false,
        message: 'Training progress not found'
      });
    }

    const course = await coursesCollection.findOne({ _id: id });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if all modules are completed
    const incompleteModules = trainingProgress.modules.filter(m => m.status !== TRAINING_STATUS.COMPLETED);
    if (incompleteModules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All modules must be completed before finishing the course'
      });
    }

    // Update training progress
    await progressCollection.updateOne(
      { _id: trainingProgress._id },
      {
        $set: {
          status: TRAINING_STATUS.COMPLETED,
          progress: 100,
          completedAt: new Date(),
          score: score || null,
          feedback: feedback || null,
          updatedAt: new Date()
        }
      }
    );

    // Award certification if applicable
    if (course.certification) {
      const certification = {
        partnerId: partner.partnerId,
        courseId: id,
        courseName: course.title,
        level: course.level,
        issuedAt: new Date(),
        expiresAt: course.certification.expiresInDays ? 
          new Date(Date.now() + course.certification.expiresInDays * 24 * 60 * 60 * 1000) : null,
        score: score || null,
        certificateId: generateCertificateId()
      };

      const certificationsCollection = await getCollection('partnerCertifications');
      await certificationsCollection.insertOne(certification);
    }

    res.json({
      success: true,
      data: {
        completed: true,
        score,
        certification: course.certification ? true : false
      },
      message: 'Training course completed successfully'
    });
  } catch (error) {
    logger.error('Error completing training course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete training course',
      error: error.message
    });
  }
});

// Get training progress
router.get('/training/progress', auth, async (req, res) => {
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
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (status && Object.values(TRAINING_STATUS).includes(status)) {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const progressCollection = await getCollection('partnerTrainingProgress');
    
    const progress = await progressCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await progressCollection.countDocuments(query);

    // Get course details for each progress record
    const coursesCollection = await getCollection('trainingCourses');
    const courseIds = progress.map(p => p.courseId);
    const courses = await coursesCollection.find({ _id: { $in: courseIds } }).toArray();
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course._id] = course;
    });

    const progressWithCourses = progress.map(p => ({
      ...p,
      course: courseMap[p.courseId]
    }));

    res.json({
      success: true,
      data: {
        progress: progressWithCourses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Training progress retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching training progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch training progress',
      error: error.message
    });
  }
});

// Get certifications
router.get('/training/certifications', auth, async (req, res) => {
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
      level = '',
      sortBy = 'issuedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { partnerId: partner.partnerId };
    
    if (level && Object.values(CERTIFICATION_LEVELS).includes(level)) {
      query.level = level;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const { getCollection } = require('../config/database');
    const certificationsCollection = await getCollection('partnerCertifications');
    
    const certifications = await certificationsCollection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    const total = await certificationsCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        certifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Certifications retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching certifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certifications',
      error: error.message
    });
  }
});

// Download certificate
router.get('/training/certifications/:id/download', auth, async (req, res) => {
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
    const certificationsCollection = await getCollection('partnerCertifications');
    
    const certification = await certificationsCollection.findOne({
      _id: id,
      partnerId: partner.partnerId
    });

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    // Generate PDF certificate (this would typically use a PDF generation library)
    // For now, return the certification data
    res.json({
      success: true,
      data: {
        certificateId: certification.certificateId,
        courseName: certification.courseName,
        level: certification.level,
        issuedAt: certification.issuedAt,
        expiresAt: certification.expiresAt,
        score: certification.score,
        downloadUrl: `/api/certificates/${certification.certificateId}.pdf`
      },
      message: 'Certificate download link generated successfully'
    });
  } catch (error) {
    logger.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
});

// Helper function to generate certificate ID
function generateCertificateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

module.exports = router;
