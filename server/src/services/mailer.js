const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_KEY) {
  logger.error('SENDGRID_API_KEY is not set in env');
} else {
  sgMail.setApiKey(SENDGRID_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SENDGRID_FROM || 'no-reply@example.com';
const FROM_NAME = process.env.FROM_NAME || 'Birthday Bot';

async function sendWithRetry(msg, maxAttempts = 3) {
  let attempt = 0;
  const baseDelay = 500; // ms
  while (attempt < maxAttempts) {
    try {
      attempt++;
      const res = await sgMail.send(msg);
      logger.info(`SendGrid: sent to ${Array.isArray(msg.to) ? msg.to.join(',') : msg.to} attempt ${attempt}`);
      return res;
    } catch (err) {
      // determine retryable: network errors or 5xx HTTP status
      const statusCode = err && err.code ? err.code : (err && err.response && err.response.statusCode);
      const isRetryable = statusCode && (Number(statusCode) >= 500 || statusCode === 'ETIMEDOUT' || statusCode === 'ECONNRESET');
      logger.error(`SendGrid send attempt ${attempt} failed:`, err && err.message ? err.message : err);
      if (!isRetryable || attempt >= maxAttempts) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.info(`Retrying send in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

function buildHtml(name) {
  return `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Happy Birthday, ${escapeHtml(name)}! 🎉</h2>
      <p>Wishing you a fantastic day filled with joy, laughter, and lovely surprises.</p>
      <p>— Warm wishes from the team.</p>
    </div>
  `;
}

async function sendBirthdayEmail({ to, name }) {
  if (!SENDGRID_KEY) {
    throw new Error('SendGrid API key not configured (SENDGRID_API_KEY).');
  }

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Happy Birthday, ${name}! 🎂`,
    html: buildHtml(name)
  };

  try {
    const res = await sendWithRetry(msg, 3);
    logger.info(`Birthday email queued/sent to ${to}`);
    return res;
  } catch (err) {
    logger.error(`Failed to send birthday email to ${to}`, err);
    throw err;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>\"']/g, function (s) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

    return map[s];
  });
}

module.exports = { sendBirthdayEmail };
