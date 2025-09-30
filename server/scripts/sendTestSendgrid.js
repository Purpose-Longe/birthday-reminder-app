require('dotenv').config();
const { sendBirthdayEmail } = require('../src/services/mailer');

(async () => {
  try {
    const to = process.env.TEST_EMAIL || 'your+test@example.com';
    const name = 'SendGrid Test';
    await sendBirthdayEmail({ to, name });
    console.log('Test send completed (check SendGrid dashboard or recipient inbox).');
  } catch (err) {
    console.error('Test send failed:', err && err.message ? err.message : err);
    if (err && err.response && err.response.body) {
      console.error('SendGrid response body:', err.response.body);
    }
    process.exit(1);
  }
})();
