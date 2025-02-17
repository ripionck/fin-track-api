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
    ],
  },
  limit: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  remaining: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Calculate remaining before saving
budgetSchema.pre('save', function (next) {
  this.remaining = this.limit - this.spent;
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
