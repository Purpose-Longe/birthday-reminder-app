import { Router, Request, Response } from 'express';
import { getAllUsers, createUser, deleteUser } from '../services/birthdayService.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, email, dateOfBirth } = req.body;

    if (!username || !email || !dateOfBirth) {
      res.status(400).json({ error: 'Missing required fields: username, email, dateOfBirth' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const user = await createUser(username, email, dateOfBirth);
    res.status(201).json(user);
  } catch (error: unknown) {
    const msg = (error instanceof Error ? error.message : String(error));
    if (msg === 'Email already exists') {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteUser(id);

    if (deleted) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
