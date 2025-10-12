// Ensure environment variables are loaded before importing modules that use them.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';
import birthdayRouter from './routes/birthday.js';
import { initializeDatabase } from './utils/initDatabase.js';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', usersRouter);
app.use('/api/birthday', birthdayRouter);

// If a built frontend exists at dist/public (populated by Docker build), serve it.
const publicDir = path.resolve(process.cwd(), 'dist', 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  // Serve index.html for any non-API routes so client-side routing works
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).end();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: /health`);
      console.log(`Users API: /api/users`);
      console.log(`Birthday check: /api/birthday/check`);
      console.log(`Test endpoint: /api/birthday/test`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
