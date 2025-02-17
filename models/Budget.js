const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    limit: { type: Number, required: true },
    spent: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Virtual for remaining budget
budgetSchema.virtual('remaining').get(function () {
  return this.limit - this.spent;
});

// Validation for spent amount
budgetSchema.pre('save', function (next) {
  if (this.spent < 0) {
    this.spent = 0;
  }
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
