const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return next(new ApiError(400, 'Validation failed', errorMessages));
  }
  
  next();
};

module.exports = { validate };
