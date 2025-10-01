require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');
const { startCron } = require('./cron/birthdayCron');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error('MONGO_URI not set in env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    logger.info('Connected to MongoDB');
    try {
      const User = require('./models/User');
      await User.init();
      logger.info('User indexes ensured');
    } catch (err) {
      logger.error('Index creation failed', err);
    }

    // --- Serve frontend ---
    const path = require('path');
    const clientPath = path.join(__dirname, '../../client');
    app.use(require('express').static(clientPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });
    // ----------------------

    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
      startCron();
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

