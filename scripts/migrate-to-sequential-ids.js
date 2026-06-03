import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Load DATABASE_URL from .env.local if available
let connectionString = process.env.DATABASE_URL;
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.*)$/m);
    if (match) connectionString = match[1].trim();
  }
} catch (e) {
  // ignore
}

if (!connectionString) {
  throw new Error('DATABASE_URL not found in environment or .env.local');
}

const pool = new Pool({ connectionString });

async function migrateTable(table) {
  const client = await pool.connect();
  try {
    console.log(`\nMigrating table: ${table}`);
    // backup
    await client.query(`CREATE TABLE IF NOT EXISTS ${table}_backup AS TABLE ${table}`);

    // check id column type
    const res = await client.query(
      `SELECT data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = 'id'`,
      [table],
    );

    if (res.rows.length && res.rows[0].data_type === 'integer') {
      console.log(`Table ${table} already has integer id; skipping.`);
      return;
    }

    // create sequence
    const seqName = `${table}_id_seq`;
    await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName}`);

    // add new column
    await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS id_new integer`);

    // populate id_new using sequence
    await client.query(`UPDATE ${table} SET id_new = nextval('${seqName}') WHERE id_new IS NULL`);

    // ensure not null
    await client.query(`ALTER TABLE ${table} ALTER COLUMN id_new SET NOT NULL`);

    // drop existing primary key constraint if any
    await client.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${table}_pkey`);

    // drop old id column if exists
    const hasOldId = res.rows.length > 0;
    if (hasOldId) {
      await client.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS id`);
    }

    // rename id_new to id
    await client.query(`ALTER TABLE ${table} RENAME COLUMN id_new TO id`);

    // set sequence ownership
    await client.query(`ALTER SEQUENCE ${seqName} OWNED BY ${table}.id`);

    // add primary key
    await client.query(`ALTER TABLE ${table} ADD CONSTRAINT ${table}_pkey PRIMARY KEY (id)`);

    console.log(`Migrated ${table} -> now has sequential integer id.`);
  } finally {
    client.release();
  }
}

async function run() {
  try {
    await migrateTable('freelancers');
    await migrateTable('client_requests');
    console.log('\nMigration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

run();
