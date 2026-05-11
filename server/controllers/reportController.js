const Transaction = require('../models/Transaction');
const MonthlySummary = require('../models/MonthlySummary');

const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Look back 30 days for the "monthly" overview
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Last 30 days prior for comparison delta
    const sixtyDaysAgo = new Date(thirtyDaysAgo);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 30);

    // Last 14 days for cash flow
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [overallStats, monthlyStats, yearlyStats, recentTransactions, dailyCashFlow, categoryBreakdown, prevMonthStats] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: thirtyDaysAgo, $lte: now } } },
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
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: fourteenDaysAgo, $lte: now } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'expense',
            date: { $gte: thirtyDaysAgo, $lte: now },
          },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryInfo',
          },
        },
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
    ]);

    const overallIncome = overallStats.find(s => s._id === 'income')?.total || 0;
    const overallExpense = overallStats.find(s => s._id === 'expense')?.total || 0;
    const monthlyIncome = monthlyStats.find(s => s._id === 'income')?.total || 0;
    const monthlyExpense = monthlyStats.find(s => s._id === 'expense')?.total || 0;
    const yearlyIncome = yearlyStats.find(s => s._id === 'income')?.total || 0;
    const yearlyExpense = yearlyStats.find(s => s._id === 'expense')?.total || 0;

    const lastMonthIncome = prevMonthStats.find(s => s._id === 'income')?.total || 0;
    const lastMonthExpense = prevMonthStats.find(s => s._id === 'expense')?.total || 0;

    // Generate full 14-day range filling gaps with 0
    const cashFlowMap = {};
    dailyCashFlow.forEach(d => { cashFlowMap[d._id] = { income: d.income, expense: d.expense }; });
    const cashFlow = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      cashFlow.push({
        date: key,
        income: cashFlowMap[key]?.income || 0,
        expense: cashFlowMap[key]?.expense || 0,
      });
    }

    const breakdown = categoryBreakdown.map(c => ({
      categoryName: c.categoryInfo?.name || 'Other',
      total: c.total,
      icon: c.categoryInfo?.icon || '📄',
    }));

    res.json({
      overallIncome,
      overallExpense,
      overallBalance: overallIncome - overallExpense,
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
      yearlyIncome,
      yearlyExpense,
      yearlyBalance: yearlyIncome - yearlyExpense,
      lastMonthIncome,
      lastMonthExpense,
      recentTransactions,
      cashFlow,
      spendingBreakdown: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

const getMonthlySummaries = async (req, res, next) => {
  try {
    const { year } = req.query;
    const filter = { user: req.user._id };
    if (year) filter.year = Number(year);

    const summaries = await MonthlySummary.find(filter).sort({ year: -1, _id: -1 });
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
      year: targetYear,
    }).sort({ _id: 1 });

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(targetYear, 0, 1),
            $lte: new Date(targetYear, 11, 31),
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

const getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required' });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const filter = { user: req.user._id, date: { $gte: dayStart, $lte: dayEnd } };

    const [stats, transactions] = await Promise.all([
      Transaction.aggregate([
        { $match: filter },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.find(filter)
        .populate('category', 'name icon color')
        .sort({ createdAt: -1 }),
    ]);

    const totalIncome = stats.find(s => s._id === 'income')?.total || 0;
    const totalExpense = stats.find(s => s._id === 'expense')?.total || 0;
    const balance = totalIncome - totalExpense;

    res.json({
      date,
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getMonthlySummaries, getYearlyReport, getCategoryReport, getDailySummary };
