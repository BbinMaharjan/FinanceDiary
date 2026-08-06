const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  bankName: { type: String, trim: true, default: '' },
  accountNumber: { type: String, trim: true, default: '' },
  accountType: { type: String, enum: ['Savings', 'Current', 'Cash', 'Other'], default: 'Savings' },
  openingBalance: { type: Number, default: 0 },
  notes: { type: String, trim: true, default: '' },
}, { timestamps: true });

accountSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Account', accountSchema);
