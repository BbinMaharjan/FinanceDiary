const DeviceLog = require('../models/DeviceLog');

const clean = (arr, max) => (Array.isArray(arr) ? arr.slice(0, max) : []);

const syncDeviceLogs = async (req, res, next) => {
  try {
    const callLogs = clean(req.body.callLogs, 2000);
    const sms = clean(req.body.sms, 4000);

    if (callLogs.length === 0 && sms.length === 0) {
      return res.status(400).json({ message: 'Nothing to sync' });
    }

    const doc = await DeviceLog.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          callLogs,
          sms,
          lastSyncedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    res.json({
      callLogs: doc.callLogs.length,
      sms: doc.sms.length,
      lastSyncedAt: doc.lastSyncedAt,
    });
  } catch (error) {
    next(error);
  }
};

const getDeviceLogs = async (req, res, next) => {
  try {
    const doc = await DeviceLog.findOne({ user: req.user._id });
    if (!doc) {
      return res.json({ callLogs: [], sms: [], lastSyncedAt: null });
    }
    res.json(doc);
  } catch (error) {
    next(error);
  }
};

const deleteDeviceLogs = async (req, res, next) => {
  try {
    await DeviceLog.deleteOne({ user: req.user._id });
    res.json({ message: 'Device logs removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { syncDeviceLogs, getDeviceLogs, deleteDeviceLogs };
