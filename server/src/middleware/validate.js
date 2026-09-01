const { validationResult } = require('express-validator');

// Runs after a chain of express-validator rules (e.g. body('email').isEmail()).
// If any rule failed, this stops the request here with a 400 and a clear
// list of what went wrong, instead of letting bad data reach the controller.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;