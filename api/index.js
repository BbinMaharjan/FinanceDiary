const app = require('../server/server');
const connectDB = require('../server/config/db');

let dbPromise = null;

module.exports = async (req, res) => {
  if (!dbPromise) {
    dbPromise = connectDB();
  }
  try {
    await dbPromise;
  } catch (err) {
    console.error('DB connection failed:', err);
    dbPromise = null;
    res.status(500).json({ message: 'Database connection failed' });
    return;
  }
  app(req, res);
};
