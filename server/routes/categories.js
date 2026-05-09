const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

const validateCategory = (req, res, next) => {
  const errors = [];
  if (!req.body.name?.trim()) errors.push('Name is required');
  if (!['income', 'expense'].includes(req.body.type)) errors.push('Type must be income or expense');
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
};

router.get('/', getCategories);

router.post('/', validateCategory, createCategory);

router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
