const Preference = require('../models/Preference');

const getPreference = async (req, res) => {
  try {
    let preference = await Preference.findOne({ userId: req.user });

    if (!preference) {
      // Create default preferences if none exist
      preference = new Preference({
        userId: req.user,
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        compactView: false,
        language: 'en',
        startOfWeek: 'sunday',
      });
      await preference.save();
      res
        .status(201)
        .json({ message: 'Default preferences created', preference });
    } else {
      res.json({ message: 'Preferences retrieved successfully', preference });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updatePreference = async (req, res) => {
  try {
    const { theme, dateFormat, compactView, language, startOfWeek } = req.body;

    // No need to require all fields - update only what's provided
    const updates = {};
    if (theme) updates.theme = theme;
    if (dateFormat) updates.dateFormat = dateFormat;
    if (compactView !== undefined) updates.compactView = compactView;
    if (language) updates.language = language;
    if (startOfWeek) updates.startOfWeek = startOfWeek;

    const updatedPreference = await Preference.findOneAndUpdate(
      { userId: req.user },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedPreference) {
      return res.status(404).json({ message: 'Preference not found' });
    }

    res.json({
      message: 'Preferences updated successfully',
      updatedPreference,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getPreference, updatePreference };
