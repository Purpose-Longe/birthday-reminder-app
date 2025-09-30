# Birthday Reminder — Local ZIP (ready to run)

This archive contains a simple Birthday Reminder application:
- Plain HTML/CSS/JS frontend served by the Node/Express backend.
- MongoDB (local) for storage. Default `MONGO_URI` in `.env.example` is `mongodb://localhost:27017/birthday_reminder`.
- Nodemailer for sending birthday emails and node-cron for daily checks.

## Quick start (local)

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create `.env` from `.env.example` and fill values (do NOT commit `.env`).

3. Start MongoDB locally (install MongoDB or use Docker):
   ```bash
   docker run -d --name birthday-mongo -p 27017:27017 mongo:6.0
   ```

4. Run the app:
   ```bash
   npm run dev
   # or
   npm start
   ```

5. Visit http://localhost:3000

## Notes
- The project uses a unique index on email. The DB will prevent duplicate emails.
- For testing email sending, use a test SMTP inbox (Ethereal, Mailtrap) or a Gmail App Password.
