const express = require('express');
const { query } = require('express-validator');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const dateRangeValidation = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
];

// Routes
router.get('/overview', authenticate, analyticsController.getOverview);
router.get('/trees/growth', authenticate, dateRangeValidation, validate, analyticsController.getTreeGrowth);
router.get('/trees/distribution', authenticate, analyticsController.getTreeDistribution);
router.get('/health/trends', authenticate, dateRangeValidation, validate, analyticsController.getHealthTrends);
router.get('/species/popular', authenticate, analyticsController.getPopularSpecies);
router.get('/users/activity', authenticate, authorize(['admin']), analyticsController.getUserActivity);
router.get('/reports/monthly', authenticate, analyticsController.getMonthlyReport);
router.get('/reports/export', authenticate, authorize(['admin']), analyticsController.exportReport);

module.exports = router;
