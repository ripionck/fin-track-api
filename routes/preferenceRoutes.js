const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceControllers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('', authMiddleware, preferenceController.getPreference);
router.put('', authMiddleware, preferenceController.updatePreference);

module.exports = router;
