const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0.01, 'Budget limit must be at least 0.01'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for remaining budget with 2 decimal places
budgetSchema.virtual('remaining').get(function () {
  return parseFloat((this.limit - this.spent).toFixed(2));
});

// Validation and cleanup before saving
budgetSchema.pre('save', function (next) {
  // Ensure spent doesn't exceed limit
  if (this.spent > this.limit) {
    return next(new Error('Spent amount cannot exceed budget limit'));
  }
  // Round monetary values to 2 decimal places
  this.limit = parseFloat(this.limit.toFixed(2));
  this.spent = parseFloat(this.spent.toFixed(2));
  next();
});

// Compound index for user+category uniqueness
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
