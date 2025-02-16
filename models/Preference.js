const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  compactView: { type: Boolean, default: false },
  language: { type: String, default: 'en' },
  startOfWeek: { type: String, enum: ['sunday', 'monday'], default: 'sunday' },
});

module.exports = mongoose.model('Preference', preferenceSchema);
