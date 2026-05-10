const mongoose = require('mongoose');

const monthlySummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  totalIncome: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
}, { timestamps: true });

monthlySummarySchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySummary', monthlySummarySchema);
