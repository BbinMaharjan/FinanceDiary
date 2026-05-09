const Transaction = require('../models/Transaction');
const MonthlySummary = require('../models/MonthlySummary');

const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [monthlyStats, yearlyStats, recentTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: now } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfYear, $lte: now } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.find({ user: req.user._id })
        .populate('category', 'name icon color')
        .sort({ date: -1 })
        .limit(5),
    ]);

    const monthlyIncome = monthlyStats.find(s => s._id === 'income')?.total || 0;
    const monthlyExpense = monthlyStats.find(s => s._id === 'expense')?.total || 0;
    const yearlyIncome = yearlyStats.find(s => s._id === 'income')?.total || 0;
    const yearlyExpense = yearlyStats.find(s => s._id === 'expense')?.total || 0;

    res.json({
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
      yearlyIncome,
      yearlyExpense,
      yearlyBalance: yearlyIncome - yearlyExpense,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlySummaries = async (req, res, next) => {
  try {
    const { year } = req.query;
    const filter = { user: req.user._id };
    if (year) filter.nepaliYear = Number(year);

    const summaries = await MonthlySummary.find(filter).sort({ nepaliYear: -1, _id: -1 });
    res.json(summaries);
  } catch (error) {
    next(error);
  }
};

const getYearlyReport = async (req, res, next) => {
  try {
    const { year } = req.query;
    const targetYear = Number(year) || new Date().getFullYear();

    const monthlyData = await MonthlySummary.find({
      user: req.user._id,
      nepaliYear: targetYear,
    }).sort({ _id: 1 });

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(targetYear - 57, 0, 1),
            $lte: new Date(targetYear - 57, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
    ]);

    res.json({ monthlyData, categoryBreakdown });
  } catch (error) {
    next(error);
  }
};

const getCategoryReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const report = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $sort: { total: -1 } },
    ]);

    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getMonthlySummaries, getYearlyReport, getCategoryReport };
