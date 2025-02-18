const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    theme: { type: String, default: 'light' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    compactView: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    startOfWeek: { type: String, default: 'sunday' },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Preference', preferenceSchema);
