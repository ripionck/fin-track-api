const mongoose = require('mongoose');

const monthlyAnalyticsSchema = new mongoose.Schema({
  month: { type: String, required: true },
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
});

module.exports = mongoose.model('Analytics', monthlyAnalyticsSchema);
