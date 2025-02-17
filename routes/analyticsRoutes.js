const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsControllers');
const authMiddleware = require('../middleware/auth');

router.get(
  '/30days',
  authMiddleware,
  analyticsController.getLast30DaysAnalytics,
);
router.get('/year', authMiddleware, analyticsController.getLastYearAnalytics);

module.exports = router;
