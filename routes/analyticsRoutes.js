const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsControllers');
const authMiddleware = require('../middleware/auth');

router.get(
  '/30days',
  authMiddleware,
  analyticsController.getLast30DaysAnalytics,
);
router.get(
  '/90days',
  authMiddleware,
  analyticsController.getLast90DaysAnalytics,
);

router.get(
  '/current-year',
  authMiddleware,
  analyticsController.getCurrentYearAnalytics,
);

module.exports = router;
