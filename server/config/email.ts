import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Missing email configuration: set EMAIL_USER and EMAIL_PASSWORD in .env');
  }

  // Allow explicit SMTP configuration if provided (useful for custom SMTP or to avoid Gmail app-password issues)
  if (process.env.SMTP_HOST) {
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Default to Gmail service which works with app passwords (preferred if account has 2FA)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Verify transporter configuration early to catch auth/connection issues
  transporter.verify().then(() => {
    console.log('Email transporter verified successfully');
  }).catch((err) => {
    console.error('Email transporter verification failed:', err);
    // If using Gmail, remind about app passwords for accounts with 2FA
    if (!process.env.SMTP_HOST) {
      console.error('If you are using Gmail, ensure you have created an App Password (https://support.google.com/accounts/answer/185833) and set EMAIL_PASSWORD to that app password.');
    } else {
      console.error('Verify SMTP_HOST/SMTP_PORT/SMTP_SECURE and credentials are correct.');
    }
  });

  return transporter;
};

export const sendBirthdayEmail = async (to: string, username: string): Promise<boolean> => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
  .header { background: #f5576c; padding: 30px; text-align: center; color: white }
      .content { padding: 30px; text-align: center; color: #333 }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1>Happy Birthday!</h1></div>
      <div class="content">
        <h2>Dear ${username},</h2>
        <p>Wishing you a day filled with happiness and a year filled with joy!</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Happy Birthday ${username}!`,
      html: htmlTemplate
    });

    console.log(`Birthday email sent successfully to ${to}. messageId=${info.messageId}`);
    return true;
  } catch (error: unknown) {
    // Capture richer error details when available
    if (error instanceof Error) {
      console.error(`Failed to send email to ${to}: ${error.message}`);
      console.error(error.stack);
    } else {
      console.error(`Failed to send email to ${to}:`, error);
    }
    return false;
  }
};

export default getTransporter;
