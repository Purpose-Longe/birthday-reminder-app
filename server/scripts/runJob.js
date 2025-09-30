require('dotenv').config();
const mongoose = require('mongoose');
const { job } = require('../src/cron/birthdayCron');
const logger = require('../src/utils/logger');

async function run() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in env');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  logger.info('Connected to MongoDB. Running job now...');
  try {
    await job();
    logger.info('Job finished.');
  } catch (err) {
    console.error('Job error', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
