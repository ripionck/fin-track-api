const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Category icon is required'],
    },
    color: {
      type: String,
      required: [true, 'Category color is required'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Category', categorySchema);
