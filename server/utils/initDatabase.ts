import getPool from '../config/database.js';

export const initializeDatabase = async () => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        date_of_birth DATE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await client.query(createTableQuery);

    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_date_of_birth
      ON users(date_of_birth);
    `;

    await client.query(createIndexQuery);

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};
