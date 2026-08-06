const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({ createdAt: 1 });

    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          account: { $ne: null },
        },
      },
      {
        $group: {
          _id: { account: '$account', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const statMap = {};
    stats.forEach((s) => {
      const key = String(s._id.account);
      if (!statMap[key]) statMap[key] = { income: 0, expense: 0 };
      if (s._id.type === 'income') statMap[key].income = s.total;
      if (s._id.type === 'expense') statMap[key].expense = s.total;
    });

    const result = accounts.map((a) => {
      const s = statMap[String(a._id)] || { income: 0, expense: 0 };
      return {
        ...a.toObject(),
        totalIncome: s.income,
        totalExpense: s.expense,
        balance: a.openingBalance + s.income - s.expense,
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    next(error);
  }
};

const createAccount = async (req, res, next) => {
  try {
    const { name, bankName, accountNumber, accountType, openingBalance, notes } = req.body;

    const existing = await Account.findOne({ user: req.user._id, name });
    if (existing) {
      return res.status(400).json({ message: 'An account with this name already exists' });
    }

    const account = await Account.create({
      user: req.user._id,
      name,
      bankName,
      accountNumber,
      accountType,
      openingBalance,
      notes,
    });
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
};

const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (req.body.name) {
      const existing = await Account.findOne({ user: req.user._id, name: req.body.name, _id: { $ne: account._id } });
      if (existing) {
        return res.status(400).json({ message: 'An account with this name already exists' });
      }
    }

    Object.assign(account, req.body);
    const updated = await account.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    await Transaction.updateMany(
      { user: req.user._id, account: account._id },
      { $unset: { account: 1 } }
    );

    await account.deleteOne();
    res.json({ message: 'Account removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAccounts, getAccount, createAccount, updateAccount, deleteAccount };
