const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: String,
  color: String,
});

module.exports = mongoose.model('Category', categorySchema);
