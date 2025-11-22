const express = require('express');
const { body } = require('express-validator');
const healthController = require('../controllers/health.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const createHealthRecordValidation = [
  body('treeId').isMongoId().withMessage('Valid tree ID is required'),
  body('status').isIn(['healthy', 'diseased', 'pest_infestation', 'dead']),
  body('inspectionDate').isISO8601().withMessage('Valid date required'),
  body('notes').optional().notEmpty()
];

// Routes
router.get('/', authenticate, healthController.getAllHealthRecords);
router.get('/tree/:treeId', authenticate, healthController.getHealthRecordsByTree);
router.get('/:id', authenticate, healthController.getHealthRecordById);
router.post('/', authenticate, authorize(['admin', 'field_officer']), createHealthRecordValidation, validate, healthController.createHealthRecord);
router.put('/:id', authenticate, authorize(['admin', 'field_officer']), healthController.updateHealthRecord);
router.delete('/:id', authenticate, authorize(['admin']), healthController.deleteHealthRecord);

module.exports = router;
