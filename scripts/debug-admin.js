const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        process.env[trimmed.substring(0, idx)] = trimmed.substring(idx + 1);
      }
    }
  });
}

const url = process.env.DATABASE_URL;
console.log('DATABASE_URL:', url);

async function main() {
  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM admins ORDER BY id');
    console.log('ADMIN ROWS:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
