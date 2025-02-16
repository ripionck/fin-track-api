const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceControllers');
const authMiddleware = require('../middleware/auth');

router.get('', authMiddleware, preferenceController.getPreference);
router.put('', authMiddleware, preferenceController.updatePreference);

module.exports = router;
