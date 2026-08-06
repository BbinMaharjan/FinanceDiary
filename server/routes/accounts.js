const express = require('express');
const { getAccounts, getAccount, createAccount, updateAccount, deleteAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const validateAccount = (req, res, next) => {
  const errors = [];
  if (!req.body.name?.trim()) errors.push('Account name is required');
  if (req.body.openingBalance !== undefined && isNaN(Number(req.body.openingBalance))) errors.push('Opening balance must be a number');
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
};

router.get('/', getAccounts);
router.get('/:id', getAccount);

router.post('/', validateAccount, createAccount);

router.put('/:id', validateAccount, updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
