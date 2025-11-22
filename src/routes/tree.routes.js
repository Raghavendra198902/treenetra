const express = require('express');
const { body, query } = require('express-validator');
const treeController = require('../controllers/tree.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createTreeValidation = [
  body('speciesId').isMongoId().withMessage('Valid species ID is required'),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('plantedDate').optional().isISO8601().withMessage('Valid date required'),
  body('height').optional().isFloat({ min: 0 }).withMessage('Height must be positive'),
  body('diameter').optional().isFloat({ min: 0 }).withMessage('Diameter must be positive')
];

const updateTreeValidation = [
  body('height').optional().isFloat({ min: 0 }),
  body('diameter').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['healthy', 'diseased', 'dead', 'removed']),
  body('location.latitude').optional().isFloat({ min: -90, max: 90 }),
  body('location.longitude').optional().isFloat({ min: -180, max: 180 })
];

const searchValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['healthy', 'diseased', 'dead', 'removed']),
  query('minHeight').optional().isFloat({ min: 0 }),
  query('maxHeight').optional().isFloat({ min: 0 })
];

// Routes
router.get('/', authenticate, searchValidation, validate, treeController.getAllTrees);
router.get('/search', authenticate, searchValidation, validate, treeController.searchTrees);
router.get('/nearby', authenticate, treeController.getNearbyTrees);
router.get('/statistics', authenticate, treeController.getStatistics);
router.get('/:id', authenticate, treeController.getTreeById);
router.post('/', authenticate, authorize(['admin', 'field_officer']), createTreeValidation, validate, treeController.createTree);
router.put('/:id', authenticate, authorize(['admin', 'field_officer']), updateTreeValidation, validate, treeController.updateTree);
router.delete('/:id', authenticate, authorize(['admin']), treeController.deleteTree);
router.post('/:id/images', authenticate, authorize(['admin', 'field_officer']), upload.array('images', 5), treeController.uploadImages);
router.delete('/:id/images/:imageId', authenticate, authorize(['admin', 'field_officer']), treeController.deleteImage);
router.post('/:id/tags', authenticate, authorize(['admin', 'field_officer']), treeController.addTags);
router.delete('/:id/tags/:tag', authenticate, authorize(['admin', 'field_officer']), treeController.removeTag);

module.exports = router;
