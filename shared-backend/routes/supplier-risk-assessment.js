const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const SupplierRiskAssessment = require('../models/SupplierRiskAssessment');
const ProcurementSupplier = require('../models/ProcurementSupplier');
const logger = require('../utils/logger');

// Rate limiting
const riskAssessmentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many risk assessment requests, please try again later.'
});

// GET /api/v1/procurement/risk-assessments - Get all risk assessments
router.get('/', authenticateToken, requirePermission('read_procurement'), riskAssessmentRateLimit, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('supplierId').optional().isString().withMessage('Supplier ID must be a string'),
  query('riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
  query('status').optional().isIn(['draft', 'under_review', 'approved', 'implemented', 'archived']).withMessage('Invalid status'),
  query('sortBy').optional().isIn(['assessmentDate', 'riskScore', 'supplierId']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      supplierId,
      riskLevel,
      status,
      sortBy = 'assessmentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (supplierId) filter.supplierId = supplierId;
    if (riskLevel) filter['overallRisk.riskLevel'] = riskLevel;
    if (status) filter.status = status;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const assessments = await SupplierRiskAssessment.find(filter)
      .populate('assessedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SupplierRiskAssessment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching risk assessments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch risk assessments', error: error.message });
  }
});

// GET /api/v1/procurement/risk-assessments/:id - Get specific risk assessment
router.get('/:id', authenticateToken, requirePermission('read_procurement'), riskAssessmentRateLimit, async (req, res) => {
  try {
    const assessment = await SupplierRiskAssessment.findById(req.params.id)
      .populate('assessedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('mitigationPlan.priorityActions.assignedTo', 'name email')
      .populate('recommendations.assignedTo', 'name email');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Risk assessment not found' });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    logger.error('Error fetching risk assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch risk assessment', error: error.message });
  }
});

// POST /api/v1/procurement/risk-assessments - Create new risk assessment
router.post('/', authenticateToken, requirePermission('write_procurement'), riskAssessmentRateLimit, [
  body('supplierId').notEmpty().withMessage('Supplier ID is required'),
  body('assessmentType').isIn(['initial', 'periodic', 'triggered', 'comprehensive']).withMessage('Invalid assessment type'),
  body('trigger').isIn(['scheduled', 'performance_issue', 'compliance_breach', 'financial_concern', 'market_change', 'manual']).withMessage('Invalid trigger'),
  body('riskFactors').isArray().withMessage('Risk factors must be an array'),
  body('riskFactors.*.category').isIn(['financial', 'operational', 'compliance', 'reputational', 'strategic', 'environmental', 'technical']).withMessage('Invalid risk factor category'),
  body('riskFactors.*.factor').notEmpty().withMessage('Risk factor is required'),
  body('riskFactors.*.riskLevel').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
  body('riskFactors.*.probability').isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100'),
  body('riskFactors.*.impact').isInt({ min: 0, max: 100 }).withMessage('Impact must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      supplierId,
      assessmentType,
      trigger,
      riskFactors,
      financialRisk,
      operationalRisk,
      complianceRisk,
      reputationalRisk,
      strategicRisk,
      environmentalRisk,
      mitigationPlan,
      recommendations,
      notes
    } = req.body;

    // Verify supplier exists
    const supplier = await ProcurementSupplier.findOne({ supplierId });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Generate assessment ID
    const assessmentId = `RA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create risk assessment
    const assessment = new SupplierRiskAssessment({
      assessmentId,
      supplierId,
      assessedBy: req.user.id,
      assessmentType,
      trigger,
      riskFactors,
      financialRisk,
      operationalRisk,
      complianceRisk,
      reputationalRisk,
      strategicRisk,
      environmentalRisk,
      mitigationPlan,
      recommendations,
      notes
    });

    // Calculate overall risk
    assessment.calculateOverallRisk();

    // Generate recommendations if not provided
    if (!recommendations || recommendations.length === 0) {
      assessment.recommendations = assessment.generateRecommendations();
    }

    await assessment.save();

    // Update supplier risk information
    supplier.risk = {
      riskLevel: assessment.overallRisk.riskLevel,
      riskScore: assessment.overallRisk.riskScore,
      lastRiskAssessment: assessment.assessmentDate,
      riskFactors: assessment.riskFactors.map(factor => ({
        factor: factor.factor,
        impact: factor.impact,
        mitigation: factor.mitigation?.strategy || ''
      }))
    };

    await supplier.save();

    res.status(201).json({
      success: true,
      data: assessment,
      message: 'Risk assessment created successfully'
    });
  } catch (error) {
    logger.error('Error creating risk assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to create risk assessment', error: error.message });
  }
});

// PUT /api/v1/procurement/risk-assessments/:id - Update risk assessment
router.put('/:id', authenticateToken, requirePermission('write_procurement'), riskAssessmentRateLimit, [
  body('riskFactors').optional().isArray().withMessage('Risk factors must be an array'),
  body('riskFactors.*.category').optional().isIn(['financial', 'operational', 'compliance', 'reputational', 'strategic', 'environmental', 'technical']).withMessage('Invalid risk factor category'),
  body('riskFactors.*.riskLevel').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid risk level'),
  body('status').optional().isIn(['draft', 'under_review', 'approved', 'implemented', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const assessment = await SupplierRiskAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Risk assessment not found' });
    }

    // Check if user can edit
    if (assessment.status === 'approved' && !req.user.permissions.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Cannot edit approved assessment' });
    }

    const updateData = { ...req.body };

    // If risk factors are updated, recalculate overall risk
    if (req.body.riskFactors) {
      assessment.riskFactors = req.body.riskFactors;
      assessment.calculateOverallRisk();
    }

    // If status is being changed to approved
    if (req.body.status === 'approved') {
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    }

    const updatedAssessment = await SupplierRiskAssessment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assessedBy', 'name email')
     .populate('approvedBy', 'name email');

    res.json({
      success: true,
      data: updatedAssessment,
      message: 'Risk assessment updated successfully'
    });
  } catch (error) {
    logger.error('Error updating risk assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to update risk assessment', error: error.message });
  }
});

// DELETE /api/v1/procurement/risk-assessments/:id - Delete risk assessment
router.delete('/:id', authenticateToken, requirePermission('delete_procurement'), riskAssessmentRateLimit, async (req, res) => {
  try {
    const assessment = await SupplierRiskAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Risk assessment not found' });
    }

    // Check if user can delete
    if (assessment.status === 'approved' && !req.user.permissions.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Cannot delete approved assessment' });
    }

    await SupplierRiskAssessment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Risk assessment deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting risk assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete risk assessment', error: error.message });
  }
});

// GET /api/v1/procurement/risk-assessments/supplier/:supplierId - Get risk assessments for specific supplier
router.get('/supplier/:supplierId', authenticateToken, requirePermission('read_procurement'), riskAssessmentRateLimit, [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { limit = 10 } = req.query;

    const assessments = await SupplierRiskAssessment.find({ supplierId: req.params.supplierId })
      .populate('assessedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ assessmentDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: assessments
    });
  } catch (error) {
    logger.error('Error fetching supplier risk assessments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier risk assessments', error: error.message });
  }
});

// GET /api/v1/procurement/risk-assessments/dashboard/summary - Get risk assessment dashboard summary
router.get('/dashboard/summary', authenticateToken, requirePermission('read_procurement'), riskAssessmentRateLimit, async (req, res) => {
  try {
    const [
      totalAssessments,
      criticalRisk,
      highRisk,
      mediumRisk,
      lowRisk,
      recentAssessments,
      overdueAssessments
    ] = await Promise.all([
      SupplierRiskAssessment.countDocuments(),
      SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'critical' }),
      SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'high' }),
      SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'medium' }),
      SupplierRiskAssessment.countDocuments({ 'overallRisk.riskLevel': 'low' }),
      SupplierRiskAssessment.find({ status: 'approved' })
        .sort({ assessmentDate: -1 })
        .limit(5)
        .populate('assessedBy', 'name email'),
      SupplierRiskAssessment.find({
        nextAssessment: { $lt: new Date() },
        status: { $ne: 'archived' }
      }).countDocuments()
    ]);

    const summary = {
      totalAssessments,
      riskDistribution: {
        critical: criticalRisk,
        high: highRisk,
        medium: mediumRisk,
        low: lowRisk
      },
      recentAssessments,
      overdueAssessments,
      riskTrends: await getRiskTrends()
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error fetching risk assessment summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch risk assessment summary', error: error.message });
  }
});

// Helper function to get risk trends
async function getRiskTrends() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const trends = await SupplierRiskAssessment.aggregate([
    {
      $match: {
        assessmentDate: { $gte: sixMonthsAgo },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$assessmentDate' },
          year: { $year: '$assessmentDate' },
          riskLevel: '$overallRisk.riskLevel'
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$overallRisk.riskScore' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return trends;
}

// POST /api/v1/procurement/risk-assessments/:id/approve - Approve risk assessment
router.post('/:id/approve', authenticateToken, requirePermission('approve_procurement'), riskAssessmentRateLimit, async (req, res) => {
  try {
    const assessment = await SupplierRiskAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Risk assessment not found' });
    }

    if (assessment.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Assessment already approved' });
    }

    assessment.status = 'approved';
    assessment.approvedBy = req.user.id;
    assessment.approvedAt = new Date();

    await assessment.save();

    res.json({
      success: true,
      data: assessment,
      message: 'Risk assessment approved successfully'
    });
  } catch (error) {
    logger.error('Error approving risk assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to approve risk assessment', error: error.message });
  }
});

// POST /api/v1/procurement/risk-assessments/:id/implement - Mark assessment as implemented
router.post('/:id/implement', authenticateToken, requirePermission('write_procurement'), riskAssessmentRateLimit, async (req, res) => {
  try {
    const assessment = await SupplierRiskAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Risk assessment not found' });
    }

    if (assessment.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Assessment must be approved before implementation' });
    }

    assessment.status = 'implemented';
    await assessment.save();

    res.json({
      success: true,
      data: assessment,
      message: 'Risk assessment marked as implemented'
    });
  } catch (error) {
    logger.error('Error implementing risk assessment:', error);
    res.status(500).json({ success: false, message: 'Failed to implement risk assessment', error: error.message });
  }
});

module.exports = router;
