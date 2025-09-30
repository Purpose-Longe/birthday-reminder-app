const cron = require('node-cron');
const User = require('../models/User');
const { sendBirthdayEmail } = require('../services/mailer');
const logger = require('../utils/logger');

// helper: returns month and day tuples for today in server timezone
function todayMonthDay() {
  const d = new Date();
  return { month: d.getMonth() + 1, day: d.getDate() };
}

async function job() {
  try {
    const { month, day } = todayMonthDay();
    // Query: find users whose dob month and day match today
    const users = await User.find().lean();
    const celebrants = users.filter(u => {
      const dob = new Date(u.dob);
      return dob.getMonth() + 1 === month && dob.getDate() === day;
    });

    if (celebrants.length === 0) {
      logger.info('No birthdays today');
      return;
    }

    for (const u of celebrants) {
      try {
        await sendBirthdayEmail({ to: u.email, name: u.username });
      } catch (err) {
        logger.error(`Failed to send to ${u.email}`, err);
      }
    }
  } catch (err) {
    logger.error('Birthday cron failed', err);
  }
}

function startCron() {
  const schedule = process.env.CRON_SCHEDULE || '0 7 * * *'; // default: 07:00 daily
  logger.info(`Scheduling birthday cron at: ${schedule}`);
  // node-cron uses server timezone by default
  cron.schedule(schedule, job, { timezone: process.env.CRON_TZ || undefined });
}

// export job for manual testing too
module.exports = { startCron, job };
