const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, notificationController.getNotifications);
router.put(
  '/:notificationId/read',
  authMiddleware,
  notificationController.markAsRead,
);
router.delete(
  '/:notificationId',
  authMiddleware,
  notificationController.deleteNotification,
);
router.post('/', authMiddleware, notificationController.createNotification);

module.exports = router;
