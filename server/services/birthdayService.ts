import getPool from '../config/database.js';
import { sendBirthdayEmail } from '../config/email.js';

interface User {
  id: string;
  username: string;
  email: string;
  date_of_birth: string;
}

export const checkAndSendBirthdayEmails = async (): Promise<{ sent: number; failed: number; users: User[] }> => {
  const client = await getPool().connect();

  try {
    const query = `
      SELECT id, username, email, to_char(date_of_birth, 'YYYY-MM-DD') AS date_of_birth
      FROM users
      WHERE EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
    `;

    const result = await client.query(query);
    const birthdayUsers: User[] = result.rows;

    console.log(`Found ${birthdayUsers.length} birthday(s) today`);

    let sent = 0;
    let failed = 0;

    for (const user of birthdayUsers) {
      const success = await sendBirthdayEmail(user.email, user.username);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    return {
      sent,
      failed,
      users: birthdayUsers
    };
  } catch (error) {
    console.error('Error checking birthdays:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const client = await getPool().connect();

  try {
    // Return date_of_birth as YYYY-MM-DD to ensure no timezone information is included
    const query = `SELECT id, username, email, to_char(date_of_birth, 'YYYY-MM-DD') AS date_of_birth FROM users ORDER BY created_at DESC`;
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const createUser = async (username: string, email: string, dateOfBirth: string): Promise<User> => {
  const client = await getPool().connect();

  try {
    const query = `
      INSERT INTO users (username, email, date_of_birth)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, to_char(date_of_birth, 'YYYY-MM-DD') AS date_of_birth
    `;

    const result = await client.query(query, [username, email, dateOfBirth]);
    return result.rows[0];
  } catch (error: unknown) {
    // Check Postgres unique violation code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errAny = error as any;
    if (errAny?.code === '23505') {
      throw new Error('Email already exists');
    }
    console.error('Error creating user:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const client = await getPool().connect();

  try {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  } finally {
    client.release();
  }
};
