const express = require('express');
const { syncDeviceLogs, getDeviceLogs, deleteDeviceLogs } = require('../controllers/deviceLogController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getDeviceLogs);
router.post('/sync', syncDeviceLogs);
router.delete('/', deleteDeviceLogs);

module.exports = router;
