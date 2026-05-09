const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  icon: { type: String, default: '📁' },
  color: { type: String, default: '#6b7280' },
}, { timestamps: true });

categorySchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Category', categorySchema);
