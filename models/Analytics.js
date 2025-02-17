const mongoose = require('mongoose');

const monthlyAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: { type: Date, required: true },
    income: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Virtual for savings calculation
monthlyAnalyticsSchema.virtual('savings').get(function () {
  return this.income - this.expenses;
});

// Index for faster queries
monthlyAnalyticsSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', monthlyAnalyticsSchema);
