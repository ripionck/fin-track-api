const Preference = require('../models/Preference');

const getPreference = async (req, res) => {
  try {
    let preference = await Preference.findOne({
      userId: req.user._id,
    }).populate('userId', 'email');

    if (!preference) {
      preference = await Preference.create({
        userId: req.user._id,
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        compactView: false,
        language: 'en',
        startOfWeek: 'sunday',
      });
    }

    res.status(200).json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePreference = async (req, res) => {
  try {
    const allowedUpdates = [
      'theme',
      'dateFormat',
      'compactView',
      'language',
      'startOfWeek',
    ];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const preference = await Preference.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true, runValidators: true },
    ).populate('userId', 'email');

    res.status(200).json(preference);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getPreference, updatePreference };
