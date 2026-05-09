const Transaction = require('../models/Transaction');
const MonthlySummary = require('../models/MonthlySummary');
const { toNepaliMonth } = require('../utils/nepaliDate');

const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, type, category, paymentType, search } = req.query;
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (paymentType) filter.paymentType = paymentType;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon color')
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id })
      .populate('category', 'name icon color');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { date, title, amount, type, category, paymentType, notes } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      date: new Date(date),
      title,
      amount,
      type,
      category,
      paymentType,
      notes,
    });

    await updateMonthlySummary(req.user._id, new Date(date));

    const populated = await transaction.populate('category', 'name icon color');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const oldDate = new Date(transaction.date);

    Object.assign(transaction, req.body);
    if (req.body.date) transaction.date = new Date(req.body.date);
    const updated = await transaction.save();

    await updateMonthlySummary(req.user._id, oldDate);
    await updateMonthlySummary(req.user._id, new Date(transaction.date));

    const populated = await updated.populate('category', 'name icon color');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const txDate = new Date(transaction.date);
    await transaction.deleteOne();
    await updateMonthlySummary(req.user._id, txDate);

    res.json({ message: 'Transaction removed' });
  } catch (error) {
    next(error);
  }
};

async function updateMonthlySummary(userId, date) {
  const { month: nepaliMonth, year: nepaliYear } = toNepaliMonth(date);

  const [startOfMonth, endOfMonth] = getMonthDateRange(nepaliMonth, nepaliYear);

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totalIncome = result.find(r => r._id === 'income')?.total || 0;
  const totalExpense = result.find(r => r._id === 'expense')?.total || 0;

  await MonthlySummary.findOneAndUpdate(
    { user: userId, nepaliMonth, nepaliYear },
    {
      user: userId,
      nepaliMonth,
      nepaliYear,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    },
    { upsert: true, new: true }
  );
}

function getMonthDateRange(nepaliMonth, nepaliYear) {
  const monthIndex = ['Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'].indexOf(nepaliMonth);

  const gregYear = nepaliYear + 57;

  let startMonth = (monthIndex + 1) % 12 || 12;
  let startYear = gregYear + (monthIndex === 11 ? 1 : 0);
  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 12) { endMonth = 1; endYear += 1; }

  const startOfMonth = new Date(startYear, startMonth - 1, 1);
  const endOfMonth = new Date(endYear, endMonth - 1, 1);

  return [startOfMonth, endOfMonth];
}

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction };
