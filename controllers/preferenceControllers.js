const Preference = require('../models/Preference');

const getPreference = async (req, res) => {
  try {
    const preference = await Preference.findOne({ userId: req.user });
    if (!preference) {
      // It's often better to send an empty object or a default preference
      // instead of a 404 if you want the client to have some initial values.
      return res.json({}); // Or: res.json({ theme: 'light', dateFormat: 'YYYY-MM-DD', ... });
      // If you truly want to indicate no preference, keep the 404:
      // return res.status(404).json({ message: 'Preference not found' });
    }
    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePreference = async (req, res) => {
  try {
    const { theme, dateFormat, compactView, language, startOfWeek } = req.body;

    if (!theme || !dateFormat || !language) {
      return res
        .status(400)
        .json({
          message: 'Theme, Date Format and Language are required fields',
        });
    }

    const updatedPreference = await Preference.findOneAndUpdate(
      { userId: req.user },
      { theme, dateFormat, compactView, language, startOfWeek },
      { new: true, upsert: true, runValidators: true },
    );
    res.json(updatedPreference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPreference, updatePreference };
