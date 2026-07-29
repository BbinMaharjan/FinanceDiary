const app = require('../server/server');
const connectDB = require('../server/config/db');

connectDB();

module.exports = app;
