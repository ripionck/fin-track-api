const express = require('express');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.put('/me/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.delete('/me', authMiddleware, deleteAccount);

module.exports = router;
