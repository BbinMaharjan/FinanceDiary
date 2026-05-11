const express = require('express');
const { getDashboard, getMonthlySummaries, getYearlyReport, getCategoryReport, getDailySummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/monthly', getMonthlySummaries);
router.get('/yearly', getYearlyReport);
router.get('/categories', getCategoryReport);
router.get('/daily', getDailySummary);

module.exports = router;
