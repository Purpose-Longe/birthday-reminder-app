const nodemailer = require('nodemailer');

(async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal test account created:');
    console.log(testAccount);
    console.log('\nUse these credentials in your .env for testing email sending.');
  } catch (err) {
    console.error('Error creating Ethereal account', err);
    process.exit(1);
  }
})();
