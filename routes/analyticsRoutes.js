const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsControllers');

router.get('/30days', analyticsController.getLast30DaysAnalytics);
router.get('/year', analyticsController.getLastYearAnalytics);

module.exports = router;
