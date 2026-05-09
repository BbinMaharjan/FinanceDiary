const express = require('express');
const { exportExcel, exportPDF } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/excel', exportExcel);
router.get('/pdf', exportPDF);

module.exports = router;
