const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  formattedNumber: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  name: { type: String, default: null },
  timestamp: { type: String, default: '' },
  dateTime: { type: String, default: '' },
  type: { type: String, default: 'UNKNOWN' },
  simDisplayName: { type: String, default: null },
}, { _id: false });

const smsSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  address: { type: String, default: '' },
  date: { type: String, default: '' },
  read: { type: Number, default: 0 },
  type: { type: Number, default: 0 },
  body: { type: String, default: '' },
  box: { type: String, enum: ['inbox', 'sent'], default: 'inbox' },
}, { _id: false });

const deviceLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  callLogs: { type: [callLogSchema], default: [] },
  sms: { type: [smsSchema], default: [] },
  lastSyncedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('DeviceLog', deviceLogSchema);
