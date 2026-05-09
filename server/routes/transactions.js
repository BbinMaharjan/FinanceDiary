const express = require('express');
const { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const validateTransaction = (req, res, next) => {
  const errors = [];
  if (!req.body.date || isNaN(Date.parse(req.body.date))) errors.push('Valid date is required');
  if (!req.body.title?.trim()) errors.push('Title is required');
  if (req.body.amount === undefined || isNaN(Number(req.body.amount))) errors.push('Amount must be a number');
  if (!['income', 'expense'].includes(req.body.type)) errors.push('Type must be income or expense');
  if (!req.body.category?.trim()) errors.push('Valid category is required');
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
};

router.get('/', getTransactions);
router.get('/:id', getTransaction);

router.post('/', validateTransaction, createTransaction);

router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
