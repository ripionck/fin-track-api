const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.delete('/profile', authMiddleware, userController.deleteUser);
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', file: req.file });
});

module.exports = router;
