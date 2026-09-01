const express = require('express');
const router = express.Router();
const { getSummary, getTrend } = require('../controllers/analytics.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/summary', getSummary);
router.get('/trend', getTrend);

module.exports = router;