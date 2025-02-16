const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationControllers');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, notificationController.getNotifications);
router.put(
  '/:id/mark-as-read',
  authMiddleware,
  notificationController.markAsRead,
);

module.exports = router;
