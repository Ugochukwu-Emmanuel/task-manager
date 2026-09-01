const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, logout, me, updateMe } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateMeRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('newPassword')
    .optional()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  // currentPassword is only required when newPassword is being set — checked
  // here as a cross-field rule rather than always-required.
  body('currentPassword').custom((value, { req }) => {
    if (req.body.newPassword && !value) {
      throw new Error('Current password is required to set a new password');
    }
    return true;
  }),
];

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMeRules, validate, updateMe);

module.exports = router;
