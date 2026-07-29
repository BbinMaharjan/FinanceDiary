const app = require('../server/server');
const connectDB = require('../server/config/db');

let dbPromise = null;

module.exports = async (req, res) => {
  if (!dbPromise) {
    dbPromise = connectDB().catch((err) => {
      console.error('DB connection failed:', err);
      dbPromise = null;
    });
  }
  try {
    await dbPromise;
  } catch {
    res.status(500).json({ message: 'Database connection failed' });
    return;
  }
  app(req, res);
};
