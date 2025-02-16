const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPreferences,
  updatePreferences,
} = require('../controllers/preferenceController');

router.route('/').get(protect, getPreferences).put(protect, updatePreferences);

module.exports = router;
