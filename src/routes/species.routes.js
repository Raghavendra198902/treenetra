const express = require('express');
const { body } = require('express-validator');
const speciesController = require('../controllers/species.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const createSpeciesValidation = [
  body('commonName').notEmpty().withMessage('Common name is required'),
  body('scientificName').notEmpty().withMessage('Scientific name is required'),
  body('family').optional().notEmpty(),
  body('nativeRegion').optional().notEmpty()
];

// Routes
router.get('/', authenticate, speciesController.getAllSpecies);
router.get('/search', authenticate, speciesController.searchSpecies);
router.get('/:id', authenticate, speciesController.getSpeciesById);
router.post('/', authenticate, authorize(['admin']), createSpeciesValidation, validate, speciesController.createSpecies);
router.put('/:id', authenticate, authorize(['admin']), speciesController.updateSpecies);
router.delete('/:id', authenticate, authorize(['admin']), speciesController.deleteSpecies);

module.exports = router;
