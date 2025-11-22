const express = require('express');
const { body, query } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('fullName').optional().notEmpty(),
  body('phoneNumber').optional().isMobilePhone(),
  body('organization').optional().notEmpty()
];

const createUserValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('username').isLength({ min: 3 }),
  body('fullName').notEmpty(),
  body('role').isIn(['admin', 'field_officer', 'viewer'])
];

// Routes
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);
router.get('/profile', authenticate, userController.getProfile);
router.get('/:id', authenticate, authorize(['admin']), userController.getUserById);
router.post('/', authenticate, authorize(['admin']), createUserValidation, validate, userController.createUser);
router.put('/profile', authenticate, updateProfileValidation, validate, userController.updateProfile);
router.put('/:id', authenticate, authorize(['admin']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);
router.put('/:id/role', authenticate, authorize(['admin']), body('role').isIn(['admin', 'field_officer', 'viewer']), validate, userController.updateUserRole);
router.put('/:id/status', authenticate, authorize(['admin']), body('isActive').isBoolean(), validate, userController.updateUserStatus);

module.exports = router;
