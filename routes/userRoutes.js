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
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      req.user.avatar = avatarPath;
      await req.user.save();

      res.json({ avatar: avatarPath });
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  },
);
router.delete('/me', authMiddleware, userController.deleteAccount);

module.exports = router;
