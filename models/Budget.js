const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Food',
      'Rent',
      'Transportation',
      'Entertainment',
      'Utilities',
      'Shopping',
      'Healthcare',
      'Education',
      'Insurance',
      'Travel',
      'Savings',
      'Investments',
      'Charity',
      'Personal Care',
      'Miscellaneous',
    ],
  },
  limit: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  remaining: { type: Number },
});

// Auto-calculate remaining before saving
budgetSchema.pre('save', function (next) {
  this.remaining = this.limit - this.spent;
  if (this.spent < 0) this.spent = 0; // Prevent negative spending
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
