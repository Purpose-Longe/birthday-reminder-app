import { Router, Request, Response } from 'express';
import { checkAndSendBirthdayEmails } from '../services/birthdayService.js';

const router = Router();

router.post('/check', async (req: Request, res: Response) => {
  try {
    console.log('Birthday check triggered at:', new Date().toISOString());
    const result = await checkAndSendBirthdayEmails();

    res.json({
      message: 'Birthday check completed',
      timestamp: new Date().toISOString(),
      result: {
        totalBirthdays: result.users.length,
        emailsSent: result.sent,
        emailsFailed: result.failed,
        users: result.users.map(u => ({
          username: u.username,
          email: u.email
        }))
      }
    });
  } catch (error) {
    console.error('Error in birthday check:', error);
    res.status(500).json({ error: 'Failed to check birthdays' });
  }
});

router.get('/test', async (req: Request, res: Response) => {
  try {
    const result = await checkAndSendBirthdayEmails();

    res.json({
      message: 'Test birthday check completed',
      timestamp: new Date().toISOString(),
      result: {
        totalBirthdays: result.users.length,
        emailsSent: result.sent,
        emailsFailed: result.failed,
        users: result.users
      }
    });
  } catch (error) {
    console.error('Error in test birthday check:', error);
    res.status(500).json({ error: 'Failed to test birthday check' });
  }
});

export default router;
