const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  twoFactorEnabled: { type: Boolean, default: false },
  notifications: {
    budgetAlerts: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: true },
    unusualActivity: { type: Boolean, default: false },
    newFeatures: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
