const express = require('express');
const userController = require('../controllers/userControllers');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.put(
  '/me/avatar',
  authMiddleware,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  userController.uploadAvatar,
);
router.delete('/me', authMiddleware, userController.deleteAccount);

module.exports = router;
