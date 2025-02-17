const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json(user.notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notifications: req.body },
      { new: true, select: 'notifications' },
    );
    res.json(user.notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
