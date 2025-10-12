import { Pool } from 'pg';

// Pool is initialized lazily so environment variables (dotenv) are available
let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (pool) return pool;

  if (!process.env.DATABASE_URL) {
    throw new Error('Missing database configuration. Set DATABASE_URL in your environment.');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
};

export default getPool;
