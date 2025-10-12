// Ensure environment variables are loaded before importing modules that use them.
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';
import birthdayRouter from './routes/birthday.js';
import { initializeDatabase } from './utils/initDatabase.js';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS to allow the frontend origin if provided in APP_BASE_URL
// and allow localhost origins while developing to avoid CORS blocking during local dev.
const appBaseUrl = process.env.APP_BASE_URL;
const isProd = process.env.NODE_ENV === 'production';
const devLocalhosts = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];

if (appBaseUrl || !isProd) {
  const allowed = [] as string[];
  if (appBaseUrl) allowed.push(appBaseUrl);
  if (!isProd) allowed.push(...devLocalhosts);

  app.use(cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman)
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      console.warn('Blocked CORS request from origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  }));

  console.log('Allowed CORS origins:', allowed);
} else {
  app.use(cors());
}
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
  // Serve index.html for any non-API routes so client-side routing works.
  // Avoid using wildcard route patterns that path-to-regexp may reject in some versions.
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Let API routes 404/return as normal
    if (req.path.startsWith('/api')) return next();

    // If the request is for a file that exists in the static dir, let express.static handle it (next won't be called here),
    // but for client-side routes, send index.html so the SPA router can take over.
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

const startServer = async () => {
  try {
  await initializeDatabase();

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
