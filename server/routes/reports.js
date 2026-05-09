const express = require('express');
const { getDashboard, getMonthlySummaries, getYearlyReport, getCategoryReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/monthly', getMonthlySummaries);
router.get('/yearly', getYearlyReport);
router.get('/categories', getCategoryReport);

module.exports = router;
