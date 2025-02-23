const express = require('express');
const userController = require('../controllers/userControllers');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/me', authMiddleware, userController.getProfile);
router.patch('/me', authMiddleware, userController.updateProfile);

router.put(
  '/me/avatar',
  authMiddleware,
  upload.single('avatar'),
  userController.uploadAvatar,
);
router.delete('/me', authMiddleware, userController.deleteAccount);

module.exports = router;
