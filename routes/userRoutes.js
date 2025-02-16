const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, userController.getUserProfile);
router.put('/me', authMiddleware, userController.updateUserProfile);

module.exports = router;
