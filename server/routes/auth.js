const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const validateRegister = (req, res, next) => {
  console.log('validateRegister called, typeof next:', typeof next);
  try {
    const errors = [];
    if (!req.body.name?.trim()) errors.push('Name is required');
    if (!req.body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) errors.push('Valid email is required');
    if (!req.body.password || req.body.password.length < 6) errors.push('Password must be at least 6 characters');
    if (errors.length) return res.status(400).json({ message: errors.join(', ') });
    console.log('validateRegister calling next()');
    next();
  } catch (err) {
    console.log('validateRegister error:', err.message);
    next(err);
  }
};

const validateLogin = (req, res, next) => {
  const errors = [];
  if (!req.body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) errors.push('Valid email is required');
  if (!req.body.password) errors.push('Password is required');
  if (errors.length) return res.status(400).json({ message: errors.join(', ') });
  next();
};

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
