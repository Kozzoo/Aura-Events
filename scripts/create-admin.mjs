import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

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


async function main() {
  const client = await pool.connect();
  try {
    // ensure any legacy hashed column is removed so plaintext-only insert succeeds
    await client.query(`ALTER TABLE admins DROP COLUMN IF EXISTS password_hash`);
    const result = await client.query(
      `INSERT INTO admins (username, password_plain) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING id, username`,
      ['kozzbar', 'Eyad@1622004']
    );
    
    if (result.rows.length > 0) {
      console.log('✓ Admin created:', result.rows[0]);
    } else {
      console.log('✓ Admin "kozzbar" already exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

main();
