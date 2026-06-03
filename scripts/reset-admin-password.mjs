import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex);
        const value = trimmed.substring(eqIndex + 1);
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    const username = await ask('Enter admin username: ');
    const password = await ask('Enter new password: ');

    if (!username || !password) {
      console.log('❌ Username and password are required');
      process.exit(1);
    }

    const client = await pool.connect();
    try {
      // ensure legacy hashed column is removed
      await client.query(`ALTER TABLE admins DROP COLUMN IF EXISTS password_hash`);
      const result = await client.query(
        `UPDATE admins SET password_plain = $1 WHERE username = $2 RETURNING id, username`,
        [password, username]
      );

      if (result.rows.length > 0) {
        console.log('✓ Password reset for:', result.rows[0]);
      } else {
        console.log('❌ Admin "' + username + '" not found');
        process.exit(1);
      }
    } finally {
      client.release();
      await pool.end();
      process.exit(0);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
