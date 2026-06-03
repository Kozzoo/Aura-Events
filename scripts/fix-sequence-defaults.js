import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let connectionString = process.env.DATABASE_URL;
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.*)$/m);
    if (match) connectionString = match[1].trim();
  }
} catch (e) {}

if (!connectionString) throw new Error('DATABASE_URL not found');
const pool = new Pool({ connectionString });

async function fix(table) {
  const client = await pool.connect();
  try {
    const seq = `${table}_id_seq`;
    await client.query(`ALTER SEQUENCE IF EXISTS ${seq} OWNED BY ${table}.id`);
    await client.query(`ALTER TABLE ${table} ALTER COLUMN id SET DEFAULT nextval('${seq}')`);
    const { rows } = await client.query(`SELECT COALESCE(MAX(id), 0) AS maxid FROM ${table}`);
    const maxid = rows[0].maxid || 0;
    const seed = Math.max(1, Number(maxid));
    await client.query(`SELECT setval('${seq}', $1, true)`, [seed]);
    console.log(`Fixed sequence for ${table}, set to ${maxid}`);
  } finally {
    client.release();
  }
}

async function run() {
  try {
    await fix('freelancers');
    await fix('client_requests');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
